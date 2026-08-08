import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { logAction } from '../utils/auditLog';

const actionMap: Record<string, { action: string; resourceType: string }> = {
  'GET /api/v1/patients': { action: 'view_patient_profiles', resourceType: 'PatientProfile' },
  'POST /api/v1/patients': { action: 'create_patient_profile', resourceType: 'PatientProfile' },
  'PATCH /api/v1/patients': { action: 'update_patient_profile', resourceType: 'PatientProfile' },
  'GET /api/v1/billing/bills': { action: 'view_bills', resourceType: 'Bill' },
  'POST /api/v1/billing/bills': { action: 'create_bill', resourceType: 'Bill' },
  'GET /api/v1/billing/payments': { action: 'view_payments', resourceType: 'Payment' },
  'POST /api/v1/billing/payments': { action: 'record_payment', resourceType: 'Payment' },
  'POST /api/v1/lab/requests': { action: 'create_lab_request', resourceType: 'LabTestRequest' },
  'PATCH /api/v1/lab/requests': { action: 'update_lab_request', resourceType: 'LabTestRequest' },
  'POST /api/v1/pharmacy/sales': { action: 'create_pharmacy_sale', resourceType: 'PharmacySale' },
  'POST /api/v1/hospital/wards/admissions': { action: 'create_admission', resourceType: 'Admission' },
  'POST /api/v1/hospital/wards/admissions/discharge': { action: 'discharge_patient', resourceType: 'Admission' },
  'POST /api/v1/nursing/vitals': { action: 'record_vital_sign', resourceType: 'VitalSign' },
  'POST /api/v1/auth/login': { action: 'login', resourceType: 'Auth' },
  'POST /api/v1/auth/register': { action: 'register', resourceType: 'Auth' },
  'POST /api/v1/auth/logout': { action: 'logout', resourceType: 'Auth' },
};

export const auditLogger = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    res.send = function (body: any): Response {
      setImmediate(async () => {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed && parsed.success) {
            await logAction({
              userId: req.user?.id || 'anonymous',
              action,
              resourceType,
              resourceId: req.params?.id,
              details: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
              },
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
            });
          }
        } catch (e) {
          // Silent fail for audit logging
        }
      });
      return originalSend.call(this, body);
    };
    next();
  };
};

export const autoAuditLogger = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    res.send = function (body: any): Response {
      setImmediate(async () => {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed && parsed.success && req.user) {
            const key = `${req.method} ${req.route?.path || req.path}`;
            const mapped = actionMap[key];
            if (mapped) {
              await logAction({
                userId: req.user.id,
                action: mapped.action,
                resourceType: mapped.resourceType,
                resourceId: req.params?.id,
                details: {
                  method: req.method,
                  path: req.path,
                  statusCode: res.statusCode,
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
              });
            }
          }
        } catch (e) {
          // Silent fail for audit logging
        }
      });
      return originalSend.call(this, body);
    };
    next();
  };
};
