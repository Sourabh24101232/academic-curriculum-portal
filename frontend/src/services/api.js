import axios from 'axios';

// Environment Base URL resolution (Vite or fallback)
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

// Centralized Axios Instance with institutional defaults & session cookie credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network or server error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

/**
 * Public Student Academic APIs
 */
export const publicApi = {
  // Get all degree programmes: ['BTech', 'MTech', 'PhD']
  getProgrammes: async () => {
    const response = await apiClient.get('/programmes');
    return response.data;
  },

  // Get reactive filter options for a programme (batches, branches, semesters)
  getFilters: async (programme) => {
    const response = await apiClient.get('/filters', {
      params: { programme }
    });
    return response.data;
  },

  // Get public courses matching query filters
  getCourses: async (params = {}) => {
    const response = await apiClient.get('/courses', { params });
    return response.data;
  },

  // Get single course offering details by ID with parsed modules and bibliography
  getCourseDetails: async (id) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  // Generate direct streaming URL for single course PDF
  getSyllabusPdfUrl: (id) => {
    return `${apiClient.defaults.baseURL}/courses/${id}/pdf`;
  },

  // Generate direct download URL for filtered syllabi ZIP archive
  downloadAllZipUrl: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    return `${apiClient.defaults.baseURL}/courses/download-all${queryString ? `?${queryString}` : ''}`;
  }
};

/**
 * Faculty Admin Authentication APIs
 */
export const authApi = {
  // Authenticate admin with email, password, and rememberMe flag
  login: async ({ email, password, rememberMe = false }) => {
    const response = await apiClient.post('/admin/login', {
      email,
      password,
      rememberMe
    });
    return response.data;
  },

  // Destroy session and clear server cookie
  logout: async () => {
    const response = await apiClient.post('/admin/logout');
    return response.data;
  },

  // Check current authenticated session profile
  getMe: async () => {
    const response = await apiClient.get('/admin/me');
    return response.data;
  }
};

/**
 * Faculty Admin Course & Excel Management APIs
 */
export const adminApi = {
  // Get faculty course dashboard listing with filters
  getCourses: async (params = {}) => {
    const response = await apiClient.get('/admin/courses', { params });
    return response.data;
  },

  // Get single course offering unparsed for edit form
  getCourse: async (id) => {
    const response = await apiClient.get(`/admin/courses/${id}`);
    return response.data;
  },

  // Create new independent course offering
  createCourse: async (data) => {
    const response = await apiClient.post('/admin/courses', data);
    return response.data;
  },

  // Update existing course offering
  updateCourse: async (id, data) => {
    const response = await apiClient.put(`/admin/courses/${id}`, data);
    return response.data;
  },

  // Delete course offering and attached document
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Upload or replace official syllabus PDF
  uploadPdf: async (id, formData) => {
    const response = await apiClient.post(`/admin/courses/${id}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get direct download URL for official Excel import template
  getTemplateUrl: () => {
    return `${apiClient.defaults.baseURL}/admin/courses/template`;
  },

  // Bulk upload Excel dry-run preview
  bulkPreview: async (formData) => {
    const response = await apiClient.post('/admin/courses/bulk-preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Bulk import transactional commit
  bulkConfirm: async (payload) => {
    const response = await apiClient.post('/admin/courses/bulk-confirm', payload);
    return response.data;
  }
};

/**
 * Diagnostic Health Check Helper
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export { apiClient, API_BASE_URL };
export default apiClient;
