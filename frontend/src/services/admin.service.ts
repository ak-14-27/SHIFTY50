import api from './api';
import { ApiResponse, LeaderboardEntry, SystemAnalytics } from '../types';

export const AdminService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await api.get<ApiResponse<any>>('/leaderboard');
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.leaderboard)) return data.leaderboard;
    return [];
  },

  async getSystemAnalytics(): Promise<SystemAnalytics> {
    const res = await api.get<ApiResponse<SystemAnalytics>>('/admin/analytics');
    return res.data.data;
  },

  async getAllUsers(): Promise<any[]> {
    const res = await api.get<ApiResponse<any>>('/admin/users');
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.users)) return data.users;
    return [];
  },

  async reviewKyc(userId: string, status: string): Promise<any> {
    const res = await api.put<ApiResponse<any>>(`/admin/users/${userId}/kyc`, { status });
    return res.data.data;
  },

  async adjustCapital(
    userId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    reason: string
  ): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/admin/adjust-capital', {
      userId,
      amount,
      type,
      reason,
    });
    return res.data.data;
  },

  async getGlobalTradeFeed(limit?: number): Promise<any[]> {
    const res = await api.get<ApiResponse<any>>('/admin/trades', {
      params: limit ? { limit } : undefined,
    });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.trades)) return data.trades;
    return [];
  },
};
