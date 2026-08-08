import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  createServiceItem,
  getServices,
  getServiceById,
  updateServiceItem,
  deleteServiceItem,
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema, createServiceSchema, updateServiceSchema } from '../validators/department.validator';

const router = Router();

router.use(authenticate);

router.get('/departments', getDepartments);
router.get('/departments/:id', getDepartmentById);

router.use(roleMiddleware(['super_admin', 'admin']));

router.post('/departments', validate(createDepartmentSchema), createDepartment);
router.patch('/departments/:id', validate(updateDepartmentSchema), updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.post('/services', validate(createServiceSchema), createServiceItem);
router.patch('/services/:id', validate(updateServiceSchema), updateServiceItem);
router.delete('/services/:id', deleteServiceItem);

export default router;
