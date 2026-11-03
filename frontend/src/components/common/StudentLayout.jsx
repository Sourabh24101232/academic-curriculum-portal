import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import CampusBanner from './CampusBanner';
import Footer from './Footer';
import backgroundImage from '../../assets/images/backgroundImage.png';

/**
 * StudentLayout Component
 * Public student-facing layout architecture.
 * - Header: Institutional header banner (header.png)
 * - Subheader: Golden-amber navigation bar (#f6ba38)
 * - CampusBanner: Panoramic hero banner with title
 * - Outlet: Contained main content area
 * - Footer: Official 4-column footer
 */
const StudentLayout = () => {
  const location = useLocation();
  const isCourseDetails = location.pathname.startsWith('/courses/');

  const bannerTitle = isCourseDetails ? 'Course Details' : 'Curriculum';
  const bannerSubtitle = isCourseDetails
    ? 'Detailed syllabus, modules and reference books.'
    : 'Explore semester-wise curriculum and course syllabi for all batches.';
  const heroImg = backgroundImage;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* 1. Institutional Bilingual Header (header.png) */}
      <Header />

      {/* 2. Golden-Amber Subheader Bar (#f6ba38) */}
      <div className="w-full bg-[#f6ba38] border-b border-amber-400 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to={isCourseDetails ? '/curriculum' : '/'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isCourseDetails ? 'Back to Curriculum Page' : 'Back to Home Page'}</span>
          </Link>
        </div>
      </div>

      {/* 3. Campus Hero Banner */}
      <CampusBanner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        bgImage={heroImg}
      />

      {/* 4. Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Outlet />
      </main>

      {/* 5. Official College Footer */}
      <Footer />
    </div>
  );
};

export default StudentLayout;
