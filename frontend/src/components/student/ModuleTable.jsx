import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Splits raw syllabus text into distinct module blocks,
 * ensuring clean separation even if the teacher did not add blank lines between them.
 */
export const splitSyllabusIntoModules = (syllabusText, modules = []) => {
  if (syllabusText && typeof syllabusText === 'string' && syllabusText.trim()) {
    const normalized = syllabusText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    // Split on boundaries starting with 'Module <number/roman>'
    const regex = /(?:^|\n)(?=\s*Module\s+(?:\d+|[IVXLCDM]+)\b)/gi;
    const parts = normalized.split(regex).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts;
    }
    // If no 'Module' keyword detected, split by double newlines or single newlines
    const byBlank = normalized.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
    if (byBlank.length > 0) {
      return byBlank;
    }
    return [normalized];
  }

  // Fallback if syllabusText is not provided, reconstruct from modules prop
  if (Array.isArray(modules) && modules.length > 0) {
    return modules.map((m, idx) => {
      const heading = m.title || `Module ${m.moduleNumber || idx + 1}`;
      const body = m.topics || '';
      if (!body) return heading;
      if (body.startsWith(heading)) return body;
      return `${heading}: ${body}`;
    });
  }

  return [];
};

/**
 * Separates module heading (for bolding) from module description text,
 * matching institutional syllabus formatting.
 */
export const parseModuleItem = (rawText) => {
  if (!rawText) return { title: '', body: '' };

  // Case 1: "Module 01: Introduction to Computing: Historical perspective..."
  const matchTwoColons = rawText.match(/^(Module\s+[0-9A-Za-z]+[\s:-]+[^:\n]+:)\s*([\s\S]*)$/i);
  if (matchTwoColons) {
    return {
      title: matchTwoColons[1].trim(),
      body: matchTwoColons[2].trim()
    };
  }

  // Case 2: "Module 1: Linear Data structures..." or "Module 1 - Description..."
  const matchOneColon = rawText.match(/^(Module\s+[0-9A-Za-z]+[\s:-]*)\s*([\s\S]*)$/i);
  if (matchOneColon) {
    return {
      title: matchOneColon[1].trim(),
      body: matchOneColon[2].trim()
    };
  }

  return {
    title: '',
    body: rawText.trim()
  };
};

/**
 * ModuleTable Component
 * Displays complete course syllabus module-by-module without a 3-column table.
 * Preserves authentic text with a 1-line space between each module and its description.
 *
 * @param {Object} props
 * @param {Array} [props.modules] - Structured module array fallback
 * @param {string} [props.syllabusText] - Raw multiline syllabus text
 */
const ModuleTable = ({ modules = [], syllabusText }) => {
  const rawBlocks = splitSyllabusIntoModules(syllabusText, modules);
  const hasModules = rawBlocks && rawBlocks.length > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      
      {/* Section Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#1e40af]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e40af]">
            Complete Syllabus — Module-wise
          </h2>
        </div>
      </div>

      {/* Module Content Area - No 3 columns, clean spacing between modules */}
      {hasModules ? (
        <div className="p-5 sm:p-6 space-y-4">
          {rawBlocks.map((block, idx) => {
            const { title, body } = parseModuleItem(block);
            return (
              <div key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {title ? (
                  <>
                    <strong className="font-bold text-slate-900 mr-1.5">{title}</strong>
                    <span className="text-slate-700">{body}</span>
                  </>
                ) : (
                  <span className="text-slate-700">{body}</span>
                )}
              </div>
            );
          })}
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
