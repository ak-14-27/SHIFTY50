import { Router } from 'express';
import { MutualFundsController } from './mutual-funds.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

// Public / browse funds
router.get('/', MutualFundsController.getAllFunds);
router.get('/:id', MutualFundsController.getFundById);

// Investment actions require Active KYC
router.use(authenticateJwt, requireActiveKyc);
router.get('/user/holdings', MutualFundsController.getMyHoldings);
router.post('/invest', auditLog('MF_LUMPSUM_INVEST', 'MutualFundHolding'), MutualFundsController.investLumpSum);
router.post('/redeem', auditLog('MF_REDEMPTION', 'MutualFundHolding'), MutualFundsController.redeem);

export const mutualFundsRoutes = router;
