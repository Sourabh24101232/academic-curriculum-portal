import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import assert from 'node:assert';

import LoginPage from '../LoginPage.jsx';
import LoginLayout from '../../../components/common/LoginLayout.jsx';
import AuthContext from '../../../context/AuthContext.jsx';

console.log('--- Testing Step 37 Faculty Login Page ---');

const mockAuthValue = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  logout: async () => {}
};

// Helper to render LoginPage wrapped in MemoryRouter & mock AuthContext
const renderLoginPage = (authOverrides = {}, initialPath = '/faculty/login') => {
  return renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: { ...mockAuthValue, ...authOverrides } },
      React.createElement(
        MemoryRouter,
        { initialEntries: [initialPath] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(LoginLayout) },
            React.createElement(Route, {
              path: '/faculty/login',
              element: React.createElement(LoginPage)
            })
          )
        )
      )
    )
  );
};

// 1. Branding, Typography & Layout Hierarchy
{
  const html = renderLoginPage();

  // Institutional titles
  assert(html.includes('Faculty Login'), 'LoginPage must display "Faculty Login" card heading');
  assert(html.includes('Access the curriculum management portal.'), 'LoginPage must display official subtitle');

  // Crest Seal & Azadi Emblem SVGs
  assert(html.includes('IIIT BHAGALPUR'), 'LoginPage must render IIIT Bhagalpur crest seal');
  assert(html.includes('विद्या ददाति विनयं'), 'LoginPage seal must include Sanskrit motto');
  assert(html.includes('Azadi Ka Amrit Mahotsav'), 'LoginPage must render Azadi emblem');
  console.log('✓ Branding & Typography: Correctly renders crest seal, Azadi emblem, and bilingual headers');
}

// 2. Form Fields & Interactive Controls
{
  const html = renderLoginPage();

  // Email field with Mail icon
  assert(html.includes('Email ID'), 'LoginPage must contain Email ID label');
  assert(html.includes('type="email"'), 'LoginPage must contain email input');
  assert(html.includes('faculty@iiitbh.ac.in'), 'LoginPage must display institutional email placeholder');

  // Password field with Lock icon & visibility toggle
  assert(html.includes('Password'), 'LoginPage must contain Password label');
  assert(html.includes('type="password"'), 'LoginPage must contain password input (default hidden)');
  assert(html.includes('aria-label="Show password"'), 'LoginPage must contain password toggle button');

  // Remember me checkbox
  assert(html.includes('type="checkbox"'), 'LoginPage must contain checkbox input');
  assert(html.includes('Remember me'), 'LoginPage must contain Remember me label');

  // Gold Login Button
  assert(html.includes('Login'), 'LoginPage must contain Login action button');
  assert(html.includes('bg-institute-gold') || html.includes('#F59E0B'), 'Login button must feature institutional gold styling');
  console.log('✓ Form Controls: Successfully rendered Email, Password, Remember Me, and Gold Login button');
}

// 3. Strict Institutional Constraints Verification
{
  const html = renderLoginPage();

  // STRICTLY NO FOOTER
  assert(!html.includes('<footer'), 'LoginPage inside LoginLayout must STRICTLY NOT contain any <footer> element');
  assert(!html.includes('Copyright &copy; 2026') && !html.includes('Copyright © 2026'), 'LoginPage must STRICTLY NOT render footer copyright notices');

  // STRICTLY NO REGISTRATION / SIGNUP
  assert(!html.includes('Sign Up') && !html.includes('Sign up') && !html.includes('signup'), 'LoginPage must STRICTLY NOT include any registration or signup links');
  assert(!html.includes('Create an account') && !html.includes('Register'), 'LoginPage must STRICTLY NOT contain account creation links');

  // STRICTLY NO FORGOT PASSWORD
  assert(!html.includes('Forgot password') && !html.includes('Forgot Password') && !html.includes('forgot-password'), 'LoginPage must STRICTLY NOT include forgot password links');

  // Navigation: Student Portal return link
  assert(html.includes('Return to Student Curriculum Portal'), 'LoginPage must provide a clean link returning to the student portal');
  console.log('✓ Strict Constraints: Verified NO footer, NO signup link, and NO forgot-password workflow');
}

// 4. Standalone LoginPage Element Structure
{
  const standaloneHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthValue },
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(LoginPage)
      )
    )
  );

  assert(standaloneHtml.includes('Faculty Login'), 'Standalone LoginPage component renders successfully');
  console.log('✓ Standalone Component: LoginPage component renders cleanly in isolation');
}

console.log('--- ALL STEP 37 FACULTY LOGIN PAGE TESTS PASSED ---');
