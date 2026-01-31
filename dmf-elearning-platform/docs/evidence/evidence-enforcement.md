# Evidence-Driven Progress Enforcement (Enforcement Tiến độ Dựa trên Bằng chứng)

## Overview

This document describes how DMF enforces learning progress based on evidence. The system uses **policy-driven enforcement** with three levels: observe, soft gate, and hard gate.

**Key Principle**: Learning progress is only allowed when required evidence exists.

---

## Enforcement Levels

### 1. Observe (`observe`)
- **Behavior**: Only log violations, never block
- **Use Case**: Monitoring and analytics
- **Default**: No (default is `soft_gate`)

### 2. Soft Gate (`soft_gate`)
- **Behavior**: Allow progress but emit warning events
- **Use Case**: Gradual rollout, user education
- **Default**: **Yes** (system default)

### 3. Hard Gate (`hard_gate`)
- **Behavior**: Block progress, return error
- **Use Case**: Production enforcement, compliance
- **Default**: No (must be explicitly enabled)

---

## Evidence Policies

### Policy Structure

```typescript
interface EvidencePolicy {
  id: string;
  scope: 'lesson' | 'course' | 'attempt';
  action: 'start' | 'complete' | 'unlock_next';
  requiredEvidence: {
    type: EvidenceType;
    minCount: number;
  }[];
  gracePeriodDays?: number;
  description?: string;
}
```

### Default Policies

#### 1. Lesson Start (`lesson_start`)
- **Action**: `start`
- **Required**: `attendance >= 1`
- **Purpose**: Ensure learner actually started the lesson

#### 2. Lesson Complete (`lesson_complete`)
- **Action**: `complete`
- **Required**: 
  - `attendance >= 1`
  - `activity_submission >= 1`
- **Purpose**: Ensure learner completed activities before marking lesson complete

#### 3. B1+ Speaking (`b1_speaking`)
- **Action**: `complete`
- **Required**:
  - `speaking >= 1`
  - `teacher_validation >= 1`
- **Grace Period**: 7 days
- **Purpose**: Ensure B1+ speaking levels have teacher validation

---

## Enforcement Engine

### Check Progress Allowed

**Function**: `checkProgressAllowed(params)`

**Parameters**:
```typescript
{
  userId: string;
  lessonId?: string;
  courseId?: string;
  attemptId?: string;
  action: 'start' | 'complete' | 'unlock_next';
}
```

**Returns**:
```typescript
{
  allowed: boolean;
  level: EnforcementLevel;
  reasons: string[];
  missingEvidence?: RequiredEvidence[];
  policyId?: string;
}
```

### Evaluation Logic

1. Load policy for action + scope
2. Load evidence summary for user/lesson
3. Compare required vs actual evidence
4. Return result based on enforcement level:
   - `observe` → `allowed = true` (log only)
   - `soft_gate` → `allowed = true` (warn)
   - `hard_gate` → `allowed = false` (block)

---

## Integration with Learning Flow

### Hook Points

**Safe Hooks** (pre-check, non-blocking by default):

| Command | Enforcement Check |
|---------|-------------------|
| `learning.lesson.completed` | Evidence check before completion |

**⚠️ Important**: 
- Hooks are **non-blocking** by default (soft_gate)
- Only block when `hard_gate` is enabled
- Do NOT block `learning.activity.submit` (explicitly excluded)

### Behavior per Level

#### Soft Gate
- **Action**: Allow progress
- **Event**: `evidence.soft_gate_triggered`
- **Audit**: Warning logged
- **Response**: Success (no error)

#### Hard Gate
- **Action**: Block progress
- **Event**: `evidence.hard_gate_blocked`
- **Audit**: Block logged
- **Response**: Error returned

**Error Shape**:
```json
{
  "error": {
    "code": "EVIDENCE_REQUIRED",
    "category": "Forbidden",
    "message": "Missing required learning evidence",
    "details": {
      "missingEvidence": [
        {
          "type": "teacher_validation",
          "minCount": 1
        },
        {
          "type": "speaking",
          "minCount": 1
        }
      ]
    }
  }
}
```

---

## Enforcement Events

All enforcement actions emit events (IDs-only):

### 1. `evidence.soft_gate_triggered`
- Emitted when soft gate violation detected
- Payload: `userId`, `lessonId`, `action`, `policyId`, `missingEvidence`

### 2. `evidence.hard_gate_blocked`
- Emitted when hard gate blocks progress
- Payload: `userId`, `lessonId`, `action`, `policyId`, `missingEvidence`

### 3. `evidence.policy_violation_detected`
- Emitted when any policy violation detected (all levels)
- Payload: `userId`, `lessonId`, `action`, `policyId`, `missingEvidence`, `enforcementLevel`

**Contract Compliance**: All events follow Track 5 contract lock - IDs-only payloads, no PII.

---

## Policy Toggle & Ops Control

### Runtime Configuration

**Endpoint**: `/api/ops/evidence/enforcement`

**GET**: Get current enforcement level and policies
```bash
curl http://localhost:3011/api/ops/evidence/enforcement
```

**Response**:
```json
{
  "enforcementLevel": "soft_gate",
  "policies": [
    {
      "id": "lesson_complete",
      "scope": "lesson",
      "action": "complete",
      "requiredEvidence": [
        { "type": "attendance", "minCount": 1 },
        { "type": "activity_submission", "minCount": 1 }
      ]
    }
  ]
}
```

**PATCH**: Update enforcement level (admin only)
```bash
curl -X PATCH http://localhost:3011/api/ops/evidence/enforcement \
  -H "Content-Type: application/json" \
  -d '{"enforcementLevel": "hard_gate"}'
```

**Response**:
```json
{
  "enforcementLevel": "hard_gate",
  "message": "Enforcement level updated to hard_gate"
}
```

### Check Progress (Testing/Debugging)

**Endpoint**: `POST /api/ops/evidence/check`

```bash
curl -X POST http://localhost:3011/api/ops/evidence/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-456",
    "action": "complete"
  }'
```

**Response**:
```json
{
  "result": {
    "allowed": false,
    "level": "hard_gate",
    "reasons": [
      "Missing activity_submission: required 1, found 0"
    ],
    "missingEvidence": [
      { "type": "activity_submission", "minCount": 1 }
    ],
    "policyId": "lesson_complete"
  }
}
```

---

## Metrics

**Ops Metrics** (exposed via `/metrics`):

- `evidence_soft_gate_total{service}` - Counter for soft gate triggers
- `evidence_hard_gate_total{service}` - Counter for hard gate blocks
- `evidence_policy_violation_total{service}` - Counter for all violations

---

## When to Enable Hard Gate

### Recommended Scenarios

1. **Production Compliance**: When evidence is required for compliance/visa reporting
2. **Certificate Issuance**: When certificates require evidence
3. **High-Stakes Learning**: When learning outcomes must be verified
4. **After Soft Gate Period**: After users are educated about evidence requirements

### Not Recommended

1. **Early Rollout**: Use soft_gate first
2. **Testing Phase**: Use observe mode
3. **User Education**: Use soft_gate to warn users

---

## Impact on Learners

### Soft Gate
- **User Experience**: Progress allowed, warning shown
- **Impact**: Educational, no blocking
- **Use Case**: Gradual rollout

### Hard Gate
- **User Experience**: Progress blocked, error shown
- **Impact**: Must provide evidence to continue
- **Use Case**: Production enforcement

### Error Handling (Frontend)

When hard gate blocks progress:

1. **Display Error**: Show `EVIDENCE_REQUIRED` error
2. **Show Missing Evidence**: Display what evidence is missing
3. **Provide Actions**: 
   - Link to submit activity
   - Link to request teacher validation
   - Show evidence summary

**Example UI Flow**:
```
❌ Cannot complete lesson
Missing evidence:
- Activity submission (required: 1, found: 0)
- Teacher validation (required: 1, found: 0)

Actions:
[Submit Activity] [Request Validation] [View Evidence]
```

---

## Case: "Virtual Learning" Prevention

### Scenario
Learner tries to complete lesson without:
- Attending lesson (no attendance)
- Submitting activities (no activity_submission)

### Soft Gate Behavior
- Lesson completion allowed
- Warning event emitted
- Audit log recorded
- Metrics incremented

### Hard Gate Behavior
- Lesson completion blocked
- Error returned: `EVIDENCE_REQUIRED`
- User must provide evidence to continue

---

## Impact on Visa / Reporting

### For Compliance Reporting

When hard gate is enabled:
- **Progress Data**: Only includes verified progress (with evidence)
- **Certificates**: Only issued when evidence requirements met
- **Visa Applications**: Can show verified learning progress

### For Analytics

All enforcement levels track violations:
- `evidence.policy_violation_detected` events
- Metrics: `evidence_policy_violation_total`
- Audit logs: All violations logged

---

## Guardrails

### ✅ What's Enforced

- Lesson completion (when policy exists)
- Course unlock (when policy exists)
- Attempt finish (when policy exists)

### ❌ What's NOT Enforced

- Activity submission (explicitly excluded)
- Lesson start (only logged, not blocked)
- Read-only operations (queries, summaries)

### ✅ Safety Features

- Policy-driven (not hardcoded)
- Runtime toggleable
- Full audit trail
- Metrics tracking
- Non-blocking by default

---

## Testing

### Test Soft Gate

```bash
# Set to soft_gate
curl -X PATCH http://localhost:3011/api/ops/evidence/enforcement \
  -H "Content-Type: application/json" \
  -d '{"enforcementLevel": "soft_gate"}'

# Complete lesson without evidence (should succeed with warning)
# Check logs for "Evidence soft gate triggered"
```

### Test Hard Gate

```bash
# Set to hard_gate
curl -X PATCH http://localhost:3011/api/ops/evidence/enforcement \
  -H "Content-Type: application/json" \
  -d '{"enforcementLevel": "hard_gate"}'

# Complete lesson without evidence (should fail with error)
# Check response for EVIDENCE_REQUIRED error
```

### Test Check Endpoint

```bash
# Check if progress allowed
curl -X POST http://localhost:3011/api/ops/evidence/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-456",
    "action": "complete"
  }'
```

---

## Summary

Evidence-Driven Progress Enforcement provides:

1. **Policy-Driven**: Configurable policies, not hardcoded
2. **Gradual Rollout**: Soft gate → Hard gate progression
3. **Runtime Control**: Toggle enforcement level without restart
4. **Full Observability**: Events, metrics, audit logs
5. **Safe Defaults**: Non-blocking by default (soft_gate)

**Phase 2** will add:
- UI for policy management
- Advanced policy rules (time-based, level-based)
- Evidence analytics dashboard
- Automated evidence validation
