import { generateCourseTemplateBuffer } from '../services/excelService.js';
import AppError from '../utils/AppError.js';

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

export default {
  downloadCourseTemplate
};
