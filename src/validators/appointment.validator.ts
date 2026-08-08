import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['in_person', 'video']).default('in_person'),
  reason: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
  notes: z.string().optional(),
});
