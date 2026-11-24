"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sipRoutes = void 0;
const express_1 = require("express");
const sip_controller_1 = require("./sip.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/', sip_controller_1.SipController.getMySips);
router.post('/create', (0, audit_middleware_1.auditLog)('SIP_CREATE', 'Sip'), sip_controller_1.SipController.createSip);
router.put('/:id/status', (0, audit_middleware_1.auditLog)('SIP_STATUS_UPDATE', 'Sip'), sip_controller_1.SipController.updateStatus);
router.post('/:id/trigger-now', (0, audit_middleware_1.auditLog)('SIP_MANUAL_TRIGGER', 'Sip'), sip_controller_1.SipController.triggerSingleNow);
router.post('/trigger-due', (0, audit_middleware_1.auditLog)('SIP_BATCH_EXECUTE', 'Sip'), sip_controller_1.SipController.triggerDueSips);
exports.sipRoutes = router;
//# sourceMappingURL=sip.routes.js.map