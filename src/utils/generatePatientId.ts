import crypto from 'crypto';

export const generatePatientId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SC-${timestamp}-${random}`;
};
