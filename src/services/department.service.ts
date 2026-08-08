import { Department, IDepartment } from '../models/Department';
import { Service, IService } from '../models/Service';
import { AppError } from './auth.service';

export class DepartmentService {
  static async create(data: Partial<IDepartment>) {
    const existing = await Department.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Department with this name already exists', 409);
    }
    const department = await Department.create(data);
    return { department };
  }

  static async getAll(query: {
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
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Department.countDocuments(filter);
    const departments = await Department.find(filter)
      .populate('head', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { departments, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid department ID', 400);
    }
    const department = await Department.findById(id).populate('head', 'firstName lastName email');
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return { department };
  }

  static async update(id: string, data: Partial<IDepartment>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid department ID', 400);
    }
    const department = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return { department };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid department ID', 400);
    }
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return { message: 'Department deleted successfully' };
  }
}

export class ServiceService {
  static async create(data: Partial<IService>) {
    const existing = await Service.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Service with this name already exists', 409);
    }
    const service = await Service.create(data);
    return { service };
  }

  static async getAll(query: {
    category?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.department) filter.department = query.department;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { services, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid service ID', 400);
    }
    const service = await Service.findById(id).populate('department', 'name');
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    return { service };
  }

  static async update(id: string, data: Partial<IService>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid service ID', 400);
    }
    const service = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    return { service };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid service ID', 400);
    }
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    return { message: 'Service deleted successfully' };
  }
}
