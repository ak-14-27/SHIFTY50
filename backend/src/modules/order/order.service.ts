import { prisma } from '../../shared/db/prisma';
import { OrderSide, OrderStatus, OrderType, TransactionType } from '../../shared/types/enums';
import { WalletService } from '../wallet/wallet.service';
import { MatchingEngineService } from './matching-engine.service';
import { CreateOrderInput } from './order.validation';

export class OrderService {
  /**
   * Places a new Buy or Sell order (Limit / Market) with margin validation & matching invocation
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    const symbol = input.symbol.toUpperCase();
    const stock = await prisma.stock.findUnique({ where: { symbol } });

    if (!stock) {
      throw { status: 404, message: `Stock '${symbol}' does not exist` };
    }

    const orderType = input.orderType || OrderType.LIMIT;
    const price = orderType === OrderType.MARKET ? stock.currentPrice : (input.price || stock.currentPrice);
    const quantity = input.quantity;
    const totalAmount = Number((quantity * price).toFixed(2));

    // BUY Order Flow
    if (input.side === OrderSide.BUY) {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.availableBalance < totalAmount) {
        throw {
          status: 400,
          message: `Insufficient funds. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${wallet?.availableBalance.toFixed(2) || '0.00'}`,
        };
      }

      // 1. Lock funds in Reserved Balance
      const refId = `ORD_RESERVE_${symbol}_${Date.now()}`;
      await WalletService.reserveFunds(
        userId,
        totalAmount,
        refId,
        `Order Margin Locked: ${quantity}x ${symbol} @ ₹${price.toFixed(2)} (${orderType})`
      );

      // 2. Create Order
      const order = await prisma.order.create({
        data: {
          userId,
          symbol,
          side: OrderSide.BUY,
          orderType,
          status: OrderStatus.OPEN,
          price,
          quantity,
          remainingQuantity: quantity,
          filledQuantity: 0,
          totalAmount,
          reservedAmount: totalAmount,
        },
      });

      // 3. Trigger Matching Engine
      const matchResult = await MatchingEngineService.matchOrder(order.id);

      // 4. Return latest order state
      const latestOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { buyTrades: true },
      });

      return {
        order: latestOrder,
        matchResult,
      };
    }

    // SELL Order Flow
    if (input.side === OrderSide.SELL) {
      // Verify user owns sufficient stock quantity
      const holding = await prisma.holding.findUnique({
        where: { userId_symbol: { userId, symbol } },
      });

      if (!holding || holding.quantity < quantity) {
        throw {
          status: 400,
          message: `Insufficient stock holdings. You currently own ${holding?.quantity || 0} shares of ${symbol}, cannot sell ${quantity}`,
        };
      }

      // Check open sell orders to prevent selling more than unencumbered shares
      const openSellOrders = await prisma.order.findMany({
        where: {
          userId,
          symbol,
          side: OrderSide.SELL,
          status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] },
        },
      });

      const currentlyLockedInSell = openSellOrders.reduce((sum, o) => sum + o.remainingQuantity, 0);
      if (holding.quantity - currentlyLockedInSell < quantity) {
        throw {
          status: 400,
          message: `Cannot place sell order. Available free shares: ${holding.quantity - currentlyLockedInSell} (${currentlyLockedInSell} shares are already locked in open sell orders)`,
        };
      }

      // Create Sell Order
      const order = await prisma.order.create({
        data: {
          userId,
          symbol,
          side: OrderSide.SELL,
          orderType,
          status: OrderStatus.OPEN,
          price,
          quantity,
          remainingQuantity: quantity,
          filledQuantity: 0,
          totalAmount,
          reservedAmount: 0.0,
        },
      });

      // Trigger Matching Engine
      const matchResult = await MatchingEngineService.matchOrder(order.id);

      const latestOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { sellTrades: true },
      });

      return {
        order: latestOrder,
        matchResult,
      };
    }

    throw { status: 400, message: 'Invalid order side' };
  }

  /**
   * Cancels an open or partially filled order and unlocks remaining reserved funds
   */
  static async cancelOrder(userId: string, orderId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw { status: 404, message: 'Order not found' };
      }

      if (order.userId !== userId) {
        throw { status: 403, message: 'Unauthorized to cancel this order' };
      }

      if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PARTIALLY_FILLED) {
        throw {
          status: 400,
          message: `Cannot cancel order with status '${order.status}'`,
        };
      }

      // Update order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      // If BUY order: release remaining reserved funds back to available balance
      if (order.side === OrderSide.BUY && order.remainingQuantity > 0) {
        const remainingUnfilledAmount = Number((order.remainingQuantity * order.price).toFixed(2));
        const wallet = await tx.wallet.findUnique({ where: { userId } });

        if (wallet) {
          const refundAmount = Math.min(wallet.reservedBalance, remainingUnfilledAmount);
          const newAvailable = wallet.availableBalance + refundAmount;
          const newReserved = Math.max(0, wallet.reservedBalance - refundAmount);

          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance: newAvailable,
              reservedBalance: newReserved,
            },
          });

          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              transactionType: TransactionType.ORDER_RELEASE,
              amount: refundAmount,
              balanceBefore: wallet.availableBalance,
              balanceAfter: newAvailable,
              referenceId: order.id,
              description: `Order Cancelled: Released ₹${refundAmount.toFixed(2)} (${order.remainingQuantity}x ${order.symbol} @ ₹${order.price.toFixed(2)})`,
            },
          });
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Retrieves live Order Book depth (top Bids and Asks) with visual metrics for a stock
   */
  static async getOrderBookDepth(symbol: string) {
    const sym = symbol.toUpperCase();

    // Top 10 Bids (Buy orders sorted price DESC, createdAt ASC)
    const openBids = await prisma.order.findMany({
      where: {
        symbol: sym,
        side: OrderSide.BUY,
        status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] },
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
      take: 20,
    });

    // Top 10 Asks (Sell orders sorted price ASC, createdAt ASC)
    const openAsks = await prisma.order.findMany({
      where: {
        symbol: sym,
        side: OrderSide.SELL,
        status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] },
      },
      orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
      take: 20,
    });

    // Aggregate by price level
    const bidsMap = new Map<number, { price: number; quantity: number; ordersCount: number }>();
    openBids.forEach((o) => {
      const existing = bidsMap.get(o.price) || { price: o.price, quantity: 0, ordersCount: 0 };
      existing.quantity += o.remainingQuantity;
      existing.ordersCount += 1;
      bidsMap.set(o.price, existing);
    });

    const asksMap = new Map<number, { price: number; quantity: number; ordersCount: number }>();
    openAsks.forEach((o) => {
      const existing = asksMap.get(o.price) || { price: o.price, quantity: 0, ordersCount: 0 };
      existing.quantity += o.remainingQuantity;
      existing.ordersCount += 1;
      asksMap.set(o.price, existing);
    });

    const bids = Array.from(bidsMap.values()).sort((a, b) => b.price - a.price).slice(0, 8);
    const asks = Array.from(asksMap.values()).sort((a, b) => a.price - b.price).slice(0, 8);

    const totalBidQty = bids.reduce((acc, b) => acc + b.quantity, 0);
    const totalAskQty = asks.reduce((acc, a) => acc + a.quantity, 0);

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestBid && bestAsk ? Number((bestAsk - bestBid).toFixed(2)) : 0;

    return {
      symbol: sym,
      bids,
      asks,
      totalBidQty,
      totalAskQty,
      spread,
      bestBid,
      bestAsk,
    };
  }

  /**
   * Retrieves order history for the authenticated user
   */
  static async getUserOrders(userId: string, symbol?: string) {
    const where: any = { userId };
    if (symbol) where.symbol = symbol.toUpperCase();

    return await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        stock: {
          select: { name: true, currentPrice: true },
        },
      },
    });
  }

  /**
   * Simulates a counterparty market maker order to demonstrate instant order matching & partial fills
   */
  static async simulateCounterpartyOrder(symbol: string, side: OrderSide, quantity: number, targetPrice?: number) {
    const sym = symbol.toUpperCase();
    const stock = await prisma.stock.findUnique({ where: { symbol: sym } });
    if (!stock) throw { status: 404, message: 'Stock not found' };

    // Get Market Maker bot account
    const mmUser = await prisma.user.findFirst({
      where: { email: 'marketmaker@shifty50.com' },
    });

    if (!mmUser) throw { status: 404, message: 'Market maker account not found' };

    const price = targetPrice || (side === OrderSide.BUY ? stock.currentPrice * 1.002 : stock.currentPrice * 0.998);
    const roundedPrice = Number(price.toFixed(2));
    const totalAmount = Number((quantity * roundedPrice).toFixed(2));

    const order = await prisma.order.create({
      data: {
        userId: mmUser.id,
        symbol: sym,
        side,
        orderType: OrderType.LIMIT,
        status: OrderStatus.OPEN,
        price: roundedPrice,
        quantity,
        remainingQuantity: quantity,
        filledQuantity: 0,
        totalAmount,
        reservedAmount: side === OrderSide.BUY ? totalAmount : 0.0,
      },
    });

    const matchResult = await MatchingEngineService.matchOrder(order.id);

    return {
      simulatedOrder: order,
      matchResult,
    };
  }
}
