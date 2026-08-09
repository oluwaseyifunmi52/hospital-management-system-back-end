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
import { validateObjectId } from '../middleware/validateObjectId.middleware';
import { createWardSchema, updateWardSchema, createBedSchema, updateBedSchema, assignBedSchema } from '../validators/ward.validator';

const router = Router();

router.use(authenticate);

router.get('/wards', getWards);
router.get('/wards/:id', validateObjectId('id'), getWardById);
router.get('/wards/:id/beds', validateObjectId('id'), getWardBeds);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist']));

router.post('/wards', validate(createWardSchema), createWard);
router.patch('/wards/:id', validateObjectId('id'), validate(updateWardSchema), updateWard);
router.delete('/wards/:id', validateObjectId('id'), deleteWard);

router.get('/beds', getBeds);
router.get('/beds/:id', validateObjectId('id'), getBedById);
router.post('/beds', validate(createBedSchema), createBed);
router.patch('/beds/:id', validateObjectId('id'), validate(updateBedSchema), updateBed);
router.delete('/beds/:id', validateObjectId('id'), deleteBed);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist', 'doctor']));

router.post('/admissions', validate(assignBedSchema), createAdmission);
router.get('/admissions', getAdmissions);
router.get('/admissions/:id', validateObjectId('id'), getAdmissionById);
router.get('/patients/:patientId/admissions', validateObjectId('patientId'), getPatientAdmissions);

router.use(roleMiddleware(['super_admin', 'admin', 'receptionist']));

router.post('/admissions/:id/discharge', validateObjectId('id'), dischargePatient);
router.post('/admissions/:id/transfer', validateObjectId('id'), transferPatient);

export default router;
