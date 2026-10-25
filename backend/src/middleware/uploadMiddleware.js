import multer from 'multer';
import { MAX_FILE_SIZE_BYTES } from '../config/env.js';
import AppError from '../utils/AppError.js';

// In-memory buffer storage for pre-flight security inspection
const storage = multer.memoryStorage();

// Initial MIME-type filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file format: Only authentic PDF documents are permitted.', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter
});

const multerSinglePdf = upload.single('pdfFile');

/**
 * uploadPdfMiddleware
 * Handles multipart file parsing and strictly inspects file buffer magic bytes (%PDF-).
 * Blocks executables, scripts, or disguised text files.
 */
export const uploadPdfMiddleware = (req, res, next) => {
  multerSinglePdf(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('Please select a PDF syllabus file to upload.', 400));
    }

    const buffer = req.file.buffer;

    // Verify PDF Magic Bytes: ASCII %PDF (0x25 0x50 0x44 0x46)
    const isAuthenticPdf =
      buffer &&
      buffer.length >= 4 &&
      buffer[0] === 0x25 && // %
      buffer[1] === 0x50 && // P
      buffer[2] === 0x44 && // D
      buffer[3] === 0x46;   // F

    if (!isAuthenticPdf) {
      return next(
        new AppError(
          'Invalid file format: File must be an authentic PDF document. Disguised or executable files are strictly rejected.',
          400
        )
      );
    }

    next();
  });
};

export default uploadPdfMiddleware;
