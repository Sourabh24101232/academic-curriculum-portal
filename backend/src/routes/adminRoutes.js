import express from 'express';
import { createCourse } from '../controllers/adminCourseController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validateCoursePayload } from '../middleware/validateCourse.js';

const router = express.Router();

// Faculty Course Management Endpoints
router.post('/courses', requireAdmin, validateCoursePayload, createCourse);

export default router;
export { router as adminRoutes };
