import { z } from 'zod';

export const createLabTestCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateLabTestCategorySchema = createLabTestCategorySchema.partial();

export const createLabTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  code: z.string().min(1, 'Test code is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  lowerNormal: z.number().optional(),
  upperNormal: z.number().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  isActive: z.boolean().optional(),
});

export const updateLabTestSchema = createLabTestSchema.partial();

export const createLabTestRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  tests: z
    .array(
      z.object({
        testId: z.string().min(1, 'Test is required'),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one test is required'),
  priority: z.enum(['normal', 'urgent', 'stat']).default('normal'),
  notes: z.string().optional(),
  appointmentId: z.string().optional(),
  medicalRecordId: z.string().optional(),
});

export const updateLabTestRequestStatusSchema = z.object({
  status: z.enum(['requested', 'sampling', 'processing', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export const enterLabResultSchema = z.object({
  testId: z.string().min(1, 'Test is required'),
  value: z.number().optional(),
  unit: z.string().optional(),
  resultText: z.string().optional(),
  isAbnormal: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateLabResultsSchema = z.object({
  results: z.array(
    z.object({
      testId: z.string(),
      value: z.number().optional(),
      unit: z.string().optional(),
      resultText: z.string().optional(),
      isAbnormal: z.boolean().optional(),
      notes: z.string().optional(),
      performedAt: z.string().optional(),
    })
  ),
  status: z.enum(['requested', 'sampling', 'processing', 'completed', 'cancelled']).optional(),
});
