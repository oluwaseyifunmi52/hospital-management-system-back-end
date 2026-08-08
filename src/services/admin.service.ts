import { User } from '../models/User';
import { StaffRequest, IStaffRequest } from '../models/StaffRequest';
import { hashPassword } from '../utils/password';
import { generateOTP } from '../utils/generateOTP';
import { sendStaffApprovalEmail, sendStaffRejectionEmail } from '../utils/email';
import { AppError } from './auth.service';
import { logAction } from '../utils/auditLog';

export class AdminService {
  static async getStaffRequests(
    status?: string,
    page = 1,
    limit = 10
  ) {
    const query: any = {};
    if (status) query.status = status;

    const total = await StaffRequest.countDocuments(query);
    const requests = await StaffRequest.find(query)
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, limit };
  }

  static async getStaffRequestById(id: string) {
    const request = await StaffRequest.findById(id).populate(
      'reviewedBy',
      'firstName lastName email'
    );
    if (!request) {
      throw new AppError('Staff request not found', 404);
    }
    return { request };
  }

  static async approveStaffRequest(id: string, adminId: string) {
    const request = await StaffRequest.findById(id);
    if (!request) {
      throw new AppError('Staff request not found', 404);
    }

    if (request.status !== 'pending') {
      throw new AppError('Request already processed', 400);
    }

    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const tempPassword = generateOTP() + generateOTP();
    const hashedPassword = await hashPassword(tempPassword);

    const user = await User.create({
      email: request.email,
      password: hashedPassword,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      role: request.role,
      isVerified: true,
      isActive: true,
      isProfileComplete: false,
    });

    request.status = 'approved';
    request.reviewedBy = user._id as any;
    request.reviewedAt = new Date();
    await request.save();

    await sendStaffApprovalEmail(request.email, request.firstName, tempPassword);

    logAction({
      userId: adminId,
      action: 'approve_staff_request',
      resourceType: 'StaffRequest',
      resourceId: request._id.toString(),
      details: {
        staffEmail: request.email,
        staffName: `${request.firstName} ${request.lastName}`,
        role: request.role,
        newUserId: user._id.toString(),
      },
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  static async rejectStaffRequest(
    id: string,
    adminId: string,
    rejectionReason: string
  ) {
    const request = await StaffRequest.findById(id);
    if (!request) {
      throw new AppError('Staff request not found', 404);
    }

    if (request.status !== 'pending') {
      throw new AppError('Request already processed', 400);
    }

    request.status = 'rejected';
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();

    await sendStaffRejectionEmail(request.email, request.firstName, rejectionReason);

    logAction({
      userId: adminId,
      action: 'reject_staff_request',
      resourceType: 'StaffRequest',
      resourceId: request._id.toString(),
      details: {
        staffEmail: request.email,
        staffName: `${request.firstName} ${request.lastName}`,
        role: request.role,
        reason: rejectionReason,
      },
    });

    return { message: 'Staff request rejected' };
  }

  static async getUsers(
    role?: string,
    search?: string,
    page = 1,
    limit = 10
  ) {
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-refreshTokens -otp -otpExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { users, total, page, limit };
  }

  static async toggleUserActive(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return { user };
  }

  static async getUserById(id: string) {
    const user = await User.findById(id).select(
      '-refreshTokens -otp -otpExpires -passwordResetToken -passwordResetExpires'
    );
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { user };
  }

  static async updateUserRole(id: string, role: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.role = role as any;
    await user.save();

    return { user };
  }

  static async deleteUser(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      throw new AppError('Cannot delete admin or super admin users', 403);
    }

    const { PatientProfile } = await import('../models/PatientProfile');
    const { DoctorProfile } = await import('../models/DoctorProfile');
    const { NurseProfile } = await import('../models/NurseProfile');
    await PatientProfile.findOneAndDelete({ user: id });
    await DoctorProfile.findOneAndDelete({ user: id });
    await NurseProfile.findOneAndDelete({ user: id });

    await user.deleteOne();

    return { message: 'User deleted successfully' };
  }
}
