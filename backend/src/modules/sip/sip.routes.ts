import { Router } from 'express';
import { SipController } from './sip.controller';
import { authenticateJwt, requireActiveKyc } from '../../shared/middleware/auth.middleware';
import { auditLog } from '../../shared/middleware/audit.middleware';

const router = Router();

router.use(authenticateJwt, requireActiveKyc);

router.get('/', SipController.getMySips);
router.post('/create', auditLog('SIP_CREATE', 'Sip'), SipController.createSip);
router.put('/:id/status', auditLog('SIP_STATUS_UPDATE', 'Sip'), SipController.updateStatus);
router.post('/:id/trigger-now', auditLog('SIP_MANUAL_TRIGGER', 'Sip'), SipController.triggerSingleNow);
router.post('/trigger-due', auditLog('SIP_BATCH_EXECUTE', 'Sip'), SipController.triggerDueSips);

export const sipRoutes = router;
