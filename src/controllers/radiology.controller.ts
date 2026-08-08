import { Response } from 'express';
import { RadiologyService, RadiologyRequestService } from '../services/radiology.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createRadiologyTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyService.createTest(req.body);
    sendSuccess(res, result, 'Radiology test created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRadiologyTests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyService.getAllTests({
      category: req.query.category as string,
      search: req.query.search as string,
      isActive: req.query.isActive === 'true',
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Radiology tests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRadiologyTestById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyService.getTestById(req.params.id);
    sendSuccess(res, result, 'Radiology test retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateRadiologyTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyService.updateTest(req.params.id, req.body);
    sendSuccess(res, result, 'Radiology test updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteRadiologyTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyService.deleteTest(req.params.id);
    sendSuccess(res, result, 'Radiology test deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createRadiologyRequest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.create({
      ...req.body,
      doctorId: req.user!.role === 'doctor' ? req.user!.id : req.body.doctorId,
    });
    sendSuccess(res, result, 'Radiology request created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRadiologyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.getAll({
      patientId: req.query.patientId as string,
      doctorId: req.query.doctorId as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      date: req.query.date as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Radiology requests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPendingRadiologyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.getPending({
      priority: req.query.priority as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Pending radiology requests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRadiologyRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.getById(req.params.id);
    sendSuccess(res, result, 'Radiology request retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateRadiologyRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.updateStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    sendSuccess(res, result, 'Radiology request status updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const enterRadiologyResult = async (req: AuthRequest, res: Response) => {
  try {
    const result = await RadiologyRequestService.addResult({
      requestId: req.params.id,
      results: req.body.results.map((r: any) => ({
        testId: r.testId,
        findings: r.findings,
        impression: r.impression,
        reportFile: r.reportFile,
        isNormal: r.isNormal,
        notes: r.notes,
        performedBy: req.user!.id,
        performedAt: r.performedAt ? new Date(r.performedAt) : undefined,
      })),
    });
    sendSuccess(res, result, 'Radiology result entered successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
