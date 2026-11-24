"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseFundsSchema = exports.reserveFundsSchema = exports.addFundsSchema = void 0;
const zod_1 = require("zod");
exports.addFundsSchema = zod_1.z.object({
    amount: zod_1.z
        .number({ invalid_type_error: 'Amount must be a number' })
        .positive('Deposit amount must be greater than zero')
        .max(10000000, 'Single deposit cannot exceed ₹1,00,00,000'),
    paymentMethod: zod_1.z.enum(['UPI', 'CARD', 'NET_BANKING', 'VIRTUAL_TOPUP']).default('VIRTUAL_TOPUP'),
    referenceId: zod_1.z.string().optional(),
});
exports.reserveFundsSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Reserve amount must be positive'),
    referenceId: zod_1.z.string().min(1, 'Reference ID (e.g. Order ID) is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
});
exports.releaseFundsSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Release amount must be positive'),
    referenceId: zod_1.z.string().min(1, 'Reference ID is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
});
//# sourceMappingURL=wallet.validation.js.map