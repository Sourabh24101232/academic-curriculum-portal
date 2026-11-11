import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import assert from 'node:assert';

import SubjectForm, { validateSyllabusClient } from '../../../components/faculty/SubjectForm.jsx';
import AddSubjectPage from '../AddSubjectPage.jsx';
import EditSubjectPage from '../EditSubjectPage.jsx';
import FacultyLayout from '../../../components/common/FacultyLayout.jsx';
import AuthContext from '../../../context/AuthContext.jsx';

console.log('--- Testing Step 39 Subject Authoring Forms & Outdated-PDF Banner ---');

const mockAuthValue = {
  admin: { id: 1, email: 'faculty@iiitbh.ac.in' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {}
};

const mockCourseData = {
  id: 'course-305',
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
  courseObjectives: 'Introduce database systems, ER models, normalization and transactions.',
  moduleWiseSyllabusText: 'Module 1: Relational Algebra\nModule 2: SQL and Normalization',
  referenceBooksText: '1. Silberschatz, Database System Concepts.',
  hasOfficialPdf: true,
  document: {
    id: 'doc-1',
    originalFilename: 'CS305_Syllabus.pdf'
  }
};

// 1. Live Client-Side Syllabus Syntax Validator Test
{
  // Valid multiline text without hours
  const validResult = validateSyllabusClient('Module 1: Intro\nModule 2: Advanced SQL');
  assert.strictEqual(validResult.isValid, true, 'Valid syllabus should pass syntax checker');
  assert.strictEqual(validResult.moduleCount, 2, 'Should detect 2 modules');

  // Topic list ending with parenthetical clarification must be accepted
  const parentheticalTopicsResult = validateSyllabusClient('Module 1: Normalization (1NF, 2NF, 3NF, BCNF)');
  assert.strictEqual(parentheticalTopicsResult.isValid, true, 'Parenthetical topic details should pass');
  assert.strictEqual(parentheticalTopicsResult.moduleCount, 1, 'Should detect 1 module');

  // Empty syllabus
  const emptyResult = validateSyllabusClient('');
  assert.strictEqual(emptyResult.isValid, false, 'Empty text should fail');

  // Out of sequence module numbering
  const outOfOrderResult = validateSyllabusClient('Module 1: Intro\nModule 3: Jumped Module');
  assert.strictEqual(outOfOrderResult.isValid, false, 'Out-of-order module must fail');
  assert.strictEqual(outOfOrderResult.line, 2, 'Should identify error on Line 2');
  assert(outOfOrderResult.message.includes('Expected Module 2'), 'Error message must state expected module sequence');

  // Malformed module header without numeric module index
  const badHeaderResult = validateSyllabusClient('Module One: Intro');
  assert.strictEqual(badHeaderResult.isValid, false, 'Non-numeric module header must fail');
  assert.strictEqual(badHeaderResult.line, 1, 'Should identify error on Line 1');
  assert(badHeaderResult.message.includes('Module <N>: <Topic List>'), 'Error message must reference Module <N>: <Topic List>');

  console.log('✓ validateSyllabusClient: Accurately validates sequence and reports line numbers');
}

// 2. SubjectForm: Field Rendering & Outdated-PDF Banner Lifecycle
{
  // Normal form without warning
  const normalHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SubjectForm, {
        initialData: mockCourseData,
        isEdit: true,
        outdatedPdfWarning: false
      })
    )
  );

  // Field presence
  assert(normalHtml.includes('Course Code'), 'SubjectForm must render Course Code field');
  assert(normalHtml.includes('Course Name'), 'SubjectForm must render Course Name field');
  assert(normalHtml.includes('Lecture (L)'), 'SubjectForm must render Lecture credit box');
  assert(normalHtml.includes('Tutorial (T)'), 'SubjectForm must render Tutorial credit box');
  assert(normalHtml.includes('Practical (P)'), 'SubjectForm must render Practical credit box');
  assert(normalHtml.includes('Total Credits (C)'), 'SubjectForm must render Credits credit box');
  assert(normalHtml.includes('Course Objectives'), 'SubjectForm must render Course Objectives textarea');
  assert(normalHtml.includes('Module-Wise Syllabus Text'), 'SubjectForm must render Syllabus textarea');
  assert(normalHtml.includes('Text and Reference'), 'SubjectForm must render Text and Reference textarea');
  assert(normalHtml.includes('Official Course Syllabus PDF Document'), 'SubjectForm must render PDF file picker');
  assert(normalHtml.includes('Update Syllabus'), 'SubjectForm in edit mode must render "Update Syllabus" button');
  assert(!normalHtml.includes('Official PDF Outdated Warning'), 'Normal form must NOT display outdated-pdf warning');

  // Outdated-PDF Warning Banner check
  const warningHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SubjectForm, {
        initialData: mockCourseData,
        isEdit: true,
        outdatedPdfWarning: true
      })
    )
  );

  assert(warningHtml.includes('Official PDF Outdated Warning'), 'SubjectForm must display warning banner when outdatedPdfWarning is true');
  assert(warningHtml.includes('The syllabus has been updated, but the official PDF may be outdated. Please upload the revised PDF.'), 'Must display exact required warning message text');

  console.log('✓ SubjectForm: Verified mandatory fields, credit boxes, PDF picker, and outdated-PDF warning banner');
}

// 3. AddSubjectPage Component Rendering
{
  const addHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses/new'] },
        React.createElement(AddSubjectPage)
      )
    )
  );

  assert(addHtml.includes('Add New Subject'), 'AddSubjectPage must display "Add New Subject" title');
  assert(addHtml.includes('Create a new independent course offering and syllabus.'), 'AddSubjectPage must display subtitle');
  assert(addHtml.includes('Go to Prev Page'), 'AddSubjectPage must display back navigation action');
  assert(addHtml.includes('Save Subject'), 'AddSubjectPage must render "Save Subject" submit button');

  console.log('✓ AddSubjectPage: Renders header, back button, and new subject creation form');
}

// 4. EditSubjectPage Component Rendering & Rule 2 Dual Navigation
{
  const editHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses/course-305/edit'] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            {
              path: '/faculty/courses/:id/edit',
              element: React.createElement(EditSubjectPage)
            }
          )
        )
      )
    )
  );

  // Note: During initial renderToString, component is in loading state
  assert(editHtml.includes('Loading course offering data for edit...') || editHtml.includes('Go to Prev Page'), 'EditSubjectPage renders loading or edit interface cleanly');

  console.log('✓ EditSubjectPage: Successfully mounted and rendered within router');
}

// 5. Strict Constraints Verification (NO SIDEBAR on Faculty Pages)
{
  const pageHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses/new'] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(FacultyLayout) },
            React.createElement(Route, {
              path: '/faculty/courses/new',
              element: React.createElement(AddSubjectPage)
            })
          )
        )
      )
    )
  );

  assert(!pageHtml.includes('<aside'), 'AddSubjectPage inside FacultyLayout must STRICTLY NOT contain <aside> sidebar');
  assert(!pageHtml.includes('sidebar'), 'AddSubjectPage must STRICTLY NOT contain sidebar markup or classes');

  console.log('✓ Strict Constraints: Verified NO sidebar on course authoring page');
}

console.log('--- ALL STEP 39 SUBJECT FORMS & OUTDATED-PDF WARNING TESTS PASSED ---');
