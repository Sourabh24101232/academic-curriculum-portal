import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import SubjectForm from '../../components/faculty/SubjectForm';

/**
 * EditSubjectPage Component
 * Faculty interface for updating an existing course offering and syllabus.
 *
 * Strict Design Invariants:
 * - Rule 2: "Go to Prev Page" is placed BOTH below header AND above footer.
 * - Outdated-PDF Warning Banner: Prominently displayed in amber/gold if syllabus text
 *   is modified without uploading a replacement PDF. Clears when authentic PDF is uploaded.
 * - STRICTLY NO SIDEBAR.
 */
const EditSubjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [outdatedPdfWarning, setOutdatedPdfWarning] = useState(false);

  // 1. Fetch course offering details for edit form
  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await adminApi.getCourse(id);
        if (isMounted && data && data.course) {
          setCourse(data.course);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Course offering not found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourse();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Handle Update Course & PDF Replacement
  const handleUpdateSubject = async (coursePayload, pdfFile) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // A. Update course text and metadata
      const result = await adminApi.updateCourse(id, coursePayload);

      // B. If a replacement PDF was provided, upload it to synchronize document
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        await adminApi.uploadPdf(id, formData);

        // Clear outdated warning since replacement PDF is now synchronized
        setOutdatedPdfWarning(false);
        setSuccessMessage('Course syllabus and official PDF document updated successfully.');
      } else {
        // If server indicates syllabus changed while a PDF was attached
        if (result?.outdatedPdfWarning) {
          setOutdatedPdfWarning(true);
          setSuccessMessage('Syllabus updated. Notice: Official PDF may be outdated.');
        } else {
          setSuccessMessage('Course offering updated successfully.');
        }
      }

      // Re-fetch course to refresh active metadata
      const refreshed = await adminApi.getCourse(id);
      if (refreshed?.course) {
        setCourse(refreshed.course);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center my-6" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
        <p className="text-xs font-semibold text-institute-navy tracking-wide">
          Loading course offering data for edit...
        </p>
      </div>
    );
  }

  if (errorMessage || !course) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 text-center my-6 shadow-sm">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 mb-1">Course Offering Unavailable</h3>
        <p className="text-xs text-slate-500 mb-4">{errorMessage || 'Could not find the requested course offering.'}</p>
        <button
          type="button"
          onClick={() => navigate('/faculty/courses')}
          className="px-4 py-2 bg-institute-navy text-white text-xs font-semibold rounded hover:bg-institute-navyDark transition-colors"
        >
          Return to Manage Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP Navigation: "Go to Prev Page" placed below header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200" data-testid="top-back-nav">
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
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-institute-navy text-institute-gold rounded-lg shadow-sm">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-institute-navy">
                {course.courseCode}
              </span>
              <span className="text-slate-300">|</span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-serif">
                {course.courseName}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Edit course syllabus, credit structure, and manage attached official PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-sm"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Course Edit Form */}
      <SubjectForm
        initialData={course}
        isEdit={true}
        onSubmit={handleUpdateSubject}
        isSubmitting={isSubmitting}
        outdatedPdfWarning={outdatedPdfWarning}
      />

      {/* 4. BOTTOM Navigation: "Go to Prev Page" placed above footer (Strict Rule 2) */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200" data-testid="bottom-back-nav">
        <button
          type="button"
          onClick={() => navigate('/faculty/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-institute-navy px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Prev Page</span>
        </button>
      </div>

    </div>
  );
};

export default EditSubjectPage;
