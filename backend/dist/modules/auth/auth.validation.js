"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminKycApprovalSchema = exports.kycSubmitSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.kycSubmitSchema = zod_1.z.object({
    panNumber: zod_1.z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
    aadhaarNumber: zod_1.z
        .string()
        .trim()
        .regex(/^[0-9]{12}$/, 'Aadhaar must be a 12-digit numeric identifier'),
});
exports.adminKycApprovalSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user UUID'),
    status: zod_1.z.enum(['VERIFIED', 'ACTIVE', 'REGISTERED']),
});
//# sourceMappingURL=auth.validation.js.map