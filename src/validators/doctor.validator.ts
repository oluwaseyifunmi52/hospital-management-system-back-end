import { z } from 'zod';

export const doctorProfileSchema = z.object({
  title: z.string().optional(),
  specialty: z.string().min(1, 'Specialty is required'),
  department: z.string().min(1, 'Department is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  yearsExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  consultationFee: z.number().optional(),
  inPersonConsultation: z.boolean().optional(),
  videoConsultation: z.boolean().optional(),
  workingDays: z.array(z.string()).optional(),
  workingHours: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
});

export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(['available', 'busy', 'off_duty']),
});
