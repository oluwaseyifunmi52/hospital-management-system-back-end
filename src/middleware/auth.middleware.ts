import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/generateToken';
import { AuthRequest } from '../types';
import { User } from '../models/User';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
