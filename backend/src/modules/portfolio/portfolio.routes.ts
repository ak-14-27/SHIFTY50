import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt, requireActiveKyc);

router.get('/', PortfolioController.getMyPortfolio);
router.get('/trades', PortfolioController.getMyTrades);

export const portfolioRoutes = router;
