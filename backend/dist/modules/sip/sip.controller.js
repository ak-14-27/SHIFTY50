"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SipController = void 0;
const sip_service_1 = require("./sip.service");
const response_1 = require("../../shared/utils/response");
class SipController {
    static async createSip(req, res, next) {
        try {
            const userId = req.user.id;
            const { fundId, amount, frequency } = req.body;
            const sip = await sip_service_1.SipService.createSip(userId, fundId, Number(amount), frequency);
            return (0, response_1.sendSuccess)(res, sip, 'SIP created and initial installment executed successfully!', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMySips(req, res, next) {
        try {
            const userId = req.user.id;
            const sips = await sip_service_1.SipService.getUserSips(userId);
            return (0, response_1.sendSuccess)(res, sips, 'User SIP mandates retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { status } = req.body;
            const updated = await sip_service_1.SipService.updateSipStatus(userId, id, status);
            return (0, response_1.sendSuccess)(res, updated, `SIP status updated to ${status}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async triggerDueSips(req, res, next) {
        try {
            const result = await sip_service_1.SipService.executeDueSips();
            return (0, response_1.sendSuccess)(res, result, `Executed due SIP scheduler batch: ${result.totalProcessed} processed`);
        }
        catch (error) {
            next(error);
        }
    }
    static async triggerSingleNow(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const updated = await sip_service_1.SipService.triggerSingleSipNow(userId, id);
            return (0, response_1.sendSuccess)(res, updated, `Manual installment executed for ${updated.fund.name}!`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SipController = SipController;
//# sourceMappingURL=sip.controller.js.map