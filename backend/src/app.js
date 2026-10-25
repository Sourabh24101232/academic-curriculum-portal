import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { CLIENT_URL, NODE_ENV } from './config/env.js';
import sessionMiddleware from './config/session.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import AppError from './utils/AppError.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. CORS configuration with credentials support for session cookies
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

// 3. HTTP Request logger
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 4. Request body parsers (10MB limit for JSON and URL-encoded payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Server-side session management
app.use(sessionMiddleware);

// 6. Public Student Academic Routes
app.use('/api', publicRoutes);

// 7. Course Document Routes (Public streaming & Faculty uploads)
app.use('/api', documentRoutes);

// 8. Faculty Admin Authentication & Management Routes
app.use('/api/admin', authRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Probe
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'IIITBH Curriculum Portal API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch-all route handler for undefined endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find route ${req.originalUrl} on this server`, 404));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
