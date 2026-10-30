import * as XLSX from 'xlsx';
import prisma from '../config/prisma.js';
import { PROGRAMMES, COURSE_TYPES } from '../config/constants.js';
import { parseModuleSyllabus } from '../utils/moduleParser.js';
import AppError from '../utils/AppError.js';

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
 * Generate course import Excel template with two worksheets:
 * 1. "Syllabus Import Template" - Headers and sample course offering row
 * 2. "Instructions & ReadMe" - Data format rules, field requirements, and constraints
 *
 * @returns {Buffer} Excel (.xlsx) file buffer
 */
export const generateCourseTemplateBuffer = () => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: "Syllabus Import Template"
  const headers = [
    'course_code',
    'course_name',
    'programme',
    'batch',
    'branch',
    'semester',
    'course_type',
    'lecture',
    'tutorial',
    'practical',
    'credits',
    'course_objectives',
    'module_wise_syllabus',
    'reference_books'
  ];

  const sampleRow = [
    'CS305',
    'Database Management Systems',
    'BTech',
    '2024 - 2028',
    'CSE',
    'Semester 5',
    'CORE',
    3,
    0,
    0,
    3,
    'To provide fundamental concepts of databases, relational database design, query optimization, transaction processing, and concurrency control.',
    'Module 1: Introduction to DBMS and Relational Models (6)\nModule 2: SQL and Query Optimization (8)\nModule 3: Transactions and Concurrency Control (10)',
    '1. Silberschatz - Database System Concepts\n2. Elmasri - Fundamentals of Database Systems'
  ];

  const wsTemplate = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

  // Configure column widths for readability
  wsTemplate['!cols'] = [
    { wch: 14 }, // course_code
    { wch: 32 }, // course_name
    { wch: 12 }, // programme
    { wch: 14 }, // batch
    { wch: 10 }, // branch
    { wch: 14 }, // semester
    { wch: 13 }, // course_type
    { wch: 10 }, // lecture
    { wch: 10 }, // tutorial
    { wch: 10 }, // practical
    { wch: 10 }, // credits
    { wch: 45 }, // course_objectives
    { wch: 65 }, // module_wise_syllabus
    { wch: 45 }  // reference_books
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Syllabus Import Template');

  // Sheet 2: "Instructions & ReadMe"
  const instructionRows = [
    ['IIIT Bhagalpur - Curriculum & Syllabus Bulk Import Instructions'],
    [],
    ['Field Name', 'Mandatory', 'Accepted Values / Type', 'Description & Formatting Rules'],
    ['course_code', 'Yes', 'Text (e.g. CS305, EC201)', 'Course code identifying the course offering.'],
    ['course_name', 'Yes', 'Text (e.g. Database Management Systems)', 'Official course title.'],
    ['programme', 'Yes', 'BTech, MTech, PhD', 'Degree programme identifier.'],
    ['batch', 'Yes', 'Text (e.g. 2024 - 2028)', 'Academic batch designation.'],
    ['branch', 'Yes', 'CSE, MnC, ECE, MAE (or Department)', 'Academic branch or department.'],
    ['semester', 'Yes', 'Semester 1 to Semester 8', 'Academic semester designation.'],
    ['course_type', 'Yes', 'CORE, ELECTIVE', 'Curriculum category for the course.'],
    ['lecture', 'Yes', 'Non-negative integer (e.g. 3, 0)', 'Weekly lecture hours (L). Must be an integer >= 0.'],
    ['tutorial', 'Yes', 'Non-negative integer (e.g. 0, 1)', 'Weekly tutorial hours (T). Must be an integer >= 0.'],
    ['practical', 'Yes', 'Non-negative integer (e.g. 0, 2)', 'Weekly practical/lab hours (P). Must be an integer >= 0.'],
    ['credits', 'Yes', 'Non-negative integer (e.g. 3, 4)', 'Total course credits (C). Must be an integer >= 0.'],
    ['course_objectives', 'Yes', 'Text', 'Primary educational objectives and course outcomes.'],
    ['module_wise_syllabus', 'Yes', 'Strict Format: Module <N>: <Topics> (<Hours>)', 'Strict sequential numbering (Module 1, Module 2, ...) with positive integer hours in parentheses on separate lines.'],
    ['reference_books', 'Yes', 'Text / List', 'Standard textbooks and references for the course.'],
    [],
    ['Key Rules & Constraints:'],
    ['1. Independent Course Offerings: Each row is imported as an independent offering record.'],
    ['2. Strict Module Parsing: The module_wise_syllabus column must follow "Module <N>: Topics Covered (Hours)" exactly.'],
    ['3. Sequential Module Numbers: Module numbering must begin at 1 and increment sequentially without duplicates or gaps.'],
    ['4. Non-Negative Credit Hours: lecture, tutorial, practical, and credits must all be valid non-negative integers.'],
    ['5. Unique Offering Key: Courses are matched by (course_code + programme + batch + branch + semester).']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionRows);
  wsInstructions['!cols'] = [
    { wch: 24 },
    { wch: 12 },
    { wch: 45 },
    { wch: 75 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions & ReadMe');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

/**
 * Parses and validates an uploaded Excel buffer without database mutations.
 * Returns a preview report with row-by-row validation status, error diagnostics,
 * duplicate offering detection, and summary statistics.
 *
 * @param {Buffer} buffer - Binary Excel file buffer
 * @returns {Promise<Object>} Structured dry-run preview report
 */
export const parseAndValidateExcelBuffer = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Uploaded file buffer is empty.', 400);
  }

  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch (err) {
    throw new AppError(`Invalid Excel file: Unable to parse workbook (${err.message}).`, 400);
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new AppError('The uploaded Excel file contains no worksheets.', 400);
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length < 2) {
    return {
      success: true,
      totalRows: 0,
      validRowsCount: 0,
      invalidRowsCount: 0,
      duplicateRowsCount: 0,
      summary: {
        totalRows: 0,
        validRowsCount: 0,
        invalidRowsCount: 0,
        duplicateRowsCount: 0
      },
      rows: []
    };
  }

  // Normalize column headers to lowercase snake_case
  const headerRow = rawRows[0].map((h) =>
    String(h || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
  );

  const previewRows = [];
  let validRowsCount = 0;
  let invalidRowsCount = 0;
  let duplicateRowsCount = 0;

  const seenInBatch = new Set();
  const validCourseTypes = Object.values(COURSE_TYPES);

  // Iterate over each data row (Row 0 is header, Row 1 in array is Row 2 in Excel)
  for (let i = 1; i < rawRows.length; i++) {
    const rawRow = rawRows[i];

    // Check if entire row is blank
    const isRowBlank = rawRow.every((cell) => String(cell || '').trim() === '');
    if (isRowBlank) {
      continue;
    }

    const rowNumber = i + 1; // 1-based Excel row number

    const getVal = (possibleHeaders) => {
      for (const h of possibleHeaders) {
        const idx = headerRow.indexOf(h);
        if (idx !== -1 && rawRow[idx] !== undefined && rawRow[idx] !== null) {
          return String(rawRow[idx]).trim();
        }
      }
      return '';
    };

    const getRawVal = (possibleHeaders) => {
      for (const h of possibleHeaders) {
        const idx = headerRow.indexOf(h);
        if (idx !== -1 && rawRow[idx] !== undefined && rawRow[idx] !== null) {
          return rawRow[idx];
        }
      }
      return '';
    };

    const courseCode = getVal(['course_code', 'coursecode', 'code']);
    const courseName = getVal(['course_name', 'coursename', 'title', 'name']);
    const programme = getVal(['programme', 'program']);
    const batch = getVal(['batch', 'academic_batch']);
    const branch = getVal(['branch', 'department', 'dept']);
    const semester = getVal(['semester', 'sem']);
    const rawCourseType = getVal(['course_type', 'coursetype', 'type']);
    const lectureRaw = getRawVal(['lecture', 'l']);
    const tutorialRaw = getRawVal(['tutorial', 't']);
    const practicalRaw = getRawVal(['practical', 'p']);
    const creditsRaw = getRawVal(['credits', 'c', 'credit']);
    const courseObjectives = getVal(['course_objectives', 'courseobjectives', 'objectives']);
    const moduleWiseSyllabusText = getVal([
      'module_wise_syllabus',
      'modulewisesyllabus',
      'module_wise_syllabus_text',
      'syllabus',
      'modules'
    ]);
    const referenceBooksText = getVal([
      'reference_books',
      'referencebooks',
      'reference_books_text',
      'references',
      'books'
    ]);

    const errors = [];

    // 1. Mandatory metadata fields
    if (!courseCode) {
      errors.push("Field 'course_code' is required.");
    }
    if (!courseName) {
      errors.push("Field 'course_name' is required.");
    }
    if (!programme) {
      errors.push("Field 'programme' is required.");
    } else if (!PROGRAMMES.includes(programme)) {
      errors.push(`Invalid programme '${programme}'. Must be one of: ${PROGRAMMES.join(', ')}.`);
    }
    if (!batch) {
      errors.push("Field 'batch' is required.");
    }
    if (!branch) {
      errors.push("Field 'branch' is required.");
    }
    if (!semester) {
      errors.push("Field 'semester' is required.");
    }

    const upperCourseType = rawCourseType.toUpperCase();
    if (!rawCourseType) {
      errors.push("Field 'course_type' is required.");
    } else if (!validCourseTypes.includes(upperCourseType)) {
      errors.push(
        `Invalid course_type '${rawCourseType}'. Must be one of: ${validCourseTypes.join(', ')}.`
      );
    }

    // 2. Strict non-negative integer constraints (L / T / P / C)
    const creditFields = [
      { name: 'lecture', val: lectureRaw },
      { name: 'tutorial', val: tutorialRaw },
      { name: 'practical', val: practicalRaw },
      { name: 'credits', val: creditsRaw }
    ];

    for (const cf of creditFields) {
      if (!isValidNonNegativeInteger(cf.val)) {
        errors.push(`Field '${cf.name}' must be a non-negative whole integer.`);
      }
    }

    if (!courseObjectives) {
      errors.push("Field 'course_objectives' is required.");
    }
    if (!referenceBooksText) {
      errors.push("Field 'reference_books' is required.");
    }

    // 3. Module-wise syllabus parsing & validation
    if (!moduleWiseSyllabusText) {
      errors.push("Field 'module_wise_syllabus' is required.");
    } else {
      const parsedSyllabus = parseModuleSyllabus(moduleWiseSyllabusText);
      if (!parsedSyllabus.isValid) {
        errors.push(`Module syllabus error: ${parsedSyllabus.error || 'Invalid syllabus structure.'}`);
      }
    }

    // 4. Duplicate course offering detection (MySQL + In-Batch)
    let isDuplicate = false;
    let existingCourseId = null;

    if (courseCode && programme && batch && branch && semester) {
      const compositeKey = `${courseCode.toLowerCase()}___${programme.toLowerCase()}___${batch.toLowerCase()}___${branch.toLowerCase()}___${semester.toLowerCase()}`;

      if (seenInBatch.has(compositeKey)) {
        isDuplicate = true;
      } else {
        seenInBatch.add(compositeKey);
      }

      // Check existing offering in MySQL database
      const existingInDb = await prisma.courseOffering.findFirst({
        where: {
          courseCode,
          programme,
          batch,
          branch,
          semester
        }
      });

      if (existingInDb) {
        isDuplicate = true;
        existingCourseId = existingInDb.id;
      }
    }

    const status = errors.length === 0 ? 'VALID' : 'ERROR';

    if (status === 'VALID') {
      validRowsCount++;
    } else {
      invalidRowsCount++;
    }

    if (isDuplicate) {
      duplicateRowsCount++;
    }

    previewRows.push({
      rowNumber,
      courseCode,
      courseName,
      programme,
      batch,
      branch,
      semester,
      courseType: validCourseTypes.includes(upperCourseType) ? upperCourseType : rawCourseType,
      lecture: isValidNonNegativeInteger(lectureRaw) ? Number(lectureRaw) : lectureRaw,
      tutorial: isValidNonNegativeInteger(tutorialRaw) ? Number(tutorialRaw) : tutorialRaw,
      practical: isValidNonNegativeInteger(practicalRaw) ? Number(practicalRaw) : practicalRaw,
      credits: isValidNonNegativeInteger(creditsRaw) ? Number(creditsRaw) : creditsRaw,
      courseObjectives,
      moduleWiseSyllabusText,
      referenceBooksText,
      status,
      isDuplicate,
      existingCourseId,
      errors
    });
  }

  const totalRows = previewRows.length;

  return {
    success: true,
    totalRows,
    validRowsCount,
    invalidRowsCount,
    duplicateRowsCount,
    summary: {
      totalRows,
      validRowsCount,
      invalidRowsCount,
      duplicateRowsCount
    },
    rows: previewRows
  };
};

export default {
  generateCourseTemplateBuffer,
  parseAndValidateExcelBuffer
};
