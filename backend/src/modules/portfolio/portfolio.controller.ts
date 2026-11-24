import { Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class PortfolioController {
  static async getMyPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const portfolio = await PortfolioService.getUserPortfolio(userId);
      return sendSuccess(res, portfolio, 'User portfolio metrics and holdings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMyTrades(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const trades = await PortfolioService.getUserTrades(userId);
      return sendSuccess(res, trades, 'User executed trade executions retrieved');
    } catch (error) {
      next(error);
    }
  }
}
