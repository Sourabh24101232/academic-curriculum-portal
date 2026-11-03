import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

/**
 * FacultyLayout Component
 * Faculty & Administrative layout architecture matching proposed UI mockups.
 * - Header: Official institutional header banner (header.png)
 * - Subheader: Golden-amber bar (#f6ba38) with "← Go to Prev Page" and red "Logout" button
 * - Outlet: Full horizontal width content container
 * - Footer: Official college footer
 */
const FacultyLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/faculty/login', { replace: true });
    } catch (err) {
      navigate('/faculty/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* 1. Official Bilingual Header (header.png) */}
      <Header />

      {/* 2. Golden-Amber Subheader Bar (#f6ba38) */}
      <div className="w-full bg-[#f6ba38] border-b border-amber-400 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Prev Page</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ed080b] hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            title="Sign out of faculty portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 3. Full Horizontal Width Content Container (No Sidebar) */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Outlet />
      </main>

      {/* 4. Institutional Footer */}
      <Footer />
    </div>
  );
};

export default FacultyLayout;
