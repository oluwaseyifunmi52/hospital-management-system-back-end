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

    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
    const superAdminPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
    
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12);

    await User.create({
      email: 'admin@smartcare.com',
      password: hashedAdminPassword,
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
      await User.create({
        email: 'superadmin@smartcare.com',
        password: hashedSuperAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1234567890',
        role: 'super_admin',
        isVerified: true,
        isActive: true,
        isProfileComplete: true,
      });
      console.log('Default super_admin account created: superadmin@smartcare.com');
    }

    console.log('Default admin account created: admin@smartcare.com');
    console.log('IMPORTANT: Change default passwords immediately after first login!');
  } catch (error) {
    console.error('Seed error:', error);
  }
};
