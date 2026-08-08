import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  itemType: z.enum(['medicine', 'equipment', 'supply', 'consumable']).default('supply'),
  quantity: z.number().min(0).default(0),
  unit: z.string().default('units'),
  minQuantity: z.number().min(0).default(0),
  supplier: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'discontinued']).default('active'),
  isActive: z.boolean().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const updateInventoryQuantitySchema = z.object({
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  action: z.enum(['add', 'remove', 'adjust']).default('adjust'),
  reason: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});
