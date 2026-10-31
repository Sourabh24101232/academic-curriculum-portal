import assert from 'node:assert';
import app from '../../../../backend/src/app.js';
import {
  apiClient,
  publicApi,
  authApi,
  adminApi,
  checkHealth,
  API_BASE_URL
} from '../api.js';

console.log('\n--- Running Step 29 Test Suite: Centralized Axios API Client Service ---\n');

let passedTests = 0;
let failedTests = 0;

const runTest = async (description, fn) => {
  try {
    await fn();
    console.log(`  ✔ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(err);
    failedTests++;
  }
};

const server = app.listen(0);
const port = server.address().port;
const localBaseUrl = `http://localhost:${port}/api`;

async function main() {
  try {
    // 1. Verify Axios Instance Defaults
    await runTest('apiClient instance has credentials enabled and standard headers', () => {
      assert.strictEqual(apiClient.defaults.withCredentials, true, 'withCredentials must be true');
      assert.ok(API_BASE_URL, 'API_BASE_URL must be defined');
    });

    // 2. Verify publicApi module methods
    await runTest('publicApi exports all required endpoints and URL generators', () => {
      assert.strictEqual(typeof publicApi.getProgrammes, 'function');
      assert.strictEqual(typeof publicApi.getFilters, 'function');
      assert.strictEqual(typeof publicApi.getCourses, 'function');
      assert.strictEqual(typeof publicApi.getCourseDetails, 'function');
      assert.strictEqual(typeof publicApi.getSyllabusPdfUrl, 'function');
      assert.strictEqual(typeof publicApi.downloadAllZipUrl, 'function');

      const samplePdfUrl = publicApi.getSyllabusPdfUrl('sample-123');
      assert.ok(samplePdfUrl.endsWith('/courses/sample-123/pdf'));

      const sampleZipUrl = publicApi.downloadAllZipUrl({
        programme: 'BTech',
        batch: '2024 - 2028',
        branch: 'CSE',
        semester: 'Semester 5'
      });
      assert.ok(sampleZipUrl.includes('/courses/download-all?'));
      assert.ok(sampleZipUrl.includes('programme=BTech'));
      assert.ok(sampleZipUrl.includes('branch=CSE'));
    });

    // 3. Verify authApi module methods
    await runTest('authApi exports login, logout, and getMe methods', () => {
      assert.strictEqual(typeof authApi.login, 'function');
      assert.strictEqual(typeof authApi.logout, 'function');
      assert.strictEqual(typeof authApi.getMe, 'function');
    });

    // 4. Verify adminApi module methods
    await runTest('adminApi exports course management and bulk Excel methods', () => {
      assert.strictEqual(typeof adminApi.getCourses, 'function');
      assert.strictEqual(typeof adminApi.getCourse, 'function');
      assert.strictEqual(typeof adminApi.createCourse, 'function');
      assert.strictEqual(typeof adminApi.updateCourse, 'function');
      assert.strictEqual(typeof adminApi.deleteCourse, 'function');
      assert.strictEqual(typeof adminApi.uploadPdf, 'function');
      assert.strictEqual(typeof adminApi.getTemplateUrl, 'function');
      assert.strictEqual(typeof adminApi.bulkPreview, 'function');
      assert.strictEqual(typeof adminApi.bulkConfirm, 'function');

      const templateUrl = adminApi.getTemplateUrl();
      assert.ok(templateUrl.endsWith('/admin/courses/template'));
    });

    // 5. Integration Test: Live query to /health probe
    await runTest('checkHealth queries /health and receives clean response', async () => {
      // Point apiClient baseURL to the test server port
      apiClient.defaults.baseURL = localBaseUrl;

      const health = await checkHealth();
      assert.strictEqual(health.status, 'OK');
      assert.strictEqual(health.service, 'IIITBH Curriculum Portal API');
      assert.ok(health.timestamp);
    });

    // 6. Integration Test: publicApi.getProgrammes() against live backend
    await runTest('publicApi.getProgrammes returns supported degree programmes', async () => {
      const result = await publicApi.getProgrammes();
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.programmes, ['BTech', 'MTech', 'PhD']);
    });
  } finally {
    server.close();
    console.log(`\nStep 29 Tests finished: ${passedTests} passed, ${failedTests} failed\n`);
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  server.close();
  process.exit(1);
});
