import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  manager: z.string().optional(),
  isHeadOffice: z.boolean().optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(2).max(10).toUpperCase().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  manager: z.string().optional(),
  isActive: z.boolean().optional(),
  isHeadOffice: z.boolean().optional(),
});