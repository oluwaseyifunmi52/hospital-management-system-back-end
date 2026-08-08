import { AuditLog, IAuditLog } from '../models/AuditLog';
import { AppError } from './auth.service';

export class AuditLogService {
  static async getAll(query: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.userId) filter.user = query.userId;
    if (query.action) filter.action = { $regex: query.action, $options: 'i' };
    if (query.resourceType) filter.resourceType = query.resourceType;

    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.timestamp.$lt = endDate;
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { logs, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid audit log ID', 400);
    }
    const log = await AuditLog.findById(id).populate('user', 'firstName lastName email role');
    if (!log) {
      throw new AppError('Audit log not found', 404);
    }
    return { log };
  }

  static async getByResource(resourceType: string, resourceId: string) {
    const logs = await AuditLog.find({ resourceType, resourceId })
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 });
    return { logs };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid audit log ID', 400);
    }
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) {
      throw new AppError('Audit log not found', 404);
    }
    return { message: 'Audit log deleted successfully' };
  }

  static async deleteAll() {
    await AuditLog.deleteMany({});
    return { message: 'All audit logs deleted successfully' };
  }

  static async getActionSummary(query: {
    startDate?: string;
    endDate?: string;
  }) {
    const matchDate: any = {};
    if (query.startDate || query.endDate) {
      matchDate.timestamp = {};
      if (query.startDate) matchDate.timestamp.$gte = new Date(query.startDate);
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        matchDate.timestamp.$lt = endDate;
      }
    }

    const summary = await AuditLog.aggregate([
      { $match: matchDate },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastPerformed: { $max: '$timestamp' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byResourceType = await AuditLog.aggregate([
      { $match: matchDate },
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { summary, byResourceType };
  }
}
