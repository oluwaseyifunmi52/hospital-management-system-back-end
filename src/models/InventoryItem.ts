import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  description?: string;
  category: string;
  itemType: 'medicine' | 'equipment' | 'supply' | 'consumable';
  quantity: number;
  unit: string;
  minQuantity: number;
  supplier?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  batchNumber?: string;
  expiryDate?: Date;
  location?: string;
  status: 'active' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true, trim: true },
    itemType: {
      type: String,
      enum: ['medicine', 'equipment', 'supply', 'consumable'],
      required: true,
    },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, default: 'units' },
    minQuantity: { type: Number, default: 0, min: 0 },
    supplier: { type: String },
    purchasePrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, min: 0 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    location: { type: String },
    status: {
      type: String,
      enum: ['active', 'discontinued'],
      default: 'active',
    },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ name: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ itemType: 1 });
inventoryItemSchema.index({ supplier: 1 });
inventoryItemSchema.index({ status: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>(
  'InventoryItem',
  inventoryItemSchema
);
