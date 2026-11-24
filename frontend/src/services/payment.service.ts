import api from './api';
import { ApiResponse, PaymentTransaction, Wallet, WalletLedgerEntry } from '../types';

export const paymentApi = {
  async processDeposit(data: { amount: number; paymentMethod: string; idempotencyKey?: string }) {
    const idempotencyKey = data.idempotencyKey || `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await api.post<
      ApiResponse<{
        isDuplicate: boolean;
        transaction: PaymentTransaction;
        wallet: Wallet;
        ledgerEntry?: WalletLedgerEntry;
        message: string;
      }>
    >('/payments/deposit', data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return res.data;
  },

  async getPaymentHistory() {
    const res = await api.get<ApiResponse<PaymentTransaction[]>>('/payments/history');
    return res.data;
  },
};
