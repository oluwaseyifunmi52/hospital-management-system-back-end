import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().optional(),
  parentDepartment: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(2).max(10).toUpperCase().optional(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().optional(),
  parentDepartment: z.string().optional(),
  isActive: z.boolean().optional(),
});

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

export const createStaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.enum(['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin']),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  dateOfJoining: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
});

export const updateStaffSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin']).optional(),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  dateOfJoining: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
});