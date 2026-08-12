import dotenv from 'dotenv';
dotenv.config();

const validateSecret = (secret: string | undefined, name: string): string => {
  if (!secret) {
    throw new Error(`${name} is required but not set in environment variables`);
  }
  if (secret.length < 32) {
    throw new Error(`${name} must be at least 32 characters long`);
  }
  if (process.env.NODE_ENV === 'production' && (secret.includes('default') || secret.includes('change-in-production') || secret.includes('your-'))) {
    throw new Error(`${name} appears to be a default/placeholder value - use a secure random secret in production`);
  }
  return secret;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcare',
  jwtAccessSecret: validateSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  jwtRefreshSecret: validateSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
