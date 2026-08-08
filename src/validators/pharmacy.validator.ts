import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  description: z.string().optional(),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().min(1, 'Strength is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().default('tablet'),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  supplier: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  minStockLevel: z.number().min(0).default(10),
  currentStock: z.number().min(0).default(0),
  isActive: z.boolean().optional(),
});

export const updateMedicineSchema = createMedicineSchema.partial();

export const createPharmacySaleSchema = z.object({
  patientId: z.string().optional(),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1, 'Medicine is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0),
        totalPrice: z.number().min(0),
      })
    )
    .min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paymentMethod: z
    .enum(['cash', 'card', 'insurance', 'mobile_money', 'bank_transfer'])
    .default('cash'),
  prescriptionId: z.string().optional(),
  insuranceId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInventoryStockSchema = z.object({
  medicineId: z.string().min(1, 'Medicine is required'),
  quantity: z.number().min(0),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  action: z.enum(['add', 'remove', 'adjust']).default('add'),
  reason: z.string().optional(),
});
