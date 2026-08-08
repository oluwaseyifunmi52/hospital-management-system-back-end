import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  medicalRecord?: mongoose.Types.ObjectId;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicalRecord: { type: Schema.Types.ObjectId, ref: 'MedicalRecord' },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String },
        instructions: { type: String },
      },
    ],
    notes: { type: String },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
