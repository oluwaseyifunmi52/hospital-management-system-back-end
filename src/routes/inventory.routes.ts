import { Router } from 'express';
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStock,
  getLowStockItems,
  getExpiringSoonItems,
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createInventoryItemSchema, updateInventoryItemSchema, updateInventoryQuantitySchema } from '../validators/inventory.validator';

const router = Router();

router.use(authenticate);

router.get('/', getInventoryItems);
router.get('/low-stock', getLowStockItems);
router.get('/expiring-soon', getExpiringSoonItems);
router.get('/:id', getInventoryItemById);

router.use(roleMiddleware(['super_admin', 'admin', 'pharmacist']));

router.post('/', validate(createInventoryItemSchema), createInventoryItem);
router.patch('/:id', validate(updateInventoryItemSchema), updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.patch('/:id/stock', validate(updateInventoryQuantitySchema), updateInventoryStock);

export default router;
