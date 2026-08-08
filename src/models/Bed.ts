import mongoose, { Schema, Document } from 'mongoose';

export interface IBed extends Document {
  bedNumber: string;
  ward: mongoose.Types.ObjectId;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'general' | 'icu' | 'private' | 'semi_private';
  bedPrice: number;
  patient?: mongoose.Types.ObjectId;
  floor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bedSchema = new Schema<IBed>(
  {
    bedNumber: { type: String, required: true, trim: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    type: {
      type: String,
      enum: ['general', 'icu', 'private', 'semi_private'],
      default: 'general',
    },
    bedPrice: { type: Number, required: true, min: 0 },
    patient: { type: Schema.Types.ObjectId, ref: 'User' },
    floor: { type: String },
  },
  { timestamps: true }
);

bedSchema.index({ bedNumber: 1, ward: 1 }, { unique: true });
bedSchema.index({ ward: 1 });
bedSchema.index({ status: 1 });

export const Bed = mongoose.model<IBed>('Bed', bedSchema);
