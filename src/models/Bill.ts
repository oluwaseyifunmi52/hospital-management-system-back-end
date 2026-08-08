import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  patient: mongoose.Types.ObjectId;
  admission?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: {
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'insurance' | 'mobile_money' | 'bank_transfer';
  generatedBy: mongoose.Types.ObjectId;
  generatedAt: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<IBill>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admission: { type: Schema.Types.ObjectId, ref: 'Admission' },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: Schema.Types.ObjectId, ref: 'User' },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    items: [
      {
        description: { type: String, required: true },
        category: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'refunded', 'cancelled'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'mobile_money', 'bank_transfer'],
      default: 'cash',
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

billSchema.index({ patient: 1 });
billSchema.index({ invoiceNumber: 1 });
billSchema.index({ status: 1 });
billSchema.index({ generatedAt: 1 });
billSchema.index({ dueDate: 1 });

export const Bill = mongoose.model<IBill>('Bill', billSchema);
