import { User } from '../models/User';
import { MedicalRecord } from '../models/MedicalRecord';
import { Prescription } from '../models/Prescription';
import { Appointment } from '../models/Appointment';
import { generatePatientId } from '../utils/generatePatientId';
import { AppError } from './auth.service';

export class PatientService {
  static async getPatientAppointments(userId: string, page = 1, limit = 10) {
    const query = { patient: userId };
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { appointments, total, page, limit };
  }

  static async createAppointment(userId: string, data: {
    doctorId: string;
    date: string;
    time: string;
    type?: string;
    reason?: string;
  }) {
    const doctor = await User.findById(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new AppError('Doctor not found', 404);
    }

    const appointmentDate = new Date(data.date);
    const existing = await Appointment.findOne({
      doctor: data.doctorId,
      date: appointmentDate,
      time: data.time,
      status: { $nin: ['cancelled', 'no_show'] },
    });

    if (existing) {
      throw new AppError('Doctor is not available at this time', 409);
    }

    const appointment = await Appointment.create({
      patient: userId,
      doctor: data.doctorId,
      date: appointmentDate,
      time: data.time,
      type: data.type || 'in_person',
      reason: data.reason,
    });

    return { appointment };
  }

  static async getPatientMedicalRecords(userId: string, page = 1, limit = 10) {
    const query = { patient: userId };
    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { records, total, page, limit };
  }

  static async getPatientPrescriptions(userId: string, page = 1, limit = 10) {
    const query = { patient: userId };
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { prescriptions, total, page, limit };
  }

  static async getAllPatients(search?: string, page = 1, limit = 10) {
    const query: any = { role: 'patient' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const patients = await User.find(query)
      .select('-refreshTokens -otp -otpExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { patients, total, page, limit };
  }
}
