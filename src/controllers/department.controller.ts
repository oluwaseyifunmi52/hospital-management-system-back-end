import { Request, Response } from 'express';
import { Department } from '../models/Department';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.create(req.body);
    sendSuccess(res, department, 'Department created successfully', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Department with this name or code already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
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
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('headOfDepartment', 'firstName lastName email')
        .populate('parentDepartment', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Department.countDocuments(query),
    ]);

    sendPaginated(res, departments, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'firstName lastName email phone')
      .populate('parentDepartment', 'name code');
    if (!department) {
      sendError(res, 'Department not found', 404);
      return;
    }
    sendSuccess(res, department);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) {
      sendError(res, 'Department not found', 404);
      return;
    }
    sendSuccess(res, department, 'Department updated successfully');
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Department with this name or code already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      sendError(res, 'Department not found', 404);
      return;
    }
    sendSuccess(res, null, 'Department deleted successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getDepartmentStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { Department: Dept } = await import('../models/Department');
    const { User } = await import('../models/User');
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      sendError(res, 'Department not found', 404);
      return;
    }

    const staff = await User.find({ role: { $in: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin'] } })
      .select('firstName lastName email phone role isActive lastLoginAt')
      .sort({ createdAt: -1 });

    sendSuccess(res, staff);
  } catch (error: any) {
    sendError(res, error.message);
  }
};