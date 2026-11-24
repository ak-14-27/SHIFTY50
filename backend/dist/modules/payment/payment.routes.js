"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.post('/deposit', (0, audit_middleware_1.auditLog)('PAYMENT_DEPOSIT', 'PaymentTransaction'), payment_controller_1.PaymentController.deposit);
router.get('/history', payment_controller_1.PaymentController.getMyPayments);
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map