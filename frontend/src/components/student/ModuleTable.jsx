import React from 'react';
import { Clock, BookOpen } from 'lucide-react';

/**
 * ModuleTable Component
 * Detailed module-by-module course syllabus breakdown table.
 *
 * Enforces institutional specifications:
 * - Columns: Module, Topics Covered, No. of Hours.
 * - Alternating row styling with clean horizontal borders.
 * - Instructional hours summary footer.
 *
 * @param {Object} props
 * @param {Array<{moduleNumber: number, topics: string, hours: number}>} props.modules - List of parsed syllabus modules
 * @param {number} [props.totalHours] - Optional total course instructional contact hours
 */
const ModuleTable = ({ modules = [], totalHours }) => {
  const hasModules = modules && modules.length > 0;

  const calculatedTotalHours =
    typeof totalHours === 'number' && totalHours > 0
      ? totalHours
      : hasModules
      ? modules.reduce((sum, m) => sum + (Number(m.hours) || 0), 0)
      : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      
      {/* Section Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#1e40af]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
            Complete Syllabus — Module-wise
          </h3>
        </div>
        {calculatedTotalHours > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#1e40af]" />
            <span>{calculatedTotalHours} Total Hours</span>
          </div>
        )}
      </div>

      {/* Module Data Table */}
      {hasModules ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eef4fb] text-[#1e40af] text-xs font-bold tracking-wider uppercase border-b border-slate-200">
                <th scope="col" className="py-3 px-4 sm:px-6 w-32 whitespace-nowrap">
                  Module
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6">
                  Topics Covered
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 w-36 whitespace-nowrap text-right">
                  No. of Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
              {modules.map((mod, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={mod.moduleNumber || idx}
                    className={`transition-colors duration-100 ${
                      isEven ? 'bg-white' : 'bg-slate-50/60'
                    } hover:bg-amber-50/40`}
                  >
                    {/* Column 1: Module Number */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-institute-navy align-top whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded bg-institute-surface border border-slate-200 font-semibold">
                        {`Module ${mod.moduleNumber || idx + 1}`}
                      </span>
                    </td>

                    {/* Column 2: Topics Covered */}
                    <td className="py-4 px-4 sm:px-6 text-slate-700 leading-relaxed font-normal align-top">
                      <p className="whitespace-pre-line text-xs sm:text-sm">
                        {mod.topics}
                      </p>
                    </td>

                    {/* Column 3: Number of Hours */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 align-top text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{`${mod.hours} ${mod.hours === 1 ? 'Hour' : 'Hours'}`}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Hours Footer Row */}
            {calculatedTotalHours > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs text-institute-navy border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-4 sm:px-6 text-right uppercase tracking-wider">
                    Total Instructional Contact Hours:
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap text-institute-navyDark">
                    {`${calculatedTotalHours} Hours`}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500">
          No detailed module breakdown available for this course offering.
        </div>
      )}

    </div>
  );
};

export default ModuleTable;
