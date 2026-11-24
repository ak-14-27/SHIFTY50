import { Request, Response, NextFunction } from 'express';
import { MutualFundsService } from './mutual-funds.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class MutualFundsController {
  static async getAllFunds(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const funds = await MutualFundsService.getAllFunds(category as string, search as string);
      return sendSuccess(res, funds, 'Mutual Funds catalog retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getFundById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fund = await MutualFundsService.getFundById(id);
      return sendSuccess(res, fund, 'Mutual Fund details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async investLumpSum(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fundId, amount } = req.body;
      const result = await MutualFundsService.investLumpSum(userId, fundId, Number(amount));
      return sendSuccess(res, result, `₹${Number(amount).toLocaleString('en-IN')} invested in ${result.fund.name} successfully!`, 201);
    } catch (error) {
      next(error);
    }
  }

  static async redeem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fundId, units } = req.body;
      const result = await MutualFundsService.redeem(userId, fundId, Number(units));
      return sendSuccess(res, result, `Redeemed ${units} units of ${result.fund.name} successfully!`);
    } catch (error) {
      next(error);
    }
  }

  static async getMyHoldings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await MutualFundsService.getUserMfHoldings(userId);
      return sendSuccess(res, result, 'Mutual Fund holdings retrieved');
    } catch (error) {
      next(error);
    }
  }
}
