/**
 * API Performance Tests for DMF Writing Module
 * Tests TC-PERF-001 to TC-PERF-006
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Test configuration
const RESULTS = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

// Helper to measure time
const measureTime = async (name, fn) => {
  const start = process.hrtime.bigint();
  try {
    await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to ms
    return { success: true, duration };
  } catch (error) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    return { success: false, duration, error: error.message };
  }
};

// Helper to register and login
const createTestUser = async () => {
  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const password = 'TestPass123!';

  try {
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name: `Test User ${timestamp}`,
    });

    return {
      user: registerRes.data.user,
      token: registerRes.data.token,
      email,
      password,
    };
  } catch (error) {
    console.error('Failed to create test user:', error.response?.data || error.message);
    throw error;
  }
};

// Helper to create essay
const createEssay = async (token, promptId, content = 'Test content') => {
  const res = await axios.post(
    `${API_URL}/essays`,
    {
      promptId,
      content,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Helper to get first prompt
const getFirstPrompt = async () => {
  const res = await axios.get(`${API_URL}/prompts`);
  return res.data.prompts[0];
};

// Test results logger
const logTestResult = (testId, name, target, actual, passed, details = {}) => {
  const result = {
    testId,
    name,
    target,
    actual: `${actual.toFixed(2)}ms`,
    passed,
    timestamp: new Date().toISOString(),
    ...details,
  };

  RESULTS.tests.push(result);
  RESULTS.summary.total++;
  if (passed) {
    RESULTS.summary.passed++;
    console.log(`✅ ${testId}: ${name} - ${actual.toFixed(2)}ms (target: ${target})`);
  } else {
    RESULTS.summary.failed++;
    console.log(`❌ ${testId}: ${name} - ${actual.toFixed(2)}ms (target: ${target})`);
  }

  return result;
};

// ====================== TEST CASES ======================

// TC-PERF-001: Grammar Check - Cached Response
const testGrammarCheckCached = async (token) => {
  console.log('\n📝 TC-PERF-001: Grammar Check - Cached Response');

  const text = 'Ich gehe zu die Bibliothek.';
  const language = 'de-DE';

  // First request (uncached)
  console.log('  → First request (will be cached)...');
  const firstResult = await measureTime('grammar-check-first', async () => {
    await axios.post(
      `${API_URL}/grammar/check`,
      { text, language },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });

  console.log(`  → First request: ${firstResult.duration.toFixed(2)}ms`);

  // Wait a bit to ensure cache is set
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Second request (should be cached)
  console.log('  → Second request (should hit cache)...');
  const secondResult = await measureTime('grammar-check-cached', async () => {
    await axios.post(
      `${API_URL}/grammar/check`,
      { text, language },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });

  const TARGET = 100; // <100ms for cached
  const passed = secondResult.success && secondResult.duration < TARGET;

  logTestResult(
    'TC-PERF-001',
    'Grammar Check - Cached',
    '<100ms',
    secondResult.duration,
    passed,
    {
      firstRequestTime: `${firstResult.duration.toFixed(2)}ms`,
      cacheImprovement: `${((firstResult.duration - secondResult.duration) / firstResult.duration * 100).toFixed(1)}%`,
    }
  );

  return passed;
};

// TC-PERF-002: Grammar Check - Uncached (LanguageTool API)
const testGrammarCheckUncached = async (token) => {
  console.log('\n📝 TC-PERF-002: Grammar Check - Uncached');

  const results = [];
  const TARGET = 3000; // <3s for uncached

  // Test with 5 unique texts
  const texts = [
    'Das ist ein sehr langer Satz mit vielen Wörtern.',
    'Heute gehe ich in die Schule und lerne Deutsch.',
    'Mein Freund hat gestern ein neues Auto gekauft.',
    'Wir essen gerne Pizza und trinken Cola dazu.',
    'Der Hund spielt im Garten mit seinem Ball.',
  ];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    console.log(`  → Request ${i + 1}/5: "${text.substring(0, 30)}..."`);

    const result = await measureTime(`grammar-check-unique-${i}`, async () => {
      await axios.post(
        `${API_URL}/grammar/check`,
        { text, language: 'de-DE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    });

    results.push(result.duration);
    console.log(`     Time: ${result.duration.toFixed(2)}ms`);
  }

  // Calculate p95 (5 samples, so take the max)
  const p95 = Math.max(...results);
  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const passed = p95 < TARGET && results.every((r) => r < TARGET);

  logTestResult('TC-PERF-002', 'Grammar Check - Uncached', '<3000ms', p95, passed, {
    average: `${avg.toFixed(2)}ms`,
    min: `${Math.min(...results).toFixed(2)}ms`,
    max: `${p95.toFixed(2)}ms`,
    samples: results.length,
  });

  return passed;
};

// TC-PERF-003: Essay List - Pagination Performance
const testEssayPagination = async (token) => {
  console.log('\n📝 TC-PERF-003: Essay List - Pagination');

  const prompt = await getFirstPrompt();
  const TARGET = 200; // <200ms

  // Create some essays first
  console.log('  → Creating test essays...');
  for (let i = 0; i < 10; i++) {
    await createEssay(token, prompt.id, `Test essay content ${i + 1}`);
  }

  // Test first page
  console.log('  → Testing first page (limit=20, offset=0)...');
  const firstPageResult = await measureTime('essay-list-first-page', async () => {
    await axios.get(`${API_URL}/essays?limit=20&offset=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  const passed = firstPageResult.success && firstPageResult.duration < TARGET;

  logTestResult(
    'TC-PERF-003',
    'Essay List - Pagination',
    '<200ms',
    firstPageResult.duration,
    passed,
    {
      pageSize: 20,
      offset: 0,
    }
  );

  return passed;
};

// TC-PERF-004: Analytics Calculation - Large Dataset
const testAnalytics = async (token, userId) => {
  console.log('\n📝 TC-PERF-004: Analytics Calculation');

  const TARGET = 500; // <500ms

  console.log('  → Fetching analytics (period=all)...');
  const result = await measureTime('analytics-calculation', async () => {
    await axios.get(`${API_URL}/analytics/${userId}?period=all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  const passed = result.success && result.duration < TARGET;

  logTestResult('TC-PERF-004', 'Analytics Calculation', '<500ms', result.duration, passed);

  return passed;
};

// TC-PERF-005: Auto-Save Update
const testAutoSaveUpdate = async (token) => {
  console.log('\n📝 TC-PERF-005: Auto-Save Update');

  const prompt = await getFirstPrompt();
  const TARGET = 150; // <150ms

  // Create essay first
  console.log('  → Creating essay...');
  const essay = await createEssay(token, prompt.id, 'Initial content');

  // Generate 500-word content
  const words = [];
  for (let i = 0; i < 500; i++) {
    words.push(`word${i}`);
  }
  const longContent = words.join(' ');

  console.log('  → Updating essay with 500-word content...');
  const result = await measureTime('auto-save-update', async () => {
    await axios.put(
      `${API_URL}/essays/${essay.id}`,
      {
        content: longContent,
        errorCount: 5,
        writingTimeSeconds: 300,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  });

  const passed = result.success && result.duration < TARGET;

  logTestResult('TC-PERF-005', 'Auto-Save Update', '<150ms', result.duration, passed, {
    contentLength: longContent.length,
    wordCount: 500,
  });

  return passed;
};

// TC-PERF-006: Prompts List
const testPromptsList = async () => {
  console.log('\n📝 TC-PERF-006: Prompts List');

  const TARGET = 100; // <100ms

  console.log('  → Fetching all prompts...');
  const result = await measureTime('prompts-list', async () => {
    await axios.get(`${API_URL}/prompts`);
  });

  const passed = result.success && result.duration < TARGET;

  logTestResult('TC-PERF-006', 'Prompts List', '<100ms', result.duration, passed);

  return passed;
};

// ====================== MAIN EXECUTION ======================

const runApiPerformanceTests = async () => {
  console.log('🚀 Starting API Performance Tests');
  console.log('====================================\n');

  try {
    // Setup: Create test user
    console.log('🔧 Setup: Creating test user...');
    const { user, token } = await createTestUser();
    console.log(`✅ Test user created: ${user.email} (ID: ${user.id})`);

    // Run tests
    await testGrammarCheckCached(token);
    await testGrammarCheckUncached(token);
    await testEssayPagination(token);
    await testAnalytics(token, user.id);
    await testAutoSaveUpdate(token);
    await testPromptsList();

    // Summary
    console.log('\n====================================');
    console.log('📊 API Performance Tests Summary');
    console.log('====================================');
    console.log(`Total Tests: ${RESULTS.summary.total}`);
    console.log(`✅ Passed: ${RESULTS.summary.passed}`);
    console.log(`❌ Failed: ${RESULTS.summary.failed}`);
    console.log(
      `Success Rate: ${((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1)}%`
    );

    return RESULTS;
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
};

// Export for use in main script
module.exports = { runApiPerformanceTests };

// Run if called directly
if (require.main === module) {
  runApiPerformanceTests()
    .then((results) => {
      console.log('\n✅ All API performance tests completed');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}
