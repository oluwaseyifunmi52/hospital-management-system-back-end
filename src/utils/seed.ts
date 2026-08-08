import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config/env';
import bcrypt from 'bcrypt';

export const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@smartcare.com' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    await User.create({
      email: 'admin@smartcare.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'admin',
      isVerified: true,
      isActive: true,
      isProfileComplete: true,
    });

    const existingSuperAdmin = await User.findOne({ email: 'superadmin@smartcare.com' });
    if (!existingSuperAdmin) {
      const superHashedPassword = await bcrypt.hash('superadmin123', 12);
      await User.create({
        email: 'superadmin@smartcare.com',
        password: superHashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1234567890',
        role: 'super_admin',
        isVerified: true,
        isActive: true,
        isProfileComplete: true,
      });
      console.log('Default super_admin account created: superadmin@smartcare.com / superadmin123');
    }

    console.log('Default admin account created: admin@smartcare.com / admin123');
  } catch (error) {
    console.error('Seed error:', error);
  }
};
