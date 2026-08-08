import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message),
    });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
