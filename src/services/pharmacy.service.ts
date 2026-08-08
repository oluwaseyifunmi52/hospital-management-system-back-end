import { Medicine, IMedicine } from '../models/Medicine';
import { PharmacySale, IPharmacySale } from '../models/PharmacySale';
import { User } from '../models/User';
import { AppError } from './auth.service';
import { logAction, createNotification } from '../utils/auditLog';

export class PharmacyService {
  static async createMedicine(data: Partial<IMedicine>) {
    const existing = await Medicine.findOne({
      name: data.name,
      batchNumber: data.batchNumber,
      strength: data.strength,
    });
    if (existing) {
      throw new AppError('Medicine with same name, batch, and strength already exists', 409);
    }
    const medicine = await Medicine.create(data);
    return { medicine };
  }

  static async getAllMedicines(query: {
    category?: string;
    search?: string;
    lowStock?: boolean;
    expired?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.lowStock) {
      filter.currentStock = { $lte: filter.minStockLevel || 0 };
      delete filter.isActive;
    }
    if (query.expired) {
      filter.expiryDate = { $lte: new Date() };
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
        { batchNumber: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const lowStockCount = await Medicine.countDocuments({
      currentStock: { $lte: '$minStockLevel' },
      isActive: true,
    });

    const expiredCount = await Medicine.countDocuments({
      expiryDate: { $lte: new Date() },
      isActive: true,
    });

    return { medicines, total, page, limit, lowStockCount, expiredCount };
  }

  static async getMedicineById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medicine ID', 400);
    }
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return { medicine };
  }

  static async updateMedicine(id: string, data: Partial<IMedicine>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medicine ID', 400);
    }
    const medicine = await Medicine.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return { medicine };
  }

  static async deleteMedicine(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medicine ID', 400);
    }
    const medicine = await Medicine.findByIdAndDelete(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return { message: 'Medicine deleted successfully' };
  }

  static async updateStock(
    id: string,
    quantity: number,
    action: 'add' | 'remove' | 'adjust',
    reason?: string
  ) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medicine ID', 400);
    }
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    if (action === 'add') {
      medicine.currentStock += quantity;
    } else if (action === 'remove') {
      if (medicine.currentStock < quantity) {
        throw new AppError(
          `Insufficient stock. Available: ${medicine.currentStock}, Requested: ${quantity}`,
          400
        );
      }
      medicine.currentStock -= quantity;
    } else {
      medicine.currentStock = quantity;
    }

    await medicine.save();

    const stockInfo: any = {
      medicineId: medicine._id,
      medicineName: medicine.name,
      currentStock: medicine.currentStock,
      minStockLevel: medicine.minStockLevel,
      action,
      quantity,
      reason,
      isLowStock: medicine.currentStock <= medicine.minStockLevel,
      isExpired: medicine.expiryDate && medicine.expiryDate <= new Date(),
    };

    return { medicine, stockInfo };
  }

  static async getStockMovement(medicineId: string) {
    if (!medicineId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid medicine ID', 400);
    }
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return { currentStock: medicine.currentStock, minStockLevel: medicine.minStockLevel };
  }

  static async createSale(data: {
    patientId?: string;
    pharmacistId: string;
    prescriptionId?: string;
    items: { medicineId: string; quantity: number; unitPrice: number; totalPrice: number }[];
    discount?: number;
    tax?: number;
    paymentMethod: 'cash' | 'card' | 'insurance' | 'mobile_money' | 'bank_transfer';
    insuranceId?: string;
    notes?: string;
  }) {
    const medicineIds = data.items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });
    if (medicines.length !== medicineIds.length) {
      throw new AppError('One or more medicines not found', 404);
    }

    for (const item of data.items) {
      const med = medicines.find((m) => m._id.toString() === item.medicineId);
      if (!med) {
        throw new AppError(`Medicine ${item.medicineId} not found`, 404);
      }
      if (med.currentStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${med.name}. Available: ${med.currentStock}`,
          400
        );
      }
    }

    for (const item of data.items) {
      const med = medicines.find((m) => m._id.toString() === item.medicineId);
      if (med) {
        med.currentStock -= item.quantity;
        await med.save();
      }
    }

    const subtotal = data.items.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const totalAmount = subtotal - discount + tax;

    const sale = await PharmacySale.create({
      patient: data.patientId,
      pharmacist: data.pharmacistId,
      prescription: data.prescriptionId,
      items: data.items,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'paid',
      insurance: data.insuranceId,
      notes: data.notes,
      saleDate: new Date(),
    });

    logAction({
      userId: data.pharmacistId,
      action: 'pharmacy_sale',
      resourceType: 'PharmacySale',
      resourceId: sale._id.toString(),
      details: {
        patientId: data.patientId,
        totalAmount,
        itemCount: data.items.length,
      },
    });

    if (data.patientId) {
      createNotification({
        userId: data.patientId,
        title: 'Medication Dispensed',
        message: `Your medication has been dispensed. Total amount: ${totalAmount}.`,
        type: 'prescription',
        relatedId: sale._id.toString(),
        relatedType: 'PharmacySale',
      });
    }

    return { sale };
  }

  static async getAllSales(query: {
    patientId?: string;
    pharmacistId?: string;
    date?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.patientId) filter.patient = query.patientId;
    if (query.pharmacistId) filter.pharmacist = query.pharmacistId;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.saleDate = { $gte: startDate, $lt: endDate };
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await PharmacySale.countDocuments(filter);
    const sales = await PharmacySale.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate('pharmacist', 'firstName lastName')
      .populate('items.medicine', 'name dosageForm strength')
      .populate('prescription')
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { sales, total, page, limit };
  }

  static async getSaleById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid sale ID', 400);
    }
    const sale = await PharmacySale.findById(id)
      .populate('patient', 'firstName lastName patientId')
      .populate('pharmacist', 'firstName lastName')
      .populate('items.medicine', 'name dosageForm strength')
      .populate('prescription')
      .populate('insurance', 'name policyNumber');
    if (!sale) {
      throw new AppError('Pharmacy sale not found', 404);
    }
    return { sale };
  }

  static async getLowStock() {
    const medicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    }).sort({ currentStock: 1 });

    return { medicines, count: medicines.length };
  }

  static async getExpiringSoon(days: number = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: expiryDate, $gte: new Date() },
    }).sort({ expiryDate: 1 });

    return { medicines, count: medicines.length };
  }
}
