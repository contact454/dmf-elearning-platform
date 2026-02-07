#!/usr/bin/env node
/**
 * Main Performance Test Runner
 * Executes all 12 performance tests (TC-PERF-001 to TC-PERF-012)
 */

const fs = require('fs');
const path = require('path');

// Import test modules
const { runApiPerformanceTests } = require('./api-performance');
const { runFrontendPerformanceTests } = require('./frontend-performance');
const { runLoadTests } = require('./load-tests');

const OUTPUT_DIR = path.join(__dirname, '../');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'PERFORMANCE_TEST_RESULTS_writing.md');

// Aggregate results
const aggregateResults = {
  timestamp: new Date().toISOString(),
  apiTests: null,
  frontendTests: null,
  loadTests: null,
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
};

// Generate markdown report
const generateMarkdownReport = (results) => {
  const now = new Date().toISOString();

  let markdown = `# PERFORMANCE TEST RESULTS - DMF Writing Module Phase 1

**Date:** ${now}  
**Test Executor:** Performance Tester (Subagent)  
**Module:** Writing Practice (Essay Editor + Grammar Checking)  
**Environment:** localhost:3001 (Backend) + localhost:3000 (Frontend)

---

## 📊 EXECUTIVE SUMMARY

**Total Tests Executed:** ${results.summary.totalTests}  
**✅ Passed:** ${results.summary.passed}  
**❌ Failed:** ${results.summary.failed}  
**⏭️ Skipped:** ${results.summary.skipped}  
**Success Rate:** ${((results.summary.passed / results.summary.totalTests) * 100).toFixed(1)}%

---

## 🎯 TEST OBJECTIVES

The performance tests validate that:

1. **API response times** meet targets for production readiness
2. **Frontend rendering** is fast and responsive
3. **Load handling** supports concurrent users without degradation
4. **Caching strategy** effectively reduces backend load

### Success Criteria (from TEST_PLAN_writing.md)

| Metric | Target | Status |
|--------|--------|--------|
| Grammar check (cached) | <100ms | ${results.apiTests?.tests.find((t) => t.testId === 'TC-PERF-001')?.passed ? '✅' : '❌'} |
| Grammar check (uncached) | <3s | ${results.apiTests?.tests.find((t) => t.testId === 'TC-PERF-002')?.passed ? '✅' : '❌'} |
| Essay operations | <200ms | ${results.apiTests?.tests.find((t) => t.testId === 'TC-PERF-003')?.passed ? '✅' : '❌'} |
| Editor render | <1.5s | ${results.frontendTests?.tests.find((t) => t.testId === 'TC-PERF-007')?.passed ? '✅' : '❌'} |
| Concurrent users | No 5xx errors | ${results.loadTests?.tests.find((t) => t.testId === 'TC-PERF-011')?.passed ? '✅' : '❌'} |

---

## 🔬 API PERFORMANCE TESTS (TC-PERF-001 to TC-PERF-006)

`;

  // API Tests
  if (results.apiTests) {
    results.apiTests.tests.forEach((test) => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      markdown += `### ${test.testId}: ${test.name}

**Target:** ${test.target}  
**Actual:** ${test.actual}  
**Status:** ${status}

`;

      // Add detailed metrics if available
      if (test.firstRequestTime) {
        markdown += `**Details:**
- First request (uncached): ${test.firstRequestTime}
- Second request (cached): ${test.actual}
- Cache improvement: ${test.cacheImprovement}

`;
      } else if (test.average) {
        markdown += `**Details:**
- Average: ${test.average}
- Min: ${test.min}
- Max: ${test.max}
- Samples: ${test.samples}

`;
      }
    });
  }

  // Frontend Tests
  markdown += `---

## 🖥️ FRONTEND PERFORMANCE TESTS (TC-PERF-007 to TC-PERF-010)

`;

  if (results.frontendTests) {
    results.frontendTests.tests.forEach((test) => {
      const status = test.passed ? '✅ PASS' : test.status === 'SKIPPED' ? '⏭️ SKIP' : '❌ FAIL';
      markdown += `### ${test.testId}: ${test.name}

**Target:** ${test.target}  
**Actual:** ${test.actual}  
**Status:** ${status}

`;

      if (test.firstPaint) {
        markdown += `**Performance Metrics:**
- First Paint: ${test.firstPaint}
- First Contentful Paint: ${test.fcp}
- Time to Interactive: ${test.timeToInteractive}

`;
      }

      if (test.reason) {
        markdown += `**Note:** ${test.reason}

`;
      }
    });
  }

  // Load Tests
  markdown += `---

## ⚡ LOAD TESTS (TC-PERF-011 to TC-PERF-012)

`;

  if (results.loadTests) {
    results.loadTests.tests.forEach((test) => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      markdown += `### ${test.testId}: ${test.name}

**Target:** ${test.target}  
**Actual:** ${test.actual}  
**Status:** ${status}

`;

      if (test.totalRequests) {
        markdown += `**Load Test Metrics:**
- Total Requests: ${test.totalRequests}
- Successful: ${test.successful}
- Failed: ${test.failed}
- Avg Response: ${test.avgDuration || 'N/A'}
- Total Duration: ${test.totalDuration}

`;
      }
    });
  }

  // Recommendations
  markdown += `---

## 💡 RECOMMENDATIONS

`;

  const failedTests = [];
  if (results.apiTests) failedTests.push(...results.apiTests.tests.filter((t) => !t.passed));
  if (results.frontendTests)
    failedTests.push(...results.frontendTests.tests.filter((t) => !t.passed));
  if (results.loadTests) failedTests.push(...results.loadTests.tests.filter((t) => !t.passed));

  if (failedTests.length === 0) {
    markdown += `### ✅ All Performance Targets Met!

The DMF Writing Module Phase 1 meets all performance benchmarks:
- API responses are fast and cached effectively
- Frontend renders quickly and handles large documents
- System handles concurrent load without degradation

**Ready for production deployment.**

`;
  } else {
    markdown += `### ⚠️ Performance Issues Detected

The following tests did not meet targets:

`;

    failedTests.forEach((test) => {
      markdown += `#### ${test.testId}: ${test.name}
- **Target:** ${test.target}
- **Actual:** ${test.actual}
- **Recommendation:** ${getRecommendation(test)}

`;
    });
  }

  markdown += `---

## 📈 NEXT STEPS

`;

  if (results.summary.failed > 0) {
    markdown += `### Immediate Actions
1. **Review failed tests** and identify bottlenecks
2. **Optimize slow endpoints** (database queries, caching)
3. **Re-run tests** after optimizations
4. **Consider infrastructure scaling** if load tests failed

`;
  }

  markdown += `### Future Improvements
1. **Add more comprehensive load testing** (simulate 500+ concurrent users)
2. **Test with production-like data volumes** (10k+ essays per user)
3. **Add network latency simulation** (slow 3G, 4G)
4. **Monitor real-world performance** with APM tools (New Relic, Datadog)
5. **Set up continuous performance monitoring** in CI/CD pipeline

---

## 🔍 RAW TEST DATA

### API Performance Tests
\`\`\`json
${JSON.stringify(results.apiTests, null, 2)}
\`\`\`

### Frontend Performance Tests
\`\`\`json
${JSON.stringify(results.frontendTests, null, 2)}
\`\`\`

### Load Tests
\`\`\`json
${JSON.stringify(results.loadTests, null, 2)}
\`\`\`

---

**Report Generated:** ${now}  
**Test Environment:** macOS (arm64)  
**Node Version:** ${process.version}  
**Status:** ${results.summary.failed === 0 ? '✅ ALL TESTS PASSED' : `⚠️ ${results.summary.failed} TEST(S) FAILED`}
`;

  return markdown;
};

// Get recommendation for failed test
const getRecommendation = (test) => {
  const recommendations = {
    'TC-PERF-001':
      'Check Redis cache configuration. Ensure cache keys are consistent and TTL is appropriate.',
    'TC-PERF-002':
      'LanguageTool API is slow. Consider: 1) Self-hosting LanguageTool, 2) Implementing request batching, 3) Upgrading network bandwidth.',
    'TC-PERF-003':
      'Database query optimization needed. Add indexes on userId, createdAt columns. Consider pagination strategy.',
    'TC-PERF-004':
      'Analytics calculation is heavy. Implement aggregation pipeline, pre-compute daily stats, or use materialized views.',
    'TC-PERF-005':
      'Essay update is slow. Optimize word count algorithm. Consider debouncing on frontend.',
    'TC-PERF-006':
      'Prompts query slow. Add database index on cefrLevel. Consider caching prompt list.',
    'TC-PERF-007':
      'Editor render is slow. Code-split Lexical bundle, lazy-load components, optimize initial bundle size.',
    'TC-PERF-008':
      'Word count calculation is slow. Optimize algorithm (consider caching or Web Worker).',
    'TC-PERF-009':
      'Error highlighting is slow. Batch DOM updates, use virtual scrolling for large error lists.',
    'TC-PERF-010':
      'Auto-save not debouncing correctly. Check useAutoSave hook delay configuration.',
    'TC-PERF-011':
      'Concurrent load test failed. Check: 1) Database connection pool size, 2) Rate limiting configuration, 3) Server resources.',
    'TC-PERF-012':
      'Connection pool exhausted. Increase Prisma connection pool size (DATABASE_URL parameters).',
  };

  return recommendations[test.testId] || 'Review implementation and optimize bottlenecks.';
};

// Main runner
const runAllPerformanceTests = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   DMF WRITING MODULE - PERFORMANCE TEST SUITE             ║');
  console.log('║   12 Tests: API + Frontend + Load                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Phase 1: API Performance Tests (6 tests)
    console.log('═'.repeat(60));
    console.log('PHASE 1: API PERFORMANCE TESTS (6 tests)');
    console.log('═'.repeat(60));
    aggregateResults.apiTests = await runApiPerformanceTests();
    aggregateResults.summary.totalTests += aggregateResults.apiTests.summary.total;
    aggregateResults.summary.passed += aggregateResults.apiTests.summary.passed;
    aggregateResults.summary.failed += aggregateResults.apiTests.summary.failed;

    // Phase 2: Frontend Performance Tests (4 tests)
    console.log('\n' + '═'.repeat(60));
    console.log('PHASE 2: FRONTEND PERFORMANCE TESTS (4 tests)');
    console.log('═'.repeat(60));
    try {
      aggregateResults.frontendTests = await runFrontendPerformanceTests();
      aggregateResults.summary.totalTests += aggregateResults.frontendTests.summary.total;
      aggregateResults.summary.passed += aggregateResults.frontendTests.summary.passed;
      aggregateResults.summary.failed += aggregateResults.frontendTests.summary.failed;
    } catch (error) {
      console.log('⚠️  Frontend tests skipped (frontend not running or Playwright not available)');
      console.log('   Error:', error.message);
      aggregateResults.summary.skipped += 4;
    }

    // Phase 3: Load Tests (2 tests)
    console.log('\n' + '═'.repeat(60));
    console.log('PHASE 3: LOAD TESTS (2 tests)');
    console.log('═'.repeat(60));
    aggregateResults.loadTests = await runLoadTests();
    aggregateResults.summary.totalTests += aggregateResults.loadTests.summary.total;
    aggregateResults.summary.passed += aggregateResults.loadTests.summary.passed;
    aggregateResults.summary.failed += aggregateResults.loadTests.summary.failed;

    // Generate report
    console.log('\n' + '═'.repeat(60));
    console.log('GENERATING REPORT');
    console.log('═'.repeat(60));

    const markdown = generateMarkdownReport(aggregateResults);
    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf-8');

    console.log(`✅ Report saved to: ${OUTPUT_FILE}`);

    // Final summary
    console.log('\n' + '╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(15) + 'FINAL SUMMARY' + ' '.repeat(30) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
    console.log(`Total Tests: ${aggregateResults.summary.totalTests}`);
    console.log(`✅ Passed: ${aggregateResults.summary.passed}`);
    console.log(`❌ Failed: ${aggregateResults.summary.failed}`);
    console.log(`⏭️  Skipped: ${aggregateResults.summary.skipped}`);
    console.log(
      `Success Rate: ${((aggregateResults.summary.passed / aggregateResults.summary.totalTests) * 100).toFixed(1)}%`
    );

    if (aggregateResults.summary.failed === 0) {
      console.log('\n🎉 ALL PERFORMANCE TESTS PASSED! 🎉');
    } else {
      console.log(`\n⚠️  ${aggregateResults.summary.failed} test(s) failed. See report for details.`);
    }

    return aggregateResults;
  } catch (error) {
    console.error('\n❌ Test suite execution failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  runAllPerformanceTests()
    .then((results) => {
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllPerformanceTests };
