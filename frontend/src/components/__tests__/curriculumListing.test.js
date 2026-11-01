import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import assert from 'node:assert';

import CurriculumTable, { formatSummaryLine } from '../student/CurriculumTable.jsx';
import CurriculumPage from '../../pages/student/CurriculumPage.jsx';

console.log('--- Testing Step 34 Student Curriculum Listing Page & Table ---');

// Mock data
const mockFilters = {
  programme: 'BTech',
  batch: '2024 - 2028',
  branch: 'CSE',
  semester: 'Semester 5'
};

const mockCourses = [
  {
    id: 'course-1',
    courseCode: 'CS305',
    courseName: 'Database Management Systems',
    programme: 'BTech',
    batch: '2024 - 2028',
    branch: 'CSE',
    semester: 'Semester 5',
    courseType: 'CORE',
    isElective: false,
    lecture: 3,
    tutorial: 0,
    practical: 0,
    credits: 3,
    hasOfficialPdf: true
  },
  {
    id: 'course-2',
    courseCode: 'CS351',
    courseName: 'Cloud Computing & Virtualization',
    programme: 'BTech',
    batch: '2024 - 2028',
    branch: 'CSE',
    semester: 'Semester 5',
    courseType: 'ELECTIVE',
    isElective: true,
    lecture: 3,
    tutorial: 0,
    practical: 0,
    credits: 3,
    hasOfficialPdf: false
  }
];

// 1. formatSummaryLine Helper Verification
{
  const summary = formatSummaryLine(mockFilters);
  assert.strictEqual(summary, 'Semester 5 · BTech (CSE) · Batch 2024 - 2028');
  console.log('✓ formatSummaryLine: Correctly formats institutional summary string');
}

// 2. CurriculumTable Component Verification
{
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(CurriculumTable, {
        courses: mockCourses,
        filters: mockFilters,
        onDownloadZip: () => {}
      })
    )
  );

  // Summary header
  assert(html.includes('Semester 5 · BTech (CSE) · Batch 2024 - 2028'), 'Header summary must match formatted filters');
  assert(html.includes('Displaying 2 approved curriculum courses'), 'Must display count badge');

  // "Download All Syllabus (PDF)" button in gold
  assert(html.includes('Download All Syllabus (PDF)'), 'Must render "Download All Syllabus (PDF)" button');
  assert(html.includes('bg-institute-gold'), 'Download button must use gold institutional styling');

  // Table columns
  assert(html.includes('Course Code'), 'Table must contain Course Code header');
  assert(html.includes('Course Name'), 'Table must contain Course Name header');
  assert(html.includes('Actions'), 'Table must contain Actions header');

  // Core vs Elective course code formatting
  assert(html.includes('CS305'), 'Must render CS305 core course code');
  assert(html.includes('CS351 *'), 'Elective course must suffix course code with an asterisk (*)');
  assert(!html.includes('CS305 *'), 'Core course must NOT suffix course code with an asterisk');

  // Action View Syllabus button
  assert(html.includes('View Syllabus'), 'Must render "View Syllabus" action button');
  assert(html.includes('href="/courses/course-1"'), 'Action button must link to /courses/:id');
  assert(html.includes('href="/courses/course-2"'), 'Action button must link to /courses/:id');

  // Legend below table
  assert(html.includes('represents elective courses'), 'Must render the formal elective legend below table');

  console.log('✓ CurriculumTable: Successfully verified summary line, gold download button, elective asterisk notation, action links, and legend');
}

// 3. CurriculumTable Empty State Verification
{
  const emptyHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(CurriculumTable, {
        courses: [],
        filters: mockFilters
      })
    )
  );

  assert(htmlIncludesOneOf(emptyHtml, ['No Course Syllabi Found', 'No courses matching criteria']), 'Empty table must display helpful message');
  assert(!emptyHtml.includes('CS305'), 'Empty table should not render rows');
  console.log('✓ CurriculumTable: Successfully renders empty state when no courses match');
}

// 4. First-Time Visitor Gate in CurriculumPage Verification
{
  // When no programme is set in localStorage, CurriculumPage displays gate callout
  const gateHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(CurriculumPage)
    )
  );

  assert(
    gateHtml.includes('Please select a programme (BTech, MTech, or PhD) to view curriculum and course syllabi.'),
    'First-time visitor gate callout must appear when no programme is selected'
  );
  // Curriculum table headers should NOT be rendered when gate is active
  assert(!gateHtml.includes('Displaying 2 approved curriculum courses'), 'Table must remain hidden when gate is active');
  assert(
    gateHtml.includes('Explore') && gateHtml.includes('BTech'),
    'Quick start pills should be available in gate'
  );

  console.log('✓ CurriculumPage: First-Time Visitor Gate verified (callout displays and table is hidden)');
}

function htmlIncludesOneOf(html, candidates) {
  return candidates.some((c) => html.includes(c));
}

console.log('--- ALL STEP 34 CURRICULUM LISTING TESTS PASSED ---');
