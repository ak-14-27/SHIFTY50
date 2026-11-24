import { MatchingEngineService } from '../src/modules/order/matching-engine.service';
import { PaymentService } from '../src/modules/payment/payment.service';
import { prisma } from '../src/shared/db/prisma';
import { OrderSide, OrderStatus, OrderType } from '../src/shared/types/enums';

// Mock prisma for isolated unit testing
jest.mock('../src/shared/db/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    trade: {
      create: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletLedger: {
      create: jest.fn(),
    },
    holding: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    stock: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    paymentTransaction: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('Mid-Term Matching Engine & Settlement Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Price-Time Priority & Partial Fills', () => {
    it('should correctly match an incoming BUY order against a resting SELL order and compute partial fills', async () => {
      const mockIncomingBuyOrder = {
        id: 'buy-order-1',
        userId: 'buyer-user-id',
        symbol: 'RELIANCE',
        side: OrderSide.BUY,
        orderType: OrderType.LIMIT,
        price: 2950.0,
        quantity: 100,
        filledQuantity: 0,
        remainingQuantity: 100,
        status: OrderStatus.OPEN,
      };

      const mockRestingSellOrder = {
        id: 'sell-order-1',
        userId: 'seller-user-id',
        symbol: 'RELIANCE',
        side: OrderSide.SELL,
        orderType: OrderType.LIMIT,
        price: 2940.0, // Best lower price
        quantity: 40,
        filledQuantity: 0,
        remainingQuantity: 40,
        status: OrderStatus.OPEN,
        createdAt: new Date('2026-09-01T10:00:00Z'),
      };

      // Mock first round returns incoming order and opposite order, second round returns null (no more resting orders)
      let callCount = 0;
      (prisma.order.findUnique as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve(mockIncomingBuyOrder);
        return Promise.resolve(null);
      });

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockRestingSellOrder);
      (prisma.trade.create as jest.Mock).mockResolvedValue({ id: 'trade-exec-1' });
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        availableBalance: 100000,
        reservedBalance: 50000,
        investedBalance: 0,
      });
      (prisma.holding.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue({
        symbol: 'RELIANCE',
        currentPrice: 2940.0,
        previousClose: 2900.0,
        highPrice: 2940.0,
        lowPrice: 2900.0,
        volume: 1000,
      });

      const matchResult = await MatchingEngineService.matchOrder('buy-order-1');

      expect(matchResult.matched).toBe(true);
      expect(matchResult.totalQuantityMatched).toBe(40); // Matches min(100, 40)
      expect(matchResult.executions[0].price).toBe(2940.0); // Maker price

      // Verify incoming buy order updated with 40 filled and 60 remaining (PARTIALLY_FILLED)
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'buy-order-1' },
        data: expect.objectContaining({
          filledQuantity: 40,
          remainingQuantity: 60,
          status: OrderStatus.PARTIALLY_FILLED,
        }),
      });

      // Verify resting sell order updated to FILLED
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'sell-order-1' },
        data: expect.objectContaining({
          filledQuantity: 40,
          remainingQuantity: 0,
          status: OrderStatus.FILLED,
        }),
      });
    });
  });

  describe('Payment Gateway Idempotency', () => {
    it('should prevent duplicate wallet credits when called with an existing Idempotency-Key', async () => {
      const mockExistingPayment = {
        id: 'pay-tx-1',
        userId: 'user-1',
        idempotencyKey: 'IDEM_KEY_RETRY_123',
        amount: 50000.0,
        paymentMethod: 'UPI',
        receiptId: 'RCP_UPI_1234',
        status: 'SUCCESS',
      };

      (prisma.paymentTransaction.findUnique as jest.Mock).mockResolvedValue(mockExistingPayment);
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'wallet-1', availableBalance: 150000 });

      const result = await PaymentService.processPayment('user-1', 50000.0, 'UPI', 'IDEM_KEY_RETRY_123');

      expect(result.isDuplicate).toBe(true);
      expect(prisma.wallet.update).not.toHaveBeenCalled();
      expect(prisma.paymentTransaction.create).not.toHaveBeenCalled();
    });
  });
});
