import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getSuperAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getSuperAdminDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDoctorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getDoctorDashboard(req.user!.id);
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNurseDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getNurseDashboard(req.user!.id);
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getReceptionistDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getReceptionistDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPharmacistDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getPharmacistDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAccountantDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getAccountantDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLaboratoryDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getLaboratoryDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRadiologyDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getRadiologyDashboard();
    sendSuccess(res, result, 'Dashboard data retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientPortalStats = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DashboardService.getPatientPortalStats(req.user!.id);
    sendSuccess(res, result, 'Patient portal stats retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
