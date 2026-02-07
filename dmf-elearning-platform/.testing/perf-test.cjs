#!/usr/bin/env node

/**
 * Performance Test Script for DMF Reading Module
 * Tests: API response times, load testing, database queries
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

// Helper: Make HTTP request and measure time
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            duration,
            data: data,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      reject({ error, duration });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Helper: Run multiple requests and calculate stats
async function loadTest(name, url, options = {}) {
  const count = options.count || 100;
  const concurrent = options.concurrent || 1;
  const method = options.method || 'GET';
  const body = options.body || null;

  console.log(`\n${COLORS.cyan}[LOAD TEST] ${name}${COLORS.reset}`);
  console.log(`  URL: ${url}`);
  console.log(`  Requests: ${count}, Concurrent: ${concurrent}, Method: ${method}`);

  const durations = [];
  const errors = [];
  let completed = 0;

  // Run requests in batches (simulate concurrency)
  for (let i = 0; i < count; i += concurrent) {
    const batch = [];
    for (let j = 0; j < concurrent && i + j < count; j++) {
      batch.push(
        makeRequest(url, { method, body, headers: options.headers })
          .then((res) => {
            durations.push(res.duration);
            completed++;
            if (completed % 10 === 0) {
              process.stdout.write(`  Progress: ${completed}/${count}\r`);
            }
            return res;
          })
          .catch((err) => {
            errors.push(err);
            completed++;
            return null;
          })
      );
    }
    await Promise.all(batch);
  }

  // Calculate statistics
  durations.sort((a, b) => a - b);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];

  console.log(`\n  ${COLORS.blue}Results:${COLORS.reset}`);
  console.log(`    Completed: ${durations.length}/${count}`);
  console.log(`    Failed: ${errors.length}`);
  console.log(`    Min: ${min}ms`);
  console.log(`    Avg: ${avg.toFixed(2)}ms`);
  console.log(`    Max: ${max}ms`);
  console.log(`    P50: ${p50}ms`);
  console.log(`    P95: ${p95}ms`);
  console.log(`    P99: ${p99}ms`);

  return { name, durations, errors, avg, min, max, p50, p95, p99, count };
}

// Helper: Test result logger
function logTest(testId, testName, target, actual, passed, details = {}) {
  results.tests.push({ testId, testName, target, actual, passed, details });
  results.summary.total++;
  if (passed) {
    results.summary.passed++;
    console.log(`${COLORS.green}✓ ${testId}: ${testName}${COLORS.reset}`);
    console.log(`  Target: ${target}, Actual: ${actual}`);
  } else {
    results.summary.failed++;
    console.log(`${COLORS.red}✗ ${testId}: ${testName}${COLORS.reset}`);
    console.log(`  Target: ${target}, Actual: ${actual}`);
  }
  if (details.notes) {
    console.log(`  Notes: ${details.notes}`);
  }
}

// ===== PERFORMANCE TESTS =====

async function runTests() {
  console.log(`${COLORS.cyan}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║  DMF READING MODULE - PERFORMANCE TESTS                   ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);

  // === TC-PERF-005: GET /api/reading/passages Response Time ===
  try {
    const test1 = await loadTest(
      'TC-PERF-005: GET /api/reading/passages',
      `${BASE_URL}/api/reading/passages`,
      { count: 100, concurrent: 1 }
    );
    logTest(
      'TC-PERF-005',
      'GET /api/reading/passages Response Time',
      '<500ms avg, <800ms p95',
      `${test1.avg.toFixed(2)}ms avg, ${test1.p95}ms p95`,
      test1.avg < 500 && test1.p95 < 800,
      { stats: test1 }
    );
  } catch (error) {
    logTest('TC-PERF-005', 'GET /api/reading/passages', '<500ms', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === TC-PERF-006: GET /api/reading/passages/:id Response Time ===
  try {
    // First get a valid passage ID
    const listRes = await makeRequest(`${BASE_URL}/api/reading/passages?limit=1`);
    let passageId = null;
    
    if (listRes.statusCode === 200) {
      const listData = JSON.parse(listRes.data);
      if (listData.passages && listData.passages.length > 0) {
        passageId = listData.passages[0].id;
      }
    }

    if (!passageId) {
      // Try mock ID
      passageId = 'passage-a1-1';
    }

    const test2 = await loadTest(
      'TC-PERF-006: GET /api/reading/passages/:id',
      `${BASE_URL}/api/reading/passages/${passageId}`,
      { count: 100, concurrent: 1 }
    );
    logTest(
      'TC-PERF-006',
      'GET /api/reading/passages/:id Response Time',
      '<300ms avg',
      `${test2.avg.toFixed(2)}ms avg`,
      test2.avg < 300,
      { stats: test2, passageId }
    );
  } catch (error) {
    logTest('TC-PERF-006', 'GET /api/reading/passages/:id', '<300ms', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === TC-PERF-007: POST /api/reading/submit Response Time ===
  try {
    const submitBody = JSON.stringify({
      passageId: 'passage-a1-1',
      exerciseId: 'exercise-a1-1-mc-1',
      userAnswer: { selected_index: 0 },
      timeSpentSeconds: 15,
    });

    const test3 = await loadTest(
      'TC-PERF-007: POST /api/reading/submit',
      `${BASE_URL}/api/reading/submit`,
      {
        count: 100,
        concurrent: 1,
        method: 'POST',
        body: submitBody,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-perf',
        },
      }
    );
    logTest(
      'TC-PERF-007',
      'POST /api/reading/submit Response Time',
      '<400ms avg',
      `${test3.avg.toFixed(2)}ms avg`,
      test3.avg < 400,
      { stats: test3 }
    );
  } catch (error) {
    logTest('TC-PERF-007', 'POST /api/reading/submit', '<400ms', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === TC-PERF-008: GET /api/reading/progress Response Time ===
  try {
    const test4 = await loadTest(
      'TC-PERF-008: GET /api/reading/progress',
      `${BASE_URL}/api/reading/progress`,
      {
        count: 50,
        concurrent: 1,
        headers: { 'x-user-id': 'test-user-perf' },
      }
    );
    logTest(
      'TC-PERF-008',
      'GET /api/reading/progress Response Time',
      '<600ms avg',
      `${test4.avg.toFixed(2)}ms avg`,
      test4.avg < 600,
      { stats: test4 }
    );
  } catch (error) {
    logTest('TC-PERF-008', 'GET /api/reading/progress', '<600ms', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === TC-PERF-009: POST /api/reading/vocabulary/save Response Time ===
  try {
    const vocabBody = JSON.stringify({
      word: 'comprehension',
      passageId: 'passage-a1-1',
      context: 'Reading comprehension is important.',
    });

    const test5 = await loadTest(
      'TC-PERF-009: POST /api/reading/vocabulary/save',
      `${BASE_URL}/api/reading/vocabulary/save`,
      {
        count: 50,
        concurrent: 1,
        method: 'POST',
        body: vocabBody,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-perf',
        },
      }
    );
    logTest(
      'TC-PERF-009',
      'POST /api/reading/vocabulary/save Response Time',
      '<500ms avg',
      `${test5.avg.toFixed(2)}ms avg`,
      test5.avg < 500,
      { stats: test5 }
    );
  } catch (error) {
    logTest('TC-PERF-009', 'POST /api/reading/vocabulary/save', '<500ms', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === TC-PERF-010: Concurrent Users - Exercise Submission ===
  try {
    console.log(`\n${COLORS.yellow}[CONCURRENT TEST] Simulating 20 concurrent users...${COLORS.reset}`);
    const submitBody = JSON.stringify({
      passageId: 'passage-a1-1',
      exerciseId: 'exercise-a1-1-mc-1',
      userAnswer: { selected_index: 0 },
      timeSpentSeconds: 15,
    });

    const test6 = await loadTest(
      'TC-PERF-010: Concurrent Users - Exercise Submission',
      `${BASE_URL}/api/reading/submit`,
      {
        count: 100,
        concurrent: 20, // 20 concurrent users
        method: 'POST',
        body: submitBody,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-concurrent',
        },
      }
    );
    logTest(
      'TC-PERF-010',
      'Concurrent Users (20) - Exercise Submission',
      '<800ms avg, <1500ms p95',
      `${test6.avg.toFixed(2)}ms avg, ${test6.p95}ms p95`,
      test6.avg < 800 && test6.p95 < 1500,
      { stats: test6 }
    );
  } catch (error) {
    logTest('TC-PERF-010', 'Concurrent Users', '<800ms avg', 'ERROR', false, {
      notes: error.message,
    });
  }

  // === SIMPLE RESPONSE CHECKS ===
  console.log(`\n${COLORS.cyan}[RESPONSE CHECKS]${COLORS.reset}`);

  // Check passage list response structure
  try {
    const res = await makeRequest(`${BASE_URL}/api/reading/passages?limit=5`);
    const valid = res.statusCode === 200 && res.duration < 500;
    logTest(
      'TC-PERF-011',
      'Passage List - Response Structure',
      '200 status, <500ms',
      `${res.statusCode} status, ${res.duration}ms`,
      valid,
      { response: res.data.substring(0, 200) }
    );
  } catch (error) {
    logTest('TC-PERF-011', 'Passage List Response', '200 status', 'ERROR', false);
  }

  // Check single passage response
  try {
    const res = await makeRequest(`${BASE_URL}/api/reading/passages/passage-a1-1`);
    const valid = res.statusCode === 200 && res.duration < 300;
    logTest(
      'TC-PERF-012',
      'Single Passage - Response Structure',
      '200 status, <300ms',
      `${res.statusCode} status, ${res.duration}ms`,
      valid,
      { response: res.data.substring(0, 200) }
    );
  } catch (error) {
    logTest('TC-PERF-012', 'Single Passage Response', '200 status', 'ERROR', false);
  }

  // === PRINT SUMMARY ===
  console.log(`\n${COLORS.cyan}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║  TEST SUMMARY                                              ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
  console.log(`  Total Tests: ${results.summary.total}`);
  console.log(`  ${COLORS.green}Passed: ${results.summary.passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${results.summary.failed}${COLORS.reset}`);
  console.log(
    `  Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`
  );

  // Save results to JSON
  const fs = require('fs');
  const outputPath = '.testing/perf-results/results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n${COLORS.blue}Results saved to: ${outputPath}${COLORS.reset}`);

  return results;
}

// Run tests
runTests()
  .then((results) => {
    console.log(`\n${COLORS.green}Performance tests completed!${COLORS.reset}\n`);
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(`${COLORS.red}Error running tests:${COLORS.reset}`, error);
    process.exit(1);
  });
