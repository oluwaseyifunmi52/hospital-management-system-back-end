import { Router } from 'express';
import {
  getStaffRequests,
  getStaffRequestById,
  approveStaffRequest,
  rejectStaffRequest,
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserActive,
  deleteUser,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(roleMiddleware(['admin']));

router.get('/staff-requests', getStaffRequests);
router.get('/staff-requests/:id', getStaffRequestById);
router.patch('/staff-requests/:id/approve', approveStaffRequest);
router.patch('/staff-requests/:id/reject', rejectStaffRequest);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

export default router;
