import mongoose, { Schema, Document } from 'mongoose';

export interface ILabTestRequest extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  medicalRecord?: mongoose.Types.ObjectId;
  tests: {
    test: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  priority: 'normal' | 'urgent' | 'stat';
  status: 'requested' | 'sampling' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  results: {
    test: mongoose.Types.ObjectId;
    value?: number;
    unit?: string;
    resultText?: string;
    isAbnormal?: boolean;
    notes?: string;
    performedAt?: Date;
    performedBy?: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const labTestRequestSchema = new Schema<ILabTestRequest>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    medicalRecord: { type: Schema.Types.ObjectId, ref: 'MedicalRecord' },
    tests: [
      {
        test: { type: Schema.Types.ObjectId, ref: 'LabTest', required: true },
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
      enum: ['requested', 'sampling', 'processing', 'completed', 'cancelled'],
      default: 'requested',
    },
    notes: { type: String },
    results: [
      {
        test: { type: Schema.Types.ObjectId, ref: 'LabTest' },
        value: { type: Number },
        unit: { type: String },
        resultText: { type: String },
        isAbnormal: { type: Boolean, default: false },
        notes: { type: String },
        performedAt: { type: Date },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

labTestRequestSchema.index({ patient: 1 });
labTestRequestSchema.index({ doctor: 1 });
labTestRequestSchema.index({ status: 1 });
labTestRequestSchema.index({ priority: 1 });

export const LabTestRequest = mongoose.model<ILabTestRequest>(
  'LabTestRequest',
  labTestRequestSchema
);
