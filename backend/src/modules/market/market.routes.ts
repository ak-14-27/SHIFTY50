import { Router } from 'express';
import { MarketController } from './market.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public / Authenticated read routes
router.get('/stocks', MarketController.getAllStocks);
router.get('/stocks/:symbol', MarketController.getStockBySymbol);
router.get('/stocks/:symbol/history', MarketController.getStockHistory);
router.post('/tick', authenticateJwt, MarketController.tickPrices);

export const marketRoutes = router;
