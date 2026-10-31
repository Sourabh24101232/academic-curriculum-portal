import React from 'react';
import TopBar from './components/common/TopBar';
import Header from './components/common/Header';
import CampusBanner from './components/common/CampusBanner';
import Footer from './components/common/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-institute-surface text-institute-textDark">
      {/* 1. Institutional Dark Navy Top Bar */}
      <TopBar />

      {/* 2. Official Bilingual Header with Crest & Azadi Logo */}
      <Header />

      {/* 3. Campus Hero Banner with Gradient & Breadcrumbs */}
      <CampusBanner
        title="Academic Curriculum"
        subtitle="Official Course Structures, Syllabi & Evaluation Schemes"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Curriculum' }
        ]}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <span className="w-3 h-3 rounded-full bg-institute-gold" />
            <h2 className="text-xl font-bold text-institute-navy">
              Curriculum &amp; Syllabus Portal
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the official Academic Curriculum &amp; Syllabus Portal of the Indian Institute of Information Technology Bhagalpur.
            Select your academic degree programme, department, and curriculum regulations to access approved course syllabi.
          </p>
        </div>
      </main>

      {/* 4. Official 4-Column Footer */}
      <Footer />
    </div>
  );
}

export default App;
