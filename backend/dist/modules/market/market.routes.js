"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketRoutes = void 0;
const express_1 = require("express");
const market_controller_1 = require("./market.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public / Authenticated read routes
router.get('/stocks', market_controller_1.MarketController.getAllStocks);
router.get('/stocks/:symbol', market_controller_1.MarketController.getStockBySymbol);
router.get('/stocks/:symbol/history', market_controller_1.MarketController.getStockHistory);
router.post('/tick', auth_middleware_1.authenticateJwt, market_controller_1.MarketController.tickPrices);
exports.marketRoutes = router;
//# sourceMappingURL=market.routes.js.map