import * as XLSX from 'xlsx';

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

export default {
  generateCourseTemplateBuffer
};
