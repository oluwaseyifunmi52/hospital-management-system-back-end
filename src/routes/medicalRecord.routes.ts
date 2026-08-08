import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescriptionStatus,
} from '../controllers/medicalRecord.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.post('/', roleMiddleware(['doctor']), createMedicalRecord);
router.get('/', roleMiddleware(['doctor']), getMedicalRecordsByPatient);
router.get('/patient/:patientId', roleMiddleware(['doctor', 'admin']), getMedicalRecordsByPatient);
router.get('/:id', getMedicalRecordById);
router.patch('/:id', roleMiddleware(['doctor']), updateMedicalRecord);

router.post('/prescriptions', roleMiddleware(['doctor']), createPrescription);
router.get('/prescriptions/list', roleMiddleware(['patient']), getPrescriptionsByPatient);
router.get('/prescriptions/patient/:patientId', roleMiddleware(['doctor', 'admin']), getPrescriptionsByPatient);
router.get('/prescriptions/:id', getPrescriptionById);
router.patch('/prescriptions/:id/status', roleMiddleware(['pharmacist', 'doctor', 'admin']), updatePrescriptionStatus);

export default router;
