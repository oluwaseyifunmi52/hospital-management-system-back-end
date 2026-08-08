import { Response } from 'express';
import { PatientProfileService, InsuranceService } from '../services/patientProfile.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';
import { generatePatientId } from '../utils/generatePatientId';

export const createPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, ...rest } = req.body;
    const result = await PatientProfileService.create({
      userId: req.user!.id,
      patientId: patientId || generatePatientId(),
      ...rest,
    });
    sendSuccess(res, result, 'Patient profile created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PatientProfileService.getByUserId(req.user!.id);
    sendSuccess(res, result, 'Patient profile retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientProfileById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PatientProfileService.getByPatientId(req.params.patientId);
    sendSuccess(res, result, 'Patient profile retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllPatientProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PatientProfileService.getAll({
      search: req.query.search as string,
      bloodGroup: req.query.bloodGroup as string,
      isActive: req.query.isActive === 'true',
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Patient profiles retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PatientProfileService.update(req.user!.id, req.body);
    sendSuccess(res, result, 'Patient profile updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.createInsurance(req.body);
    sendSuccess(res, result, 'Insurance created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInsurances = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.getAllInsurances({
      type: req.query.type as string,
      isActive: req.query.isActive === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Insurances retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInsuranceById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.getInsuranceById(req.params.id);
    sendSuccess(res, result, 'Insurance retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.updateInsurance(req.params.id, req.body);
    sendSuccess(res, result, 'Insurance updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.deleteInsurance(req.params.id);
    sendSuccess(res, result, 'Insurance deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const enrollPatientInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.enrollPatient({
      ...req.body,
      validFrom: new Date(req.body.validFrom),
      validTo: new Date(req.body.validTo),
    });
    sendSuccess(res, result, 'Patient enrolled in insurance successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientInsurances = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.getPatientInsurances(req.params.patientId);
    sendSuccess(res, result, 'Patient insurances retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientInsuranceById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.getPatientInsuranceById(req.params.id);
    sendSuccess(res, result, 'Patient insurance enrollment retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePatientInsurance = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InsuranceService.updatePatientInsurance(req.params.id, req.body);
    sendSuccess(res, result, 'Patient insurance updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
