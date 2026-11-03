import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Pencil, Trash2, AlertTriangle, Loader2, FileText, CheckCircle2 } from 'lucide-react';

/**
 * FacultyCourseTable Component
 * Faculty course listing table with action links and secure delete modal.
 */
const FacultyCourseTable = ({
  courses = [],
  onDelete,
  isDeleting = false,
  isLoading = false,
  summaryLine
}) => {
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState(null);

  const handleConfirmDelete = async () => {
    if (!selectedCourseForDelete || !onDelete) return;
    try {
      await onDelete(selectedCourseForDelete.id);
      setSelectedCourseForDelete(null);
    } catch (err) {
      // Handled by parent container
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
        <p className="text-xs font-semibold text-institute-navy tracking-wide">
          Loading faculty course offerings...
        </p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-institute-navy mb-1">No Courses Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No course offerings match the active filter criteria. Adjust your filters or click "+ Add New Subject" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaryLine && (
        <h2 className="text-xl sm:text-2xl font-bold text-[#002855] tracking-tight">
          {summaryLine}
        </h2>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f6f8] text-slate-800 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th scope="col" className="py-3 px-4 sm:px-6 w-1/4">Course Code</th>
                <th scope="col" className="py-3 px-4 sm:px-6 w-1/2">Course Name</th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* 1. Course Code Column */}
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">
                        {course.courseCode}
                      </span>
                      {course.isElective && (
                        <span className="text-xs text-red-500 font-bold" title="Elective Course">
                          *
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2. Course Name Column */}
                  <td className="py-3.5 px-4 sm:px-6 text-slate-900 font-medium align-middle">
                    {course.courseName}
                  </td>

                  {/* 3. Actions Column */}
                  <td className="py-3.5 px-4 sm:px-6 text-right align-middle">
                    <div className="flex items-center justify-end gap-2">
                      {/* Gold Action Button: Update Syllabus with Pencil icon */}
                      <Link
                        to={`/faculty/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f6ba38] hover:bg-[#e5a823] active:bg-amber-600 text-slate-900 text-xs font-bold rounded shadow-xs transition-colors whitespace-nowrap"
                        title="Edit course offering syllabus & metadata"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-900" />
                        <span>Update Syllabus</span>
                      </Link>

                      {/* Delete Action Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedCourseForDelete(course)}
                        aria-label={`Delete ${course.courseCode}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete course offering"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Below Table: * represents elective courses */}
      <div className="text-right text-xs text-slate-600 pr-2">
        <span className="text-red-600 font-bold mr-1">*</span>
        <span>represents elective courses</span>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedCourseForDelete && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                  Delete Course Offering
                </h3>
                <p id="delete-dialog-description" className="text-xs text-slate-600 mt-2">
                  Are you sure you want to permanently delete course offering{' '}
                  <strong className="text-slate-900">
                    {selectedCourseForDelete.courseCode} — {selectedCourseForDelete.courseName}
                  </strong>?
                </p>
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2.5 mt-3">
                  <strong>Warning:</strong> This independent record, its parsed syllabus modules, and any attached physical PDF document will be permanently removed.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedCourseForDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow transition-colors flex items-center gap-1.5 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyCourseTable;
