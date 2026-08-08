import { Response } from 'express';
import { LabTestService, LabTestRequestService } from '../services/lab.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createLabTestCategory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.createCategory(req.body);
    sendSuccess(res, result, 'Lab test category created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLabTestCategories = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.getAllCategories({
      isActive: req.query.isActive === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Lab test categories retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateLabTestCategory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.updateCategory(req.params.id, req.body);
    sendSuccess(res, result, 'Category updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteLabTestCategory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.deleteCategory(req.params.id);
    sendSuccess(res, result, 'Category deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createLabTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.createTest(req.body);
    sendSuccess(res, result, 'Lab test created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLabTests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.getAllTests({
      category: req.query.category as string,
      search: req.query.search as string,
      isActive: req.query.isActive === 'true',
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Lab tests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLabTestById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.getTestById(req.params.id);
    sendSuccess(res, result, 'Lab test retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateLabTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.updateTest(req.params.id, req.body);
    sendSuccess(res, result, 'Lab test updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteLabTest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestService.deleteTest(req.params.id);
    sendSuccess(res, result, 'Lab test deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createLabTestRequest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.create({
      ...req.body,
      doctorId: req.user!.role === 'doctor' ? req.user!.id : req.body.doctorId,
    });
    sendSuccess(res, result, 'Lab test request created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLabTestRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.getAll({
      patientId: req.query.patientId as string,
      doctorId: req.query.doctorId as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      date: req.query.date as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Lab test requests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPendingLabTestRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.getPending({
      priority: req.query.priority as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Pending lab test requests retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLabTestRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.getById(req.params.id);
    sendSuccess(res, result, 'Lab test request retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateLabTestRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.updateStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    sendSuccess(res, result, 'Lab test request status updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const enterLabResults = async (req: AuthRequest, res: Response) => {
  try {
    const result = await LabTestRequestService.addResult({
      requestId: req.params.id,
      results: req.body.results.map((r: any) => ({
        testId: r.testId,
        value: r.value,
        unit: r.unit,
        resultText: r.resultText,
        isAbnormal: r.isAbnormal,
        notes: r.notes,
        performedBy: req.user!.id,
      })),
    });
    sendSuccess(res, result, 'Lab results entered successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
