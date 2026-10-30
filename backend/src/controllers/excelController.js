import multer from 'multer';
import {
  generateCourseTemplateBuffer,
  parseAndValidateExcelBuffer,
  commitBulkImport
} from '../services/excelService.js';
import { MAX_FILE_SIZE_BYTES } from '../config/env.js';
import AppError from '../utils/AppError.js';

// Multer memory storage configuration for in-memory Excel inspection
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const originalName = file.originalname.toLowerCase();
  const isExcel =
    originalName.endsWith('.xlsx') ||
    originalName.endsWith('.xls') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/octet-stream';

  if (isExcel) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file format: Only Excel (.xlsx, .xls) spreadsheets are permitted.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES || 10485760
  },
  fileFilter
});

const multerSingleExcel = upload.single('excelFile');

/**
 * uploadExcelMiddleware
 * Handles multipart file parsing and validation for uploaded Excel spreadsheets.
 */
export const uploadExcelMiddleware = (req, res, next) => {
  multerSingleExcel(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError('File size exceeds 10 MB limit. Please upload a smaller spreadsheet.', 400)
          );
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('Please select an Excel file to upload.', 400));
    }

    next();
  });
};

/**
 * Download Course Import Excel Template
 * GET /api/admin/courses/template
 * Protected by requireAdmin
 */
export const downloadCourseTemplate = (req, res, next) => {
  try {
    const buffer = generateCourseTemplateBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="IIITBH_Course_Import_Template.xlsx"'
    );
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);
  } catch (error) {
    return next(new AppError(`Failed to generate Excel template: ${error.message}`, 500));
  }
};

/**
 * Preview Bulk Excel Course Upload (Dry Run)
 * POST /api/admin/courses/bulk-preview
 * Protected by requireAdmin and uploadExcelMiddleware
 */
export const previewBulkCourses = async (req, res, next) => {
  try {
    const report = await parseAndValidateExcelBuffer(req.file.buffer);
    return res.status(200).json(report);
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
};

/**
 * Confirm Bulk Excel Course Import (Transactional Commit)
 * POST /api/admin/courses/bulk-confirm
 * Protected by requireAdmin
 */
export const confirmBulkImport = async (req, res, next) => {
  try {
    const { rows, duplicateAction, importStrategy } = req.body;
    const result = await commitBulkImport({
      rows,
      duplicateAction,
      importStrategy
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
};

export default {
  downloadCourseTemplate,
  uploadExcelMiddleware,
  previewBulkCourses,
  confirmBulkImport
};
