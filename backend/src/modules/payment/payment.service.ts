import { prisma } from '../../shared/db/prisma';
import { TransactionType, PaymentStatus } from '../../shared/types/enums';

export class PaymentService {
  /**
   * Processes a simulated payment with strict Idempotency-Key validation.
   * Prevents duplicate double-credits if the client retries the same payment.
   */
  static async processPayment(
    userId: string,
    amount: number,
    paymentMethod: string,
    idempotencyKey: string
  ) {
    if (amount <= 0) {
      throw { status: 400, message: 'Deposit amount must be greater than zero' };
    }

    if (!idempotencyKey || idempotencyKey.trim().length === 0) {
      throw { status: 400, message: 'Idempotency-Key is required for financial transactions' };
    }

    // 1. Check if transaction with this idempotency key already exists
    const existingPayment = await prisma.paymentTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      // Return existing receipt without double-crediting
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      return {
        isDuplicate: true,
        transaction: existingPayment,
        wallet,
        message: 'Duplicate transaction detected: Retrieved existing transaction receipt (Idempotent response)',
      };
    }

    // 2. Process new payment atomically inside transaction
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw { status: 404, message: 'Wallet not found' };
      }

      const receiptId = `RCP_${paymentMethod.toUpperCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore + amount;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balanceAfter,
        },
      });

      // Create Payment Transaction Record
      const paymentRecord = await tx.paymentTransaction.create({
        data: {
          userId,
          idempotencyKey,
          amount,
          paymentMethod,
          status: PaymentStatus.SUCCESS,
          receiptId,
          metadata: JSON.stringify({
            gateway: 'Simulated Fintech Test Gateway v1.0',
            ip: '127.0.0.1',
            authCode: `AUTH_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      // Create Immutable Ledger Entry
      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.FUNDS_ADDED,
          amount,
          balanceBefore,
          balanceAfter,
          referenceId: receiptId,
          description: `Simulated ${paymentMethod} Payment Deposit (Receipt: ${receiptId})`,
        },
      });

      return {
        isDuplicate: false,
        transaction: paymentRecord,
        wallet: updatedWallet,
        ledgerEntry,
        message: `₹${amount.toLocaleString('en-IN')} successfully deposited via ${paymentMethod}`,
      };
    });
  }

  /**
   * Retrieves user's payment transaction history
   */
  static async getUserPayments(userId: string) {
    return await prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
