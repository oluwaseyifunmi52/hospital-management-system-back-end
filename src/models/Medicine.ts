import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  description?: string;
  dosageForm: string;
  strength: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  supplier?: string;
  batchNumber?: string;
  expiryDate?: Date;
  minStockLevel: number;
  currentStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    dosageForm: { type: String, required: true },
    strength: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true, default: 'tablet' },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    supplier: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    minStockLevel: { type: Number, default: 10, min: 0 },
    currentStock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ supplier: 1 });
medicineSchema.index({ batchNumber: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ currentStock: 1 });

export const Medicine = mongoose.model<IMedicine>('Medicine', medicineSchema);
