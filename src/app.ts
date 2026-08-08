import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import medicalRecordRoutes from './routes/medicalRecord.routes';
import departmentRoutes from './routes/department.routes';
import wardRoutes from './routes/ward.routes';
import patientProfileRoutes from './routes/patientProfile.routes';
import nurseRoutes from './routes/nurse.routes';
import labRoutes from './routes/lab.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import radiologyRoutes from './routes/radiology.routes';
import billingRoutes from './routes/billing.routes';
import inventoryRoutes from './routes/inventory.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditLogRoutes from './routes/auditLog.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimit);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/patient', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/hospital', departmentRoutes);
app.use('/api/v1/hospital', wardRoutes);
app.use('/api/v1/patient-profiles', patientProfileRoutes);
app.use('/api/v1/nursing', nurseRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/radiology', radiologyRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
