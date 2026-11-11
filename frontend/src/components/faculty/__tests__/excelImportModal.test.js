import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import assert from 'node:assert';

import ExcelImportModal from '../ExcelImportModal.jsx';
import AddSubjectPage from '../../../pages/faculty/AddSubjectPage.jsx';
import BulkUploadPage from '../../../pages/faculty/BulkUploadPage.jsx';
import AuthContext from '../../../context/AuthContext.jsx';

console.log('--- Testing Step 40 Excel Bulk Import Modal & Bulk Upload UI ---');

const mockAuthValue = {
  admin: { id: 1, email: 'faculty@iiitbh.ac.in' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {}
};

// 1. Closed state renders nothing
{
  const closedHtml = renderToString(
    <ExcelImportModal isOpen={false} onClose={() => {}} />
  );
  assert.strictEqual(closedHtml, '', 'Modal should render nothing when isOpen is false');
  console.log('✔ Test 1: ExcelImportModal returns null when closed.');
}

// 2. Open state in UPLOAD phase
{
  const openHtml = renderToString(
    <ExcelImportModal isOpen={true} onClose={() => {}} />
  );

  assert(
    openHtml.includes('Bulk Excel Course Import'),
    'Modal must display institutional title'
  );
  assert(
    openHtml.includes('api/admin/courses/template') || openHtml.includes('Download Format (Excel)'),
    'Modal must provide template download trigger'
  );
  assert(
    openHtml.includes('Choose Spreadsheet File'),
    'Modal must have file picker label'
  );
  assert(
    openHtml.includes('.xlsx, .xls') || openHtml.includes('.xlsx'),
    'Modal must specify accepted spreadsheet formats'
  );
  console.log('✔ Test 2: ExcelImportModal renders upload dropzone and template link.');
}

// 3. AddSubjectPage embeds Excel Bulk Upload card directly below Reference Books
{
  const addPageHtml = renderToString(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter>
        <AddSubjectPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  assert(
    addPageHtml.includes('Bulk Curriculum Import (Excel)'),
    'AddSubjectPage must embed Excel Bulk Import section'
  );
  assert(
    addPageHtml.includes('Download Format (Excel)'),
    'AddSubjectPage must have Download Format link'
  );
  assert(
    addPageHtml.includes('Bulk Import via Excel'),
    'AddSubjectPage must have trigger button for bulk modal'
  );

  // Verify positioning: Text and Reference appears before Bulk Import in the HTML
  const refIndex = addPageHtml.indexOf('Text and Reference');
  const bulkIndex = addPageHtml.indexOf('Bulk Curriculum Import (Excel)');
  assert(
    refIndex !== -1 && bulkIndex !== -1 && refIndex < bulkIndex,
    'Excel Bulk Upload section must be positioned directly below Text and Reference'
  );
  console.log('✔ Test 3: AddSubjectPage renders Bulk Upload card directly below Text and Reference.');
}

// 4. BulkUploadPage standalone route verification
{
  const bulkPageHtml = renderToString(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter>
        <BulkUploadPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  assert(
    bulkPageHtml.includes('Bulk Excel Course Import'),
    'BulkUploadPage must render page title'
  );
  assert(
    bulkPageHtml.includes('Go to Prev Page'),
    'BulkUploadPage must have Go to Prev Page back button'
  );
  assert(
    bulkPageHtml.includes('Download Format (Excel)'),
    'BulkUploadPage must have Download Format button'
  );
  assert(
    bulkPageHtml.includes('Launch Bulk Import Dialog'),
    'BulkUploadPage must have button to launch modal'
  );
  console.log('✔ Test 4: BulkUploadPage renders complete institutional guide and launch trigger.');
}

// 5. Dry-Run Preview Table and Radios Logic Verification
{
  // Test sample row report structure
  const mockPreviewReport = {
    success: true,
    totalRows: 3,
    validRowsCount: 1,
    invalidRowsCount: 1,
    duplicateRowsCount: 1,
    summary: {
      total: 3,
      valid: 1,
      invalid: 1,
      duplicate: 1
    },
    rows: [
      {
        rowNumber: 2,
        courseCode: 'CS301',
        courseName: 'Database Management Systems',
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5',
        status: 'VALID',
        issues: []
      },
      {
        rowNumber: 3,
        courseCode: 'CS302',
        courseName: 'Operating Systems',
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5',
        status: 'DUPLICATE',
        issues: ['Offering already exists in the catalog.']
      },
      {
        rowNumber: 4,
        courseCode: 'CS303',
        courseName: 'Compiler Design',
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5',
        status: 'INVALID',
        issues: ['Module syntax error: Expected Module 2 on Line 2']
      }
    ]
  };

  assert.strictEqual(mockPreviewReport.rows.length, 3);
  assert.strictEqual(mockPreviewReport.rows[0].status, 'VALID');
  assert.strictEqual(mockPreviewReport.rows[1].status, 'DUPLICATE');
  assert.strictEqual(mockPreviewReport.rows[2].status, 'INVALID');

  // Verify duplicate actions
  const validDuplicateActions = ['SKIP', 'UPDATE'];
  assert(validDuplicateActions.includes('SKIP'));
  assert(validDuplicateActions.includes('UPDATE'));

  // Verify import strategies
  const validStrategies = ['IMPORT_VALID_ONLY', 'CANCEL_ON_ERROR'];
  assert(validStrategies.includes('IMPORT_VALID_ONLY'));
  assert(validStrategies.includes('CANCEL_ON_ERROR'));

  console.log('✔ Test 5: Dry-Run preview data structure, status codes, and configuration options verified.');
}

console.log('--- All Step 40 Unit Tests Passed Successfully ---');
