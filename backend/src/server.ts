import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './shared/utils/logger';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 $hifty50 Backend Server running on port ${PORT}`);
  logger.info(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`💼 Modular Monolith - Evaluation 1 Engine Active`);
  logger.info(`=======================================================`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Gracefully shutting down HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
