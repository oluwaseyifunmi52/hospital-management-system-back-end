import { Router } from 'express';
import {
  createWard,
  getWards,
  getWardById,
  updateWard,
  deleteWard,
  getWardBeds,
  createBed,
  getBeds,
  getBedById,
  updateBed,
  deleteBed,
  createAdmission,
  getAdmissions,
  getAdmissionById,
  dischargePatient,
  transferPatient,
  getPatientAdmissions,
} from '../controllers/ward.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createWardSchema, updateWardSchema, createBedSchema, updateBedSchema, assignBedSchema } from '../validators/ward.validator';

const router = Router();

router.use(authenticate);

router.get('/wards', getWards);
router.get('/wards/:id', getWardById);
router.get('/wards/:id/beds', getWardBeds);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist']));

router.post('/wards', validate(createWardSchema), createWard);
router.patch('/wards/:id', validate(updateWardSchema), updateWard);
router.delete('/wards/:id', deleteWard);

router.get('/beds', getBeds);
router.get('/beds/:id', getBedById);
router.post('/beds', validate(createBedSchema), createBed);
router.patch('/beds/:id', validate(updateBedSchema), updateBed);
router.delete('/beds/:id', deleteBed);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist', 'doctor']));

router.post('/admissions', validate(assignBedSchema), createAdmission);
router.get('/admissions', getAdmissions);
router.get('/admissions/:id', getAdmissionById);
router.get('/patients/:patientId/admissions', getPatientAdmissions);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist']));

router.post('/admissions/:id/discharge', dischargePatient);
router.post('/admissions/:id/transfer', transferPatient);

export default router;
