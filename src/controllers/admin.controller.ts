import { Response } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getStaffRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const result = await AdminService.getStaffRequests(
      status as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.requests, 'Staff requests retrieved', 200);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStaffRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.getStaffRequestById(req.params.id);
    sendSuccess(res, result.request, 'Staff request retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const approveStaffRequest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.approveStaffRequest(
      req.params.id,
      req.user!.id
    );
    sendSuccess(res, result, 'Staff approved successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const rejectStaffRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { rejectionReason } = req.body;
    const result = await AdminService.rejectStaffRequest(
      req.params.id,
      req.user!.id,
      rejectionReason
    );
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = '1', limit = '10' } = req.query;
    const result = await AdminService.getUsers(
      role as string,
      search as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.users, 'Users retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleUserActive = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.toggleUserActive(req.params.id);
    sendSuccess(res, result, 'User status updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.getUserById(req.params.id);
    sendSuccess(res, result, 'User retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.updateUserRole(req.params.id, req.body.role);
    sendSuccess(res, result, 'User role updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminService.deleteUser(req.params.id);
    sendSuccess(res, result, 'User deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
