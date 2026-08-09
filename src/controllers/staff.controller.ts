import { Request, Response } from 'express';
import { Staff } from '../models/Staff';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { LeaveRequest } from '../models/LeaveRequest';
import { Payroll } from '../models/Payroll';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, ...staffData } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const { hashPassword } = await import('../utils/password');
    const hashedPassword = await hashPassword(password || 'TempPass123!');
    
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      phone: staffData.phone,
      role: staffData.role,
      isVerified: true,
      isActive: true,
      isProfileComplete: true,
    });

    const employeeId = `EMP${Date.now().toString().slice(-6)}`;
    
    const staff = await Staff.create({
      user: user._id,
      employeeId,
      ...staffData,
    });

    sendSuccess(res, { staff, user: { id: user._id, email: user.email } }, 'Staff created successfully', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Staff with this email or employee ID already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const getStaff = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const departmentId = req.query.departmentId as string;
    const search = req.query.search as string;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const [staff, total] = await Promise.all([
      Staff.find(query)
        .populate('user', 'email phone isActive lastLoginAt')
        .populate('departmentId', 'name code')
        .populate('branchId', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Staff.countDocuments(query),
    ]);

    sendPaginated(res, staff, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getStaffById = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'email phone isActive lastLoginAt')
      .populate('departmentId', 'name code')
      .populate('branchId', 'name code');
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }
    sendSuccess(res, staff);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'email phone isActive')
      .populate('departmentId', 'name code')
      .populate('branchId', 'name code');
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }
    sendSuccess(res, staff, 'Staff updated successfully');
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'Staff with this email already exists', 409);
      return;
    }
    sendError(res, error.message);
  }
};

export const activateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }
    await User.findByIdAndUpdate(staff.user, { isActive: true });
    sendSuccess(res, staff, 'Staff activated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const deactivateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }
    await User.findByIdAndUpdate(staff.user, { isActive: false });
    sendSuccess(res, staff, 'Staff deactivated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const { location } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ staff: staffId, date: today });
    if (attendance) {
      if (attendance.checkIn) {
        sendError(res, 'Already checked in today', 400);
        return;
      }
      attendance.checkIn = new Date();
      attendance.status = 'present';
      if (location) attendance.location = location;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        staff: staffId,
        date: today,
        checkIn: new Date(),
        status: 'present',
        location,
      });
    }

    sendSuccess(res, attendance, 'Checked in successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const { location } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ staff: staffId, date: today });
    if (!attendance || !attendance.checkIn) {
      sendError(res, 'No check-in found for today', 400);
      return;
    }
    if (attendance.checkOut) {
      sendError(res, 'Already checked out today', 400);
      return;
    }

    attendance.checkOut = new Date();
    if (location) attendance.location = location;
    await attendance.save();

    sendSuccess(res, attendance, 'Checked out successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

    const query: any = { staff: staffId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
      Attendance.countDocuments(query),
    ]);

    sendPaginated(res, attendance, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const createLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await LeaveRequest.create({
      staff: staffId,
      ...req.body,
      totalDays,
    });

    sendSuccess(res, leaveRequest, 'Leave request created', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const staffId = req.query.staffId as string;

    const query: any = {};
    if (status) query.status = status;
    if (staffId) query.staff = staffId;

    const [requests, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('staff', 'employeeId')
        .populate('staff', 'firstName lastName')
        .populate('reviewedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      LeaveRequest.countDocuments(query),
    ]);

    sendPaginated(res, requests, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const approveLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        rejectionReason: req.body.rejectionReason,
      },
      { new: true }
    ).populate('staff', 'firstName lastName employeeId');
    
    if (!leaveRequest) {
      sendError(res, 'Leave request not found', 404);
      return;
    }

    sendSuccess(res, leaveRequest, 'Leave request approved');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const rejectLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        rejectionReason: req.body.rejectionReason,
      },
      { new: true }
    ).populate('staff', 'firstName lastName employeeId');
    
    if (!leaveRequest) {
      sendError(res, 'Leave request not found', 404);
      return;
    }

    sendSuccess(res, leaveRequest, 'Leave request rejected');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const month = req.query.month ? parseInt(req.query.month as string) : null;
    const year = req.query.year ? parseInt(req.query.year as string) : null;
    const status = req.query.status as string;

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const [payroll, total] = await Promise.all([
      Payroll.find(query)
        .populate('staff', 'employeeId')
        .populate('staff', 'firstName lastName')
        .populate('paidBy', 'firstName lastName')
        .sort({ year: -1, month: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Payroll.countDocuments(query),
    ]);

    sendPaginated(res, payroll, total, page, limit);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId, month, year, basicSalary, allowances, deductions } = req.body;
    
    const staff = await Staff.findById(staffId);
    if (!staff) {
      sendError(res, 'Staff not found', 404);
      return;
    }

    const totalAllowances = allowances.reduce((sum: number, a: any) => sum + a.amount, 0);
    const totalDeductions = deductions.reduce((sum: number, d: any) => sum + d.amount, 0);
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const existing = await Payroll.findOne({ staff: staffId, month, year });
    if (existing) {
      sendError(res, 'Payroll already exists for this period', 409);
      return;
    }

    const payroll = await Payroll.create({
      staff: staffId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      grossSalary,
      totalDeductions,
      netSalary,
      status: 'draft',
    });

    sendSuccess(res, payroll, 'Payroll generated successfully', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updatePayrollStatus = async (req: AuthRequest, res: Response) => {
  try {
    const updateData: any = { status: req.body.status };
    if (req.body.status === 'paid') {
      updateData.paidAt = new Date();
      updateData.paidBy = req.user!.id;
      updateData.paymentMethod = req.body.paymentMethod;
      updateData.transactionId = req.body.transactionId;
    }

    const payroll = await Payroll.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('staff', 'firstName lastName employeeId');
    
    if (!payroll) {
      sendError(res, 'Payroll not found', 404);
      return;
    }

    sendSuccess(res, payroll, 'Payroll status updated');
  } catch (error: any) {
    sendError(res, error.message);
  }
};