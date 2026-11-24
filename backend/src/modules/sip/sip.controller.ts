import { Response, NextFunction } from 'express';
import { SipService } from './sip.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

export class SipController {
  static async createSip(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fundId, amount, frequency } = req.body;
      const sip = await SipService.createSip(userId, fundId, Number(amount), frequency);
      return sendSuccess(res, sip, 'SIP created and initial installment executed successfully!', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMySips(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sips = await SipService.getUserSips(userId);
      return sendSuccess(res, sips, 'User SIP mandates retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body;
      const updated = await SipService.updateSipStatus(userId, id, status);
      return sendSuccess(res, updated, `SIP status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async triggerDueSips(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SipService.executeDueSips();
      return sendSuccess(res, result, `Executed due SIP scheduler batch: ${result.totalProcessed} processed`);
    } catch (error) {
      next(error);
    }
  }

  static async triggerSingleNow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updated = await SipService.triggerSingleSipNow(userId, id);
      return sendSuccess(res, updated, `Manual installment executed for ${updated.fund.name}!`);
    } catch (error) {
      next(error);
    }
  }
}
