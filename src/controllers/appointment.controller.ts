import { Response } from 'express';
import { Appointment } from '../models/Appointment';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';
import { logAction } from '../utils/auditLog';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, date } = req.query;
    const query: any = {};

    if (req.user!.role === 'patient') {
      query.patient = req.user!.id;
    } else if (req.user!.role === 'doctor') {
      query.doctor = req.user!.id;
    }

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName email')
      .sort({ date: -1, time: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    sendSuccess(res, appointments, 'Appointments retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName email');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const userId = req.user!.id;
    const userRole = req.user!.role;
    const isAuthorized =
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      userRole === 'receptionist' ||
      appointment.patient._id.toString() === userId ||
      appointment.doctor._id.toString() === userId;

    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
      return;
    }

    sendSuccess(res, appointment, 'Appointment retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkAppointmentAccess = async (
  appointmentId: string,
  userId: string,
  userRole: string
): Promise<any> => {
  if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError('Invalid appointment ID', 400);
  }
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  const isAuthorized =
    userRole === 'super_admin' ||
    userRole === 'admin' ||
    appointment.patient.toString() === userId ||
    appointment.doctor.toString() === userId;

  if (!isAuthorized) {
    throw new AppError('Not authorized to access this appointment', 403);
  }

  return appointment;
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await checkAppointmentAccess(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    const { status: statusUpdate, notes } = req.body;
    if (statusUpdate) appointment.status = statusUpdate;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    logAction({
      userId: req.user!.id,
      action: 'update_appointment',
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      details: { status: statusUpdate, notes },
    });

    sendSuccess(res, appointment, 'Appointment updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await checkAppointmentAccess(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    if (appointment.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'Appointment already cancelled' });
      return;
    }

    appointment.status = 'cancelled';
    await appointment.save();

    logAction({
      userId: req.user!.id,
      action: 'cancel_appointment',
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      details: {},
    });

    sendSuccess(res, appointment, 'Appointment cancelled');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await checkAppointmentAccess(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    const { date, time } = req.body;

    if (req.user!.role === 'patient') {
      const appointmentDate = new Date(date);
      const existing = await Appointment.findOne({
        doctor: appointment.doctor,
        date: appointmentDate,
        time: time,
        _id: { $ne: appointment._id },
        status: { $nin: ['cancelled', 'no_show'] },
      });
      if (existing) {
        res.status(409).json({ success: false, message: 'Doctor is not available at this time' });
        return;
      }
    }

    appointment.date = new Date(date);
    appointment.time = time;
    appointment.status = 'pending';
    await appointment.save();

    logAction({
      userId: req.user!.id,
      action: 'reschedule_appointment',
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      details: { date, time },
    });

    sendSuccess(res, appointment, 'Appointment rescheduled');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const checkInAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    appointment.status = 'confirmed';
    await appointment.save();

    logAction({
      userId: req.user!.id,
      action: 'check_in_appointment',
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      details: {},
    });

    sendSuccess(res, appointment, 'Patient checked in');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
