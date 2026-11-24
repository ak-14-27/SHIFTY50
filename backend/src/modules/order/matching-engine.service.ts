import { prisma } from '../../shared/db/prisma';
import { OrderSide, OrderStatus, OrderType, TransactionType } from '../../shared/types/enums';

const TRADING_FEE_RATE = 0.0005; // 0.05% brokerage fee

export interface MatchExecutionResult {
  matched: boolean;
  tradesCreated: number;
  totalQuantityMatched: number;
  executions: Array<{
    tradeId: string;
    price: number;
    quantity: number;
    symbol: string;
    buyerId: string;
    sellerId: string;
  }>;
}

export class MatchingEngineService {
  /**
   * Matches an incoming order against resting orders in the order book.
   * Executes atomic settlement inside a database transaction.
   */
  static async matchOrder(incomingOrderId: string): Promise<MatchExecutionResult> {
    const executions: Array<{
      tradeId: string;
      price: number;
      quantity: number;
      symbol: string;
      buyerId: string;
      sellerId: string;
    }> = [];

    let totalQuantityMatched = 0;

    // Use a transaction loop to match until incoming order is FILLED or no matching orders remain
    while (true) {
      const matchRound = await prisma.$transaction(async (tx) => {
        // 1. Fetch fresh incoming order state
        const incomingOrder = await tx.order.findUnique({
          where: { id: incomingOrderId },
        });

        if (
          !incomingOrder ||
          incomingOrder.remainingQuantity <= 0 ||
          incomingOrder.status === OrderStatus.FILLED ||
          incomingOrder.status === OrderStatus.CANCELLED
        ) {
          return null;
        }

        const isBuy = incomingOrder.side === OrderSide.BUY;
        const symbol = incomingOrder.symbol;

        // 2. Find eligible resting opposite orders sorted by Price-Time Priority
        // For BUY: resting SELLs where sellPrice <= buyPrice (Lowest Price first, then Oldest)
        // For SELL: resting BUYs where buyPrice >= sellPrice (Highest Price first, then Oldest)
        let oppositeOrder = null;

        if (isBuy) {
          // Resting sells
          const whereClause: any = {
            symbol,
            side: OrderSide.SELL,
            status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] },
            userId: { not: incomingOrder.userId }, // Prevent self-matching
          };

          if (incomingOrder.orderType === OrderType.LIMIT) {
            whereClause.price = { lte: incomingOrder.price };
          }

          oppositeOrder = await tx.order.findFirst({
            where: whereClause,
            orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
          });
        } else {
          // Resting buys
          const whereClause: any = {
            symbol,
            side: OrderSide.BUY,
            status: { in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED] },
            userId: { not: incomingOrder.userId }, // Prevent self-matching
          };

          if (incomingOrder.orderType === OrderType.LIMIT) {
            whereClause.price = { gte: incomingOrder.price };
          }

          oppositeOrder = await tx.order.findFirst({
            where: whereClause,
            orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
          });
        }

        if (!oppositeOrder) {
          return null; // No eligible resting orders to match
        }

        // 3. Determine Execution Price & Match Quantity
        // Price is set by the resting maker order in the order book
        const executionPrice = oppositeOrder.price;
        const matchQuantity = Math.min(
          incomingOrder.remainingQuantity,
          oppositeOrder.remainingQuantity
        );

        const tradeAmount = Number((matchQuantity * executionPrice).toFixed(2));
        const buyerFee = Number((tradeAmount * TRADING_FEE_RATE).toFixed(2));
        const sellerFee = Number((tradeAmount * TRADING_FEE_RATE).toFixed(2));

        const buyerOrderId = isBuy ? incomingOrder.id : oppositeOrder.id;
        const sellerOrderId = isBuy ? oppositeOrder.id : incomingOrder.id;
        const buyerId = isBuy ? incomingOrder.userId : oppositeOrder.userId;
        const sellerId = isBuy ? oppositeOrder.userId : incomingOrder.userId;

        // 4. Update Incoming Order
        const newIncFilled = incomingOrder.filledQuantity + matchQuantity;
        const newIncRemaining = incomingOrder.remainingQuantity - matchQuantity;
        const newIncStatus =
          newIncRemaining === 0 ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;

        await tx.order.update({
          where: { id: incomingOrder.id },
          data: {
            filledQuantity: newIncFilled,
            remainingQuantity: newIncRemaining,
            status: newIncStatus,
          },
        });

        // 5. Update Resting Opposite Order
        const newOppFilled = oppositeOrder.filledQuantity + matchQuantity;
        const newOppRemaining = oppositeOrder.remainingQuantity - matchQuantity;
        const newOppStatus =
          newOppRemaining === 0 ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;

        await tx.order.update({
          where: { id: oppositeOrder.id },
          data: {
            filledQuantity: newOppFilled,
            remainingQuantity: newOppRemaining,
            status: newOppStatus,
          },
        });

        // 6. Create Trade Execution Row
        const trade = await tx.trade.create({
          data: {
            symbol,
            executionPrice,
            quantity: matchQuantity,
            tradeAmount,
            buyerFee,
            sellerFee,
            buyerOrderId,
            sellerOrderId,
            buyerId,
            sellerId,
          },
        });

        // 7. Atomic Settlement: Update Buyer's Wallet
        const buyerWallet = await tx.wallet.findUnique({ where: { userId: buyerId } });
        if (buyerWallet) {
          const reservedDeduction = tradeAmount;
          const newReserved = Math.max(0, buyerWallet.reservedBalance - reservedDeduction);
          const newInvested = buyerWallet.investedBalance + tradeAmount;

          await tx.wallet.update({
            where: { id: buyerWallet.id },
            data: {
              reservedBalance: newReserved,
              investedBalance: newInvested,
            },
          });

          await tx.walletLedger.create({
            data: {
              walletId: buyerWallet.id,
              transactionType: TransactionType.TRADE_DEBIT,
              amount: -tradeAmount,
              balanceBefore: buyerWallet.availableBalance,
              balanceAfter: buyerWallet.availableBalance,
              referenceId: trade.id,
              description: `Trade Settled: Purchased ${matchQuantity}x ${symbol} @ ₹${executionPrice.toFixed(2)}`,
            },
          });
        }

        // 8. Atomic Settlement: Update Seller's Wallet (Net proceeds credited to available)
        const sellerWallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
        if (sellerWallet) {
          const netProceeds = tradeAmount - sellerFee;
          const newAvailable = sellerWallet.availableBalance + netProceeds;

          await tx.wallet.update({
            where: { id: sellerWallet.id },
            data: {
              availableBalance: newAvailable,
            },
          });

          await tx.walletLedger.create({
            data: {
              walletId: sellerWallet.id,
              transactionType: TransactionType.TRADE_CREDIT,
              amount: netProceeds,
              balanceBefore: sellerWallet.availableBalance,
              balanceAfter: newAvailable,
              referenceId: trade.id,
              description: `Trade Settled: Sold ${matchQuantity}x ${symbol} @ ₹${executionPrice.toFixed(2)} (Fee: ₹${sellerFee.toFixed(2)})`,
            },
          });
        }

        // 9. Atomic Settlement: Update Buyer's Stock Holding
        const buyerHolding = await tx.holding.findUnique({
          where: { userId_symbol: { userId: buyerId, symbol } },
        });

        if (buyerHolding) {
          const oldQty = buyerHolding.quantity;
          const newQty = oldQty + matchQuantity;
          const oldTotalInvested = buyerHolding.totalInvested;
          const newTotalInvested = oldTotalInvested + tradeAmount;
          const newAvgPrice = Number((newTotalInvested / newQty).toFixed(2));

          await tx.holding.update({
            where: { id: buyerHolding.id },
            data: {
              quantity: newQty,
              averageBuyPrice: newAvgPrice,
              totalInvested: newTotalInvested,
            },
          });
        } else {
          await tx.holding.create({
            data: {
              userId: buyerId,
              symbol,
              quantity: matchQuantity,
              averageBuyPrice: executionPrice,
              totalInvested: tradeAmount,
              realizedProfit: 0.0,
            },
          });
        }

        // 10. Atomic Settlement: Update Seller's Stock Holding & Realized P&L
        const sellerHolding = await tx.holding.findUnique({
          where: { userId_symbol: { userId: sellerId, symbol } },
        });

        if (sellerHolding) {
          const costOfSoldShares = matchQuantity * sellerHolding.averageBuyPrice;
          const realizedPnL = Number((tradeAmount - costOfSoldShares - sellerFee).toFixed(2));
          const newQty = Math.max(0, sellerHolding.quantity - matchQuantity);
          const newTotalInvested = newQty > 0 ? Number((newQty * sellerHolding.averageBuyPrice).toFixed(2)) : 0.0;
          const newRealizedProfit = sellerHolding.realizedProfit + realizedPnL;

          await tx.holding.update({
            where: { id: sellerHolding.id },
            data: {
              quantity: newQty,
              totalInvested: newTotalInvested,
              realizedProfit: newRealizedProfit,
            },
          });
        }

        // 11. Update Stock Current Market Price & High/Low
        const stock = await tx.stock.findUnique({ where: { symbol } });
        if (stock) {
          const newHigh = Math.max(stock.highPrice, executionPrice);
          const newLow = Math.min(stock.lowPrice, executionPrice);
          const changePercent = Number(
            (((executionPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
          );

          await tx.stock.update({
            where: { symbol },
            data: {
              currentPrice: executionPrice,
              highPrice: newHigh,
              lowPrice: newLow,
              changePercent,
              volume: stock.volume + matchQuantity,
            },
          });
        }

        // 12. Create Real-Time In-App Notifications
        if (tx.notification?.createMany) {
          await tx.notification.createMany({
            data: [
              {
                userId: buyerId,
                title: 'Buy Order Executed',
                message: `Purchased ${matchQuantity}x ${symbol} at ₹${executionPrice.toFixed(2)} (Trade ID: ${trade.id.slice(0, 8)})`,
                type: 'ORDER_MATCH',
                referenceId: trade.id,
              },
              {
                userId: sellerId,
                title: 'Sell Order Executed',
                message: `Sold ${matchQuantity}x ${symbol} at ₹${executionPrice.toFixed(2)} (Net: ₹${(tradeAmount - sellerFee).toFixed(2)})`,
                type: 'ORDER_MATCH',
                referenceId: trade.id,
              },
            ],
          });
        }

        return {
          tradeId: trade.id,
          price: executionPrice,
          quantity: matchQuantity,
          symbol,
          buyerId,
          sellerId,
        };
      });

      if (!matchRound) {
        break; // Finished matching all possible rounds
      }

      executions.push(matchRound);
      totalQuantityMatched += matchRound.quantity;
    }

    return {
      matched: executions.length > 0,
      tradesCreated: executions.length,
      totalQuantityMatched,
      executions,
    };
  }
}
