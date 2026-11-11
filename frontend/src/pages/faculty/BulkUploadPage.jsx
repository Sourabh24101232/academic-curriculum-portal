import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { adminApi } from '../../services/api';
import ExcelImportModal from '../../components/faculty/ExcelImportModal';

/**
 * BulkUploadPage Component
 * Standalone page for the /faculty/bulk-upload route.
 *
 * Invariants:
 * - Top Navigation Bar: "Go to Prev Page" action button.
 * - Header: Institutional Navy & Gold title styling.
 * - Download Template button pointing to adminApi.getTemplateUrl().
 * - Launch Bulk Import Modal button.
 * - STRICTLY NO SIDEBAR (enforced via FacultyLayout).
 */
const BulkUploadPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">

      {/* 2. Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-institute-navy text-institute-gold rounded-lg shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-institute-navy tracking-tight font-serif">
              Bulk Excel Course Import
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Upload institutional course curriculum spreadsheets, validate module syntax, and commit in bulk.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bulk Upload Guide & Action Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-base font-bold text-institute-navy">
              Standardized Curriculum Spreadsheet Format
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Download the official Excel template containing pre-formatted headers, sample data rows, and academic rules.
            </p>
          </div>
          <a
            href={adminApi.getTemplateUrl()}
            download="IIITBH_Course_Import_Template.xlsx"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-institute-gold" />
            <span>Download Format (Excel)</span>
          </a>
        </div>

        {/* Instructions & Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-institute-navy flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Required Columns &amp; Data Types
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Course Code &amp; Name:</strong> Mandatory course identifier (unique per Course Code + Programme + Batch).</li>
              <li><strong>Programme, Batch, Branch, Sem:</strong> Strict academic hierarchy matching IIITBH constants. Use comma-separated values for multiple branches/semesters (e.g. <code>CSE, ECE</code>).</li>
              <li><strong>L, T, P, Credits:</strong> Non-negative whole integers only (0, 1, 2, 3...).</li>
              <li><strong>Course Objectives:</strong> Clear educational aims.</li>
              <li><strong>Reference Books:</strong> Standard numbered bibliography.</li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-institute-navy flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-institute-navy" />
              Strict Module-Wise Syllabus Rules
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Must follow: <code>Module &lt;N&gt;: &lt;Topics&gt; (&lt;Hours&gt;)</code></li>
              <li>Sequential numbering: Module 1, Module 2, Module 3...</li>
              <li>Positive integer lecture hours in parentheses.</li>
              <li>Zero tolerance for skipping modules or missing hours.</li>
            </ul>
          </div>
        </div>

        {/* Launch Modal Action */}
        <div className="bg-institute-navy/5 border border-institute-navy/20 rounded-lg p-6 text-center space-y-3">
          <UploadCloud className="w-10 h-10 text-institute-navy mx-auto" />
          <h3 className="text-sm font-bold text-institute-navy">
            Ready to Validate &amp; Import Your Spreadsheet?
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Our dry-run preview inspects every row, detects duplicates against existing offerings, and lets you choose between skipping or updating duplicate courses.
          </p>
          <div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-institute-gold hover:bg-amber-600 text-institute-navyDark text-xs font-bold rounded-md shadow transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Launch Bulk Import Dialog</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bulk Import Modal Dialog */}
      <ExcelImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => navigate('/faculty/courses')}
      />

    </div>
  );
};

export default BulkUploadPage;
