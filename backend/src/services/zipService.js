import archiver from 'archiver';
import fs from 'node:fs';
import storageService from './storageService.js';

/**
 * Sanitizes a string for use in zip archive entry filenames.
 * Replaces illegal filename characters with underscores and cleans whitespace.
 */
function sanitizeFilename(str) {
  return str
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Generates the institutional README_SYLLABI.txt audit report.
 */
function generateReadmeContent({ filterParams, includedFiles, missingFiles, totalCourses }) {
  const timestamp = new Date().toUTCString();
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);

  let content = '';
  content += `${divider}\n`;
  content += `INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHAGALPUR (IIIT BHAGALPUR)\n`;
  content += `Academic Curriculum & Syllabus Portal - Syllabus Archive Manifest\n`;
  content += `${divider}\n\n`;

  content += `ARCHIVE METADATA:\n`;
  content += `  - Export Timestamp : ${timestamp}\n`;
  content += `  - Degree Programme : ${filterParams.programme || 'All'}\n`;
  content += `  - Academic Batch   : ${filterParams.batch || 'All Batches'}\n`;
  content += `  - Academic Branch  : ${filterParams.branch || 'All Branches'}\n`;
  content += `  - Semester Filter  : ${filterParams.semester || 'All Semesters'}\n`;
  content += `  - Total Courses    : ${totalCourses}\n`;
  content += `  - Official PDFs In : ${includedFiles.length}\n`;
  content += `  - Missing Documents: ${missingFiles.length}\n\n`;

  content += `${divider}\n`;
  content += `SECTION 1: INCLUDED OFFICIAL SYLLABI (${includedFiles.length} Documents)\n`;
  content += `${divider}\n`;

  if (includedFiles.length === 0) {
    content += `No official PDF documents have been uploaded for the courses matching this filter query.\n\n`;
  } else {
    includedFiles.forEach((item, index) => {
      content += `[${index + 1}] Course Code : ${item.courseCode}\n`;
      content += `    Course Name : ${item.courseName}\n`;
      content += `    Semester    : ${item.semester}\n`;
      content += `    Credits     : ${item.credits} (L:${item.lecture} T:${item.tutorial} P:${item.practical})\n`;
      content += `    Archive File: ${item.archiveFilename}\n`;
      content += `    Original Doc: ${item.originalFilename}\n`;
      content += `    File Size   : ${(item.size / 1024).toFixed(1)} KB\n`;
      content += `${subDivider}\n`;
    });
    content += '\n';
  }

  content += `${divider}\n`;
  content += `SECTION 2: COURSES AWAITING OFFICIAL SYLLABUS PDF (${missingFiles.length} Courses)\n`;
  content += `${divider}\n`;

  if (missingFiles.length === 0) {
    content += `All courses matching the selected criteria have an official PDF document attached.\n\n`;
  } else {
    content += `IMPORTANT INSTITUTIONAL NOTICE:\n`;
    content += `In accordance with IIIT Bhagalpur academic integrity guidelines, syllabus documents\n`;
    content += `are authentic institutional records and are NEVER synthesized or generated dynamically.\n`;
    content += `The following courses currently lack an official uploaded PDF document in the system.\n`;
    content += `Authorized department faculty may upload official PDFs via the Faculty Portal.\n\n`;

    missingFiles.forEach((item, index) => {
      content += `[${index + 1}] Course Code : ${item.courseCode}\n`;
      content += `    Course Name : ${item.courseName}\n`;
      content += `    Semester    : ${item.semester}\n`;
      content += `    Credits     : ${item.credits} (L:${item.lecture} T:${item.tutorial} P:${item.practical})\n`;
      content += `    Status      : Pending Faculty Upload\n`;
      content += `${subDivider}\n`;
    });
    content += '\n';
  }

  content += `${divider}\n`;
  content += `End of Syllabus Archive Manifest | IIIT Bhagalpur Curriculum Portal\n`;
  content += `${divider}\n`;

  return content;
}

/**
 * Generates an archiver zip instance for matching course offerings.
 * Bundles all authentic physical PDF files on disk and an institutional README_SYLLABI.txt audit report.
 *
 * @param {Object} options
 * @param {Array} options.courses - Array of CourseOffering records with included document relation
 * @param {Object} options.filterParams - Applied filter query parameters (programme, batch, branch, semester)
 * @returns {archiver.Archiver} - Configured archiver instance ready to be piped
 */
function generateSyllabiArchive({ courses, filterParams }) {
  const archive = archiver('zip', {
    zlib: { level: 6 }
  });

  const includedFiles = [];
  const missingFiles = [];
  const usedEntryNames = new Set();

  for (const course of courses) {
    let hasPhysicalPdf = false;
    let safeFilePath = null;

    if (course.document && course.document.storagePath) {
      try {
        safeFilePath = storageService.getFilePath(course.document.storagePath);
        if (fs.existsSync(safeFilePath)) {
          hasPhysicalPdf = true;
        }
      } catch (err) {
        hasPhysicalPdf = false;
      }
    }

    if (hasPhysicalPdf) {
      // Build unique, clean entry filename
      const cleanCode = sanitizeFilename(course.courseCode || 'Course');
      const cleanName = sanitizeFilename(course.courseName || 'Syllabus');
      let entryFilename = `${cleanCode}_${cleanName}.pdf`;

      // Handle duplicate course codes across semesters in autonomous offerings
      if (usedEntryNames.has(entryFilename)) {
        const cleanSem = sanitizeFilename(course.semester || 'Sem');
        entryFilename = `${cleanSem}_${cleanCode}_${cleanName}.pdf`;
      }

      // If still duplicate, append counter
      if (usedEntryNames.has(entryFilename)) {
        let counter = 2;
        let indexedName = `${entryFilename.replace(/\.pdf$/, '')}_${counter}.pdf`;
        while (usedEntryNames.has(indexedName)) {
          counter++;
          indexedName = `${entryFilename.replace(/\.pdf$/, '')}_${counter}.pdf`;
        }
        entryFilename = indexedName;
      }

      usedEntryNames.add(entryFilename);

      archive.file(safeFilePath, { name: entryFilename });

      includedFiles.push({
        courseCode: course.courseCode,
        courseName: course.courseName,
        semester: course.semester,
        lecture: course.lecture,
        tutorial: course.tutorial,
        practical: course.practical,
        credits: course.credits,
        archiveFilename: entryFilename,
        originalFilename: course.document.originalFilename || entryFilename,
        size: course.document.size || 0
      });
    } else {
      missingFiles.push({
        courseCode: course.courseCode,
        courseName: course.courseName,
        semester: course.semester,
        lecture: course.lecture,
        tutorial: course.tutorial,
        practical: course.practical,
        credits: course.credits
      });
    }
  }

  // Generate and append institutional README audit report
  const readmeContent = generateReadmeContent({
    filterParams,
    includedFiles,
    missingFiles,
    totalCourses: courses.length
  });

  archive.append(readmeContent, { name: 'README_SYLLABI.txt' });

  return archive;
}

export default {
  generateSyllabiArchive,
  generateReadmeContent,
  sanitizeFilename
};

export {
  generateSyllabiArchive,
  generateReadmeContent,
  sanitizeFilename
};
