import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationAsUnread,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationCount,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/mark-all-read', markAllNotificationsAsRead);
router.patch('/:id/unread', markNotificationAsUnread);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

export default router;
