import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from '../../components/student/FilterBar';
import CurriculumTable from '../../components/student/CurriculumTable';
import { useFilterHistory } from '../../hooks/useFilterHistory';
import { publicApi, apiClient } from '../../services/api';
import { GraduationCap, Loader2, AlertCircle, Info, Sparkles, Home, ChevronRight } from 'lucide-react';

/**
 * CurriculumPage Component
 * Student Academic Curriculum & Syllabus Explorer.
 *
 * Enforces institutional specifications:
 * - First-Time Visitor Gate: When no programme is selected, prompts the visitor and hides the table.
 * - Reactive Filtering: Dropdown controls for Programme, Batch, Branch, Semester (Strictly NO search bar).
 * - Automatic persistence via `useFilterHistory`.
 * - Course offering table with elective indicators and ZIP archive download.
 */
const CurriculumPage = () => {
  const { filters, setFilters, hasSavedHistory } = useFilterHistory();

  // Dynamic filter dropdown options
  const [filterOptions, setFilterOptions] = useState({
    programmes: ['BTech', 'MTech', 'PhD'],
    batches: [],
    branches: [],
    semesters: []
  });

  // Data fetching states
  const [courses, setCourses] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadNotice, setDownloadNotice] = useState('');

  // 1. Fetch dynamic options (batches, branches, semesters) when programme changes
  useEffect(() => {
    if (!filters.programme) {
      setFilterOptions((prev) => ({
        ...prev,
        batches: [],
        branches: [],
        semesters: []
      }));
      return;
    }

    let isMounted = true;
    const fetchOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const data = await publicApi.getFilters(filters.programme);
        if (isMounted && data) {
          setFilterOptions({
            programmes: ['BTech', 'MTech', 'PhD'],
            batches: data.batches || [],
            branches: data.branches || [],
            semesters: data.semesters || []
          });
        }
      } catch (err) {
        console.warn('[CurriculumPage] Could not load dynamic filter options:', err);
      } finally {
        if (isMounted) {
          setIsLoadingFilters(false);
        }
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [filters.programme]);

  // 2. Fetch course offerings whenever active filters change
  const fetchCourses = useCallback(async () => {
    if (!filters.programme) {
      setCourses([]);
      return;
    }

    setIsLoadingCourses(true);
    setErrorMessage('');
    try {
      const data = await publicApi.getCourses(filters);
      setCourses(data?.courses || []);
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to load curriculum course offerings. Please try again.'
      );
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // 3. Handle filter selection changes
  const handleFilterChange = (newFilters) => {
    // If programme changes, reset secondary filters if needed
    if (newFilters.programme !== filters.programme) {
      setFilters({
        programme: newFilters.programme,
        batch: '',
        branch: '',
        semester: ''
      });
    } else {
      setFilters(newFilters);
    }
  };

  // 4. Handle ZIP Archive Download Action
  const handleDownloadZip = async () => {
    if (!filters.programme) return;

    setIsDownloadingZip(true);
    setDownloadNotice('');
    try {
      const response = await apiClient.get('/courses/download-all', {
        params: filters,
        responseType: 'blob'
      });

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers?.['content-disposition'];
      let filename = `IIITBH_Syllabi_${filters.programme}.zip`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // Create blob download URL and trigger click
      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadNotice('Official syllabi archive downloaded successfully.');
      setTimeout(() => setDownloadNotice(''), 6000);
    } catch (err) {
      setDownloadNotice(
        'Unable to download syllabi archive. No physical PDF documents were found for this selection.'
      );
      setTimeout(() => setDownloadNotice(''), 8000);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const isGateActive = !filters.programme;

  return (
    <div className="space-y-4">
      
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 pb-1">
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
          <li className="font-semibold text-slate-900">Curriculum</li>
        </ol>
      </nav>

      {/* Reactive Filter Bar (Strictly NO search bar) */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        options={filterOptions}
        isLoading={isLoadingFilters}
      />

      {/* Download Alert / Notice Notification */}
      {downloadNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Error State Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchCourses}
            className="text-red-700 font-semibold underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* FIRST-TIME VISITOR GATE: Prompts user and hides table if no programme is selected */}
      {isGateActive ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-institute-gold flex items-center justify-center mx-auto mb-5 text-institute-gold shadow-xs">
            <GraduationCap className="w-8 h-8" />
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-institute-navy mb-2">
            Welcome to IIIT Bhagalpur Curriculum Portal
          </h3>

          <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4">
            Please select a programme (BTech, MTech, or PhD) to view curriculum and course syllabi.
          </p>

          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-normal">
            Use the dropdown controls above to choose your degree programme, academic batch, department branch, and semester.
          </p>

          {/* Quick Start Pills for Degree Programmes */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {['BTech', 'MTech', 'PhD'].map((prog) => (
              <button
                key={prog}
                type="button"
                onClick={() => handleFilterChange({ ...filters, programme: prog })}
                className="px-4 py-2 bg-institute-surface hover:bg-amber-50 border border-slate-300 hover:border-institute-gold text-institute-navy text-xs font-bold rounded shadow-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-institute-gold" />
                <span>{`Explore ${prog} Curriculum`}</span>
              </button>
            ))}
          </div>
        </div>
      ) : isLoadingCourses ? (
        /* Loading Courses Spinner State */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
          <p className="text-xs font-semibold text-institute-navy">
            Loading approved courses and module syllabi...
          </p>
        </div>
      ) : (
        /* Render Curriculum Table when Programme is Selected */
        <CurriculumTable
          courses={courses}
          filters={filters}
          onDownloadZip={handleDownloadZip}
          isDownloadingZip={isDownloadingZip}
        />
      )}

    </div>
  );
};

export default CurriculumPage;
