import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

router.use(authenticateJwt, requireActiveKyc);

router.post('/deposit', auditLog('PAYMENT_DEPOSIT', 'PaymentTransaction'), PaymentController.deposit);
router.get('/history', PaymentController.getMyPayments);

export const paymentRoutes = router;
