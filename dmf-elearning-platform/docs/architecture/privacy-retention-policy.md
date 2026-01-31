# STEP 9C — Privacy & Retention Policy (MVP)
## Chinh sach rieng tu & luu tru

**Status**: FROZEN
**Freeze Scope**: STEP 9C — Privacy & Retention Policy (MVP)
**Freeze Date**: 2026-01-18 (Asia/Ho_Chi_Minh)
**Freeze Notes**:
- Aligns with STEP 8B: 403 role-only, 404 ownership hide-existence, teacher/mentor queue boundary.
- Aligns with STEP 4.4 failure categories for rate limit/retry semantics.
- Respects IDs-only event payload policy (STEP 5C) and log redaction (no PII).

---

This document defines data classification, retention rules, deletion policies, and PII redaction for the MVP.

---

## 0. Principles

- **Data minimization (toi thieu du lieu)**: Collect and store only data necessary for MVP functionality
- **Purpose limitation (dung muc dich)**: Data used only for stated purpose (learning, feedback, progress tracking)
- **Retention limits (gioi han luu tru)**: Data retained only for necessary duration, then deleted
- **PII separation (tach PII)**: PII stored separately from learning data where possible
- **IDs-only event payloads policy reinforced**: Event payloads contain IDs only; non-ID fields fetched via read-only APIs

---

## 1. Data Classification (Phan loai du lieu)

| Data Type | PII? | Stored Where (Service/State) | Retention | Deletion Trigger |
|-----------|------|------------------------------|-----------|------------------|
| Email | Yes | `onboarding-service` / `User` | Until account deletion | User deletion request |
| Name (firstName, lastName) | Yes | `onboarding-service` / `User`, `LearnerProfile` | Until account deletion | User deletion request |
| Phone | Yes | `onboarding-service` / `User` (if collected) | Until account deletion | User deletion request |
| Password hash | Yes (sensitive) | `onboarding-service` / `User` | Until account deletion | User deletion request |
| Session tokens | Yes (sensitive) | `onboarding-service` / `Session` (ephemeral) | 24 hours | Session expiry or logout |
| Submissions text (writing) | No (content) | `practice-service` / `Submission` | 365 days | Automatic after retention |
| Submissions audio (speaking) | No (content) | Storage bucket (via `practice-service`) | 365 days | Automatic after retention |
| Feedback text | No (content) | `mentoring-service` / `Feedback` | 365 days | Automatic after retention |
| Rubric scores | No | `motivation-progress-service` / `MasteryState`, `SkillScore` | 730 days (2 years) | Automatic after retention |
| Readiness cache | No (computed) | `assessment-service` / cache | 90 days TTL | Cache expiry |
| Assessment answers | No (content) | `assessment-service` / `Assessment` | 365 days | Automatic after retention |
| Audit logs | Partial (userId, ipHash) | Audit log storage | 90 days | Automatic after retention |
| Progress state | No | `progress-service` / `ProgressState` | Until account deletion | User deletion request |
| Mastery state | No | `motivation-progress-service` / `MasteryState` | Until account deletion | User deletion request |

**Notes**:
- **PII**: Personally Identifiable Information (email, name, phone, password hash, tokens)
- **Content**: Learning content (submissions, feedback, assessments) is not PII but may contain user-generated content
- **Computed state**: Progress, mastery, readiness are derived from events and may be recomputed

---

## 2. Retention Rules (Quy tac luu tru)

### Sessions

- **Retention**: 24 hours (ephemeral, not persisted)
- **Deletion**: Automatic on session expiry or explicit logout
- **Storage**: In-memory or short-lived cache (not persisted to database)

### Submissions

- **Retention**: 365 days (1 year)
- **Rationale**: Allow learners to review past work and teachers to reference feedback history
- **Deletion**: Automatic batch job runs daily, deletes submissions older than 365 days
- **Cascade**: Deletion of submission does NOT delete associated Feedback (feedback retained separately)

### Audio Files

- **Retention**: 365 days (1 year)
- **Rationale**: Same as submissions (allow review and feedback reference)
- **Deletion**: Automatic batch job runs daily, deletes audio files older than 365 days from storage bucket
- **Cascade**: Deletion of audio file does NOT delete Submission entity (Submission marked as "audio deleted")

### Feedback

- **Retention**: 365 days (1 year)
- **Rationale**: Allow learners and teachers to reference feedback history
- **Deletion**: Automatic batch job runs daily, deletes feedback older than 365 days
- **Cascade**: Deletion of feedback does NOT delete Submission or FeedbackRequest

### Assessments

- **Retention**: 365 days (1 year)
- **Rationale**: Allow learners to review assessment history
- **Deletion**: Automatic batch job runs daily, deletes assessments older than 365 days
- **Cascade**: Deletion of assessment does NOT delete derived ReadinessState (readiness may be recomputed from events)

### Rubric Scores / Mastery State

- **Retention**: 730 days (2 years)
- **Rationale**: Longer retention for learning analytics and progress tracking
- **Deletion**: Automatic batch job runs daily, deletes mastery/skill scores older than 730 days
- **Note**: MasteryState is derived from events; deletion of mastery state does not delete source events (events retained for audit)

### Readiness Cache

- **Retention**: 90 days TTL (time-to-live)
- **Rationale**: Readiness is computed; cache is performance optimization, not source of truth
- **Deletion**: Automatic cache expiry (TTL-based)
- **Recomputation**: Readiness can be recomputed from events if cache expires

### Audit Logs

- **Retention**: 90 days minimum
- **Rationale**: Security investigation and compliance requirements
- **Deletion**: Automatic batch job runs daily, deletes audit logs older than 90 days
- **Note**: Audit logs are append-only; deletion is operational cleanup, not user-initiated

### User Account Data (PII)

- **Retention**: Until account deletion (no automatic deletion)
- **Deletion**: User-initiated account deletion request (see Deletion & Export section)
- **Cascade**: Account deletion triggers cascading deletion of all user data (see below)

---

## 3. Deletion & Export (Xoa du lieu / xuat du lieu)

### Deletion Support (MVP)

- **Status**: Partial support (user account deletion supported; individual data deletion FUTURE)
- **User account deletion**: 
  - User can request account deletion via `system.profile.delete` command (FUTURE) or support ticket (MVP)
  - Support ticket triggers manual deletion process (MVP)
  - Automated deletion command (FUTURE)

### User Request Handling Flow (High Level)

1. **Request**: User submits account deletion request (via support ticket in MVP)
2. **Verification**: Support verifies user identity (email confirmation, security questions)
3. **Deletion**: Support triggers account deletion process:
   - Delete `User` entity (onboarding-service)
   - Delete `LearnerProfile` entity (onboarding-service)
   - Delete all `Session` entities for user (onboarding-service)
   - Delete all `Attempt` entities for user (practice-service)
   - Delete all `Submission` entities for user (practice-service)
   - Delete all audio files for user submissions (storage bucket)
   - Delete all `Assessment` entities for user (assessment-service)
   - Delete all `FeedbackRequest` entities for user (mentoring-service)
   - Delete all `Feedback` entities where user is requester (mentoring-service)
   - Delete all `Enrollment` entities for user (curriculum-service)
   - Delete `ProgressState` for user (progress-service)
   - Delete `MasteryState` for user (motivation-progress-service)
   - Delete `ReadinessState` cache for user (assessment-service)
   - Delete audit logs for user (audit log storage) — **Note**: Audit logs may be retained for compliance; anonymize instead of delete
4. **Confirmation**: User receives confirmation email (if email still accessible)

**Note**: Cascading deletion is operational batch job (not event-driven in MVP). Batch job runs within 7 days of deletion request.

### Export (FUTURE)

- **Status**: FUTURE (not in MVP)
- **Rationale**: Export functionality requires additional security controls (encryption, access logging, format standardization)
- **Note**: MVP focuses on deletion; export deferred to post-MVP

### Cascading Delete Notes

- **Do not invent new events**: Deletion is operational batch job, not event-driven
- **Batch job approach**: 
  - Batch job reads deletion request
  - Batch job queries all services for user data
  - Batch job deletes data from each service (via service APIs or direct DB access)
  - Batch job logs deletion progress
- **Idempotency**: Batch job is idempotent (can be rerun if partial failure)

---

## 4. Read Model Redactions (An thong tin tren dashboard)

### Learner Dashboard

- **Visible**: Own progress, mastery, readiness, attempts, submissions, feedback
- **Redacted**: 
  - `passwordHash` (never)
  - `auth tokens` (never)
  - Other learners' data (never)

### Teacher/Mentor Dashboard

- **Visible**: 
  - `firstName`, `lastName` (for identification)
  - `targetLanguage` (for context)
  - `audioUrl`, `text`, `answer` content (for grading, only for submissions in queue)
  - Aggregated progress/mastery (no raw submission data)
- **Redacted**: 
  - `email` (never — only `userId` shown)
  - `phone` (never)
  - `passwordHash` (never)
  - `auth tokens` (never)
  - `raw quiz answers payloads` (never)
  - Other learners' data (only accessible via FeedbackRequest linkage)

**Enforcement**: Redactions enforced at read model projection level (see `read-model-inventory.md` STEP 6A) and query API level (see `query-api-contracts.md` STEP 6B).

---

## 5. Security Notes (Ghi chu bao mat)

### Encryption at Rest

- **Audio files**: Encrypted at rest in storage bucket (AES-256)
- **Database**: Encrypted at rest (database-level encryption, TDE if supported)
- **Audit logs**: Encrypted at rest (append-only encrypted storage)

### TLS in Transit

- **Rule**: All API endpoints require TLS 1.2+ (HTTPS only)
- **Enforcement**: API gateway rejects non-HTTPS requests
- **Certificate**: Valid SSL/TLS certificate (Let's Encrypt or equivalent)

### Secrets Management

- **Rule**: No hardcoded secrets in code or configuration files
- **Storage**: Secrets stored in environment variables or secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault)
- **Rotation**: Secrets rotated regularly (90 days for API keys, 365 days for certificates)
- **Access**: Only services that need secrets can access them (least privilege)

### PII in Logs

- **Rule**: No PII in application logs (see `audit-logging-spec.md` for audit log redaction)
- **Enforcement**: Logging middleware redacts PII before writing to logs
- **Redacted fields**: Email, phone, password hash, tokens, raw submission text

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Privacy & retention policy defined for MVP  
**Related Documents**: 
- `docs/architecture/security-guardrails.md` (STEP 9A - Security controls)
- `docs/architecture/audit-logging-spec.md` (STEP 9B - Audit logging)
- `docs/architecture/read-model-inventory.md` (STEP 6A - Read models)
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query APIs)
