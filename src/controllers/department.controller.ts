import { Response } from 'express';
import { DepartmentService, ServiceService } from '../services/department.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DepartmentService.create(req.body);
    sendSuccess(res, result, 'Department created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DepartmentService.getAll({
      type: req.query.type as string,
      isActive: req.query.isActive === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Departments retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DepartmentService.getById(req.params.id);
    sendSuccess(res, result, 'Department retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DepartmentService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Department updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DepartmentService.delete(req.params.id);
    sendSuccess(res, result, 'Department deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createServiceItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ServiceService.create(req.body);
    sendSuccess(res, result, 'Service created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getServices = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ServiceService.getAll({
      category: req.query.category as string,
      department: req.query.department as string,
      isActive: req.query.isActive === 'true',
      search: req.query.search as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Services retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ServiceService.getById(req.params.id);
    sendSuccess(res, result, 'Service retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateServiceItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ServiceService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Service updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteServiceItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await ServiceService.delete(req.params.id);
    sendSuccess(res, result, 'Service deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
