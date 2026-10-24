import assert from 'node:assert';
import app from '../../app.js';
import prisma from '../../config/prisma.js';

console.log('\n--- Running Step 17 Integration Test Suite: Public Student APIs ---\n');

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
  // 1. GET /api/programmes
  await runTest('GET /api/programmes returns supported degree programmes', async () => {
    const res = await fetch(`${baseUrl}/programmes`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.programmes));
    assert.deepStrictEqual(data.programmes, ['BTech', 'MTech', 'PhD']);
  });

  // 2. GET /api/filters without programme
  await runTest('GET /api/filters without programme parameter returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/filters`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Programme parameter is required/);
  });

  // 3. GET /api/filters with invalid programme
  await runTest('GET /api/filters with invalid programme returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/filters?programme=Diploma`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Programme parameter is required/);
  });

  // 4. GET /api/filters with valid programme (BTech)
  await runTest('GET /api/filters?programme=BTech returns batches, branches and semesters', async () => {
    const res = await fetch(`${baseUrl}/filters?programme=BTech`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.programme, 'BTech');
    assert.ok(data.batches.includes('2024 - 2028'));
    assert.deepStrictEqual(data.branches, ['CSE', 'MnC', 'ECE', 'MAE']);
    assert.ok(data.semesters.includes('Semester 1'));
    assert.ok(data.semesters.includes('All Semesters'));
    assert.strictEqual(data.semesters[data.semesters.length - 1], 'All Semesters');
  });

  // 5. GET /api/courses without programme
  await runTest('GET /api/courses without programme selection returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/courses`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Programme selection is required/);
  });

  // 6. GET /api/courses with multi-parametric filters (BTech CSE Semester 5)
  await runTest('GET /api/courses with valid filters returns courses array with credit metadata', async () => {
    const res = await fetch(
      `${baseUrl}/courses?programme=BTech&batch=2024%20-%202028&branch=CSE&semester=Semester%205`
    );
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.count >= 2);
    const cs305 = data.courses.find((c) => c.courseCode === 'CS305');
    assert.ok(cs305, 'CS305 must exist in listing');
    assert.strictEqual(cs305.courseName, 'Database Management Systems');
    assert.strictEqual(cs305.credits, 3);
    assert.strictEqual(typeof cs305.isElective, 'boolean');
    assert.strictEqual(typeof cs305.hasOfficialPdf, 'boolean');
  });

  // 7. GET /api/courses with 'All Semesters'
  await runTest('GET /api/courses with All Semesters returns courses across all semesters', async () => {
    const res = await fetch(
      `${baseUrl}/courses?programme=BTech&batch=2024%20-%202028&branch=CSE&semester=All%20Semesters`
    );
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.count >= 2);
  });

  // 8. GET /api/courses with empty branch match
  await runTest('GET /api/courses with non-matching branch returns empty array', async () => {
    const res = await fetch(`${baseUrl}/courses?programme=BTech&branch=MAE`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 0);
    assert.deepStrictEqual(data.courses, []);
  });

  // 9. GET /api/courses/:id with non-existent ID
  await runTest('GET /api/courses/:id with non-existent ID returns HTTP 404', async () => {
    const res = await fetch(`${baseUrl}/courses/00000000-0000-0000-0000-000000000000`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Course offering not found/);
  });

  // 10. GET /api/courses/:id with seeded course
  await runTest('GET /api/courses/:id returns full course details with parsed modules and bibliography', async () => {
    const seededCourse = await prisma.courseOffering.findFirst({
      where: { courseCode: 'CS305' }
    });
    assert.ok(seededCourse, 'Seeded course CS305 must exist in DB');

    const res = await fetch(`${baseUrl}/courses/${seededCourse.id}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.course);
    assert.strictEqual(data.course.courseCode, 'CS305');
    assert.strictEqual(data.course.creditsBreakdown.totalCredits, 3);
    assert.ok(Array.isArray(data.course.modules));
    assert.strictEqual(data.course.modules.length, 5);
    assert.strictEqual(data.course.totalHours, 40);
    assert.strictEqual(data.course.modules[0].moduleNumber, 1);
    assert.ok(Array.isArray(data.course.referenceBooks));
    assert.ok(data.course.referenceBooks.length >= 2);
  });

  console.log(`\nTest Run Summary: ${passedTests} passed, ${failedTests} failed.\n`);
}

main()
  .catch((err) => {
    console.error('Unhandled test runner error:', err);
    failedTests++;
  })
  .finally(async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(failedTests > 0 ? 1 : 0);
  });
