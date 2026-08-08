import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  duration?: number;
  department?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ department: 1 });
serviceSchema.index({ isActive: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);
