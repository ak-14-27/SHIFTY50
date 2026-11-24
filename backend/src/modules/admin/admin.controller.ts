import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class AdminController {
  static async getLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const leaderboard = await AdminService.getLeaderboard();
      return sendSuccess(res, leaderboard, 'Normalized Leaderboard calculated');
    } catch (error) {
      next(error);
    }
  }

  static async getSystemAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await AdminService.getSystemAnalytics();
      return sendSuccess(res, analytics, 'Platform System Analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getAllUsersDetailed();
      return sendSuccess(res, users, 'Users retrieved for admin oversight');
    } catch (error) {
      next(error);
    }
  }

  static async reviewKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.id;
      const { userId } = req.params;
      const { status } = req.body;

      if (!status) {
        throw { status: 400, message: 'KYC status is required' };
      }

      const updatedUser = await AdminService.reviewKyc(adminUserId, userId, status);
      return sendSuccess(res, updatedUser, `User KYC status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async adjustCapital(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.id;
      const { userId, amount, type, reason } = req.body;

      if (!userId || !amount || !type || !reason) {
        throw { status: 400, message: 'userId, amount, type, and reason are required' };
      }

      if (amount <= 0) {
        throw { status: 400, message: 'Amount must be greater than zero' };
      }

      if (type !== 'CREDIT' && type !== 'DEBIT') {
        throw { status: 400, message: 'Type must be CREDIT or DEBIT' };
      }

      const result = await AdminService.adjustCapital(
        adminUserId,
        userId,
        Number(amount),
        type,
        reason
      );
      return sendSuccess(res, result, `Capital adjustment (${type} ₹${amount}) successful`);
    } catch (error) {
      next(error);
    }
  }

  static async getGlobalTradeFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const trades = await AdminService.getGlobalTradeFeed(limit);
      return sendSuccess(res, trades, 'Global Trade Feed retrieved');
    } catch (error) {
      next(error);
    }
  }
}
