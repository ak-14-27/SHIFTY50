"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
// Leaderboard: Accessible by all authenticated users
router.get('/leaderboard', auth_middleware_1.authenticateJwt, admin_controller_1.AdminController.getLeaderboard);
// All subsequent admin routes require ADMIN role
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireAdmin);
router.get('/analytics', admin_controller_1.AdminController.getSystemAnalytics);
router.get('/users', admin_controller_1.AdminController.getAllUsers);
router.put('/users/:userId/kyc', (0, audit_middleware_1.auditLog)('ADMIN_KYC_REVIEW', 'User'), admin_controller_1.AdminController.reviewKyc);
router.post('/adjust-capital', (0, audit_middleware_1.auditLog)('ADMIN_CAPITAL_ADJUSTMENT', 'WalletLedger'), admin_controller_1.AdminController.adjustCapital);
router.get('/trades', admin_controller_1.AdminController.getGlobalTradeFeed);
exports.adminRoutes = router;
//# sourceMappingURL=admin.routes.js.map