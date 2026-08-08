import { Response } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.getAll({
      userId: req.query.userId as string,
      action: req.query.action as string,
      resourceType: req.query.resourceType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Audit logs retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAuditLogById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.getById(req.params.id);
    sendSuccess(res, result, 'Audit log retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLogsByResource = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.getByResource(
      req.params.resourceType,
      req.params.resourceId
    );
    sendSuccess(res, result, 'Resource audit logs retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.delete(req.params.id);
    sendSuccess(res, result, 'Audit log deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAllAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.deleteAll();
    sendSuccess(res, result, 'All audit logs deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getActionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuditLogService.getActionSummary({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });
    sendSuccess(res, result, 'Action summary retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
