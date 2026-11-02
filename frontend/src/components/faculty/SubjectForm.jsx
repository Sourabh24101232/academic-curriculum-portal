import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Loader2,
  Info,
  BookOpen,
  FileText
} from 'lucide-react';

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
  'Semester 8'
];

/**
 * Live Client-Side Syllabus Syntax Validator
 * Verifies sequential Module N syntax and positive integer hours in parentheses:
 * Format: Module <N>: <Heading/Topics> (<Hours>)
 */
export const validateSyllabusClient = (text) => {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      message: 'Syllabus text cannot be empty. Please enter module details.'
    };
  }

  const lines = text.split('\n');
  let moduleCount = 0;
  let expectedModuleNum = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    // Check if line indicates a module definition
    if (/^Module\s+/i.test(trimmedLine)) {
      const match = trimmedLine.match(/^Module\s+(\d+)[:\s-]*(.*)$/i);
      if (!match) {
        return {
          isValid: false,
          line: i + 1,
          message: `Line ${i + 1}: Malformed module header. Use format "Module <N>: <Topics> (<Hours>)"`
        };
      }

      const parsedNum = parseInt(match[1], 10);
      if (parsedNum !== expectedModuleNum) {
        return {
          isValid: false,
          line: i + 1,
          message: `Line ${i + 1}: Module out of order. Expected Module ${expectedModuleNum}, found Module ${parsedNum}.`
        };
      }

      // Check optional hours syntax if present
      const remainder = match[2].trim();
      const hoursMatch = remainder.match(/\(([^)]+)\)\s*$/);
      if (hoursMatch) {
        const hoursVal = hoursMatch[1].trim();
        if (!/^\d+$/.test(hoursVal) || parseInt(hoursVal, 10) <= 0) {
          return {
            isValid: false,
            line: i + 1,
            message: `Line ${i + 1}: Hours in parentheses must be a positive integer, e.g. (8).`
          };
        }
      }

      expectedModuleNum++;
      moduleCount++;
    }
  }

  return {
    isValid: true,
    moduleCount: moduleCount > 0 ? moduleCount : 1,
    message: moduleCount > 0
      ? `Valid module syntax: ${moduleCount} sequential ${moduleCount === 1 ? 'module' : 'modules'} detected.`
      : 'Syllabus text entered.'
  };
};

/**
 * SubjectForm Component
 * Shared course creation and syllabus editing form.
 *
 * Strict Invariants:
 * - Integer-only inputs for Lecture, Tutorial, Practical, Credits (rejects decimals & negatives).
 * - Live client-side regex checking highlighting module syntax errors in real-time.
 * - Outdated-PDF warning banner prominently displayed in amber/gold.
 */
const SubjectForm = ({
  initialData = {},
  isEdit = false,
  onSubmit,
  isSubmitting = false,
  outdatedPdfWarning = false
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseCode: initialData.courseCode || '',
    courseName: initialData.courseName || '',
    programme: initialData.programme || 'BTech',
    batch: initialData.batch || '2024 - 2028',
    branch: initialData.branch || 'CSE',
    semester: initialData.semester || 'Semester 1',
    courseType: initialData.courseType || 'CORE',
    lecture: initialData.lecture !== undefined ? String(initialData.lecture) : '3',
    tutorial: initialData.tutorial !== undefined ? String(initialData.tutorial) : '0',
    practical: initialData.practical !== undefined ? String(initialData.practical) : '0',
    credits: initialData.credits !== undefined ? String(initialData.credits) : '3',
    courseObjectives: initialData.courseObjectives || '',
    moduleWiseSyllabusText: initialData.moduleWiseSyllabusText || '',
    referenceBooksText: initialData.referenceBooksText || ''
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState(initialData.document?.originalFilename || '');
  const [syllabusValidation, setSyllabusValidation] = useState({ isValid: true, message: '' });
  const [formError, setFormError] = useState('');

  // Hydrate formData if initialData changes (for Edit mode)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        courseCode: initialData.courseCode || '',
        courseName: initialData.courseName || '',
        programme: initialData.programme || 'BTech',
        batch: initialData.batch || '2024 - 2028',
        branch: initialData.branch || 'CSE',
        semester: initialData.semester || 'Semester 1',
        courseType: initialData.courseType || 'CORE',
        lecture: initialData.lecture !== undefined ? String(initialData.lecture) : '3',
        tutorial: initialData.tutorial !== undefined ? String(initialData.tutorial) : '0',
        practical: initialData.practical !== undefined ? String(initialData.practical) : '0',
        credits: initialData.credits !== undefined ? String(initialData.credits) : '3',
        courseObjectives: initialData.courseObjectives || '',
        moduleWiseSyllabusText: initialData.moduleWiseSyllabusText || '',
        referenceBooksText: initialData.referenceBooksText || ''
      });
      if (initialData.document?.originalFilename) {
        setPdfFileName(initialData.document.originalFilename);
      }
    }
  }, [initialData]);

  // Real-time syllabus syntax validator effect
  useEffect(() => {
    if (formData.moduleWiseSyllabusText) {
      const result = validateSyllabusClient(formData.moduleWiseSyllabusText);
      setSyllabusValidation(result);
    } else {
      setSyllabusValidation({ isValid: true, message: '' });
    }
  }, [formData.moduleWiseSyllabusText]);

  // Strict integer-only change handler for L / T / P / C
  const handleIntegerChange = (field, rawValue) => {
    // Strip any character that is not a numeric digit 0-9 (rejects '.', '-', etc.)
    const sanitized = rawValue.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      [field]: sanitized
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setFormError('Only authentic PDF documents (.pdf) are accepted.');
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Mandatory metadata check
    if (!formData.courseCode.trim() || !formData.courseName.trim()) {
      setFormError('Course Code and Course Name are mandatory.');
      return;
    }

    // 2. Strict Integer check
    const intFields = ['lecture', 'tutorial', 'practical', 'credits'];
    for (const f of intFields) {
      if (formData[f] === '' || isNaN(Number(formData[f])) || Number(formData[f]) < 0) {
        setFormError(`Field '${f}' must be a valid non-negative whole integer.`);
        return;
      }
    }

    // 3. Syllabus validation check
    const validation = validateSyllabusClient(formData.moduleWiseSyllabusText);
    if (!validation.isValid) {
      setFormError(validation.message);
      return;
    }

    if (!formData.courseObjectives.trim()) {
      setFormError('Course Objectives cannot be empty.');
      return;
    }

    if (!formData.referenceBooksText.trim()) {
      setFormError('Reference Books cannot be empty.');
      return;
    }

    try {
      const payload = {
        ...formData,
        courseCode: formData.courseCode.trim().toUpperCase(),
        courseName: formData.courseName.trim(),
        lecture: parseInt(formData.lecture, 10),
        tutorial: parseInt(formData.tutorial, 10),
        practical: parseInt(formData.practical, 10),
        credits: parseInt(formData.credits, 10),
        courseObjectives: formData.courseObjectives.trim(),
        moduleWiseSyllabusText: formData.moduleWiseSyllabusText.trim(),
        referenceBooksText: formData.referenceBooksText.trim()
      };

      await onSubmit(payload, pdfFile);
    } catch (err) {
      setFormError(err.message || 'Failed to save course offering.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      
      {/* Outdated-PDF Warning Banner (Institutional Amber/Gold alert) */}
      {outdatedPdfWarning && !pdfFile && (
        <div
          className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-lg text-xs sm:text-sm flex items-start gap-3 shadow-sm"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold tracking-tight">Official PDF Outdated Warning</p>
            <p className="mt-0.5">
              The syllabus has been updated, but the official PDF may be outdated. Please upload the revised PDF.
            </p>
          </div>
        </div>
      )}

      {/* Replacement PDF Selected Confirmation Notice */}
      {outdatedPdfWarning && pdfFile && (
        <div
          className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-sm"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Replacement PDF selected: <strong>{pdfFile.name}</strong>. Saving will synchronize the official document.</span>
        </div>
      )}

      {/* Form Error Banner */}
      {formError && (
        <div
          className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 shadow-sm"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* 1. Core Metadata Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-institute-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-institute-navy">
            Course Identification &amp; Academic Hierarchy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Course Code */}
          <div>
            <label htmlFor="course-code" className="block text-xs font-semibold text-slate-700 mb-1">
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              id="course-code"
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
              placeholder="e.g. CS305"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="course-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
              placeholder="e.g. Database Management Systems"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Programme */}
          <div>
            <label htmlFor="course-programme" className="block text-xs font-semibold text-slate-700 mb-1">
              Programme <span className="text-red-500">*</span>
            </label>
            <select
              id="course-programme"
              value={formData.programme}
              onChange={(e) => setFormData((prev) => ({ ...prev, programme: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              {DEFAULT_PROGRAMMES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label htmlFor="course-batch" className="block text-xs font-semibold text-slate-700 mb-1">
              Batch <span className="text-red-500">*</span>
            </label>
            <select
              id="course-batch"
              value={formData.batch}
              onChange={(e) => setFormData((prev) => ({ ...prev, batch: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              {DEFAULT_BATCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label htmlFor="course-branch" className="block text-xs font-semibold text-slate-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="course-branch"
              value={formData.branch}
              onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              {DEFAULT_BRANCHES.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="course-semester" className="block text-xs font-semibold text-slate-700 mb-1">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              id="course-semester"
              value={formData.semester}
              onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              {DEFAULT_SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Course Type */}
          <div>
            <label htmlFor="course-type" className="block text-xs font-semibold text-slate-700 mb-1">
              Course Type <span className="text-red-500">*</span>
            </label>
            <select
              id="course-type"
              value={formData.courseType}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseType: e.target.value }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            >
              <option value="CORE">CORE</option>
              <option value="ELECTIVE">ELECTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Strict Integer Credit Structure (L / T / P / C) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-institute-navy">
            Credit Structure (Non-Negative Whole Integers Only)
          </h2>
          <span className="text-xs text-slate-500">Decimals &amp; negative numbers strictly rejected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Lecture (L) */}
          <div>
            <label htmlFor="credit-lecture" className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture (L)
            </label>
            <input
              id="credit-lecture"
              type="text"
              inputMode="numeric"
              required
              value={formData.lecture}
              onChange={(e) => handleIntegerChange('lecture', e.target.value)}
              placeholder="3"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 font-mono font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>

          {/* Tutorial (T) */}
          <div>
            <label htmlFor="credit-tutorial" className="block text-xs font-semibold text-slate-700 mb-1">
              Tutorial (T)
            </label>
            <input
              id="credit-tutorial"
              type="text"
              inputMode="numeric"
              required
              value={formData.tutorial}
              onChange={(e) => handleIntegerChange('tutorial', e.target.value)}
              placeholder="0"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 font-mono font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>

          {/* Practical (P) */}
          <div>
            <label htmlFor="credit-practical" className="block text-xs font-semibold text-slate-700 mb-1">
              Practical (P)
            </label>
            <input
              id="credit-practical"
              type="text"
              inputMode="numeric"
              required
              value={formData.practical}
              onChange={(e) => handleIntegerChange('practical', e.target.value)}
              placeholder="0"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 font-mono font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>

          {/* Total Credits (C) */}
          <div>
            <label htmlFor="credit-total" className="block text-xs font-semibold text-slate-700 mb-1">
              Total Credits (C)
            </label>
            <input
              id="credit-total"
              type="text"
              inputMode="numeric"
              required
              value={formData.credits}
              onChange={(e) => handleIntegerChange('credits', e.target.value)}
              placeholder="3"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2 px-3 font-mono font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy"
            />
          </div>
        </div>
      </div>

      {/* 3. Course Objectives */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
        <label htmlFor="course-objectives" className="block text-sm font-bold uppercase tracking-wider text-institute-navy">
          Course Objectives <span className="text-red-500">*</span>
        </label>
        <textarea
          id="course-objectives"
          rows={3}
          required
          value={formData.courseObjectives}
          onChange={(e) => setFormData((prev) => ({ ...prev, courseObjectives: e.target.value }))}
          placeholder="State the core educational aims and target learning outcomes of this course offering..."
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy leading-relaxed"
        />
      </div>

      {/* 4. Module-Wise Syllabus Text with Live Client-Side Syntax Checker */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <label htmlFor="module-syllabus" className="block text-sm font-bold uppercase tracking-wider text-institute-navy">
              Module-Wise Syllabus Text <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500">
              Format: <code>Module &lt;N&gt;: &lt;Topic List&gt; (&lt;Hours&gt;)</code>
            </span>
          </div>

          {/* Live Syntax Indicator */}
          {formData.moduleWiseSyllabusText && (
            <div
              className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 ${
                syllabusValidation.isValid
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {syllabusValidation.isValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              )}
              <span>{syllabusValidation.message}</span>
            </div>
          )}
        </div>

        <textarea
          id="module-syllabus"
          rows={10}
          required
          value={formData.moduleWiseSyllabusText}
          onChange={(e) => setFormData((prev) => ({ ...prev, moduleWiseSyllabusText: e.target.value }))}
          placeholder={`Module 1: Introduction to DBMS Architecture and Data Modeling (8)
Module 2: Relational Model, ER-Diagrams, and Relational Algebra (10)
Module 3: Structured Query Language (SQL) and Normalization (10)
Module 4: Transaction Processing, Concurrency Control, and Recovery (8)
Module 5: Indexing Structures, B-Trees, and Query Optimization (6)`}
          className="w-full text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy leading-relaxed"
        />
      </div>

      {/* 5. Reference Books */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
        <label htmlFor="reference-books" className="block text-sm font-bold uppercase tracking-wider text-institute-navy">
          Reference Books &amp; Bibliography <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reference-books"
          rows={4}
          required
          value={formData.referenceBooksText}
          onChange={(e) => setFormData((prev) => ({ ...prev, referenceBooksText: e.target.value }))}
          placeholder={`1. Silberschatz, Korth, and Sudarshan, "Database System Concepts", 7th Edition, McGraw-Hill.
2. Elmasri and Navathe, "Fundamentals of Database Systems", 7th Edition, Pearson.
3. Ramakrishnan and Gehrke, "Database Management Systems", 3rd Edition, McGraw-Hill.`}
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-institute-gold focus:border-institute-navy leading-relaxed"
        />
      </div>

      {/* 6. Official PDF File Upload Picker */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-institute-gold" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-institute-navy">
              Official Course Syllabus PDF Document
            </h2>
          </div>
          {pdfFileName && !pdfFile && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
              Current: {pdfFileName}
            </span>
          )}
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-institute-gold transition-colors bg-slate-50/50">
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            {pdfFile ? pdfFile.name : (pdfFileName ? `Replace ${pdfFileName}` : 'Upload Official Syllabus PDF')}
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Strictly authentic PDF documents only (.pdf)
          </p>

          <label className="inline-block px-4 py-2 bg-institute-navy hover:bg-institute-navyDark text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-sm">
            <span>{pdfFile || pdfFileName ? 'Choose Replacement PDF' : 'Select PDF Document'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 7. Action Buttons (Cancel and Submit) */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/faculty/courses')}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-md transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-institute-gold hover:bg-amber-600 active:bg-amber-700 text-institute-navyDark font-bold text-xs sm:text-sm rounded-md shadow transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-institute-navyDark" />
              <span>Saving Course Offering...</span>
            </>
          ) : (
            <span>{isEdit ? 'Update Syllabus' : 'Save Subject'}</span>
          )}
        </button>
      </div>

    </form>
  );
};

export default SubjectForm;
