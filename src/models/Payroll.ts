import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  staff: mongoose.Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'generated' | 'paid' | 'cancelled';
  paidAt?: Date;
  paidBy?: mongoose.Types.ObjectId;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    deductions: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    grossSalary: { type: Number, required: true, min: 0 },
    totalDeductions: { type: Number, required: true, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'generated', 'paid', 'cancelled'],
      default: 'draft',
    },
    paidAt: { type: Date },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

payrollSchema.index({ staff: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);