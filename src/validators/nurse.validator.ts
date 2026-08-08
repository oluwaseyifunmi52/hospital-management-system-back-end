import { z } from 'zod';

export const createNurseProfileSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  shift: z.enum(['morning', 'evening', 'night', 'rotating']).default('morning'),
  qualifications: z.array(z.string()).optional(),
  specialization: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  assignedWards: z.array(z.string()).optional(),
  isHeadNurse: z.boolean().optional(),
});

export const updateNurseProfileSchema = createNurseProfileSchema.partial();

export const createVitalSignSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  vitalType: z.enum([
    'blood_pressure',
    'temperature',
    'heart_rate',
    'respiratory_rate',
    'oxygen_saturation',
    'height',
    'weight',
    'bmi',
    'pain_level',
  ]),
  value: z.number({ required_error: 'Value is required' }),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
  appointmentId: z.string().optional(),
});

export const getVitalSignsSchema = z.object({
  patientId: z.string().optional(),
  vitalType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
