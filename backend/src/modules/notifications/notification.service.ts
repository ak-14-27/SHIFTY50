import { prisma } from '../../shared/db/prisma';
import { NotificationType } from '../../shared/types/enums';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType | string = NotificationType.SYSTEM_ALERT,
    referenceId?: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          referenceId,
          isRead: false,
        },
      });
    } catch (err: any) {
      console.error('Failed to create notification:', err.message);
      return null;
    }
  }

  static async getUserNotifications(userId: string, limit = 30) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(userId: string, notificationId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
