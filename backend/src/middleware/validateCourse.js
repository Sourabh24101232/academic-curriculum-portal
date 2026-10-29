import AppError from '../utils/AppError.js';
import { parseModuleSyllabus } from '../utils/moduleParser.js';
import { PROGRAMMES, COURSE_TYPES } from '../config/constants.js';

const CREDIT_FIELDS = ['lecture', 'tutorial', 'practical', 'credits'];

/**
 * Validates that a credit value is a strict non-negative integer.
 * Rejects decimals (e.g. 3.5, "2.5") and negative values (e.g. -1).
 */
const isValidNonNegativeInteger = (val) => {
  if (val === undefined || val === null || val === '') return false;
  const strVal = String(val).trim();
  if (strVal.includes('.')) return false;
  const num = Number(strVal);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
};

/**
 * Course Payload Validation Middleware
 * Strictly validates mandatory course metadata, integer credits, and sequential module syllabus.
 */
export const validateCoursePayload = (req, res, next) => {
  const {
    courseCode,
    courseName,
    programme,
    batch,
    branch,
    semester,
    courseType,
    courseObjectives,
    moduleWiseSyllabusText,
    referenceBooksText
  } = req.body;

  const errors = [];

  // 1. Mandatory Text Fields Validation
  if (!courseCode || typeof courseCode !== 'string' || courseCode.trim() === '') {
    errors.push("Field 'courseCode' is required and must be a non-empty string.");
  }

  if (!courseName || typeof courseName !== 'string' || courseName.trim() === '') {
    errors.push("Field 'courseName' is required and must be a non-empty string.");
  }

  if (!programme || !PROGRAMMES.includes(programme)) {
    errors.push(`Field 'programme' is invalid. Must be one of: ${PROGRAMMES.join(', ')}.`);
  }

  if (!batch || typeof batch !== 'string' || batch.trim() === '') {
    errors.push("Field 'batch' is required and must be a non-empty string.");
  }

  if (!branch || typeof branch !== 'string' || branch.trim() === '') {
    errors.push("Field 'branch' is required and must be a non-empty string.");
  }

  if (!semester || typeof semester !== 'string' || semester.trim() === '') {
    errors.push("Field 'semester' is required and must be a non-empty string.");
  }

  const validCourseTypes = Object.values(COURSE_TYPES);
  if (!courseType || !validCourseTypes.includes(courseType)) {
    errors.push(`Field 'courseType' is invalid. Must be one of: ${validCourseTypes.join(', ')}.`);
  }

  if (!courseObjectives || typeof courseObjectives !== 'string' || courseObjectives.trim() === '') {
    errors.push("Field 'courseObjectives' is required and must be a non-empty string.");
  }

  if (!referenceBooksText || typeof referenceBooksText !== 'string' || referenceBooksText.trim() === '') {
    errors.push("Field 'referenceBooksText' is required and must be a non-empty string.");
  }

  // 2. Strict Integer Credit Enforcement (L / T / P / C)
  for (const field of CREDIT_FIELDS) {
    if (!isValidNonNegativeInteger(req.body[field])) {
      errors.push(
        `Invalid credit value for '${field}': Must be a non-negative whole integer. Decimals and negative numbers are not allowed.`
      );
    }
  }

  // Abort early if basic fields or credits fail
  if (errors.length > 0) {
    return next(new AppError(errors[0], 400, errors));
  }

  // 3. Single-Box Syllabus Text Validation
  const parsedSyllabus = parseModuleSyllabus(moduleWiseSyllabusText);
  if (!parsedSyllabus.isValid) {
    return next(new AppError(parsedSyllabus.error, 400, [parsedSyllabus.error]));
  }

  // 4. Sanitize and Normalize Data Types on req.body
  req.body.courseCode = courseCode.trim();
  req.body.courseName = courseName.trim();
  req.body.programme = programme.trim();
  req.body.batch = batch.trim();
  req.body.branch = branch.trim();
  req.body.semester = semester.trim();
  req.body.courseObjectives = courseObjectives.trim();
  req.body.moduleWiseSyllabusText = moduleWiseSyllabusText.trim();
  req.body.referenceBooksText = referenceBooksText.trim();
  req.body.lecture = parseInt(req.body.lecture, 10);
  req.body.tutorial = parseInt(req.body.tutorial, 10);
  req.body.practical = parseInt(req.body.practical, 10);
  req.body.credits = parseInt(req.body.credits, 10);

  // Attach parsed structure for downstream optimization
  req.parsedModules = parsedSyllabus.modules;
  req.totalHours = parsedSyllabus.totalHours;

  next();
};

export default validateCoursePayload;
