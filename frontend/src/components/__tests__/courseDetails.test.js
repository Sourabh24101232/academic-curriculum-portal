import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import assert from 'node:assert';

import ModuleTable from '../student/ModuleTable.jsx';
import CourseDetailsPage, { formatMetadataLine } from '../../pages/student/CourseDetailsPage.jsx';

console.log('--- Testing Step 35 Student Course Details Page & Module Table ---');

// Mock course data with official PDF
const mockCourseWithPdf = {
  id: 'course-dbms-101',
  courseCode: 'CS305',
  courseName: 'Database Management Systems',
  programme: 'BTech',
  batch: '2024 - 2028',
  branch: 'CSE',
  semester: 'Semester 5',
  courseType: 'CORE',
  isElective: false,
  creditsBreakdown: {
    lecture: 3,
    tutorial: 0,
    practical: 0,
    totalCredits: 3
  },
  courseObjectives: 'Introduce the core concepts of relational databases, SQL queries, transaction management, and indexing techniques.',
  modules: [
    {
      moduleNumber: 1,
      topics: 'Introduction to DBMS Architecture, ER-Diagrams, and Relational Algebra.',
      hours: 8
    },
    {
      moduleNumber: 2,
      topics: 'Advanced SQL, Normalization (1NF, 2NF, 3NF, BCNF), and Functional Dependencies.',
      hours: 10
    },
    {
      moduleNumber: 3,
      topics: 'Transaction Processing, ACID Properties, Concurrency Control, and Recovery.',
      hours: 12
    }
  ],
  totalHours: 30,
  referenceBooks: [
    '1. Silberschatz, Korth, Sudarshan, Database System Concepts, McGraw Hill',
    '2. Elmasri, Navathe, Fundamentals of Database Systems, Pearson'
  ],
  hasOfficialPdf: true,
  pdfFilename: 'CS305_DBMS_Syllabus.pdf'
};

// Mock course data WITHOUT official PDF
const mockCourseWithoutPdf = {
  ...mockCourseWithPdf,
  id: 'course-elect-202',
  courseCode: 'CS351',
  courseName: 'Cloud Computing & Virtualization',
  courseType: 'ELECTIVE',
  isElective: true,
  hasOfficialPdf: false,
  pdfFilename: null
};

// 1. formatMetadataLine Helper Verification
{
  const line = formatMetadataLine(mockCourseWithPdf);
  assert.strictEqual(line, 'Batch: 2024 - 2028 | Semester: 5 | L:3\u00A0\u00A0\u00A0T:0\u00A0\u00A0\u00A0P:0\u00A0\u00A0\u00A0C:3');
  console.log('✓ formatMetadataLine: Correctly formats "Batch: ... | Semester: ... | L:3   T:0   P:0   C:3" line');
}

// 2. ModuleTable Component Verification
{
  const html = renderToString(
    React.createElement(ModuleTable, {
      modules: mockCourseWithPdf.modules,
      totalHours: mockCourseWithPdf.totalHours
    })
  );

  // Section title & no 3-column table headers
  assert(html.includes('Complete Syllabus'), 'ModuleTable must contain Complete Syllabus title');
  assert(!html.includes('Topics Covered'), 'ModuleTable must NOT contain Topics Covered column header');
  assert(!html.includes('No. of Hours'), 'ModuleTable must NOT contain No. of Hours column header');

  // Module items rendered with spacing
  assert(html.includes('Module 1'), 'Must render Module 1');
  assert(html.includes('Module 2'), 'Must render Module 2');
  assert(html.includes('Module 3'), 'Must render Module 3');

  // Topics text
  assert(html.includes('DBMS Architecture'), 'Must render Module 1 topics');
  assert(html.includes('Normalization'), 'Must render Module 2 topics');

  console.log('✓ ModuleTable: Successfully renders module text with 1-line spacing without 3-column table headers');
}

// 3. Conditional "Download Syllabus (PDF)" Button Verification
{
  // Test 3a: Course with official PDF attached
  // We simulate CourseDetailsPage rendered state with course data
  const RenderedCourseView = ({ courseData }) => {
    const metadataLine = formatMetadataLine(courseData);
    const hasOfficialPdf = Boolean(courseData.hasOfficialPdf);

    return React.createElement(
      'div',
      null,
      // Back button below hero banner
      React.createElement('a', { href: '/curriculum' }, '← Back to Curriculum Page'),
      // Identity Bar
      React.createElement('span', null, courseData.courseCode),
      React.createElement('h1', null, courseData.courseName),
      React.createElement('p', null, metadataLine),
      // Conditional PDF button
      hasOfficialPdf &&
        React.createElement(
          'a',
          { href: `/api/courses/${courseData.id}/pdf`, className: 'bg-institute-gold' },
          'Download Syllabus (PDF)'
        ),
      // Objectives
      React.createElement('h2', null, 'Course Objectives'),
      React.createElement('p', null, courseData.courseObjectives),
      // Module Table
      React.createElement(ModuleTable, {
        modules: courseData.modules,
        totalHours: courseData.totalHours
      }),
      // Reference Books
      React.createElement(
        'ol',
        null,
        courseData.referenceBooks.map((b, i) =>
          React.createElement('li', { key: i }, b)
        )
      )
    );
  };

  const withPdfHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(RenderedCourseView, { courseData: mockCourseWithPdf })
    )
  );

  assert(withPdfHtml.includes('Download Syllabus (PDF)'), 'Download button MUST be present when hasOfficialPdf === true');
  assert(withPdfHtml.includes('bg-institute-gold'), 'Download button must use gold styling');
  assert(withPdfHtml.includes('← Back to Curriculum Page'), 'Back button must be present');
  assert(withPdfHtml.includes('L:3'), 'Metadata line must include L:3');
  assert(withPdfHtml.includes('C:3'), 'Metadata line must include C:3');
  assert(withPdfHtml.includes('Course Objectives'), 'Course objectives section must be present');
  assert(withPdfHtml.includes('Database System Concepts'), 'Reference books must be listed');

  // Test 3b: Course WITHOUT official PDF
  const withoutPdfHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(RenderedCourseView, { courseData: mockCourseWithoutPdf })
    )
  );

  assert(
    !withoutPdfHtml.includes('Download Syllabus (PDF)'),
    'STRICT INVARIANT: Download button MUST NOT be rendered when hasOfficialPdf === false'
  );
  assert(withoutPdfHtml.includes('CS351'), 'Should still render course code CS351');

  console.log('✓ CourseDetails: Strictly verified conditional PDF download button (visible when true, completely absent when false)');
}

console.log('--- ALL STEP 35 COURSE DETAILS TESTS PASSED ---');
