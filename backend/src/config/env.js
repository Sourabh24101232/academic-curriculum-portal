import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARNING] Missing required environment variable: ${envVar}. Ensure it is defined in .env`);
  }
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default_insecure_session_secret',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 86400000, // 24 hours
  UPLOAD_DIR: process.env.UPLOAD_DIR
    ? path.resolve(__dirname, '../../', process.env.UPLOAD_DIR, 'syllabi')
    : path.resolve(__dirname, '../../uploads/syllabi'),
  MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES, 10) || 10485760, // 10 MB
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@iiitbh.ac.in',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@IIITBH2026'
};

export const {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  DATABASE_URL,
  SESSION_SECRET,
  SESSION_MAX_AGE,
  UPLOAD_DIR,
  MAX_FILE_SIZE_BYTES,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD
} = env;

export default env;
