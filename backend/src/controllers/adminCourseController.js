import prisma from '../config/prisma.js';

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

export default {
  createCourse
};
