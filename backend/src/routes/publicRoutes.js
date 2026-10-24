import express from 'express';
import {
  getProgrammes,
  getFilterOptions,
  getCourses,
  getCourseDetails
} from '../controllers/publicCourseController.js';

const router = express.Router();

// Public Academic Filter Endpoints
router.get('/programmes', getProgrammes);
router.get('/filters', getFilterOptions);

// Public Course Offerings Endpoints
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseDetails);

export default router;
export { router as publicRoutes };
