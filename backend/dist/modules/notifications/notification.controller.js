"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const response_1 = require("../../shared/utils/response");
class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await notification_service_1.NotificationService.getUserNotifications(userId);
            return (0, response_1.sendSuccess)(res, result, 'Notifications retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async markRead(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await notification_service_1.NotificationService.markAsRead(userId, id);
            return (0, response_1.sendSuccess)(res, { id }, 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllRead(req, res, next) {
        try {
            const userId = req.user.id;
            await notification_service_1.NotificationService.markAllAsRead(userId);
            return (0, response_1.sendSuccess)(res, null, 'All notifications marked as read');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map