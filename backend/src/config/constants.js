/**
 * Academic Curriculum Portal - Institutional Constants
 * Indian Institute of Information Technology Bhagalpur (IIITBH)
 */

// Supported academic degree programmes
const PROGRAMMES = Object.freeze(['BTech', 'MTech', 'PhD']);

// B.Tech Branches officially established at IIIT Bhagalpur
const BTECH_BRANCHES = Object.freeze(['CSE', 'MnC', 'ECE', 'MAE']);

// Programme to Branches mapping (Extensible: MTech and PhD can be populated later)
const PROGRAMME_BRANCHES = Object.freeze({
  BTech: BTECH_BRANCHES,
  MTech: Object.freeze([]), // Reserved for future configuration
  PhD: Object.freeze([])     // Reserved for future configuration
});

// Standard Course Offerings Types
const COURSE_TYPES = Object.freeze({
  CORE: 'CORE',
  ELECTIVE: 'ELECTIVE'
});

// Default standard semesters list (B.Tech 8 semesters)
const SEMESTERS = Object.freeze([
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
const PROGRAMME_SEMESTERS = Object.freeze({
  BTech: SEMESTERS,
  MTech: Object.freeze(['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']),
  PhD: Object.freeze(['Semester 1', 'Semester 2'])
});

const ALL_SEMESTERS_LABEL = 'All Semesters';

module.exports = {
  PROGRAMMES,
  BTECH_BRANCHES,
  PROGRAMME_BRANCHES,
  COURSE_TYPES,
  SEMESTERS,
  PROGRAMME_SEMESTERS,
  ALL_SEMESTERS_LABEL
};
