import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(res: Response, message = 'An error occurred', statusCode = 500, error?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || undefined,
    timestamp: new Date().toISOString(),
  });
}
