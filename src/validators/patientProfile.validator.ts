import { z } from 'zod';

export const createPatientProfileSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, 'Emergency contact name is required'),
      phone: z.string().min(1, 'Emergency contact phone is required'),
      relationship: z.string().min(1, 'Relationship is required'),
    })
    .optional(),
  nextOfKin: z
    .object({
      name: z.string().min(1, 'Next of kin name is required'),
      phone: z.string().min(1, 'Next of kin phone is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      address: z.string().optional(),
    })
    .optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  genotype: z.enum(['AA', 'AS', 'SS', 'SC', 'AC', 'CC']).optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z
    .array(
      z.object({
        condition: z.string(),
        diagnosedDate: z.string().optional(),
        notes: z.string().optional(),
        isChronic: z.boolean().default(false),
      })
    )
    .optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  medicalConditions: z.array(z.string()).optional(),
  surgicalHistory: z.array(z.string()).optional(),
  familyHistory: z.array(z.string()).optional(),
  socialHistory: z.string().optional(),
  maritalStatus: z
    .enum(['single', 'married', 'divorced', 'widowed', 'other'])
    .default('single'),
  occupation: z.string().optional(),
  religion: z.string().optional(),
});

export const updatePatientProfileSchema = createPatientProfileSchema.partial();
