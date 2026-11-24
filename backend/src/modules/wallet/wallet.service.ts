import { prisma } from '../../shared/db/prisma';
import { TransactionType } from '../../shared/types/enums';

export class WalletService {
  /**
   * Retrieves the wallet by user ID with calculated metrics
   */
  static async getWalletByUserId(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw { status: 404, message: 'Wallet not found for this user' };
    }

    const totalPortfolioValue =
      wallet.availableBalance + wallet.reservedBalance + wallet.investedBalance;

    return {
      ...wallet,
      totalPortfolioValue,
    };
  }

  /**
   * Retrieves paginated, chronological ledger history for a wallet
   */
  static async getLedgerHistory(
    userId: string,
    options: { page?: number; limit?: number; type?: TransactionType } = {}
  ) {
    const wallet = await this.getWalletByUserId(userId);

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { walletId: wallet.id };
    if (options.type) {
      where.transactionType = options.type;
    }

    const [totalEntries, entries] = await Promise.all([
      prisma.walletLedger.count({ where }),
      prisma.walletLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        totalEntries,
        totalPages: Math.ceil(totalEntries / limit),
      },
    };
  }

  /**
   * Credits the wallet atomically and creates an immutable ledger entry.
   */
  static async creditWallet(
    userId: string,
    amount: number,
    referenceId: string,
    description: string,
    transactionType: TransactionType = TransactionType.FUNDS_ADDED
  ) {
    if (amount <= 0) {
      throw { status: 400, message: 'Credit amount must be greater than zero' };
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw { status: 404, message: 'Wallet not found' };
      }

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore + amount;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balanceAfter,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType,
          amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          description,
        },
      });

      return {
        wallet: updatedWallet,
        ledgerEntry,
      };
    });
  }

  /**
   * Reserves funds (holds) for open Limit/Market orders.
   * Decreases available balance, increases reserved balance.
   */
  static async reserveFunds(
    userId: string,
    amount: number,
    referenceId: string,
    description: string
  ) {
    if (amount <= 0) {
      throw { status: 400, message: 'Reserve amount must be greater than zero' };
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw { status: 404, message: 'Wallet not found' };
      }

      if (wallet.availableBalance < amount) {
        throw {
          status: 400,
          message: `Insufficient available funds. Available: ₹${wallet.availableBalance.toFixed(
            2
          )}, Required: ₹${amount.toFixed(2)}`,
        };
      }

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - amount;
      const newReserved = wallet.reservedBalance + amount;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balanceAfter,
          reservedBalance: newReserved,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.ORDER_HOLD,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          description,
        },
      });

      return {
        wallet: updatedWallet,
        ledgerEntry,
      };
    });
  }

  /**
   * Releases previously held funds (e.g. order cancelled or expired).
   * Decreases reserved balance, increases available balance.
   */
  static async releaseFunds(
    userId: string,
    amount: number,
    referenceId: string,
    description: string
  ) {
    if (amount <= 0) {
      throw { status: 400, message: 'Release amount must be greater than zero' };
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw { status: 404, message: 'Wallet not found' };
      }

      if (wallet.reservedBalance < amount) {
        throw {
          status: 400,
          message: `Cannot release ₹${amount.toFixed(
            2
          )}. Currently reserved amount is only ₹${wallet.reservedBalance.toFixed(2)}`,
        };
      }

      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore + amount;
      const newReserved = wallet.reservedBalance - amount;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balanceAfter,
          reservedBalance: newReserved,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.ORDER_RELEASE,
          amount: amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          description,
        },
      });

      return {
        wallet: updatedWallet,
        ledgerEntry,
      };
    });
  }

  /**
   * Settles executed trade: transfers from reserved balance to invested balance.
   */
  static async settleFunds(
    userId: string,
    executedAmount: number,
    fee: number,
    referenceId: string,
    description: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw { status: 404, message: 'Wallet not found' };
      }

      const totalDeduction = executedAmount + fee;
      if (wallet.reservedBalance < totalDeduction) {
        throw {
          status: 400,
          message: 'Insufficient reserved funds to settle transaction',
        };
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          reservedBalance: wallet.reservedBalance - totalDeduction,
          investedBalance: wallet.investedBalance + executedAmount,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.TRADE_DEBIT,
          amount: -totalDeduction,
          balanceBefore: wallet.availableBalance, // available balance was already reduced during reserve
          balanceAfter: wallet.availableBalance,
          referenceId,
          description: `${description} (Principal: ₹${executedAmount.toFixed(2)}, Fee: ₹${fee.toFixed(2)})`,
        },
      });

      return {
        wallet: updatedWallet,
        ledgerEntry,
      };
    });
  }

  /**
   * Monthly capital distribution trigger: Adds ₹1,00,000 virtual capital to active users
   */
  static async claimMonthlyCapital(userId: string) {
    const MONTHLY_AMOUNT = 100000.0;
    const refId = `MONTHLY_ALLOC_${new Date().getFullYear()}_${new Date().getMonth() + 1}_${Date.now()}`;
    return await this.creditWallet(
      userId,
      MONTHLY_AMOUNT,
      refId,
      'Monthly Virtual Capital Allocation (₹1,00,000)',
      TransactionType.MONTHLY_CREDIT
    );
  }
}
