/**
 * Load Testing for DMF Writing Module
 * Tests TC-PERF-011 to TC-PERF-012
 * Simulates concurrent users
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

const RESULTS = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

const logTestResult = (testId, name, target, actual, passed, details = {}) => {
  const result = {
    testId,
    name,
    target,
    actual,
    passed,
    timestamp: new Date().toISOString(),
    ...details,
  };

  RESULTS.tests.push(result);
  RESULTS.summary.total++;
  if (passed) {
    RESULTS.summary.passed++;
    console.log(`✅ ${testId}: ${name} - ${actual} (target: ${target})`);
  } else {
    RESULTS.summary.failed++;
    console.log(`❌ ${testId}: ${name} - ${actual} (target: ${target})`);
  }

  return result;
};

// Helper to create test user
const createTestUser = async (index) => {
  const timestamp = Date.now();
  const email = `loadtest-${timestamp}-${index}@example.com`;
  const password = 'TestPass123!';

  try {
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name: `Load Test User ${index}`,
    });

    return {
      user: registerRes.data.user,
      token: registerRes.data.token,
      email,
    };
  } catch (error) {
    throw new Error(`Failed to create user ${index}: ${error.message}`);
  }
};

// Helper to perform grammar check
const grammarCheck = async (token, text, language = 'de-DE') => {
  const startTime = Date.now();
  try {
    await axios.post(
      `${API_URL}/grammar/check`,
      { text, language },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10s timeout
      }
    );
    const duration = Date.now() - startTime;
    return { success: true, duration, error: null };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      duration,
      error: error.response?.status || error.message,
    };
  }
};

// TC-PERF-011: Concurrent Grammar Checks
const testConcurrentGrammarChecks = async () => {
  console.log('\n📝 TC-PERF-011: Concurrent Grammar Checks');
  console.log('  Target: 100 concurrent users, avg response <5s, no failures');

  const NUM_USERS = 100;
  const TARGET_AVG = 5000; // <5s average

  try {
    // Create test users
    console.log(`  → Creating ${NUM_USERS} test users...`);
    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const user = await createTestUser(i);
      users.push(user);
      if ((i + 1) % 20 === 0) {
        console.log(`     Created ${i + 1}/${NUM_USERS} users...`);
      }
    }
    console.log(`  ✅ ${NUM_USERS} users created`);

    // Prepare test texts (varied to avoid too much caching)
    const testTexts = [
      'Ich gehe zu die Bibliothek.',
      'Das ist ein gutte Idee.',
      'Er hat ein Hund und ein Katze.',
      'Wir sind gestern zur Schule gegangen.',
      'Mein Freund spielt Fussball im Park.',
    ];

    // Execute concurrent grammar checks
    console.log(`\n  → Starting ${NUM_USERS} concurrent grammar checks...`);
    const startTime = Date.now();

    const promises = users.map((user, index) => {
      const text = testTexts[index % testTexts.length];
      return grammarCheck(user.token, text);
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Analyze results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const durations = successful.map((r) => r.duration);

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length || 0;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Check for rate limiting (429 errors)
    const rateLimited = failed.filter((r) => r.error === 429);

    console.log(`\n  📊 Results:`);
    console.log(`     Total requests: ${NUM_USERS}`);
    console.log(`     Successful: ${successful.length}`);
    console.log(`     Failed: ${failed.length}`);
    console.log(`     Rate limited (429): ${rateLimited.length}`);
    console.log(`     Average response: ${avgDuration.toFixed(2)}ms`);
    console.log(`     Min response: ${minDuration.toFixed(2)}ms`);
    console.log(`     Max response: ${maxDuration.toFixed(2)}ms`);
    console.log(`     Total test duration: ${totalDuration}ms`);

    // Pass if: no 5xx errors, avg < 5s
    const has5xxErrors = failed.filter((r) => r.error >= 500 && r.error < 600).length > 0;
    const passed = !has5xxErrors && avgDuration < TARGET_AVG;

    logTestResult(
      'TC-PERF-011',
      'Concurrent Grammar Checks',
      'avg <5000ms, no 5xx errors',
      `avg ${avgDuration.toFixed(2)}ms`,
      passed,
      {
        totalRequests: NUM_USERS,
        successful: successful.length,
        failed: failed.length,
        rateLimited: rateLimited.length,
        has5xxErrors,
        avgDuration: `${avgDuration.toFixed(2)}ms`,
        minDuration: `${minDuration.toFixed(2)}ms`,
        maxDuration: `${maxDuration.toFixed(2)}ms`,
        totalDuration: `${totalDuration}ms`,
      }
    );

    return passed;
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-011', 'Concurrent Grammar Checks', 'avg <5000ms', 'ERROR', false, {
      error: error.message,
    });
    return false;
  }
};

// TC-PERF-012: Database Connection Pool
const testDatabaseConnectionPool = async () => {
  console.log('\n📝 TC-PERF-012: Database Connection Pool');
  console.log('  Target: 200 concurrent requests, no pool exhaustion');

  const NUM_REQUESTS = 200;

  try {
    // Create test users
    console.log(`  → Creating 10 test users for pool testing...`);
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await createTestUser(i);
      users.push(user);
    }
    console.log(`  ✅ Test users created`);

    // Get first prompt for essay operations
    const promptRes = await axios.get(`${API_URL}/prompts`);
    const promptId = promptRes.data.prompts[0]?.id;

    if (!promptId) {
      throw new Error('No prompts available');
    }

    // Mix of different endpoints to stress the pool
    const endpoints = [
      { method: 'GET', url: '/api/prompts', requiresAuth: false },
      { method: 'GET', url: '/api/essays', requiresAuth: true },
      {
        method: 'POST',
        url: '/api/essays',
        data: { promptId, content: 'Test' },
        requiresAuth: true,
      },
      { method: 'GET', url: '/api/analytics/USER_ID?period=week', requiresAuth: true },
    ];

    console.log(`\n  → Starting ${NUM_REQUESTS} concurrent mixed requests...`);
    const startTime = Date.now();

    const promises = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const endpoint = endpoints[i % endpoints.length];
      const user = users[i % users.length];

      let promise;
      if (endpoint.requiresAuth) {
        const url = endpoint.url.replace('USER_ID', user.user.id);
        if (endpoint.method === 'GET') {
          promise = axios
            .get(`${BASE_URL}${url}`, {
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000,
            })
            .then(() => ({ success: true }))
            .catch((error) => ({
              success: false,
              error: error.response?.status || error.code,
            }));
        } else {
          promise = axios
            .post(`${BASE_URL}${endpoint.url}`, endpoint.data, {
              headers: { Authorization: `Bearer ${user.token}` },
              timeout: 10000,
            })
            .then(() => ({ success: true }))
            .catch((error) => ({
              success: false,
              error: error.response?.status || error.code,
            }));
        }
      } else {
        promise = axios
          .get(`${BASE_URL}${endpoint.url}`, { timeout: 10000 })
          .then(() => ({ success: true }))
          .catch((error) => ({
            success: false,
            error: error.response?.status || error.code,
          }));
      }

      promises.push(promise);
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Analyze results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const connectionErrors = failed.filter(
      (r) => r.error === 'ECONNRESET' || r.error === 'ETIMEDOUT'
    );

    console.log(`\n  📊 Results:`);
    console.log(`     Total requests: ${NUM_REQUESTS}`);
    console.log(`     Successful: ${successful.length}`);
    console.log(`     Failed: ${failed.length}`);
    console.log(`     Connection errors: ${connectionErrors.length}`);
    console.log(`     Total duration: ${totalDuration}ms`);
    console.log(`     Throughput: ${(NUM_REQUESTS / (totalDuration / 1000)).toFixed(2)} req/s`);

    // Pass if: no connection pool exhaustion, < 5% failure rate
    const failureRate = (failed.length / NUM_REQUESTS) * 100;
    const passed = connectionErrors.length === 0 && failureRate < 5;

    logTestResult(
      'TC-PERF-012',
      'Database Connection Pool',
      'no pool exhaustion, <5% failure',
      `${failureRate.toFixed(1)}% failure rate`,
      passed,
      {
        totalRequests: NUM_REQUESTS,
        successful: successful.length,
        failed: failed.length,
        connectionErrors: connectionErrors.length,
        failureRate: `${failureRate.toFixed(1)}%`,
        totalDuration: `${totalDuration}ms`,
        throughput: `${(NUM_REQUESTS / (totalDuration / 1000)).toFixed(2)} req/s`,
      }
    );

    return passed;
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-012', 'Database Connection Pool', 'no pool exhaustion', 'ERROR', false, {
      error: error.message,
    });
    return false;
  }
};

// ====================== MAIN EXECUTION ======================

const runLoadTests = async () => {
  console.log('🚀 Starting Load Tests');
  console.log('======================\n');

  try {
    await testConcurrentGrammarChecks();
    await testDatabaseConnectionPool();

    // Summary
    console.log('\n======================');
    console.log('📊 Load Tests Summary');
    console.log('======================');
    console.log(`Total Tests: ${RESULTS.summary.total}`);
    console.log(`✅ Passed: ${RESULTS.summary.passed}`);
    console.log(`❌ Failed: ${RESULTS.summary.failed}`);
    console.log(
      `Success Rate: ${((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1)}%`
    );

    return RESULTS;
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
};

// Export for use in main script
module.exports = { runLoadTests };

// Run if called directly
if (require.main === module) {
  runLoadTests()
    .then((results) => {
      console.log('\n✅ All load tests completed');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}
