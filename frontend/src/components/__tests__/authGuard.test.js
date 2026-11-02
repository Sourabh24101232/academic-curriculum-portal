import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import assert from 'node:assert';

import AuthContext, { AuthProvider, useAuth } from '../../context/AuthContext.jsx';
import ProtectedRoute from '../common/ProtectedRoute.jsx';

console.log('--- Testing Step 36 Auth Context & Protected Route Guard ---');

// 1. useAuth Hook Outside Provider Check
{
  const InvalidConsumer = () => {
    useAuth();
    return React.createElement('div', null, 'Invalid');
  };

  assert.throws(
    () => {
      renderToString(React.createElement(InvalidConsumer));
    },
    /useAuth must be used within an AuthProvider/,
    'useAuth must throw an error when consumed outside of an AuthProvider'
  );
  console.log('✓ useAuth: Throws descriptive error when rendered outside AuthProvider');
}

// 2. ProtectedRoute in Loading State
{
  const mockLoadingAuth = {
    admin: null,
    isAuthenticated: false,
    loading: true,
    login: async () => {},
    logout: async () => {}
  };

  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockLoadingAuth },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses'] },
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            { element: React.createElement(ProtectedRoute) },
            React.createElement(Route, {
              path: '/faculty/courses',
              element: React.createElement('div', { id: 'protected-content' }, 'Secret Dashboard')
            })
          )
        )
      )
    )
  );

  assert(html.includes('role="status"'), 'ProtectedRoute should render status element when loading');
  assert(html.includes('Verifying faculty session...'), 'ProtectedRoute should display institutional session checking message');
  assert(html.includes('animate-spin'), 'ProtectedRoute should display institutional spinner with animate-spin');
  assert(!html.includes('protected-content'), 'ProtectedRoute must NOT render protected content during loading');
  console.log('✓ ProtectedRoute (Loading): Correctly renders institutional loading spinner and message');
}

// 3. ProtectedRoute in Unauthenticated State (Verifies Navigate element props)
{
  const mockUnauth = {
    admin: null,
    isAuthenticated: false,
    loading: false,
    login: async () => {},
    logout: async () => {}
  };

  let renderedElement = null;
  const ComponentHarness = () => {
    renderedElement = ProtectedRoute();
    return null;
  };

  renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockUnauth },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses'] },
        React.createElement(ComponentHarness)
      )
    )
  );

  assert(renderedElement !== null, 'ProtectedRoute must return a React element when unauthenticated');
  assert.strictEqual(renderedElement.type, Navigate, 'ProtectedRoute must return a Navigate component when unauthenticated');
  assert.strictEqual(renderedElement.props.to, '/faculty/login', 'Navigate target must be /faculty/login');
  assert.strictEqual(renderedElement.props.replace, true, 'Navigate replace prop must be true');
  assert(renderedElement.props.state && renderedElement.props.state.from, 'Navigate state must preserve origin in state.from');
  assert.strictEqual(renderedElement.props.state.from.pathname, '/faculty/courses', 'Preserved origin pathname must match /faculty/courses');
  console.log('✓ ProtectedRoute (Unauthenticated): Returns Navigate component targeting /faculty/login with state.from location');
}

// 4. ProtectedRoute in Authenticated State (Returns Outlet)
{
  const mockAuth = {
    admin: { id: 1, email: 'faculty@iiitbh.ac.in' },
    isAuthenticated: true,
    loading: false,
    login: async () => {},
    logout: async () => {}
  };

  let renderedElement = null;
  const ComponentHarness = () => {
    renderedElement = ProtectedRoute();
    return null;
  };

  renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuth },
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/faculty/courses'] },
        React.createElement(ComponentHarness)
      )
    )
  );

  assert(renderedElement !== null, 'ProtectedRoute must return a React element when authenticated');
  assert.strictEqual(renderedElement.type, Outlet, 'ProtectedRoute must render Outlet component when authenticated');
  console.log('✓ ProtectedRoute (Authenticated): Correctly returns Outlet for authenticated faculty');
}

// 5. AuthProvider Export and API Structure Verification
{
  assert(typeof AuthProvider === 'function', 'AuthProvider must be exported as a React component function');
  assert(typeof useAuth === 'function', 'useAuth must be exported as a custom hook function');
  assert(AuthContext !== null && typeof AuthContext === 'object', 'AuthContext must be exported');
  console.log('✓ AuthContext: Successfully verified module exports and structure');
}

console.log('--- ALL STEP 36 AUTH CONTEXT & PROTECTED ROUTE TESTS PASSED ---');
