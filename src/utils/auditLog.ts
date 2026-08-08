import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';

export const logAction = async (data: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await AuditLog.create({
      user: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedId?: string;
  relatedType?: string;
}) => {
  try {
    const notification = await Notification.create({
      user: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority || 'normal',
      relatedId: data.relatedId,
      relatedType: data.relatedType,
    });

    try {
      const { getIO } = await import('../sockets/socket');
      const io = getIO();
      io.to(data.userId).emit('notification:new', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        createdAt: notification.createdAt,
        isRead: false,
      });
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
};

export const createNotificationMany = async (userIds: string[], data: {
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedId?: string;
  relatedType?: string;
}) => {
  try {
    const notifications = await Notification.insertMany(
      userIds.map((userId) => ({
        user: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'normal',
        relatedId: data.relatedId,
        relatedType: data.relatedType,
      }))
    );

    try {
      const { getIO } = await import('../sockets/socket');
      const io = getIO();
      userIds.forEach((userId) => {
        io.to(userId).emit('notification:new', {
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'normal',
        });
      });
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }

    return notifications;
  } catch (error) {
    console.error('Bulk notification error:', error);
    return [];
  }
};
