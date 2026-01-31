# Evidence System (Hệ thống Bằng chứng)

## Overview

The Evidence System is DMF's foundation for **anti-"virtual learning"** — ensuring that learning progress is only recognized when there is **real proof**.

**Key Principle**: Every learning milestone requires evidence. No evidence = no recognition.

---

## Why DMF Needs EvidenceItem

### Problem: "Virtual Learning"

In online learning platforms, it's easy for learners to:
- Click through lessons without actually learning
- Complete activities without understanding
- Progress through courses without real engagement
- "Game the system" to get certificates without real learning

### Solution: Evidence-Based Learning

DMF's Evidence System ensures:
- **Attendance**: Proof that learner actually attended the lesson
- **Activity Submission**: Proof that learner completed activities
- **Teacher Validation**: Proof that teacher reviewed and validated work
- **Mentor Validation**: Proof that mentor provided feedback
- **Speaking/Writing Evidence**: Proof of actual language production

**No evidence = No recognition** (enforced in Phase 2).

---

## Evidence Types

### 1. Attendance (`attendance`)
- **Source**: System (automatic)
- **Created when**: Lesson started or completed
- **Purpose**: Prove learner was present

### 2. Activity Submission (`activity_submission`)
- **Source**: System (automatic)
- **Created when**: Activity submitted
- **Purpose**: Prove learner completed activities

### 3. Teacher Validation (`teacher_validation`)
- **Source**: Teacher (manual)
- **Created when**: Teacher validates learner's work
- **Purpose**: Prove teacher reviewed and approved work

### 4. Mentor Validation (`mentor_validation`)
- **Source**: Mentor (manual)
- **Created when**: Mentor provides feedback
- **Purpose**: Prove mentor reviewed and provided guidance

### 5. Speaking (`speaking`)
- **Source**: System or Teacher
- **Created when**: Speaking activity completed or teacher records speaking
- **Purpose**: Prove learner produced spoken language

### 6. Writing (`writing`)
- **Source**: System or Teacher
- **Created when**: Writing activity completed or teacher records writing
- **Purpose**: Prove learner produced written language

---

## EvidenceItem Structure

```typescript
interface EvidenceItem {
  evidenceId: string;        // Unique ID
  type: EvidenceType;        // One of 6 types above
  userId: string;           // Learner ID
  lessonId?: string;        // Optional lesson context
  courseId?: string;        // Optional course context
  attemptId?: string;       // Optional attempt context
  source: 'system' | 'teacher' | 'mentor';
  referenceIds: string[];   // fileId, videoId, submissionId, etc.
  createdAt: string;         // ISO 8601 timestamp
}
```

**Key Properties**:
- **Immutable**: Once created, cannot be modified
- **Append-only**: New evidence is added, never deleted (except rare revocation)
- **IDs-only**: No PII, no scores, only proof of existence

---

## Evidence Flow

### Automatic Evidence (System)

| Learning Event | Evidence Created |
|----------------|------------------|
| `learning.lesson.started` | `attendance` (system) |
| `learning.submission.created` | `activity_submission` (system) |
| `learning.lesson.completed` | `attendance` (system, completion marker) |

**Implementation**: Passive event listeners in `evidence-service` consume learning events and create evidence automatically.

### Manual Evidence (Teacher/Mentor)

**Endpoints**:
- `POST /api/evidence/teacher/validate`
- `POST /api/evidence/mentor/validate`

**Request Body**:
```json
{
  "userId": "user-123",
  "lessonId": "lesson-456",
  "courseId": "course-789",
  "attemptId": "attempt-abc",
  "referenceIds": ["file-123", "video-456"]
}
```

**Response**:
```json
{
  "evidence": {
    "evidenceId": "evd-...",
    "type": "teacher_validation",
    "userId": "user-123",
    "lessonId": "lesson-456"
  }
}
```

---

## Evidence Summary (Read Model)

**Endpoint**: `GET /api/evidence/summary?userId=user-123&lessonId=lesson-456`

**Response**:
```json
{
  "summary": {
    "userId": "user-123",
    "lessonId": "lesson-456",
    "courseId": "course-789",
    "evidenceCounts": {
      "attendance": 2,
      "speaking": 0,
      "writing": 0,
      "activity_submission": 1,
      "teacher_validation": 0,
      "mentor_validation": 0
    },
    "totalEvidence": 3,
    "lastEvidenceAt": "2024-01-20T10:30:00Z"
  }
}
```

**Use Cases**:
- Display evidence counts in learner dashboard
- Check if lesson has required evidence
- Audit trail for learning progress

---

## Anti-Virtual Learning Rules (DRAFT ONLY)

**Location**: `packages/evidence/src/rules/anti-virtual.rules.ts`

**⚠️ Important**: These rules are **NOT enforced yet**. They are defined but do NOT block progress.

### Rule 1: Lesson Completion Evidence

**Check**: `checkLessonCompletionEvidence(summary)`

**Violations**:
- Lesson completed but no attendance evidence
- No activity submissions

**Status**: DRAFT - Not enforced

### Rule 2: Speaking Validation

**Check**: `checkSpeakingValidationEvidence(summary, requiredLevel)`

**Violations**:
- B1+ speaking level but no teacher validation

**Status**: DRAFT - Not enforced

### Rule 3: Recent Evidence

**Check**: `checkRecentEvidence(summary, daysThreshold)`

**Violations**:
- No evidence in the last N days (default: 7)

**Status**: DRAFT - Not enforced

### Usage Example

```typescript
import { checkAllRules } from '@dmf/evidence/rules/anti-virtual.rules';

const summary = getEvidenceSummary(userId, lessonId);
const violations = checkAllRules(summary, {
  requiredLevel: 'B1',
  daysThreshold: 7
});

if (violations.violated) {
  console.log('Violations:', violations.reasons);
  // In Phase 2: Block progress or show warning
}
```

---

## Evidence Events

All evidence actions emit events (IDs-only):

### 1. `evidence.created`
- Emitted when evidence is created (automatic or manual)
- Payload: `evidenceId`, `type`, `userId`, `lessonId`, `source`

### 2. `evidence.validated`
- Emitted when evidence is manually validated (future)
- Payload: `evidenceId`, `validatorUserId`, `validatorRole`

### 3. `evidence.revoked`
- Emitted when evidence is revoked (rare, admin only)
- Payload: `evidenceId`, `revokedBy`, `reason`

**Contract Compliance**: All events follow Track 5 contract lock - IDs-only payloads, no PII.

---

## Evidence Service

**Location**: `services/evidence-service`

**Port**: `3011`

**Endpoints**:
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/evidence/summary?userId=&lessonId=` - Evidence summary
- `POST /api/evidence/teacher/validate` - Teacher validation
- `POST /api/evidence/mentor/validate` - Mentor validation

**Features**:
- Passive event listeners (non-blocking)
- In-memory evidence registry
- Audit logging for all evidence actions
- Metrics: `evidence_created_total{type}`, `evidence_validation_total`

---

## What's NOT Implemented (Intentional)

### ❌ Evidence Enforcement

Evidence rules are **NOT enforced** into learning flow:

- Learners can complete lessons without evidence
- Progress is NOT blocked by missing evidence
- Certificates are NOT gated by evidence

**Reason**: Enforcement will be added in Phase 2 with policy engine integration.

### ❌ Evidence Scoring

Evidence does **NOT** contain scores:

- Evidence only proves existence
- Scores are separate (assessment system)
- Evidence + Scores = Complete picture

**Reason**: Separation of concerns - evidence proves existence, assessment measures quality.

### ❌ Evidence UI

No evidence UI is built:

- APIs are ready
- Data structures are ready
- But no frontend dashboard

**Reason**: UI will be built in Phase 2.

---

## Phase 2 Roadmap (Enforcement)

1. **Policy Integration**: Connect evidence rules to policy engine
2. **Progress Blocking**: Block lesson completion if required evidence missing
3. **Certificate Gating**: Require evidence for certificate issuance
4. **Evidence Dashboard**: UI for learners/teachers to view evidence
5. **Evidence Analytics**: Track evidence patterns and violations
6. **Automated Validation**: AI-assisted evidence validation (speaking/writing)

---

## Usage Examples

### Check Evidence Summary

```bash
curl "http://localhost:3011/api/evidence/summary?userId=user-123&lessonId=lesson-456"
```

### Teacher Validation

```bash
curl -X POST http://localhost:3011/api/evidence/teacher/validate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-456",
    "courseId": "course-789",
    "referenceIds": ["file-123"]
  }'
```

### Check Anti-Virtual Rules (Draft)

```typescript
import { getEvidenceRegistry, checkAllRules } from '@dmf/evidence';

const registry = getEvidenceRegistry();
const summary = registry.getEvidenceSummary('user-123', 'lesson-456');
const violations = checkAllRules(summary, { requiredLevel: 'B1' });

if (violations.violated) {
  console.log('Evidence violations:', violations.reasons);
}
```

---

## Architecture Notes

### In-Memory Storage

All evidence is stored in-memory (Map):

- Evidence: `Map<evidenceId, EvidenceItem>`
- User index: `Map<userId, evidenceId[]>`
- Lesson index: `Map<userId:lessonId, evidenceId[]>`

**Production**: Replace with database (PostgreSQL/MongoDB) in Phase 2.

### Event-Driven

All evidence creation is event-driven:

- Learning events → Evidence creation (automatic)
- Manual validation → Evidence creation (manual)
- Evidence events → Metrics, audit, analytics

### Non-Blocking

Evidence system is **non-blocking**:

- Does NOT modify existing learning handlers
- Does NOT block lesson completion
- Does NOT interfere with E2E tests

**Phase 2**: Add enforcement hooks that can block progress.

---

## Verification

```bash
# Build evidence packages
pnpm --filter @dmf/evidence build
pnpm --filter @dmf/evidence-service build

# Start services (includes evidence-service on port 3011)
pnpm dev

# Test evidence summary
curl "http://localhost:3011/api/evidence/summary?userId=user-123"

# Test teacher validation
curl -X POST http://localhost:3011/api/evidence/teacher/validate \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","lessonId":"lesson-456"}'

# Check metrics
curl http://localhost:3011/metrics

# Run E2E (should still pass - non-blocking)
pnpm e2e
```

---

## Summary

The Evidence System provides the foundation for anti-"virtual learning" by:

1. **Tracking Evidence**: Automatic and manual evidence creation
2. **Evidence Summary**: Read model for evidence counts
3. **Anti-Virtual Rules**: Draft rules for evidence validation (not enforced)
4. **Event-Driven**: Fully event-driven architecture
5. **Non-Blocking**: Does not interfere with existing learning flow

**Phase 2** will add enforcement, UI, and analytics to complete the anti-virtual learning system.
