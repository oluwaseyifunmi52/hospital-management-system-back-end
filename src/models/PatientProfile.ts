import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  user: mongoose.Types.ObjectId;
  patientId: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  nextOfKin: {
    name: string;
    phone: string;
    relationship: string;
    address?: string;
  };
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  genotype: 'AA' | 'AS' | 'SS' | 'SC' | 'AC' | 'CC';
  allergies: string[];
  medicalHistory: {
    condition: string;
    diagnosedDate?: Date;
    notes?: string;
    isChronic: boolean;
  }[];
  height?: number;
  weight?: number;
  medicalConditions: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  socialHistory: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  occupation: string;
  religion: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientId: { type: String, required: true, unique: true, trim: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    nextOfKin: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
      address: { type: String },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    genotype: {
      type: String,
      enum: ['AA', 'AS', 'SS', 'SC', 'AC', 'CC'],
    },
    allergies: [{ type: String }],
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date },
        notes: { type: String },
        isChronic: { type: Boolean, default: false },
      },
    ],
    height: { type: Number },
    weight: { type: Number },
    medicalConditions: [{ type: String }],
    surgicalHistory: [{ type: String }],
    familyHistory: [{ type: String }],
    socialHistory: { type: String },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'other'],
      default: 'single',
    },
    occupation: { type: String },
    religion: { type: String },
    photo: { type: String },
  },
  { timestamps: true }
);

patientProfileSchema.index({ user: 1 });
patientProfileSchema.index({ patientId: 1 });

export const PatientProfile = mongoose.model<IPatientProfile>('PatientProfile', patientProfileSchema);
