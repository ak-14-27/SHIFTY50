import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { sendError } from '../utils/response';
import { KycStatus, UserRole } from '../types/enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole | string;
  kycStatus: KycStatus | string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'shifty50_super_secure_jwt_secret_change_in_production_2026';

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        kycStatus: true,
      },
    });

    if (!user) {
      return sendError(res, 'User session expired or user not found', 401);
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired authentication token', 401, error.message);
  }
};

export const requireActiveKyc = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return sendError(res, 'Unauthenticated', 401);
  }

  if (req.user.kycStatus !== KycStatus.ACTIVE && req.user.role !== UserRole.ADMIN) {
    return sendError(
      res,
      `KYC verification required. Current status is ${req.user.kycStatus}. Please complete KYC to access trading and wallet functions.`,
      403,
      { currentStatus: req.user.kycStatus }
    );
  }

  next();
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return sendError(res, 'Forbidden: Admin privilege required', 403);
  }
  next();
};
