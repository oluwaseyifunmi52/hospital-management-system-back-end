import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentStaff,
} from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';

const router = Router();

router.use(authenticate);
router.use(roleMiddleware(['super_admin', 'admin']));

router.post('/', validate(createDepartmentSchema), createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.patch('/:id', validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', deleteDepartment);
router.get('/:id/staff', getDepartmentStaff);

export default router;