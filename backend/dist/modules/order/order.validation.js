"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.counterpartySimSchema = exports.cancelOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1, 'Stock symbol is required').toUpperCase(),
    side: zod_1.z.enum(['BUY', 'SELL']),
    orderType: zod_1.z.enum(['LIMIT', 'MARKET', 'STOP_LOSS']).default('LIMIT'),
    quantity: zod_1.z.number().int().positive('Quantity must be an integer greater than 0'),
    price: zod_1.z.number().positive('Price must be greater than zero').optional(),
});
exports.cancelOrderSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid('Invalid order UUID'),
});
exports.counterpartySimSchema = zod_1.z.object({
    symbol: zod_1.z.string().toUpperCase(),
    side: zod_1.z.enum(['BUY', 'SELL']),
    quantity: zod_1.z.number().int().positive().default(10),
    price: zod_1.z.number().positive().optional(),
});
//# sourceMappingURL=order.validation.js.map