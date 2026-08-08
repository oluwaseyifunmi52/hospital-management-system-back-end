import { z } from 'zod';

export const createBillSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  admissionId: z.string().optional(),
  appointmentId: z.string().optional(),
  doctorId: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        category: z.string().min(1, 'Category is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price must be non-negative'),
        totalPrice: z.number().min(0, 'Total price must be non-negative'),
      })
    )
    .min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0, 'Amount must be non-negative'),
  paymentMethod: z
    .enum(['cash', 'card', 'insurance', 'mobile_money', 'bank_transfer'])
    .default('cash'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const createAppointmentBookingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  department: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['in_person', 'video']).default('in_person'),
  reason: z.string().optional(),
});
