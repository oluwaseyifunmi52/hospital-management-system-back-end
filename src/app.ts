import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';

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
import branchRoutes from './routes/branch.routes';
import userRoutes from './routes/user.routes';
import staffRoutes from './routes/staff.routes';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({ 
  origin: config.clientUrl, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400,
}));
app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(generalRateLimit);

if (config.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SmartCare API Documentation',
  }));
}

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
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
  });
});

app.get('/api/v1', (req, res) => {
  res.json({
    name: 'SmartCare Hospital Management System API',
    version: '1.0.0',
    description: 'API for SmartCare Hospital Management System',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      doctors: '/api/v1/doctor',
      patients: '/api/v1/patient',
      appointments: '/api/v1/appointments',
      medicalRecords: '/api/v1/medical-records',
      departments: '/api/v1/hospital/departments',
      wards: '/api/v1/hospital/wards',
      nursing: '/api/v1/nursing',
      lab: '/api/v1/lab',
      pharmacy: '/api/v1/pharmacy',
      radiology: '/api/v1/radiology',
      billing: '/api/v1/billing',
      inventory: '/api/v1/inventory',
      notifications: '/api/v1/notifications',
      dashboard: '/api/v1/dashboard',
      auditLogs: '/api/v1/audit-logs',
      branches: '/api/v1/branches',
      staff: '/api/v1/staff',
    },
  });
});

app.use(errorHandler);

export default app;
