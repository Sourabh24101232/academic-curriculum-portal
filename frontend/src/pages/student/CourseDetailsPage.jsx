import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ModuleTable from '../../components/student/ModuleTable';
import { publicApi } from '../../services/api';
import {
  ArrowLeft,
  Download,
  FileText,
  ChevronRight,
  BookOpen,
  Award,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
  BookmarkCheck
} from 'lucide-react';

/**
 * Format course credit metadata line:
 * e.g. "Batch: 2024 - 2028 | Semester: 5 | L 3  T 0  P 0  C 3"
 */
export const formatMetadataLine = (course) => {
  if (!course) return '';
  const batch = course.batch || 'N/A';
  const semester = course.semester ? course.semester.replace(/Semester\s*/i, '') : 'N/A';
  const l = course.creditsBreakdown?.lecture ?? course.lecture ?? 0;
  const t = course.creditsBreakdown?.tutorial ?? course.tutorial ?? 0;
  const p = course.creditsBreakdown?.practical ?? course.practical ?? 0;
  const c = course.creditsBreakdown?.totalCredits ?? course.credits ?? 0;

  return `Batch: ${batch} | Semester: ${semester} | L ${l}  T ${t}  P ${p}  C ${c}`;
};

/**
 * CourseDetailsPage Component
 * Public student view displaying comprehensive course syllabus details:
 * - Breadcrumbs & top back navigation button (strictly below hero banner only)
 * - Course identity bar with metadata and conditional official PDF download
 * - Course objectives card
 * - Complete module-by-module breakdown table
 * - Reference books bibliography
 */
const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await publicApi.getCourseDetails(id);
        if (isMounted && data?.course) {
          setCourse(data.course);
        } else if (isMounted) {
          setErrorMessage('Course syllabus details not found.');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to retrieve course details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center my-6">
        <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
        <p className="text-xs font-semibold text-institute-navy">
          Loading course syllabus details...
        </p>
      </div>
    );
  }

  if (errorMessage || !course) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center my-6 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 mb-2">
          Unable to Load Course Syllabus
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          {errorMessage || 'The requested course offering could not be located in the curriculum database.'}
        </p>
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-institute-navy text-white text-xs font-bold rounded hover:bg-institute-navyDark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Curriculum Page</span>
        </Link>
      </div>
    );
  }

  const metadataLine = formatMetadataLine(course);
  const pdfDownloadUrl = publicApi.getSyllabusPdfUrl(course.id);
  const hasOfficialPdf = Boolean(course.hasOfficialPdf);

  return (
    <div className="space-y-5">
      
      {/* 1. Breadcrumb Indicator */}
      <nav aria-label="Course Breadcrumb" className="text-xs text-slate-500 pb-1">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-black">
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Home</span>
            </Link>
          </li>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <li className="text-slate-600">Academics</li>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <li>
            <Link to="/curriculum" className="text-slate-600 hover:text-black">
              Curriculum
            </Link>
          </li>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <li className="font-semibold text-slate-900">
            {course.courseCode}
          </li>
        </ol>
      </nav>

      {/* 2. Course Identity Bar: Code Badge, Title, Metadata Line & PDF Download */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          <div className="space-y-1.5">
            {/* Course Code Badge */}
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#e0edfd] text-[#1e40af] text-xs font-bold rounded">
                {course.courseCode}
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-[#002855] tracking-tight">
              {course.courseName}
            </h1>

            {/* Metadata Line */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium tracking-wide">
              {metadataLine}
            </p>
          </div>

          {/* Golden Download Syllabus (PDF) Button */}
          {hasOfficialPdf && (
            <div className="flex-shrink-0">
              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={course.pdfFilename || `${course.courseCode}_Syllabus.pdf`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#f6ba38] hover:bg-[#e5a823] active:bg-amber-600 text-slate-900 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-slate-900" />
                <span>Download Syllabus (PDF)</span>
              </a>
            </div>
          )}

        </div>
      </div>

      {/* 3. Course Objectives Card */}
      {course.courseObjectives && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <BookmarkCheck className="w-4 h-4 text-[#1e40af]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
              Course Objectives
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
            {course.courseObjectives}
          </p>
        </div>
      )}

      {/* 4. Complete Syllabus — Module-Wise Table */}
      <ModuleTable
        modules={course.modules || []}
        totalHours={course.totalHours}
      />

      {/* 5. Reference Books Section */}
      {course.referenceBooks && course.referenceBooks.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-[#1e40af]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
              Reference Books
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {course.referenceBooks.map((book, idx) => (
              <li key={idx} className="pl-1">
                <span className="text-slate-800">{book.replace(/^\d+[\.\)]\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
};

export default CourseDetailsPage;
