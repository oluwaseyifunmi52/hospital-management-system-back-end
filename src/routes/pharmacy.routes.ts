import { Router } from 'express';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  updateMedicineStock,
  getLowStockMedicines,
  getExpiringSoonMedicines,
  createPharmacySale,
  getPharmacySales,
  getPharmacySaleById,
} from '../controllers/pharmacy.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createMedicineSchema, updateMedicineSchema, createPharmacySaleSchema, updateInventoryStockSchema } from '../validators/pharmacy.validator';

const router = Router();

router.use(authenticate);

router.get('/low-stock', getLowStockMedicines);
router.get('/expiring-soon', getExpiringSoonMedicines);
router.get('/sales', getPharmacySales);
router.get('/sales/:id', getPharmacySaleById);

router.use(roleMiddleware(['super_admin', 'admin', 'pharmacist']));

router.post('/', validate(createMedicineSchema), createMedicine);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.patch('/:id', validate(updateMedicineSchema), updateMedicine);
router.delete('/:id', deleteMedicine);
router.patch('/:id/stock', validate(updateInventoryStockSchema), updateMedicineStock);

router.post('/sales', roleMiddleware(['super_admin', 'admin', 'pharmacist']), validate(createPharmacySaleSchema), createPharmacySale);

export default router;
