import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import { BookOpen, UploadCloud, FileText, UserCheck } from 'lucide-react';

/**
 * FacultyLayout Component
 * Faculty & Administrative layout architecture.
 *
 * Strict Design Invariants:
 * - STRICTLY NO SIDEBAR: Full horizontal width layout for faculty course management & data tables.
 * - TopBar + Header + Top Horizontal Navigation Bar + Outlet + Footer.
 */
const FacultyLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Manage Courses', path: '/faculty/courses', icon: BookOpen },
    { label: 'Bulk Excel Upload', path: '/faculty/bulk-upload', icon: UploadCloud },
    { label: 'Audit Trail', path: '/faculty/audit-logs', icon: FileText }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-institute-surface text-institute-textDark">
      {/* 1. Top Utility Bar */}
      <TopBar />

      {/* 2. Institutional Bilingual Header */}
      <Header />

      {/* 3. Horizontal Faculty Context Sub-Navigation Bar (STRICTLY NO SIDEBAR) */}
      <nav aria-label="Faculty Navigation" className="bg-institute-navy text-white border-b border-institute-gold shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-0 gap-2">
            
            {/* Context Badge */}
            <div className="flex items-center gap-2 py-2">
              <span className="w-2 h-2 rounded-full bg-institute-gold" />
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
                Faculty Portal
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-xs text-slate-300 hidden sm:inline">
                Academic Curriculum Management
              </span>
            </div>

            {/* Horizontal Navigation Links */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-institute-surface text-institute-navy font-semibold border-t-2 border-institute-gold'
                        : 'text-slate-300 hover:text-white hover:bg-institute-navyDark'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-institute-gold' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

          </div>
        </div>
      </nav>

      {/* 4. Full Horizontal Width Content Container (No Sidebar) */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Outlet />
      </main>

      {/* 5. Institutional Footer */}
      <Footer />
    </div>
  );
};

export default FacultyLayout;
