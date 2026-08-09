import { Router } from 'express';
import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsByPatient,
  getOutstandingBills,
  recordPayment,
  getPayments,
  getPaymentById,
  refundPayment,
  generateReceipt,
  getRevenueReport,
  getPatientStatement,
} from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { validateObjectId } from '../middleware/validateObjectId.middleware';
import { createBillSchema, recordPaymentSchema } from '../validators/billing.validator';

const router = Router();

router.use(authenticate);

router.get('/bills/patient/:patientId', validateObjectId('patientId'), getBillsByPatient);
router.get('/bills/patient/:patientId/outstanding', validateObjectId('patientId'), getOutstandingBills);
router.get('/bills/patient/:patientId/statement', validateObjectId('patientId'), getPatientStatement);

router.use(roleMiddleware(['super_admin', 'admin', 'accountant']));

router.get('/bills', getBills);
router.get('/bills/:id', validateObjectId('id'), getBillById);
router.post('/bills', validate(createBillSchema), createBill);
router.patch('/bills/:id', validateObjectId('id'), updateBill);
router.delete('/bills/:id', validateObjectId('id'), deleteBill);

router.post('/bills/:billId/payments/:patientId', validateObjectId('billId'), validateObjectId('patientId'), validate(recordPaymentSchema), recordPayment);

router.get('/payments', getPayments);
router.get('/payments/:id', validateObjectId('id'), getPaymentById);
router.post('/payments/:id/refund', validateObjectId('id'), refundPayment);
router.get('/payments/:id/receipt', validateObjectId('id'), generateReceipt);

router.get('/reports/revenue', getRevenueReport);

export default router;
