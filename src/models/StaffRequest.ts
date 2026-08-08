import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffRequest extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffRequestSchema = new Schema<IStaffRequest>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

staffRequestSchema.index({ status: 1 });
staffRequestSchema.index({ email: 1 });

export const StaffRequest = mongoose.model<IStaffRequest>('StaffRequest', staffRequestSchema);
