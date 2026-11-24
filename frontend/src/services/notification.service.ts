import api from './api';
import { ApiResponse, NotificationItem } from '../types';

export const NotificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<ApiResponse<any>>('/notifications');
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.notifications)) {
      return data.notifications;
    }
    return [];
  },

  async markRead(id: string): Promise<NotificationItem> {
    const res = await api.put<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllRead(): Promise<{ count: number }> {
    const res = await api.put<ApiResponse<{ count: number }>>('/notifications/read-all');
    return res.data.data;
  },
};
