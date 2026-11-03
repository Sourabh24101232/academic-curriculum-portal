import { useState, useEffect, useCallback } from 'react';

export const FILTER_STORAGE_KEY = 'iiitbh_student_filters';

export const DEFAULT_FILTERS = Object.freeze({
  programme: 'BTech',
  batch: '2024 - 2028',
  branch: 'CSE',
  semester: 'Semester 5'
});

/**
 * Helper to safely read from localStorage
 */
const getSavedFilters = (initialOverrides = {}) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { filters: { ...DEFAULT_FILTERS, ...initialOverrides }, hasSaved: false };
  }

  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) {
      return { filters: { ...DEFAULT_FILTERS, ...initialOverrides }, hasSaved: false };
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const merged = {
        programme: parsed.programme || '',
        batch: parsed.batch || '',
        branch: parsed.branch || '',
        semester: parsed.semester || ''
      };

      const hasSaved = Boolean(
        merged.programme || merged.batch || merged.branch || merged.semester
      );

      return { filters: merged, hasSaved };
    }
  } catch (err) {
    console.warn('[useFilterHistory] Failed to parse saved filters from localStorage:', err);
  }

  return { filters: { ...DEFAULT_FILTERS, ...initialOverrides }, hasSaved: false };
};

/**
 * useFilterHistory Hook
 * Manages reactive student curriculum filter selections with browser localStorage persistence.
 *
 * @param {Object} [initialOverrides={}] - Optional initial default overrides
 * @returns {{
 *   filters: { programme: string, batch: string, branch: string, semester: string },
 *   setFilters: Function,
 *   clearFilters: Function,
 *   hasSavedHistory: boolean
 * }}
 */
export const useFilterHistory = (initialOverrides = {}) => {
  const [initialData] = useState(() => getSavedFilters(initialOverrides));
  const [filters, setFiltersState] = useState(initialData.filters);
  const [hasSavedHistory, setHasSavedHistory] = useState(initialData.hasSaved);

  // Synchronize filter changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const hasContent = Boolean(
      filters.programme || filters.batch || filters.branch || filters.semester
    );

    try {
      if (hasContent) {
        window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
        setHasSavedHistory(true);
      } else {
        window.localStorage.removeItem(FILTER_STORAGE_KEY);
        setHasSavedHistory(false);
      }
    } catch (err) {
      console.warn('[useFilterHistory] Failed to persist filters to localStorage:', err);
    }
  }, [filters]);

  /**
   * Update active filters (supports new object or functional updater)
   */
  const setFilters = useCallback((updater) => {
    setFiltersState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return {
        programme: next?.programme || '',
        batch: next?.batch || '',
        branch: next?.branch || '',
        semester: next?.semester || ''
      };
    });
  }, []);

  /**
   * Reset active filters to empty defaults and remove from localStorage
   */
  const clearFilters = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(FILTER_STORAGE_KEY);
      } catch (err) {
        console.warn('[useFilterHistory] Failed to remove filters from localStorage:', err);
      }
    }

    setFiltersState({ ...DEFAULT_FILTERS });
    setHasSavedHistory(false);
  }, []);

  return {
    filters,
    setFilters,
    clearFilters,
    hasSavedHistory
  };
};

export default useFilterHistory;
