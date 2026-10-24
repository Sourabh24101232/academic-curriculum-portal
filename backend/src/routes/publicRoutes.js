import express from 'express';
import {
  getProgrammes,
  getFilterOptions,
  getCourses
} from '../controllers/publicCourseController.js';

const router = express.Router();

// Public Academic Filter Endpoints
router.get('/programmes', getProgrammes);
router.get('/filters', getFilterOptions);

// Public Course Offerings Endpoint (Reactive dropdown filters, Strictly NO search bar)
router.get('/courses', getCourses);

export default router;
export { router as publicRoutes };
