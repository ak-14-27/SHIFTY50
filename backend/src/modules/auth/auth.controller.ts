import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, kycSubmitSchema } from './auth.validation';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      return sendSuccess(res, result, 'User registered successfully. Please proceed with KYC.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  static async submitKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = kycSubmitSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await AuthService.submitKyc(userId, validated, true);
      return sendSuccess(
        res,
        result,
        'KYC verified successfully! Your virtual trading wallet has been activated with ₹1,00,000 capital.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { user: req.user }, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}
