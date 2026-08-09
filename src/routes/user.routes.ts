import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  getUserPermissions,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId } from '../middleware/validateObjectId.middleware';
import { updateUserSchema, updatePasswordSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', roleMiddleware(['super_admin', 'admin']), getUsers);
router.get('/:id', roleMiddleware(['super_admin', 'admin']), validateObjectId('id'), getUserById);
router.patch('/:id', roleMiddleware(['super_admin', 'admin']), validateObjectId('id'), validate(updateUserSchema), updateUser);
router.delete('/:id', roleMiddleware(['super_admin', 'admin']), validateObjectId('id'), deleteUser);
router.get('/:id/permissions', roleMiddleware(['super_admin', 'admin']), validateObjectId('id'), getUserPermissions);

router.patch('/me/password', validate(updatePasswordSchema), updateUserPassword);

export default router;