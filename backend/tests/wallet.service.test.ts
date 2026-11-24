import { WalletService } from '../src/modules/wallet/wallet.service';
import { prisma } from '../src/shared/db/prisma';
import { TransactionType } from '../src/shared/types/enums';

// Mock prisma for isolated unit testing
jest.mock('../src/shared/db/prisma', () => ({
  prisma: {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    walletLedger: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('Double-Entry Wallet Ledger Service Tests', () => {
  const mockUserId = 'user-uuid-1234';
  const mockWalletId = 'wallet-uuid-5678';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('creditWallet()', () => {
    it('should accurately credit available balance and create an immutable ledger row', async () => {
      const mockInitialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalance: 50000.0,
        reservedBalance: 0.0,
        investedBalance: 0.0,
        currency: 'INR',
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockInitialWallet);
      (prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockInitialWallet,
        availableBalance: 150000.0,
      });
      (prisma.walletLedger.create as jest.Mock).mockResolvedValue({
        id: 'ledger-entry-1',
        walletId: mockWalletId,
        transactionType: TransactionType.MONTHLY_CREDIT,
        amount: 100000.0,
        balanceBefore: 50000.0,
        balanceAfter: 150000.0,
        referenceId: 'TEST_CREDIT_01',
        description: 'Monthly capital',
        createdAt: new Date(),
      });

      const result = await WalletService.creditWallet(
        mockUserId,
        100000.0,
        'TEST_CREDIT_01',
        'Monthly capital',
        TransactionType.MONTHLY_CREDIT
      );

      expect(result.wallet.availableBalance).toBe(150000.0);
      expect(prisma.walletLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          walletId: mockWalletId,
          amount: 100000.0,
          balanceBefore: 50000.0,
          balanceAfter: 150000.0,
          transactionType: TransactionType.MONTHLY_CREDIT,
        }),
      });
    });

    it('should reject negative or zero credit amount', async () => {
      await expect(
        WalletService.creditWallet(mockUserId, -500, 'REF_01', 'Invalid credit')
      ).rejects.toEqual(
        expect.objectContaining({ status: 400, message: 'Credit amount must be greater than zero' })
      );
    });
  });

  describe('reserveFunds()', () => {
    it('should lock funds into reserved balance and deduct from available balance without altering total capital', async () => {
      const mockInitialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalance: 100000.0,
        reservedBalance: 0.0,
        investedBalance: 0.0,
        currency: 'INR',
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockInitialWallet);
      (prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockInitialWallet,
        availableBalance: 80000.0,
        reservedBalance: 20000.0,
      });

      const result = await WalletService.reserveFunds(
        mockUserId,
        20000.0,
        'ORD_BUY_INFY_01',
        'Lock ₹20,000 for Infosys Limit Order'
      );

      expect(result.wallet.availableBalance).toBe(80000.0);
      expect(result.wallet.reservedBalance).toBe(20000.0);
      expect(prisma.walletLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionType: TransactionType.ORDER_HOLD,
          amount: -20000.0,
          balanceBefore: 100000.0,
          balanceAfter: 80000.0,
        }),
      });
    });

    it('should reject reserve request when available balance is insufficient (no overdrafts)', async () => {
      const mockInitialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalance: 10000.0,
        reservedBalance: 0.0,
        investedBalance: 0.0,
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockInitialWallet);

      await expect(
        WalletService.reserveFunds(mockUserId, 25000.0, 'ORD_02', 'Attempt overdraft')
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Insufficient available funds'),
        })
      );
    });
  });

  describe('releaseFunds()', () => {
    it('should release reserved funds back to available balance upon order cancellation', async () => {
      const mockInitialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalance: 75000.0,
        reservedBalance: 25000.0,
        investedBalance: 0.0,
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockInitialWallet);
      (prisma.wallet.update as jest.Mock).mockResolvedValue({
        ...mockInitialWallet,
        availableBalance: 100000.0,
        reservedBalance: 0.0,
      });

      const result = await WalletService.releaseFunds(
        mockUserId,
        25000.0,
        'ORD_CANCEL_01',
        'Order Cancelled: Release funds'
      );

      expect(result.wallet.availableBalance).toBe(100000.0);
      expect(result.wallet.reservedBalance).toBe(0.0);
      expect(prisma.walletLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionType: TransactionType.ORDER_RELEASE,
          amount: 25000.0,
          balanceBefore: 75000.0,
          balanceAfter: 100000.0,
        }),
      });
    });

    it('should reject release of an amount greater than currently reserved', async () => {
      const mockInitialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalance: 90000.0,
        reservedBalance: 5000.0,
        investedBalance: 0.0,
      };

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockInitialWallet);

      await expect(
        WalletService.releaseFunds(mockUserId, 10000.0, 'REF_03', 'Invalid release')
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Cannot release'),
        })
      );
    });
  });
});
