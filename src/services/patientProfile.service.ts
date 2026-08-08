import { PatientProfile, IPatientProfile } from '../models/PatientProfile';
import { User } from '../models/User';
import { Insurance, IInsurance } from '../models/Insurance';
import { PatientInsurance, IPatientInsurance } from '../models/PatientInsurance';
import { generatePatientId } from '../utils/generatePatientId';
import { AppError } from './auth.service';
import { logAction } from '../utils/auditLog';

export class PatientProfileService {
  static async create(data: {
    userId: string;
    patientId?: string;
    address?: any;
    emergencyContact?: any;
    nextOfKin?: any;
    bloodGroup?: string;
    genotype?: string;
    allergies?: string[];
    medicalHistory?: any[];
    height?: number;
    weight?: number;
    medicalConditions?: string[];
    surgicalHistory?: string[];
    familyHistory?: string[];
    socialHistory?: string;
    maritalStatus?: string;
    occupation?: string;
    religion?: string;
    photo?: string;
  }) {
    const existing = await PatientProfile.findOne({ user: data.userId });
    if (existing) {
      throw new AppError('Patient profile already exists for this user', 409);
    }

    const patientId = data.patientId || generatePatientId();

    const existingById = await PatientProfile.findOne({ patientId });
    if (existingById) {
      throw new AppError('Patient ID already in use', 409);
    }

    const user = await User.findById(data.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'patient') {
      throw new AppError('User is not a patient', 400);
    }

    user.patientId = patientId;

    const profile = await PatientProfile.create({
      user: data.userId,
      patientId,
      address: data.address,
      emergencyContact: data.emergencyContact,
      nextOfKin: data.nextOfKin,
      bloodGroup: data.bloodGroup,
      genotype: data.genotype,
      allergies: data.allergies || [],
      medicalHistory: data.medicalHistory || [],
      height: data.height,
      weight: data.weight,
      medicalConditions: data.medicalConditions || [],
      surgicalHistory: data.surgicalHistory || [],
      familyHistory: data.familyHistory || [],
      socialHistory: data.socialHistory,
      maritalStatus: data.maritalStatus,
      occupation: data.occupation,
      religion: data.religion,
      photo: data.photo,
    });

    await user.save();

    logAction({
      userId: data.userId,
      action: 'create_patient_profile',
      resourceType: 'PatientProfile',
      resourceId: profile._id.toString(),
      details: { patientId },
    });

    return { profile };
  }

  static async getByUserId(userId: string) {
    const profile = await PatientProfile.findOne({ user: userId }).populate(
      'user',
      'firstName lastName email phone dateOfBirth gender avatar'
    );
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }
    return { profile };
  }

  static async getByPatientId(patientId: string) {
    const profile = await PatientProfile.findOne({ patientId }).populate(
      'user',
      'firstName lastName email phone dateOfBirth gender avatar'
    );
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }
    return { profile };
  }

  static async getAll(query: {
    search?: string;
    bloodGroup?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.bloodGroup) filter.bloodGroup = query.bloodGroup;
    if (query.search) {
      filter.$or = [
        { patientId: { $regex: query.search, $options: 'i' } },
        { 'emergencyContact.name': { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await PatientProfile.countDocuments(filter);
    const profiles = await PatientProfile.find(filter)
      .populate('user', 'firstName lastName email phone dateOfBirth gender')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { profiles, total, page, limit };
  }

  static async update(userId: string, data: Partial<IPatientProfile>) {
    const profile = await PatientProfile.findOneAndUpdate({ user: userId }, data, {
      new: true,
      runValidators: true,
    });
    if (!profile) {
      throw new AppError('Patient profile not found', 404);
    }
    return { profile };
  }

  static async getPatientList(query: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { 'user.firstName': { $regex: query.search, $options: 'i' } },
        { 'user.lastName': { $regex: query.search, $options: 'i' } },
        { patientId: { $regex: query.search, $options: 'i' } },
        { 'emergencyContact.name': { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await PatientProfile.countDocuments(filter);
    const profiles = await PatientProfile.find(filter)
      .populate('user', 'firstName lastName email phone dateOfBirth gender')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { profiles, total, page, limit };
  }
}

export class InsuranceService {
  static async createInsurance(data: Partial<IInsurance>) {
    const existing = await Insurance.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Insurance with this name already exists', 409);
    }
    const insurance = await Insurance.create(data);
    return { insurance };
  }

  static async getAllInsurances(query: {
    type?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Insurance.countDocuments(filter);
    const insurances = await Insurance.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { insurances, total, page, limit };
  }

  static async getInsuranceById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid insurance ID', 400);
    }
    const insurance = await Insurance.findById(id);
    if (!insurance) {
      throw new AppError('Insurance not found', 404);
    }
    return { insurance };
  }

  static async updateInsurance(id: string, data: Partial<IInsurance>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid insurance ID', 400);
    }
    const insurance = await Insurance.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!insurance) {
      throw new AppError('Insurance not found', 404);
    }
    return { insurance };
  }

  static async deleteInsurance(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid insurance ID', 400);
    }
    const insurance = await Insurance.findByIdAndDelete(id);
    if (!insurance) {
      throw new AppError('Insurance not found', 404);
    }
    return { message: 'Insurance deleted successfully' };
  }

  static async enrollPatient(data: {
    patientId: string;
    insuranceId: string;
    policyNumber: string;
    validFrom: Date;
    validTo: Date;
    isActive?: boolean;
    coveredServices?: string[];
  }) {
    const patient = await User.findById(data.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    if (patient.role !== 'patient') {
      throw new AppError('User is not a patient', 400);
    }

    const insurance = await Insurance.findById(data.insuranceId);
    if (!insurance) {
      throw new AppError('Insurance not found', 404);
    }

    const existing = await PatientInsurance.findOne({
      patient: data.patientId,
      insurance: data.insuranceId,
      isActive: true,
    });
    if (existing) {
      throw new AppError('Patient already enrolled in this insurance', 409);
    }

    const enrollment = await PatientInsurance.create({
      patient: data.patientId,
      insurance: data.insuranceId,
      policyNumber: data.policyNumber,
      validFrom: data.validFrom,
      validTo: data.validTo,
      isActive: data.isActive ?? true,
      coveredServices: data.coveredServices || [],
    });

    return { enrollment };
  }

  static async getPatientInsurances(patientId: string) {
    const enrollments = await PatientInsurance.find({ patient: patientId })
      .populate('insurance')
      .sort({ createdAt: -1 });
    return { enrollments };
  }

  static async getPatientInsuranceById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid enrollment ID', 400);
    }
    const enrollment = await PatientInsurance.findById(id).populate('insurance');
    if (!enrollment) {
      throw new AppError('Patient insurance enrollment not found', 404);
    }
    return { enrollment };
  }

  static async updatePatientInsurance(id: string, data: Partial<IPatientInsurance>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid enrollment ID', 400);
    }
    const enrollment = await PatientInsurance.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!enrollment) {
      throw new AppError('Patient insurance enrollment not found', 404);
    }
    return { enrollment };
  }
}
