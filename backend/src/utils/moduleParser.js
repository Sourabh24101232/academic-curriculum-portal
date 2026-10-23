/**
 * Strict Module-Wise Syllabus Parser Utility
 * Enforces institutional standard format: Module <N>: <Topics Covered> (<Hours>)
 * Indian Institute of Information Technology Bhagalpur
 */

const MODULE_REGEX = /^Module\s+(\d+)\s*:\s*(.+?)\s*\((\d+)\)\s*$/;

/**
 * Parses raw multiline module syllabus text into structured module objects.
 * @param {string} text - Raw multiline syllabus input
 * @returns {Object} Parsing result containing modules array and total hours or exact error details
 */
export const parseModuleSyllabus = (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      isValid: false,
      line: 1,
      error: 'Syllabus text cannot be empty. Please provide module breakdown.'
    };
  }

  // Normalize line breaks (\r\n -> \n) and split into lines
  const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Safely ignore completely blank lines only at the beginning and end
  let startIdx = 0;
  while (startIdx < rawLines.length && rawLines[startIdx].trim() === '') {
    startIdx++;
  }

  let endIdx = rawLines.length - 1;
  while (endIdx >= startIdx && rawLines[endIdx].trim() === '') {
    endIdx--;
  }

  if (startIdx > endIdx) {
    return {
      isValid: false,
      line: 1,
      error: 'Syllabus text cannot be empty. Please provide module breakdown.'
    };
  }

  const parsedModules = [];
  let expectedModuleNumber = 1;
  let totalHours = 0;

  for (let i = startIdx; i <= endIdx; i++) {
    const currentLineNumber = i + 1;
    const rawLine = rawLines[i];
    const trimmedLine = rawLine.trim();

    // Blank lines in the middle are not allowed
    if (trimmedLine === '') {
      return {
        isValid: false,
        line: currentLineNumber,
        error: `Blank line encountered on line ${currentLineNumber}. Each line must represent a consecutive module.`
      };
    }

    const match = trimmedLine.match(MODULE_REGEX);
    if (!match) {
      return {
        isValid: false,
        line: currentLineNumber,
        error: `Syntax error on line ${currentLineNumber}: '${rawLine}'. Expected format: 'Module <N>: Topics Covered (Hours)'`
      };
    }

    const moduleNumber = parseInt(match[1], 10);
    const topics = match[2].trim();
    const hours = parseInt(match[3], 10);

    if (!topics) {
      return {
        isValid: false,
        line: currentLineNumber,
        error: `Missing topics list on line ${currentLineNumber}: Module must specify topics covered.`
      };
    }

    // Enforce sequential ordering (1, 2, 3...)
    if (moduleNumber !== expectedModuleNumber) {
      return {
        isValid: false,
        line: currentLineNumber,
        error: `Sequential module ordering error on line ${currentLineNumber}: Expected 'Module ${expectedModuleNumber}', but found 'Module ${moduleNumber}'.`
      };
    }

    // Enforce positive integer hours
    if (isNaN(hours) || hours <= 0) {
      return {
        isValid: false,
        line: currentLineNumber,
        error: `Invalid hours on line ${currentLineNumber}: Hours must be a positive integer greater than 0.`
      };
    }

    parsedModules.push({
      moduleNumber,
      title: `Module ${moduleNumber}`,
      topics,
      hours
    });

    totalHours += hours;
    expectedModuleNumber++;
  }

  return {
    isValid: true,
    modules: parsedModules,
    totalHours
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
