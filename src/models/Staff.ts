import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  role: 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'laboratory' | 'radiologist' | 'accountant' | 'ambulance_driver' | 'admin';
  departmentId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  position: string;
  dateOfJoining: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  salary?: number;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    branch: string;
    ifscCode: string;
  };
  documents: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    role: {
      type: String,
      enum: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin'],
      required: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    position: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    salary: { type: Number },
    bankDetails: {
      accountNumber: { type: String },
      bankName: { type: String },
      branch: { type: String },
      ifscCode: { type: String },
    },
    documents: [
      {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

staffSchema.index({ employeeId: 1 });
staffSchema.index({ user: 1 });
staffSchema.index({ role: 1 });
staffSchema.index({ departmentId: 1 });
staffSchema.index({ branchId: 1 });
staffSchema.index({ status: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);