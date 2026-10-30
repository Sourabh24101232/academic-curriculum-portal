import assert from 'node:assert';
import * as XLSX from 'xlsx';
import app from '../../app.js';
import { generateCourseTemplateBuffer } from '../../services/excelService.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config/env.js';

console.log('\n--- Running Step 25 Test Suite: Excel Import Template Generator ---\n');

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
  try {
    // 1. Unit Test: generateCourseTemplateBuffer() produces a valid 2-sheet workbook
    await runTest('generateCourseTemplateBuffer returns a valid Buffer with 2 worksheets', async () => {
      const buffer = generateCourseTemplateBuffer();
      assert.ok(Buffer.isBuffer(buffer), 'Output must be a Buffer');
      assert.ok(buffer.length > 0, 'Buffer must not be empty');

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      assert.deepStrictEqual(
        workbook.SheetNames,
        ['Syllabus Import Template', 'Instructions & ReadMe'],
        'Workbook must contain Syllabus Import Template and Instructions & ReadMe'
      );
    });

    // 2. Unit Test: Sheet 1 has exact required 14 header columns and valid sample row
    await runTest('Sheet 1 has exact 14 columns matching schema and valid sample row', async () => {
      const buffer = generateCourseTemplateBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const ws = workbook.Sheets['Syllabus Import Template'];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

      assert.ok(rows.length >= 2, 'Sheet 1 must have at least header row and sample row');

      const expectedHeaders = [
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
      assert.deepStrictEqual(rows[0], expectedHeaders, 'Header row must match exact 14 specification columns');

      const sampleRow = rows[1];
      assert.strictEqual(sampleRow[0], 'CS305');
      assert.strictEqual(sampleRow[1], 'Database Management Systems');
      assert.strictEqual(sampleRow[2], 'BTech');
      assert.strictEqual(sampleRow[3], '2024 - 2028');
      assert.strictEqual(sampleRow[4], 'CSE');
      assert.strictEqual(sampleRow[5], 'Semester 5');
      assert.strictEqual(sampleRow[6], 'CORE');
      assert.strictEqual(Number(sampleRow[7]), 3);
      assert.strictEqual(Number(sampleRow[8]), 0);
      assert.strictEqual(Number(sampleRow[9]), 0);
      assert.strictEqual(Number(sampleRow[10]), 3);
      assert.ok(sampleRow[11].length > 0, 'Course objectives must be present');
      assert.ok(sampleRow[12].includes('Module 1:'), 'Module-wise syllabus must contain sample modules');
      assert.ok(sampleRow[13].includes('Silberschatz'), 'Reference books must contain sample textbooks');
    });

    // 3. Unit Test: Sheet 2 has clear instructions and constraint explanations
    await runTest('Sheet 2 contains bulk import instructions and field guidelines', async () => {
      const buffer = generateCourseTemplateBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const ws = workbook.Sheets['Instructions & ReadMe'];
      const rawText = XLSX.utils.sheet_to_txt(ws);

      assert.ok(rawText.includes('course_code'), 'Instructions must describe course_code');
      assert.ok(rawText.includes('module_wise_syllabus'), 'Instructions must explain module format');
      assert.ok(rawText.includes('Non-negative integer'), 'Instructions must explain credit/hour constraints');
      assert.ok(rawText.includes('Module <N>:'), 'Instructions must specify module pattern');
    });

    // 4. Integration Test: Unauthenticated GET /api/admin/courses/template -> 401
    await runTest('GET /api/admin/courses/template returns 401 when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/admin/courses/template`);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /authentication required/i);
    });

    // 5. Integration Test: Authenticated admin GET /api/admin/courses/template -> 200 with attachment
    await runTest('GET /api/admin/courses/template returns 200 with .xlsx attachment for authenticated admin', async () => {
      // Admin login
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

      // Download template
      const res = await fetch(`${baseUrl}/admin/courses/template`, {
        headers: { Cookie: sessionCookie }
      });
      assert.strictEqual(res.status, 200);

      const contentType = res.headers.get('content-type');
      assert.strictEqual(
        contentType,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const contentDisposition = res.headers.get('content-disposition');
      assert.strictEqual(
        contentDisposition,
        'attachment; filename="IIITBH_Course_Import_Template.xlsx"'
      );

      const arrayBuffer = await res.arrayBuffer();
      const downloadedBuffer = Buffer.from(arrayBuffer);
      assert.ok(downloadedBuffer.length > 0, 'Downloaded file must not be empty');

      const parsedWb = XLSX.read(downloadedBuffer, { type: 'buffer' });
      assert.deepStrictEqual(parsedWb.SheetNames, [
        'Syllabus Import Template',
        'Instructions & ReadMe'
      ]);
    });
  } finally {
    server.close();
    console.log(`\nStep 25 Tests finished: ${passedTests} passed, ${failedTests} failed\n`);
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
