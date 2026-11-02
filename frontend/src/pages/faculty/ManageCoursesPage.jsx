import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Plus, Filter, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi, publicApi } from '../../services/api';
import FacultyCourseTable from '../../components/faculty/FacultyCourseTable';

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
 * ManageCoursesPage Component
 * Primary faculty course management dashboard.
 *
 * Strict Design Invariants:
 * - Top Navigation Bar: "Go to Prev Page" action button + "Logout" button with exit icon.
 * - Header: Title "Manage Courses", subtitle "View, add, edit or delete courses."
 * - Primary Action Button: "+ Add New Subject" (Navy/Gold button) linking to /faculty/courses/new.
 * - Filter Bar: Programme, Batch, Branch, Semester dropdowns.
 * - Course Listing Table: Course Code, Course Name, Actions (Update Syllabus & Delete with modal).
 * - STRICTLY NO SIDEBAR (full-width within FacultyLayout).
 * - STRICTLY NO "Download All Syllabi" button here.
 */
const ManageCoursesPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Filters State
  const [filters, setFilters] = useState({
    programme: '',
    batch: '',
    branch: '',
    semester: ''
  });

  // Dynamic filter options state
  const [filterOptions, setFilterOptions] = useState({
    programmes: DEFAULT_PROGRAMMES,
    batches: DEFAULT_BATCHES,
    branches: DEFAULT_BRANCHES,
    semesters: DEFAULT_SEMESTERS
  });

  // Data states
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  // 1. Fetch reactive filter options if programme changes
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicFilters = async () => {
      if (!filters.programme) {
        setFilterOptions({
          programmes: DEFAULT_PROGRAMMES,
          batches: DEFAULT_BATCHES,
          branches: DEFAULT_BRANCHES,
          semesters: DEFAULT_SEMESTERS
        });
        return;
      }

      try {
        const data = await publicApi.getFilters(filters.programme);
        if (isMounted && data) {
          setFilterOptions((prev) => ({
            ...prev,
            batches: data.batches?.length ? data.batches : DEFAULT_BATCHES,
            branches: data.branches?.length ? data.branches : DEFAULT_BRANCHES,
            semesters: data.semesters?.length ? data.semesters : DEFAULT_SEMESTERS
          }));
        }
      } catch (err) {
        // Fallback to static defaults
      }
    };

    fetchDynamicFilters();
    return () => {
      isMounted = false;
    };
  }, [filters.programme]);

  // 2. Fetch courses matching active filters
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const queryParams = {};
      if (filters.programme) queryParams.programme = filters.programme;
      if (filters.batch) queryParams.batch = filters.batch;
      if (filters.branch) queryParams.branch = filters.branch;
      if (filters.semester && filters.semester !== 'All Semesters') {
        queryParams.semester = filters.semester;
      }

      const data = await adminApi.getCourses(queryParams);
      if (data && data.courses) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // 3. Handle Course Deletion
  const handleDeleteCourse = async (id) => {
    try {
      setIsDeleting(true);
      await adminApi.deleteCourse(id);
      setNotification('Course offering deleted successfully.');
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete course offering.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Handle Logout Action
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/faculty/login', { replace: true });
    } catch (err) {
      navigate('/faculty/login', { replace: true });
    }
  };

  // 5. Handle Filter Reset
  const handleResetFilters = () => {
    setFilters({
      programme: '',
      batch: '',
      branch: '',
      semester: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-institute-navy px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Prev Page</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          title="Sign out of faculty portal"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* 2. Page Header & Primary Action Button */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
            <h1 className="text-xl sm:text-2xl font-bold text-institute-navy tracking-tight font-serif">
              Manage Courses
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View, add, edit or delete courses.
          </p>
        </div>

        {/* Primary Action Button: + Add New Subject */}
        <Link
          to="/faculty/courses/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-institute-navy hover:bg-institute-navyDark text-white font-bold text-xs sm:text-sm rounded-md shadow border border-institute-gold transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-institute-gold" />
          <span>+ Add New Subject</span>
        </Link>
      </div>

      {/* Notification / Alert Banners */}
      {notification && (
        <div
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-sm"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div
          className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 shadow-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Filter Bar (Programme, Batch, Branch, Semester) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-institute-gold" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-institute-navy">
              Course Offering Filters
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-institute-navy font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Programme Dropdown */}
          <div>
            <label htmlFor="filter-programme" className="block text-xs font-semibold text-slate-700 mb-1">
              Programme
            </label>
            <select
              id="filter-programme"
              value={filters.programme}
              onChange={(e) => setFilters((prev) => ({ ...prev, programme: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              <option value="">All Programmes</option>
              {filterOptions.programmes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Batch Dropdown */}
          <div>
            <label htmlFor="filter-batch" className="block text-xs font-semibold text-slate-700 mb-1">
              Batch
            </label>
            <select
              id="filter-batch"
              value={filters.batch}
              onChange={(e) => setFilters((prev) => ({ ...prev, batch: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              <option value="">All Batches</option>
              {filterOptions.batches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Branch Dropdown */}
          <div>
            <label htmlFor="filter-branch" className="block text-xs font-semibold text-slate-700 mb-1">
              Branch
            </label>
            <select
              id="filter-branch"
              value={filters.branch}
              onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              <option value="">All Branches</option>
              {filterOptions.branches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label htmlFor="filter-semester" className="block text-xs font-semibold text-slate-700 mb-1">
              Semester
            </label>
            <select
              id="filter-semester"
              value={filters.semester}
              onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              <option value="">All Semesters</option>
              {filterOptions.semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Course Listing Table */}
      <FacultyCourseTable
        courses={courses}
        onDelete={handleDeleteCourse}
        isDeleting={isDeleting}
        isLoading={isLoading}
      />

    </div>
  );
};

export default ManageCoursesPage;
