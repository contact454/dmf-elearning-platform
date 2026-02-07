# PERFORMANCE TESTER TASK - Vocabulary Module

**Your Role:** Performance Tester for DMF Vocabulary Module
**Test Environment:** localhost:3000
**Output File:** .testing/performance-results-vocabulary.md

## YOUR MISSION:
Execute ALL 8 Performance test cases from TEST_PLAN_vocabulary.md

## TEST CASES TO EXECUTE (ALL 8):

### Group 1: Page Load Performance
1. **TC-PERF-001:** Review Page Load Time (<3s)
2. **TC-PERF-002:** Dashboard Load Time with Streak Widget
3. **TC-PERF-003:** Flashcard Animation Frame Rate (60fps)

### Group 2: API Response Time
4. **TC-PERF-004:** GET /api/review/queue Response Time (<100ms avg)
5. **TC-PERF-005:** POST /api/review/submit Response Time (<50ms avg)
6. **TC-PERF-006:** GET /api/user/streak Response Time (<100ms avg)

### Group 3: Load Testing
7. **TC-PERF-007:** Concurrent Users - Review Submission (50 users)
8. **TC-PERF-008:** Memory Leak Detection

## HOW TO TEST:
1. Use curl with time measurements
2. Use browser DevTools Performance tab
3. Run multiple requests to get averages
4. Monitor memory usage during extended sessions

## TOOLS:
- curl with -w "%{time_total}"
- ab (Apache Bench) if available
- Browser DevTools Lighthouse

## OUTPUT FORMAT:
For each test case, record:
```
## TC-PERF-XXX: [Test Name]
**Status:** PASS/FAIL
**Target:** [target metric]
**Actual:** [measured value]
**Evidence:** [command + output]
**Notes:** [any bottlenecks identified]
```

START TESTING NOW!
