import api from './api';
import { ApiResponse, Holding, PortfolioSummary, Trade } from '../types';

export interface PortfolioData {
  summary: PortfolioSummary;
  holdings: Holding[];
  historicalPositions: Holding[];
}

export const portfolioApi = {
  async getMyPortfolio() {
    const res = await api.get<ApiResponse<PortfolioData>>('/portfolio');
    return res.data;
  },

  async getMyTrades() {
    const res = await api.get<ApiResponse<Trade[]>>('/portfolio/trades');
    return res.data;
  },
};
