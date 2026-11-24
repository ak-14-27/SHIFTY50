import { z } from 'zod';

export const createOrderSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required').toUpperCase(),
  side: z.enum(['BUY', 'SELL']),
  orderType: z.enum(['LIMIT', 'MARKET', 'STOP_LOSS']).default('LIMIT'),
  quantity: z.number().int().positive('Quantity must be an integer greater than 0'),
  price: z.number().positive('Price must be greater than zero').optional(),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order UUID'),
});

export const counterpartySimSchema = z.object({
  symbol: z.string().toUpperCase(),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive().default(10),
  price: z.number().positive().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
