import assert from 'node:assert';
import fs from 'node:fs';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config/env.js';

console.log('\n--- Running Step 23 Integration Test Suite: Document Upload & PDF Streaming ---\n');

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
    // 1. Fetch a seeded course offering (e.g. CS305)
    const course = await prisma.courseOffering.findFirst({
      where: { courseCode: 'CS305' },
      include: { document: true }
    });

    assert.ok(course, 'Seeded course CS305 must exist in the database');
    const courseId = course.id;

    // Clean up any existing document for clean test isolation
    if (course.document) {
      try {
        if (fs.existsSync(course.document.storagePath)) {
          fs.unlinkSync(course.document.storagePath);
        }
      } catch (e) {}
      await prisma.courseDocument.delete({ where: { id: course.document.id } });
    }

    // 2. GET /api/courses/:id/pdf when no document attached -> 404
    await runTest('GET /api/courses/:id/pdf returns HTTP 404 when no PDF is attached', async () => {
      const res = await fetch(`${baseUrl}/courses/${courseId}/pdf`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /No official PDF syllabus available for this course/);
    });

    // 3. POST /api/admin/courses/:id/pdf without admin auth -> 401
    await runTest('POST /api/admin/courses/:id/pdf returns HTTP 401 Unauthorized for unauthenticated requests', async () => {
      const formData = new FormData();
      const dummyBlob = new Blob(['%PDF-1.4 mock pdf content'], { type: 'application/pdf' });
      formData.append('pdfFile', dummyBlob, 'cs305_syllabus.pdf');

      const res = await fetch(`${baseUrl}/admin/courses/${courseId}/pdf`, {
        method: 'POST',
        body: formData
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /authentication required/i);
    });

    // 4. Authenticate admin user
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

    // 5. POST /api/admin/courses/:id/pdf with non-PDF file (magic byte spoofing rejection) -> 400
    await runTest('POST /api/admin/courses/:id/pdf rejects non-PDF file disguised with .pdf extension (magic bytes check)', async () => {
      const formData = new FormData();
      const fakeBlob = new Blob(['THIS IS NOT A VALID PDF FILE BUFFER'], { type: 'application/pdf' });
      formData.append('pdfFile', fakeBlob, 'fake_document.pdf');

      const res = await fetch(`${baseUrl}/admin/courses/${courseId}/pdf`, {
        method: 'POST',
        headers: {
          Cookie: sessionCookie
        },
        body: formData
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /magic bytes|authentic PDF document/i);
    });

    // 6. POST /api/admin/courses/:id/pdf with authentic PDF -> 201 Created
    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (CS305 Official Syllabus) >>\nendobj\ntrailer\n<< >>\n%%EOF');
    let firstDocId = null;
    let firstStoragePath = null;

    await runTest('POST /api/admin/courses/:id/pdf uploads authentic PDF and stores metadata in MySQL', async () => {
      const formData = new FormData();
      const pdfBlob = new Blob([validPdfBuffer], { type: 'application/pdf' });
      formData.append('pdfFile', pdfBlob, 'CS305_Official_Syllabus.pdf');

      const res = await fetch(`${baseUrl}/admin/courses/${courseId}/pdf`, {
        method: 'POST',
        headers: {
          Cookie: sessionCookie
        },
        body: formData
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.message, 'Official syllabus PDF uploaded successfully.');
      assert.ok(data.document.id);
      assert.strictEqual(data.document.originalFilename, 'CS305_Official_Syllabus.pdf');
      assert.strictEqual(data.document.size, validPdfBuffer.length);
      assert.ok(data.document.checksum);

      firstDocId = data.document.id;

      // Check DB directly
      const savedDoc = await prisma.courseDocument.findUnique({
        where: { id: firstDocId }
      });
      assert.ok(savedDoc);
      firstStoragePath = savedDoc.storagePath;
      assert.ok(fs.existsSync(firstStoragePath), 'Physical PDF file must exist on disk');
    });

    // 7. GET /api/courses/:id/pdf streams authentic PDF
    await runTest('GET /api/courses/:id/pdf publicly streams authentic PDF with correct headers and bytes', async () => {
      const res = await fetch(`${baseUrl}/courses/${courseId}/pdf`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
      assert.strictEqual(res.headers.get('content-length'), String(validPdfBuffer.length));
      assert.ok(res.headers.get('content-disposition').includes('CS305_Official_Syllabus.pdf'));

      const arrayBuf = await res.arrayBuffer();
      const streamedBuf = Buffer.from(arrayBuf);
      assert.deepStrictEqual(streamedBuf, validPdfBuffer);
    });

    // 8. GET /api/courses/:id public details shows hasOfficialPdf: true
    await runTest('GET /api/courses/:id reflects hasOfficialPdf: true for course with uploaded PDF', async () => {
      const res = await fetch(`${baseUrl}/courses/${courseId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.course.hasOfficialPdf, true);
    });

    // 9. Atomic Replacement: POST /api/admin/courses/:id/pdf replaces previous document & deletes old file
    const replacementBuffer = Buffer.from('%PDF-1.7\n2 0 obj\n<< /Title (CS305 REVISED SYLLABUS 2026) >>\nendobj\ntrailer\n<< >>\n%%EOF');

    await runTest('POST /api/admin/courses/:id/pdf replaces existing PDF, removes previous physical file from disk', async () => {
      const formData = new FormData();
      const pdfBlob = new Blob([replacementBuffer], { type: 'application/pdf' });
      formData.append('pdfFile', pdfBlob, 'CS305_Revised_2026.pdf');

      const res = await fetch(`${baseUrl}/admin/courses/${courseId}/pdf`, {
        method: 'POST',
        headers: {
          Cookie: sessionCookie
        },
        body: formData
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.message, 'Official syllabus PDF replaced successfully.');
      assert.strictEqual(data.document.originalFilename, 'CS305_Revised_2026.pdf');
      assert.strictEqual(data.document.size, replacementBuffer.length);

      // Verify that the OLD file was physically deleted from disk
      assert.strictEqual(fs.existsSync(firstStoragePath), false, 'Old PDF file must be deleted from disk upon replacement');

      // Verify new document in DB
      const updatedDoc = await prisma.courseDocument.findUnique({
        where: { courseOfferingId: courseId }
      });
      assert.strictEqual(updatedDoc.id, firstDocId); // Same row ID updated
      assert.ok(fs.existsSync(updatedDoc.storagePath), 'New PDF file must exist on disk');

      // Clean up test file from disk and DB
      fs.unlinkSync(updatedDoc.storagePath);
      await prisma.courseDocument.delete({ where: { id: firstDocId } });
    });

  } catch (err) {
    console.error('Test runner encountered an error:', err);
    failedTests++;
  } finally {
    server.close();
    await prisma.$disconnect();
    console.log(`\nTest results: ${passedTests} passed, ${failedTests} failed.`);
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

main();
