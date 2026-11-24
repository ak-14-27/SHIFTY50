import { z } from 'zod';

export const addFundsSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Deposit amount must be greater than zero')
    .max(10000000, 'Single deposit cannot exceed ₹1,00,00,000'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'VIRTUAL_TOPUP']).default('VIRTUAL_TOPUP'),
  referenceId: z.string().optional(),
});

export const reserveFundsSchema = z.object({
  amount: z.number().positive('Reserve amount must be positive'),
  referenceId: z.string().min(1, 'Reference ID (e.g. Order ID) is required'),
  description: z.string().min(1, 'Description is required'),
});

export const releaseFundsSchema = z.object({
  amount: z.number().positive('Release amount must be positive'),
  referenceId: z.string().min(1, 'Reference ID is required'),
  description: z.string().min(1, 'Description is required'),
});

export type AddFundsInput = z.infer<typeof addFundsSchema>;
export type ReserveFundsInput = z.infer<typeof reserveFundsSchema>;
export type ReleaseFundsInput = z.infer<typeof releaseFundsSchema>;
