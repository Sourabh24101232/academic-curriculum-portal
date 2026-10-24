import express from 'express';
import {
  getProgrammes,
  getFilterOptions
} from '../controllers/publicCourseController.js';

const router = express.Router();

// Public Academic Filter Endpoints
router.get('/programmes', getProgrammes);
router.get('/filters', getFilterOptions);

export default router;
export { router as publicRoutes };
