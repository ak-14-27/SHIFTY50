import { Response, NextFunction } from 'express';
import { prisma } from '../../shared/db/prisma';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallet: true,
        },
      });

      if (!user) {
        throw { status: 404, message: 'User not found' };
      }

      const { passwordHash, ...safeUser } = user;
      return sendSuccess(res, safeUser, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMyAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      return sendSuccess(res, logs, 'User audit trail retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          kycStatus: true,
          role: true,
          createdAt: true,
          wallet: {
            select: {
              availableBalance: true,
              reservedBalance: true,
              investedBalance: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, users, 'All platform users retrieved');
    } catch (error) {
      next(error);
    }
  }
}
