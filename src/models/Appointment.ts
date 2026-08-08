import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  type: 'in_person' | 'video';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['in_person', 'video'], default: 'in_person' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    reason: { type: String },
    notes: { type: String },
    consultationFee: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
