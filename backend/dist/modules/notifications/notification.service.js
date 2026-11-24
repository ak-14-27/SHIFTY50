"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../../shared/db/prisma");
const enums_1 = require("../../shared/types/enums");
class NotificationService {
    static async createNotification(userId, title, message, type = enums_1.NotificationType.SYSTEM_ALERT, referenceId) {
        try {
            return await prisma_1.prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    referenceId,
                    isRead: false,
                },
            });
        }
        catch (err) {
            console.error('Failed to create notification:', err.message);
            return null;
        }
    }
    static async getUserNotifications(userId, limit = 30) {
        const [notifications, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            prisma_1.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);
        return {
            notifications,
            unreadCount,
        };
    }
    static async markAsRead(userId, notificationId) {
        return await prisma_1.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }
    static async markAllAsRead(userId) {
        return await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map