import assert from 'node:assert';
import { parseModuleSyllabus, validateModuleSyllabus } from '../moduleParser.js';
import { validateCoursePayload } from '../../middleware/validateCourse.js';

console.log('\n--- Running Single-Box Syllabus Parser & Course Validators Test Suite ---\n');

let passedTests = 0;
let failedTests = 0;

const test = (description, fn) => {
  try {
    fn();
    console.log(`  ✔ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(err);
    failedTests++;
  }
};

// Test 1: Valid multi-module input with blank lines between modules (1-box format)
test('Valid multi-module input with blank lines between modules parses cleanly', () => {
  const text = `
    Module 1: Overview of DBMS
    Historical development, data models, database languages, architecture, schema and instances.

    Module 2: Relational model
    Relational algebra, tuple calculus, constraints, normalization (1NF, 2NF, 3NF, BCNF), ER model.

    Module 3: SQL basics
    DDL, DML, DCL, query formulation, subqueries, joins, query optimization.

    Module 4: Transactions
    ACID properties, concurrency control, serializability, locking protocols.
  `;
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 4);
  assert.strictEqual(result.modules[0].moduleNumber, 1);
  assert.ok(result.modules[0].title.includes('Module 1: Overview of DBMS'));
  assert.strictEqual(result.modules[3].moduleNumber, 4);
  assert.ok(result.modules[3].title.includes('Module 4: Transactions'));
  assert.ok(result.syllabusText.includes('Module 1: Overview of DBMS'));
});

// Test 2: Input with 'Module 01:' format (as specified in Add New Subject UI placeholder)
test("Input with 'Module 01:' format parses cleanly into structured blocks", () => {
  const text = `Module 01: Introduction to Computing: Historical perspective, Early computers.

Module 02: Data Types in C: Basic types, one-dimensional arrays, multidimensional arrays.

Module 03: Modular Programming: Functions, parameter passing, recursion.`;

  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 3);
  assert.strictEqual(result.modules[0].moduleNumber, 1);
  assert.strictEqual(result.modules[1].moduleNumber, 2);
  assert.strictEqual(result.modules[2].moduleNumber, 3);
});

// Test 3: Input with optional hours in parentheses
test('Input with optional hours in parentheses extracts total hours without requiring them', () => {
  const text = `Module 1: Basics (6)

Module 2: Advanced Concepts (10)`;

  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 2);
  assert.strictEqual(result.modules[0].hours, 6);
  assert.strictEqual(result.modules[1].hours, 10);
  assert.strictEqual(result.totalHours, 16);
});

// Test 4: Input without any hours sets totalHours to null
test('Input without any hours sets totalHours to null gracefully', () => {
  const text = `Module 1: Topics without hours

Module 2: More topics without hours`;

  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.totalHours, null);
  assert.strictEqual(result.modules[0].hours, null);
});

// Test 5: Empty syllabus text fails validation
test('Empty syllabus text fails validation', () => {
  const result = parseModuleSyllabus('');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 1);
  assert.match(result.error, /Syllabus text cannot be empty/);
});

// Test 6: Whitespace-only syllabus text fails validation
test('Whitespace-only syllabus text fails validation', () => {
  const result = parseModuleSyllabus('    \n\n   \t  ');
  assert.strictEqual(result.isValid, false);
  assert.match(result.error, /Syllabus text cannot be empty/);
});

// Test 7: Leading and trailing blank lines are trimmed cleanly
test('Leading and trailing blank lines are trimmed cleanly', () => {
  const text = '\n\n\nModule 1: Only Module\nComprehensive topics\n\n\n';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 1);
  assert.strictEqual(result.syllabusText, 'Module 1: Only Module\nComprehensive topics');
});

// Test 8: Freeform continuous text without 'Module' header is accepted
test('Freeform continuous syllabus text without Module headers is accepted as single box', () => {
  const text = 'This is a specialized course covering advanced topics in systems engineering.';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 1);
  assert.strictEqual(result.syllabusText, text);
});

// Test 9: validateModuleSyllabus helper returns boolean status
test('validateModuleSyllabus helper returns boolean status', () => {
  const valid = validateModuleSyllabus('Module 1: Valid Content');
  assert.strictEqual(valid.isValid, true);
  const invalid = validateModuleSyllabus('   ');
  assert.strictEqual(invalid.isValid, false);
});

// Test 10: validateCoursePayload rejects decimal credits
test('validateCoursePayload middleware rejects decimal credits (lecture: 3.5)', () => {
  const req = {
    body: {
      courseCode: 'CS305',
      courseName: 'DBMS',
      programme: 'BTech',
      batch: '2024 - 2028',
      branch: 'CSE',
      semester: 'Semester 5',
      courseType: 'CORE',
      lecture: 3.5,
      tutorial: 0,
      practical: 0,
      credits: 3,
      courseObjectives: 'Learn DBMS',
      referenceBooksText: '1. Korth',
      moduleWiseSyllabusText: 'Module 1: Intro\nRelational models'
    }
  };
  let capturedError = null;
  validateCoursePayload(req, {}, (err) => {
    capturedError = err;
  });
  assert.ok(capturedError);
  assert.strictEqual(capturedError.statusCode, 400);
  assert.match(capturedError.message, /Invalid credit value for 'lecture'/);
});

// Test 11: validateCoursePayload rejects negative credits
test('validateCoursePayload middleware rejects negative credits (credits: -1)', () => {
  const req = {
    body: {
      courseCode: 'CS305',
      courseName: 'DBMS',
      programme: 'BTech',
      batch: '2024 - 2028',
      branch: 'CSE',
      semester: 'Semester 5',
      courseType: 'CORE',
      lecture: 3,
      tutorial: 0,
      practical: 0,
      credits: -1,
      courseObjectives: 'Learn DBMS',
      referenceBooksText: '1. Korth',
      moduleWiseSyllabusText: 'Module 1: Intro\nRelational models'
    }
  };
  let capturedError = null;
  validateCoursePayload(req, {}, (err) => {
    capturedError = err;
  });
  assert.ok(capturedError);
  assert.strictEqual(capturedError.statusCode, 400);
  assert.match(capturedError.message, /Invalid credit value for 'credits'/);
});

// Test 12: validateCoursePayload accepts valid single-box syllabus and normalizes metadata
test('validateCoursePayload middleware accepts valid single-box syllabus and normalizes credits', () => {
  const req = {
    body: {
      courseCode: ' CS305 ',
      courseName: ' Database Management Systems ',
      programme: 'BTech',
      batch: '2024 - 2028',
      branch: 'CSE',
      semester: 'Semester 5',
      courseType: 'CORE',
      lecture: '3',
      tutorial: '0',
      practical: '0',
      credits: '3',
      courseObjectives: 'Learn DBMS concepts',
      referenceBooksText: '1. Silberschatz',
      moduleWiseSyllabusText: 'Module 1: Overview of DBMS\nDatabase concepts\n\nModule 2: SQL and Normalization\nRelational calculus'
    }
  };
  let capturedError = null;
  validateCoursePayload(req, {}, (err) => {
    capturedError = err;
  });
  assert.strictEqual(capturedError, undefined);
  assert.strictEqual(req.body.courseCode, 'CS305');
  assert.strictEqual(req.body.lecture, 3);
  assert.strictEqual(typeof req.body.lecture, 'number');
  assert.strictEqual(req.parsedModules.length, 2);
  assert.ok(req.body.moduleWiseSyllabusText.includes('Module 1: Overview of DBMS'));
});

console.log(`\nTest Run Summary: ${passedTests} passed, ${failedTests} failed.\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
