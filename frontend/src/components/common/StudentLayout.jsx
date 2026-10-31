import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import CampusBanner from './CampusBanner';
import Footer from './Footer';

/**
 * StudentLayout Component
 * Public student-facing layout architecture.
 *
 * Enforces institutional guidelines:
 * - TopBar: Utility bar with language toggle & external links
 * - Header: Bilingual institutional header with IIIT Bhagalpur crest & Azadi emblem
 * - CampusBanner: Hero banner with breadcrumb navigation & NEP 2020 badge
 * - Outlet: Contained main content area
 * - Footer: Comprehensive 4-column institutional footer
 */
const StudentLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-institute-surface text-institute-textDark">
      {/* 1. Top Utility Bar */}
      <TopBar />

      {/* 2. Institutional Bilingual Header */}
      <Header />

      {/* 3. Campus Hero Banner */}
      <CampusBanner />

      {/* 4. Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* 5. 4-Column Footer */}
      <Footer />
    </div>
  );
};

export default StudentLayout;
