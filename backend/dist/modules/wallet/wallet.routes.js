"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoutes = void 0;
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
// All wallet routes require valid JWT auth and Active KYC
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/', wallet_controller_1.WalletController.getMyWallet);
router.get('/ledger', wallet_controller_1.WalletController.getMyLedger);
router.post('/add-funds', (0, audit_middleware_1.auditLog)('WALLET_DEPOSIT', 'Wallet'), wallet_controller_1.WalletController.addFunds);
router.post('/monthly-capital', (0, audit_middleware_1.auditLog)('MONTHLY_CAPITAL_CLAIM', 'Wallet'), wallet_controller_1.WalletController.claimMonthlyCapital);
router.post('/reserve', (0, audit_middleware_1.auditLog)('ORDER_FUNDS_RESERVE', 'Wallet'), wallet_controller_1.WalletController.reserveOrderFunds);
router.post('/release', (0, audit_middleware_1.auditLog)('ORDER_FUNDS_RELEASE', 'Wallet'), wallet_controller_1.WalletController.releaseOrderFunds);
exports.walletRoutes = router;
//# sourceMappingURL=wallet.routes.js.map