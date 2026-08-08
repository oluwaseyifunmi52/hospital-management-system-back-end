import { Response } from 'express';
import { NurseService, VitalSignService } from '../services/nurse.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createNurseProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NurseService.upsertProfile(req.user!.id, req.body);
    sendSuccess(res, result, 'Nurse profile created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyNurseProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NurseService.getProfile(req.user!.id);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllNurses = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NurseService.getAllNurses({
      department: req.query.department as string,
      shift: req.query.shift as string,
      isHeadNurse: req.query.isHeadNurse === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Nurses retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNurseById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NurseService.getById(req.params.id);
    sendSuccess(res, result, 'Nurse profile retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteNurseProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NurseService.delete(req.params.id);
    sendSuccess(res, result, 'Nurse profile deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const recordVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const result = await VitalSignService.create({
      ...req.body,
      recordedBy: req.user!.id,
    });
    sendSuccess(res, result, 'Vital sign recorded successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getVitalSigns = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.role === 'patient' ? req.user!.id : req.params.patientId;
    const result = await VitalSignService.getByPatient(patientId, {
      vitalType: req.query.vitalType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Vital signs retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLatestVitals = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.role === 'patient' ? req.user!.id : req.params.patientId;
    const result = await VitalSignService.getLatestByPatient(patientId);
    sendSuccess(res, result, 'Latest vitals retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getVitalSignById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await VitalSignService.getById(req.params.id);
    sendSuccess(res, result, 'Vital sign retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const result = await VitalSignService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Vital sign updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const result = await VitalSignService.delete(req.params.id);
    sendSuccess(res, result, 'Vital sign deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
