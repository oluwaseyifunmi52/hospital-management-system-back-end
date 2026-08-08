import { z } from 'zod';

export const createRadiologyTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  code: z.string().min(1, 'Test code is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  bodyPart: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  isActive: z.boolean().optional(),
});

export const updateRadiologyTestSchema = createRadiologyTestSchema.partial();

export const createRadiologyRequestSchema = z.object({
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

export const updateRadiologyRequestStatusSchema = z.object({
  status: z.enum(['requested', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export const enterRadiologyResultSchema = z.object({
  testId: z.string().min(1, 'Test is required'),
  findings: z.string().optional(),
  impression: z.string().optional(),
  reportFile: z.string().optional(),
  isNormal: z.boolean().optional(),
  notes: z.string().optional(),
  performedAt: z.string().optional(),
});
