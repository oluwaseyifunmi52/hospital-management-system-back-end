import { DoctorProfile } from '../models/DoctorProfile';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { AppError } from './auth.service';

export class DoctorService {
  static async getProfile(userId: string) {
    const profile = await DoctorProfile.findOne({ user: userId }).populate(
      'user',
      'firstName lastName email phone avatar'
    );

    if (!profile) {
      const user = await User.findById(userId).select('firstName lastName email phone avatar isProfileComplete');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return { isProfileComplete: false, profile: null, user };
    }

    return { isProfileComplete: true, profile };
  }

  static async upsertProfile(userId: string, data: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profile = await DoctorProfile.findOne({ user: userId });

    if (profile) {
      Object.assign(profile, data);
      await profile.save();
    } else {
      profile = await DoctorProfile.create({ user: userId, ...data });
    }

    await User.findByIdAndUpdate(userId, { isProfileComplete: true });

    return { profile };
  }

  static async updateAvailability(userId: string, status: string) {
    const profile = await DoctorProfile.findOne({ user: userId });
    if (!profile) {
      throw new AppError('Doctor profile not found. Please complete your profile first.', 404);
    }

    profile.availabilityStatus = status as any;
    await profile.save();

    return { profile };
  }

  static async getDoctorAppointments(
    userId: string,
    date?: string,
    status?: string,
    page = 1,
    limit = 10
  ) {
    const query: any = { doctor: userId };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { appointments, total, page, limit };
  }

  static async getDoctorPatients(userId: string) {
    const patients = await Appointment.aggregate([
      { $match: { doctor: userId as any } },
      {
        $group: {
          _id: '$patient',
          lastVisit: { $max: '$date' },
          appointmentCount: { $sum: 1 },
        },
      },
      { $sort: { lastVisit: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo',
        },
      },
      {
        $unwind: '$patientInfo',
      },
      {
        $project: {
          _id: 0,
          patientId: '$_id',
          firstName: '$patientInfo.firstName',
          lastName: '$patientInfo.lastName',
          email: '$patientInfo.email',
          lastVisit: 1,
          appointmentCount: 1,
        },
      },
    ]);

    return { patients };
  }

  static async getAllDoctors(
    search?: string,
    specialty?: string,
    page = 1,
    limit = 10
  ) {
    const query: any = { availabilityStatus: { $ne: 'off_duty' } };
    if (specialty) query.specialty = specialty;
    if (search) {
      query.$or = [
        { specialty: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await DoctorProfile.countDocuments(query);
    const doctors = await DoctorProfile.find(query)
      .populate('user', 'firstName lastName email avatar')
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { doctors, total, page, limit };
  }
}
