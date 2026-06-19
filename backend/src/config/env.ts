import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()),

  MONGODB_URI: process.env.MONGODB_URI!,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@theinvisiblealgorithm.org',
  FROM_NAME: process.env.FROM_NAME || 'The Invisible Algorithm',

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME || 'Admin',
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME || 'User',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
};
