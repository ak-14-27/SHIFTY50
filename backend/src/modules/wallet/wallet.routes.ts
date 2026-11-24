import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

// All wallet routes require valid JWT auth and Active KYC
router.use(authenticateJwt, requireActiveKyc);

router.get('/', WalletController.getMyWallet);
router.get('/ledger', WalletController.getMyLedger);
router.post('/add-funds', auditLog('WALLET_DEPOSIT', 'Wallet'), WalletController.addFunds);
router.post('/monthly-capital', auditLog('MONTHLY_CAPITAL_CLAIM', 'Wallet'), WalletController.claimMonthlyCapital);
router.post('/reserve', auditLog('ORDER_FUNDS_RESERVE', 'Wallet'), WalletController.reserveOrderFunds);
router.post('/release', auditLog('ORDER_FUNDS_RELEASE', 'Wallet'), WalletController.releaseOrderFunds);

export const walletRoutes = router;
