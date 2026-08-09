import { Router } from 'express';
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  activateStaff,
  deactivateStaff,
  checkIn,
  checkOut,
  getAttendance,
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getPayroll,
  generatePayroll,
  updatePayrollStatus,
} from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId } from '../middleware/validateObjectId.middleware';
import {
  createStaffSchema,
  updateStaffSchema,
  attendanceCheckInSchema,
  attendanceCheckOutSchema,
  createLeaveRequestSchema,
  approveLeaveRequestSchema,
  createPayrollSchema,
  updatePayrollStatusSchema,
} from '../validators/staff.validator';

const router = Router();

router.use(authenticate);

// Staff management
router.post('/', roleMiddleware(['super_admin', 'admin', 'hr']), validate(createStaffSchema), createStaff);
router.get('/', roleMiddleware(['super_admin', 'admin', 'hr']), getStaff);
router.get('/:id', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), getStaffById);
router.patch('/:id', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), validate(updateStaffSchema), updateStaff);
router.patch('/:id/activate', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), activateStaff);
router.patch('/:id/deactivate', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), deactivateStaff);

// Attendance
router.post('/:staffId/attendance/check-in', roleMiddleware(['super_admin', 'admin', 'hr', 'doctor', 'nurse']), validateObjectId('staffId'), validate(attendanceCheckInSchema), checkIn);
router.post('/:staffId/attendance/check-out', roleMiddleware(['super_admin', 'admin', 'hr', 'doctor', 'nurse']), validateObjectId('staffId'), validate(attendanceCheckOutSchema), checkOut);
router.get('/:staffId/attendance', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('staffId'), getAttendance);

// Leave requests
router.post('/:staffId/leave-requests', roleMiddleware(['super_admin', 'admin', 'hr', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver']), validateObjectId('staffId'), validate(createLeaveRequestSchema), createLeaveRequest);
router.get('/leave-requests', roleMiddleware(['super_admin', 'admin', 'hr']), getLeaveRequests);
router.patch('/leave-requests/:id/approve', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), validate(approveLeaveRequestSchema), approveLeaveRequest);
router.patch('/leave-requests/:id/reject', roleMiddleware(['super_admin', 'admin', 'hr']), validateObjectId('id'), validate(approveLeaveRequestSchema), rejectLeaveRequest);

// Payroll
router.get('/payroll', roleMiddleware(['super_admin', 'admin', 'hr', 'accountant']), getPayroll);
router.post('/payroll/generate', roleMiddleware(['super_admin', 'admin', 'hr', 'accountant']), validate(createPayrollSchema), generatePayroll);
router.patch('/payroll/:id/status', roleMiddleware(['super_admin', 'admin', 'hr', 'accountant']), validateObjectId('id'), validate(updatePayrollStatusSchema), updatePayrollStatus);

export default router;