import mongoose, { Schema, Document } from 'mongoose';

export interface IInsurance extends Document {
  name: string;
  type: 'insurance' | 'hmo';
  contactInfo: {
    address: string;
    phone: string;
    email: string;
  };
  coverageDetails: string;
  deductible: number;
  coverageLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const insuranceSchema = new Schema<IInsurance>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    type: {
      type: String,
      enum: ['insurance', 'hmo'],
      required: true,
      default: 'insurance',
    },
    contactInfo: {
      address: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    coverageDetails: { type: String },
    deductible: { type: Number, default: 0 },
    coverageLimit: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

insuranceSchema.index({ name: 1 });
insuranceSchema.index({ type: 1 });

export const Insurance = mongoose.model<IInsurance>('Insurance', insuranceSchema);
