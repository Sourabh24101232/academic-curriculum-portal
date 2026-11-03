import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import loginBgImg from '../../assets/images/login_bg.png';

/**
 * LoginLayout Component
 * Dedicated authentication layout matching the proposed mockups:
 * - Header: Institutional header banner (header.png)
 * - Backdrop: Authentic campus building & courtyard photograph
 * - Centered Outlet: Centered login card
 * - Strictly NO footer rendered
 */
const LoginLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-800">
      {/* 1. Official Institutional Header (header.png) */}
      <Header />

      {/* 2. Campus Photo Hero Backdrop with Centered Login Outlet */}
      <main className="relative flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-140px)] overflow-hidden">
        {/* Campus Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBgImg})` }}
        />

        {/* Subtle backdrop overlay for crisp contrast */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Centered Outlet for Login Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto">
          <Outlet />
        </div>
      </main>

      {/* Strictly NO footer rendered on login screen */}
    </div>
  );
};

export default LoginLayout;
