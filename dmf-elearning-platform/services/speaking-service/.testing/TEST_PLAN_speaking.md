# DMF Speaking Module - Security Test Plan

**Project:** DMF E-Learning Platform - Speaking Service  
**Version:** 1.0  
**Date:** February 7, 2026  
**Test Type:** Security Testing  
**Environment:** Development

---

## 📋 Test Scope

### Objectives
- Verify authentication and authorization mechanisms
- Test password storage security
- Validate rate limiting effectiveness
- Assess file upload security
- Check input validation against injection attacks
- Verify infrastructure security (CORS, headers)

### Out of Scope
- Performance testing
- Load testing
- Functional testing
- Integration testing
- UI/UX testing

---

## 🎯 Test Categories

### 1. Authentication & Authorization (4 tests)

#### TC-SEC-001: JWT Token Validation
**Priority:** P0 (Critical)  
**Category:** Authentication  
**Description:** Verify JWT token validation is properly enforced

**Test Cases:**
- **TC-SEC-001a:** Missing Authorization header → HTTP 401
- **TC-SEC-001b:** Invalid JWT signature → HTTP 401
- **TC-SEC-001c:** Expired JWT token → HTTP 401

**Expected Result:** All unauthorized requests rejected with 401

**Test Data:**
- Valid token: From user registration/login
- Invalid token: Signed with wrong secret
- Expired token: Signed with `expiresIn: '-1h'`

---

#### TC-SEC-002: Ownership Verification
**Priority:** P0 (Critical)  
**Category:** Authorization  
**Description:** Verify users can only access their own submissions

**Test Steps:**
1. Create User A and User B
2. User B creates a submission
3. User A attempts to access User B's submission
4. Expected: HTTP 403 Forbidden or 404 Not Found

**Attack Scenario:** Horizontal privilege escalation

**Expected Result:** Access denied

---

#### TC-SEC-003: Password Storage Security
**Priority:** P0 (Critical)  
**Category:** Authentication  
**Description:** Verify passwords are hashed with bcrypt

**Test Cases:**
- **TC-SEC-003a:** Password not in API response
- **TC-SEC-003b:** Login with correct password succeeds
- **TC-SEC-003c:** Login with wrong password fails (401)

**Expected Result:**
- No plaintext passwords in responses
- bcrypt verification working
- Wrong password rejected

---

#### TC-SEC-004: Rate Limiting
**Priority:** P1 (High)  
**Category:** Rate Limiting  
**Description:** Verify analysis endpoints are rate-limited

**Test Steps:**
1. Send 15 requests to `/api/analyze/transcript`
2. Expected: HTTP 429 after ~10 requests (limit: 10/15min)

**Configuration:**
- Window: 15 minutes (900,000 ms)
- Max requests: 10

**Expected Result:** Rate limit enforced

---

### 2. File Upload Security (3 tests)

#### TC-SEC-005: File Size Limit
**Priority:** P2 (Medium)  
**Category:** File Upload  
**Description:** Verify max file size (10MB) is enforced

**Test Steps:**
1. Create 11MB audio file
2. Upload to `/api/analyze/transcript`
3. Expected: HTTP 413 Payload Too Large or validation error

**Expected Result:** Oversized file rejected

---

#### TC-SEC-006: File Type Validation
**Priority:** P2 (Medium)  
**Category:** File Upload  
**Description:** Verify only audio files are accepted

**Test Steps:**
1. Create text file with .mp3 extension
2. Upload to `/api/analyze/transcript`
3. Expected: Rejection (HTTP 400 or 415)

**Allowed MIME types:**
- `audio/mpeg`
- `audio/wav`
- `audio/mp4`
- `audio/webm`
- `audio/ogg`

**Expected Result:** Non-audio file rejected

---

#### TC-SEC-007: Malicious File Upload
**Priority:** P1 (High)  
**Category:** File Upload  
**Description:** Verify malicious files are rejected

**Test Steps:**
1. Create bash script with .mp3 extension
2. Upload to `/api/analyze/transcript`
3. Expected: File rejected

**Expected Result:** Malicious file rejected

---

### 3. Input Validation (2 tests)

#### TC-SEC-008: SQL Injection Prevention
**Priority:** P0 (Critical)  
**Category:** Input Validation  
**Description:** Verify SQL injection is prevented

**SQL Payloads:**
```sql
'; DROP TABLE speaking_submissions; --
' OR '1'='1
admin'--
1' UNION SELECT * FROM users--
```

**Test Steps:**
1. Inject SQL payloads in submission fields (audioUrl, etc.)
2. Verify payloads are stored as literal strings
3. Verify no SQL execution

**Expected Result:** Payloads stored safely (Prisma parameterization)

---

#### TC-SEC-009: XSS Attack Prevention
**Priority:** P1 (High)  
**Category:** Input Validation  
**Description:** Verify XSS payloads are handled safely

**XSS Payloads:**
```html
<script>alert("XSS")</script>
<img src=x onerror="alert(1)">
<svg/onload=alert(1)>
javascript:alert(1)
```

**Test Steps:**
1. Inject XSS payloads in submission fields
2. Verify payloads are stored as-is (backend doesn't execute)
3. Frontend escaping handles XSS (React)

**Expected Result:** Backend stores content safely, frontend escapes on render

---

### 4. Infrastructure Security (1 test)

#### TC-SEC-010: CORS & Security Headers
**Priority:** P1 (High)  
**Category:** Infrastructure  
**Description:** Verify CORS and security headers

**Test Cases:**
- **TC-SEC-010a:** CORS origin validation
  - Send request with malicious origin
  - Expected: Origin not in `Access-Control-Allow-Origin`

- **TC-SEC-010b:** Security headers (Helmet)
  - Check response headers
  - Expected headers:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: SAMEORIGIN`

**Expected Result:** CORS whitelist enforced, security headers present

---

## 🛠 Test Environment

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Speaking service running on `localhost:3002`
- Database: `dmf_speaking`
- Environment variables configured (`.env`)

### Dependencies
```bash
npm install --save-dev axios @types/axios jsonwebtoken form-data
```

### Server Startup
```bash
cd services/speaking-service
npm run dev
```

### Health Check
```bash
curl http://localhost:3002/health
```

---

## 📊 Test Execution

### Run Tests
```bash
cd services/speaking-service/.testing
npx tsx security-tests-speaking.ts
```

### Expected Output
```
🔒 DMF SPEAKING MODULE - SECURITY TESTS
============================================================
✅ Server is running
✅ Test user registered
✅ Test submission created

Running 10 Security Tests...
------------------------------------------------------------
✅ TC-SEC-001a: JWT Token Validation & Expiry - Missing Token - PASS
✅ TC-SEC-001b: JWT Token Validation & Expiry - Invalid Signature - PASS
...
============================================================
SECURITY TEST SUMMARY
============================================================
Total Tests: 15
✅ Passed: 14
❌ Failed: 0
⚠️  Errors: 1
Pass Rate: 93.3%
```

### Test Duration
- Expected: ~5-10 seconds
- Rate limiting may extend duration

---

## 📈 Success Criteria

| Metric | Target | Pass/Fail |
|--------|--------|-----------|
| Pass Rate | ≥90% | ✅ if met |
| Critical Vulnerabilities (P0) | 0 | ✅ if 0 |
| High-Severity Issues (P1) | 0 | ✅ if 0 |
| Medium-Severity Issues (P2) | ≤2 | ✅ if met |

### Exit Criteria
- All P0 (Critical) tests must pass
- All P1 (High) tests must pass
- Overall pass rate ≥90%
- No critical vulnerabilities found

---

## 🐛 Defect Management

### Severity Definitions

**P0 - Critical**
- Authentication bypass
- Authorization bypass
- SQL injection
- Password leakage
- Data exposure

**P1 - High**
- Rate limiting failures
- Malicious file upload
- XSS vulnerabilities
- CORS misconfiguration

**P2 - Medium**
- File size limit bypass
- File type validation failures
- Missing security headers

**P3 - Low**
- Non-security functional issues
- Test infrastructure issues

### Defect Reporting
All defects documented in:
- `VULNERABILITIES_speaking.md` (if any found)
- `SECURITY_TEST_RESULTS_speaking.md` (detailed report)

---

## 📦 Deliverables

1. ✅ Test script: `security-tests-speaking.ts`
2. ✅ Test results (JSON): `security-test-results-speaking.json`
3. ✅ Detailed report: `SECURITY_TEST_RESULTS_speaking.md`
4. ✅ Executive summary: `EXECUTIVE_SUMMARY_speaking.md`
5. ✅ This test plan: `TEST_PLAN_speaking.md`
6. ⚠️ Vulnerability report: `VULNERABILITIES_speaking.md` (if needed)

---

## 🔄 Test Maintenance

### When to Re-run Tests
- After security-related code changes
- Before each production deployment
- After dependency updates (bcrypt, JWT libraries)
- Quarterly security audits

### Test Updates
- Update payloads as new attack vectors emerge
- Add tests for new features
- Adjust rate limits if configuration changes

---

## 📚 References

### Security Standards
- OWASP Top 10: https://owasp.org/Top10/
- OWASP API Security: https://owasp.org/www-project-api-security/
- CWE Top 25: https://cwe.mitre.org/top25/

### Tools & Libraries
- Axios: https://axios-http.com/
- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
- Prisma Security: https://www.prisma.io/docs/guides/database/advanced-database-tasks/data-validation
- Helmet: https://helmetjs.github.io/

### Project References
- Writing Service Tests: `services/writing-service/security-tests.ts`
- Backend API Docs: `services/speaking-service/README.md`

---

## ✅ Test Plan Approval

**Prepared By:** Security Test Agent  
**Date:** February 7, 2026  
**Version:** 1.0  
**Status:** ✅ Approved

---

**Next Steps:**
1. ✅ Execute test plan
2. ✅ Review results
3. ✅ Document vulnerabilities (if any)
4. ✅ Report findings
5. ✅ Approve for deployment
