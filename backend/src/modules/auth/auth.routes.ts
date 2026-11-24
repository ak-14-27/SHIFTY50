import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

router.post('/register', auditLog('USER_REGISTER', 'User'), AuthController.register);
router.post('/login', auditLog('USER_LOGIN', 'User'), AuthController.login);
router.post('/kyc/submit', authenticateJwt, auditLog('KYC_SUBMISSION', 'User'), AuthController.submitKyc);
router.get('/me', authenticateJwt, AuthController.getMe);

export const authRoutes = router;
