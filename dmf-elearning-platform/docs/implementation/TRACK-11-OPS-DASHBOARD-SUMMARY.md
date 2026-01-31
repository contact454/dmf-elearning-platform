# Track 11: Ops Dashboard & Human Load Control — Summary

## ✅ Completed

### 1. Ops Package (`packages/ops/`)

- **Ops Snapshot Read Model** (`readmodels/ops-snapshot.ts`)
  - Review queue stats (pending, approved, rejected, expired, SLA breaches)
  - Progress health (active learners, blocked by hard gate, blocked by pending review)
  - Reliability metrics (HTTP 5xx, transient failures, outbox backlog, idempotency collisions)
  - Policy state (hard gate enabled, scopes)

- **Ops Snapshot Builder** (`readmodels/ops-snapshot-builder.ts`)
  - Builds snapshot from various data sources
  - Calculates review queue statistics (by role, by course)
  - Aggregates hard gate policy state

- **Hard Gate Policy** (`policy/hard-gate-policy.ts`)
  - Policy model for hard gate switches
  - Scope types: `global`, `course`, `lesson`, `cohort`

- **Hard Gate Policy Registry** (`shared/src/policy/hard-gate-policy-registry.ts`)
  - In-memory policy registry
  - Priority-based policy resolution (lesson > course > cohort > global)
  - Moved to `@dmf/shared` to avoid circular dependency

- **Overload Detector** (`load-control/overload-detector.ts`)
  - Detects overload based on review queue metrics
  - Thresholds: Teacher 50, Mentor 80, SLA breach 15%
  - Returns overload status with reasons

- **Degrade Mode** (`load-control/degrade-mode.ts`)
  - Degrade mode state management
  - Modes: `normal`, `degraded`, `manual_override`
  - Auto-actions: disable hard gate for low-critical scopes

### 2. Ops Service (`services/ops-service/`)

- **Ops Snapshot Route** (`http/ops-snapshot.route.ts`)
  - `GET /api/ops/snapshot?from=...&to=...`
  - Returns complete ops snapshot

- **Review Queue Drilldown Route** (`http/review-queue-drilldown.route.ts`)
  - `GET /api/ops/reviews?status=pending&role=teacher&courseId=...`
  - Filterable review queue query

- **Hard Gate Policy Routes** (`http/hard-gate-policy.route.ts`)
  - `GET /api/ops/policies/hard-gate` - Get all policies
  - `POST /api/ops/policies/hard-gate` - Set policy
  - `POST /api/ops/policies/hard-gate/bulk` - Bulk set policies

- **Overload Control Routes** (`http/overload-control.route.ts`)
  - `GET /api/ops/overload/status` - Get overload status
  - `POST /api/ops/degrade/set` - Set degrade mode (manual override)

- **Heatmap Route** (`http/heatmap.route.ts`)
  - `GET /api/ops/reviews/heatmap?bucket=hour&from=...&to=...`
  - Returns bucketed review statistics

- **Overload Monitor Job** (`jobs/overload-monitor.job.ts`)
  - Runs every 15 minutes
  - Detects overload and auto-activates degrade mode
  - Emits `ops.overload.detected` and `ops.degrade.activated` events

### 3. Hard Gate Policy Integration

- **Enforcement Integration** (`packages/evidence/src/enforcement/evidence-enforcer.ts`)
  - Checks hard gate policy before enforcing
  - Priority: lesson > course > cohort > global
  - If hard gate enabled, uses `hard_gate` enforcement level

### 4. Commands & Events

- **Commands** (`packages/contracts/src/commands/policy.ts`)
  - `policy.hard_gate.set` - Set hard gate policy
  - `policy.hard_gate.bulk_set` - Bulk set policies

- **Events** (`packages/contracts/src/events/ops.ts`)
  - `policy.hard_gate.updated` - Policy updated
  - `ops.overload.detected` - Overload detected
  - `ops.degrade.activated` - Degrade mode activated
  - `ops.degrade.deactivated` - Degrade mode deactivated

### 5. Metrics Integration

- **Event Metrics** (`packages/ops-metrics/src/event-metrics.consumer.ts`)
  - `policy_hard_gate_updated_total`
  - `ops_overload_detected_total`
  - `ops_degrade_activated_total`
  - `ops_degrade_deactivated_total`

### 6. Documentation

- **Runbook** (`docs/ops/runbook-phase-1.md`)
  - Complete ops runbook with commands and troubleshooting

- **Phase 1 Closure** (`docs/phase-1/closure.md`)
  - What Phase 1 delivered
  - What is stubbed/in-memory
  - What is locked (contracts)
  - What moves to Phase 2

## 📋 Files Created/Modified

### New Files
- `packages/ops/` - Ops package (NEW)
- `packages/shared/src/policy/hard-gate-policy-registry.ts` - Policy registry (NEW)
- `packages/contracts/src/commands/policy.ts` - Policy commands (NEW)
- `services/ops-service/` - Ops service (NEW)
- `docs/ops/runbook-phase-1.md` - Runbook (NEW)
- `docs/phase-1/closure.md` - Phase 1 closure (NEW)

### Modified Files
- `packages/contracts/src/events/ops.ts` - Added ops events
- `packages/contracts/src/registries.ts` - Registered policy commands and events
- `packages/evidence/src/enforcement/evidence-enforcer.ts` - Integrated hard gate policy
- `packages/ops-metrics/src/event-metrics.consumer.ts` - Added ops metrics
- `package.json` - Added ops-service to dev scripts

## 🎯 Usage Examples

### Get Ops Snapshot
```bash
curl "http://localhost:3012/api/ops/snapshot?from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z"
```

### Set Hard Gate Policy
```bash
curl -X POST http://localhost:3012/api/ops/policies/hard-gate \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "global",
    "enabled": true,
    "reason": "Enabling hard gate for Phase 1 testing"
  }'
```

### Check Overload Status
```bash
curl "http://localhost:3012/api/ops/overload/status"
```

### Get SLA Heatmap
```bash
curl "http://localhost:3012/api/ops/reviews/heatmap?bucket=hour&from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z"
```

## ✅ Acceptance Criteria

- ✅ Ops snapshot endpoint works
- ✅ Hard gate policies set/get + audit + event emitted
- ✅ Enforcement reads policy priority correctly
- ✅ Overload detection + degrade mode works (auto + manual)
- ✅ Heatmap query returns bucketed data
- ✅ Runbook + Phase 1 closure docs complete

## 🚫 What's NOT Implemented (Intentional)

- ❌ UI for ops dashboard (backend only)
- ❌ Persistent stores (in-memory only, Phase 2)
- ❌ Advanced analytics (basic metrics only)
- ❌ Alerting system (Phase 2)
- ❌ Automated recovery (Phase 2)

## 🚀 Next Steps (Phase 2)

1. **Database Integration**: Replace in-memory stores with PostgreSQL
2. **UI Dashboard**: Build web-based ops dashboard
3. **Advanced Analytics**: Advanced analytics and reporting
4. **Alerting**: Alert system for incidents
5. **Automated Recovery**: Automated recovery procedures
6. **Load Balancing**: Distribute reviews across teachers/mentors
7. **Priority Queue**: Priority queue for reviews

## 📝 Notes

- Hard gate policy registry moved to `@dmf/shared` to avoid circular dependency
- Overload monitor job runs every 15 minutes (configurable)
- Degrade mode auto-disables hard gate for low-critical scopes (course/lesson)
- All endpoints are backend-only (no UI in Phase 1)
- Reliability metrics are stubbed (ready for Phase 2 integration)

## 🔍 Verification

```bash
# Build packages
pnpm --filter @dmf/shared build
pnpm --filter @dmf/ops build
pnpm --filter @dmf/evidence build
pnpm --filter @dmf/contracts build

# Start services
pnpm dev

# Test ops snapshot
curl "http://localhost:3012/api/ops/snapshot"

# Test hard gate policy
curl -X POST http://localhost:3012/api/ops/policies/hard-gate \
  -H "Content-Type: application/json" \
  -d '{"scope": "global", "enabled": true}'

# Test overload status
curl "http://localhost:3012/api/ops/overload/status"

# Run E2E (should still pass)
pnpm e2e
```

## 🎉 Phase 1 Complete!

Track 11 completes Phase 1 of the DMF E-Learning Platform. All core features are implemented:
- ✅ Core learning flow
- ✅ Evidence system with enforcement
- ✅ Teacher/mentor review workflow
- ✅ Ops dashboard and human load control
- ✅ Full observability
- ✅ E2E test suite
- ✅ Locked contracts (IDs-only)

Ready for Phase 2! 🚀
