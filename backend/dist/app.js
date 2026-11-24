"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const wallet_routes_1 = require("./modules/wallet/wallet.routes");
const user_routes_1 = require("./modules/user/user.routes");
const market_routes_1 = require("./modules/market/market.routes");
const order_routes_1 = require("./modules/order/order.routes");
const portfolio_routes_1 = require("./modules/portfolio/portfolio.routes");
const payment_routes_1 = require("./modules/payment/payment.routes");
const mutual_funds_routes_1 = require("./modules/mutual-funds/mutual-funds.routes");
const sip_routes_1 = require("./modules/sip/sip.routes");
const reports_routes_1 = require("./modules/reports/reports.routes");
const notification_routes_1 = require("./modules/notifications/notification.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const admin_controller_1 = require("./modules/admin/admin.controller");
const auth_middleware_1 = require("./shared/middleware/auth.middleware");
const error_middleware_1 = require("./shared/middleware/error.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json());
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
app.use('/api/v1/auth', auth_routes_1.authRoutes);
app.use('/api/v1/wallet', wallet_routes_1.walletRoutes);
app.use('/api/v1/user', user_routes_1.userRoutes);
app.use('/api/v1/market', market_routes_1.marketRoutes);
app.use('/api/v1/orders', order_routes_1.orderRoutes);
app.use('/api/v1/portfolio', portfolio_routes_1.portfolioRoutes);
app.use('/api/v1/payments', payment_routes_1.paymentRoutes);
app.use('/api/v1/mutual-funds', mutual_funds_routes_1.mutualFundsRoutes);
app.use('/api/v1/sip', sip_routes_1.sipRoutes);
app.use('/api/v1/reports', reports_routes_1.reportRoutes);
app.use('/api/v1/notifications', notification_routes_1.notificationRoutes);
app.use('/api/v1/admin', admin_routes_1.adminRoutes);
// Direct shortcut for Leaderboard
app.get('/api/v1/leaderboard', auth_middleware_1.authenticateJwt, admin_controller_1.AdminController.getLeaderboard);
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map