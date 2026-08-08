import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: false,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: config.smtpUser,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    subject: 'SmartCare - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SmartCare Hospital Management</h2>
        <h3>Email Verification</h3>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #6b7280; margin-top: 20px;">This code expires in 10 minutes.</p>
        <p style="color: #6b7280;">If you did not create an account, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'SmartCare - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SmartCare Hospital Management</h2>
        <h3>Password Reset Request</h3>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Reset Password</a>
        <p style="color: #6b7280; margin-top: 20px;">This link expires in 1 hour.</p>
        <p style="color: #6b7280;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendStaffApprovalEmail = async (
  email: string,
  firstName: string,
  tempPassword: string
) => {
  await sendEmail({
    to: email,
    subject: 'SmartCare - Staff Account Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SmartCare Hospital Management</h2>
        <h3>Your Staff Account Has Been Approved</h3>
        <p>Dear ${firstName},</p>
        <p>Your staff registration has been approved. You can now log in with:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p style="color: #dc2626; margin-top: 10px;">Please change your password after first login.</p>
      </div>
    `,
  });
};

export const sendStaffRejectionEmail = async (
  email: string,
  firstName: string,
  reason: string
) => {
  await sendEmail({
    to: email,
    subject: 'SmartCare - Staff Registration Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SmartCare Hospital Management</h2>
        <h3>Staff Registration Update</h3>
        <p>Dear ${firstName},</p>
        <p>Unfortunately, your staff registration request has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact the administration for more information.</p>
      </div>
    `,
  });
};
