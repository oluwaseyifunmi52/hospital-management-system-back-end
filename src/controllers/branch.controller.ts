import { Request, Response } from 'express';
import { Branch } from '../models/Branch';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';

export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branch = await Branch.create(req.body);
    sendSuccess(res, branch, 'Branch created successfully', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Branch with this name or code already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const getBranches = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isActive = req.query.isActive;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [branches, total] = await Promise.all([
      Branch.find(query)
        .populate('manager', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Branch.countDocuments(query),
    ]);

    sendPaginated(res, branches, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getBranchById = async (req: AuthRequest, res: Response) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('manager', 'firstName lastName email phone');
    if (!branch) {
      sendError(res, 'Branch not found', 404);
      return;
    }
    sendSuccess(res, branch);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) {
      sendError(res, 'Branch not found', 404);
      return;
    }
    sendSuccess(res, branch, 'Branch updated successfully');
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Branch with this name or code already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      sendError(res, 'Branch not found', 404);
      return;
    }
    sendSuccess(res, null, 'Branch deleted successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};