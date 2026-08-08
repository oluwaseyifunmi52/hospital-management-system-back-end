import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientInsurance extends Document {
  patient: mongoose.Types.ObjectId;
  insurance: mongoose.Types.ObjectId;
  policyNumber: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  coveredServices: string[];
  createdAt: Date;
  updatedAt: Date;
}

const patientInsuranceSchema = new Schema<IPatientInsurance>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    insurance: { type: Schema.Types.ObjectId, ref: 'Insurance', required: true },
    policyNumber: { type: String, required: true, trim: true },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    coveredServices: [{ type: String }],
  },
  { timestamps: true }
);

patientInsuranceSchema.index({ patient: 1 });
patientInsuranceSchema.index({ insurance: 1 });
patientInsuranceSchema.index({ policyNumber: 1 });

export const PatientInsurance = mongoose.model<IPatientInsurance>(
  'PatientInsurance',
  patientInsuranceSchema
);
