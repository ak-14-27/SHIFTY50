import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export function auditLog(action: string, entityName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Capture original json sender to log post-execution if successful
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Execute original response
      const result = originalJson(body);

      // Async write to audit log if request succeeded
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const entityId = req.params.id || body?.data?.id || null;

        // Clean body to not log sensitive fields like passwords
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '***';
        if (sanitizedBody.passwordHash) delete sanitizedBody.passwordHash;

        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              entityName,
              entityId,
              metadata: JSON.stringify({
                params: req.params,
                query: req.query,
                body: sanitizedBody,
                statusCode: res.statusCode,
              }),
              ipAddress,
            },
          })
          .catch((err) => {
            logger.error(`Failed to record audit log for action ${action}:`, err.message);
          });
      }

      return result;
    };

    next();
  };
}
