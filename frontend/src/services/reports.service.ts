import api from './api';
import { ApiResponse, ContractNote, TaxPnlReport, HoldingsStatement } from '../types';

export const ReportsService = {
  async getContractNote(tradeId: string): Promise<ContractNote> {
    const res = await api.get<ApiResponse<ContractNote>>(`/reports/contract-note/${tradeId}`);
    return res.data.data;
  },

  async getTaxPnlStatement(fy?: string): Promise<TaxPnlReport> {
    const res = await api.get<ApiResponse<TaxPnlReport>>('/reports/tax-pnl', {
      params: fy ? { fy } : undefined,
    });
    return res.data.data;
  },

  async getHoldingsStatement(): Promise<HoldingsStatement> {
    const res = await api.get<ApiResponse<HoldingsStatement>>('/reports/holdings-statement');
    return res.data.data;
  },
};
