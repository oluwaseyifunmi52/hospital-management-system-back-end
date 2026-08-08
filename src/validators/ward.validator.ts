import { z } from 'zod';

export const createWardSchema = z.object({
  name: z.string().min(1, 'Ward name is required'),
  department: z.string().min(1, 'Department is required'),
  type: z.enum(['general', 'icu', 'isolation', 'maternity', 'pediatric', 'private']),
  floor: z.string().optional(),
  capacity: z.number().min(0, 'Capacity must be non-negative'),
  gender: z.enum(['male', 'female', 'mixed']).default('mixed'),
  ratePerDay: z.number().min(0, 'Rate must be non-negative'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateWardSchema = z.object({
  name: z.string().optional(),
  department: z.string().optional(),
  type: z.enum(['general', 'icu', 'isolation', 'maternity', 'pediatric', 'private']).optional(),
  floor: z.string().optional(),
  capacity: z.number().min(0).optional(),
  gender: z.enum(['male', 'female', 'mixed']).optional(),
  ratePerDay: z.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createBedSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required'),
  ward: z.string().min(1, 'Ward is required'),
  type: z.enum(['general', 'icu', 'private', 'semi_private']).default('general'),
  bedPrice: z.number().min(0, 'Bed price must be non-negative'),
  floor: z.string().optional(),
});

export const updateBedSchema = z.object({
  bedNumber: z.string().optional(),
  ward: z.string().optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  type: z.enum(['general', 'icu', 'private', 'semi_private']).optional(),
  bedPrice: z.number().min(0).optional(),
  floor: z.string().optional(),
  patient: z.string().optional(),
});

export const assignBedSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  bedId: z.string().min(1, 'Bed is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  reason: z.string().min(1, 'Reason is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  type: z.enum(['emergency', 'planned', 'transfer']).default('emergency'),
});
