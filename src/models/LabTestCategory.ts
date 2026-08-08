import mongoose, { Schema, Document } from 'mongoose';

export interface ILabTestCategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const labTestCategorySchema = new Schema<ILabTestCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

labTestCategorySchema.index({ name: 1 });

export const LabTestCategory = mongoose.model<ILabTestCategory>(
  'LabTestCategory',
  labTestCategorySchema
);
