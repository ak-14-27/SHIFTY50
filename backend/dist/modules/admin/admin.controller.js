"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../shared/utils/response");
class AdminController {
    static async getLeaderboard(req, res, next) {
        try {
            const leaderboard = await admin_service_1.AdminService.getLeaderboard();
            return (0, response_1.sendSuccess)(res, leaderboard, 'Normalized Leaderboard calculated');
        }
        catch (error) {
            next(error);
        }
    }
    static async getSystemAnalytics(req, res, next) {
        try {
            const analytics = await admin_service_1.AdminService.getSystemAnalytics();
            return (0, response_1.sendSuccess)(res, analytics, 'Platform System Analytics retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUsers(req, res, next) {
        try {
            const users = await admin_service_1.AdminService.getAllUsersDetailed();
            return (0, response_1.sendSuccess)(res, users, 'Users retrieved for admin oversight');
        }
        catch (error) {
            next(error);
        }
    }
    static async reviewKyc(req, res, next) {
        try {
            const adminUserId = req.user.id;
            const { userId } = req.params;
            const { status } = req.body;
            if (!status) {
                throw { status: 400, message: 'KYC status is required' };
            }
            const updatedUser = await admin_service_1.AdminService.reviewKyc(adminUserId, userId, status);
            return (0, response_1.sendSuccess)(res, updatedUser, `User KYC status updated to ${status}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async adjustCapital(req, res, next) {
        try {
            const adminUserId = req.user.id;
            const { userId, amount, type, reason } = req.body;
            if (!userId || !amount || !type || !reason) {
                throw { status: 400, message: 'userId, amount, type, and reason are required' };
            }
            if (amount <= 0) {
                throw { status: 400, message: 'Amount must be greater than zero' };
            }
            if (type !== 'CREDIT' && type !== 'DEBIT') {
                throw { status: 400, message: 'Type must be CREDIT or DEBIT' };
            }
            const result = await admin_service_1.AdminService.adjustCapital(adminUserId, userId, Number(amount), type, reason);
            return (0, response_1.sendSuccess)(res, result, `Capital adjustment (${type} ₹${amount}) successful`);
        }
        catch (error) {
            next(error);
        }
    }
    static async getGlobalTradeFeed(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const trades = await admin_service_1.AdminService.getGlobalTradeFeed(limit);
            return (0, response_1.sendSuccess)(res, trades, 'Global Trade Feed retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map