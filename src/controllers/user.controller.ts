import { Request, Response } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import { hashPassword, comparePassword } from '../utils/password';
import { logAction } from '../utils/auditLog';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const isActive = req.query.isActive;
    const search = req.query.search as string;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens -passwordResetToken -passwordResetExpires -otp -otpExpires')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    sendPaginated(res, users, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -passwordResetToken -passwordResetExpires -otp -otpExpires');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) {
        sendError(res, 'Email already in use', 409);
        return;
      }
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .select('-password -refreshTokens -passwordResetToken -passwordResetExpires -otp -otpExpires');
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    logAction({
      userId: req.user!.id,
      action: 'update_user',
      resourceType: 'User',
      resourceId: id,
      details: { updates },
    });

    sendSuccess(res, user, 'User updated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -refreshTokens -passwordResetToken -passwordResetExpires -otp -otpExpires');
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    logAction({
      userId: req.user!.id,
      action: 'deactivate_user',
      resourceType: 'User',
      resourceId: req.params.id,
    });

    sendSuccess(res, user, 'User deactivated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id).select('+password');
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    user.password = await hashPassword(newPassword);
    user.refreshTokens = [];
    await user.save();

    sendSuccess(res, null, 'Password updated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getUserPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const { ROLE_PERMISSIONS } = await import('../utils/permissions');
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    sendSuccess(res, { role: user.role, permissions });
  } catch (error: any) {
    sendError(res, error.message);
  }
};