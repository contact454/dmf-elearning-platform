# Teacher / Mentor Workflow & Review Queue (Quy trình Giáo viên / Mentor & Hàng đợi Đánh giá)

## Overview

This document describes the teacher/mentor review workflow for EvidenceItem. The system transforms evidence from "system data" into **actual work** for teachers/mentors with review queues, SLA, and status tracking.

**Key Principle**: Certain evidence types require human review before being considered valid for progress enforcement.

---

## Evidence Review Domain

### EvidenceReview Entity

**Status**: `pending` | `approved` | `rejected` | `expired`

**Fields**:
- `reviewId`: Unique review ID
- `evidenceId`: Reference to evidence being reviewed
- `reviewerId`: Teacher/mentor who claimed/reviewed (optional until claimed)
- `reviewerRole`: `teacher` | `mentor`
- `status`: Current review status
- `comment`: Optional review comment
- `createdAt`: When review was created
- `reviewedAt`: When review was completed
- `expiresAt`: SLA expiration date
- Context: `userId`, `lessonId`, `courseId`, `evidenceType`

---

## Review Queue Generation

### Auto-Create Review

**Trigger**: When `evidence.created` event is emitted for evidence types that require review.

**Evidence Types Requiring Review**:
- `speaking` → Auto-create review
- `writing` → Auto-create review
- `teacher_validation` → Auto-create review

**Review Assignment**:
- `reviewerRole`: Determined by evidence type (default: `teacher`)
- `reviewerId`: `null` initially (pull-based, not push)
- `status`: `pending`
- `expiresAt`: Calculated from `createdAt` + SLA hours (default: 72 hours)

**Implementation**: `setupReviewCreationConsumer()` listens to `evidence.created` and creates reviews automatically.

---

## Review Commands

### 1. Claim Review (`evidence.review.claim`)

**Purpose**: Teacher/mentor claims a review from the queue.

**Authorization**: `teacher` or `mentor` role required.

**Behavior**:
- Sets `reviewerId` to claiming user
- Keeps status as `pending` (not yet reviewed)
- Prevents other reviewers from claiming

**Endpoint**: `POST /api/evidence/reviews/:reviewId/claim`

**Request**:
```json
{
  "reviewerRole": "teacher"
}
```

**Response**:
```json
{
  "review": {
    "reviewId": "rev-...",
    "evidenceId": "evd-...",
    "status": "pending",
    "reviewerId": "teacher-123"
  }
}
```

### 2. Approve Review (`evidence.review.approve`)

**Purpose**: Teacher/mentor approves evidence.

**Authorization**: Must be claimed by the reviewer (ownership check).

**Behavior**:
- Sets status to `approved`
- Sets `reviewedAt` timestamp
- Emits `evidence.review.approved` event
- Evidence becomes valid for enforcement

**Endpoint**: `POST /api/evidence/reviews/:reviewId/approve`

**Request**:
```json
{
  "comment": "Good work!"
}
```

**Response**:
```json
{
  "review": {
    "reviewId": "rev-...",
    "evidenceId": "evd-...",
    "status": "approved"
  }
}
```

### 3. Reject Review (`evidence.review.reject`)

**Purpose**: Teacher/mentor rejects evidence.

**Authorization**: Must be claimed by the reviewer (ownership check).

**Behavior**:
- Sets status to `rejected`
- Sets `reviewedAt` timestamp
- Emits `evidence.review.rejected` event
- Evidence is NOT valid for enforcement

**Endpoint**: `POST /api/evidence/reviews/:reviewId/reject`

**Request**:
```json
{
  "comment": "Needs improvement"
}
```

**Response**:
```json
{
  "review": {
    "reviewId": "rev-...",
    "evidenceId": "evd-...",
    "status": "rejected"
  }
}
```

---

## Review State Transitions

### State Machine

```
pending → approved  (via approve command)
pending → rejected  (via reject command)
pending → expired   (via SLA expiration job)
```

**Rules**:
- Once `approved` or `rejected`, cannot change status
- `expired` reviews can be re-claimed (future: auto-create new review)

### Effects

**Approved**:
- Emits `evidence.review.approved` event
- Evidence becomes valid for enforcement
- Metrics: `evidence_review_approved_total` incremented

**Rejected**:
- Emits `evidence.review.rejected` event
- Evidence is NOT valid for enforcement
- Metrics: `evidence_review_rejected_total` incremented

**Expired**:
- Emits `evidence.review.expired` event
- May trigger escalation (B1/B2 milestones)
- Metrics: `evidence_review_expired_total` incremented

---

## SLA & Escalation

### SLA Rules

**Default SLA**: 72 hours (3 days)

**Configuration**: `REVIEW_SLA_HOURS` constant in `packages/evidence/src/config/review-sla.ts`

**Calculation**: `expiresAt = createdAt + SLA_HOURS`

### Expiration Job

**Purpose**: Periodically check for expired reviews and mark them as expired.

**Frequency**: Every hour (configurable)

**Process**:
1. Find all `pending` reviews where `expiresAt < now`
2. Mark as `expired`
3. Emit `evidence.review.expired` event
4. Check if escalation needed (B1/B2 milestones)
5. Emit `evidence.review.escalated` if needed

**Implementation**: `setupSlaExpirationJob()` runs periodically.

### Escalation

**Trigger**: When review expires AND evidence is for B1/B2 milestone.

**Behavior**:
- Emits `evidence.review.escalated` event
- Logs warning
- Metrics: `evidence_review_escalated_total` incremented

**Future**: Escalation can trigger:
- Admin notification
- Auto-assignment to senior reviewer
- Priority queue bump

---

## Integration with Enforcement (Track 9)

### Enforcement Dependency

**Rule**: Evidence types requiring review are only considered **valid** when `review.status === approved`.

**Affected Types**:
- `speaking` → Must have `approved` review
- `writing` → Must have `approved` review
- `teacher_validation` → Must have `approved` review

**Implementation**: `checkProgressAllowed()` checks review status for evidence types that require review.

### Hard Gate Case

**Scenario**: Enforcement = `hard_gate`, evidence required but review is `pending`/`rejected`/`expired`.

**Behavior**:
- Block progress
- Return error: `EVIDENCE_REQUIRED`
- Details include missing evidence and review status

**Example Error**:
```json
{
  "error": {
    "code": "EVIDENCE_REQUIRED",
    "category": "Forbidden",
    "message": "Missing required learning evidence",
    "details": {
      "missingEvidence": [
        {
          "type": "speaking",
          "minCount": 1
        }
      ],
      "reviewStatus": "pending"
    }
  }
}
```

---

## Review Queue Queries

### Get Review Queue

**Endpoint**: `GET /api/evidence/reviews?status=pending&reviewerRole=teacher`

**Query Parameters**:
- `status`: Filter by status (default: `pending`)
- `reviewerRole`: Filter by reviewer role (`teacher` | `mentor`)
- `courseId`: Filter by course
- `lessonId`: Filter by lesson

**Response**:
```json
{
  "reviews": [
    {
      "reviewId": "rev-...",
      "evidenceId": "evd-...",
      "evidenceType": "speaking",
      "learnerId": "user-123",
      "lessonId": "lesson-456",
      "courseId": "course-789",
      "submittedAt": "2024-01-20T10:00:00Z",
      "expiresAt": "2024-01-23T10:00:00Z",
      "reviewerRole": "teacher",
      "status": "pending",
      "claimedBy": null
    }
  ],
  "count": 1
}
```

### Teacher Dashboard Input

**Use Case**: Display review queue in teacher dashboard.

**Data Returned**:
- `reviewId`: For claiming/reviewing
- `evidenceType`: Type of evidence to review
- `learnerId`: Who submitted
- `lessonId`: Context
- `submittedAt`: When evidence was created
- `expiresAt`: SLA deadline
- `status`: Current review status
- `claimedBy`: Who claimed (if any)

---

## Audit & Metrics

### Audit Log

All review actions are audited:

- `evidence.review.claim` → Logged with `reviewerId`, `reviewId`
- `evidence.review.approve` → Logged with `reviewerId`, `reviewId`
- `evidence.review.reject` → Logged with `reviewerId`, `reviewId`
- `evidence.review.expire` → Logged with `system`, `reviewId`
- `evidence.review.escalate` → Logged with `system`, `reviewId`

**Audit Fields**: `commandName`, `userId`, `requestId`, `correlationId` (no PII)

### Metrics

**Ops Metrics** (exposed via `/metrics`):

- `evidence_review_pending_total{service}` - Counter for pending reviews
- `evidence_review_approved_total{service}` - Counter for approved reviews
- `evidence_review_rejected_total{service}` - Counter for rejected reviews
- `evidence_review_expired_total{service}` - Counter for expired reviews
- `evidence_review_escalated_total{service}` - Counter for escalated reviews

---

## Teacher Workflow

### Typical Flow

1. **Evidence Created**: Learner submits speaking/writing evidence
2. **Review Created**: System auto-creates review (pending)
3. **Teacher Views Queue**: GET `/api/evidence/reviews?status=pending&reviewerRole=teacher`
4. **Teacher Claims Review**: POST `/api/evidence/reviews/:reviewId/claim`
5. **Teacher Reviews**: Views evidence, evaluates quality
6. **Teacher Approves/Rejects**: POST `/api/evidence/reviews/:reviewId/approve` or `/reject`
7. **Review Complete**: Status updated, event emitted, enforcement updated

### SLA & Responsibility

**SLA**: 72 hours (3 days) to review

**Responsibility**:
- Teacher/mentor must claim and review within SLA
- Expired reviews trigger escalation
- B1/B2 milestones have higher priority

**Case: Teacher Overload**

**Scenario**: Too many pending reviews, SLA breaches.

**Handling**:
- Escalation events emitted
- Metrics track SLA breaches
- Future: Auto-assignment, priority queue, load balancing

---

## Impact on Learning Progress

### Without Approved Review

**Soft Gate**:
- Progress allowed
- Warning: "Evidence pending review"
- Event: `evidence.soft_gate_triggered`

**Hard Gate**:
- Progress blocked
- Error: `EVIDENCE_REQUIRED`
- Must wait for review approval

### With Approved Review

**Enforcement**:
- Evidence counts as valid
- Progress allowed (if other requirements met)
- No warnings

---

## Guardrails

### ✅ What's Implemented

- Auto-create reviews for required evidence types
- Pull-based review assignment (claim model)
- Review state machine (pending → approved/rejected/expired)
- SLA expiration job
- Enforcement integration (checks review status)
- Review queue queries
- Full audit trail

### ❌ What's NOT Implemented

- UI for review queue (backend only)
- Hardcoded reviewer assignment (pull-based only)
- Blocking evidence submission (reviews created after submission)
- Advanced escalation (basic escalation only)

---

## Usage Examples

### Get Pending Reviews

```bash
curl "http://localhost:3011/api/evidence/reviews?status=pending&reviewerRole=teacher"
```

### Claim Review

```bash
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/claim \
  -H "Content-Type: application/json" \
  -d '{"reviewerRole": "teacher"}'
```

### Approve Review

```bash
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/approve \
  -H "Content-Type: application/json" \
  -d '{"comment": "Excellent work!"}'
```

### Reject Review

```bash
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/reject \
  -H "Content-Type: application/json" \
  -d '{"comment": "Needs improvement"}'
```

---

## Summary

Teacher/Mentor Workflow provides:

1. **Review Queue**: Auto-created reviews for evidence requiring human validation
2. **Pull Model**: Teachers/mentors claim reviews (not push-assigned)
3. **SLA Tracking**: 72-hour SLA with expiration handling
4. **State Machine**: Clear state transitions (pending → approved/rejected/expired)
5. **Enforcement Integration**: Reviews affect evidence validity for progress enforcement
6. **Full Observability**: Events, metrics, audit logs

**Phase 2** will add:
- UI for review queue
- Advanced escalation (admin notifications, auto-assignment)
- Review analytics dashboard
- Load balancing for teacher workload
- Priority queue (B1/B2 milestones)
