import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', NotificationController.getMyNotifications);
router.put('/:id/read', NotificationController.markRead);
router.put('/read-all', NotificationController.markAllRead);

export const notificationRoutes = router;
