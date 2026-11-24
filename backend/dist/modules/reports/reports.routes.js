"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRoutes = void 0;
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/contract-note/:tradeId', reports_controller_1.ReportsController.getContractNote);
router.get('/tax-pnl', reports_controller_1.ReportsController.getTaxPnlStatement);
router.get('/holdings-statement', reports_controller_1.ReportsController.getHoldingsStatement);
exports.reportRoutes = router;
//# sourceMappingURL=reports.routes.js.map