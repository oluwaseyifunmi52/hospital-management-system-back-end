import { Request, Response } from 'express';
import { AuthService, AppError } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerPatient(req.body);
    sendSuccess(res, result, 'Account created. Please verify your email.', 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const staffRegister = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.submitStaffRequest(req.body);
    sendSuccess(
      res,
      result,
      'Registration request submitted. Waiting for admin approval.',
      201
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await AuthService.login(email, password, rememberMe);
    sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await AuthService.refreshToken(token);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await AuthService.logout(req.user!.id, token);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.getMe(req.user!.id);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await AuthService.verifyEmail(email, otp);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await AuthService.resendOTP(email);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
