import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/auth.service';

export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    
    if (!value || !value.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
      return;
    }
    
    next();
  };
};

export const validateObjectIdParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      
      if (!value || !value.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`,
        });
        return;
      }
    }
    
    next();
  };
};