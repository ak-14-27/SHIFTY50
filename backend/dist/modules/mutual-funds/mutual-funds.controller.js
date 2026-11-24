"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutualFundsController = void 0;
const mutual_funds_service_1 = require("./mutual-funds.service");
const response_1 = require("../../shared/utils/response");
class MutualFundsController {
    static async getAllFunds(req, res, next) {
        try {
            const { category, search } = req.query;
            const funds = await mutual_funds_service_1.MutualFundsService.getAllFunds(category, search);
            return (0, response_1.sendSuccess)(res, funds, 'Mutual Funds catalog retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getFundById(req, res, next) {
        try {
            const { id } = req.params;
            const fund = await mutual_funds_service_1.MutualFundsService.getFundById(id);
            return (0, response_1.sendSuccess)(res, fund, 'Mutual Fund details retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async investLumpSum(req, res, next) {
        try {
            const userId = req.user.id;
            const { fundId, amount } = req.body;
            const result = await mutual_funds_service_1.MutualFundsService.investLumpSum(userId, fundId, Number(amount));
            return (0, response_1.sendSuccess)(res, result, `₹${Number(amount).toLocaleString('en-IN')} invested in ${result.fund.name} successfully!`, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async redeem(req, res, next) {
        try {
            const userId = req.user.id;
            const { fundId, units } = req.body;
            const result = await mutual_funds_service_1.MutualFundsService.redeem(userId, fundId, Number(units));
            return (0, response_1.sendSuccess)(res, result, `Redeemed ${units} units of ${result.fund.name} successfully!`);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyHoldings(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await mutual_funds_service_1.MutualFundsService.getUserMfHoldings(userId);
            return (0, response_1.sendSuccess)(res, result, 'Mutual Fund holdings retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MutualFundsController = MutualFundsController;
//# sourceMappingURL=mutual-funds.controller.js.map