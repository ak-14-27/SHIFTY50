import { Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { createOrderSchema, cancelOrderSchema, counterpartySimSchema } from './order.validation';
import { sendSuccess } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';
import { OrderSide } from '../../shared/types/enums';

export class OrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await OrderService.createOrder(userId, validated as any);

      const isFilled = result.order?.status === 'FILLED';
      const isPartiallyFilled = result.order?.status === 'PARTIALLY_FILLED';
      const msg = isFilled
        ? `Order Executed! ${result.order?.quantity}x ${result.order?.symbol} ${result.order?.side} filled.`
        : isPartiallyFilled
        ? `Order Partially Executed! ${result.order?.filledQuantity}/${result.order?.quantity} filled.`
        : `Order Placed! Resting in live order book for ${result.order?.symbol}.`;

      return sendSuccess(res, result, msg, 201);
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const userId = req.user!.id;
      const result = await OrderService.cancelOrder(userId, orderId);
      return sendSuccess(res, result, 'Order cancelled successfully and funds released');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderBookDepth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.params;
      const depth = await OrderService.getOrderBookDepth(symbol);
      return sendSuccess(res, depth, `Order book depth for ${symbol.toUpperCase()}`);
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { symbol } = req.query;
      const orders = await OrderService.getUserOrders(userId, symbol as string);
      return sendSuccess(res, orders, 'User orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async simulateCounterparty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = counterpartySimSchema.parse(req.body);
      const result = await OrderService.simulateCounterpartyOrder(
        validated.symbol,
        validated.side as OrderSide,
        validated.quantity,
        validated.price
      );
      return sendSuccess(
        res,
        result,
        `Simulated ${validated.side} counterparty order placed for ${validated.quantity}x ${validated.symbol}`
      );
    } catch (error) {
      next(error);
    }
  }
}
