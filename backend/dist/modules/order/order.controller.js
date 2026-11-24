"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("./order.service");
const order_validation_1 = require("./order.validation");
const response_1 = require("../../shared/utils/response");
class OrderController {
    static async createOrder(req, res, next) {
        try {
            const validated = order_validation_1.createOrderSchema.parse(req.body);
            const userId = req.user.id;
            const result = await order_service_1.OrderService.createOrder(userId, validated);
            const isFilled = result.order?.status === 'FILLED';
            const isPartiallyFilled = result.order?.status === 'PARTIALLY_FILLED';
            const msg = isFilled
                ? `Order Executed! ${result.order?.quantity}x ${result.order?.symbol} ${result.order?.side} filled.`
                : isPartiallyFilled
                    ? `Order Partially Executed! ${result.order?.filledQuantity}/${result.order?.quantity} filled.`
                    : `Order Placed! Resting in live order book for ${result.order?.symbol}.`;
            return (0, response_1.sendSuccess)(res, result, msg, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            const result = await order_service_1.OrderService.cancelOrder(userId, orderId);
            return (0, response_1.sendSuccess)(res, result, 'Order cancelled successfully and funds released');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrderBookDepth(req, res, next) {
        try {
            const { symbol } = req.params;
            const depth = await order_service_1.OrderService.getOrderBookDepth(symbol);
            return (0, response_1.sendSuccess)(res, depth, `Order book depth for ${symbol.toUpperCase()}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const { symbol } = req.query;
            const orders = await order_service_1.OrderService.getUserOrders(userId, symbol);
            return (0, response_1.sendSuccess)(res, orders, 'User orders retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async simulateCounterparty(req, res, next) {
        try {
            const validated = order_validation_1.counterpartySimSchema.parse(req.body);
            const result = await order_service_1.OrderService.simulateCounterpartyOrder(validated.symbol, validated.side, validated.quantity, validated.price);
            return (0, response_1.sendSuccess)(res, result, `Simulated ${validated.side} counterparty order placed for ${validated.quantity}x ${validated.symbol}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map