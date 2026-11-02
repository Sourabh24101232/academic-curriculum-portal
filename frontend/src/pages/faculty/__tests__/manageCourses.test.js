import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import assert from 'node:assert';

import ManageCoursesPage from '../ManageCoursesPage.jsx';
import FacultyCourseTable from '../../../components/faculty/FacultyCourseTable.jsx';
import FacultyLayout from '../../../components/common/FacultyLayout.jsx';
import AuthContext from '../../../context/AuthContext.jsx';

console.log('--- Testing Step 38 Faculty Manage Courses Dashboard ---');

const mockAuthValue = {
  admin: { id: 1, email: 'faculty@iiitbh.ac.in' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {}
};

const mockCourses = [
  {
    id: 'course-101',
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
    id: 'course-102',
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

// 1. ManageCoursesPage: Top Navigation, Header & Primary Actions
{
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses'] },
        React.createElement(ManageCoursesPage)
      )
    )
  );

  // Top Nav Actions
  assert(html.includes('Go to Prev Page'), 'ManageCoursesPage must contain "Go to Prev Page" action');
  assert(html.includes('Logout'), 'ManageCoursesPage must contain "Logout" action');

  // Header & Title
  assert(html.includes('Manage Courses'), 'ManageCoursesPage must display "Manage Courses" title');
  assert(html.includes('View, add, edit or delete courses.'), 'ManageCoursesPage must display official subtitle');

  // Primary Action Button: + Add New Subject
  assert(html.includes('+ Add New Subject'), 'ManageCoursesPage must render "+ Add New Subject" action button');
  assert(html.includes('/faculty/courses/new'), 'Add New Subject button must link to /faculty/courses/new');

  // Filter Dropdowns
  assert(html.includes('Programme'), 'ManageCoursesPage must contain Programme filter label');
  assert(html.includes('Batch'), 'ManageCoursesPage must contain Batch filter label');
  assert(html.includes('Branch'), 'ManageCoursesPage must contain Branch filter label');
  assert(html.includes('Semester'), 'ManageCoursesPage must contain Semester filter label');
  assert(html.includes('Reset Filters'), 'ManageCoursesPage must contain Reset Filters button');

  console.log('✓ ManageCoursesPage: Top nav, header, primary action, and filters rendered correctly');
}

// 2. FacultyCourseTable: Columns, Data, & Action Links
{
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(FacultyCourseTable, { courses: mockCourses, onDelete: () => {} })
    )
  );

  // Required Columns
  assert(html.includes('Course Code'), 'FacultyCourseTable must have "Course Code" column');
  assert(html.includes('Course Name'), 'FacultyCourseTable must have "Course Name" column');
  assert(html.includes('Actions'), 'FacultyCourseTable must have "Actions" column');

  // Course Data rows
  assert(html.includes('CS305'), 'FacultyCourseTable must render course code CS305');
  assert(html.includes('Database Management Systems'), 'FacultyCourseTable must render course title');
  assert(html.includes('PDF Attached'), 'FacultyCourseTable must display "PDF Attached" badge');

  // Elective Indicator
  assert(html.includes('CS351'), 'FacultyCourseTable must render elective course code CS351');
  assert(html.includes('Elective'), 'FacultyCourseTable must render Elective badge for elective courses');
  assert(html.includes('No PDF Attached'), 'FacultyCourseTable must display "No PDF Attached" badge');

  // Action Button: Gold Update Syllabus
  assert(html.includes('Update Syllabus'), 'FacultyCourseTable must render gold "Update Syllabus" action');
  assert(html.includes('/faculty/courses/course-101/edit'), 'Update Syllabus button must link to /faculty/courses/:id/edit');
  assert(html.includes('bg-institute-gold'), 'Update Syllabus button must use institutional gold styling');

  // Delete Action Trigger
  assert(html.includes('aria-label="Delete CS305"'), 'FacultyCourseTable must contain delete button with accessible aria-label');

  console.log('✓ FacultyCourseTable: Successfully verified columns, course rows, gold Update button, and delete action');
}

// 3. FacultyCourseTable: Empty State & Loading State
{
  const emptyHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(FacultyCourseTable, { courses: [], onDelete: () => {} })
    )
  );
  assert(emptyHtml.includes('No Courses Found'), 'FacultyCourseTable should render empty state card when courses list is empty');

  const loadingHtml = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(FacultyCourseTable, { courses: [], isLoading: true })
    )
  );
  assert(loadingHtml.includes('Loading faculty course offerings...'), 'FacultyCourseTable should render loading state');

  console.log('✓ FacultyCourseTable: Empty and loading states behave cleanly');
}

// 4. Strict Non-Negotiable Constraints Verification
{
  const fullPageHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses'] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(FacultyLayout) },
            React.createElement(Route, {
              path: '/faculty/courses',
              element: React.createElement(ManageCoursesPage)
            })
          )
        )
      )
    )
  );

  // STRICTLY NO SIDEBAR
  assert(!fullPageHtml.includes('<aside'), 'Faculty dashboard inside FacultyLayout must STRICTLY NOT contain any <aside> sidebar');
  assert(!fullPageHtml.includes('sidebar'), 'Faculty dashboard must STRICTLY NOT contain sidebar markup or classes');

  // STRICTLY NO "Download All Syllabi" BUTTON
  assert(!fullPageHtml.includes('Download All Syllabus'), 'Faculty dashboard must STRICTLY NOT contain "Download All Syllabus" button');
  assert(!fullPageHtml.includes('Download All Syllabi'), 'Faculty dashboard must STRICTLY NOT contain "Download All Syllabi" button');

  console.log('✓ Strict Constraints: Verified NO sidebar and NO "Download All Syllabi" button on faculty dashboard');
}

console.log('--- ALL STEP 38 FACULTY MANAGE COURSES DASHBOARD TESTS PASSED ---');
