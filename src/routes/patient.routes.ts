import { Router } from 'express';
import {
  getPatientAppointments,
  createAppointment,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getAllPatients,
} from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAppointmentSchema } from '../validators/appointment.validator';

const router = Router();

router.use(authenticate);

router.get('/', roleMiddleware(['admin', 'doctor']), getAllPatients);
router.get('/appointments', roleMiddleware(['patient']), getPatientAppointments);
router.post(
  '/appointments',
  roleMiddleware(['patient']),
  validate(createAppointmentSchema),
  createAppointment
);
router.get('/medical-records', roleMiddleware(['patient']), getPatientMedicalRecords);
router.get('/prescriptions', roleMiddleware(['patient']), getPatientPrescriptions);

export default router;
