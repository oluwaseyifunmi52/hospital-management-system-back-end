import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  bill: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'mobile_money' | 'bank_transfer';
  referenceNumber?: string;
  notes?: string;
  collectedBy: mongoose.Types.ObjectId;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bill: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'mobile_money', 'bank_transfer'],
      required: true,
    },
    referenceNumber: { type: String, trim: true },
    notes: { type: String },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ bill: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ paymentDate: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
