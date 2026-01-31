# STEP 9A — Security Guardrails (MVP)
## Lan can an toan (Bao ve he thong)

**Status**: FROZEN
**Freeze Scope**: STEP 9A — Security Guardrails (MVP)
**Freeze Date**: 2026-01-18 (Asia/Ho_Chi_Minh)
**Freeze Notes**:
- Aligns with STEP 8B: 403 role-only, 404 ownership hide-existence, teacher/mentor queue boundary.
- Aligns with STEP 4.4 failure categories for rate limit/retry semantics.
- Respects IDs-only event payload policy (STEP 5C) and log redaction (no PII).

---

This document defines security controls, abuse prevention, and operational resilience measures for the MVP.

---

## 0. Principles (Nguyen tac)

- **Security-by-default (mac dinh an toan)**: Default deny, explicit allow
- **Deny by default (mac dinh tu choi)**: All endpoints require explicit authorization
- **Least privilege (phan quyen toi thieu)**: Users can only access what they need
- **IDs-only events (su kien chi co ID; doc state qua API read-only)**: Event payloads contain IDs only; non-ID fields fetched via read-only service APIs
- **403 role-only, 404 ownership hide-existence (theo STEP 8B)**: 403 for role violations, 404 for ownership failures to prevent enumeration

---

## 1. Threat Model Snapshot (Mo hinh de doa - tom tat)

MVP-relevant threats:

- **Enumeration**: Guessing userId, submissionId, attemptId, feedbackRequestId to access unauthorized data
- **Brute-force login**: Repeated login attempts to guess passwords
- **Replay of correlationId**: Duplicated commands via correlationId reuse
- **Spam feedback requests**: Learner creating excessive feedback requests to overwhelm teachers
- **Upload abuse**: Large audio files or malicious content in speaking submissions
- **DoS on teacher/mentor queue endpoints**: High-frequency requests to feedback queue to cause service degradation
- **PII leakage via logs / read models**: Sensitive data (email, phone, raw answers) exposed in logs or query responses

---

## 2. Rate Limiting (Gioi han tan suat)

### Group: Authentication & Profile

- **Applies to**: `POST /api/system/user/register`, `POST /api/system/user/login`, `PATCH /api/system/profile/modify`
- **Key**: `ip` (for register/login), `userId` (for profile modify)
- **Limit**: 5 requests per 15 minutes (register/login), 10 requests per minute (profile modify)
- **Burst**: 2 (register/login), 5 (profile modify)
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure` (STEP 4.4) with retry-after header
- **Notes**: Prevents brute-force login and registration abuse

### Group: Learning Commands

- **Applies to**: `POST /api/learning/lesson/start`, `POST /api/learning/lesson/complete`, `POST /api/learning/lesson/abandon`, `POST /api/learning/activity/submit`
- **Key**: `userId`
- **Limit**: 100 requests per minute per user
- **Burst**: 20
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure` (retryable)
- **Notes**: Prevents command spam; allows normal learning flow

### Group: Assessment Commands

- **Applies to**: `POST /api/assessment/quiz/start`, `POST /api/assessment/quiz/submit`, `POST /api/assessment/placement/take`
- **Key**: `userId`
- **Limit**: 20 requests per minute per user
- **Burst**: 5
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure`
- **Notes**: Assessments are less frequent; stricter limit prevents abuse

### Group: Feedback Commands

- **Applies to**: `POST /api/mentoring/feedback/request`, `POST /api/mentoring/feedback/publish`
- **Key**: `userId` (for request), `userId` (for publish)
- **Limit**: 10 requests per hour (request), 30 requests per minute (publish)
- **Burst**: 2 (request), 5 (publish)
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure` (STEP 4.4)
- **Notes**: Prevents spam feedback requests; publish limit allows normal teacher/mentor workflow

### Group: Curriculum Commands

- **Applies to**: `POST /api/curriculum/course/enroll`
- **Key**: `userId`
- **Limit**: 5 requests per minute per user
- **Burst**: 2
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure`
- **Notes**: Enrollment is infrequent; prevents abuse

### Group: Learner Query Endpoints

- **Applies to**: All `GET /api/learner/*` endpoints
- **Key**: `userId`
- **Limit**: 200 requests per minute per user
- **Burst**: 50
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure`
- **Notes**: Allows normal dashboard browsing; prevents enumeration via high-frequency queries

### Group: Teacher/Mentor Query Endpoints

- **Applies to**: All `GET /api/teacher/*` endpoints
- **Key**: `userId`
- **Limit**: 100 requests per minute per user
- **Burst**: 20
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure`
- **Notes**: Stricter than learner to prevent queue enumeration; aligns with STEP 8B queue boundary

### Group: File Upload (Speaking Audio)

- **Applies to**: `POST /api/learning/submissions/upload` (speaking audio)
- **Key**: `userId`
- **Limit**: 20 uploads per hour per user
- **Burst**: 3
- **Response on limit**: `429 Too Many Requests` → mapped to `TransientFailure`
- **Notes**: Prevents upload abuse; audio files are large

**Policy Choice**: Rate limits return `429 Too Many Requests` mapped to `TransientFailure` (STEP 4.4) consistently. Rate limits are retryable (client should retry after retry-after header). `Forbidden` (403) is reserved for role violations only per STEP 8B, not for rate limits.

---

## 3. Anti-Enumeration Controls (Chong doan ID)

### 404 for Ownership Failures

- **Rule**: Return `404 NotFound` (not `403 Forbidden`) when ownership check fails (per STEP 8B)
- **Rationale**: Hides existence of entities to prevent enumeration
- **Applies to**: All query endpoints and command ownership checks

### Randomized IDs

- **Assumption**: All entity IDs use UUID v4 or ULID (non-sequential, non-predictable)
- **Enforcement**: No sequential IDs, no timestamp-based IDs, no user-controlled IDs
- **Examples**: `attemptId`, `submissionId`, `feedbackRequestId`, `userId` (after registration)

### RequestId-Based Access for Teacher/Mentor

- **Rule**: Teacher/Mentor can only access entities via `feedbackRequestId` that exists in their queue (per STEP 8B)
- **Enforcement**: 
  - Submission detail: Must verify `FeedbackRequest.submissionId === submissionId` AND `FeedbackRequest.authorId === authenticated.userId`
  - Learner summary: Must verify EXISTS `FeedbackRequest` WHERE `FeedbackRequest.userId === requestedUserId` AND `FeedbackRequest.authorId === authenticated.userId`
- **Prevents**: Guessing `submissionId` or `userId` to access unauthorized data

### Pagination + Max Page Size Caps

- **Rule**: All list endpoints support pagination with `limit` and `offset`
- **Max page size**: 50 items per page (hard limit)
- **Default page size**: 20 items
- **Enforcement**: Reject `limit > 50` with `400 ValidationError`
- **Prevents**: Large result sets that could be used for enumeration

### Search Endpoints (MVP Constraint)

- **Rule**: No broad search endpoints without filters in MVP
- **Allowed**: Filtered queries only (e.g., submissions by `lessonId`, attempts by `lessonId`)
- **Forbidden**: Global search by name, email, or arbitrary text
- **Rationale**: Prevents enumeration via search

---

## 4. Idempotency & Replay Protection (Chong gui lap)

### correlationId Handling Rules

- **Required for**: All commands that create or mutate state (all 15 commands)
- **Optional for**: Query endpoints (not required, but accepted if provided)
- **Format**: UUID v4 or client-generated unique string
- **Storage**: Service stores `correlationId` with command result for dedupe window (24 hours)

### IdempotentReplay Semantics (STEP 4.4)

- **Rule**: If `correlationId` already processed, return `200 OK` or `201 Created` with existing entity (no mutation)
- **Response**: Include `X-Idempotent-Replay: true` header
- **Window**: Dedupe window is 24 hours (correlationId must be unique within 24h)

### Conflict vs Replay Differentiation

- **Conflict (409)**: Business rule violation (e.g., attempt already completed, enrollment already exists)
- **Replay (200/201)**: Same `correlationId` processed again → return existing result (idempotent)
- **Distinction**: Conflict = business state prevents action; Replay = same request processed twice

### Event Consumer Dedupe by eventId

- **Rule**: Event consumers dedupe by `eventId` (at-least-once delivery safety)
- **Storage**: Consumer stores `lastProcessedEventId` per event type
- **Window**: Dedupe window is 7 days (eventId must be unique within 7d)
- **Rationale**: Events may be delivered multiple times; idempotent processing required

---

## 5. Input Validation & Payload Hardening (Kiem tra dau vao)

### JSON Body Size Limits

- **Max JSON body size**: 1 MB (1,048,576 bytes)
- **Reject if**: Body size > 1 MB
- **Response**: `413 Payload Too Large` → mapped to `ValidationError` (STEP 4.4)
- **Applies to**: All POST/PATCH/PUT endpoints

### String Length Limits

- **Feedback text**: Max 10,000 characters
- **Writing submission text**: Max 50,000 characters
- **Profile fields**: 
  - `firstName`: Max 100 characters
  - `lastName`: Max 100 characters
  - `targetLanguage`: Enum (predefined list)
- **Reject if**: Exceeds limit
- **Response**: `400 ValidationError` with field-level error message

### Audio Upload Limits

- **Max file size**: 10 MB (10,485,760 bytes)
- **Max duration**: 5 minutes (300 seconds)
- **Allowed MIME types**: `audio/mpeg`, `audio/wav`, `audio/webm`, `audio/ogg`
- **Reject if**: File size > 10 MB OR duration > 5 min OR MIME type not allowed
- **Response**: `400 ValidationError` (size/duration), `415 Unsupported Media Type` → mapped to `ValidationError` (MIME type)

### Schema Validation

- **Rule**: Strict schema validation (Zod/JSON Schema) at API gateway edge
- **Enforcement**: 
  - Reject unknown fields (no "meta/data blob")
  - Reject missing required fields
  - Reject type mismatches
- **Response**: `400 ValidationError` with field-level errors
- **Location**: Validation happens before command handler (gateway layer)

### Content-Type Verification

- **Rule**: All POST/PATCH/PUT endpoints require `Content-Type: application/json` (except file uploads)
- **Reject if**: Missing or invalid `Content-Type`
- **Response**: `415 Unsupported Media Type` → mapped to `ValidationError`

---

## 6. File Upload Security (Bao mat upload)

### Speaking Audio Pipeline

- **Pattern**: Direct upload to storage bucket (signed URL pattern)
- **Flow**: 
  1. Client requests signed URL from `practice-service`
  2. Client uploads directly to storage bucket (bypasses API gateway)
  3. Client notifies `practice-service` of upload completion
  4. `practice-service` verifies file exists and metadata
- **Rationale**: Avoids storing large files in gateway/DB; reduces gateway load

### Virus Scan (MVP Constraint)

- **Status**: FUTURE (not in MVP)
- **Rationale**: Requires external service integration; deferred to post-MVP
- **Note**: MVP relies on file size/duration limits and MIME type validation

### Storage Bucket Path Rules

- **Pattern**: `{service}/{entityType}/{entityId}/{timestamp}-{random}.{ext}`
- **Example**: `practice-service/submissions/{submissionId}/20260118-abc123.wav`
- **Forbidden**: No PII in filename (no userId, email, name)
- **Enforcement**: Service generates path; client cannot specify path

### Content-Type Verification Server-Side

- **Rule**: After upload, service verifies actual file MIME type (not just extension)
- **Method**: Read file header (magic bytes) to detect actual type
- **Reject if**: MIME type mismatch (e.g., `.wav` file is actually `.exe`)
- **Response**: `400 ValidationError` → delete uploaded file

### Post-Upload Verification Job

- **Rule**: Background job verifies upload completion within 5 minutes
- **Timeout**: 5 minutes
- **Retry policy**: 3 retries with exponential backoff (1s, 2s, 4s)
- **Failure handling**: If verification fails after retries, mark submission as `failed` and notify user

---

## 7. Operational Resilience (Van hanh)

### Service-to-Service Read-Only Calls

#### practice-service → onboarding-service (User lookup)

- **Timeout**: 2 seconds
- **Retry policy**: 2 retries, exponential backoff (0.5s, 1s)
- **Circuit breaker**: Open after 5 consecutive failures, half-open after 30s
- **Fallback**: Return `500 TransientFailure` (cannot proceed without user data)
- **Error mapping**: `TransientFailure` (STEP 4.4)

#### practice-service → curriculum-service (Lesson metadata)

- **Timeout**: 2 seconds
- **Retry policy**: 2 retries, exponential backoff (0.5s, 1s)
- **Circuit breaker**: Open after 5 consecutive failures, half-open after 30s
- **Fallback**: Return cached lesson metadata if available, else `500 TransientFailure`
- **Error mapping**: `TransientFailure`

#### progress-service → curriculum-service (Unlock eligibility)

- **Timeout**: 3 seconds
- **Retry policy**: 3 retries, exponential backoff (1s, 2s, 4s)
- **Circuit breaker**: Open after 5 consecutive failures, half-open after 60s
- **Fallback**: Return `unlocked: false` (conservative: deny access if service down)
- **Error mapping**: `TransientFailure`

#### mentoring-service → practice-service (Submission lookup)

- **Timeout**: 2 seconds
- **Retry policy**: 2 retries, exponential backoff (0.5s, 1s)
- **Circuit breaker**: Open after 5 consecutive failures, half-open after 30s
- **Fallback**: Return `500 TransientFailure` (cannot create feedback without submission)
- **Error mapping**: `TransientFailure`

#### All services → Event Bus (Event emission)

- **Timeout**: 1 second
- **Retry policy**: 3 retries, exponential backoff (0.1s, 0.2s, 0.4s)
- **Circuit breaker**: Open after 10 consecutive failures, half-open after 10s
- **Fallback**: Store event in outbox table, retry via background job
- **Error mapping**: `TransientFailure` (event will be delivered eventually via outbox)

---

## 8. Teacher/Mentor Dashboard Guardrails (Bao ve dashboard GV/mentor)

### Feedback Queue as Authorization Boundary (STEP 8B)

- **Rule**: Queue is the source of truth for what teacher/mentor can access
- **Enforcement**: All detail endpoints must verify `feedbackRequestId` exists in queue result set
- **Prevents**: Bypassing queue to access arbitrary submissions/learners

### RequestId Access Only

- **Rule**: Teacher/Mentor cannot access entities by `learnerId` or `submissionId` directly
- **Required**: Must provide `feedbackRequestId` that links to the entity
- **Enforcement**: 
  - Submission detail: `GET /api/teacher/submissions/:submissionId` requires `FeedbackRequest.submissionId === submissionId` AND `FeedbackRequest.authorId === authenticated.userId`
  - Learner summary: `GET /api/teacher/learners/:userId/summary` requires EXISTS `FeedbackRequest` WHERE `FeedbackRequest.userId === requestedUserId` AND `FeedbackRequest.authorId === authenticated.userId`
- **Prevents**: Enumeration of `learnerId` or `submissionId`

### Rate Limits Stricter Than Learner

- **Limit**: 100 requests/minute (vs 200 for learner)
- **Rationale**: Teacher/mentor endpoints are more sensitive; stricter limits reduce enumeration risk
- **Enforcement**: Per-user rate limit on all `/api/teacher/*` endpoints

### Audit Logging Mandatory

- **Rule**: Every teacher/mentor query access is logged (see audit-logging-spec.md)
- **Logged fields**: `userId`, `role`, `endpoint`, `entityId` accessed, `timestamp`
- **Retention**: 90 days minimum
- **Purpose**: Detect enumeration attempts and unauthorized access

### Redactions (What Teacher/Mentor Cannot See)

- **Never exposed**: 
  - `email` (only `userId` shown)
  - `passwordHash` (never)
  - `auth tokens` (never)
  - `raw quiz answers payloads` (never)
- **Allowed**: 
  - `firstName`, `lastName` (for identification)
  - `targetLanguage` (for context)
  - `audioUrl`, `text`, `answer` content (for grading, only for submissions in queue)
  - Aggregated progress/mastery (no raw submission data)

---

## 9. Security Checklist (Checklist)

### Rate Limiting

- [ ] All endpoints have rate limits defined
- [ ] Rate limit keys are appropriate (ip vs userId vs mixed)
- [ ] Rate limit responses map to STEP 4.4 categories (TransientFailure only; Forbidden reserved for role violations)
- [ ] Teacher/mentor endpoints have stricter limits than learner

### Anti-Enumeration

- [ ] All ownership failures return 404 (not 403) per STEP 8B
- [ ] All entity IDs use UUID/ULID (non-sequential)
- [ ] Teacher/mentor access requires requestId linkage
- [ ] Pagination has max page size cap (50 items)
- [ ] No broad search endpoints without filters

### Idempotency

- [ ] All commands accept correlationId
- [ ] IdempotentReplay returns 200/201 with existing entity
- [ ] Event consumers dedupe by eventId
- [ ] Conflict (409) vs Replay (200/201) are differentiated

### Input Validation

- [ ] JSON body size limit enforced (1 MB)
- [ ] String length limits enforced (feedback, writing, profile)
- [ ] Audio file size/duration limits enforced (10 MB, 5 min)
- [ ] MIME type validation enforced (audio types only)
- [ ] Schema validation rejects unknown fields
- [ ] Content-Type header required

### File Upload

- [ ] Direct upload pattern (signed URL) implemented
- [ ] Storage bucket path has no PII
- [ ] Server-side MIME type verification (magic bytes)
- [ ] Post-upload verification job with timeout/retry

### Operational Resilience

- [ ] Service-to-service calls have timeout budgets
- [ ] Retry policies defined (max retries, backoff)
- [ ] Circuit breakers configured (failure threshold, half-open window)
- [ ] Fallback behavior defined for each dependency
- [ ] Errors map to STEP 4.4 categories (TransientFailure)

### Teacher/Mentor Dashboard

- [ ] Queue is authorization boundary (no bypass)
- [ ] RequestId access only (no direct learnerId/submissionId)
- [ ] Rate limits stricter than learner (100/min)
- [ ] Audit logging mandatory for all accesses
- [ ] PII redactions enforced (no email, no passwordHash, no raw answers)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Security guardrails defined for MVP  
**Related Documents**: 
- `docs/architecture/authz-matrix.md` (STEP 8B - Authorization rules)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Error categories)
- `docs/architecture/audit-logging-spec.md` (STEP 9B - Audit logging)
- `docs/architecture/privacy-retention-policy.md` (STEP 9C - Privacy policy)
