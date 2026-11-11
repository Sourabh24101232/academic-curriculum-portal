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
 * Splits a comma-separated cell string (e.g. "CSE, ECE") into a deduplicated array
 * of trimmed non-empty strings while preserving original order.
 */
const parseMultiValueField = (rawValue) => {
  if (!rawValue || typeof rawValue !== 'string') return [];
  const seen = new Set();
  const values = [];
  for (const part of rawValue.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      values.push(trimmed);
    }
  }
  return values;
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
    ['branch', 'Yes', 'CSE, MnC, ECE, MAE (comma-separated for multiple)', 'Academic branch(es) or department, e.g. CSE, ECE.'],
    ['semester', 'Yes', 'Semester 1 to Semester 8 (comma-separated for multiple)', 'Academic semester(s), e.g. Semester 1, Semester 2.'],
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
    ['1. Multi-Branch & Multi-Semester Support: Specify comma-separated branches and/or semesters in a single row to create offerings across all combinations.'],
    ['2. Strict Module Parsing: The module_wise_syllabus column must follow "Module <N>: Topics Covered (Hours)" exactly.'],
    ['3. Sequential Module Numbers: Module numbering must begin at 1 and increment sequentially without duplicates or gaps.'],
    ['4. Non-Negative Credit Hours: lecture, tutorial, practical, and credits must all be valid non-negative integers.'],
    ['5. Unique Offering Key: Each subject is uniquely matched by (course_code + programme + batch) to prevent duplicate syllabus uploads.']
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
    const rawBranch = getVal(['branch', 'branches', 'department', 'dept']);
    const rawSemester = getVal(['semester', 'semesters', 'sem']);
    const branches = parseMultiValueField(rawBranch);
    const semesters = parseMultiValueField(rawSemester);
    const branch = branches.join(', ');
    const semester = semesters.join(', ');
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
    if (branches.length === 0) {
      errors.push("Field 'branch' is required.");
    }
    if (semesters.length === 0) {
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

    // 4. Duplicate course offering detection (MySQL + In-Batch) by unique (courseCode + programme + batch)
    let isDuplicate = false;
    let existingCourseId = null;
    let existingCourseIds = [];
    let duplicateMessage = '';

    if (courseCode && programme && batch) {
      const compositeKey = `${courseCode.toLowerCase()}___${programme.toLowerCase()}___${batch.toLowerCase()}`;

      if (seenInBatch.has(compositeKey)) {
        isDuplicate = true;
        duplicateMessage = `Duplicate course code "${courseCode}" for ${programme} (${batch}) appears multiple times in this spreadsheet.`;
      } else if (errors.length === 0) {
        seenInBatch.add(compositeKey);
      }

      // Check existing offerings in MySQL database
      const existingInDb = await prisma.courseOffering.findMany({
        where: {
          courseCode,
          programme,
          batch
        },
        select: {
          id: true,
          branch: true,
          semester: true
        }
      });

      if (existingInDb.length > 0) {
        isDuplicate = true;
        existingCourseId = existingInDb[0].id;
        existingCourseIds = existingInDb.map((r) => r.id);
        const existingLocations = existingInDb
          .map((r) => `${r.branch} (${r.semester})`)
          .join(', ');
        duplicateMessage = `Course code "${courseCode}" already exists for ${programme} (${batch}) in ${existingLocations}.`;
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
      branches,
      semester,
      semesters,
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
      existingCourseIds,
      duplicateMessage,
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

/**
 * Commit Bulk Course Import in an atomic transaction
 *
 * @param {Object} options
 * @param {Array} options.rows - Course rows from dry-run preview
 * @param {string} [options.duplicateAction='SKIP'] - 'SKIP' or 'UPDATE'
 * @param {string} [options.importStrategy='IMPORT_VALID_ONLY'] - 'IMPORT_VALID_ONLY' or 'CANCEL_ON_ERROR'
 * @returns {Promise<Object>} Execution report { success, importedCount, updatedCount, skippedCount, failedCount }
 */
export const commitBulkImport = async ({
  rows,
  duplicateAction = 'SKIP',
  importStrategy = 'IMPORT_VALID_ONLY'
}) => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new AppError('No course rows provided for bulk import.', 400);
  }

  const normalizedDupAction = String(duplicateAction || 'SKIP').toUpperCase();
  if (normalizedDupAction !== 'SKIP' && normalizedDupAction !== 'UPDATE') {
    throw new AppError("Invalid duplicateAction. Must be either 'SKIP' or 'UPDATE'.", 400);
  }

  const normalizedStrategy = String(importStrategy || 'IMPORT_VALID_ONLY').toUpperCase();
  if (normalizedStrategy !== 'IMPORT_VALID_ONLY' && normalizedStrategy !== 'CANCEL_ON_ERROR') {
    throw new AppError(
      "Invalid importStrategy. Must be either 'IMPORT_VALID_ONLY' or 'CANCEL_ON_ERROR'.",
      400
    );
  }

  // Check for error rows
  const hasErrors = rows.some(
    (r) => r.status === 'ERROR' || (Array.isArray(r.errors) && r.errors.length > 0)
  );

  if (normalizedStrategy === 'CANCEL_ON_ERROR' && hasErrors) {
    throw new AppError(
      'Bulk import aborted: One or more rows contain validation errors and importStrategy is set to CANCEL_ON_ERROR.',
      400
    );
  }

  // Filter rows to process
  const validRows = rows.filter(
    (r) => r.status === 'VALID' || (!r.status && (!r.errors || r.errors.length === 0))
  );

  const errorRows = rows.filter(
    (r) => r.status === 'ERROR' || (Array.isArray(r.errors) && r.errors.length > 0)
  );

  const failedCount = errorRows.length;

  // Execute in atomic Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of validRows) {
      const courseCode = String(row.courseCode || row.course_code || '').trim();
      const courseName = String(row.courseName || row.course_name || '').trim();
      const programme = String(row.programme || '').trim();
      const batch = String(row.batch || '').trim();
      const targetBranches =
        Array.isArray(row.branches) && row.branches.length > 0
          ? parseMultiValueField(row.branches.join(','))
          : parseMultiValueField(String(row.branch || ''));
      const targetSemesters =
        Array.isArray(row.semesters) && row.semesters.length > 0
          ? parseMultiValueField(row.semesters.join(','))
          : parseMultiValueField(String(row.semester || ''));
      const courseType = String(row.courseType || row.course_type || 'CORE').toUpperCase();
      const lecture = parseInt(row.lecture ?? 0, 10) || 0;
      const tutorial = parseInt(row.tutorial ?? 0, 10) || 0;
      const practical = parseInt(row.practical ?? 0, 10) || 0;
      const credits = parseInt(row.credits ?? 0, 10) || 0;
      const courseObjectives = String(row.courseObjectives || row.course_objectives || '').trim();
      const moduleWiseSyllabusText = String(
        row.moduleWiseSyllabusText || row.module_wise_syllabus || ''
      ).trim();
      const referenceBooksText = String(
        row.referenceBooksText || row.reference_books || ''
      ).trim();

      if (targetBranches.length === 0 || targetSemesters.length === 0) {
        continue;
      }

      // Find existing offerings by unique (courseCode + programme + batch)
      let existingRecords = [];
      if (Array.isArray(row.existingCourseIds) && row.existingCourseIds.length > 0) {
        existingRecords = await tx.courseOffering.findMany({
          where: { id: { in: row.existingCourseIds } }
        });
      } else if (row.existingCourseId) {
        const found = await tx.courseOffering.findUnique({
          where: { id: row.existingCourseId }
        });
        if (found) {
          existingRecords = [found];
        }
      }

      if (existingRecords.length === 0 && courseCode && programme && batch) {
        existingRecords = await tx.courseOffering.findMany({
          where: {
            courseCode,
            programme,
            batch
          }
        });
      }

      if (existingRecords.length > 0) {
        if (normalizedDupAction === 'SKIP') {
          skippedCount++;
        } else if (normalizedDupAction === 'UPDATE') {
          const sharedUpdateData = {
            courseName,
            courseType,
            lecture,
            tutorial,
            practical,
            credits,
            courseObjectives,
            moduleWiseSyllabusText,
            referenceBooksText
          };

          const existingKeySet = new Set();
          for (const existingRecord of existingRecords) {
            await tx.courseOffering.update({
              where: { id: existingRecord.id },
              data: sharedUpdateData
            });
            existingKeySet.add(
              `${existingRecord.branch.toLowerCase()}___${existingRecord.semester.toLowerCase()}`
            );
            updatedCount++;
          }

          for (const targetBranch of targetBranches) {
            for (const targetSemester of targetSemesters) {
              const pairKey = `${targetBranch.toLowerCase()}___${targetSemester.toLowerCase()}`;
              if (!existingKeySet.has(pairKey)) {
                await tx.courseOffering.create({
                  data: {
                    courseCode,
                    courseName,
                    programme,
                    batch,
                    branch: targetBranch,
                    semester: targetSemester,
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
                importedCount++;
              }
            }
          }
        }
      } else {
        for (const targetBranch of targetBranches) {
          for (const targetSemester of targetSemesters) {
            await tx.courseOffering.create({
              data: {
                courseCode,
                courseName,
                programme,
                batch,
                branch: targetBranch,
                semester: targetSemester,
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
            importedCount++;
          }
        }
      }
    }

    return {
      importedCount,
      updatedCount,
      skippedCount
    };
  });

  return {
    success: true,
    importedCount: result.importedCount,
    updatedCount: result.updatedCount,
    skippedCount: result.skippedCount,
    failedCount
  };
};

export default {
  generateCourseTemplateBuffer,
  parseAndValidateExcelBuffer,
  commitBulkImport
};
