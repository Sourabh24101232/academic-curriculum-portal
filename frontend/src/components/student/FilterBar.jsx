import React from 'react';
import { RotateCcw, Filter } from 'lucide-react';

/**
 * Institutional Default Academic Constants
 */
const DEFAULT_PROGRAMMES = ['BTech', 'MTech', 'PhD'];
const DEFAULT_BATCHES = [
  '2026 - 2030',
  '2025 - 2029',
  '2024 - 2028',
  '2023 - 2027'
];
const DEFAULT_BRANCHES = ['CSE', 'MnC', 'ECE', 'MAE'];
const DEFAULT_SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  'All Semesters'
];

/**
 * FilterBar Component
 * Student Reactive Academic Filter Bar.
 *
 * Strict Design Invariants:
 * - STRICTLY NO SEARCH BAR: Filtering is driven strictly by structured academic dropdowns.
 * - Reactive Dropdowns: Programme, Batch, Branch, and Semester.
 * - Reset Action: Clears all active filters back to initial empty state.
 * - Triggers `onFilterChange({ programme, batch, branch, semester })` on every user modification.
 *
 * @param {Object} props
 * @param {Object} [props.filters] - Current active filter state { programme, batch, branch, semester }
 * @param {Function} props.onFilterChange - Callback invoked when any filter changes
 * @param {Object} [props.options] - Optional custom options override { programmes, batches, branches, semesters }
 * @param {boolean} [props.isLoading=false] - Whether options/courses are loading
 */
const FilterBar = ({
  filters = { programme: '', batch: '', branch: '', semester: '' },
  onFilterChange,
  options = {},
  isLoading = false
}) => {
  const programmes = options.programmes || DEFAULT_PROGRAMMES;
  const batches = options.batches || DEFAULT_BATCHES;
  const branches = options.branches || DEFAULT_BRANCHES;
  const semesters = options.semesters || DEFAULT_SEMESTERS;

  const currentFilters = {
    programme: filters?.programme || '',
    batch: filters?.batch || '',
    branch: filters?.branch || '',
    semester: filters?.semester || ''
  };

  const handleSelectChange = (field, value) => {
    const updated = {
      ...currentFilters,
      [field]: value
    };

    if (onFilterChange) {
      onFilterChange(updated);
    }
  };

  const handleReset = () => {
    const cleared = {
      programme: '',
      batch: '',
      branch: '',
      semester: ''
    };

    if (onFilterChange) {
      onFilterChange(cleared);
    }
  };

  const hasActiveFilters = Boolean(
    currentFilters.programme ||
    currentFilters.batch ||
    currentFilters.branch ||
    currentFilters.semester
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
      {/* Top Bar: Title & Filter Counter */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-institute-gold" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-institute-navy">
            Academic Curriculum Filters
          </h3>
        </div>
        <div className="text-[11px] text-slate-500">
          {hasActiveFilters ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Active Filters Applied
            </span>
          ) : (
            <span>Select options to view curriculum</span>
          )}
        </div>
      </div>

      {/* 5-Column Grid: 4 Dropdowns + 1 Reset Action Button (STRICTLY NO SEARCH BAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        {/* 1. Course (Programme) Dropdown */}
        <div>
          <label
            htmlFor="filter-programme"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5"
          >
            Course
          </label>
          <select
            id="filter-programme"
            value={currentFilters.programme}
            onChange={(e) => handleSelectChange('programme', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-[#f6ba38] transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">Select Course</option>
            {programmes.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Batch Dropdown */}
        <div>
          <label
            htmlFor="filter-batch"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5"
          >
            Batch
          </label>
          <select
            id="filter-batch"
            value={currentFilters.batch}
            onChange={(e) => handleSelectChange('batch', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-institute-navy focus:ring-1 focus:ring-institute-gold transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Branch Dropdown */}
        <div>
          <label
            htmlFor="filter-branch"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5"
          >
            Branch
          </label>
          <select
            id="filter-branch"
            value={currentFilters.branch}
            onChange={(e) => handleSelectChange('branch', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-institute-navy focus:ring-1 focus:ring-institute-gold transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">Select Branch</option>
            {branches.map((br) => (
              <option key={br} value={br}>
                {br}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Semester Dropdown */}
        <div>
          <label
            htmlFor="filter-semester"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5"
          >
            Semester
          </label>
          <select
            id="filter-semester"
            value={currentFilters.semester}
            onChange={(e) => handleSelectChange('semester', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-institute-navy focus:ring-1 focus:ring-institute-gold transition-colors disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Reset Filters Action Button */}
        <div>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters || isLoading}
            aria-label="Reset Filters"
            className={`w-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded px-3 py-2 border transition-all duration-150 ${
              hasActiveFilters && !isLoading
                ? 'bg-slate-100 text-institute-navy border-slate-300 hover:bg-slate-200 hover:border-slate-400 active:bg-slate-300 cursor-pointer shadow-sm'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-institute-navy' : 'text-slate-400'}`} />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
