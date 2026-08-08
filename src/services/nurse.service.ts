import { NurseProfile, INurseProfile } from '../models/NurseProfile';
import { VitalSign, IVitalSign, VitalType } from '../models/VitalSign';
import { User } from '../models/User';
import { AppError } from './auth.service';

export class NurseService {
  static async upsertProfile(userId: string, data: Partial<INurseProfile>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.role !== 'nurse') {
      throw new AppError('User is not a nurse', 400);
    }

    let profile = await NurseProfile.findOne({ user: userId });

    if (profile) {
      Object.assign(profile, data);
      await profile.save();
    } else {
      profile = await NurseProfile.create({ user: userId, ...data });
    }

    await User.findByIdAndUpdate(userId, { isProfileComplete: true });

    return { profile };
  }

  static async getProfile(userId: string) {
    const profile = await NurseProfile.findOne({ user: userId })
      .populate('user', 'firstName lastName email phone avatar')
      .populate('assignedWards', 'name type');

    if (!profile) {
      const user = await User.findById(userId).select('firstName lastName email phone avatar isProfileComplete');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return { isProfileComplete: false, profile: null, user };
    }

    return { isProfileComplete: true, profile };
  }

  static async getAllNurses(query: {
    department?: string;
    shift?: string;
    isHeadNurse?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.department) filter.department = query.department;
    if (query.shift) filter.shift = query.shift;
    if (query.isHeadNurse !== undefined) filter.isHeadNurse = query.isHeadNurse;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await NurseProfile.countDocuments(filter);
    const nurses = await NurseProfile.find(filter)
      .populate('user', 'firstName lastName email phone avatar isProfileComplete')
      .populate('assignedWards', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (query.search) {
      const searchFilter: any = {
        $or: [
          { 'user.firstName': { $regex: query.search, $options: 'i' } },
          { 'user.lastName': { $regex: query.search, $options: 'i' } },
          { 'user.email': { $regex: query.search, $options: 'i' } },
          { licenseNumber: { $regex: query.search, $options: 'i' } },
        ],
      };
      const searchTotal = await NurseProfile.countDocuments(searchFilter);
      const searchNurses = await NurseProfile.find(searchFilter)
        .populate('user', 'firstName lastName email phone avatar isProfileComplete')
        .populate('assignedWards', 'name type')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      return { nurses: searchNurses, total: searchTotal, page, limit };
    }

    return { nurses, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid nurse profile ID', 400);
    }
    const profile = await NurseProfile.findById(id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('assignedWards', 'name type');
    if (!profile) {
      throw new AppError('Nurse profile not found', 404);
    }
    return { profile };
  }

  static async delete(userId: string) {
    const profile = await NurseProfile.findOneAndDelete({ user: userId });
    if (!profile) {
      throw new AppError('Nurse profile not found', 404);
    }
    return { message: 'Nurse profile deleted successfully' };
  }
}

export class VitalSignService {
  static async create(data: {
    patientId: string;
    recordedBy: string;
    vitalType: VitalType;
    value: number;
    unit: string;
    notes?: string;
    appointmentId?: string;
  }) {
    const patient = await User.findById(data.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const vitalSign = await VitalSign.create({
      patient: data.patientId,
      recordedBy: data.recordedBy,
      vitalType: data.vitalType,
      value: data.value,
      unit: data.unit,
      notes: data.notes,
      appointment: data.appointmentId,
    });

    return { vitalSign };
  }

  static async getByPatient(patientId: string, query: {
    vitalType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { patient: patientId };
    if (query.vitalType) filter.vitalType = query.vitalType;
    if (query.startDate || query.endDate) {
      filter.recordedAt = {};
      if (query.startDate) filter.recordedAt.$gte = new Date(query.startDate);
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.recordedAt.$lt = endDate;
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const total = await VitalSign.countDocuments(filter);
    const vitalSigns = await VitalSign.find(filter)
      .populate('recordedBy', 'firstName lastName role')
      .populate('appointment', 'date time')
      .sort({ recordedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { vitalSigns, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid vital sign ID', 400);
    }
    const vitalSign = await VitalSign.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('recordedBy', 'firstName lastName role')
      .populate('appointment', 'date time');
    if (!vitalSign) {
      throw new AppError('Vital sign not found', 404);
    }
    return { vitalSign };
  }

  static async update(id: string, data: Partial<IVitalSign>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid vital sign ID', 400);
    }
    const vitalSign = await VitalSign.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!vitalSign) {
      throw new AppError('Vital sign not found', 404);
    }
    return { vitalSign };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid vital sign ID', 400);
    }
    const vitalSign = await VitalSign.findByIdAndDelete(id);
    if (!vitalSign) {
      throw new AppError('Vital sign not found', 404);
    }
    return { message: 'Vital sign deleted successfully' };
  }

  static async getLatestByPatient(patientId: string) {
    const vitalTypes = [
      'blood_pressure',
      'temperature',
      'heart_rate',
      'respiratory_rate',
      'oxygen_saturation',
    ];

    const latest: Record<string, any> = {};
    for (const type of vitalTypes) {
      const record = await VitalSign.findOne({ patient: patientId, vitalType: type }).sort({ recordedAt: -1 });
      if (record) {
        latest[type] = record;
      }
    }
    return { latest };
  }
}
