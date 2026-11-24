import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateJwt, requireAdmin } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', UserController.getProfile);
router.get('/audit-logs', UserController.getMyAuditLogs);
router.get('/admin/all', requireAdmin, UserController.getAllUsers);

export const userRoutes = router;
