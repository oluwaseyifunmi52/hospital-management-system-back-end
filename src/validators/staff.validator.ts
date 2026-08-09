import { z } from 'zod';

export const createStaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.enum(['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin']),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
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
  branchId: z.string().optional(),
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
  salary: z.number().optional(),
  bankDetails: z.object({
    accountNumber: z.string(),
    bankName: z.string(),
    branch: z.string(),
    ifscCode: z.string(),
  }).optional(),
});

export const attendanceCheckInSchema = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const attendanceCheckOutSchema = z.object({
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const createLeaveRequestSchema = z.object({
  leaveType: z.enum(['annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid', 'other']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

export const approveLeaveRequestSchema = z.object({
  rejectionReason: z.string().optional(),
});

export const createPayrollSchema = z.object({
  staffId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  basicSalary: z.number().min(0),
  allowances: z.array(z.object({
    name: z.string(),
    amount: z.number().min(0),
  })),
  deductions: z.array(z.object({
    name: z.string(),
    amount: z.number().min(0),
  })),
});

export const updatePayrollStatusSchema = z.object({
  status: z.enum(['draft', 'generated', 'paid', 'cancelled']),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
});