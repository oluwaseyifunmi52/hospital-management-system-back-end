import { Router } from 'express';
import {
  createRadiologyTest,
  getRadiologyTests,
  getRadiologyTestById,
  updateRadiologyTest,
  deleteRadiologyTest,
  createRadiologyRequest,
  getRadiologyRequests,
  getPendingRadiologyRequests,
  getRadiologyRequestById,
  updateRadiologyRequestStatus,
  enterRadiologyResult,
} from '../controllers/radiology.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRadiologyTestSchema,
  updateRadiologyTestSchema,
  createRadiologyRequestSchema,
  updateRadiologyRequestStatusSchema,
  enterRadiologyResultSchema,
} from '../validators/radiology.validator';

const router = Router();

router.use(authenticate);

router.get('/tests', getRadiologyTests);

router.use(roleMiddleware(['super_admin', 'admin']));

router.post('/tests', validate(createRadiologyTestSchema), createRadiologyTest);
router.get('/tests/:id', getRadiologyTestById);
router.patch('/tests/:id', validate(updateRadiologyTestSchema), updateRadiologyTest);
router.delete('/tests/:id', deleteRadiologyTest);

router.use(roleMiddleware(['super_admin', 'admin', 'doctor', 'radiologist']));

router.get('/requests/pending', getPendingRadiologyRequests);
router.get('/requests', getRadiologyRequests);
router.get('/requests/:id', getRadiologyRequestById);

router.use(roleMiddleware(['super_admin', 'admin', 'doctor']));

router.post('/requests', validate(createRadiologyRequestSchema), createRadiologyRequest);

router.use(roleMiddleware(['super_admin', 'admin', 'radiologist']));

router.patch('/requests/:id/status', validate(updateRadiologyRequestStatusSchema), updateRadiologyRequestStatus);
router.patch('/requests/:id/results', validate(enterRadiologyResultSchema), enterRadiologyResult);

export default router;
