import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: mongoose.Types.ObjectId;
  parentDepartment?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    description: { type: String },
    headOfDepartment: { type: Schema.Types.ObjectId, ref: 'User' },
    parentDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ parentDepartment: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);