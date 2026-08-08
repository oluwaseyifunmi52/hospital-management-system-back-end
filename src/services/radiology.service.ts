import { RadiologyTest, IRadiologyTest } from '../models/RadiologyTest';
import { RadiologyRequest, IRadiologyRequest } from '../models/RadiologyRequest';
import { User } from '../models/User';
import { AppError } from './auth.service';

export class RadiologyService {
  static async createTest(data: Partial<IRadiologyTest>) {
    const existing = await RadiologyTest.findOne({ code: data.code });
    if (existing) {
      throw new AppError('Radiology test with this code already exists', 409);
    }
    const test = await RadiologyTest.create(data);
    return { test };
  }

  static async getAllTests(query: {
    category?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const total = await RadiologyTest.countDocuments(filter);
    const tests = await RadiologyTest.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { tests, total, page, limit };
  }

  static async getTestById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await RadiologyTest.findById(id);
    if (!test) {
      throw new AppError('Radiology test not found', 404);
    }
    return { test };
  }

  static async updateTest(id: string, data: Partial<IRadiologyTest>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await RadiologyTest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!test) {
      throw new AppError('Radiology test not found', 404);
    }
    return { test };
  }

  static async deleteTest(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await RadiologyTest.findByIdAndDelete(id);
    if (!test) {
      throw new AppError('Radiology test not found', 404);
    }
    return { message: 'Radiology test deleted successfully' };
  }
}

export class RadiologyRequestService {
  static async create(data: {
    patientId: string;
    doctorId: string;
    tests: { test: string; notes?: string }[];
    priority: 'normal' | 'urgent' | 'stat';
    notes?: string;
    appointmentId?: string;
    medicalRecordId?: string;
  }) {
    const patient = await User.findById(data.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const doctor = await User.findById(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new AppError('Doctor not found', 404);
    }

    const testIds = data.tests.map((t) => t.test);
    const testDocs = await RadiologyTest.find({ _id: { $in: testIds }, isActive: true });
    if (testDocs.length !== testIds.length) {
      throw new AppError('One or more radiology tests not found or inactive', 404);
    }

    const request = await RadiologyRequest.create({
      patient: data.patientId,
      doctor: data.doctorId,
      tests: data.tests,
      priority: data.priority,
      notes: data.notes,
      appointment: data.appointmentId,
      medicalRecord: data.medicalRecordId,
    });

    return { request };
  }

  static async getAll(query: {
    patientId?: string;
    doctorId?: string;
    status?: string;
    priority?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.patientId) filter.patient = query.patientId;
    if (query.doctorId) filter.doctor = query.doctorId;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await RadiologyRequest.countDocuments(filter);
    const requests = await RadiologyRequest.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await RadiologyRequest.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code category')
      .populate('results.test', 'name code')
      .populate('results.performedBy', 'firstName lastName role')
      .populate('medicalRecord', 'diagnosis');
    if (!request) {
      throw new AppError('Radiology request not found', 404);
    }
    return { request };
  }

  static async updateStatus(id: string, status: string, notes?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await RadiologyRequest.findById(id);
    if (!request) {
      throw new AppError('Radiology request not found', 404);
    }

    request.status = status as any;
    if (notes) request.notes = notes;
    await request.save();

    return { request };
  }

  static async addResult(data: {
    requestId: string;
    results: {
      testId: string;
      findings?: string;
      impression?: string;
      reportFile?: string;
      isNormal?: boolean;
      notes?: string;
      performedBy: string;
      performedAt?: Date;
    }[];
  }) {
    if (!data.requestId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await RadiologyRequest.findById(data.requestId);
    if (!request) {
      throw new AppError('Radiology request not found', 404);
    }

    for (const result of data.results) {
      const existingResultIndex = request.results.findIndex(
        (r) => r.test.toString() === result.testId
      );

      const resultData: any = {
        test: result.testId,
        findings: result.findings,
        impression: result.impression,
        reportFile: result.reportFile,
        isNormal: result.isNormal,
        notes: result.notes,
        performedAt: result.performedAt || new Date(),
        performedBy: result.performedBy,
      };

      if (existingResultIndex >= 0) {
        request.results[existingResultIndex] = resultData;
      } else {
        request.results.push(resultData);
      }
    }

    await request.save();

    return { request };
  }

  static async getPending(query: { priority?: string; page?: number; limit?: number }) {
    const filter: any = { status: { $in: ['requested', 'in_progress'] } };
    if (query.priority) filter.priority = query.priority;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await RadiologyRequest.countDocuments(filter);
    const requests = await RadiologyRequest.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code')
      .sort({ priority: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, limit };
  }
}
