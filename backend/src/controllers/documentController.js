import fs from 'node:fs';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import storageService from '../services/storageService.js';
import { generateSyllabiArchive } from '../services/zipService.js';
import { PROGRAMMES, ALL_SEMESTERS_LABEL } from '../config/constants.js';

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

/**
 * Download All Syllabi as a Filtered ZIP Archive
 * Bundles authentic physical PDFs and an audit manifest (README_SYLLABI.txt).
 * Streaming pipeline directly piped to the client response.
 */
export const downloadAllSyllabiZip = async (req, res, next) => {
  try {
    const { programme, batch, branch, semester } = req.query;

    // 1. Mandatory Programme parameter validation
    if (!programme || typeof programme !== 'string' || !PROGRAMMES.includes(programme.trim())) {
      return next(
        new AppError(
          `Programme selection is required and must be one of: ${PROGRAMMES.join(', ')}.`,
          400
        )
      );
    }

    const cleanProgramme = programme.trim();

    // 2. Build Prisma filter conditions matching active dropdowns
    const whereClause = {
      programme: cleanProgramme
    };

    if (batch && typeof batch === 'string' && batch.trim() !== '') {
      whereClause.batch = batch.trim();
    }

    if (branch && typeof branch === 'string' && branch.trim() !== '') {
      whereClause.branch = branch.trim();
    }

    if (
      semester &&
      typeof semester === 'string' &&
      semester.trim() !== '' &&
      semester.trim() !== ALL_SEMESTERS_LABEL
    ) {
      whereClause.semester = semester.trim();
    }

    // 3. Query all matching offerings with attached document records
    const courses = await prisma.courseOffering.findMany({
      where: whereClause,
      include: {
        document: true
      },
      orderBy: [{ semester: 'asc' }, { courseCode: 'asc' }]
    });

    if (!courses || courses.length === 0) {
      return next(new AppError('No courses found matching selected filters.', 404));
    }

    // 4. Determine institutional archive filename
    const parts = ['IIITBH', 'Syllabi', cleanProgramme];
    if (whereClause.branch) parts.push(whereClause.branch);
    if (whereClause.semester) {
      parts.push(whereClause.semester.replace(/\s+/g, ''));
    } else if (semester === ALL_SEMESTERS_LABEL) {
      parts.push('AllSemesters');
    }
    const zipFilename = `${parts.join('_')}.zip`;

    // 5. Configure response headers for streaming attachment
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(zipFilename)}"`
    );

    // 6. Generate archiver instance
    const archive = generateSyllabiArchive({
      courses,
      filterParams: {
        programme: cleanProgramme,
        batch: whereClause.batch,
        branch: whereClause.branch,
        semester: semester || 'All Semesters'
      }
    });

    archive.on('error', (err) => {
      if (!res.headersSent) {
        return next(new AppError('Failed to generate ZIP archive.', 500));
      }
      console.error('[ZIP_ARCHIVE_STREAM_ERROR]', err);
    });

    // 7. Pipe directly into HTTP response and finalize
    archive.pipe(res);
    await archive.finalize();
  } catch (err) {
    next(err);
  }
};

export default {
  uploadCoursePdf,
  streamCoursePdf,
  downloadAllSyllabiZip
};
