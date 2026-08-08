import mongoose, { Schema, Document } from 'mongoose';

export type VitalType =
  | 'blood_pressure'
  | 'temperature'
  | 'heart_rate'
  | 'respiratory_rate'
  | 'oxygen_saturation'
  | 'height'
  | 'weight'
  | 'bmi'
  | 'pain_level';

export interface IVitalSign extends Document {
  patient: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  vitalType: VitalType;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vitalSignSchema = new Schema<IVitalSign>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    vitalType: {
      type: String,
      enum: [
        'blood_pressure',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'oxygen_saturation',
        'height',
        'weight',
        'bmi',
        'pain_level',
      ],
      required: true,
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vitalSignSchema.index({ patient: 1 });
vitalSignSchema.index({ recordedBy: 1 });
vitalSignSchema.index({ vitalType: 1 });

export const VitalSign = mongoose.model<IVitalSign>('VitalSign', vitalSignSchema);
