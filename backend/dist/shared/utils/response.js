"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
}
function sendError(res, message = 'An error occurred', statusCode = 500, error) {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error || undefined,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=response.js.map