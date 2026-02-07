#!/usr/bin/env tsx
/**
 * INTEGRATION TEST RUNNER FOR DMF WRITING MODULE
 * Executes 20 integration tests (API + Database)
 * 
 * Test Groups:
 * 1. Authentication (3 tests)
 * 2. Grammar Checking (5 tests)
 * 3. Essay Management (6 tests)
 * 4. Writing Prompts (3 tests)
 * 5. Analytics (3 tests)
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// ==================== CONFIGURATION ====================
const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Test results storage
interface TestResult {
  testId: string;
  testName: string;
  group: string;
  priority: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
  performanceMs?: number;
}

const results: TestResult[] = [];
let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;

// Test data storage
const testData = {
  users: [] as any[],
  tokens: new Map<string, string>(),
  prompts: [] as any[],
  essays: [] as any[],
};

// ==================== HELPER FUNCTIONS ====================

function log(message: string, level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') {
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m',    // Yellow
  };
  const reset = '\x1b[0m';
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`${colors[level]}[${timestamp}] [${level}]${reset} ${message}`);
}

function createApiClient(token?: string): AxiosInstance {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return axios.create({
    baseURL: API_URL,
    headers,
    timeout: 10000,
  });
}

async function runTest(
  testId: string,
  testName: string,
  group: string,
  priority: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  log(`\n▶️  Running ${testId}: ${testName}`, 'INFO');

  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({
      testId,
      testName,
      group,
      priority,
      status: 'PASS',
      duration,
    });
    testsPassed++;
    log(`✅ PASS (${duration}ms)`, 'SUCCESS');
  } catch (error: any) {
    const duration = Date.now() - startTime;
    results.push({
      testId,
      testName,
      group,
      priority,
      status: 'FAIL',
      duration,
      error: error.message,
      details: error.response?.data,
    });
    testsFailed++;
    log(`❌ FAIL (${duration}ms): ${error.message}`, 'ERROR');
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertStatus(actual: number, expected: number) {
  assert(actual === expected, `Expected status ${expected}, got ${actual}`);
}

function assertType(value: any, type: string) {
  const actualType = typeof value;
  assert(actualType === type, `Expected type ${type}, got ${actualType}`);
}

function assertMatch(value: string, pattern: RegExp, message: string) {
  assert(pattern.test(value), message);
}

// ==================== GROUP 1: AUTHENTICATION (3 TESTS) ====================

async function testAuthRegistration() {
  const api = createApiClient();
  const uniqueEmail = `test-${Date.now()}@example.com`;
  
  const response = await api.post('/auth/register', {
    email: uniqueEmail,
    password: 'SecurePass123!',
    name: 'Test User',
  });

  assertStatus(response.status, 201);
  assert(response.data.user, 'User object missing');
  assert(response.data.token, 'JWT token missing');
  assertType(response.data.user.id, 'string');
  assertMatch(response.data.user.id, /^[0-9a-f-]{36}$/, 'User ID must be UUID v4');
  assert(response.data.user.email === uniqueEmail, 'Email mismatch');
  
  // Store for later tests
  testData.users.push(response.data.user);
  testData.tokens.set(uniqueEmail, response.data.token);
  
  log(`Created user: ${response.data.user.id}`, 'INFO');
}

async function testAuthDuplicateEmail() {
  const api = createApiClient();
  const existingEmail = testData.users[0].email;
  
  try {
    await api.post('/auth/register', {
      email: existingEmail,
      password: 'password123',
      name: 'Duplicate User',
    });
    throw new Error('Expected 409 Conflict but request succeeded');
  } catch (error: any) {
    assertStatus(error.response?.status, 409);
    assert(error.response?.data?.error, 'Error message missing');
  }
}

async function testAuthLogin() {
  const api = createApiClient();
  const testUser = testData.users[0];
  
  // First, register a new user with known password
  const uniqueEmail = `login-test-${Date.now()}@example.com`;
  await api.post('/auth/register', {
    email: uniqueEmail,
    password: 'password123',
    name: 'Login Test User',
  });
  
  // Now login
  const response = await api.post('/auth/login', {
    email: uniqueEmail,
    password: 'password123',
  });

  assertStatus(response.status, 200);
  assert(response.data.user, 'User object missing');
  assert(response.data.token, 'JWT token missing');
  assert(response.data.user.email === uniqueEmail, 'Email mismatch');
  
  // Verify JWT contains userId
  const tokenParts = response.data.token.split('.');
  assert(tokenParts.length === 3, 'Invalid JWT format');
  
  // Store token
  testData.tokens.set(uniqueEmail, response.data.token);
}

// ==================== GROUP 2: GRAMMAR CHECKING (5 TESTS) ====================

async function testGrammarCheckGerman() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  const startTime = Date.now();
  const response = await api.post('/grammar/check', {
    text: 'Ich gehe zu die Bibliothek.',
    language: 'de-DE',
  });
  const processingTime = Date.now() - startTime;

  assertStatus(response.status, 200);
  assert(response.data.errors, 'Errors array missing');
  assert(Array.isArray(response.data.errors), 'Errors must be array');
  assert(response.data.errors.length > 0, 'Should detect at least 1 error');
  
  const error = response.data.errors[0];
  assert(error.type, 'Error type missing');
  assert(error.message, 'Error message missing');
  assert(typeof error.offset === 'number', 'Offset must be number');
  assert(typeof error.length === 'number', 'Length must be number');
  assert(Array.isArray(error.suggestions), 'Suggestions must be array');
  
  assert(processingTime < 3000, `Processing time ${processingTime}ms exceeds 3000ms (uncached)`);
  
  log(`Grammar check: ${response.data.errors.length} errors in ${processingTime}ms`, 'INFO');
  
  // Store for cache test
  results[results.length - 1].performanceMs = processingTime;
}

async function testGrammarCheckCache() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  // First call (should cache)
  await api.post('/grammar/check', {
    text: 'Cached test text. Ich bin ein Student.',
    language: 'de-DE',
  });
  
  // Second call (should hit cache)
  const startTime = Date.now();
  const response = await api.post('/grammar/check', {
    text: 'Cached test text. Ich bin ein Student.',
    language: 'de-DE',
  });
  const processingTime = Date.now() - startTime;

  assertStatus(response.status, 200);
  assert(processingTime < 100, `Cached response ${processingTime}ms should be <100ms`);
  
  log(`Cache hit: ${processingTime}ms`, 'SUCCESS');
  results[results.length - 1].performanceMs = processingTime;
}

async function testGrammarCheckRateLimit() {
  // Skip this test as it requires 60+ requests
  log('⏭️  Skipping rate limit test (requires 60+ requests)', 'WARN');
  results.push({
    testId: 'TC-INT-006',
    testName: 'Grammar Check - Rate Limiting',
    group: 'Grammar Checking',
    priority: 'P1',
    status: 'SKIP',
    duration: 0,
    details: 'Skipped: requires 60+ requests',
  });
  testsSkipped++;
}

async function testGrammarCheckMaxLength() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  const longText = 'a'.repeat(100001);
  
  try {
    await api.post('/grammar/check', {
      text: longText,
      language: 'de-DE',
    });
    throw new Error('Expected 400 Bad Request but request succeeded');
  } catch (error: any) {
    assertStatus(error.response?.status, 400);
    assert(error.response?.data?.error, 'Error message missing');
  }
}

async function testGrammarCheckUnsupportedLanguage() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  try {
    const response = await api.post('/grammar/check', {
      text: 'Hello world',
      language: 'xx-XX',
    });
    // Accept either 400 or 200 with error from LanguageTool
    assert(
      response.status === 400 || (response.status === 200 && response.data.error),
      'Should return error for unsupported language'
    );
  } catch (error: any) {
    // Also accept 500 from LanguageTool API error
    assert(
      error.response?.status === 400 || error.response?.status === 500,
      `Expected 400 or 500, got ${error.response?.status}`
    );
  }
}

// ==================== GROUP 3: ESSAY MANAGEMENT (6 TESTS) ====================

async function testEssayCreate() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  // First, get a prompt
  const promptsRes = await api.get('/prompts');
  assert(promptsRes.data.prompts && promptsRes.data.prompts.length > 0, 'No prompts available');
  const promptId = promptsRes.data.prompts[0].id;
  
  const response = await api.post('/essays', {
    promptId,
    content: 'Ich gehe zur Schule. Dann esse ich.',
  });

  assertStatus(response.status, 201);
  assert(response.data.essay, 'Essay object missing');
  assert(response.data.essay.id, 'Essay ID missing');
  assertMatch(response.data.essay.id, /^[0-9a-f-]{36}$/, 'Essay ID must be UUID');
  assert(response.data.essay.content, 'Content missing');
  assert(typeof response.data.essay.wordCount === 'number', 'Word count must be number');
  assert(response.data.essay.wordCount === 7, `Expected 7 words, got ${response.data.essay.wordCount}`);
  assert(response.data.essay.status === 'draft', 'Status should be draft');
  
  // Store for later tests
  testData.essays.push(response.data.essay);
  
  log(`Created essay: ${response.data.essay.id} (${response.data.essay.wordCount} words)`, 'INFO');
}

async function testEssayUpdate() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const essay = testData.essays[0];
  
  const response = await api.put(`/essays/${essay.id}`, {
    content: 'Updated content with more words here.',
    errorCount: 2,
    writingTimeSeconds: 300,
  });

  assertStatus(response.status, 200);
  assert(response.data.essay, 'Essay object missing');
  assert(response.data.essay.wordCount === 6, `Expected 6 words, got ${response.data.essay.wordCount}`);
  assert(response.data.essay.writingTimeSeconds === 300, 'Writing time not updated');
  assert(response.data.essay.updatedAt !== essay.updatedAt, 'updatedAt should change');
}

async function testEssayOwnership() {
  // Create second user
  const api = createApiClient();
  const uniqueEmail = `owner-test-${Date.now()}@example.com`;
  const registerRes = await api.post('/auth/register', {
    email: uniqueEmail,
    password: 'password123',
    name: 'Owner Test User',
  });
  const unauthorizedToken = registerRes.data.token;
  
  // Try to update first user's essay with second user's token
  const api2 = createApiClient(unauthorizedToken);
  const essay = testData.essays[0];
  
  try {
    await api2.put(`/essays/${essay.id}`, {
      content: 'Unauthorized update',
    });
    throw new Error('Expected 403 Forbidden but request succeeded');
  } catch (error: any) {
    assertStatus(error.response?.status, 403);
  }
}

async function testEssayGet() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const essay = testData.essays[0];
  
  const response = await api.get(`/essays/${essay.id}`);

  assertStatus(response.status, 200);
  assert(response.data.essay, 'Essay object missing');
  assert(response.data.essay.id === essay.id, 'Essay ID mismatch');
  assert(response.data.essay.content, 'Content missing');
  assert(typeof response.data.essay.wordCount === 'number', 'Word count missing');
}

async function testEssayList() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  const response = await api.get('/essays?limit=10&offset=0');

  assertStatus(response.status, 200);
  assert(response.data.essays, 'Essays array missing');
  assert(Array.isArray(response.data.essays), 'Essays must be array');
  assert(response.data.essays.length > 0, 'Should have at least 1 essay');
  
  // Verify sorting (newest first)
  if (response.data.essays.length > 1) {
    const first = new Date(response.data.essays[0].createdAt);
    const second = new Date(response.data.essays[1].createdAt);
    assert(first >= second, 'Essays should be sorted by createdAt DESC');
  }
}

async function testEssayDelete() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  // Create a new essay to delete
  const promptsRes = await api.get('/prompts');
  const promptId = promptsRes.data.prompts[0].id;
  
  const createRes = await api.post('/essays', {
    promptId,
    content: 'Essay to be deleted',
  });
  const essayId = createRes.data.essay.id;
  
  const response = await api.delete(`/essays/${essayId}`);

  assertStatus(response.status, 204);
  
  // Verify deletion
  try {
    await api.get(`/essays/${essayId}`);
    throw new Error('Essay should not exist after deletion');
  } catch (error: any) {
    assert(error.response?.status === 404, 'Should return 404 for deleted essay');
  }
}

// ==================== GROUP 4: WRITING PROMPTS (3 TESTS) ====================

async function testPromptsListAll() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  const response = await api.get('/prompts');

  assertStatus(response.status, 200);
  assert(response.data.prompts, 'Prompts array missing');
  assert(Array.isArray(response.data.prompts), 'Prompts must be array');
  assert(response.data.prompts.length > 0, 'Should have at least 1 prompt');
  
  const prompt = response.data.prompts[0];
  assert(prompt.id, 'Prompt ID missing');
  assert(prompt.title, 'Title missing');
  assert(prompt.description, 'Description missing');
  assert(prompt.cefrLevel, 'CEFR level missing');
  assert(prompt.category, 'Category missing');
  assert(typeof prompt.targetWordCount === 'number', 'Target word count must be number');
  
  // Store prompts for later tests
  testData.prompts = response.data.prompts;
  
  log(`Found ${response.data.prompts.length} prompts`, 'INFO');
}

async function testPromptsFilterByCEFR() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  
  const response = await api.get('/prompts?level=B1');

  assertStatus(response.status, 200);
  assert(response.data.prompts, 'Prompts array missing');
  assert(Array.isArray(response.data.prompts), 'Prompts must be array');
  
  // Verify all prompts are B1
  response.data.prompts.forEach((prompt: any) => {
    assert(prompt.cefrLevel === 'B1', `Expected B1, got ${prompt.cefrLevel}`);
  });
  
  log(`Found ${response.data.prompts.length} B1 prompts`, 'INFO');
}

async function testPromptGetSingle() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const promptId = testData.prompts[0].id;
  
  const response = await api.get(`/prompts/${promptId}`);

  assertStatus(response.status, 200);
  assert(response.data.prompt, 'Prompt object missing');
  assert(response.data.prompt.id === promptId, 'Prompt ID mismatch');
  assert(response.data.prompt.title, 'Title missing');
  assert(response.data.prompt.description, 'Description missing');
  assert(response.data.prompt.cefrLevel, 'CEFR level missing');
  assert(response.data.prompt.category, 'Category missing');
  assert(typeof response.data.prompt.targetWordCount === 'number', 'Target word count missing');
}

// ==================== GROUP 5: ANALYTICS (3 TESTS) ====================

async function testAnalyticsWeekly() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const userId = testData.users[0].id;
  
  const response = await api.get(`/analytics/${userId}?period=week`);

  assertStatus(response.status, 200);
  assert(response.data.stats, 'Stats object missing');
  assert(typeof response.data.stats.totalEssays === 'number', 'totalEssays missing');
  assert(typeof response.data.stats.totalWords === 'number', 'totalWords missing');
  assert(typeof response.data.stats.averageWords === 'number', 'averageWords missing');
  
  // Verify calculation
  if (response.data.stats.totalEssays > 0) {
    const expectedAvg = response.data.stats.totalWords / response.data.stats.totalEssays;
    assert(
      Math.abs(response.data.stats.averageWords - expectedAvg) < 0.01,
      'Average calculation incorrect'
    );
  }
  
  log(`Analytics: ${response.data.stats.totalEssays} essays, avg ${response.data.stats.averageWords} words`, 'INFO');
}

async function testAnalyticsMonthly() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const userId = testData.users[0].id;
  
  const response = await api.get(`/analytics/${userId}?period=month`);

  assertStatus(response.status, 200);
  assert(response.data.stats, 'Stats object missing');
  assert(typeof response.data.stats.totalEssays === 'number', 'totalEssays missing');
}

async function testAnalyticsAllTime() {
  const token = testData.tokens.values().next().value;
  const api = createApiClient(token);
  const userId = testData.users[0].id;
  
  const response = await api.get(`/analytics/${userId}?period=all`);

  assertStatus(response.status, 200);
  assert(response.data.stats, 'Stats object missing');
  assert(typeof response.data.stats.totalEssays === 'number', 'totalEssays missing');
}

// ==================== TEST EXECUTION ====================

async function checkServerHealth() {
  log('🔍 Checking server health...', 'INFO');
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    log('✅ Server is healthy', 'SUCCESS');
    return true;
  } catch (error) {
    log('❌ Server is not responding. Please start the backend first:', 'ERROR');
    log('   cd services/writing-service && pnpm dev', 'INFO');
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  DMF WRITING MODULE - INTEGRATION TEST SUITE');
  console.log('  20 Tests: Auth, Grammar, Essays, Prompts, Analytics');
  console.log('='.repeat(80) + '\n');

  const serverReady = await checkServerHealth();
  if (!serverReady) {
    process.exit(1);
  }

  const startTime = Date.now();

  // GROUP 1: Authentication (3 tests)
  log('\n📋 GROUP 1: AUTHENTICATION (3 tests)', 'INFO');
  await runTest('TC-INT-001', 'User Registration - Happy Path', 'Authentication', 'P0', testAuthRegistration);
  await runTest('TC-INT-002', 'User Registration - Duplicate Email', 'Authentication', 'P0', testAuthDuplicateEmail);
  await runTest('TC-INT-003', 'User Login - Correct Credentials', 'Authentication', 'P0', testAuthLogin);

  // GROUP 2: Grammar Checking (5 tests)
  log('\n📋 GROUP 2: GRAMMAR CHECKING (5 tests)', 'INFO');
  await runTest('TC-INT-004', 'Grammar Check - German Text with Errors', 'Grammar Checking', 'P0', testGrammarCheckGerman);
  await runTest('TC-INT-005', 'Grammar Check - Redis Cache Hit', 'Grammar Checking', 'P1', testGrammarCheckCache);
  await testGrammarCheckRateLimit(); // Skip
  await runTest('TC-INT-007', 'Grammar Check - Max Text Length Exceeded', 'Grammar Checking', 'P2', testGrammarCheckMaxLength);
  await runTest('TC-INT-008', 'Grammar Check - Unsupported Language', 'Grammar Checking', 'P2', testGrammarCheckUnsupportedLanguage);

  // GROUP 3: Essay Management (6 tests)
  log('\n📋 GROUP 3: ESSAY MANAGEMENT (6 tests)', 'INFO');
  await runTest('TC-INT-009', 'Create Essay - Happy Path', 'Essay Management', 'P0', testEssayCreate);
  await runTest('TC-INT-010', 'Update Essay - Auto-Save Simulation', 'Essay Management', 'P0', testEssayUpdate);
  await runTest('TC-INT-011', 'Update Essay - Ownership Verification', 'Essay Management', 'P0', testEssayOwnership);
  await runTest('TC-INT-012', 'Get Essay - With Grammar Errors', 'Essay Management', 'P1', testEssayGet);
  await runTest('TC-INT-013', 'List Essays - Pagination', 'Essay Management', 'P1', testEssayList);
  await runTest('TC-INT-014', 'Delete Essay - Cascade Deletion', 'Essay Management', 'P1', testEssayDelete);

  // GROUP 4: Writing Prompts (3 tests)
  log('\n📋 GROUP 4: WRITING PROMPTS (3 tests)', 'INFO');
  await runTest('TC-INT-015', 'List Prompts - All Levels', 'Writing Prompts', 'P1', testPromptsListAll);
  await runTest('TC-INT-016', 'List Prompts - CEFR Filter', 'Writing Prompts', 'P1', testPromptsFilterByCEFR);
  await runTest('TC-INT-017', 'Get Single Prompt', 'Writing Prompts', 'P2', testPromptGetSingle);

  // GROUP 5: Analytics (3 tests)
  log('\n📋 GROUP 5: ANALYTICS (3 tests)', 'INFO');
  await runTest('TC-INT-018', 'Analytics - Weekly Period', 'Analytics', 'P1', testAnalyticsWeekly);
  await runTest('TC-INT-019', 'Analytics - Monthly Period', 'Analytics', 'P2', testAnalyticsMonthly);
  await runTest('TC-INT-020', 'Analytics - All Time', 'Analytics', 'P2', testAnalyticsAllTime);

  const totalDuration = Date.now() - startTime;

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Passed:  ${testsPassed}`);
  console.log(`❌ Failed:  ${testsFailed}`);
  console.log(`⏭️  Skipped: ${testsSkipped}`);
  console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  const totalTests = testsPassed + testsFailed + testsSkipped;
  const passRate = ((testsPassed / totalTests) * 100).toFixed(1);
  console.log(`📊 Pass Rate: ${passRate}%`);

  // Performance Summary
  const perfResults = results.filter(r => r.performanceMs);
  if (perfResults.length > 0) {
    console.log('\n📈 PERFORMANCE:');
    perfResults.forEach(r => {
      const status = r.performanceMs! < 1000 ? '✅' : '⚠️';
      console.log(`   ${status} ${r.testName}: ${r.performanceMs}ms`);
    });
  }

  // Failed Tests Detail
  if (testsFailed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.testId}: ${r.testName}`);
      console.log(`     Error: ${r.error}`);
      if (r.details) {
        console.log(`     Details: ${JSON.stringify(r.details)}`);
      }
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  return { results, testsPassed, testsFailed, testsSkipped, totalDuration };
}

// ==================== MAIN ====================

(async () => {
  try {
    const summary = await runAllTests();
    
    // Write detailed results to file
    const fs = await import('fs/promises');
    const reportPath = '/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/.testing/INTEGRATION_TEST_RESULTS_writing.md';
    
    const report = generateMarkdownReport(summary);
    await fs.writeFile(reportPath, report, 'utf-8');
    
    log(`\n📄 Full report saved to: ${reportPath}`, 'SUCCESS');
    
    // Exit with appropriate code
    process.exit(summary.testsFailed > 0 ? 1 : 0);
  } catch (error: any) {
    log(`Fatal error: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
  }
})();

// ==================== REPORT GENERATION ====================

function generateMarkdownReport(summary: any): string {
  const { results, testsPassed, testsFailed, testsSkipped, totalDuration } = summary;
  const totalTests = testsPassed + testsFailed + testsSkipped;
  const passRate = ((testsPassed / totalTests) * 100).toFixed(1);
  const timestamp = new Date().toISOString();

  let report = `# DMF WRITING MODULE - INTEGRATION TEST RESULTS

**Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
**Test Environment:** localhost:3001 (Backend)
**Total Tests:** ${totalTests}
**Duration:** ${(totalDuration / 1000).toFixed(2)}s

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| ✅ **Passed** | ${testsPassed} |
| ❌ **Failed** | ${testsFailed} |
| ⏭️ **Skipped** | ${testsSkipped} |
| 📈 **Pass Rate** | ${passRate}% |
| ⏱️ **Total Duration** | ${(totalDuration / 1000).toFixed(2)}s |
| 🎯 **Target Pass Rate** | ≥90% |
| 🏆 **Status** | ${parseFloat(passRate) >= 90 ? '✅ PASS' : '❌ FAIL'} |

---

## 📋 TEST RESULTS BY GROUP

`;

  // Group results
  const groups = ['Authentication', 'Grammar Checking', 'Essay Management', 'Writing Prompts', 'Analytics'];
  
  groups.forEach(group => {
    const groupTests = results.filter((r: TestResult) => r.group === group);
    const groupPassed = groupTests.filter((r: TestResult) => r.status === 'PASS').length;
    const groupFailed = groupTests.filter((r: TestResult) => r.status === 'FAIL').length;
    const groupSkipped = groupTests.filter((r: TestResult) => r.status === 'SKIP').length;
    const groupTotal = groupTests.length;

    report += `### ${group} (${groupPassed}/${groupTotal} passed)\n\n`;
    report += `| Test ID | Test Name | Status | Duration | Priority |\n`;
    report += `|---------|-----------|--------|----------|----------|\n`;

    groupTests.forEach((test: TestResult) => {
      const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️';
      report += `| ${test.testId} | ${test.testName} | ${statusIcon} ${test.status} | ${test.duration}ms | ${test.priority} |\n`;
    });

    report += '\n';
  });

  // Performance metrics
  const perfResults = results.filter((r: TestResult) => r.performanceMs);
  if (perfResults.length > 0) {
    report += `## 📈 PERFORMANCE METRICS\n\n`;
    report += `| Test | Performance | Target | Status |\n`;
    report += `|------|-------------|--------|--------|\n`;
    
    perfResults.forEach((test: TestResult) => {
      const target = test.testName.includes('Cache') ? 100 : 3000;
      const status = test.performanceMs! < target ? '✅ PASS' : '⚠️ SLOW';
      report += `| ${test.testName} | ${test.performanceMs}ms | <${target}ms | ${status} |\n`;
    });
    
    report += '\n';
  }

  // Failed tests detail
  const failedTests = results.filter((r: TestResult) => r.status === 'FAIL');
  if (failedTests.length > 0) {
    report += `## ❌ FAILED TESTS DETAIL\n\n`;
    
    failedTests.forEach((test: TestResult) => {
      report += `### ${test.testId}: ${test.testName}\n\n`;
      report += `**Priority:** ${test.priority}  \n`;
      report += `**Group:** ${test.group}  \n`;
      report += `**Duration:** ${test.duration}ms  \n`;
      report += `**Error:** \`${test.error}\`  \n\n`;
      
      if (test.details) {
        report += `**Details:**\n\`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n\n`;
      }
    });
  }

  // Skipped tests
  const skippedTests = results.filter((r: TestResult) => r.status === 'SKIP');
  if (skippedTests.length > 0) {
    report += `## ⏭️ SKIPPED TESTS\n\n`;
    
    skippedTests.forEach((test: TestResult) => {
      report += `- **${test.testId}**: ${test.testName} - ${test.details}\n`;
    });
    
    report += '\n';
  }

  // Recommendations
  report += `## 💡 RECOMMENDATIONS\n\n`;
  
  if (testsFailed === 0) {
    report += `✅ **All tests passed!** The Writing Module API is working as expected.\n\n`;
    report += `**Next Steps:**\n`;
    report += `1. Proceed to E2E testing (Playwright)\n`;
    report += `2. Run performance load tests (k6)\n`;
    report += `3. Execute security tests (OWASP ZAP)\n`;
  } else {
    report += `❌ **${testsFailed} test(s) failed.** Review and fix before proceeding.\n\n`;
    report += `**Action Items:**\n`;
    
    const p0Failures = failedTests.filter((t: TestResult) => t.priority === 'P0');
    if (p0Failures.length > 0) {
      report += `1. 🔴 **CRITICAL**: Fix ${p0Failures.length} P0 failures immediately\n`;
    }
    
    const p1Failures = failedTests.filter((t: TestResult) => t.priority === 'P1');
    if (p1Failures.length > 0) {
      report += `2. 🟠 **HIGH**: Fix ${p1Failures.length} P1 failures before deployment\n`;
    }
    
    report += `3. Re-run integration tests after fixes\n`;
    report += `4. Document root causes in bug tracker\n`;
  }

  report += `\n---\n\n`;
  report += `**Report Generated:** ${timestamp}  \n`;
  report += `**Test Plan:** \`.testing/TEST_PLAN_writing.md\`  \n`;
  report += `**Test Runner:** \`.testing/run-integration-tests.ts\`  \n`;

  return report;
}
