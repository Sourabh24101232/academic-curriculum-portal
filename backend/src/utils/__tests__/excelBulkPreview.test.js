import assert from 'node:assert';
import * as XLSX from 'xlsx';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import { parseAndValidateExcelBuffer } from '../../services/excelService.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config/env.js';

console.log('\n--- Running Step 26 Test Suite: Excel Bulk Upload Dry-Run Preview API ---\n');

let passedTests = 0;
let failedTests = 0;

const runTest = async (description, fn) => {
  try {
    await fn();
    console.log(`  ✔ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(err);
    failedTests++;
  }
};

const server = app.listen(0);
const port = server.address().port;
const baseUrl = `http://localhost:${port}/api`;

/**
 * Creates an in-memory Excel workbook buffer containing the required acceptance test data:
 * - 1 valid new course row (CS401)
 * - 1 duplicate existing course row (CS305)
 * - 1 invalid course row (CS999 with missing fields & credit errors)
 */
const buildAcceptanceTestWorkbookBuffer = () => {
  const wb = XLSX.utils.book_new();

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

  const validRow = [
    'CS401',
    'Advanced Algorithms',
    'BTech',
    '2024 - 2028',
    'CSE',
    'Semester 7',
    'CORE',
    3,
    0,
    0,
    3,
    'Master advanced algorithm design techniques and complexity analysis.',
    'Module 1: Graph Algorithms and Network Flow (10)\nModule 2: Approximation Algorithms (8)',
    '1. Cormen, Leiserson, Rivest - Introduction to Algorithms'
  ];

  const duplicateRow = [
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
    'Fundamental concepts of database design and relational models.',
    'Module 1: Relational Algebra (6)\nModule 2: Normalization and SQL (8)',
    '1. Silberschatz - Database System Concepts'
  ];

  const invalidRow = [
    'CS999',
    '', // Missing course_name
    'InvalidProgramme', // Invalid programme
    '2024 - 2028',
    'CSE',
    'Semester 1',
    'UNKNOWN_TYPE', // Invalid course_type
    -1, // Negative lecture
    'zero', // Non-integer tutorial
    3.5, // Decimal practical
    -4, // Negative credits
    '', // Missing objectives
    '', // Missing syllabus
    ''  // Missing reference books
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, validRow, duplicateRow, invalidRow]);
  XLSX.utils.book_append_sheet(wb, ws, 'Bulk Upload');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

async function main() {
  try {
    // 0. Ensure seeded CS305 exists in MySQL for duplicate detection
    const seededCourse = await prisma.courseOffering.findFirst({
      where: {
        courseCode: 'CS305',
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5'
      }
    });
    assert.ok(seededCourse, 'Seeded course CS305 must exist in database for duplicate detection test');

    const testExcelBuffer = buildAcceptanceTestWorkbookBuffer();

    // 1. Unit Test: parseAndValidateExcelBuffer accurately tags valid, duplicate, and invalid rows
    await runTest('parseAndValidateExcelBuffer parses 1 valid, 1 duplicate, and 1 invalid row with exact counters', async () => {
      const report = await parseAndValidateExcelBuffer(testExcelBuffer);

      assert.strictEqual(report.success, true);
      assert.strictEqual(report.totalRows, 3, 'Total rows should be 3');
      assert.strictEqual(report.validRowsCount, 2, 'Valid rows should be 2 (1 new valid + 1 valid duplicate)');
      assert.strictEqual(report.invalidRowsCount, 1, 'Invalid rows should be 1');
      assert.strictEqual(report.duplicateRowsCount, 1, 'Duplicate rows should be 1');

      // Row 1 (Excel row 2): CS401
      const row1 = report.rows[0];
      assert.strictEqual(row1.rowNumber, 2);
      assert.strictEqual(row1.courseCode, 'CS401');
      assert.strictEqual(row1.status, 'VALID');
      assert.strictEqual(row1.isDuplicate, false);
      assert.strictEqual(row1.errors.length, 0);

      // Row 2 (Excel row 3): CS305 (Duplicate)
      const row2 = report.rows[1];
      assert.strictEqual(row2.rowNumber, 3);
      assert.strictEqual(row2.courseCode, 'CS305');
      assert.strictEqual(row2.status, 'VALID');
      assert.strictEqual(row2.isDuplicate, true);
      assert.strictEqual(row2.existingCourseId, seededCourse.id);
      assert.strictEqual(row2.errors.length, 0);

      // Row 3 (Excel row 4): CS999 (Invalid)
      const row3 = report.rows[2];
      assert.strictEqual(row3.rowNumber, 4);
      assert.strictEqual(row3.courseCode, 'CS999');
      assert.strictEqual(row3.status, 'ERROR');
      assert.ok(row3.errors.length >= 6, 'Must capture multiple field errors');
      assert.ok(row3.errors.some((e) => e.includes('course_name')));
      assert.ok(row3.errors.some((e) => e.includes('programme')));
      assert.ok(row3.errors.some((e) => e.includes('course_type')));
      assert.ok(row3.errors.some((e) => e.includes('lecture')));
      assert.ok(row3.errors.some((e) => e.includes('credits')));
      assert.ok(row3.errors.some((e) => e.includes('module_wise_syllabus')));
    });

    // 2. Integration Test: Unauthenticated POST /api/admin/courses/bulk-preview -> 401
    await runTest('POST /api/admin/courses/bulk-preview returns 401 when unauthenticated', async () => {
      const formData = new FormData();
      formData.append('excelFile', new Blob([testExcelBuffer]), 'test_import.xlsx');

      const res = await fetch(`${baseUrl}/admin/courses/bulk-preview`, {
        method: 'POST',
        body: formData
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /authentication required/i);
    });

    // 3. Authenticate Admin User
    const loginRes = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD
      })
    });
    assert.strictEqual(loginRes.status, 200, 'Admin login must succeed');
    const cookieHeader = loginRes.headers.get('set-cookie');
    assert.ok(cookieHeader, 'Session cookie must be set');
    const sessionCookie = cookieHeader.split(';')[0];

    // 4. Integration Test: Missing file upload -> 400
    await runTest('POST /api/admin/courses/bulk-preview returns 400 when no file is uploaded', async () => {
      const formData = new FormData();
      const res = await fetch(`${baseUrl}/admin/courses/bulk-preview`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
        body: formData
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /select an Excel file/i);
    });

    // 5. Integration Test: Disguised invalid file format -> 400
    await runTest('POST /api/admin/courses/bulk-preview rejects non-excel file format', async () => {
      const formData = new FormData();
      formData.append('excelFile', new Blob(['hello plain text'], { type: 'text/plain' }), 'test.txt');

      const res = await fetch(`${baseUrl}/admin/courses/bulk-preview`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
        body: formData
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /Only Excel/i);
    });

    // 6. Integration Test: Acceptance Test - Valid spreadsheet dry-run preview returns exact counters
    await runTest('POST /api/admin/courses/bulk-preview returns 200 with structured preview report and exact counters', async () => {
      const formData = new FormData();
      formData.append(
        'excelFile',
        new Blob([testExcelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        'Acceptance_Courses.xlsx'
      );

      const res = await fetch(`${baseUrl}/admin/courses/bulk-preview`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
        body: formData
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.success, true);
      assert.strictEqual(data.totalRows, 3);
      assert.strictEqual(data.validRowsCount, 2);
      assert.strictEqual(data.invalidRowsCount, 1);
      assert.strictEqual(data.duplicateRowsCount, 1);

      assert.strictEqual(data.rows.length, 3);
      assert.strictEqual(data.rows[0].status, 'VALID');
      assert.strictEqual(data.rows[0].isDuplicate, false);
      assert.strictEqual(data.rows[1].status, 'VALID');
      assert.strictEqual(data.rows[1].isDuplicate, true);
      assert.strictEqual(data.rows[2].status, 'ERROR');
      assert.ok(data.rows[2].errors.length > 0);
    });
  } finally {
    server.close();
    console.log(`\nStep 26 Tests finished: ${passedTests} passed, ${failedTests} failed\n`);
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  server.close();
  process.exit(1);
});
