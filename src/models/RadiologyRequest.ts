import mongoose, { Schema, Document } from 'mongoose';

export interface IRadiologyRequest extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  medicalRecord?: mongoose.Types.ObjectId;
  tests: {
    test: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  priority: 'normal' | 'urgent' | 'stat';
  status: 'requested' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  results: {
    test: mongoose.Types.ObjectId;
    findings?: string;
    impression?: string;
    reportFile?: string;
    isNormal?: boolean;
    performedAt?: Date;
    performedBy?: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const radiologyRequestSchema = new Schema<IRadiologyRequest>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    medicalRecord: { type: Schema.Types.ObjectId, ref: 'MedicalRecord' },
    tests: [
      {
        test: { type: Schema.Types.ObjectId, ref: 'RadiologyTest', required: true },
        notes: { type: String },
      },
    ],
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'stat'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['requested', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    notes: { type: String },
    results: [
      {
        test: { type: Schema.Types.ObjectId, ref: 'RadiologyTest' },
        findings: { type: String },
        impression: { type: String },
        reportFile: { type: String },
        isNormal: { type: Boolean },
        performedAt: { type: Date },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

radiologyRequestSchema.index({ patient: 1 });
radiologyRequestSchema.index({ doctor: 1 });
radiologyRequestSchema.index({ status: 1 });
radiologyRequestSchema.index({ priority: 1 });

export const RadiologyRequest = mongoose.model<IRadiologyRequest>(
  'RadiologyRequest',
  radiologyRequestSchema
);
