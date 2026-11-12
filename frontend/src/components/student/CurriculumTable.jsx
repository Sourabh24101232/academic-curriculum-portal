import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Loader2, FileText, BookOpen } from 'lucide-react';

/**
 * Format active filters into an institutional summary line:
 * e.g. "Semester 5 · Btech (CSE) · Batch 2024 – 2028"
 */
export const formatSummaryLine = (filters = {}) => {
  const parts = [];

  if (filters.semester && filters.semester.trim() !== '') {
    parts.push(filters.semester);
  }

  if (filters.programme && filters.programme.trim() !== '') {
    const progLabel = filters.programme.toLowerCase() === 'btech' ? 'Btech' : filters.programme;
    if (filters.branch && filters.branch.trim() !== '') {
      parts.push(`${progLabel} (${filters.branch})`);
    } else {
      parts.push(progLabel);
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
 */
const CurriculumTable = ({
  courses = [],
  filters = {},
  onDownloadAll,
  onDownloadZip,
  isDownloading = false,
  isDownloadingZip = false
}) => {
  const handleDownload = onDownloadAll || onDownloadZip;
  const downloading = isDownloading || isDownloadingZip;
  const summaryLine = formatSummaryLine(filters);

  // Deduplicate courses by courseCode so courses shared across multiple branches appear only once
  const uniqueCourses = React.useMemo(() => {
    if (!courses || courses.length === 0) return [];
    const map = new Map();
    for (const c of courses) {
      const code = (c.courseCode || c.id || '').trim().toUpperCase();
      if (!map.has(code)) {
        map.set(code, c);
      } else if (!map.get(code).hasOfficialPdf && c.hasOfficialPdf) {
        map.set(code, c);
      }
    }
    return Array.from(map.values());
  }, [courses]);

  const hasCourses = uniqueCourses && uniqueCourses.length > 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Title & Download All Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#002855] tracking-tight">
          {summaryLine}
        </h2>

        {hasCourses && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download All Syllabus (PDF)"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#f6ba38] hover:bg-[#e5a823] active:bg-amber-600 text-slate-900 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap self-start sm:self-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Downloading Syllabi...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-900" />
                <span>Download All Syllabus (PDF)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Course Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {hasCourses ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eef4fb] text-[#1e3a8a] text-xs font-bold tracking-wider uppercase border-b border-slate-200">
                  <th scope="col" className="py-3 px-4 sm:px-6 w-36">
                    Course Code
                  </th>
                  <th scope="col" className="py-3 px-4 sm:px-6">
                    Course Name
                  </th>
                  <th scope="col" className="py-3 px-4 sm:px-6 w-40 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-800">
                {uniqueCourses.map((course, idx) => {
                  const isElective = Boolean(
                    course.isElective || course.courseType === 'ELECTIVE'
                  );

                  return (
                    <tr
                      key={course.id || idx}
                      className="hover:bg-slate-50/70 transition-colors duration-100"
                    >
                      {/* Column 1: Course Code (with red asterisk if elective) */}
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                        <span>{course.courseCode}</span>
                        {isElective && (
                          <span className="text-red-500 font-bold ml-1" title="Elective Course">
                            *
                          </span>
                        )}
                      </td>

                      {/* Column 2: Course Name */}
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                        {course.courseName}
                      </td>

                      {/* Column 3: Actions - Gold View Syllabus Button */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <Link
                          to={`/courses/${course.id}`}
                          aria-label={`View Syllabus for ${course.courseCode}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f6ba38] hover:bg-[#e5a823] active:bg-amber-600 text-slate-900 text-xs font-bold rounded shadow-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-900" />
                          <span>View Syllabus</span>
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
      </div>

      {/* Legend Below Table: * represents elective courses */}
      <div className="text-right text-xs text-slate-600 pr-2">
        <span className="text-red-600 font-bold mr-1">*</span>
        <span>represents elective courses</span>
      </div>
    </div>
  );
};

export default CurriculumTable;
