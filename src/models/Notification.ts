import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'appointment'
  | 'lab_result'
  | 'prescription'
  | 'radiology_result'
  | 'payment'
  | 'stock_alert'
  | 'admission'
  | 'discharge'
  | 'appointment_reminder'
  | 'announcement'
  | 'system';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  relatedId?: mongoose.Types.ObjectId;
  relatedType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'appointment',
        'lab_result',
        'prescription',
        'radiology_result',
        'payment',
        'stock_alert',
        'admission',
        'discharge',
        'appointment_reminder',
        'announcement',
        'system',
      ],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    relatedId: { type: Schema.Types.ObjectId },
    relatedType: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
