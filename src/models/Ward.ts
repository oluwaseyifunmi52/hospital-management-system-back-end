import mongoose, { Schema, Document } from 'mongoose';

export interface IWard extends Document {
  name: string;
  department: mongoose.Types.ObjectId;
  type: 'general' | 'icu' | 'isolation' | 'maternity' | 'pediatric' | 'private';
  floor?: string;
  capacity: number;
  gender: 'male' | 'female' | 'mixed';
  ratePerDay: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wardSchema = new Schema<IWard>(
  {
    name: { type: String, required: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    type: {
      type: String,
      enum: ['general', 'icu', 'isolation', 'maternity', 'pediatric', 'private'],
      required: true,
    },
    floor: { type: String },
    capacity: { type: Number, required: true, min: 0 },
    gender: {
      type: String,
      enum: ['male', 'female', 'mixed'],
      default: 'mixed',
    },
    ratePerDay: { type: Number, required: true, min: 0 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

wardSchema.index({ name: 1 });
wardSchema.index({ department: 1 });
wardSchema.index({ type: 1 });

export const Ward = mongoose.model<IWard>('Ward', wardSchema);
