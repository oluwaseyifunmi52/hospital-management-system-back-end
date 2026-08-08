import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  patient: mongoose.Types.ObjectId;
  bed: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  admissionDate: Date;
  dischargeDate?: Date;
  reason: string;
  diagnosis: string;
  status: 'admitted' | 'discharged' | 'transferred';
  type: 'emergency' | 'planned' | 'transfer';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const admissionSchema = new Schema<IAdmission>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bed: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    dischargeDate: { type: Date },
    reason: { type: String, required: true },
    diagnosis: { type: String, required: true },
    status: {
      type: String,
      enum: ['admitted', 'discharged', 'transferred'],
      default: 'admitted',
    },
    type: {
      type: String,
      enum: ['emergency', 'planned', 'transfer'],
      default: 'emergency',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

admissionSchema.index({ patient: 1 });
admissionSchema.index({ bed: 1 });
admissionSchema.index({ doctor: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ admissionDate: 1 });

export const Admission = mongoose.model<IAdmission>('Admission', admissionSchema);
