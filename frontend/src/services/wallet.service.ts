import api from './api';
import { ApiResponse, Wallet, WalletLedgerEntry, TransactionType } from '../types';

export interface LedgerHistoryResponse {
  entries: WalletLedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    totalEntries: number;
    totalPages: number;
  };
}

export const walletApi = {
  async getWallet() {
    const res = await api.get<ApiResponse<Wallet>>('/wallet');
    return res.data;
  },

  async getLedgerHistory(params?: { page?: number; limit?: number; type?: TransactionType }) {
    const res = await api.get<ApiResponse<LedgerHistoryResponse>>('/wallet/ledger', { params });
    return res.data;
  },

  async addFunds(data: { amount: number; paymentMethod?: string; referenceId?: string }) {
    const res = await api.post<ApiResponse<{ wallet: Wallet; ledgerEntry: WalletLedgerEntry }>>(
      '/wallet/add-funds',
      data
    );
    return res.data;
  },

  async claimMonthlyCapital() {
    const res = await api.post<ApiResponse<{ wallet: Wallet; ledgerEntry: WalletLedgerEntry }>>(
      '/wallet/monthly-capital'
    );
    return res.data;
  },

  async reserveFunds(data: { amount: number; referenceId: string; description: string }) {
    const res = await api.post<ApiResponse<{ wallet: Wallet; ledgerEntry: WalletLedgerEntry }>>(
      '/wallet/reserve',
      data
    );
    return res.data;
  },

  async releaseFunds(data: { amount: number; referenceId: string; description: string }) {
    const res = await api.post<ApiResponse<{ wallet: Wallet; ledgerEntry: WalletLedgerEntry }>>(
      '/wallet/release',
      data
    );
    return res.data;
  },
};
