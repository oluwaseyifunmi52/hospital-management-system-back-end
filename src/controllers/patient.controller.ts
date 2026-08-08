import { Response } from 'express';
import { PatientService } from '../services/patient.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const result = await PatientService.getPatientAppointments(
      req.user!.id,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.appointments, 'Appointments retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PatientService.createAppointment(req.user!.id, req.body);
    sendSuccess(res, result, 'Appointment created', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const result = await PatientService.getPatientMedicalRecords(
      req.user!.id,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.records, 'Medical records retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const result = await PatientService.getPatientPrescriptions(
      req.user!.id,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.prescriptions, 'Prescriptions retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const result = await PatientService.getAllPatients(
      search as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.patients, 'Patients retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
