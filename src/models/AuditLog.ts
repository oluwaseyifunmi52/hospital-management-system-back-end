import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    resourceType: { type: String, required: true, trim: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
