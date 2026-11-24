"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutualFundsRoutes = void 0;
const express_1 = require("express");
const mutual_funds_controller_1 = require("./mutual-funds.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
// Public / browse funds
router.get('/', mutual_funds_controller_1.MutualFundsController.getAllFunds);
router.get('/:id', mutual_funds_controller_1.MutualFundsController.getFundById);
// Investment actions require Active KYC
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/user/holdings', mutual_funds_controller_1.MutualFundsController.getMyHoldings);
router.post('/invest', (0, audit_middleware_1.auditLog)('MF_LUMPSUM_INVEST', 'MutualFundHolding'), mutual_funds_controller_1.MutualFundsController.investLumpSum);
router.post('/redeem', (0, audit_middleware_1.auditLog)('MF_REDEMPTION', 'MutualFundHolding'), mutual_funds_controller_1.MutualFundsController.redeem);
exports.mutualFundsRoutes = router;
//# sourceMappingURL=mutual-funds.routes.js.map