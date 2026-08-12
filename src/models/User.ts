import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
  family?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  patientId?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  isProfileComplete: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  otp?: string;
  otpExpires?: Date;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['super_admin', 'patient', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin'],
      default: 'patient',
    },
    patientId: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    refreshTokens: [
      {
        token: { type: String },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        revoked: { type: Boolean, default: false },
        family: { type: String },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ firstName: 'text', lastName: 'text' });

export const User = mongoose.model<IUser>('User', userSchema);
