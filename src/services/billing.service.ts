import { Bill, IBill } from '../models/Bill';
import { Payment, IPayment } from '../models/Payment';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Medicine } from '../models/Medicine';
import { LabTestRequest } from '../models/LabTestRequest';
import { RadiologyRequest } from '../models/RadiologyRequest';
import { Admission } from '../models/Admission';
import { generateOTP } from '../utils/generateOTP';
import { AppError } from './auth.service';
import { logAction } from '../utils/auditLog';
import { createNotification } from '../utils/auditLog';

export class BillingService {
  static async generateInvoiceNumber(): Promise<string> {
    const prefix = 'INV';
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = generateOTP().slice(0, 4);
    return `${prefix}${dateStr}${random}`;
  }

  static async calculateTotals(items: any[], discount: number = 0, tax: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;
    const balanceAmount = totalAmount;
    return { subtotal, discount: discountAmount, tax: taxAmount, totalAmount, balanceAmount };
  }

  static async createBill(data: {
    patientId: string;
    items: { description: string; category: string; quantity: number; unitPrice: number; totalPrice: number }[];
    discount?: number;
    tax?: number;
    admissionId?: string;
    appointmentId?: string;
    doctorId?: string;
    dueDate?: string;
    notes?: string;
    generatedBy: string;
  }) {
    const patient = await User.findById(data.patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    if (patient.role !== 'patient') {
      throw new AppError('User is not a patient', 400);
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const { subtotal, discount, tax, totalAmount, balanceAmount } = await this.calculateTotals(
      data.items,
      data.discount,
      data.tax
    );

    const bill = await Bill.create({
      patient: data.patientId,
      admission: data.admissionId,
      appointment: data.appointmentId,
      doctor: data.doctorId,
      invoiceNumber,
      items: data.items,
      subtotal,
      discount,
      tax,
      totalAmount,
      balanceAmount,
      paymentMethod: 'cash',
      generatedBy: data.generatedBy,
      dueDate: data.dueDate,
      notes: data.notes,
    });

    return { bill };
  }

  static async getAll(query: {
    patientId?: string;
    status?: string;
    paymentMethod?: string;
    date?: string;
    dueDate?: string;
    generatedBy?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.patientId) filter.patient = query.patientId;
    if (query.status) filter.status = query.status;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.generatedBy) filter.generatedBy = query.generatedBy;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.generatedAt = { $gte: startDate, $lt: endDate };
    }
    if (query.dueDate) {
      const startDate = new Date(query.dueDate);
      const endDate = new Date(query.dueDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.dueDate = { $gte: startDate, $lt: endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Bill.countDocuments(filter);
    const bills = await Bill.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('admission')
      .populate('appointment')
      .populate('doctor', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { bills, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bill ID', 400);
    }
    const bill = await Bill.findById(id)
      .populate('patient', 'firstName lastName patientId email phone')
      .populate('admission')
      .populate('appointment', 'date time')
      .populate('doctor', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName role');
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }

    const payments = await Payment.find({ bill: id }).sort({ paymentDate: 1 });
    return { bill, payments };
  }

  static async update(id: string, data: Partial<IBill>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bill ID', 400);
    }
    const bill = await Bill.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    return { bill };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bill ID', 400);
    }
    const paymentExists = await Payment.exists({ bill: id });
    if (paymentExists) {
      throw new AppError('Cannot delete bill with recorded payments', 400);
    }
    const bill = await Bill.findByIdAndDelete(id);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    return { message: 'Bill deleted successfully' };
  }

  static async getByPatient(patientId: string) {
    const bills = await Bill.find({ patient: patientId })
      .populate('admission')
      .populate('appointment', 'date time')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 });
    return { bills };
  }

  static async getOutstandingBills(patientId: string) {
    const bills = await Bill.find({
      patient: patientId,
      status: { $in: ['unpaid', 'partially_paid'] },
      balanceAmount: { $gt: 0 },
    }).sort({ createdAt: -1 });
    return { bills };
  }

  static async convertToPaid(billId: string) {
    if (!billId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bill ID', 400);
    }
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    if (bill.paidAmount >= bill.totalAmount) {
      bill.status = 'paid';
    } else if (bill.paidAmount > 0) {
      bill.status = 'partially_paid';
    }
    await bill.save();
    return { bill };
  }
}

export class PaymentService {
  static async recordPayment(data: {
    billId: string;
    patientId: string;
    amount: number;
    paymentMethod: 'cash' | 'card' | 'insurance' | 'mobile_money' | 'bank_transfer';
    referenceNumber?: string;
    notes?: string;
    collectedBy: string;
  }) {
    if (!data.billId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid bill ID', 400);
    }

    const bill = await Bill.findById(data.billId);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }

    if (bill.patient.toString() !== data.patientId) {
      throw new AppError('Bill does not belong to this patient', 400);
    }

    if (bill.status === 'paid' || bill.status === 'refunded') {
      throw new AppError('Bill is already fully paid or refunded', 400);
    }

    if (data.amount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    if (data.amount > bill.balanceAmount) {
      throw new AppError(
        `Payment amount exceeds balance of ${bill.balanceAmount}`,
        400
      );
    }

    const payment = await Payment.create({
      bill: data.billId,
      patient: data.patientId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      collectedBy: data.collectedBy,
      paymentDate: new Date(),
    });

    bill.paidAmount += data.amount;
    bill.balanceAmount = bill.totalAmount - bill.paidAmount;

    if (bill.balanceAmount <= 0) {
      bill.status = 'paid';
      bill.balanceAmount = 0;
    } else if (bill.paidAmount > 0) {
      bill.status = 'partially_paid';
    }

    await bill.save();

    logAction({
      userId: data.collectedBy,
      action: 'record_payment',
      resourceType: 'Payment',
      resourceId: payment._id.toString(),
      details: {
        billId: data.billId,
        patientId: data.patientId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        billStatus: bill.status,
      },
    });

    createNotification({
      userId: data.patientId,
      title: 'Payment Recorded',
      message: `A payment of ${data.amount} was recorded for your bill ${bill.invoiceNumber}.`,
      type: 'payment',
      relatedId: payment._id.toString(),
      relatedType: 'Payment',
    });

    return { payment, bill };
  }

  static async getAll(query: {
    billId?: string;
    patientId?: string;
    collectedBy?: string;
    paymentMethod?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.billId) filter.bill = query.billId;
    if (query.patientId) filter.patient = query.patientId;
    if (query.collectedBy) filter.collectedBy = query.collectedBy;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.paymentDate = { $gte: startDate, $lt: endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('bill', 'invoiceNumber totalAmount')
      .populate('patient', 'firstName lastName patientId')
      .populate('collectedBy', 'firstName lastName role')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { payments, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid payment ID', 400);
    }
    const payment = await Payment.findById(id)
      .populate('bill', 'invoiceNumber totalAmount balanceAmount')
      .populate('patient', 'firstName lastName patientId')
      .populate('collectedBy', 'firstName lastName role');
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
    return { payment };
  }

  static async refund(id: string, collectedBy: string, notes?: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid payment ID', 400);
    }
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const bill = await Bill.findById(payment.bill);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }

    bill.paidAmount -= payment.amount;
    bill.balanceAmount = bill.totalAmount - bill.paidAmount;

    if (bill.balanceAmount <= 0) {
      bill.status = 'paid';
      bill.balanceAmount = 0;
    } else if (bill.paidAmount > 0) {
      bill.status = 'partially_paid';
    } else {
      bill.status = 'unpaid';
    }

    bill.notes = (bill.notes ? bill.notes + '\n' : '') + `Refund: ${notes || 'No reason provided'} by ${collectedBy}`;
    await bill.save();

    payment.notes = (payment.notes ? payment.notes + '\n' : '') + `Refunded by ${collectedBy}: ${notes || ''}`;
    await payment.save();

    return { payment, bill };
  }

  static async generateReceipt(paymentId: string) {
    if (!paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid payment ID', 400);
    }
    const payment = await Payment.findById(paymentId)
      .populate('bill')
      .populate('patient', 'firstName lastName patientId email')
      .populate('collectedBy', 'firstName lastName');
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const receiptNumber = `RCP${Date.now().toString().slice(-8)}`;
    const receipt = {
      receiptNumber,
      paymentId: payment._id,
      patient: payment.patient,
      bill: payment.bill,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      paymentDate: payment.paymentDate,
      collectedBy: payment.collectedBy,
    };

    return { receipt };
  }
}

export class BillingReportService {
  static async getRevenueReport(query: {
    startDate?: string;
    endDate?: string;
  }) {
    const matchDate: any = {};
    if (query.startDate) matchDate.$gte = new Date(query.startDate);
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setDate(endDate.getDate() + 1);
      matchDate.$lt = endDate;
    }

    const billMatch: any = {};
    if (Object.keys(matchDate).length > 0) {
      billMatch.createdAt = matchDate;
    }

    const billStats = await Bill.aggregate([
      { $match: billMatch },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' },
        },
      },
    ]);

    const paymentMatch: any = {};
    if (Object.keys(matchDate).length > 0) {
      paymentMatch.paymentDate = matchDate;
    }

    const paymentStats = await Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const dailyRevenue = await Bill.aggregate([
      { $match: billMatch },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          total: { $sum: '$totalAmount' },
          paid: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    return {
      summary: billStats[0] || { totalBills: 0, totalRevenue: 0, totalPaid: 0, totalOutstanding: 0, totalDiscount: 0, totalTax: 0 },
      paymentsByType: paymentStats,
      dailyRevenue,
    };
  }

  static async getPatientStatement(patientId: string) {
    const bills = await Bill.find({ patient: patientId }).sort({ createdAt: -1 });
    const payments = await Payment.find({ patient: patientId }).populate('bill', 'invoiceNumber').sort({ paymentDate: -1 });

    const totalBilled = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + b.balanceAmount, 0);

    return {
      patientId,
      totalBilled,
      totalPaid,
      totalOutstanding,
      bills,
      payments,
    };
  }
}
