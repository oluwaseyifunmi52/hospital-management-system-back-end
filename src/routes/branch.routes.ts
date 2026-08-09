import { Router } from 'express';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBranchSchema, updateBranchSchema } from '../validators/branch.validator';

const router = Router();

router.use(authenticate);
router.use(roleMiddleware(['super_admin', 'admin']));

router.post('/', validate(createBranchSchema), createBranch);
router.get('/', getBranches);
router.get('/:id', getBranchById);
router.patch('/:id', validate(updateBranchSchema), updateBranch);
router.delete('/:id', deleteBranch);

export default router;