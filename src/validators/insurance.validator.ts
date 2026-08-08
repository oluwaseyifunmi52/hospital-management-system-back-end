import { z } from 'zod';

export const createInsuranceSchema = z.object({
  name: z.string().min(1, 'Insurance name is required'),
  type: z.enum(['insurance', 'hmo']).default('insurance'),
  contactInfo: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  coverageDetails: z.string().optional(),
  deductible: z.number().min(0).default(0),
  coverageLimit: z.number().min(0).default(0),
  isActive: z.boolean().optional(),
});

export const updateInsuranceSchema = createInsuranceSchema.partial();

export const enrollPatientInsuranceSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  insuranceId: z.string().min(1, 'Insurance is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validTo: z.string().min(1, 'Valid to date is required'),
  isActive: z.boolean().optional(),
  coveredServices: z.array(z.string()).optional(),
});
