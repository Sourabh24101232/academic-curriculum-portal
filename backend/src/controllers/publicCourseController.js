import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { parseModuleSyllabus } from '../utils/moduleParser.js';
import {
  PROGRAMMES,
  PROGRAMME_BATCHES,
  PROGRAMME_BRANCHES,
  PROGRAMME_SEMESTERS,
  ALL_SEMESTERS_LABEL
} from '../config/constants.js';

/**
 * Get Supported Academic Programmes
 * Public endpoint consumed by student portal programme-selection gate.
 */
export const getProgrammes = (req, res) => {
  res.status(200).json({
    success: true,
    programmes: PROGRAMMES
  });
};

/**
 * Get Dynamic Filter Options for a Selected Programme
 * Retrieves active batches from database and constants, alongside configured branches and semesters.
 */
export const getFilterOptions = async (req, res, next) => {
  try {
    const { programme } = req.query;

    if (!programme || typeof programme !== 'string' || !PROGRAMMES.includes(programme.trim())) {
      return next(
        new AppError(
          `Programme parameter is required and must be one of: ${PROGRAMMES.join(', ')}.`,
          400
        )
      );
    }

    const cleanProgramme = programme.trim();

    // 1. Fetch distinct batches currently existing in the database for this programme
    const distinctBatchRecords = await prisma.courseOffering.findMany({
      where: { programme: cleanProgramme },
      select: { batch: true },
      distinct: ['batch'],
      orderBy: { batch: 'desc' }
    });

    const dbBatches = distinctBatchRecords.map((r) => r.batch);
    const configuredBatches = PROGRAMME_BATCHES[cleanProgramme] || [];

    // Merge configured batches with any distinct DB batches (sorted descending)
    const batchSet = new Set([...configuredBatches, ...dbBatches]);
    const batches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));

    // 2. Retrieve established institutional branches for this programme
    const branches = PROGRAMME_BRANCHES[cleanProgramme] || [];

    // 3. Retrieve semesters and append the 'All Semesters' option
    const baseSemesters = PROGRAMME_SEMESTERS[cleanProgramme] || [];
    const semesters = [...baseSemesters, ALL_SEMESTERS_LABEL];

    res.status(200).json({
      success: true,
      programme: cleanProgramme,
      batches,
      branches,
      semesters
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Course Offerings with Reactive Filtering
 * Public student endpoint; strictly enforces structured dropdown filters (Strictly NO search bar).
 */
export const getCourses = async (req, res, next) => {
  try {
    const { programme, batch, branch, semester } = req.query;

    // 1. Mandatory Programme validation
    if (!programme || typeof programme !== 'string' || !PROGRAMMES.includes(programme.trim())) {
      return next(
        new AppError(
          `Programme selection is required and must be one of: ${PROGRAMMES.join(', ')}.`,
          400
        )
      );
    }

    const cleanProgramme = programme.trim();

    // 2. Construct filter object (ignoring any search keywords)
    const whereClause = {
      programme: cleanProgramme
    };

    if (batch && typeof batch === 'string' && batch.trim() !== '') {
      whereClause.batch = batch.trim();
    }

    if (branch && typeof branch === 'string' && branch.trim() !== '') {
      whereClause.branch = branch.trim();
    }

    // Only filter by semester if an individual semester is selected (omit on 'All Semesters')
    if (
      semester &&
      typeof semester === 'string' &&
      semester.trim() !== '' &&
      semester.trim() !== ALL_SEMESTERS_LABEL
    ) {
      whereClause.semester = semester.trim();
    }

    // 3. Query autonomous course offerings from MySQL
    const courseOfferings = await prisma.courseOffering.findMany({
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
        document: {
          select: {
            id: true,
            originalFilename: true
          }
        }
      },
      orderBy: [{ semester: 'asc' }, { courseCode: 'asc' }]
    });

    // 4. Format lightweight course listing payload for student table
    const courses = courseOfferings.map((c) => ({
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
      hasOfficialPdf: Boolean(c.document)
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
 * Get Course Offering Details by ID
 * Public student endpoint; parses modules and reference literature into structured data.
 */
export const getCourseDetails = async (req, res, next) => {
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

    // Parse sequential module syllabus text
    const parsedSyllabus = parseModuleSyllabus(course.moduleWiseSyllabusText);
    const modules = parsedSyllabus.isValid ? parsedSyllabus.modules : [];
    const totalHours = parsedSyllabus.isValid ? parsedSyllabus.totalHours : 0;

    // Parse reference books text into clean list
    const referenceBooks = course.referenceBooksText
      ? course.referenceBooksText
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      : [];

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
        creditsBreakdown: {
          lecture: course.lecture,
          tutorial: course.tutorial,
          practical: course.practical,
          totalCredits: course.credits
        },
        courseObjectives: course.courseObjectives,
        syllabusText: course.moduleWiseSyllabusText,
        modules,
        totalHours,
        referenceBooks,
        hasOfficialPdf: Boolean(course.document),
        pdfFilename: course.document ? course.document.originalFilename : null
      }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getProgrammes,
  getFilterOptions,
  getCourses,
  getCourseDetails
};
