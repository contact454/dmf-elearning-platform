# INTEGRATION TESTER TASK - Vocabulary Module

**Your Role:** Integration Tester for DMF Vocabulary Module
**Test Environment:** localhost:3000, PostgreSQL test DB
**Output File:** .testing/integration-results-vocabulary.md

## YOUR MISSION:
Execute ALL 15 Integration test cases from TEST_PLAN_vocabulary.md

## TEST CASES TO EXECUTE (ALL 15):

### Group 1: Review Queue API
1. **TC-INT-001:** Get Review Queue - Empty State
2. **TC-INT-002:** Get Review Queue - With Due Words  
3. **TC-INT-003:** Get Review Queue - Unauthorized

### Group 2: Review Submission API
4. **TC-INT-004:** Submit Review - Quality 5 (Easy)
5. **TC-INT-005:** Submit Review - Quality 0 (Again)
6. **TC-INT-006:** Submit Review - First Time (NEW → LEARNING)
7. **TC-INT-007:** Submit Review - Mastery (21+ days)
8. **TC-INT-008:** Submit Review - Invalid Quality

### Group 3: Progress Statistics API  
9. **TC-INT-009:** Get Progress Stats
10. **TC-INT-010:** Get Progress Stats - New User

### Group 4: Streak API
11. **TC-INT-011:** Get Streak - Active Streak
12. **TC-INT-012:** Streak Auto-Update on Review Submit
13. **TC-INT-013:** Streak Reset - Missed Day
14. **TC-INT-014:** Streak Milestone Detection
15. **TC-INT-015:** Streak Timezone Handling

## HOW TO TEST:
1. Use curl commands to test API endpoints
2. Check database with prisma studio or SQL
3. Verify response format matches expected
4. Measure response times
5. Document evidence for each test

## OUTPUT FORMAT:
For each test case, record:
```
## TC-INT-XXX: [Test Name]
**Status:** PASS/FAIL
**Response Time:** XXms
**Evidence:** [curl command + response]
**Notes:** [any issues found]
```

## BUG REPORT FORMAT:
If bug found:
```
### BUG-XXX: [Brief title]
- **Severity:** Critical/High/Medium/Low
- **Test Case:** TC-INT-XXX
- **Steps:** How to reproduce
- **Expected:** What should happen
- **Actual:** What happened
- **Evidence:** Screenshot/logs
```

START TESTING NOW!
