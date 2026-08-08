import { Response } from 'express';
import { PharmacyService } from '../services/pharmacy.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.createMedicine(req.body);
    sendSuccess(res, result, 'Medicine created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.getAllMedicines({
      category: req.query.category as string,
      search: req.query.search as string,
      lowStock: req.query.lowStock === 'true',
      expired: req.query.expired === 'true',
      isActive: req.query.isActive === 'true',
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Medicines retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMedicineById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.getMedicineById(req.params.id);
    sendSuccess(res, result, 'Medicine retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.updateMedicine(req.params.id, req.body);
    sendSuccess(res, result, 'Medicine updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.deleteMedicine(req.params.id);
    sendSuccess(res, result, 'Medicine deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMedicineStock = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.updateStock(
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

export const getLowStockMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.getLowStock();
    sendSuccess(res, result, 'Low stock medicines retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getExpiringSoonMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await PharmacyService.getExpiringSoon(days);
    sendSuccess(res, result, 'Expiring soon medicines retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createPharmacySale = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.createSale({
      ...req.body,
      pharmacistId: req.user!.id,
    });
    sendSuccess(res, result, 'Pharmacy sale created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPharmacySales = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.getAllSales({
      patientId: req.query.patientId as string,
      pharmacistId: req.query.pharmacistId as string,
      date: req.query.date as string,
      paymentMethod: req.query.paymentMethod as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Pharmacy sales retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPharmacySaleById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PharmacyService.getSaleById(req.params.id);
    sendSuccess(res, result, 'Pharmacy sale retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
