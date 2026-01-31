# STEP 9B — Audit Logging Spec (MVP)
## Nhat ky kiem toan (Audit log)

**Status**: FROZEN
**Freeze Scope**: STEP 9B — Audit Logging Spec (MVP)
**Freeze Date**: 2026-01-18 (Asia/Ho_Chi_Minh)
**Freeze Notes**:
- Aligns with STEP 8B: 403 role-only, 404 ownership hide-existence, teacher/mentor queue boundary.
- Aligns with STEP 4.4 failure categories for rate limit/retry semantics.
- Respects IDs-only event payload policy (STEP 5C) and log redaction (no PII).

---

This document defines what must be logged, log schema, redaction rules, retention, and alerting for security-relevant actions.

---

## 0. Purpose & Non-Goals

### Purpose

- **Trace security-relevant actions**: Who did what, when, and what was the outcome
- **Compliance**: Meet audit requirements for data access and modifications
- **Security investigation**: Detect abuse, enumeration, unauthorized access
- **Accountability**: Link actions to specific users and sessions

### Non-Goals

- **Analytics events**: User behavior analytics, learning progress metrics (separate system)
- **Performance metrics**: Request latency, throughput (observability system)
- **Debug logs**: Application errors, stack traces (application logs)

---

## 1. What Must Be Logged (Cai gi phai log)

### Auth Events

- **register**: User registration attempt (success/rejected)
- **login**: User login attempt (success/failed)
- **failed_login**: Failed login attempt (for brute-force detection)

### Command Events (All 15 Commands)

- **learning.lesson.start**: Attempt creation (accepted/rejected)
- **learning.lesson.complete**: Attempt completion (accepted/rejected)
- **learning.lesson.abandon**: Attempt abandonment (accepted/rejected)
- **learning.activity.submit**: Submission creation (accepted/rejected)
- **assessment.quiz.start**: Assessment start (accepted/rejected)
- **assessment.quiz.submit**: Assessment submission (accepted/rejected)
- **assessment.placement.take**: Placement test start (accepted/rejected)
- **mentoring.feedback.request**: Feedback request creation (accepted/rejected)
- **mentoring.feedback.publish**: Feedback publication (accepted/rejected)
- **curriculum.course.enroll**: Course enrollment (accepted/rejected)
- **system.profile.modify**: Profile modification (accepted/rejected)
- **system.srs.schedule**: SRS scheduling (system action, always logged)

**Note**: `system.user.register` and `system.user.login` are logged as auth events above.

### Teacher/Mentor Dashboard Reads

- **feedback_queue_view**: Teacher/mentor views feedback queue
- **feedback_request_view**: Teacher/mentor views specific feedback request detail
- **submission_view**: Teacher/mentor views submission detail (for grading)
- **learner_summary_view**: Teacher/mentor views learner summary

**Note**: Learner dashboard reads are NOT logged (not security-relevant in MVP).

### Admin Actions (FUTURE)

- **admin_user_access**: Admin views user data (out of scope for MVP, mark as FUTURE)
- **admin_data_export**: Admin exports data (out of scope for MVP, mark as FUTURE)

---

## 2. Log Schema (Khung log)

### JSON Schema

```typescript
interface AuditLogEntry {
  // Timestamp
  timestamp: string; // ISO 8601 UTC
  
  // Actor
  actor: {
    userId?: string; // UserId (if authenticated)
    role?: 'learner' | 'teacher' | 'mentor' | 'admin' | 'system';
    sessionId?: string; // Session identifier
    ipHash?: string; // SHA-256 hash of IP address (first 16 chars)
    userAgentHash?: string; // SHA-256 hash of User-Agent (first 16 chars)
  };
  
  // Action
  action: string; // e.g., "learning.lesson.start", "feedback_queue_view"
  actionType: 'command' | 'query' | 'auth';
  
  // Target
  target?: {
    entityType: string; // e.g., "Attempt", "Submission", "FeedbackRequest"
    entityId?: string; // Entity ID (if applicable)
  };
  
  // Request context
  request: {
    requestId: string; // Unique request identifier
    correlationId?: string; // Command correlationId (if present)
    method: string; // HTTP method
    path: string; // API path (without query params)
  };
  
  // Result
  result: 'success' | 'rejected' | 'failed';
  failureCategory?: 'ValidationError' | 'NotFound' | 'Forbidden' | 'Conflict' | 'TransientFailure'; // STEP 4.4 category
  failureReason?: string; // Brief reason (no PII, no raw answers)
  
  // Tracing (optional)
  traceId?: string; // Distributed tracing ID
  spanId?: string; // Span ID within trace
}
```

### Field Notes

- **ipHash**: SHA-256 hash of IP address, truncated to first 16 characters (prevents IP enumeration, allows pattern detection)
- **userAgentHash**: SHA-256 hash of User-Agent string, truncated to first 16 characters (prevents fingerprinting, allows pattern detection)
- **failureReason**: Must NOT contain PII, raw answers, or sensitive data (see Redaction Rules)
- **path**: Excludes query parameters to prevent logging sensitive filters (e.g., `?email=user@example.com`)

---

## 3. Redaction Rules (An thong tin)

### Forbidden Fields in Logs

- **passwordHash**: Never log password hashes (even if request fails)
- **raw tokens**: Never log auth tokens, refresh tokens, session tokens
- **full email**: Never log full email addresses (only userId)
- **raw writing text**: Never log full submission text (only submissionId reference)
- **audio binary**: Never log audio file contents (never log audioUrl; use submissionId reference only)
- **quiz answers**: Never log raw quiz answers or assessment responses
- **PII in query params**: Never log query parameters that may contain PII (e.g., `?email=...`)

### Allowed References

- **IDs only**: `userId`, `attemptId`, `submissionId`, `feedbackRequestId`, etc.
- **Hashed identifiers**: `ipHash`, `userAgentHash` (truncated hashes)
- **Action names**: Command names, endpoint paths (without query params)
- **Failure categories**: STEP 4.4 categories (ValidationError, NotFound, etc.)
- **Generic failure reasons**: "Ownership check failed", "Rate limit exceeded" (no entity details)

### Example Log Entries

**Good (Redacted)**:
```json
{
  "timestamp": "2026-01-18T10:30:00Z",
  "actor": {
    "userId": "user-123",
    "role": "learner",
    "ipHash": "a1b2c3d4e5f6g7h8",
    "userAgentHash": "x9y8z7w6v5u4t3"
  },
  "action": "learning.activity.submit",
  "actionType": "command",
  "target": {
    "entityType": "Submission",
    "entityId": "sub-456"
  },
  "request": {
    "requestId": "req-789",
    "correlationId": "corr-abc",
    "method": "POST",
    "path": "/api/learning/activity/submit"
  },
  "result": "success"
}
```

**Bad (Contains PII)**:
```json
{
  "failureReason": "User email user@example.com not found", // ❌ Contains email
  "target": {
    "entityId": "sub-456",
    "submissionText": "My answer is..." // ❌ Contains raw text
  }
}
```

---

## 4. Retention & Access (Luu tru & quyen xem)

### Retention Period

- **Audit logs**: 90 days minimum (retained for security investigation and compliance)
- **Archival**: After 90 days, logs may be archived to cold storage (optional, FUTURE)
- **Deletion**: Logs deleted after retention period (no manual deletion in MVP)

### Access Control

- **Who can access**: 
  - `admin` role only (if admin dashboard exists, FUTURE)
  - `system` role (automated analysis, alerting)
- **Access method**: 
  - Admin dashboard query interface (FUTURE)
  - System service API (for alerting/analysis)
- **Authentication**: Admin must authenticate with `admin` role
- **Authorization**: Admin can only read logs (no modification/deletion via UI)

### Export Policy (FUTURE)

- **Status**: FUTURE (not in MVP)
- **Rationale**: Export functionality requires additional security controls (encryption, access logging)
- **Note**: MVP focuses on log generation and retention; export deferred to post-MVP

---

## 5. Integrity (Chong sua log)

### Append-Only Storage

- **Rule**: Audit logs are append-only (no updates, no deletes)
- **Storage**: Immutable log storage (e.g., append-only file, WAL, or immutable database table)
- **Enforcement**: Database constraints prevent UPDATE/DELETE on audit log table

### Hash-Chain (FUTURE)

- **Status**: FUTURE (not in MVP)
- **Rationale**: Hash-chain requires additional infrastructure and complexity
- **Note**: MVP relies on append-only storage and access controls; hash-chain deferred to post-MVP

### Alert on Tampering

- **Detection**: Monitor for unexpected log gaps, timestamp anomalies, or access violations
- **Alert**: If tampering suspected, alert security team immediately
- **Investigation**: Log access itself is logged (meta-audit)

---

## 6. Alerting Triggers (Canh bao)

### Repeated Failed Login

- **Trigger**: 5 failed login attempts from same `ipHash` within 15 minutes
- **Alert**: "Potential brute-force attack detected: {ipHash}, {userId if known}"
- **Action**: Rate limit login endpoint for that IP (temporary block)

### High 404 Rate on Teacher Endpoints

- **Trigger**: 20+ `404 NotFound` responses on `/api/teacher/*` endpoints from same `userId` within 5 minutes
- **Alert**: "Potential enumeration attack on teacher endpoints: {userId}, {role}"
- **Action**: Review user access, consider temporary rate limit increase

### Spike in Feedback Requests

- **Trigger**: 10+ `mentoring.feedback.request` commands from same `userId` within 1 hour
- **Alert**: "Potential spam feedback requests: {userId}"
- **Action**: Review user behavior, consider rate limit enforcement

### Upload Abuse

- **Trigger**: 10+ failed uploads (size/duration/MIME type violations) from same `userId` within 1 hour
- **Alert**: "Potential upload abuse: {userId}"
- **Action**: Review upload patterns, consider temporary upload block

### Unauthorized Access Attempts

- **Trigger**: 5+ `403 Forbidden` or `404 NotFound` responses on sensitive endpoints from same `userId` within 10 minutes
- **Alert**: "Potential unauthorized access attempts: {userId}, {role}, {endpoints}"
- **Action**: Review user permissions, consider account review

### System Command Abuse

- **Trigger**: 10+ `system.srs.schedule` or `curriculum.unit.access` commands from non-system actor
- **Alert**: "System command called by non-system actor: {userId}, {role}"
- **Action**: Immediate security review (system commands should be internal only)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Audit logging spec defined for MVP  
**Related Documents**: 
- `docs/architecture/security-guardrails.md` (STEP 9A - Security controls)
- `docs/architecture/authz-matrix.md` (STEP 8B - Authorization rules)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Error categories)
