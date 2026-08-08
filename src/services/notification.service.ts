import { Notification, INotification } from '../models/Notification';
import { AppError } from './auth.service';

export class NotificationService {
  static async getAll(userId: string, query: {
    isRead?: boolean;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { user: userId };
    if (query.isRead !== undefined) filter.isRead = query.isRead;
    if (query.type) filter.type = query.type;
    if (query.priority) filter.priority = query.priority;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return { notifications, total, page, limit, unreadCount };
  }

  static async getById(id: string, userId: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid notification ID', 400);
    }
    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return { notification };
  }

  static async markAsRead(id: string, userId: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid notification ID', 400);
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return { notification };
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    return { message: 'All notifications marked as read' };
  }

  static async markAsUnread(id: string, userId: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid notification ID', 400);
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: false },
      { new: true }
    );
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return { notification };
  }

  static async delete(id: string, userId: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid notification ID', 400);
    }
    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return { message: 'Notification deleted successfully' };
  }

  static async deleteAll(userId: string) {
    await Notification.deleteMany({ user: userId });
    return { message: 'All notifications deleted successfully' };
  }

  static async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
    return { count };
  }
}
