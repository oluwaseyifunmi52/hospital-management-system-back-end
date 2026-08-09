import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  checkInAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validateObjectId } from '../middleware/validateObjectId.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', validateObjectId('id'), getAppointmentById);
router.patch('/:id', roleMiddleware(['admin', 'doctor']), validateObjectId('id'), updateAppointment);
router.post('/:id/cancel', roleMiddleware(['patient', 'admin', 'receptionist']), validateObjectId('id'), cancelAppointment);
router.post('/:id/reschedule', roleMiddleware(['patient', 'admin', 'receptionist']), validateObjectId('id'), rescheduleAppointment);
router.post('/:id/check-in', roleMiddleware(['receptionist', 'admin']), validateObjectId('id'), checkInAppointment);

export default router;
