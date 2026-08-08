import { Response } from 'express';
import { WardService, BedService, AdmissionService } from '../services/ward.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createWard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.create(req.body);
    sendSuccess(res, result, 'Ward created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getWards = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.getAll({
      type: req.query.type as string,
      department: req.query.department as string,
      gender: req.query.gender as string,
      isActive: req.query.isActive === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Wards retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getWardById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.getById(req.params.id);
    sendSuccess(res, result, 'Ward retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateWard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Ward updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteWard = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.delete(req.params.id);
    sendSuccess(res, result, 'Ward deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getWardBeds = async (req: AuthRequest, res: Response) => {
  try {
    const result = await WardService.getWardBeds(req.params.id);
    sendSuccess(res, result, 'Beds retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createBed = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BedService.create(req.body);
    sendSuccess(res, result, 'Bed created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BedService.getAll({
      ward: req.query.ward as string,
      status: req.query.status as string,
      type: req.query.type as string,
      floor: req.query.floor as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Beds retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBedById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BedService.getById(req.params.id);
    sendSuccess(res, result, 'Bed retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBed = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BedService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Bed updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteBed = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BedService.delete(req.params.id);
    sendSuccess(res, result, 'Bed deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createAdmission = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.create({
      ...req.body,
      doctorId: req.user!.role === 'doctor' ? req.user!.id : req.body.doctorId,
    });
    sendSuccess(res, result, 'Admission created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.getAll({
      status: req.query.status as string,
      patientId: req.query.patientId as string,
      doctorId: req.query.doctorId as string,
      date: req.query.date as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Admissions retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAdmissionById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.getById(req.params.id);
    sendSuccess(res, result, 'Admission retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const dischargePatient = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.discharge(req.params.id, req.body.dischargeDate ? new Date(req.body.dischargeDate) : undefined);
    sendSuccess(res, result, 'Patient discharged successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const transferPatient = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.transfer(req.params.id, req.body.newBedId, req.body.reason);
    sendSuccess(res, result, 'Patient transferred successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdmissionService.getPatientAdmissions(req.params.patientId);
    sendSuccess(res, result, 'Patient admissions retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
