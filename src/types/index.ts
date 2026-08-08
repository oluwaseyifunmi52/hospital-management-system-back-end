import { Request } from 'express';

export interface JwtPayload {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type UserRole =
  | 'super_admin'
  | 'patient'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'laboratory'
  | 'radiologist'
  | 'accountant'
  | 'ambulance_driver'
  | 'admin';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
