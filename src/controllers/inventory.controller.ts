import { Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.createItem(req.body);
    sendSuccess(res, result, 'Inventory item created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInventoryItems = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.getAll({
      category: req.query.category as string,
      itemType: req.query.itemType as string,
      search: req.query.search as string,
      lowStock: req.query.lowStock === 'true',
      expired: req.query.expired === 'true',
      status: req.query.status as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Inventory items retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInventoryItemById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.getById(req.params.id);
    sendSuccess(res, result, 'Inventory item retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Inventory item updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.delete(req.params.id);
    sendSuccess(res, result, 'Inventory item deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateInventoryStock = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.updateStock(
      req.params.id,
      req.body.quantity,
      req.body.action,
      req.body.reason
    );
    sendSuccess(res, result, 'Stock updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLowStockItems = async (req: AuthRequest, res: Response) => {
  try {
    const result = await InventoryService.getLowStock();
    sendSuccess(res, result, 'Low stock items retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getExpiringSoonItems = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await InventoryService.getExpiringSoon(days);
    sendSuccess(res, result, 'Expiring soon items retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
