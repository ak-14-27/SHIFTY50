"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioRoutes = void 0;
const express_1 = require("express");
const portfolio_controller_1 = require("./portfolio.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/', portfolio_controller_1.PortfolioController.getMyPortfolio);
router.get('/trades', portfolio_controller_1.PortfolioController.getMyTrades);
exports.portfolioRoutes = router;
//# sourceMappingURL=portfolio.routes.js.map