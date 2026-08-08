import { Router } from 'express';
import {
  createNurseProfile,
  getMyNurseProfile,
  getAllNurses,
  getNurseById,
  deleteNurseProfile,
  recordVitalSign,
  getVitalSigns,
  getLatestVitals,
  getVitalSignById,
  updateVitalSign,
  deleteVitalSign,
} from '../controllers/nurse.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createNurseProfileSchema, updateNurseProfileSchema, createVitalSignSchema } from '../validators/nurse.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', roleMiddleware(['nurse']), getMyNurseProfile);
router.put(
  '/profile',
  roleMiddleware(['nurse']),
  validate(updateNurseProfileSchema),
  createNurseProfile
);

router.get('/vitals', roleMiddleware(['patient', 'doctor', 'nurse', 'admin']), getVitalSigns);
router.get('/vitals/latest/:patientId', roleMiddleware(['patient', 'doctor', 'nurse', 'admin']), getLatestVitals);
router.get('/vitals/:id', roleMiddleware(['nurse', 'doctor', 'admin']), getVitalSignById);
router.patch('/vitals/:id', roleMiddleware(['nurse', 'doctor']), updateVitalSign);
router.delete('/vitals/:id', roleMiddleware(['nurse', 'doctor', 'admin']), deleteVitalSign);

router.use(roleMiddleware(['super_admin', 'admin', 'doctor']));

router.get('/nurses', getAllNurses);
router.get('/nurses/:id', getNurseById);
router.delete('/nurses/:id', roleMiddleware(['super_admin', 'admin']), deleteNurseProfile);

router.use(roleMiddleware(['super_admin', 'admin', 'nurse']));

router.post('/vitals', validate(createVitalSignSchema), recordVitalSign);

export default router;
