import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';

// Layout Wrappers
import StudentLayout from './components/common/StudentLayout';
import FacultyLayout from './components/common/FacultyLayout';
import LoginLayout from './components/common/LoginLayout';

/**
 * Placeholder Views for Routing Architecture
 * (These will be populated in subsequent steps: 34, 35, 37, 38)
 */
export const StudentHomePlaceholder = () => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
      <span className="w-3 h-3 rounded-full bg-institute-gold" />
      <h2 className="text-xl font-bold text-institute-navy">Curriculum &amp; Syllabus Portal</h2>
    </div>
    <p className="text-sm text-slate-600 mb-6">
      Please select an academic degree programme, batch, and semester to view official curriculum structures and course syllabi.
    </p>
    <div className="flex flex-wrap gap-3">
      <Link
        to="/courses/1"
        className="px-4 py-2 bg-institute-navy text-white text-xs font-semibold rounded hover:bg-institute-navyDark transition-colors"
      >
        Preview Sample Course (ID: 1)
      </Link>
      <Link
        to="/login"
        className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors"
      >
        Faculty / Admin Login
      </Link>
    </div>
  </div>
);

export const CourseDetailsPlaceholder = () => {
  const { id } = useParams();
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
        <span className="w-3 h-3 rounded-full bg-institute-gold" />
        <h2 className="text-xl font-bold text-institute-navy">Course Syllabus Details</h2>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Viewing detailed syllabus and module breakdown for Course ID: <strong className="text-institute-navy">{id}</strong>.
      </p>
      <Link
        to="/"
        className="text-xs font-semibold text-institute-navy hover:text-institute-gold inline-flex items-center gap-1"
      >
        &larr; Back to Curriculum
      </Link>
    </div>
  );
};

export const FacultyCoursesPlaceholder = () => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-institute-gold" />
        <h2 className="text-xl font-bold text-institute-navy">Faculty Course Management</h2>
      </div>
      <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-semibold">
        Full Width Layout (No Sidebar)
      </span>
    </div>
    <p className="text-sm text-slate-600">
      Manage active curriculum courses, upload official PDF documents, and update course offerings.
    </p>
  </div>
);

export const FacultyUploadPlaceholder = () => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
      <span className="w-3 h-3 rounded-full bg-institute-gold" />
      <h2 className="text-xl font-bold text-institute-navy">Bulk Excel Course Import</h2>
    </div>
    <p className="text-sm text-slate-600">
      Download the standard template spreadsheet, dry-run validate curriculum datasets, and confirm bulk ingestion.
    </p>
  </div>
);

export const FacultyAuditPlaceholder = () => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
      <span className="w-3 h-3 rounded-full bg-institute-gold" />
      <h2 className="text-xl font-bold text-institute-navy">System Audit Trail</h2>
    </div>
    <p className="text-sm text-slate-600">
      Track administrative mutations, PDF uploads, course deletions, and bulk import actions.
    </p>
  </div>
);

export const LoginPlaceholder = () => (
  <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8 text-center text-institute-textDark">
    <div className="w-12 h-12 rounded-full bg-institute-navy text-institute-gold flex items-center justify-center mx-auto mb-4 font-bold text-lg border-2 border-institute-gold">
      IIIT
    </div>
    <h2 className="text-2xl font-bold text-institute-navy mb-1">Faculty Login</h2>
    <p className="text-xs text-slate-500 mb-6">
      Indian Institute of Information Technology Bhagalpur
    </p>
    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded p-3 mb-6">
      Dedicated Login Layout: <strong>Strictly NO Footer rendered</strong>.
    </div>
    <Link
      to="/"
      className="inline-block px-5 py-2.5 bg-institute-navy text-white text-xs font-semibold rounded shadow hover:bg-institute-navyDark transition-colors"
    >
      Return to Student Portal
    </Link>
  </div>
);

/**
 * Route Tree for the Application
 */
export const AppRoutes = () => (
  <Routes>
    {/* 1. Public Student Routes (StudentLayout: TopBar + Header + Banner + Outlet + Footer) */}
    <Route element={<StudentLayout />}>
      <Route path="/" element={<StudentHomePlaceholder />} />
      <Route path="/curriculum" element={<StudentHomePlaceholder />} />
      <Route path="/courses/:id" element={<CourseDetailsPlaceholder />} />
    </Route>

    {/* 2. Faculty Routes (FacultyLayout: TopBar + Header + Horizontal Nav + Outlet + Footer; NO SIDEBAR) */}
    <Route element={<FacultyLayout />}>
      <Route path="/faculty/courses" element={<FacultyCoursesPlaceholder />} />
      <Route path="/faculty/bulk-upload" element={<FacultyUploadPlaceholder />} />
      <Route path="/faculty/audit-logs" element={<FacultyAuditPlaceholder />} />
    </Route>

    {/* 3. Authentication Routes (LoginLayout: Header + Centered Outlet; STRICTLY NO FOOTER) */}
    <Route element={<LoginLayout />}>
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/faculty/login" element={<LoginPlaceholder />} />
    </Route>

    {/* 4. Wildcard Catch-All: Redirect to Home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * Main Application Component with React Router v6 Architecture
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
