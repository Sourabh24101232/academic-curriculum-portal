/**
 * Single-Box Syllabus Parser Utility
 * Parses raw multiline syllabus text written in one box into clean syllabus representation
 * and extracts individual module sections when formatted with 'Module <N>:' headers.
 * Indian Institute of Information Technology Bhagalpur
 */

/**
 * Parses raw multiline syllabus text entered in a single box.
 * Supports modules separated by blank lines and flexible headings without requiring per-module hours.
 * 
 * @param {string} text - Raw multiline syllabus input
 * @returns {Object} Parsing result containing valid status, syllabusText, modules array, and optional totalHours
 */
export const parseModuleSyllabus = (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      isValid: false,
      line: 1,
      error: 'Syllabus text cannot be empty. Please provide course syllabus.'
    };
  }

  // Normalize line breaks (\r\n -> \n) and trim leading/trailing whitespace
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (normalizedText === '') {
    return {
      isValid: false,
      line: 1,
      error: 'Syllabus text cannot be empty. Please provide course syllabus.'
    };
  }

  // Split into module blocks separated by one or more blank lines
  const blocks = normalizedText.split(/\n\s*\n+/);
  const parsedModules = [];
  let totalHours = 0;
  let hasAnyHours = false;
  let currentModuleNumber = 1;

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Matches 'Module 01: Heading' or 'Module 1: Heading\nTopics...'
    const match = trimmedBlock.match(/^Module\s+(\d+)[:\s-]*([^\n]*)(?:\n([\s\S]*))?$/i);
    if (match) {
      const moduleNum = parseInt(match[1], 10);
      let heading = match[2] ? match[2].trim() : '';
      const body = match[3] ? match[3].trim() : '';

      // Check if heading or body has optional hours in parentheses, e.g. (6)
      let hours = null;
      const hoursMatch = heading.match(/\((\d+)\)\s*$/);
      if (hoursMatch) {
        hours = parseInt(hoursMatch[1], 10);
        heading = heading.replace(/\((\d+)\)\s*$/, '').trim();
        hasAnyHours = true;
        totalHours += hours;
      }

      parsedModules.push({
        moduleNumber: moduleNum,
        title: `Module ${moduleNum}${heading ? `: ${heading}` : ''}`,
        topics: body || heading,
        hours
      });
      currentModuleNumber = moduleNum + 1;
    } else {
      // Freeform block or non-prefixed module
      parsedModules.push({
        moduleNumber: currentModuleNumber,
        title: `Module ${currentModuleNumber}`,
        topics: trimmedBlock,
        hours: null
      });
      currentModuleNumber++;
    }
  }

  return {
    isValid: true,
    syllabusText: normalizedText,
    modules: parsedModules,
    totalHours: hasAnyHours ? totalHours : null
  };
};

/**
 * Lightweight validation helper returning boolean and error if invalid.
 * @param {string} text - Raw multiline syllabus input
 * @returns {Object} { isValid: boolean, error?: string, line?: number }
 */
export const validateModuleSyllabus = (text) => {
  const result = parseModuleSyllabus(text);
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error,
      line: result.line
    };
  }
  return { isValid: true };
};

export default parseModuleSyllabus;
