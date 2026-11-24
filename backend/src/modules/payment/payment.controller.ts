import { Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class PaymentController {
  static async deposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { amount, paymentMethod } = req.body;
      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey || `IDEM_${Date.now()}`;
      const userId = req.user!.id;

      const result = await PaymentService.processPayment(
        userId,
        Number(amount),
        paymentMethod || 'UPI',
        idempotencyKey
      );

      return sendSuccess(res, result, result.message, result.isDuplicate ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const payments = await PaymentService.getUserPayments(userId);
      return sendSuccess(res, payments, 'Payment transaction history retrieved');
    } catch (error) {
      next(error);
    }
  }
}
