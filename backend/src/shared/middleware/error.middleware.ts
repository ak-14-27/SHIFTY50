import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Unhandled Request Error [${req.method} ${req.originalUrl}]:`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    const combinedMessage = formattedErrors.map((e) => e.message).join('. ');
    return sendError(res, combinedMessage || 'Validation failed for input data', 400, formattedErrors);
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return sendError(res, err.message || 'Unauthorized access', 401);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A unique constraint violation occurred in the database', 409, {
      target: err.meta?.target,
    });
  }

  return sendError(
    res,
    err.message || 'Internal server error occurred',
    err.status || 500
  );
}
