"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../shared/utils/response");
class ReportsController {
    static async getContractNote(req, res, next) {
        try {
            const userId = req.user.id;
            const { tradeId } = req.params;
            const note = await reports_service_1.ReportsService.getContractNote(userId, tradeId);
            return (0, response_1.sendSuccess)(res, note, 'Contract Note retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getTaxPnlStatement(req, res, next) {
        try {
            const userId = req.user.id;
            const { fy } = req.query;
            const statement = await reports_service_1.ReportsService.getTaxPnlStatement(userId, fy);
            return (0, response_1.sendSuccess)(res, statement, 'Tax P&L Statement retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getHoldingsStatement(req, res, next) {
        try {
            const userId = req.user.id;
            const statement = await reports_service_1.ReportsService.getHoldingsStatement(userId);
            return (0, response_1.sendSuccess)(res, statement, 'Consolidated Holdings Statement retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportsController = ReportsController;
//# sourceMappingURL=reports.controller.js.map