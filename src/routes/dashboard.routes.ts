import { Router } from 'express';
import {
  getSuperAdminDashboard,
  getDoctorDashboard,
  getNurseDashboard,
  getReceptionistDashboard,
  getPharmacistDashboard,
  getAccountantDashboard,
  getLaboratoryDashboard,
  getRadiologyDashboard,
  getPatientPortalStats,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/super-admin', roleMiddleware(['super_admin']), getSuperAdminDashboard);
router.get('/doctor', roleMiddleware(['doctor']), getDoctorDashboard);
router.get('/nurse', roleMiddleware(['nurse']), getNurseDashboard);
router.get('/receptionist', roleMiddleware(['receptionist', 'admin']), getReceptionistDashboard);
router.get('/pharmacist', roleMiddleware(['pharmacist']), getPharmacistDashboard);
router.get('/accountant', roleMiddleware(['accountant']), getAccountantDashboard);
router.get('/laboratory', roleMiddleware(['laboratory']), getLaboratoryDashboard);
router.get('/radiology', roleMiddleware(['radiologist']), getRadiologyDashboard);
router.get('/patient', roleMiddleware(['patient']), getPatientPortalStats);

export default router;
