import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

// Order book depth can be viewed by anyone authenticated
router.get('/depth/:symbol', authenticateJwt, OrderController.getOrderBookDepth);

// Trading actions require Active KYC
router.use(authenticateJwt, requireActiveKyc);

router.get('/my-orders', OrderController.getMyOrders);
router.post('/place', auditLog('ORDER_PLACED', 'Order'), OrderController.createOrder);
router.delete('/:orderId', auditLog('ORDER_CANCELLED', 'Order'), OrderController.cancelOrder);
router.post('/simulate-counterparty', auditLog('SIMULATE_COUNTERPARTY', 'Order'), OrderController.simulateCounterparty);

export const orderRoutes = router;
