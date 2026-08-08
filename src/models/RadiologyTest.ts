import mongoose, { Schema, Document } from 'mongoose';

export interface IRadiologyTest extends Document {
  name: string;
  code: string;
  description?: string;
  category: string;
  bodyPart?: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const radiologyTestSchema = new Schema<IRadiologyTest>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String },
    category: { type: String, required: true, trim: true },
    bodyPart: { type: String },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

radiologyTestSchema.index({ name: 1 });
radiologyTestSchema.index({ code: 1 });
radiologyTestSchema.index({ category: 1 });
radiologyTestSchema.index({ isActive: 1 });

export const RadiologyTest = mongoose.model<IRadiologyTest>(
  'RadiologyTest',
  radiologyTestSchema
);
