"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const response_1 = require("../../shared/utils/response");
class PaymentController {
    static async deposit(req, res, next) {
        try {
            const { amount, paymentMethod } = req.body;
            const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || `IDEM_${Date.now()}`;
            const userId = req.user.id;
            const result = await payment_service_1.PaymentService.processPayment(userId, Number(amount), paymentMethod || 'UPI', idempotencyKey);
            return (0, response_1.sendSuccess)(res, result, result.message, result.isDuplicate ? 200 : 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyPayments(req, res, next) {
        try {
            const userId = req.user.id;
            const payments = await payment_service_1.PaymentService.getUserPayments(userId);
            return (0, response_1.sendSuccess)(res, payments, 'Payment transaction history retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map