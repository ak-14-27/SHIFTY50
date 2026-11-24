import { Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { addFundsSchema, reserveFundsSchema, releaseFundsSchema } from './wallet.validation';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';
import { TransactionType } from '../../shared/types/enums';

export class WalletController {
  static async getMyWallet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wallet = await WalletService.getWalletByUserId(userId);
      return sendSuccess(res, wallet, 'Wallet details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyLedger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit, type } = req.query;
      const result = await WalletService.getLedgerHistory(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type: type ? (type as TransactionType) : undefined,
      });
      return sendSuccess(res, result, 'Ledger transaction history retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addFunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addFundsSchema.parse(req.body);
      const userId = req.user!.id;
      const refId = validated.referenceId || `PAY_MOCK_${Date.now()}`;
      const description = `Simulated ${validated.paymentMethod} Deposit`;

      const result = await WalletService.creditWallet(
        userId,
        validated.amount,
        refId,
        description,
        TransactionType.FUNDS_ADDED
      );

      return sendSuccess(res, result, `₹${validated.amount.toLocaleString('en-IN')} deposited successfully to virtual wallet`);
    } catch (error) {
      next(error);
    }
  }

  static async claimMonthlyCapital(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await WalletService.claimMonthlyCapital(userId);
      return sendSuccess(res, result, 'Monthly Virtual Capital of ₹1,00,000 credited to your wallet!');
    } catch (error) {
      next(error);
    }
  }

  static async reserveOrderFunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = reserveFundsSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await WalletService.reserveFunds(
        userId,
        validated.amount,
        validated.referenceId,
        validated.description
      );
      return sendSuccess(res, result, `₹${validated.amount.toFixed(2)} reserved for order`);
    } catch (error) {
      next(error);
    }
  }

  static async releaseOrderFunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = releaseFundsSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await WalletService.releaseFunds(
        userId,
        validated.amount,
        validated.referenceId,
        validated.description
      );
      return sendSuccess(res, result, `₹${validated.amount.toFixed(2)} released back to available balance`);
    } catch (error) {
      next(error);
    }
  }
}
