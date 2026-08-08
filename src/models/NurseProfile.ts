import mongoose, { Schema, Document } from 'mongoose';

export interface INurseProfile extends Document {
  user: mongoose.Types.ObjectId;
  department: string;
  licenseNumber: string;
  shift: 'morning' | 'evening' | 'night' | 'rotating';
  qualifications: string[];
  specialization: string;
  yearsExperience: number;
  assignedWards: mongoose.Types.ObjectId[];
  isHeadNurse: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const nurseProfileSchema = new Schema<INurseProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    department: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    shift: {
      type: String,
      enum: ['morning', 'evening', 'night', 'rotating'],
      default: 'morning',
    },
    qualifications: [{ type: String }],
    specialization: { type: String },
    yearsExperience: { type: Number, default: 0 },
    assignedWards: [{ type: Schema.Types.ObjectId, ref: 'Ward' }],
    isHeadNurse: { type: Boolean, default: false },
  },
  { timestamps: true }
);

nurseProfileSchema.index({ user: 1 });
nurseProfileSchema.index({ department: 1 });
nurseProfileSchema.index({ licenseNumber: 1 });

export const NurseProfile = mongoose.model<INurseProfile>('NurseProfile', nurseProfileSchema);
