"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioController = void 0;
const portfolio_service_1 = require("./portfolio.service");
const response_1 = require("../../shared/utils/response");
class PortfolioController {
    static async getMyPortfolio(req, res, next) {
        try {
            const userId = req.user.id;
            const portfolio = await portfolio_service_1.PortfolioService.getUserPortfolio(userId);
            return (0, response_1.sendSuccess)(res, portfolio, 'User portfolio metrics and holdings retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyTrades(req, res, next) {
        try {
            const userId = req.user.id;
            const trades = await portfolio_service_1.PortfolioService.getUserTrades(userId);
            return (0, response_1.sendSuccess)(res, trades, 'User executed trade executions retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PortfolioController = PortfolioController;
//# sourceMappingURL=portfolio.controller.js.map