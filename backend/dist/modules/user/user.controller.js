"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = require("../../shared/db/prisma");
const response_1 = require("../../shared/utils/response");
class UserController {
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    wallet: true,
                },
            });
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }
            const { passwordHash, ...safeUser } = user;
            return (0, response_1.sendSuccess)(res, safeUser, 'User profile retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyAuditLogs(req, res, next) {
        try {
            const userId = req.user.id;
            const logs = await prisma_1.prisma.auditLog.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 50,
            });
            return (0, response_1.sendSuccess)(res, logs, 'User audit trail retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUsers(req, res, next) {
        try {
            const users = await prisma_1.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    kycStatus: true,
                    role: true,
                    createdAt: true,
                    wallet: {
                        select: {
                            availableBalance: true,
                            reservedBalance: true,
                            investedBalance: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return (0, response_1.sendSuccess)(res, users, 'All platform users retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map