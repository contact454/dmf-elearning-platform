# Track 8: EvidenceItem & Anti-Virtual Learning System — Summary

## ✅ Completed

### 1. Evidence Package (`packages/evidence/`)

- **Evidence Types** (`evidence.types.ts`)
  - 6 evidence types: attendance, speaking, writing, activity_submission, teacher_validation, mentor_validation
  - EvidenceItem interface (immutable, append-only, IDs-only)
  - EvidenceSummary read model

- **Evidence Registry** (`evidence.registry.ts`)
  - In-memory storage with user/lesson indexing
  - Append-only (no deletion)
  - Methods: `addEvidence()`, `getEvidenceByUser()`, `getEvidenceByLesson()`, `getEvidenceSummary()`

### 2. Evidence Events (`packages/contracts/src/events/evidence.ts`)

Added 3 evidence events (IDs-only, Track 5 compliant):

- `evidence.created` - Evidence creation (automatic or manual)
- `evidence.validated` - Evidence validation (future)
- `evidence.revoked` - Evidence revocation (rare, admin)

All events registered in `eventRegistry`.

### 3. Evidence Service (`services/evidence-service`)

New service on port **3011**:

**Endpoints**:
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/evidence/summary?userId=&lessonId=` - Evidence summary
- `POST /api/evidence/teacher/validate` - Teacher validation
- `POST /api/evidence/mentor/validate` - Mentor validation

**Features**:
- Passive event listeners (non-blocking)
- Automatic evidence creation from learning events
- Manual validation endpoints
- Audit logging
- Metrics integration

### 4. Learning Event Consumers (`services/evidence-service/src/consumers/`)

**Passive Hooks** (non-blocking, listen-only):

| Learning Event | Evidence Created |
|----------------|------------------|
| `learning.lesson.started` | `attendance` (system) |
| `learning.submission.created` | `activity_submission` (system) |
| `learning.lesson.completed` | `attendance` (system, completion marker) |

**Implementation**: Event listeners consume learning events and create evidence automatically without modifying existing handlers.

### 5. Anti-Virtual Learning Rules (`services/evidence-service/src/rules/`)

**DRAFT ONLY** - Not enforced:

- `checkLessonCompletionEvidence()` - Check if lesson has required evidence
- `checkSpeakingValidationEvidence()` - Check if speaking level has teacher validation
- `checkRecentEvidence()` - Check if progress has recent evidence (within N days)
- `checkAllRules()` - Check all rules at once

**Status**: Rules are defined but do NOT block progress (Phase 2).

### 6. Ops & Audit Integration

**Audit Logging**:
- All evidence creation logged via `AuditLogger`
- Commands: `evidence.create`, `evidence.teacher.validate`, `evidence.mentor.validate`

**Metrics**:
- `evidence_created_total{type}` - Counter by evidence type
- `evidence_validation_total` - Counter for validations
- `evidence_revoked_total` - Counter for revocations

### 7. Documentation

- `docs/evidence/evidence-system.md` - Complete evidence system documentation
- `docs/implementation/TRACK-8-EVIDENCE-SUMMARY.md` - This summary

## 📋 Files Created/Modified

### New Packages
- `packages/evidence/` - Evidence foundations package
- `services/evidence-service/` - Evidence service

### Modified Files
- `packages/contracts/src/events/evidence.ts` - Evidence events (NEW)
- `packages/contracts/src/events/index.ts` - Export evidence events
- `packages/contracts/src/registries.ts` - Register evidence events
- `packages/ops-metrics/src/event-metrics.consumer.ts` - Add evidence event metrics
- `package.json` - Add evidence-service to dev scripts

## 🎯 Usage Examples

### Evidence Summary
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

### Mentor Validation
```bash
curl -X POST http://localhost:3011/api/evidence/mentor/validate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-456",
    "referenceIds": ["video-456"]
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
  // In Phase 2: Block progress or show warning
}
```

## ✅ Acceptance Criteria

- ✅ Evidence service runs (port 3011)
- ✅ Evidence auto-created from learning events
- ✅ Teacher/mentor validation creates evidence
- ✅ Evidence summary query works
- ✅ Ops + metrics OK
- ✅ E2E still PASS (non-blocking)

## 🚫 What's NOT Implemented (Intentional)

- ❌ Evidence enforcement into learning flow (Phase 2)
- ❌ Evidence scoring (evidence only proves existence)
- ❌ Evidence UI (Phase 2)
- ❌ Database storage (in-memory for now)

## 🚀 Next Steps (Phase 2)

1. **Policy Integration**: Connect evidence rules to policy engine
2. **Progress Blocking**: Block lesson completion if required evidence missing
3. **Certificate Gating**: Require evidence for certificate issuance
4. **Evidence Dashboard**: UI for learners/teachers to view evidence
5. **Evidence Analytics**: Track evidence patterns and violations
6. **Automated Validation**: AI-assisted evidence validation (speaking/writing)

## 📝 Notes

- All evidence stored in-memory (can be replaced with DB in production)
- Evidence is NOT enforced (intentional - Phase 2)
- Evidence does NOT contain scores (separation of concerns)
- All events are IDs-only (Track 5 compliant)
- Non-blocking architecture (does not interfere with existing flow)

## 🔍 Verification

```bash
# Build evidence packages
pnpm --filter @dmf/evidence build
pnpm --filter @dmf/evidence-service build

# Start services (includes evidence-service)
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
