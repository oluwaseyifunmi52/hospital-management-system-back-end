import { Response } from 'express';
import { BillingService, PaymentService, BillingReportService } from '../services/billing.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../services/auth.service';

export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.createBill({
      ...req.body,
      generatedBy: req.user!.id,
    });
    sendSuccess(res, result, 'Bill created successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBills = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.getAll({
      patientId: req.query.patientId as string,
      status: req.query.status as string,
      paymentMethod: req.query.paymentMethod as string,
      date: req.query.date as string,
      dueDate: req.query.dueDate as string,
      generatedBy: req.query.generatedBy as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Bills retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBillById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.getById(req.params.id);
    sendSuccess(res, result, 'Bill retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBill = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.update(req.params.id, req.body);
    sendSuccess(res, result, 'Bill updated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteBill = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.delete(req.params.id);
    sendSuccess(res, result, 'Bill deleted successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBillsByPatient = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.getByPatient(req.params.patientId);
    sendSuccess(res, result, 'Patient bills retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOutstandingBills = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingService.getOutstandingBills(req.params.patientId);
    sendSuccess(res, result, 'Outstanding bills retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.recordPayment({
      billId: req.params.billId,
      patientId: req.params.patientId,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      referenceNumber: req.body.referenceNumber,
      notes: req.body.notes,
      collectedBy: req.user!.id,
    });
    sendSuccess(res, result, 'Payment recorded successfully', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.getAll({
      billId: req.query.billId as string,
      patientId: req.query.patientId as string,
      collectedBy: req.query.collectedBy as string,
      paymentMethod: req.query.paymentMethod as string,
      date: req.query.date as string,
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
    });
    sendSuccess(res, result, 'Payments retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.getById(req.params.id);
    sendSuccess(res, result, 'Payment retrieved');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refundPayment = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.refund(req.params.id, req.user!.id, req.body.reason);
    sendSuccess(res, result, 'Payment refunded successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const generateReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.generateReceipt(req.params.id);
    sendSuccess(res, result, 'Receipt generated successfully');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRevenueReport = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingReportService.getRevenueReport({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });
    sendSuccess(res, result, 'Revenue report retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPatientStatement = async (req: AuthRequest, res: Response) => {
  try {
    const result = await BillingReportService.getPatientStatement(req.params.patientId);
    sendSuccess(res, result, 'Patient statement retrieved');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
