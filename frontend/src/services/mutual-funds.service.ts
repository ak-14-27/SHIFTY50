import api from './api';
import { ApiResponse, MutualFund, MutualFundHolding } from '../types';

export const MutualFundsService = {
  async getAllFunds(category?: string): Promise<MutualFund[]> {
    const res = await api.get<ApiResponse<MutualFund[]>>('/mutual-funds', {
      params: category ? { category } : undefined,
    });
    return res.data.data;
  },

  async getFundById(id: string): Promise<MutualFund> {
    const res = await api.get<ApiResponse<MutualFund>>(`/mutual-funds/${id}`);
    return res.data.data;
  },

  async getMyHoldings(): Promise<MutualFundHolding[]> {
    const res = await api.get<ApiResponse<any>>('/mutual-funds/user/holdings');
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.holdings)) {
      return data.holdings;
    }
    return [];
  },

  async investLumpSum(fundId: string, amount: number): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/mutual-funds/invest', {
      fundId,
      amount,
    });
    return res.data.data;
  },

  async redeem(fundId: string, units: number): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/mutual-funds/redeem', {
      fundId,
      units,
    });
    return res.data.data;
  },
};
