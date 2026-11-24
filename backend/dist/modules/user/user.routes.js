"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt);
router.get('/profile', user_controller_1.UserController.getProfile);
router.get('/audit-logs', user_controller_1.UserController.getMyAuditLogs);
router.get('/admin/all', auth_middleware_1.requireAdmin, user_controller_1.UserController.getAllUsers);
exports.userRoutes = router;
//# sourceMappingURL=user.routes.js.map