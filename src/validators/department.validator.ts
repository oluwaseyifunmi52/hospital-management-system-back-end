import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  head: z.string().optional(),
  type: z.enum(['clinical', 'non_clinical', 'diagnostic', 'support']).optional(),
  floor: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').optional(),
  description: z.string().optional(),
  head: z.string().optional(),
  type: z.enum(['clinical', 'non_clinical', 'diagnostic', 'support']).optional(),
  floor: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});
