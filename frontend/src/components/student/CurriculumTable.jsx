import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Loader2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

/**
 * Format active filters into an institutional summary line:
 * e.g. "Semester 5 · BTech (CSE) · Batch 2024 – 2028"
 */
export const formatSummaryLine = (filters = {}) => {
  const parts = [];

  if (filters.semester && filters.semester.trim() !== '') {
    parts.push(filters.semester);
  }

  if (filters.programme && filters.programme.trim() !== '') {
    if (filters.branch && filters.branch.trim() !== '') {
      parts.push(`${filters.programme} (${filters.branch})`);
    } else {
      parts.push(filters.programme);
    }
  }

  if (filters.batch && filters.batch.trim() !== '') {
    parts.push(`Batch ${filters.batch}`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'All Curriculum Courses';
};

/**
 * CurriculumTable Component
 * Student course offering table with elective indicators, ZIP download action, and institutional legend.
 *
 * @param {Object} props
 * @param {Array<Object>} props.courses - List of course offerings
 * @param {Object} props.filters - Active filter state { programme, batch, branch, semester }
 * @param {Function} [props.onDownloadZip] - Handler for downloading all syllabi as ZIP
 * @param {boolean} [props.isDownloadingZip=false] - Whether ZIP download is in progress
 */
const CurriculumTable = ({
  courses = [],
  filters = {},
  onDownloadZip,
  isDownloadingZip = false
}) => {
  const summaryLine = formatSummaryLine(filters);
  const hasCourses = courses && courses.length > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
      
      {/* Table Header Section: Summary Line, Count Badge & Download All Action */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
            <h2 className="text-base sm:text-lg font-bold text-institute-navy tracking-tight">
              {summaryLine}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {hasCourses
              ? `Displaying ${courses.length} approved curriculum ${courses.length === 1 ? 'course' : 'courses'}.`
              : 'No courses matching criteria.'}
          </p>
        </div>

        {/* Download All Syllabi (PDF) Action Button in Gold */}
        {hasCourses && (
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={isDownloadingZip}
            aria-label="Download All Syllabus (PDF)"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-institute-gold hover:bg-amber-600 active:bg-amber-700 text-institute-navyDark text-xs font-bold rounded shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-institute-navyDark" />
                <span>Preparing Syllabi ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-institute-navyDark" />
                <span>Download All Syllabus (PDF)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Course Table or Empty State */}
      {hasCourses ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-institute-navy text-white text-xs font-semibold tracking-wider uppercase border-b border-institute-navyDark">
                <th scope="col" className="py-3 px-4 sm:px-6 w-36">
                  Course Code
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6">
                  Course Name
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 w-40 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
              {courses.map((course, idx) => {
                const isElective = Boolean(
                  course.isElective || course.courseType === 'ELECTIVE'
                );

                return (
                  <tr
                    key={course.id || idx}
                    className="hover:bg-slate-50 transition-colors duration-100"
                  >
                    {/* Column 1: Course Code (with asterisk suffix if elective) */}
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-institute-navy whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-institute-surface border border-slate-200">
                        {isElective ? `${course.courseCode} *` : course.courseCode}
                      </span>
                    </td>

                    {/* Column 2: Course Name & Credits metadata */}
                    <td className="py-3.5 px-4 sm:px-6 font-medium">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-slate-900">
                          {course.courseName}
                        </span>
                        {typeof course.credits === 'number' && (
                          <span className="text-[11px] text-slate-500 sm:border-l sm:border-slate-300 sm:pl-2">
                            Credits: {course.credits}
                            {typeof course.lecture === 'number' && (
                              <span className="text-slate-400"> ({course.lecture}-{course.tutorial || 0}-{course.practical || 0})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 3: Actions - Gold View Syllabus Button */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/courses/${course.id}`}
                        aria-label={`View Syllabus for ${course.courseCode}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-institute-gold hover:bg-amber-600 active:bg-amber-700 text-institute-navyDark text-xs font-bold rounded shadow-xs hover:shadow-sm transition-all duration-150"
                      >
                        <span>View Syllabus</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-6 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            No Course Syllabi Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No course offerings matched the selected academic parameters. Please try adjusting your batch, branch, or semester filters.
          </p>
        </div>
      )}

      {/* Legend Below Table: * represents elective courses */}
      <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="italic">
            <strong className="font-bold text-amber-600 not-italic mr-1">*</strong>
            represents elective courses
          </span>
        </div>
        <div className="text-slate-400 text-[10px]">
          Official Academic Syllabi &bull; IIIT Bhagalpur
        </div>
      </div>

    </div>
  );
};

export default CurriculumTable;
