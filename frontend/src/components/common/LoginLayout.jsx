import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * LoginLayout Component
 * Dedicated authentication layout architecture.
 *
 * Strict Design Invariants:
 * - Header: Bilingual institutional header at top.
 * - Backdrop: Full-height campus photo / geometric dark navy hero backdrop.
 * - Centered Outlet: Perfectly centered authentication container.
 * - STRICTLY NO FOOTER: The footer component must NEVER be rendered on login pages.
 */
const LoginLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-institute-navyDark text-slate-100">
      {/* 1. Official Bilingual Header */}
      <Header />

      {/* 2. Hero Backdrop Container with Centered Login Outlet */}
      <main className="relative flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        {/* Subtle Institutional Geometric Grid Backdrop */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.4" />
                <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        {/* Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-institute-navyDark/90 via-institute-navy/80 to-institute-navyDark/95 pointer-events-none" />

        {/* Centered Outlet for Login Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto">
          <Outlet />
        </div>
      </main>

      {/* STRICTLY NO FOOTER: Login page must never render the footer component */}
    </div>
  );
};

export default LoginLayout;
