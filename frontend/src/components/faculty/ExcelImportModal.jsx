import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';

/**
 * ExcelImportModal Component
 * Two-phase Excel bulk import modal dialog:
 * Phase 1: Upload & Dry-Run Preview with row-by-row syntax/duplicate validation report.
 * Phase 2: Duplicate/Error resolution radios and transactional commit execution.
 *
 * Strict Invariants:
 * - Summary stat cards: Total Rows, Valid, Invalid, Duplicates.
 * - Preview table: Row Number, Course Code, Course Name, Status, and line error details.
 * - Radios: "Skip Duplicates" vs "Update Existing", and "Import Valid Rows Only" vs "Cancel All".
 * - Transactional execution via /api/admin/courses/bulk-confirm.
 */
const ExcelImportModal = ({ isOpen = false, onClose, onSuccess }) => {
  const [stage, setStage] = useState('UPLOAD'); // 'UPLOAD' | 'PREVIEW' | 'RESULTS'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState('SKIP'); // 'SKIP' | 'UPDATE'
  const [importStrategy, setImportStrategy] = useState('IMPORT_VALID_ONLY'); // 'IMPORT_VALID_ONLY' | 'CANCEL_ON_ERROR'
  const [commitResult, setCommitResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setStage('UPLOAD');
    setSelectedFile(null);
    setPreviewData(null);
    setCommitResult(null);
    setErrorMessage('');
    setDuplicateAction('SKIP');
    setImportStrategy('IMPORT_VALID_ONLY');
  };

  const handleClose = () => {
    handleReset();
    if (onClose) onClose();
  };

  // 1. Phase 1: File selection & dry-run preview trigger
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      setErrorMessage('Invalid file format. Please upload an Excel spreadsheet (.xlsx or .xls).');
      return;
    }

    try {
      setSelectedFile(file);
      setIsLoadingPreview(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('excelFile', file);

      const report = await adminApi.bulkPreview(formData);
      if (report && report.success) {
        setPreviewData(report);
        setStage('PREVIEW');
      } else {
        setErrorMessage(report?.message || 'Failed to inspect Excel spreadsheet.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error processing spreadsheet preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // 2. Phase 2: Transactional bulk confirm commit
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.rows) return;

    try {
      setIsCommitting(true);
      setErrorMessage('');

      const payload = {
        rows: previewData.rows,
        duplicateAction,
        importStrategy
      };

      const result = await adminApi.bulkConfirm(payload);
      if (result && result.success) {
        setCommitResult(result);
        setStage('RESULTS');
        if (onSuccess) onSuccess(result);
      } else {
        setErrorMessage(result?.message || 'Bulk import transaction failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to execute bulk import transaction.');
    } finally {
      setIsCommitting(false);
    }
  };

  const templateUrl = adminApi.getTemplateUrl();

  const isConfirmDisabled =
    isCommitting ||
    !previewData ||
    previewData.validRowsCount === 0 ||
    (importStrategy === 'CANCEL_ON_ERROR' && previewData.invalidRowsCount > 0);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="excel-modal-title" className="text-base sm:text-lg font-bold text-institute-navy">
                Bulk Excel Course Import
              </h2>
              <p className="text-xs text-slate-500">
                Dry-run validate curriculum spreadsheets, resolve duplicates, and perform bulk ingestion.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-5">
          
          {/* Error Banner */}
          {errorMessage && (
            <div
              className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 shadow-sm"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STAGE 1: File Upload Screen */}
          {stage === 'UPLOAD' && (
            <div className="space-y-6">
              {/* Instructions & Template Download Card */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold">Official Format Required</p>
                  <p className="text-slate-600 mt-0.5">
                    Spreadsheets must match the official column structure with valid non-negative integer credits and sequential module headers.
                  </p>
                </div>
                <a
                  href={templateUrl}
                  download="IIITBH_Course_Import_Template.xlsx"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-institute-navy text-white font-semibold rounded hover:bg-institute-navyDark transition-colors whitespace-nowrap shadow-sm text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-institute-gold" />
                  <span>Download Format (Excel)</span>
                </a>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-institute-gold transition-colors bg-slate-50/50">
                {isLoadingPreview ? (
                  <div className="py-6">
                    <Loader2 className="w-8 h-8 animate-spin text-institute-gold mx-auto mb-3" />
                    <p className="text-xs sm:text-sm font-semibold text-institute-navy">
                      Analyzing spreadsheet &amp; validating row syntax...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Checking integer credits, module sequences, and existing database duplicates.
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      Select Curriculum Spreadsheet (.xlsx, .xls)
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                      Upload your department Excel workbook to inspect preview counts and diagnose any row errors.
                    </p>
                    <label className="inline-block px-5 py-2.5 bg-institute-gold hover:bg-amber-600 active:bg-amber-700 text-institute-navyDark text-xs sm:text-sm font-bold rounded-md shadow cursor-pointer transition-colors">
                      <span>Choose Spreadsheet File</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STAGE 2: Dry-Run Preview Dashboard */}
          {stage === 'PREVIEW' && previewData && (
            <div className="space-y-5">
              
              {/* Summary Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Rows */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
                    {previewData.summary?.totalRows ?? previewData.totalRows}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Rows
                  </span>
                </div>

                {/* Valid Rows */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-700 block">
                    {previewData.summary?.validRowsCount ?? previewData.validRowsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Valid Rows
                  </span>
                </div>

                {/* Invalid Rows */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <span className="text-xl sm:text-2xl font-bold text-red-700 block">
                    {previewData.summary?.invalidRowsCount ?? previewData.invalidRowsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider">
                    Invalid Rows
                  </span>
                </div>

                {/* Duplicate Rows */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <span className="text-xl sm:text-2xl font-bold text-amber-700 block">
                    {previewData.summary?.duplicateRowsCount ?? previewData.duplicateRowsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                    Duplicates
                  </span>
                </div>
              </div>

              {/* Preview Rows Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-institute-navy uppercase tracking-wider">
                    Dry-Run Validation Report
                  </span>
                  <span className="text-xs text-slate-500">
                    File: <strong>{selectedFile?.name}</strong>
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2 px-3 w-16">Row #</th>
                        <th className="py-2 px-3 w-24">Code</th>
                        <th className="py-2 px-3">Course Name</th>
                        <th className="py-2 px-3 w-28">Status</th>
                        <th className="py-2 px-3">Issues / Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.rows?.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-medium text-slate-500">
                            {row.rowNumber}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-institute-navy">
                            {row.courseCode || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-800 font-medium">
                            {row.courseName || '—'}
                            <div className="text-[10px] text-slate-400">
                              {row.programme} • {row.branch} • {row.semester}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            {row.status === 'VALID' && (
                              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                                VALID
                              </span>
                            )}
                            {row.status === 'DUPLICATE' && (
                              <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                                DUPLICATE
                              </span>
                            )}
                            {row.status === 'INVALID' && (
                              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 font-semibold rounded text-[10px]">
                                INVALID
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-600">
                            {row.errors && row.errors.length > 0 ? (
                              <ul className="list-disc pl-3 text-red-600 space-y-0.5">
                                {row.errors.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            ) : (
                              row.isDuplicate ? (
                                <span className="text-amber-700">Course offering already exists in catalog.</span>
                              ) : (
                                <span className="text-emerald-700">Ready for transactional ingest.</span>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ingestion Strategy & Duplicate Handling Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                {/* Duplicate Handling Radio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-institute-navy mb-2">
                    Duplicate Handling
                  </label>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="SKIP"
                        checked={duplicateAction === 'SKIP'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="text-institute-gold focus:ring-institute-gold"
                      />
                      <span><strong>Skip Duplicates</strong> (keep existing offerings unchanged)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="UPDATE"
                        checked={duplicateAction === 'UPDATE'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="text-institute-gold focus:ring-institute-gold"
                      />
                      <span><strong>Update Existing</strong> (overwrite metadata &amp; syllabus text)</span>
                    </label>
                  </div>
                </div>

                {/* Error Strategy Radio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-institute-navy mb-2">
                    Error Handling Strategy
                  </label>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importStrategy"
                        value="IMPORT_VALID_ONLY"
                        checked={importStrategy === 'IMPORT_VALID_ONLY'}
                        onChange={(e) => setImportStrategy(e.target.value)}
                        className="text-institute-gold focus:ring-institute-gold"
                      />
                      <span><strong>Import Valid Rows Only</strong> (skip rows with syntax errors)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importStrategy"
                        value="CANCEL_ON_ERROR"
                        checked={importStrategy === 'CANCEL_ON_ERROR'}
                        onChange={(e) => setImportStrategy(e.target.value)}
                        className="text-institute-gold focus:ring-institute-gold"
                      />
                      <span><strong>Cancel All on Error</strong> (strict zero-error tolerance)</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STAGE 3: Ingestion Results Screen */}
          {stage === 'RESULTS' && commitResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-institute-navy">
                Bulk Course Ingestion Completed
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your course offerings have been transactionally committed to the academic curriculum database.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xl font-bold text-emerald-700 block">
                    {commitResult.importedCount ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Imported</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xl font-bold text-blue-700 block">
                    {commitResult.updatedCount ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Updated</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xl font-bold text-amber-700 block">
                    {commitResult.skippedCount ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Skipped</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {stage === 'PREVIEW' ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isCommitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-institute-navy transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Different File</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isCommitting}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConfirmDisabled}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-institute-gold hover:bg-amber-600 active:bg-amber-700 text-institute-navyDark text-xs font-bold rounded-md shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCommitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ingesting Courses...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Import Courses</span>
                  )}
                </button>
              </div>
            </>
          ) : stage === 'RESULTS' ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-institute-navy text-white text-xs font-semibold rounded-md hover:bg-institute-navyDark transition-colors shadow-sm"
              >
                Close &amp; Refresh Catalog
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExcelImportModal;
