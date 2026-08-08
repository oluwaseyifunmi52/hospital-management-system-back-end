import { MedicalRecord } from '../models/MedicalRecord';
import { Prescription } from '../models/Prescription';
import { AppError } from './auth.service';
import { logAction } from '../utils/auditLog';

export class MedicalRecordService {
  static async create(data: {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    diagnosis: string;
    symptoms: string[];
    notes: string;
    attachments: { name: string; url: string }[];
  }) {
    const record = await MedicalRecord.create({
      patient: data.patientId,
      doctor: data.doctorId,
      appointment: data.appointmentId,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      notes: data.notes,
      attachments: data.attachments || [],
    });

    logAction({
      userId: data.doctorId,
      action: 'create_medical_record',
      resourceType: 'MedicalRecord',
      resourceId: record._id.toString(),
      details: { patientId: data.patientId },
    });

    return { record };
  }

  static async getByPatient(patientId: string, page = 1, limit = 10) {
    const query = { patient: patientId };
    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { records, total, page, limit };
  }

  static async getById(id: string, userId?: string, userRole?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medical record ID', 400);
    }
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName email patientId')
      .populate('doctor', 'firstName lastName email');

    if (!record) {
      throw new AppError('Medical record not found', 404);
    }

    if (userId && userRole) {
      const isAuthorized =
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        record.patient._id.toString() === userId ||
        record.doctor._id.toString() === userId;

      if (!isAuthorized) {
        throw new AppError('Not authorized to view this medical record', 403);
      }
    }

    return { record };
  }

  static async update(id: string, data: Partial<{
    diagnosis: string;
    symptoms: string[];
    notes: string;
    attachments: { name: string; url: string }[];
  }>, userId?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medical record ID', 400);
    }
    const record = await MedicalRecord.findById(id);
    if (!record) {
      throw new AppError('Medical record not found', 404);
    }

    Object.assign(record, data);
    await record.save();

    if (userId) {
      logAction({
        userId,
        action: 'update_medical_record',
        resourceType: 'MedicalRecord',
        resourceId: record._id.toString(),
        details: {},
      });
    }

    return { record };
  }
}

export class PrescriptionService {
  static async create(data: {
    patientId: string;
    doctorId: string;
    medicalRecordId?: string;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    notes: string;
  }) {
    const prescription = await Prescription.create({
      patient: data.patientId,
      doctor: data.doctorId,
      medicalRecord: data.medicalRecordId,
      medications: data.medications,
      notes: data.notes,
    });

    logAction({
      userId: data.doctorId,
      action: 'create_prescription',
      resourceType: 'Prescription',
      resourceId: prescription._id.toString(),
      details: { patientId: data.patientId },
    });

    return { prescription };
  }

  static async getByPatient(patientId: string, page = 1, limit = 10) {
    const query = { patient: patientId };
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { prescriptions, total, page, limit };
  }

  static async getById(id: string, userId?: string, userRole?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid prescription ID', 400);
    }
    const prescription = await Prescription.findById(id)
      .populate('patient', 'firstName lastName email patientId')
      .populate('doctor', 'firstName lastName email');

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (userId && userRole) {
      const isAuthorized =
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        userRole === 'pharmacist' ||
        prescription.patient._id.toString() === userId ||
        prescription.doctor._id.toString() === userId;

      if (!isAuthorized) {
        throw new AppError('Not authorized to view this prescription', 403);
      }
    }

    return { prescription };
  }

  static async updateStatus(id: string, status: string, userId?: string, userRole?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid prescription ID', 400);
    }
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (userId && userRole) {
      const isAuthorized =
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        userRole === 'pharmacist' ||
        prescription.patient._id.toString() === userId ||
        prescription.doctor._id.toString() === userId;

      if (!isAuthorized) {
        throw new AppError('Not authorized to update this prescription', 403);
      }
    }

    prescription.status = status as any;
    await prescription.save();

    if (userId) {
      logAction({
        userId,
        action: 'update_prescription_status',
        resourceType: 'Prescription',
        resourceId: prescription._id.toString(),
        details: { status },
      });
    }

    return { prescription };
  }
}
