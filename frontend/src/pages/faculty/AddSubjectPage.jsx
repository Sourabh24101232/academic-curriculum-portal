import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookPlus } from 'lucide-react';
import { adminApi } from '../../services/api';
import SubjectForm from '../../components/faculty/SubjectForm';

/**
 * AddSubjectPage Component
 * Faculty interface for creating a new independent course offering.
 *
 * Strict Design Invariants:
 * - Top Navigation Bar: "Go to Prev Page" action button.
 * - Header: Title "Add New Subject", subtitle "Create a new independent course offering and syllabus."
 * - Form: SubjectForm with integer credit boxes, live module syntax checker, and PDF uploader.
 * - STRICTLY NO SIDEBAR.
 */
const AddSubjectPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubject = async (coursePayload, pdfFile) => {
    try {
      setIsSubmitting(true);

      // 1. Create course offering record
      const result = await adminApi.createCourse(coursePayload);
      const newCourseId = result?.course?.id;

      // 2. If a PDF document was selected, upload it atomically
      if (pdfFile && newCourseId) {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        await adminApi.uploadPdf(newCourseId, formData);
      }

      // 3. Navigate back to faculty dashboard
      navigate('/faculty/courses', { replace: true });
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/faculty/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-institute-navy px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Prev Page</span>
        </button>
      </div>

      {/* 2. Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-institute-navy text-institute-gold rounded-lg shadow-sm">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-institute-navy tracking-tight font-serif">
              Add New Subject
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Create a new independent course offering and syllabus.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Course Creation Form */}
      <SubjectForm
        onSubmit={handleCreateSubject}
        isEdit={false}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};

export default AddSubjectPage;
