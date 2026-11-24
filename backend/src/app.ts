import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';
import { walletRoutes } from './modules/wallet/wallet.routes';
import { userRoutes } from './modules/user/user.routes';
import { marketRoutes } from './modules/market/market.routes';
import { orderRoutes } from './modules/order/order.routes';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes';
import { paymentRoutes } from './modules/payment/payment.routes';
import { mutualFundsRoutes } from './modules/mutual-funds/mutual-funds.routes';
import { sipRoutes } from './modules/sip/sip.routes';
import { reportRoutes } from './modules/reports/reports.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { AdminController } from './modules/admin/admin.controller';
import { authenticateJwt } from './shared/middleware/auth.middleware';
import { errorHandler } from './shared/middleware/error.middleware';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());

// Production Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: '$hifty50 Electronic Trading Engine',
    version: '3.0.0-PRO-FINAL',
    engineStatus: 'ONLINE',
    modules: [
      'Double-Entry Wallet Ledger',
      'KYC State Machine',
      'Price-Time Order Matching Engine',
      'Atomic Multi-Entity Trade Settlement',
      'Live Order Book Depth & Spread',
      'Holdings & Real-Time P&L Engine',
      'Idempotent Payment Gateway',
      'Mutual Funds & Automated Recurring SIP Engine',
      'Institutional Contract Notes & Tax P&L Engine',
      'In-App Notification Dispatcher',
      'Admin Oversight & Normalized Leaderboard',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Modular Monolith Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/mutual-funds', mutualFundsRoutes);
app.use('/api/v1/sip', sipRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Direct shortcut for Leaderboard
app.get('/api/v1/leaderboard', authenticateJwt, AdminController.getLeaderboard);

// Global Error Handler
app.use(errorHandler);

export default app;
