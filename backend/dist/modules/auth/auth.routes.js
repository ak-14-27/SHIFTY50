"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
router.post('/register', (0, audit_middleware_1.auditLog)('USER_REGISTER', 'User'), auth_controller_1.AuthController.register);
router.post('/login', (0, audit_middleware_1.auditLog)('USER_LOGIN', 'User'), auth_controller_1.AuthController.login);
router.post('/kyc/submit', auth_middleware_1.authenticateJwt, (0, audit_middleware_1.auditLog)('KYC_SUBMISSION', 'User'), auth_controller_1.AuthController.submitKyc);
router.get('/me', auth_middleware_1.authenticateJwt, auth_controller_1.AuthController.getMe);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map