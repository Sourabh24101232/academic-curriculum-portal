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

export default {
  createCourse,
  getAdminCourses,
  getCourseForEdit
};
