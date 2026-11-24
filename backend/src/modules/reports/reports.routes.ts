import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt, requireActiveKyc);

router.get('/contract-note/:tradeId', ReportsController.getContractNote);
router.get('/tax-pnl', ReportsController.getTaxPnlStatement);
router.get('/holdings-statement', ReportsController.getHoldingsStatement);

export const reportRoutes = router;
