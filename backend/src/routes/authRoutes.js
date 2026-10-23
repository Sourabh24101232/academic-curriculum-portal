import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Faculty Authentication Endpoints (with rate limiter guard on login)
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
export { router as authRoutes };
