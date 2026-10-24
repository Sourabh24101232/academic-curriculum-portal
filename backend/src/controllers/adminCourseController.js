import fs from 'node:fs';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { ALL_SEMESTERS_LABEL } from '../config/constants.js';

/**
 * Create Course Offering Handler
 * Protected faculty endpoint; directly saves independent course offering to MySQL with immediate visibility.
 */
export const createCourse = async (req, res, next) => {
  try {
    const {
      courseCode,
      courseName,
      programme,
      batch,
      branch,
      semester,
      courseType,
      lecture,
      tutorial,
      practical,
      credits,
      courseObjectives,
      moduleWiseSyllabusText,
      referenceBooksText
    } = req.body;

    const course = await prisma.courseOffering.create({
      data: {
        courseCode,
        courseName,
        programme,
        batch,
        branch,
        semester,
        courseType,
        lecture,
        tutorial,
        practical,
        credits,
        courseObjectives,
        moduleWiseSyllabusText,
        referenceBooksText
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course offering created successfully.',
      course
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Faculty Course Offerings
 * Protected faculty dashboard endpoint supporting multi-parametric filtering.
 */
export const getAdminCourses = async (req, res, next) => {
  try {
    const { programme, batch, branch, semester } = req.query;

    const whereClause = {};

    if (programme && typeof programme === 'string' && programme.trim() !== '') {
      whereClause.programme = programme.trim();
    }

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

    const offerings = await prisma.courseOffering.findMany({
      where: whereClause,
      select: {
        id: true,
        courseCode: true,
        courseName: true,
        programme: true,
        batch: true,
        branch: true,
        semester: true,
        courseType: true,
        lecture: true,
        tutorial: true,
        practical: true,
        credits: true,
        createdAt: true,
        document: {
          select: {
            id: true,
            originalFilename: true,
            uploadedAt: true
          }
        }
      },
      orderBy: [{ semester: 'asc' }, { courseCode: 'asc' }]
    });

    const courses = offerings.map((c) => ({
      id: c.id,
      courseCode: c.courseCode,
      courseName: c.courseName,
      programme: c.programme,
      batch: c.batch,
      branch: c.branch,
      semester: c.semester,
      courseType: c.courseType,
      isElective: c.courseType === 'ELECTIVE',
      lecture: c.lecture,
      tutorial: c.tutorial,
      practical: c.practical,
      credits: c.credits,
      hasOfficialPdf: Boolean(c.document),
      createdAt: c.createdAt
    }));

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Course Offering For Edit Form
 * Protected faculty endpoint returning raw unparsed text and metadata to pre-populate edit forms.
 */
export const getCourseForEdit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError('Valid course offering ID is required.', 400));
    }

    const course = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            originalFilename: true,
            size: true,
            uploadedAt: true
          }
        }
      }
    });

    if (!course) {
      return next(new AppError('Course offering not found.', 404));
    }

    res.status(200).json({
      success: true,
      course: {
        id: course.id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        programme: course.programme,
        batch: course.batch,
        branch: course.branch,
        semester: course.semester,
        courseType: course.courseType,
        isElective: course.courseType === 'ELECTIVE',
        lecture: course.lecture,
        tutorial: course.tutorial,
        practical: course.practical,
        credits: course.credits,
        courseObjectives: course.courseObjectives,
        moduleWiseSyllabusText: course.moduleWiseSyllabusText,
        referenceBooksText: course.referenceBooksText,
        hasOfficialPdf: Boolean(course.document),
        document: course.document,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Course Offering Handler
 * Protected faculty endpoint; detects syllabus text changes against attached official PDF,
 * triggers outdated-pdf warning, and directly updates database records.
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError('Valid course offering ID is required.', 400));
    }

    const existingCourse = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            originalFilename: true
          }
        }
      }
    });

    if (!existingCourse) {
      return next(new AppError('Course offering not found.', 404));
    }

    const {
      courseCode,
      courseName,
      programme,
      batch,
      branch,
      semester,
      courseType,
      lecture,
      tutorial,
      practical,
      credits,
      courseObjectives,
      moduleWiseSyllabusText,
      referenceBooksText
    } = req.body;

    // Detect if syllabus text was modified
    const syllabusModified =
      existingCourse.moduleWiseSyllabusText.trim() !== moduleWiseSyllabusText.trim();

    // Trigger outdated warning if syllabus changed and an official PDF is currently attached
    const outdatedPdfWarning = Boolean(syllabusModified && existingCourse.document);

    const updatedCourse = await prisma.courseOffering.update({
      where: { id },
      data: {
        courseCode,
        courseName,
        programme,
        batch,
        branch,
        semester,
        courseType,
        lecture,
        tutorial,
        practical,
        credits,
        courseObjectives,
        moduleWiseSyllabusText,
        referenceBooksText
      }
    });

    res.status(200).json({
      success: true,
      message: 'Course offering updated successfully.',
      outdatedPdfWarning,
      course: updatedCourse
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Course Offering Handler
 * Protected faculty endpoint; deletes course offering record and cleans up attached physical PDF file from disk.
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError('Valid course offering ID is required.', 400));
    }

    const course = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        document: true
      }
    });

    if (!course) {
      return next(new AppError('Course offering not found.', 404));
    }

    // Safely delete physical PDF file if present on disk
    if (course.document?.storagePath && fs.existsSync(course.document.storagePath)) {
      try {
        fs.unlinkSync(course.document.storagePath);
      } catch (fileErr) {
        console.error(`[WARNING] Failed to remove physical PDF file: ${course.document.storagePath}`, fileErr);
      }
    }

    // Delete course offering from database (CourseDocument cascades automatically via Prisma schema)
    await prisma.courseOffering.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Course offering deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createCourse,
  getAdminCourses,
  getCourseForEdit,
  updateCourse,
  deleteCourse
};
