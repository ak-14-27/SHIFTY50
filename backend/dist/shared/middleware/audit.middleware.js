"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const prisma_1 = require("../db/prisma");
const logger_1 = require("../utils/logger");
function auditLog(action, entityName) {
    return async (req, res, next) => {
        // Capture original json sender to log post-execution if successful
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Execute original response
            const result = originalJson(body);
            // Async write to audit log if request succeeded
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user?.id || null;
                const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
                const entityId = req.params.id || body?.data?.id || null;
                // Clean body to not log sensitive fields like passwords
                const sanitizedBody = { ...req.body };
                if (sanitizedBody.password)
                    sanitizedBody.password = '***';
                if (sanitizedBody.passwordHash)
                    delete sanitizedBody.passwordHash;
                prisma_1.prisma.auditLog
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
                    logger_1.logger.error(`Failed to record audit log for action ${action}:`, err.message);
                });
            }
            return result;
        };
        next();
    };
}
//# sourceMappingURL=audit.middleware.js.map