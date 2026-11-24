"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./shared/utils/logger");
const PORT = process.env.PORT || 5000;
const server = app_1.default.listen(PORT, () => {
    logger_1.logger.info(`=======================================================`);
    logger_1.logger.info(`🚀 $hifty50 Backend Server running on port ${PORT}`);
    logger_1.logger.info(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    logger_1.logger.info(`💼 Modular Monolith - Evaluation 1 Engine Active`);
    logger_1.logger.info(`=======================================================`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received. Gracefully shutting down HTTP server...');
    server.close(() => {
        logger_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map