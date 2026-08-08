import { Appointment } from '../models/Appointment';
import { MedicalRecord } from '../models/MedicalRecord';
import { User } from '../models/User';
import { Bed, IBed } from '../models/Bed';
import { Admission } from '../models/Admission';
import { LabTestRequest } from '../models/LabTestRequest';
import { RadiologyRequest } from '../models/RadiologyRequest';
import { Prescription } from '../models/Prescription';
import { Bill } from '../models/Bill';
import { Medicine } from '../models/Medicine';
import { InventoryItem } from '../models/InventoryItem';
import { PatientProfile } from '../models/PatientProfile';

export class DashboardService {
  static async getSuperAdminDashboard() {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalNurses = await User.countDocuments({ role: 'nurse' });
    const totalStaff = await User.countDocuments({
      role: { $in: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'laboratory', 'radiologist', 'accountant', 'ambulance_driver', 'admin'] },
    });
    const totalDepartments = await User.countDocuments({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    const todaysAdmissions = await Admission.countDocuments({
      admissionDate: { $gte: today, $lt: tomorrow },
      status: 'admitted',
    });

    const availableBeds = await Bed.countDocuments({ status: 'available' });
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
    const totalBeds = await Bed.countDocuments({});

    const pendingLabTests = await LabTestRequest.countDocuments({
      status: { $in: ['requested', 'sampling', 'processing'] },
    });

    const pendingRadiology = await RadiologyRequest.countDocuments({
      status: { $in: ['requested', 'in_progress'] },
    });

    const pendingBills = await Bill.countDocuments({
      status: { $in: ['unpaid', 'partially_paid'] },
    });

    const todaysRevenueAgg = await Bill.aggregate([
      {
        $match: {
          generatedAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          paid: { $sum: '$paidAmount' },
        },
      },
    ]);

    const todaysRevenue = todaysRevenueAgg[0]?.total || 0;
    const todaysPayments = todaysRevenueAgg[0]?.paid || 0;

    const lowStockMedicines = await Medicine.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    });

    const lowStockInventory = await InventoryItem.countDocuments({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    });

    const unbilledPatients = await Admission.countDocuments({
      status: 'admitted',
    });

    const pendingPrescriptions = await Prescription.countDocuments({
      status: 'active',
    });

    return {
      totalPatients,
      totalDoctors,
      totalNurses,
      totalStaff,
      totalDepartments,
      todaysAppointments,
      todaysAdmissions,
      availableBeds,
      occupiedBeds,
      totalBeds,
      pendingLabTests,
      pendingRadiology,
      pendingBills,
      todaysRevenue,
      todaysPayments,
      lowStockMedicines,
      lowStockInventory,
      unbilledPatients,
      pendingPrescriptions,
    };
  }

  static async getDoctorDashboard(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'pending',
    });

    const totalPatients = await Appointment.distinct('patient', { doctor: doctorId });
    const totalPatientRecords = totalPatients.length;

    const myPatients = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName patientId')
      .distinct('patient');

    const pendingLabRequests = await LabTestRequest.countDocuments({
      doctor: doctorId,
      status: { $in: ['requested', 'sampling', 'processing'] },
    });

    const pendingRadiologyRequests = await RadiologyRequest.countDocuments({
      doctor: doctorId,
      status: { $in: ['requested', 'in_progress'] },
    });

    const myPrescriptions = await Prescription.countDocuments({
      doctor: doctorId,
      status: 'active',
    });

    const todaysRevenueAgg = await Bill.aggregate([
      {
        $match: {
          doctor: doctorId as any,
          generatedAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
        },
      },
    ]);

    return {
      todaysAppointments,
      pendingAppointments,
      totalPatientRecords,
      pendingLabRequests,
      pendingRadiologyRequests,
      myPrescriptions,
      todaysRevenue: todaysRevenueAgg[0]?.totalBilled || 0,
      todaysPayments: todaysRevenueAgg[0]?.totalPaid || 0,
      myPatients,
    };
  }

  static async getNurseDashboard(nurseId: string) {
    const profile = await require('../models/NurseProfile').NurseProfile.findOne({ user: nurseId });

    let wardPatients = 0;
    let assignedWards: any[] = [];

    if (profile && profile.assignedWards && profile.assignedWards.length > 0) {
      const Admissions = await Admission.find({
        bed: { $in: [] },
        status: 'admitted',
      }).populate('bed', 'ward patient');

      const BedModel = require('../models/Bed').Bed;
      const bedsInWards = await BedModel.find({
        ward: { $in: profile.assignedWards },
        status: 'occupied',
      });

      const bedIds = bedsInWards.map((b: any) => b._id);
      const admissions = await Admission.find({
        bed: { $in: bedIds },
        status: 'admitted',
      })
        .populate('patient', 'firstName lastName patientId')
        .populate('bed', 'bedNumber ward')
        .populate('doctor', 'firstName lastName')
        .sort({ admissionDate: -1 });

      wardPatients = admissions.length;
      assignedWards = admissions;
    }

    return {
      assignedWards,
      wardPatients,
      isHeadNurse: profile?.isHeadNurse || false,
    };
  }

  static async getReceptionistDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .sort({ date: 1, time: 1 });

    const availableBeds = await Bed.countDocuments({ status: 'available' });
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });

    const pendingAdmissions = await Admission.countDocuments({
      status: 'admitted',
      admissionDate: { $gte: today, $lt: tomorrow },
    });

    const pendingBills = await Bill.countDocuments({
      status: 'unpaid',
    });

    return {
      todaysAppointments: { count: todaysAppointments.length, data: todaysAppointments },
      availableBeds,
      occupiedBeds,
      pendingAdmissions,
      pendingBills,
    };
  }

  static async getPharmacistDashboard() {
    const lowStockMedicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    }).sort({ currentStock: 1 });

    const expiringSoon = new Date();
    expiringSoon.setDate(expiringSoon.getDate() + 30);
    const expiringMedicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: expiringSoon, $gte: new Date() },
    }).sort({ expiryDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSales = await require('../models/PharmacySale').PharmacySale.aggregate([
      {
        $match: {
          saleDate: { $gte: today, $lt: tomorrow },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingPrescriptions = await Prescription.countDocuments({
      status: 'active',
    });

    return {
      lowStockMedicines: lowStockMedicines.length,
      lowStockList: lowStockMedicines,
      expiringSoon: expiringMedicines.length,
      expiringSoonList: expiringMedicines,
      todaysSales: todaysSales[0]?.totalSales || 0,
      todaysSalesCount: todaysSales[0]?.count || 0,
      pendingPrescriptions,
    };
  }

  static async getAccountantDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
        },
      },
    ]);

    const pendingBills = await Bill.find({
      status: { $in: ['unpaid', 'partially_paid'] },
      balanceAmount: { $gt: 0 },
    })
      .populate('patient', 'firstName lastName patientId')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalOutstanding = await Bill.aggregate([
      {
        $match: {
          status: { $in: ['unpaid', 'partially_paid'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$balanceAmount' },
        },
      },
    ]);

    const paymentsByMethod = await require('../models/Payment').Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      todaysBilled: todaysRevenue[0]?.totalBilled || 0,
      todaysCollected: todaysRevenue[0]?.totalPaid || 0,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      pendingBills: pendingBills.length,
      pendingBillsList: pendingBills,
      paymentsByMethod,
    };
  }

  static async getLaboratoryDashboard() {
    const pendingTests = await LabTestRequest.find({
      status: { $in: ['requested', 'sampling', 'processing'] },
    })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code')
      .sort({ priority: -1, createdAt: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCompleted = await LabTestRequest.countDocuments({
      status: 'completed',
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const urgentCount = await LabTestRequest.countDocuments({
      priority: 'urgent',
      status: { $in: ['requested', 'sampling', 'processing'] },
    });

    const statCount = await LabTestRequest.countDocuments({
      priority: 'stat',
      status: { $in: ['requested', 'sampling', 'processing'] },
    });

    return {
      pendingTests: pendingTests.length,
      pendingTestsList: pendingTests,
      todaysCompleted,
      urgentCount,
      statCount,
    };
  }

  static async getRadiologyDashboard() {
    const pendingRequests = await RadiologyRequest.find({
      status: { $in: ['requested', 'in_progress'] },
    })
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name code')
      .sort({ priority: -1, createdAt: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCompleted = await RadiologyRequest.countDocuments({
      status: 'completed',
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const urgentCount = await RadiologyRequest.countDocuments({
      priority: 'urgent',
      status: { $in: ['requested', 'in_progress'] },
    });

    const statCount = await RadiologyRequest.countDocuments({
      priority: 'stat',
      status: { $in: ['requested', 'in_progress'] },
    });

    return {
      pendingRequests: pendingRequests.length,
      pendingRequestsList: pendingRequests,
      todaysCompleted,
      urgentCount,
      statCount,
    };
  }

  static async getPatientPortalStats(patientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAppointments = await Appointment.countDocuments({
      patient: patientId,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] },
    });

    const upcomingAppointmentList = await Appointment.find({
      patient: patientId,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('doctor', 'firstName lastName')
      .sort({ date: 1, time: 1 })
      .limit(5);

    const medicalRecords = await MedicalRecord.countDocuments({ patient: patientId });
    const prescriptions = await Prescription.countDocuments({ patient: patientId });
    const labRequests = await LabTestRequest.find({ patient: patientId })
      .populate('tests.test', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const bills = await Bill.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingBills = await Bill.countDocuments({
      patient: patientId,
      status: { $in: ['unpaid', 'partially_paid'] },
      balanceAmount: { $gt: 0 },
    });

    const unreadNotifications = await require('../models/Notification').Notification.countDocuments({
      user: patientId,
      isRead: false,
    });

    return {
      upcomingAppointments,
      upcomingAppointmentsList: upcomingAppointmentList,
      medicalRecords,
      prescriptions,
      recentLabRequests: labRequests,
      recentBills: bills,
      pendingBills,
      unreadNotifications,
    };
  }
}
