import { LabTest, ILabTest } from '../models/LabTest';
import { LabTestCategory, ILabTestCategory } from '../models/LabTestCategory';
import { LabTestRequest, ILabTestRequest } from '../models/LabTestRequest';
import { User } from '../models/User';
import { AppError } from './auth.service';
import { logAction, createNotification } from '../utils/auditLog';

export class LabTestService {
  static async createCategory(data: { name: string; description?: string; isActive?: boolean }) {
    const existing = await LabTestCategory.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Lab test category with this name already exists', 409);
    }
    const category = await LabTestCategory.create(data);
    return { category };
  }

  static async getAllCategories(query: { isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const page = query.page || 1;
    const limit = query.limit || 50;
    const total = await LabTestCategory.countDocuments(filter);
    const categories = await LabTestCategory.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { categories, total, page, limit };
  }

  static async updateCategory(id: string, data: Partial<ILabTestCategory>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid category ID', 400);
    }
    const category = await LabTestCategory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new AppError('Lab test category not found', 404);
    }
    return { category };
  }

  static async deleteCategory(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid category ID', 400);
    }
    const testCount = await LabTest.countDocuments({ category: id });
    if (testCount > 0) {
      throw new AppError('Cannot delete category with associated tests', 400);
    }
    const category = await LabTestCategory.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Lab test category not found', 404);
    }
    return { message: 'Category deleted successfully' };
  }

  static async createTest(data: Partial<ILabTest>) {
    const existing = await LabTest.findOne({ code: data.code });
    if (existing) {
      throw new AppError('Lab test with this code already exists', 409);
    }
    const test = await LabTest.create(data);
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
    const total = await LabTest.countDocuments(filter);
    const tests = await LabTest.find(filter)
      .populate('category', 'name')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { tests, total, page, limit };
  }

  static async getTestById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await LabTest.findById(id).populate('category', 'name');
    if (!test) {
      throw new AppError('Lab test not found', 404);
    }
    return { test };
  }

  static async updateTest(id: string, data: Partial<ILabTest>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await LabTest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!test) {
      throw new AppError('Lab test not found', 404);
    }
    return { test };
  }

  static async deleteTest(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid test ID', 400);
    }
    const test = await LabTest.findByIdAndDelete(id);
    if (!test) {
      throw new AppError('Lab test not found', 404);
    }
    return { message: 'Lab test deleted successfully' };
  }
}

export class LabTestRequestService {
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
    const testDocs = await LabTest.find({ _id: { $in: testIds }, isActive: true });
    if (testDocs.length !== testIds.length) {
      throw new AppError('One or more lab tests not found or inactive', 404);
    }

    const request = await LabTestRequest.create({
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
    const total = await LabTestRequest.countDocuments(filter);
    const requests = await LabTestRequest.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code unit')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await LabTestRequest.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code unit normalRange')
      .populate('results.test', 'name code unit normalRange')
      .populate('results.performedBy', 'firstName lastName role')
      .populate('medicalRecord', 'diagnosis');
    if (!request) {
      throw new AppError('Lab test request not found', 404);
    }
    return { request };
  }

  static async updateStatus(id: string, status: string, notes?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await LabTestRequest.findById(id);
    if (!request) {
      throw new AppError('Lab test request not found', 404);
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
      value?: number;
      unit?: string;
      resultText?: string;
      isAbnormal?: boolean;
      notes?: string;
      performedBy: string;
    }[];
  }) {
    if (!data.requestId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid request ID', 400);
    }
    const request = await LabTestRequest.findById(data.requestId);
    if (!request) {
      throw new AppError('Lab test request not found', 404);
    }

    for (const result of data.results) {
      const existingResultIndex = request.results.findIndex(
        (r) => r.test.toString() === result.testId
      );

      const resultData: any = {
        test: result.testId,
        value: result.value,
        unit: result.unit,
        resultText: result.resultText,
        isAbnormal: result.isAbnormal,
        notes: result.notes,
        performedAt: new Date(),
        performedBy: result.performedBy,
      };

      if (existingResultIndex >= 0) {
        request.results[existingResultIndex] = resultData;
      } else {
        request.results.push(resultData);
      }
    }

    await request.save();

    const performedBy = data.results[0]?.performedBy || request.doctor.toString();

    logAction({
      userId: performedBy,
      action: 'enter_lab_results',
      resourceType: 'LabTestRequest',
      resourceId: request._id.toString(),
      details: {
        resultsCount: data.results.length,
      },
    });

    createNotification({
      userId: request.doctor.toString(),
      title: 'Lab Results Available',
      message: 'Lab results have been entered for your patient.',
      type: 'lab_result',
      relatedId: request._id.toString(),
      relatedType: 'LabTestRequest',
    });

    return { request };
  }

  static async getPending(query: { priority?: string; page?: number; limit?: number }) {
    const filter: any = { status: { $in: ['requested', 'sampling', 'processing'] } };
    if (query.priority) filter.priority = query.priority;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await LabTestRequest.countDocuments(filter);
    const requests = await LabTestRequest.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code')
      .sort({ priority: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { requests, total, page, limit };
  }
}
