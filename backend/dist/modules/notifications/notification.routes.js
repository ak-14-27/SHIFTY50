"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt);
router.get('/', notification_controller_1.NotificationController.getMyNotifications);
router.put('/:id/read', notification_controller_1.NotificationController.markRead);
router.put('/read-all', notification_controller_1.NotificationController.markAllRead);
exports.notificationRoutes = router;
//# sourceMappingURL=notification.routes.js.map