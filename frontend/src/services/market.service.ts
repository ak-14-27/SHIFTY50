import api from './api';
import { ApiResponse, Stock } from '../types';

export const marketApi = {
  async getStocks(search?: string, sector?: string) {
    const res = await api.get<ApiResponse<Stock[]>>('/market/stocks', {
      params: { search, sector },
    });
    return res.data;
  },

  async getStock(symbol: string) {
    const res = await api.get<ApiResponse<Stock>>(`/market/stocks/${symbol}`);
    return res.data;
  },

  async getStockHistory(symbol: string, timeframe = '1D') {
    const res = await api.get<
      ApiResponse<{
        symbol: string;
        currentPrice: number;
        previousClose: number;
        dataPoints: Array<{ time: string; price: number; high: number; low: number; volume: number }>;
      }>
    >(`/market/stocks/${symbol}/history`, { params: { timeframe } });
    return res.data;
  },

  async tickPrices() {
    const res = await api.post<ApiResponse<Stock[]>>('/market/tick');
    return res.data;
  },
};
