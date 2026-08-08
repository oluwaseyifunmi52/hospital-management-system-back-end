import { Router } from 'express';
import {
  createLabTestCategory,
  getLabTestCategories,
  updateLabTestCategory,
  deleteLabTestCategory,
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  createLabTestRequest,
  getLabTestRequests,
  getPendingLabTestRequests,
  getLabTestRequestById,
  updateLabTestRequestStatus,
  enterLabResults,
} from '../controllers/lab.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createLabTestCategorySchema,
  createLabTestSchema,
  createLabTestRequestSchema,
  updateLabTestRequestStatusSchema,
  updateLabResultsSchema,
} from '../validators/lab.validator';

const router = Router();

router.use(authenticate);

router.get('/tests', getLabTests);
router.get('/categories', getLabTestCategories);

router.use(roleMiddleware(['super_admin', 'admin']));

router.post('/categories', validate(createLabTestCategorySchema), createLabTestCategory);
router.patch('/categories/:id', updateLabTestCategory);
router.delete('/categories/:id', deleteLabTestCategory);

router.post('/tests', validate(createLabTestSchema), createLabTest);
router.get('/tests/:id', getLabTestById);
router.patch('/tests/:id', updateLabTest);
router.delete('/tests/:id', deleteLabTest);

router.use(roleMiddleware(['super_admin', 'admin', 'doctor', 'laboratory']));

router.get('/requests/pending', getPendingLabTestRequests);
router.get('/requests', getLabTestRequests);
router.get('/requests/:id', getLabTestRequestById);

router.use(roleMiddleware(['super_admin', 'admin', 'doctor']));

router.post('/requests', validate(createLabTestRequestSchema), createLabTestRequest);

router.use(roleMiddleware(['super_admin', 'admin', 'laboratory']));

router.patch('/requests/:id/status', validate(updateLabTestRequestStatusSchema), updateLabTestRequestStatus);
router.patch('/requests/:id/results', validate(updateLabResultsSchema), enterLabResults);

export default router;
