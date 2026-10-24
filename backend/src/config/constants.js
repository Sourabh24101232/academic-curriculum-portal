/**
 * Academic Curriculum Portal - Institutional Constants
 * Indian Institute of Information Technology Bhagalpur (IIITBH)
 */

// Supported academic degree programmes
export const PROGRAMMES = Object.freeze(['BTech', 'MTech', 'PhD']);

// B.Tech Batches officially established at IIIT Bhagalpur
export const BTECH_BATCHES = Object.freeze([
  '2026 - 2030',
  '2025 - 2029',
  '2024 - 2028',
  '2023 - 2027'
]);

// Programme to Batches mapping (Extensible: MTech and PhD can be populated later)
export const PROGRAMME_BATCHES = Object.freeze({
  BTech: BTECH_BATCHES,
  MTech: Object.freeze([]), // Reserved for future configuration
  PhD: Object.freeze([])     // Reserved for future configuration
});

// B.Tech Branches officially established at IIIT Bhagalpur
export const BTECH_BRANCHES = Object.freeze(['CSE', 'MnC', 'ECE', 'MAE']);

// Programme to Branches mapping (Extensible: MTech and PhD can be populated later)
export const PROGRAMME_BRANCHES = Object.freeze({
  BTech: BTECH_BRANCHES,
  MTech: Object.freeze([]), // Reserved for future configuration
  PhD: Object.freeze([])     // Reserved for future configuration
});

// Standard Course Offerings Types
export const COURSE_TYPES = Object.freeze({
  CORE: 'CORE',
  ELECTIVE: 'ELECTIVE'
});

// Default standard semesters list (B.Tech 8 semesters)
export const SEMESTERS = Object.freeze([
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
]);

// Programme-specific semester mappings (Extensible)
export const PROGRAMME_SEMESTERS = Object.freeze({
  BTech: SEMESTERS,
  MTech: Object.freeze(['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']),
  PhD: Object.freeze(['Semester 1', 'Semester 2'])
});

export const ALL_SEMESTERS_LABEL = 'All Semesters';

export default {
  PROGRAMMES,
  BTECH_BATCHES,
  PROGRAMME_BATCHES,
  BTECH_BRANCHES,
  PROGRAMME_BRANCHES,
  COURSE_TYPES,
  SEMESTERS,
  PROGRAMME_SEMESTERS,
  ALL_SEMESTERS_LABEL
};
