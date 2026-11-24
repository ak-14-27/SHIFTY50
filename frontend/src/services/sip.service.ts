import api from './api';
import { ApiResponse, Sip } from '../types';

export const SipService = {
  async getMySips(): Promise<Sip[]> {
    const res = await api.get<ApiResponse<Sip[]>>('/sip');
    return res.data.data;
  },

  async createSip(fundId: string, amount: number, frequency: string): Promise<Sip> {
    const res = await api.post<ApiResponse<Sip>>('/sip/create', {
      fundId,
      amount,
      frequency,
    });
    return res.data.data;
  },

  async updateSipStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'): Promise<Sip> {
    const res = await api.put<ApiResponse<Sip>>(`/sip/${id}/status`, { status });
    return res.data.data;
  },

  async triggerSingleSipNow(id: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/sip/${id}/trigger-now`);
    return res.data.data;
  },
};
