/**
 * Frontend Performance Tests for DMF Writing Module
 * Tests TC-PERF-007 to TC-PERF-010
 * Uses Playwright for frontend measurement
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

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
    actual: typeof actual === 'number' ? `${actual.toFixed(2)}ms` : actual,
    passed,
    timestamp: new Date().toISOString(),
    ...details,
  };

  RESULTS.tests.push(result);
  RESULTS.summary.total++;
  if (passed) {
    RESULTS.summary.passed++;
    console.log(`✅ ${testId}: ${name} - ${result.actual} (target: ${target})`);
  } else {
    RESULTS.summary.failed++;
    console.log(`❌ ${testId}: ${name} - ${result.actual} (target: ${target})`);
  }

  return result;
};

// TC-PERF-007: Editor Initial Render
const testEditorRender = async (page) => {
  console.log('\n📝 TC-PERF-007: Editor Initial Render');

  const TARGET = 1500; // <1500ms

  try {
    // Start performance measurement
    console.log('  → Navigating to writing page...');
    const startTime = Date.now();

    await page.goto(`${FRONTEND_URL}/writing/new`, { waitUntil: 'networkidle' });

    // Wait for editor to be interactive (contenteditable element)
    await page.waitForSelector('[contenteditable="true"]', { state: 'visible', timeout: 5000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Get Lighthouse-style metrics if available
    const performanceMetrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    console.log('  → Performance Metrics:');
    console.log(`     DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`     First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`     FCP: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`     Time to Interactive: ${duration}ms`);

    const passed = duration < TARGET;

    logTestResult('TC-PERF-007', 'Editor Initial Render', '<1500ms', duration, passed, {
      firstPaint: `${performanceMetrics.firstPaint.toFixed(2)}ms`,
      fcp: `${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`,
      timeToInteractive: `${duration}ms`,
    });

    return passed;
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-007', 'Editor Initial Render', '<1500ms', 0, false, {
      error: error.message,
    });
    return false;
  }
};

// TC-PERF-008: Word Count Calculation - Large Essay
const testWordCountPerformance = async (page) => {
  console.log('\n📝 TC-PERF-008: Word Count Calculation');

  const TARGET = 50; // <50ms per update

  try {
    console.log('  → Generating 1000-word essay...');
    const words = [];
    for (let i = 0; i < 1000; i++) {
      words.push(`word${i}`);
    }
    const longText = words.join(' ');

    console.log('  → Pasting content into editor...');

    // Measure word count calculation time
    const startTime = Date.now();

    // Type into editor
    await page.fill('[contenteditable="true"]', longText);

    // Wait for word count to update
    await page.waitForTimeout(100); // Give it time to debounce

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Check word count display
    const wordCountText = await page
      .locator('[data-testid="word-count"]')
      .textContent()
      .catch(() => 'Word count element not found');

    console.log(`  → Word count display: ${wordCountText}`);
    console.log(`  → Update time: ${duration}ms`);

    const passed = duration < TARGET;

    logTestResult('TC-PERF-008', 'Word Count Calculation', '<50ms', duration, passed, {
      textLength: longText.length,
      wordCount: 1000,
      wordCountDisplay: wordCountText,
    });

    return passed;
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-008', 'Word Count Calculation', '<50ms', 0, false, {
      error: error.message,
    });
    return false;
  }
};

// TC-PERF-009: Error Highlighting - 50 Errors
const testErrorHighlighting = async (page) => {
  console.log('\n📝 TC-PERF-009: Error Highlighting');

  const TARGET = 200; // <200ms to render all highlights

  try {
    console.log('  → Simulating 50 errors...');

    // Create text with intentional errors (German)
    const errorTexts = [];
    for (let i = 0; i < 50; i++) {
      errorTexts.push('Ich gehe zu die Bibliothek'); // Each has grammar error
    }
    const textWithErrors = errorTexts.join('. ') + '.';

    // Clear and type new content
    await page.fill('[contenteditable="true"]', '');
    await page.fill('[contenteditable="true"]', textWithErrors);

    // Trigger grammar check (if button exists)
    const checkButton = await page.locator('button:has-text("Check Grammar")').count();
    if (checkButton > 0) {
      console.log('  → Clicking grammar check button...');
      const startTime = Date.now();

      await page.click('button:has-text("Check Grammar")');

      // Wait for errors to be displayed
      await page.waitForSelector('[data-testid="error-card"]', { timeout: 10000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Count error highlights
      const errorCount = await page.locator('[data-testid="error-card"]').count();
      const highlightCount = await page.locator('.error-underline').count();

      console.log(`  → Errors displayed: ${errorCount}`);
      console.log(`  → Highlights rendered: ${highlightCount}`);
      console.log(`  → Render time: ${duration}ms`);

      const passed = duration < TARGET;

      logTestResult('TC-PERF-009', 'Error Highlighting', '<200ms', duration, passed, {
        errorCount,
        highlightCount,
        renderTime: `${duration}ms`,
      });

      return passed;
    } else {
      console.log('  ⚠️  Grammar check button not found, skipping test');
      logTestResult('TC-PERF-009', 'Error Highlighting', '<200ms', 0, false, {
        status: 'SKIPPED',
        reason: 'Grammar check button not found',
      });
      return false;
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-009', 'Error Highlighting', '<200ms', 0, false, {
      error: error.message,
    });
    return false;
  }
};

// TC-PERF-010: Auto-Save Debouncing
const testAutoSaveDebouncing = async (page) => {
  console.log('\n📝 TC-PERF-010: Auto-Save Debouncing');

  try {
    console.log('  → Typing continuously for 15 seconds...');

    let saveCount = 0;

    // Listen for network requests to essays endpoint
    page.on('request', (request) => {
      if (request.url().includes('/api/essays/') && request.method() === 'PUT') {
        saveCount++;
        console.log(`     Auto-save triggered (count: ${saveCount})`);
      }
    });

    // Type continuously
    const startTime = Date.now();
    for (let i = 0; i < 30; i++) {
      await page.type('[contenteditable="true"]', `Typing word ${i}. `);
      await page.waitForTimeout(500); // Type every 500ms
    }

    // Wait 10 seconds for final debounce
    console.log('  → Waiting 10s for final auto-save...');
    await page.waitForTimeout(10000);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`  → Total save requests: ${saveCount}`);
    console.log(`  → Test duration: ${(duration / 1000).toFixed(1)}s`);

    // Should have only 1-2 saves (final debounced save)
    const passed = saveCount <= 2;

    logTestResult('TC-PERF-010', 'Auto-Save Debouncing', '≤2 saves', saveCount, passed, {
      saveCount,
      testDuration: `${(duration / 1000).toFixed(1)}s`,
      expectedBehavior: 'Only final debounced save after 10s',
    });

    return passed;
  } catch (error) {
    console.error('  ❌ Error:', error.message);
    logTestResult('TC-PERF-010', 'Auto-Save Debouncing', '≤2 saves', 0, false, {
      error: error.message,
    });
    return false;
  }
};

// ====================== MAIN EXECUTION ======================

const runFrontendPerformanceTests = async () => {
  console.log('🚀 Starting Frontend Performance Tests');
  console.log('========================================\n');

  let browser;
  let page;

  try {
    // Launch browser
    console.log('🔧 Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    page = await context.newPage();

    console.log('✅ Browser ready\n');

    // Run tests
    await testEditorRender(page);
    await testWordCountPerformance(page);
    await testErrorHighlighting(page);
    // Skip auto-save test for now as it requires essay creation
    // await testAutoSaveDebouncing(page);

    // Summary
    console.log('\n========================================');
    console.log('📊 Frontend Performance Tests Summary');
    console.log('========================================');
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
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
};

// Export for use in main script
module.exports = { runFrontendPerformanceTests };

// Run if called directly
if (require.main === module) {
  runFrontendPerformanceTests()
    .then((results) => {
      console.log('\n✅ All frontend performance tests completed');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}
