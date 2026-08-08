import { Router } from 'express';
import {
  createPatientProfile,
  getMyProfile,
  getPatientProfileById,
  getAllPatientProfiles,
  updatePatientProfile,
  createInsurance,
  getInsurances,
  getInsuranceById,
  updateInsurance,
  deleteInsurance,
  enrollPatientInsurance,
  getPatientInsurances,
  getPatientInsuranceById,
  updatePatientInsurance,
} from '../controllers/patientProfile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPatientProfileSchema, updatePatientProfileSchema } from '../validators/patientProfile.validator';
import { createInsuranceSchema, updateInsuranceSchema, enrollPatientInsuranceSchema } from '../validators/insurance.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', roleMiddleware(['patient']), getMyProfile);
router.patch('/profile', roleMiddleware(['patient']), validate(updatePatientProfileSchema), updatePatientProfile);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist', 'doctor']));

router.post('/profile', validate(createPatientProfileSchema), createPatientProfile);
router.get('/', getAllPatientProfiles);
router.get('/:patientId', getPatientProfileById);

router.post('/insurances', validate(createInsuranceSchema), createInsurance);
router.get('/insurances', getInsurances);
router.get('/insurances/:id', getInsuranceById);
router.patch('/insurances/:id', validate(updateInsuranceSchema), updateInsurance);
router.delete('/insurances/:id', deleteInsurance);

router.post('/insurances/enroll', validate(enrollPatientInsuranceSchema), enrollPatientInsurance);
router.get('/patients/:patientId/insurances', getPatientInsurances);
router.get('/patient-insurances/:id', getPatientInsuranceById);
router.patch('/patient-insurances/:id', updatePatientInsurance);

export default router;
