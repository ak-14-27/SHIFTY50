import api from './api';
import { ApiResponse, Order, OrderBookDepth } from '../types';

export const orderApi = {
  async placeOrder(data: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType?: 'LIMIT' | 'MARKET' | 'STOP_LOSS';
    quantity: number;
    price?: number;
  }) {
    const res = await api.post<ApiResponse<{ order: Order; matchResult: any }>>('/orders/place', data);
    return res.data;
  },

  async cancelOrder(orderId: string) {
    const res = await api.delete<ApiResponse<Order>>(`/orders/${orderId}`);
    return res.data;
  },

  async getOrderBookDepth(symbol: string) {
    const res = await api.get<ApiResponse<OrderBookDepth>>(`/orders/depth/${symbol}`);
    return res.data;
  },

  async getMyOrders(symbol?: string) {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my-orders', {
      params: { symbol },
    });
    return res.data;
  },

  async simulateCounterparty(data: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price?: number;
  }) {
    const res = await api.post<ApiResponse<any>>('/orders/simulate-counterparty', data);
    return res.data;
  },
};
