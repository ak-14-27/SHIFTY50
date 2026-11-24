"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const wallet_service_1 = require("./wallet.service");
const wallet_validation_1 = require("./wallet.validation");
const response_1 = require("../../shared/utils/response");
const enums_1 = require("../../shared/types/enums");
class WalletController {
    static async getMyWallet(req, res, next) {
        try {
            const userId = req.user.id;
            const wallet = await wallet_service_1.WalletService.getWalletByUserId(userId);
            return (0, response_1.sendSuccess)(res, wallet, 'Wallet details retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyLedger(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit, type } = req.query;
            const result = await wallet_service_1.WalletService.getLedgerHistory(userId, {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                type: type ? type : undefined,
            });
            return (0, response_1.sendSuccess)(res, result, 'Ledger transaction history retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async addFunds(req, res, next) {
        try {
            const validated = wallet_validation_1.addFundsSchema.parse(req.body);
            const userId = req.user.id;
            const refId = validated.referenceId || `PAY_MOCK_${Date.now()}`;
            const description = `Simulated ${validated.paymentMethod} Deposit`;
            const result = await wallet_service_1.WalletService.creditWallet(userId, validated.amount, refId, description, enums_1.TransactionType.FUNDS_ADDED);
            return (0, response_1.sendSuccess)(res, result, `₹${validated.amount.toLocaleString('en-IN')} deposited successfully to virtual wallet`);
        }
        catch (error) {
            next(error);
        }
    }
    static async claimMonthlyCapital(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await wallet_service_1.WalletService.claimMonthlyCapital(userId);
            return (0, response_1.sendSuccess)(res, result, 'Monthly Virtual Capital of ₹1,00,000 credited to your wallet!');
        }
        catch (error) {
            next(error);
        }
    }
    static async reserveOrderFunds(req, res, next) {
        try {
            const validated = wallet_validation_1.reserveFundsSchema.parse(req.body);
            const userId = req.user.id;
            const result = await wallet_service_1.WalletService.reserveFunds(userId, validated.amount, validated.referenceId, validated.description);
            return (0, response_1.sendSuccess)(res, result, `₹${validated.amount.toFixed(2)} reserved for order`);
        }
        catch (error) {
            next(error);
        }
    }
    static async releaseOrderFunds(req, res, next) {
        try {
            const validated = wallet_validation_1.releaseFundsSchema.parse(req.body);
            const userId = req.user.id;
            const result = await wallet_service_1.WalletService.releaseFunds(userId, validated.amount, validated.referenceId, validated.description);
            return (0, response_1.sendSuccess)(res, result, `₹${validated.amount.toFixed(2)} released back to available balance`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WalletController = WalletController;
//# sourceMappingURL=wallet.controller.js.map