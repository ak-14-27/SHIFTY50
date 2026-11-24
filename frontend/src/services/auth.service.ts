import api from './api';
import { ApiResponse, User } from '../types';

export const authApi = {
  async register(data: { email: string; password: string; fullName: string }) {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return res.data;
  },

  async submitKyc(data: { panNumber: string; aadhaarNumber: string }) {
    const res = await api.post<ApiResponse<{ user: User; wallet?: any }>>('/auth/kyc/submit', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  async getAuditLogs() {
    const res = await api.get<ApiResponse<any[]>>('/user/audit-logs');
    return res.data;
  },
};
