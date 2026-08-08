import { Router } from 'express';
import {
  getProfile,
  upsertProfile,
  updateAvailability,
  getDoctorAppointments,
  getDoctorPatients,
  getAllDoctors,
} from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { doctorProfileSchema, updateAvailabilitySchema } from '../validators/doctor.validator';

const router = Router();

// Public routes
router.get('/public', authenticate, getAllDoctors);

// Doctor-specific routes
router.get('/profile', authenticate, roleMiddleware(['doctor']), getProfile);
router.put(
  '/profile',
  authenticate,
  roleMiddleware(['doctor']),
  validate(doctorProfileSchema),
  upsertProfile
);
router.patch(
  '/profile/availability',
  authenticate,
  roleMiddleware(['doctor']),
  validate(updateAvailabilitySchema),
  updateAvailability
);
router.get(
  '/appointments',
  authenticate,
  roleMiddleware(['doctor']),
  getDoctorAppointments
);
router.get('/patients', authenticate, roleMiddleware(['doctor']), getDoctorPatients);

export default router;
