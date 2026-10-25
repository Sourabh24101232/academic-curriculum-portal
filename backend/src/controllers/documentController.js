import fs from 'node:fs';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import storageService from '../services/storageService.js';

/**
 * Upload Course Syllabus PDF
 * Protected faculty endpoint supporting atomic replacement of official documents.
 */
export const uploadCoursePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError('Valid course offering ID is required.', 400));
    }

    const course = await prisma.courseOffering.findUnique({
      where: { id },
      include: { document: true }
    });

    if (!course) {
      return next(new AppError('Course offering not found.', 404));
    }

    // 1. Save uploaded file to secure storage directory
    const savedFile = storageService.saveFile(req.file.buffer, req.file.originalname);

    // 2. If a previous PDF document exists, remove previous file from disk
    if (course.document) {
      storageService.deleteFile(course.document.storagePath);

      // Update existing record in MySQL
      const updatedDoc = await prisma.courseDocument.update({
        where: { id: course.document.id },
        data: {
          originalFilename: savedFile.originalFilename,
          storagePath: savedFile.storagePath,
          mimeType: 'application/pdf',
          size: savedFile.size,
          checksum: savedFile.checksum,
          uploadedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Official syllabus PDF replaced successfully.',
        document: {
          id: updatedDoc.id,
          originalFilename: updatedDoc.originalFilename,
          size: updatedDoc.size,
          checksum: updatedDoc.checksum,
          uploadedAt: updatedDoc.uploadedAt
        }
      });
    }

    // 3. Create new CourseDocument in MySQL
    const createdDoc = await prisma.courseDocument.create({
      data: {
        courseOfferingId: course.id,
        originalFilename: savedFile.originalFilename,
        storagePath: savedFile.storagePath,
        mimeType: 'application/pdf',
        size: savedFile.size,
        checksum: savedFile.checksum
      }
    });

    res.status(201).json({
      success: true,
      message: 'Official syllabus PDF uploaded successfully.',
      document: {
        id: createdDoc.id,
        originalFilename: createdDoc.originalFilename,
        size: createdDoc.size,
        checksum: createdDoc.checksum,
        uploadedAt: createdDoc.uploadedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Stream Course Syllabus PDF
 * Public endpoint; streams the authentic uploaded file from disk.
 * Non-negotiable Rule: PDFs are NEVER generated dynamically.
 */
export const streamCoursePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError('Valid course offering ID is required.', 400));
    }

    const document = await prisma.courseDocument.findUnique({
      where: { courseOfferingId: id }
    });

    if (!document) {
      return next(new AppError('No official PDF syllabus available for this course.', 404));
    }

    // Validate path traversal security and physical existence
    const safeFilePath = storageService.getFilePath(document.storagePath);

    res.setHeader('Content-Type', document.mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(document.originalFilename)}"`
    );
    res.setHeader('Content-Length', document.size);

    const readStream = fs.createReadStream(safeFilePath);
    readStream.on('error', (err) => {
      next(new AppError('Error reading physical document file.', 500));
    });

    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export default {
  uploadCoursePdf,
  streamCoursePdf
};
