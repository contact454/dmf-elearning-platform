# Track 10: Teacher / Mentor Workflow & Review Queue — Summary

## ✅ Completed

### 1. EvidenceReview Domain (`packages/evidence/src/domain/`)

- **EvidenceReview Entity** (`evidence-review.ts`)
  - Status: `pending`, `approved`, `rejected`, `expired`
  - Fields: `reviewId`, `evidenceId`, `reviewerId`, `reviewerRole`, `status`, `comment`, timestamps
  - ReviewQueueItem: Read model for queue display

- **Review Registry** (`review-registry.ts`)
  - In-memory review store
  - Queue management with filtering
  - Methods: `createReview()`, `updateReviewStatus()`, `getReviewQueue()`, `getExpiredReviews()`

### 2. Review Queue Generation (`services/evidence-service/src/consumers/`)

- **Auto-Create Review** (`review-creation.consumer.ts`)
  - Listens to `evidence.created` event
  - Auto-creates reviews for: `speaking`, `writing`, `teacher_validation`
  - Pull-based assignment (reviewerId = null initially)
  - Sets expiration date (SLA: 72 hours)

### 3. Review Commands (`packages/contracts/src/commands/evidence.ts`)

Added 3 review commands (IDs-only):

- `evidence.review.claim` - Claim review from queue
- `evidence.review.approve` - Approve evidence
- `evidence.review.reject` - Reject evidence

All commands registered in `commandRegistry`.

### 4. Review State Machine (`services/evidence-service/src/http/review-commands.route.ts`)

**State Transitions**:
- `pending` → `approved` (via approve command)
- `pending` → `rejected` (via reject command)
- `pending` → `expired` (via SLA expiration job)

**Endpoints**:
- `POST /api/evidence/reviews/:reviewId/claim` - Claim review
- `POST /api/evidence/reviews/:reviewId/approve` - Approve review
- `POST /api/evidence/reviews/:reviewId/reject` - Reject review

### 5. SLA & Expiration Job (`services/evidence-service/src/jobs/sla-expiration.job.ts`)

- **SLA Configuration**: 72 hours (3 days) default
- **Expiration Job**: Runs every hour, checks for expired reviews
- **Process**: Mark as expired → Emit event → Check escalation → Emit escalation if needed
- **Escalation**: Emits `evidence.review.escalated` for B1/B2 milestones (future: all expired)

### 6. Integration with Enforcement (`packages/evidence/src/enforcement/evidence-enforcer.ts`)

**Enhancement**: `checkProgressAllowed()` now checks review status for evidence types requiring review.

**Logic**:
- For `speaking`, `writing`, `teacher_validation`: Only count evidence with `approved` review
- If review is `pending`/`rejected`/`expired`: Evidence not valid for enforcement

### 7. Review Queue Queries (`services/evidence-service/src/http/review-queue.route.ts`)

**Endpoint**: `GET /api/evidence/reviews?status=pending&reviewerRole=teacher`

**Filters**:
- `status`: Filter by status (default: `pending`)
- `reviewerRole`: Filter by role (`teacher` | `mentor`)
- `courseId`: Filter by course
- `lessonId`: Filter by lesson

**Response**: Array of `ReviewQueueItem` with all context needed for teacher dashboard.

### 8. Review Events (`packages/contracts/src/events/evidence.ts`)

Added 4 review events (IDs-only):

- `evidence.review.approved` - Review approved
- `evidence.review.rejected` - Review rejected
- `evidence.review.expired` - Review expired (SLA breach)
- `evidence.review.escalated` - Review escalated (B1/B2 milestone)

All events registered in `eventRegistry`.

### 9. Audit & Metrics Integration

**Audit Logging**:
- All review actions logged: `claim`, `approve`, `reject`, `expire`, `escalate`

**Metrics**:
- `evidence_review_pending_total{service}` - Counter for pending reviews
- `evidence_review_approved_total{service}` - Counter for approved reviews
- `evidence_review_rejected_total{service}` - Counter for rejected reviews
- `evidence_review_expired_total{service}` - Counter for expired reviews
- `evidence_review_escalated_total{service}` - Counter for escalated reviews

### 10. Documentation

- `docs/evidence/teacher-mentor-workflow.md` - Complete workflow documentation
- `docs/implementation/TRACK-10-REVIEW-WORKFLOW-SUMMARY.md` - This summary

## 📋 Files Created/Modified

### New Files
- `packages/evidence/src/domain/evidence-review.ts` - Review entity
- `packages/evidence/src/domain/review-registry.ts` - Review registry
- `packages/evidence/src/config/review-sla.ts` - SLA configuration
- `packages/contracts/src/commands/evidence.ts` - Review commands
- `services/evidence-service/src/consumers/review-creation.consumer.ts` - Auto-create reviews
- `services/evidence-service/src/http/review-commands.route.ts` - Review command endpoints
- `services/evidence-service/src/http/review-queue.route.ts` - Review queue query
- `services/evidence-service/src/jobs/sla-expiration.job.ts` - SLA expiration job

### Modified Files
- `packages/contracts/src/commands/index.ts` - Export evidence commands
- `packages/contracts/src/registries.ts` - Register review commands and events
- `packages/contracts/src/events/evidence.ts` - Added review events
- `packages/evidence/src/enforcement/evidence-enforcer.ts` - Integration with review status
- `packages/evidence/src/index.ts` - Export review domain
- `packages/ops-metrics/src/event-metrics.consumer.ts` - Add review metrics
- `services/evidence-service/src/index.ts` - Setup review consumers and jobs

## 🎯 Usage Examples

### Get Review Queue
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

## ✅ Acceptance Criteria

- ✅ Review entity + state machine
- ✅ Auto-create review when needed
- ✅ Claim / approve / reject work
- ✅ SLA + expiration job
- ✅ Enforcement reads review status
- ✅ E2E still PASS (non-blocking)

## 🚫 What's NOT Implemented (Intentional)

- ❌ UI for review queue (backend only)
- ❌ Hardcoded reviewer assignment (pull-based only)
- ❌ Blocking evidence submission (reviews created after submission)
- ❌ Advanced escalation (basic escalation only)

## 🚀 Next Steps (Phase 2)

1. **Review UI**: Teacher/mentor dashboard for review queue
2. **Advanced Escalation**: Admin notifications, auto-assignment, priority queue
3. **Review Analytics**: Dashboard for review patterns, SLA breaches, teacher workload
4. **Load Balancing**: Distribute reviews across teachers/mentors
5. **Priority Queue**: B1/B2 milestones get higher priority

## 📝 Notes

- Reviews are **auto-created** when evidence requiring review is created
- Assignment is **pull-based** (teachers claim reviews, not push-assigned)
- SLA is **72 hours** (configurable)
- Expiration job runs **every hour** (configurable)
- Enforcement **checks review status** for evidence types requiring review
- All events are **IDs-only** (Track 5 compliant)
- Full **audit trail** for all review actions

## 🔍 Verification

```bash
# Build evidence packages
pnpm --filter @dmf/evidence build
pnpm --filter @dmf/contracts build
pnpm --filter @dmf/evidence-service build

# Start services
pnpm dev

# Test review queue
curl "http://localhost:3011/api/evidence/reviews?status=pending"

# Test claim review
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/claim \
  -H "Content-Type: application/json" \
  -d '{"reviewerRole": "teacher"}'

# Run E2E (should still pass)
pnpm e2e
```
