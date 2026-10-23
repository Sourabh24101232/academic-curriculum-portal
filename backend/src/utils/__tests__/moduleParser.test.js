import assert from 'node:assert';
import { parseModuleSyllabus, validateModuleSyllabus } from '../moduleParser.js';
import { validateCoursePayload } from '../../middleware/validateCourse.js';

console.log('\n--- Running Step 13 Unit Test Suite: Module Parser & Validators ---\n');

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

// Test 1: Valid 4-module input
test('Valid 4-module input parses properly with correct total hours', () => {
  const text = `
    Module 1: Introduction to DBMS and Data Models (6)
    Module 2: Relational Algebra and SQL (8)
    Module 3: Relational Design and Normalization (10)
    Module 4: Transactions and Concurrency Control (10)
  `;
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 4);
  assert.strictEqual(result.totalHours, 34);
  assert.strictEqual(result.modules[0].moduleNumber, 1);
  assert.strictEqual(result.modules[0].hours, 6);
  assert.strictEqual(result.modules[3].moduleNumber, 4);
  assert.strictEqual(result.modules[3].hours, 10);
});

// Test 2: Input with missing hours
test('Input with missing hours fails on line 1', () => {
  const text = 'Module 1: Introduction to DBMS';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 1);
  assert.match(result.error, /Syntax error on line 1/);
});

// Test 3: Input with non-sequential numbering (skipped number)
test('Input with non-sequential numbering (skip) fails on line 2', () => {
  const text = 'Module 1: Basics (6)\nModule 3: Advanced (8)';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 2);
  assert.match(result.error, /Expected 'Module 2', but found 'Module 3'/);
});

// Test 4: Input starting with Module 2
test('Input starting with Module 2 fails on line 1', () => {
  const text = 'Module 2: Basics (6)';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 1);
  assert.match(result.error, /Expected 'Module 1', but found 'Module 2'/);
});

// Test 5: Input with zero hours
test('Input with zero hours fails on line 1', () => {
  const text = 'Module 1: Basics (0)';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 1);
  assert.match(result.error, /Hours must be a positive integer greater than 0/);
});

// Test 6: Input with duplicate module numbers
test('Input with duplicate module numbers fails on line 2', () => {
  const text = 'Module 1: Part 1 (6)\nModule 1: Part 2 (8)';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 2);
  assert.match(result.error, /Expected 'Module 2', but found 'Module 1'/);
});

// Test 7: Input with leading and trailing blank lines
test('Input with leading and trailing blank lines parses cleanly', () => {
  const text = '\n\nModule 1: Only Module (10)\n\n\n';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.modules.length, 1);
  assert.strictEqual(result.totalHours, 10);
});

// Test 8: Input with blank line in the middle
test('Input with blank line in the middle fails on exact line number', () => {
  const text = 'Module 1: Part 1 (6)\n\nModule 2: Part 2 (8)';
  const result = parseModuleSyllabus(text);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.line, 2);
  assert.match(result.error, /Blank line encountered on line 2/);
});

// Test 9: validateModuleSyllabus boolean helper
test('validateModuleSyllabus helper returns boolean status', () => {
  const valid = validateModuleSyllabus('Module 1: OK (5)');
  assert.strictEqual(valid.isValid, true);
  const invalid = validateModuleSyllabus('Bad Format');
  assert.strictEqual(invalid.isValid, false);
  assert.strictEqual(invalid.line, 1);
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
      moduleWiseSyllabusText: 'Module 1: Intro (6)'
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
      moduleWiseSyllabusText: 'Module 1: Intro (6)'
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

// Test 12: validateCoursePayload accepts valid complete course payload
test('validateCoursePayload middleware accepts valid payload and normalizes credits', () => {
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
      moduleWiseSyllabusText: 'Module 1: Relational Models (6)\nModule 2: SQL and Normalization (8)'
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
  assert.strictEqual(req.totalHours, 14);
  assert.strictEqual(req.parsedModules.length, 2);
});

console.log(`\nTest Run Summary: ${passedTests} passed, ${failedTests} failed.\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
