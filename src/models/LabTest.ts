import mongoose, { Schema, Document } from 'mongoose';

export interface ILabTest extends Document {
  name: string;
  code: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  unit?: string;
  normalRange?: string;
  lowerNormal?: number;
  upperNormal?: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const labTestSchema = new Schema<ILabTest>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'LabTestCategory', required: true },
    unit: { type: String },
    normalRange: { type: String },
    lowerNormal: { type: Number },
    upperNormal: { type: Number },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

labTestSchema.index({ name: 1 });
labTestSchema.index({ code: 1 });
labTestSchema.index({ category: 1 });
labTestSchema.index({ isActive: 1 });

export const LabTest = mongoose.model<ILabTest>('LabTest', labTestSchema);
