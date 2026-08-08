import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.getAll(req.user!.id, {
      isRead: req.query.isRead === 'true',
      type: req.query.type as string,
      priority: req.query.priority as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Notifications retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNotificationById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.getById(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Notification retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.markAsRead(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Notification marked as read');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, result, 'All notifications marked as read');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markNotificationAsUnread = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.markAsUnread(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Notification marked as unread');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.delete(req.params.id, req.user!.id);
    sendSuccess(res, result, 'Notification deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.deleteAll(req.user!.id);
    sendSuccess(res, result, 'All notifications deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUnreadNotificationCount = async (req: AuthRequest, res: Response) => {
  try {
    const result = await NotificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, result, 'Unread notification count retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
