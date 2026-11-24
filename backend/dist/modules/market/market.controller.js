"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const market_service_1 = require("./market.service");
const response_1 = require("../../shared/utils/response");
class MarketController {
    static async getAllStocks(req, res, next) {
        try {
            const { search, sector } = req.query;
            const stocks = await market_service_1.MarketService.getAllStocks(search, sector);
            return (0, response_1.sendSuccess)(res, stocks, 'Market stock quotes retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getStockBySymbol(req, res, next) {
        try {
            const { symbol } = req.params;
            const stock = await market_service_1.MarketService.getStockBySymbol(symbol);
            return (0, response_1.sendSuccess)(res, stock, `Quote for ${symbol.toUpperCase()} retrieved`);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStockHistory(req, res, next) {
        try {
            const { symbol } = req.params;
            const { timeframe } = req.query;
            const history = await market_service_1.MarketService.getStockHistory(symbol, timeframe);
            return (0, response_1.sendSuccess)(res, history, `Price history for ${symbol.toUpperCase()}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async tickPrices(req, res, next) {
        try {
            const updatedStocks = await market_service_1.MarketService.tickPrices();
            return (0, response_1.sendSuccess)(res, updatedStocks, 'Market price ticks generated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MarketController = MarketController;
//# sourceMappingURL=market.controller.js.map