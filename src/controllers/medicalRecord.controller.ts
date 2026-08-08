import { Response } from 'express';
import { MedicalRecordService, PrescriptionService } from '../services/medicalRecord.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const result = await MedicalRecordService.create({
      patientId: req.body.patientId,
      doctorId: req.user!.id,
      appointmentId: req.body.appointmentId,
      diagnosis: req.body.diagnosis,
      symptoms: req.body.symptoms,
      notes: req.body.notes,
      attachments: req.body.attachments,
    });
    sendSuccess(res, result, 'Medical record created', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMedicalRecordsByPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const patientId = req.user!.role === 'patient' ? req.user!.id : req.params.patientId;
    const result = await MedicalRecordService.getByPatient(
      patientId,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.records, 'Medical records retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMedicalRecordById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await MedicalRecordService.getById(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, result.record, 'Medical record retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const result = await MedicalRecordService.update(req.params.id, req.body, req.user!.id);
    sendSuccess(res, result.record, 'Medical record updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PrescriptionService.create({
      patientId: req.body.patientId,
      doctorId: req.user!.id,
      medicalRecordId: req.body.medicalRecordId,
      medications: req.body.medications,
      notes: req.body.notes,
    });
    sendSuccess(res, result, 'Prescription created', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPrescriptionsByPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const patientId = req.user!.role === 'patient' ? req.user!.id : req.params.patientId;
    const result = await PrescriptionService.getByPatient(
      patientId,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendSuccess(res, result.prescriptions, 'Prescriptions retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PrescriptionService.getById(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, result.prescription, 'Prescription retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePrescriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PrescriptionService.updateStatus(
      req.params.id,
      req.body.status,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, result.prescription, 'Prescription status updated');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
