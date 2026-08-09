import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  manager?: mongoose.Types.ObjectId;
  isActive: boolean;
  isHeadOffice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isHeadOffice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

branchSchema.index({ name: 1 });
branchSchema.index({ code: 1 });
branchSchema.index({ isActive: 1 });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);