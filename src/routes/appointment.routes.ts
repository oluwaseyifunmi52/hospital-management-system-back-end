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

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id', roleMiddleware(['admin', 'doctor']), updateAppointment);
router.post('/:id/cancel', roleMiddleware(['patient', 'admin', 'receptionist']), cancelAppointment);
router.post('/:id/reschedule', roleMiddleware(['patient', 'admin', 'receptionist']), rescheduleAppointment);
router.post('/:id/check-in', roleMiddleware(['receptionist', 'admin']), checkInAppointment);

export default router;
