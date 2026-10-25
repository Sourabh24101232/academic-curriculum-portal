import assert from 'node:assert';
import fs from 'node:fs';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import storageService from '../../services/storageService.js';
import { generateReadmeContent } from '../../services/zipService.js';

console.log('\n--- Running Step 24 Integration Test Suite: Filtered ZIP Archiver Engine ---\n');

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
  let createdDocId = null;
  let createdStoragePath = null;

  try {
    // 1. Missing programme query parameter returns 400
    await runTest('GET /api/courses/download-all without programme parameter returns HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/courses/download-all`);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /Programme selection is required/);
    });

    // 2. Invalid programme parameter returns 400
    await runTest('GET /api/courses/download-all with invalid programme returns HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/courses/download-all?programme=Diploma`);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /Programme selection is required/);
    });

    // 3. Filter with no matching courses returns 404
    await runTest('GET /api/courses/download-all with non-matching filters returns HTTP 404', async () => {
      const res = await fetch(`${baseUrl}/courses/download-all?programme=BTech&branch=NONEXISTENT_BRANCH`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.message, /No courses found matching selected filters/);
    });

    // 4. Test generateReadmeContent manifest generator
    await runTest('generateReadmeContent formats complete institutional manifest and missing report', () => {
      const report = generateReadmeContent({
        filterParams: { programme: 'BTech', batch: '2024 - 2028', branch: 'CSE', semester: 'Semester 5' },
        includedFiles: [
          {
            courseCode: 'CS305',
            courseName: 'Database Management Systems',
            semester: 'Semester 5',
            lecture: 3,
            tutorial: 0,
            practical: 0,
            credits: 3,
            archiveFilename: 'CS305_Database_Management_Systems.pdf',
            originalFilename: 'CS305_Official.pdf',
            size: 15420
          }
        ],
        missingFiles: [
          {
            courseCode: 'CS301',
            courseName: 'Operating Systems',
            semester: 'Semester 5',
            lecture: 3,
            tutorial: 0,
            practical: 0,
            credits: 3
          }
        ],
        totalCourses: 2
      });

      assert.ok(report.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHAGALPUR (IIIT BHAGALPUR)'));
      assert.ok(report.includes('Degree Programme : BTech'));
      assert.ok(report.includes('Academic Branch  : CSE'));
      assert.ok(report.includes('Official PDFs In : 1'));
      assert.ok(report.includes('Missing Documents: 1'));
      assert.ok(report.includes('CS305_Database_Management_Systems.pdf'));
      assert.ok(report.includes('SECTION 2: COURSES AWAITING OFFICIAL SYLLABUS PDF (1 Courses)'));
      assert.ok(report.includes('Course Code : CS301'));
      assert.ok(report.includes('In accordance with IIIT Bhagalpur academic integrity guidelines'));
      assert.ok(report.includes('are authentic institutional records and are NEVER synthesized or generated dynamically'));
    });

    // 5. Attach an authentic PDF to CS305 while leaving CS301 without a PDF
    const cs305 = await prisma.courseOffering.findFirst({
      where: { courseCode: 'CS305' },
      include: { document: true }
    });
    assert.ok(cs305, 'CS305 course must exist in database');

    const cs301 = await prisma.courseOffering.findFirst({
      where: { courseCode: 'CS301' },
      include: { document: true }
    });
    assert.ok(cs301, 'CS301 course must exist in database');

    // Clean up CS301 document if any existed so it is guaranteed missing
    if (cs301.document) {
      try {
        if (fs.existsSync(cs301.document.storagePath)) {
          fs.unlinkSync(cs301.document.storagePath);
        }
      } catch (e) {}
      await prisma.courseDocument.delete({ where: { id: cs301.document.id } });
    }

    // Attach sample authentic PDF to CS305
    const samplePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (CS305 Syllabus Document) >>\nendobj\ntrailer\n<< >>\n%%EOF');
    const savedFile = storageService.saveFile(samplePdfBuffer, 'CS305_Syllabus.pdf');
    createdStoragePath = savedFile.storagePath;

    if (cs305.document) {
      try {
        if (fs.existsSync(cs305.document.storagePath)) {
          fs.unlinkSync(cs305.document.storagePath);
        }
      } catch (e) {}
      await prisma.courseDocument.delete({ where: { id: cs305.document.id } });
    }

    const createdDoc = await prisma.courseDocument.create({
      data: {
        courseOfferingId: cs305.id,
        originalFilename: savedFile.originalFilename,
        storagePath: savedFile.storagePath,
        mimeType: 'application/pdf',
        size: savedFile.size,
        checksum: savedFile.checksum
      }
    });
    createdDocId = createdDoc.id;

    // 6. GET /api/courses/download-all?programme=BTech&branch=CSE streams ZIP archive
    await runTest('GET /api/courses/download-all streams ZIP archive with correct headers, magic bytes and entry names', async () => {
      const res = await fetch(`${baseUrl}/courses/download-all?programme=BTech&branch=CSE`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'application/zip');
      const disposition = res.headers.get('content-disposition');
      assert.ok(disposition, 'Content-Disposition header must be present');
      assert.ok(disposition.includes('IIITBH_Syllabi_BTech_CSE.zip'), `Filename should contain IIITBH_Syllabi_BTech_CSE.zip, got: ${disposition}`);

      const zipArrayBuf = await res.arrayBuffer();
      const zipBuf = Buffer.from(zipArrayBuf);

      // Verify ZIP magic bytes: 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
      assert.strictEqual(zipBuf[0], 0x50, 'ZIP byte 0 must be 0x50 (P)');
      assert.strictEqual(zipBuf[1], 0x4B, 'ZIP byte 1 must be 0x4B (K)');
      assert.strictEqual(zipBuf[2], 0x03, 'ZIP byte 2 must be 0x03');
      assert.strictEqual(zipBuf[3], 0x04, 'ZIP byte 3 must be 0x04');

      // Verify that the ZIP Central Directory includes README_SYLLABI.txt and CS305 PDF entries
      const zipString = zipBuf.toString('latin1');
      assert.ok(zipString.includes('README_SYLLABI.txt'), 'ZIP must include README_SYLLABI.txt entry');
      assert.ok(zipString.includes('CS305_Database_Management_Systems.pdf'), 'ZIP must include CS305 official PDF entry');
    });

    // 7. Test with 'All Semesters' filter query
    await runTest('GET /api/courses/download-all?programme=BTech&branch=CSE&semester=All%20Semesters downloads bundle across all semesters', async () => {
      const res = await fetch(`${baseUrl}/courses/download-all?programme=BTech&branch=CSE&semester=All%20Semesters`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'application/zip');
      const disposition = res.headers.get('content-disposition');
      assert.ok(disposition.includes('AllSemesters'), 'Filename should reflect AllSemesters');

      const zipArrayBuf = await res.arrayBuffer();
      const zipBuf = Buffer.from(zipArrayBuf);
      assert.strictEqual(zipBuf[0], 0x50);
      assert.strictEqual(zipBuf[1], 0x4B);
    });

  } catch (err) {
    console.error('Test runner encountered an error:', err);
    failedTests++;
  } finally {
    // Cleanup test artifacts
    if (createdStoragePath && fs.existsSync(createdStoragePath)) {
      try {
        fs.unlinkSync(createdStoragePath);
      } catch (e) {}
    }
    if (createdDocId) {
      try {
        await prisma.courseDocument.delete({ where: { id: createdDocId } });
      } catch (e) {}
    }

    server.close();
    await prisma.$disconnect();
    console.log(`\nTest results: ${passedTests} passed, ${failedTests} failed.`);
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

main();
