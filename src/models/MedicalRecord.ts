import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  attachments: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    notes: { type: String },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1 });
medicalRecordSchema.index({ doctor: 1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);
