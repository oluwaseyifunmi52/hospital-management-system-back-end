import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getLogsByResource,
  deleteAuditLog,
  deleteAllAuditLogs,
  getActionSummary,
} from '../controllers/auditLog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(roleMiddleware(['super_admin']));

router.get('/', getAuditLogs);
router.get('/summary', getActionSummary);
router.get('/resource/:resourceType/:resourceId', getLogsByResource);
router.get('/:id', getAuditLogById);
router.delete('/', deleteAllAuditLogs);
router.delete('/:id', deleteAuditLog);

export default router;
