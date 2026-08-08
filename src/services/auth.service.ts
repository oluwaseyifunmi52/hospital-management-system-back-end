import { User, IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken';
import { generateOTP, hashOTP } from '../utils/generateOTP';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email';
import { JwtPayload } from '../types';
import crypto from 'crypto';
import { logAction } from '../utils/auditLog';

export class AuthService {
  static async registerPatient(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
  }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(data.password);
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      role: 'patient',
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendVerificationEmail(data.email, otp);

    return {
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }

  static async submitStaffRequest(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const { StaffRequest } = await import('../models/StaffRequest');
    const existingRequest = await StaffRequest.findOne({ email: data.email, status: 'pending' });
    if (existingRequest) {
      throw new AppError('A pending request already exists for this email', 409);
    }

    const request = await StaffRequest.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
    });

    return { request };
  }

  static async login(email: string, password: string, rememberMe = false) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload: JwtPayload = { id: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const refreshExpiry = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({ token: refreshToken, expiresAt: refreshExpiry });
    await user.save();

    user.lastLoginAt = new Date();
    await user.save();

    logAction({
      userId: user._id.toString(),
      action: 'login',
      resourceType: 'Auth',
      details: { email: user.email },
    });

    return {
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }

  static async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const storedToken = user.refreshTokens.find((t) => t.token === token);
    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date() > storedToken.expiresAt) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      await user.save();
      throw new AppError('Refresh token expired', 401);
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  static async logout(userId: string, refreshToken: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    await user.save();

    return { message: 'Logged out successfully' };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { user };
  }

  static async verifyEmail(email: string, otp: string) {
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    if (!user.otp || !user.otpExpires) {
      throw new AppError('No OTP found', 400);
    }

    if (new Date() > user.otpExpires) {
      throw new AppError('OTP has expired', 400);
    }

    const hashedOtp = hashOTP(otp);
    if (hashedOtp !== user.otp) {
      throw new AppError('Invalid OTP', 400);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  static async resendOTP(email: string) {
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, otp);

    return { message: 'OTP resent successfully' };
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset link sent to email' };
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password reset successful' };
  }
}

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
