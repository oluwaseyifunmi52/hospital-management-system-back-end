import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description: string;
  head?: mongoose.Types.ObjectId;
  type: 'clinical' | 'non_clinical' | 'diagnostic' | 'support';
  floor?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    head: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['clinical', 'non_clinical', 'diagnostic', 'support'],
      required: true,
    },
    floor: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ type: 1 });
departmentSchema.index({ isActive: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
