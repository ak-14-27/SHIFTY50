"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const audit_middleware_1 = require("../../shared/middleware/audit.middleware");
const router = (0, express_1.Router)();
// Order book depth can be viewed by anyone authenticated
router.get('/depth/:symbol', auth_middleware_1.authenticateJwt, order_controller_1.OrderController.getOrderBookDepth);
// Trading actions require Active KYC
router.use(auth_middleware_1.authenticateJwt, auth_middleware_1.requireActiveKyc);
router.get('/my-orders', order_controller_1.OrderController.getMyOrders);
router.post('/place', (0, audit_middleware_1.auditLog)('ORDER_PLACED', 'Order'), order_controller_1.OrderController.createOrder);
router.delete('/:orderId', (0, audit_middleware_1.auditLog)('ORDER_CANCELLED', 'Order'), order_controller_1.OrderController.cancelOrder);
router.post('/simulate-counterparty', (0, audit_middleware_1.auditLog)('SIMULATE_COUNTERPARTY', 'Order'), order_controller_1.OrderController.simulateCounterparty);
exports.orderRoutes = router;
//# sourceMappingURL=order.routes.js.map