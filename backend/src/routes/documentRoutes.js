import express from 'express';
import {
  uploadCoursePdf,
  streamCoursePdf
} from '../controllers/documentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { uploadPdfMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Course PDF Streaming Endpoint
router.get('/courses/:id/pdf', streamCoursePdf);

// Faculty Protected Course PDF Upload Endpoint
router.post(
  '/admin/courses/:id/pdf',
  requireAdmin,
  uploadPdfMiddleware,
  uploadCoursePdf
);

export default router;
export { router as documentRoutes };
