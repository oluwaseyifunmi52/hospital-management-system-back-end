import { Ward, IWard } from '../models/Ward';
import { Bed, IBed } from '../models/Bed';
import { Admission, IAdmission } from '../models/Admission';
import { AppError } from './auth.service';
import { logAction, createNotification } from '../utils/auditLog';

export class WardService {
  static async create(data: Partial<IWard>) {
    const existing = await Ward.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Ward with this name already exists', 409);
    }
    const ward = await Ward.create(data);
    return { ward };
  }

  static async getAll(query: {
    type?: string;
    department?: string;
    gender?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.department) filter.department = query.department;
    if (query.gender) filter.gender = query.gender;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Ward.countDocuments(filter);
    const wards = await Ward.find(filter)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { wards, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid ward ID', 400);
    }
    const ward = await Ward.findById(id).populate('department', 'name');
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }
    return { ward };
  }

  static async update(id: string, data: Partial<IWard>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid ward ID', 400);
    }
    const ward = await Ward.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }
    return { ward };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid ward ID', 400);
    }
    const bedCount = await Bed.countDocuments({ ward: id });
    if (bedCount > 0) {
      throw new AppError('Cannot delete ward with assigned beds', 400);
    }
    const ward = await Ward.findByIdAndDelete(id);
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }
    return { message: 'Ward deleted successfully' };
  }

  static async getWardBeds(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid ward ID', 400);
    }
    const ward = await Ward.findById(id);
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }
    const beds = await Bed.find({ ward: id })
      .populate('patient', 'firstName lastName patientId')
      .sort({ bedNumber: 1 });
    return { beds };
  }
}

export class BedService {
  static async create(data: Partial<IBed>) {
    const existing = await Bed.findOne({ bedNumber: data.bedNumber, ward: data.ward });
    if (existing) {
      throw new AppError('Bed with this number already exists in this ward', 409);
    }
    const bed = await Bed.create(data);
    return { bed };
  }

  static async getAll(query: {
    ward?: string;
    status?: string;
    type?: string;
    floor?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.ward) filter.ward = query.ward;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.floor) filter.floor = query.floor;
    if (query.search) {
      filter.bedNumber = { $regex: query.search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Bed.countDocuments(filter);
    const beds = await Bed.find(filter)
      .populate('ward', 'name type')
      .populate('patient', 'firstName lastName patientId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { beds, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bed ID', 400);
    }
    const bed = await Bed.findById(id)
      .populate('ward', 'name type')
      .populate('patient', 'firstName lastName patientId');
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    return { bed };
  }

  static async update(id: string, data: Partial<IBed>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bed ID', 400);
    }
    const bed = await Bed.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    return { bed };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bed ID', 400);
    }
    const bed = await Bed.findByIdAndDelete(id);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    return { message: 'Bed deleted successfully' };
  }

  static async assignPatient(bedId: string, patientId: string) {
    const bed = await Bed.findById(bedId);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    if (bed.status === 'occupied') {
      throw new AppError('Bed is already occupied', 400);
    }
    bed.patient = patientId as any;
    bed.status = 'occupied';
    await bed.save();
    return { bed };
  }

  static async releaseBed(bedId: string) {
    const bed = await Bed.findById(bedId);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    bed.patient = undefined;
    bed.status = 'available';
    await bed.save();
    return { bed };
  }
}

export class AdmissionService {
  static async create(data: {
    patientId: string;
    bedId: string;
    doctorId: string;
    reason: string;
    diagnosis: string;
    type?: 'emergency' | 'planned' | 'transfer';
    notes?: string;
  }) {
    const bed = await Bed.findById(data.bedId);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }
    if (bed.status !== 'available') {
      throw new AppError('Bed is not available', 400);
    }

    const existingAdmission = await Admission.findOne({
      patient: data.patientId,
      status: 'admitted',
    });
    if (existingAdmission) {
      throw new AppError('Patient already has an active admission', 400);
    }

    await BedService.assignPatient(data.bedId, data.patientId);

    const admission = await Admission.create({
      patient: data.patientId,
      bed: data.bedId,
      doctor: data.doctorId,
      reason: data.reason,
      diagnosis: data.diagnosis,
      type: data.type || 'emergency',
      notes: data.notes,
    });

    logAction({
      userId: data.doctorId,
      action: 'create_admission',
      resourceType: 'Admission',
      resourceId: admission._id.toString(),
      details: {
        patientId: data.patientId,
        bedId: data.bedId,
        type: data.type || 'emergency',
      },
    });

    createNotification({
      userId: data.patientId,
      title: 'New Admission',
      message: `You have been admitted. Doctor: ${data.doctorId}. Bed: ${data.bedId}.`,
      type: 'admission',
      relatedId: admission._id.toString(),
      relatedType: 'Admission',
    });

    return { admission };
  }

  static async getAll(query: {
    status?: string;
    patientId?: string;
    doctorId?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.patientId) filter.patient = query.patientId;
    if (query.doctorId) filter.doctor = query.doctorId;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.admissionDate = { $gte: startDate, $lt: endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Admission.countDocuments(filter);
    const admissions = await Admission.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('bed', 'bedNumber ward')
      .populate('doctor', 'firstName lastName')
      .sort({ admissionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { admissions, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid admission ID', 400);
    }
    const admission = await Admission.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('bed', 'bedNumber ward')
      .populate('doctor', 'firstName lastName');
    if (!admission) {
      throw new AppError('Admission not found', 404);
    }
    return { admission };
  }

  static async discharge(id: string, dischargeDate?: Date) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid admission ID', 400);
    }
    const admission = await Admission.findById(id);
    if (!admission) {
      throw new AppError('Admission not found', 404);
    }
    if (admission.status === 'discharged') {
      throw new AppError('Patient already discharged', 400);
    }

    admission.status = 'discharged';
    admission.dischargeDate = dischargeDate || new Date();
    await admission.save();

    await BedService.releaseBed(admission.bed.toString());

    logAction({
      userId: admission.doctor.toString(),
      action: 'discharge_patient',
      resourceType: 'Admission',
      resourceId: admission._id.toString(),
      details: {
        patientId: admission.patient.toString(),
        bedId: admission.bed.toString(),
      },
    });

    createNotification({
      userId: admission.patient.toString(),
      title: 'Discharged',
      message: 'You have been discharged. Thank you for choosing our hospital.',
      type: 'discharge',
      relatedId: admission._id.toString(),
      relatedType: 'Admission',
    });

    return { admission };
  }

  static async transfer(id: string, newBedId: string, reason?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid admission ID', 400);
    }
    const admission = await Admission.findById(id);
    if (!admission) {
      throw new AppError('Admission not found', 404);
    }
    if (admission.status !== 'admitted') {
      throw new AppError('Patient is not currently admitted', 400);
    }

    const newBed = await Bed.findById(newBedId);
    if (!newBed) {
      throw new AppError('New bed not found', 404);
    }
    if (newBed.status !== 'available') {
      throw new AppError('New bed is not available', 400);
    }

    await BedService.releaseBed(admission.bed.toString());
    await BedService.assignPatient(newBedId, admission.patient.toString());

    const oldBedId = admission.bed;
    admission.bed = newBedId as any;
    if (reason) {
      admission.notes = (admission.notes ? admission.notes + '\n' : '') + `Transfer: ${reason}`;
    }
    admission.status = 'transferred';
    await admission.save();

    return { admission };
  }

  static async getPatientAdmissions(patientId: string) {
    const admissions = await Admission.find({ patient: patientId })
      .populate('bed', 'bedNumber ward')
      .populate('doctor', 'firstName lastName')
      .sort({ admissionDate: -1 });
    return { admissions };
  }
}
