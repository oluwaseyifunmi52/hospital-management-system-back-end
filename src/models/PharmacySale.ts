import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacySale extends Document {
  patient?: mongoose.Types.ObjectId;
  pharmacist: mongoose.Types.ObjectId;
  prescription?: mongoose.Types.ObjectId;
  items: {
    medicine: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'insurance' | 'mobile_money';
  insurance?: mongoose.Types.ObjectId;
  notes?: string;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacySaleSchema = new Schema<IPharmacySale>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User' },
    pharmacist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    items: [
      {
        medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'mobile_money'],
      default: 'cash',
    },
    insurance: { type: Schema.Types.ObjectId, ref: 'PatientInsurance' },
    notes: { type: String },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

pharmacySaleSchema.index({ patient: 1 });
pharmacySaleSchema.index({ pharmacist: 1 });
pharmacySaleSchema.index({ saleDate: 1 });
pharmacySaleSchema.index({ paymentStatus: 1 });

export const PharmacySale = mongoose.model<IPharmacySale>('PharmacySale', pharmacySaleSchema);
