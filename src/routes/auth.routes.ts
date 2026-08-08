import { Router } from 'express';
import {
  register,
  staffRegister,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  staffRegisterSchema,
  loginSchema,
  verifyEmailSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';
import { authRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/staff-register', authRateLimit, validate(staffRegisterSchema), staffRegister);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', authenticate, validate(refreshTokenSchema), logout);
router.get('/me', authenticate, getMe);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', authRateLimit, validate(resendOTPSchema), resendOTP);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
