import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class ReportsController {
  static async getContractNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { tradeId } = req.params;
      const note = await ReportsService.getContractNote(userId, tradeId);
      return sendSuccess(res, note, 'Contract Note retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getTaxPnlStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fy } = req.query;
      const statement = await ReportsService.getTaxPnlStatement(userId, fy as string);
      return sendSuccess(res, statement, 'Tax P&L Statement retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getHoldingsStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const statement = await ReportsService.getHoldingsStatement(userId);
      return sendSuccess(res, statement, 'Consolidated Holdings Statement retrieved');
    } catch (error) {
      next(error);
    }
  }
}
