import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateJwt, requireAdmin } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

// Leaderboard: Accessible by all authenticated users
router.get('/leaderboard', authenticateJwt, AdminController.getLeaderboard);

// All subsequent admin routes require ADMIN role
router.use(authenticateJwt, requireAdmin);

router.get('/analytics', AdminController.getSystemAnalytics);
router.get('/users', AdminController.getAllUsers);
router.put(
  '/users/:userId/kyc',
  auditLog('ADMIN_KYC_REVIEW', 'User'),
  AdminController.reviewKyc
);
router.post(
  '/adjust-capital',
  auditLog('ADMIN_CAPITAL_ADJUSTMENT', 'WalletLedger'),
  AdminController.adjustCapital
);
router.get('/trades', AdminController.getGlobalTradeFeed);

export const adminRoutes = router;
