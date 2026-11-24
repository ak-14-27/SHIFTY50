"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, next) {
    logger_1.logger.error(`Unhandled Request Error [${req.method} ${req.originalUrl}]:`, err);
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        const combinedMessage = formattedErrors.map((e) => e.message).join('. ');
        return (0, response_1.sendError)(res, combinedMessage || 'Validation failed for input data', 400, formattedErrors);
    }
    if (err.name === 'UnauthorizedError' || err.status === 401) {
        return (0, response_1.sendError)(res, err.message || 'Unauthorized access', 401);
    }
    if (err.code === 'P2002') {
        return (0, response_1.sendError)(res, 'A unique constraint violation occurred in the database', 409, {
            target: err.meta?.target,
        });
    }
    return (0, response_1.sendError)(res, err.message || 'Internal server error occurred', err.status || 500);
}
//# sourceMappingURL=error.middleware.js.map