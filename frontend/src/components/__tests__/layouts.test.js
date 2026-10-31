import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import assert from 'node:assert';

import StudentLayout from '../common/StudentLayout.jsx';
import FacultyLayout from '../common/FacultyLayout.jsx';
import LoginLayout from '../common/LoginLayout.jsx';

console.log('--- Testing Step 31 Layout Architectures ---');

// 1. StudentLayout Verification
{
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      React.createElement(
        Routes,
        null,
        React.createElement(
          Route,
          { element: React.createElement(StudentLayout) },
          React.createElement(Route, {
            path: '/',
            element: React.createElement('div', { id: 'student-test-content' }, 'Student Portal Content')
          })
        )
      )
    )
  );

  assert(html.includes('student-test-content'), 'StudentLayout must render outlet child content');
  assert(html.includes('Ministry of Education'), 'StudentLayout must render TopBar');
  assert(html.includes('Indian Institute of Information Technology Bhagalpur'), 'StudentLayout must render Header');
  assert(html.includes('Academic Curriculum'), 'StudentLayout must render CampusBanner');
  assert(html.includes('Copyright &copy; 2026') || html.includes('Copyright © 2026'), 'StudentLayout must render Footer');
  console.log('✓ StudentLayout: Successfully renders TopBar + Header + CampusBanner + Outlet + Footer');
}

// 2. FacultyLayout Verification (STRICTLY NO SIDEBAR)
{
  const html = renderToString(
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
            element: React.createElement('div', { id: 'faculty-test-content' }, 'Faculty Course Content')
          })
        )
      )
    )
  );

  assert(html.includes('faculty-test-content'), 'FacultyLayout must render outlet child content');
  assert(html.includes('Ministry of Education'), 'FacultyLayout must render TopBar');
  assert(html.includes('Indian Institute of Information Technology Bhagalpur'), 'FacultyLayout must render Header');
  assert(html.includes('Faculty Portal'), 'FacultyLayout must render horizontal faculty context');
  assert(html.includes('Manage Courses'), 'FacultyLayout must render horizontal navigation links');
  assert(html.includes('Copyright &copy; 2026') || html.includes('Copyright © 2026'), 'FacultyLayout must render Footer');

  // Strict constraint: STRICTLY NO SIDEBAR
  assert(!html.includes('<aside'), 'FacultyLayout must STRICTLY NOT contain any <aside> tag');
  assert(!html.includes('sidebar'), 'FacultyLayout must STRICTLY NOT contain sidebar markup or classes');
  console.log('✓ FacultyLayout: Successfully verified TopBar + Header + Horizontal Nav + Outlet + Footer (STRICTLY NO SIDEBAR)');
}

// 3. LoginLayout Verification (STRICTLY NO FOOTER)
{
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/login'] },
      React.createElement(
        Routes,
        null,
        React.createElement(
          Route,
          { element: React.createElement(LoginLayout) },
          React.createElement(Route, {
            path: '/login',
            element: React.createElement('div', { id: 'login-test-box' }, 'Login Form Box')
          })
        )
      )
    )
  );

  assert(html.includes('login-test-box'), 'LoginLayout must render centered outlet content');
  assert(html.includes('Indian Institute of Information Technology Bhagalpur'), 'LoginLayout must render Header');

  // Strict constraint: STRICTLY NO FOOTER
  assert(!html.includes('<footer'), 'LoginLayout must STRICTLY NOT render any <footer> tag');
  assert(!html.includes('Copyright &copy; 2026') && !html.includes('Copyright © 2026'), 'LoginLayout must STRICTLY NOT contain copyright footer');
  assert(!html.includes('Contact Information'), 'LoginLayout must STRICTLY NOT contain footer contact information');
  console.log('✓ LoginLayout: Successfully verified Header + Centered Hero Outlet (STRICTLY NO FOOTER)');
}

console.log('--- ALL STEP 31 LAYOUT TESTS PASSED ---');
