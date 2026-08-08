import { Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DoctorService.getProfile(req.user!.id);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DoctorService.upsertProfile(req.user!.id, req.body);
    sendSuccess(res, result, 'Profile updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DoctorService.updateAvailability(
      req.user!.id,
      req.body.availabilityStatus
    );
    sendSuccess(res, result, 'Availability updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, page = '1', limit = '10' } = req.query;
    const result = await DoctorService.getDoctorAppointments(
      req.user!.id,
      date as string,
      status as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.appointments, 'Appointments retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDoctorPatients = async (req: AuthRequest, res: Response) => {
  try {
    const result = await DoctorService.getDoctorPatients(req.user!.id);
    sendSuccess(res, result.patients, 'Patients retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const { search, specialty, page = '1', limit = '10' } = req.query;
    const result = await DoctorService.getAllDoctors(
      search as string,
      specialty as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.doctors, 'Doctors retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
