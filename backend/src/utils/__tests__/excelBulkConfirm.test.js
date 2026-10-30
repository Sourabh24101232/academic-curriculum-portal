import assert from 'node:assert';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config/env.js';

console.log('\n--- Running Step 27 Test Suite: Excel Bulk Import Transactional Commit API ---\n');

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

async function main() {
  let createdCourseCode = 'CS402_TEST';

  try {
    // 0. Ensure cleanup of any leftover test course
    await prisma.courseOffering.deleteMany({
      where: { courseCode: createdCourseCode }
    });

    // Capture original seeded CS305 course
    const originalCs305 = await prisma.courseOffering.findFirst({
      where: {
        courseCode: 'CS305',
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5'
      }
    });
    assert.ok(originalCs305, 'Seeded course CS305 must exist in database');

    // 1. Integration Test: Unauthenticated POST /api/admin/courses/bulk-confirm -> 401
    await runTest('POST /api/admin/courses/bulk-confirm returns 401 when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/admin/courses/bulk-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: [],
          duplicateAction: 'SKIP',
          importStrategy: 'IMPORT_VALID_ONLY'
        })
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /authentication required/i);
    });

    // 2. Authenticate Admin User
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

    // 3. Integration Test: Empty or missing rows array -> 400
    await runTest('POST /api/admin/courses/bulk-confirm rejects empty rows array with 400', async () => {
      const res = await fetch(`${baseUrl}/admin/courses/bulk-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie
        },
        body: JSON.stringify({
          rows: [],
          duplicateAction: 'SKIP',
          importStrategy: 'IMPORT_VALID_ONLY'
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /No course rows provided/i);
    });

    // 4. Integration Test: CANCEL_ON_ERROR aborts with 400 when an invalid row is present
    await runTest('POST /api/admin/courses/bulk-confirm with CANCEL_ON_ERROR aborts transaction on validation errors', async () => {
      const payload = {
        rows: [
          {
            courseCode: createdCourseCode,
            courseName: 'Test Cancel Course',
            programme: 'BTech',
            batch: '2024 - 2028',
            branch: 'CSE',
            semester: 'Semester 7',
            courseType: 'CORE',
            lecture: 3,
            tutorial: 0,
            practical: 0,
            credits: 3,
            courseObjectives: 'Objective text',
            moduleWiseSyllabusText: 'Module 1: Test (6)',
            referenceBooksText: 'Ref text',
            status: 'VALID',
            errors: []
          },
          {
            courseCode: 'INVALID_CODE',
            status: 'ERROR',
            errors: ["Field 'course_name' is required."]
          }
        ],
        duplicateAction: 'SKIP',
        importStrategy: 'CANCEL_ON_ERROR'
      };

      const res = await fetch(`${baseUrl}/admin/courses/bulk-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /CANCEL_ON_ERROR/i);

      // Verify that CS402_TEST was NOT created in DB (all-or-nothing rollback)
      const shouldNotExist = await prisma.courseOffering.findFirst({
        where: { courseCode: createdCourseCode }
      });
      assert.strictEqual(shouldNotExist, null, 'Course must not be saved when CANCEL_ON_ERROR aborts');
    });

    // 5. Integration Test: IMPORT_VALID_ONLY with duplicateAction: 'SKIP'
    await runTest('POST /api/admin/courses/bulk-confirm executes atomic import with SKIP duplicates', async () => {
      const payload = {
        rows: [
          // 1 New valid course
          {
            courseCode: createdCourseCode,
            courseName: 'Test Algorithms Advanced',
            programme: 'BTech',
            batch: '2024 - 2028',
            branch: 'CSE',
            semester: 'Semester 7',
            courseType: 'CORE',
            lecture: 3,
            tutorial: 0,
            practical: 0,
            credits: 3,
            courseObjectives: 'Advanced algorithms and graph techniques',
            moduleWiseSyllabusText: 'Module 1: Graphs (10)\nModule 2: Flow (8)',
            referenceBooksText: '1. Cormen et al',
            status: 'VALID',
            isDuplicate: false,
            errors: []
          },
          // 1 Duplicate course (CS305)
          {
            courseCode: 'CS305',
            courseName: 'Database Management Systems',
            programme: 'BTech',
            batch: '2024 - 2028',
            branch: 'CSE',
            semester: 'Semester 5',
            courseType: 'CORE',
            lecture: 3,
            tutorial: 0,
            practical: 0,
            credits: 3,
            courseObjectives: 'DBMS Concepts',
            moduleWiseSyllabusText: 'Module 1: Relational (6)',
            referenceBooksText: '1. Silberschatz',
            status: 'VALID',
            isDuplicate: true,
            existingCourseId: originalCs305.id,
            errors: []
          },
          // 1 Error row (to be skipped under IMPORT_VALID_ONLY)
          {
            courseCode: 'ERR999',
            status: 'ERROR',
            errors: ['Invalid credits format']
          }
        ],
        duplicateAction: 'SKIP',
        importStrategy: 'IMPORT_VALID_ONLY'
      };

      const res = await fetch(`${baseUrl}/admin/courses/bulk-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.success, true);
      assert.strictEqual(data.importedCount, 1, 'Imported count must be 1');
      assert.strictEqual(data.updatedCount, 0, 'Updated count must be 0');
      assert.strictEqual(data.skippedCount, 1, 'Skipped count must be 1');
      assert.strictEqual(data.failedCount, 1, 'Failed count must be 1');

      // Verify CS402_TEST was saved to MySQL
      const newlyCreated = await prisma.courseOffering.findFirst({
        where: { courseCode: createdCourseCode }
      });
      assert.ok(newlyCreated, 'Newly created course must exist in database');
      assert.strictEqual(newlyCreated.courseName, 'Test Algorithms Advanced');

      // Verify CS305 was unchanged
      const cs305Check = await prisma.courseOffering.findUnique({
        where: { id: originalCs305.id }
      });
      assert.strictEqual(cs305Check.courseName, originalCs305.courseName);
    });

    // 6. Integration Test: duplicateAction: 'UPDATE' updates duplicate record
    await runTest('POST /api/admin/courses/bulk-confirm updates duplicate courses when duplicateAction is UPDATE', async () => {
      const payload = {
        rows: [
          {
            courseCode: createdCourseCode,
            courseName: 'Test Algorithms Advanced (Updated)',
            programme: 'BTech',
            batch: '2024 - 2028',
            branch: 'CSE',
            semester: 'Semester 7',
            courseType: 'CORE',
            lecture: 4,
            tutorial: 0,
            practical: 0,
            credits: 4,
            courseObjectives: 'Updated Objectives',
            moduleWiseSyllabusText: 'Module 1: Advanced Flow (8)',
            referenceBooksText: '1. Cormen et al 4th Ed',
            status: 'VALID',
            isDuplicate: true,
            errors: []
          }
        ],
        duplicateAction: 'UPDATE',
        importStrategy: 'IMPORT_VALID_ONLY'
      };

      const res = await fetch(`${baseUrl}/admin/courses/bulk-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.success, true);
      assert.strictEqual(data.importedCount, 0);
      assert.strictEqual(data.updatedCount, 1);
      assert.strictEqual(data.skippedCount, 0);
      assert.strictEqual(data.failedCount, 0);

      // Verify createdCourseCode was updated in MySQL
      const courseUpdated = await prisma.courseOffering.findFirst({
        where: { courseCode: createdCourseCode }
      });
      assert.strictEqual(courseUpdated.courseName, 'Test Algorithms Advanced (Updated)');
      assert.strictEqual(courseUpdated.credits, 4);
    });
  } finally {
    // Cleanup created test course
    try {
      await prisma.courseOffering.deleteMany({
        where: { courseCode: createdCourseCode }
      });

      // Restore complete original CS305 offering
      if (originalCs305) {
        await prisma.courseOffering.update({
          where: { id: originalCs305.id },
          data: {
            courseName: originalCs305.courseName,
            courseType: originalCs305.courseType,
            credits: originalCs305.credits,
            lecture: originalCs305.lecture,
            tutorial: originalCs305.tutorial,
            practical: originalCs305.practical,
            courseObjectives: originalCs305.courseObjectives,
            moduleWiseSyllabusText: originalCs305.moduleWiseSyllabusText,
            referenceBooksText: originalCs305.referenceBooksText
          }
        });
      }
    } catch (e) {}

    server.close();
    console.log(`\nStep 27 Tests finished: ${passedTests} passed, ${failedTests} failed\n`);
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
