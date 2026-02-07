# SECURITY TESTER TASK - Vocabulary Module

**Your Role:** Security Tester for DMF Vocabulary Module
**Test Environment:** localhost:3000
**Output File:** .testing/security-results-vocabulary.md

## YOUR MISSION:
Execute ALL 10 Security test cases from TEST_PLAN_vocabulary.md

## TEST CASES TO EXECUTE (ALL 10):

### Group 1: Authentication
1. **TC-SEC-001:** Unauthenticated Access - Review Queue (401 expected)
2. **TC-SEC-002:** Unauthenticated Access - Submit Review (401 expected)

### Group 2: Authorization
3. **TC-SEC-003:** Cross-User Data Access - Review Queue
4. **TC-SEC-004:** Cross-User Progress Modification

### Group 3: Input Validation
5. **TC-SEC-005:** SQL Injection - Word ID
6. **TC-SEC-006:** XSS Attack - Review Submission
7. **TC-SEC-007:** Quality Score Out of Range

### Group 4: Data Security
8. **TC-SEC-008:** Sensitive Data Exposure in Logs
9. **TC-SEC-009:** HTTPS Enforcement (Production Check)
10. **TC-SEC-010:** Rate Limiting (Optional - Phase 2)

## HOW TO TEST:
1. Use curl with malicious payloads
2. Check for proper error responses
3. Verify no data leakage
4. Test input validation
5. Check logs for sensitive data

## ATTACK PAYLOADS:
- SQL Injection: `'; DROP TABLE users; --`
- XSS: `<script>alert('XSS')</script>`
- Invalid IDs: `../../etc/passwd`
- Out of range: `quality: 999`

## OUTPUT FORMAT:
For each test case, record:
```
## TC-SEC-XXX: [Test Name]
**Status:** PASS/FAIL (PASS = attack blocked)
**Attack Type:** [type]
**Payload:** [what was sent]
**Expected:** [expected defense]
**Actual:** [what happened]
**Evidence:** [curl command + response]
**Severity if failed:** Critical/High/Medium/Low
```

START TESTING NOW!
