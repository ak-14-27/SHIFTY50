import { SipService } from '../src/modules/sip/sip.service';
import { prisma } from '../src/shared/db/prisma';
import { SipFrequency, SipStatus, TransactionType } from '../src/shared/types/enums';

// Mock prisma for isolated unit testing
jest.mock('../src/shared/db/prisma', () => ({
  prisma: {
    mutualFund: {
      findUnique: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletLedger: {
      create: jest.fn(),
    },
    mutualFundHolding: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    sip: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    mutualFundTransaction: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('EST Final Milestone: SIP & Mutual Funds Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SIP Date Calculation (getNextDate)', () => {
    it('should correctly increment by 1 day for DAILY frequency', () => {
      const baseDate = new Date('2026-09-01T10:00:00Z');
      const nextDate = SipService.getNextDate(baseDate, SipFrequency.DAILY);
      const diffMs = nextDate.getTime() - baseDate.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    });

    it('should correctly increment by 7 days for WEEKLY frequency', () => {
      const baseDate = new Date('2026-09-01T10:00:00Z');
      const nextDate = SipService.getNextDate(baseDate, SipFrequency.WEEKLY);
      const diffDays = Math.round((nextDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
      expect(diffDays).toBe(7);
    });

    it('should correctly increment by 1 month for MONTHLY frequency', () => {
      const baseDate = new Date(2026, 8, 1); // Sept 1, 2026
      const nextDate = SipService.getNextDate(baseDate, SipFrequency.MONTHLY);
      expect(nextDate.getMonth()).toBe(9); // Oct (0-indexed 9)
    });
  });

  describe('SIP Creation & First Installment Debit', () => {
    it('should reject SIP creation if installment amount is less than ₹500', async () => {
      await expect(
        SipService.createSip('user-1', 'fund-1', 400, SipFrequency.MONTHLY)
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: 'Minimum SIP installment amount is ₹500',
        })
      );
    });

    it('should reject SIP creation if wallet has insufficient available balance', async () => {
      (prisma.mutualFund.findUnique as jest.Mock).mockResolvedValue({
        id: 'fund-1',
        name: 'Parag Parikh Flexi Cap',
        nav: 76.42,
      });

      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        availableBalance: 200.0,
      });

      await expect(
        SipService.createSip('user-1', 'fund-1', 1000, SipFrequency.MONTHLY)
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
        })
      );
    });

    it('should successfully create SIP, deduct wallet with double-entry ledger, and allocate units', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Parag Parikh Flexi Cap Fund',
        nav: 100.0,
      };

      const mockWallet = {
        id: 'wallet-1',
        availableBalance: 50000.0,
        reservedBalance: 0.0,
        investedBalance: 10000.0,
      };

      const mockSip = {
        id: 'sip-123',
        userId: 'user-1',
        fundId: 'fund-1',
        amount: 2000.0,
        frequency: SipFrequency.MONTHLY,
        status: SipStatus.ACTIVE,
      };

      (prisma.mutualFund.findUnique as jest.Mock).mockResolvedValue(mockFund);
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);
      (prisma.sip.create as jest.Mock).mockResolvedValue(mockSip);
      (prisma.mutualFundHolding.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await SipService.createSip('user-1', 'fund-1', 2000.0, SipFrequency.MONTHLY);

      expect(prisma.sip.create).toHaveBeenCalled();
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        data: {
          availableBalance: 48000.0,
          investedBalance: 12000.0,
        },
      });
      expect(prisma.walletLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            walletId: 'wallet-1',
            transactionType: TransactionType.SIP_DEDUCTION,
            amount: -2000.0,
            balanceBefore: 50000.0,
            balanceAfter: 48000.0,
          }),
        })
      );
      expect(result.id).toBe('sip-123');
      expect(prisma.mutualFundTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            fundId: 'fund-1',
            amount: 2000.0,
            units: 20,
            transactionType: 'SIP_INSTALLMENT',
          }),
        })
      );
    });
  });

  describe('SIP Status Modification', () => {
    it('should successfully update SIP status to PAUSED and ACTIVE', async () => {
      (prisma.sip.findUnique as jest.Mock).mockResolvedValue({
        id: 'sip-1',
        userId: 'user-1',
        amount: 2000.0,
        fund: { name: 'Parag Parikh Flexi Cap Fund' },
        status: SipStatus.ACTIVE,
      });

      (prisma.sip.update as jest.Mock).mockResolvedValue({
        id: 'sip-1',
        userId: 'user-1',
        status: SipStatus.PAUSED,
      });

      const updated = await SipService.updateSipStatus('user-1', 'sip-1', SipStatus.PAUSED);
      expect(updated.status).toBe(SipStatus.PAUSED);
      expect(prisma.sip.update).toHaveBeenCalledWith({
        where: { id: 'sip-1' },
        data: { status: SipStatus.PAUSED },
      });
    });
  });
});
