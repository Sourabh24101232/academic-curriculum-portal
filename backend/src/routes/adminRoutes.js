import express from 'express';
import {
  createCourse,
  getAdminCourses,
  getCourseForEdit,
  updateCourse,
  deleteCourse
} from '../controllers/adminCourseController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validateCoursePayload } from '../middleware/validateCourse.js';

const router = express.Router();

// Faculty Course Management Endpoints
router.post('/courses', requireAdmin, validateCoursePayload, createCourse);
router.get('/courses', requireAdmin, getAdminCourses);
router.get('/courses/:id', requireAdmin, getCourseForEdit);
router.put('/courses/:id', requireAdmin, validateCoursePayload, updateCourse);
router.delete('/courses/:id', requireAdmin, deleteCourse);

export default router;
export { router as adminRoutes };
