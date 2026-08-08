import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorProfile extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  specialty: string;
  department: string;
  licenseNumber: string;
  yearsExperience: number;
  qualifications: string[];
  certifications: string[];
  expertise: string[];
  languages: string[];
  bio: string;
  profilePhoto: string;
  services: {
    name: string;
    description: string;
    fee: number;
    duration: number;
  }[];
  consultationFee: number;
  inPersonConsultation: boolean;
  videoConsultation: boolean;
  workingDays: string[];
  workingHours: { start: string; end: string };
  availabilityStatus: 'available' | 'busy' | 'off_duty';
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, default: 'Dr.' },
    specialty: { type: String, required: true },
    department: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    yearsExperience: { type: Number, default: 0 },
    qualifications: [{ type: String }],
    certifications: [{ type: String }],
    expertise: [{ type: String }],
    languages: [{ type: String }],
    bio: { type: String },
    profilePhoto: { type: String },
    services: [
      {
        name: { type: String },
        description: { type: String },
        fee: { type: Number },
        duration: { type: Number },
      },
    ],
    consultationFee: { type: Number, default: 0 },
    inPersonConsultation: { type: Boolean, default: true },
    videoConsultation: { type: Boolean, default: false },
    workingDays: [{ type: String }],
    workingHours: {
      start: { type: String },
      end: { type: String },
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'off_duty'],
      default: 'available',
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

doctorProfileSchema.index({ user: 1 });
doctorProfileSchema.index({ specialty: 1 });
doctorProfileSchema.index({ department: 1 });

export const DoctorProfile = mongoose.model<IDoctorProfile>('DoctorProfile', doctorProfileSchema);
