"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireActiveKyc = exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const response_1 = require("../utils/response");
const enums_1 = require("../types/enums");
const authenticateJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Authorization token missing or invalid format', 401);
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'shifty50_super_secure_jwt_secret_change_in_production_2026';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({
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
            return (0, response_1.sendError)(res, 'User session expired or user not found', 401);
        }
        req.user = user;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired authentication token', 401, error.message);
    }
};
exports.authenticateJwt = authenticateJwt;
const requireActiveKyc = (req, res, next) => {
    if (!req.user) {
        return (0, response_1.sendError)(res, 'Unauthenticated', 401);
    }
    if (req.user.kycStatus !== enums_1.KycStatus.ACTIVE && req.user.role !== enums_1.UserRole.ADMIN) {
        return (0, response_1.sendError)(res, `KYC verification required. Current status is ${req.user.kycStatus}. Please complete KYC to access trading and wallet functions.`, 403, { currentStatus: req.user.kycStatus });
    }
    next();
};
exports.requireActiveKyc = requireActiveKyc;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== enums_1.UserRole.ADMIN) {
        return (0, response_1.sendError)(res, 'Forbidden: Admin privilege required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map