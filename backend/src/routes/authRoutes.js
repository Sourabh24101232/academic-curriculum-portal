import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';

const router = express.Router();

// Faculty Authentication Endpoints
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
export { router as authRoutes };
