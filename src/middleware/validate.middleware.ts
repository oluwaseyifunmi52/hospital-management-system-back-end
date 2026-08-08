import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

export const validate = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
