# Runbook: Ops & Recovery (Phase 1)

## 📋 Table of Contents

1. [Checking System Health](#checking-system-health)
2. [Identifying Overload](#identifying-overload)
3. [Hard Gate Management](#hard-gate-management)
4. [Degrade Mode](#degrade-mode)
5. [Resetting Local Dev Stores](#resetting-local-dev-stores)
6. [Common Incidents](#common-incidents)
7. [Commands Reference](#commands-reference)

---

## Checking System Health

### Get Ops Snapshot

```bash
# Get snapshot for last 24 hours (default)
curl "http://localhost:3012/api/ops/snapshot"

# Get snapshot for custom time range
curl "http://localhost:3012/api/ops/snapshot?from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z"
```

**Response includes:**
- Review queue stats (pending, approved, rejected, expired, SLA breaches)
- Progress health (active learners, blocked by hard gate, blocked by pending review)
- Reliability metrics (HTTP 5xx, transient failures, outbox backlog, idempotency collisions)
- Policy state (hard gate enabled, scopes)

### Check Review Queue

```bash
# Get pending reviews
curl "http://localhost:3012/api/ops/reviews?status=pending"

# Filter by role
curl "http://localhost:3012/api/ops/reviews?status=pending&role=teacher"

# Filter by course
curl "http://localhost:3012/api/ops/reviews?status=pending&courseId=course-123"
```

---

## Identifying Overload

### Check Overload Status

```bash
curl "http://localhost:3012/api/ops/overload/status"
```

**Response includes:**
- `overload.overloaded`: boolean
- `overload.reasons`: array of reasons
- `overload.roleOverloads`: per-role overload details
- `degrade.mode`: `normal` | `degraded` | `manual_override`

**Overload Thresholds:**
- Teacher: > 50 pending reviews
- Mentor: > 80 pending reviews
- SLA breach rate: > 15%

### Check SLA Heatmap

```bash
# Hourly buckets
curl "http://localhost:3012/api/ops/reviews/heatmap?bucket=hour&from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z"

# Daily buckets
curl "http://localhost:3012/api/ops/reviews/heatmap?bucket=day&from=2024-01-01T00:00:00Z&to=2024-01-31T00:00:00Z"
```

---

## Hard Gate Management

### Get Hard Gate Policies

```bash
curl "http://localhost:3012/api/ops/policies/hard-gate"
```

### Set Hard Gate Policy

```bash
# Enable hard gate globally
curl -X POST http://localhost:3012/api/ops/policies/hard-gate \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "global",
    "enabled": true,
    "reason": "Enabling hard gate for Phase 1 testing"
  }'

# Enable hard gate for specific course
curl -X POST http://localhost:3012/api/ops/policies/hard-gate \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "course",
    "scopeId": "course-123",
    "enabled": true,
    "reason": "High-value course requires strict evidence"
  }'

# Disable hard gate for specific lesson
curl -X POST http://localhost:3012/api/ops/policies/hard-gate \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "lesson",
    "scopeId": "lesson-456",
    "enabled": false,
    "reason": "Temporary disable for debugging"
  }'
```

### Bulk Set Hard Gate Policies

```bash
curl -X POST http://localhost:3012/api/ops/policies/hard-gate/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "policies": [
      {
        "scope": "global",
        "enabled": true,
        "reason": "Global enable"
      },
      {
        "scope": "course",
        "scopeId": "course-123",
        "enabled": false,
        "reason": "Course-specific disable"
      }
    ]
  }'
```

**Policy Priority:**
1. Lesson scope (highest)
2. Course scope
3. Cohort scope
4. Global scope (lowest)

---

## Degrade Mode

### Check Degrade Mode Status

```bash
curl "http://localhost:3012/api/ops/overload/status"
# Check `degrade.mode` field
```

### Manually Activate Degrade Mode

```bash
curl -X POST http://localhost:3012/api/ops/degrade/set \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "manual_override",
    "reason": "Manual activation due to high load",
    "autoActions": {
      "hardGateDisabledScopes": [
        {
          "scope": "course",
          "scopeId": "course-123"
        }
      ],
      "reviewTypesDowngraded": []
    }
  }'
```

### Deactivate Degrade Mode

```bash
curl -X POST http://localhost:3012/api/ops/degrade/set \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "normal"
  }'
```

**Auto-Degrade Actions:**
- Disables hard gate for low-critical scopes (course/lesson)
- Can downgrade review types (future: speaking/writing become soft recommendations)

---

## Resetting Local Dev Stores

### In-Memory Stores (Phase 1)

All stores are in-memory and reset on service restart:

```bash
# Restart all services
pnpm dev:clean

# Restart specific service
pnpm --filter @dmf/ops-service dev
```

**Stores that reset:**
- Evidence registry
- Review registry
- Hard gate policy registry
- Degrade mode state
- Enforcement policies

### Manual Reset (if needed)

For testing, you can manually clear stores by restarting services. No persistent data in Phase 1.

---

## Common Incidents

### Review Queue Stuck

**Symptoms:**
- Pending reviews not being processed
- SLA breaches increasing
- Teachers/mentors not claiming reviews

**Diagnosis:**
```bash
# Check review queue
curl "http://localhost:3012/api/ops/reviews?status=pending"

# Check overload status
curl "http://localhost:3012/api/ops/overload/status"

# Check if degrade mode is active
curl "http://localhost:3012/api/ops/overload/status" | jq '.degrade.mode'
```

**Resolution:**
1. Check if evidence-service is running: `curl http://localhost:3011/health`
2. Check if review creation consumer is active (check logs)
3. Check if SLA expiration job is running (check logs)
4. Manually activate degrade mode if overloaded
5. Restart evidence-service if needed

### E2E Flakiness

**Symptoms:**
- E2E tests failing intermittently
- Race conditions in tests
- Timeout errors

**Diagnosis:**
```bash
# Run E2E tests
pnpm e2e

# Check service health
curl http://localhost:3001/health  # onboarding
curl http://localhost:3002/health  # curriculum
curl http://localhost:3003/health  # practice
curl http://localhost:3004/health  # progress
curl http://localhost:3011/health  # evidence
curl http://localhost:3012/health  # ops
```

**Resolution:**
1. Ensure all services are running
2. Check for port conflicts: `lsof -i :3001-3012`
3. Increase test timeouts if needed
4. Check event bus connectivity
5. Restart all services: `pnpm dev:clean`

### Event Consumers Not Running

**Symptoms:**
- Events not being processed
- Reviews not being created
- Enforcement not working

**Diagnosis:**
```bash
# Check service logs
# Look for consumer setup messages

# Check if events are being emitted
# Check metrics endpoint
curl "http://localhost:3012/metrics" | grep evidence
```

**Resolution:**
1. Check if event bus is initialized
2. Verify consumers are registered in service bootstrap
3. Check service logs for errors
4. Restart service if needed

### Port Conflicts

**Symptoms:**
- Service fails to start
- "Address already in use" error

**Diagnosis:**
```bash
# Check port usage
lsof -i :3001  # onboarding
lsof -i :3002  # curriculum
lsof -i :3003  # practice
lsof -i :3004  # progress
lsof -i :3011  # evidence
lsof -i :3012  # ops
```

**Resolution:**
```bash
# Kill ports (use script)
pnpm dev:clean

# Or manually
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:3002)
# ... etc
```

---

## Commands Reference

### Health Checks

```bash
# All services
curl http://localhost:3001/health  # onboarding (3001)
curl http://localhost:3002/health  # curriculum (3002)
curl http://localhost:3003/health  # practice (3003)
curl http://localhost:3004/health  # progress (3004)
curl http://localhost:3005/health  # motivation-progress (3005)
curl http://localhost:3006/health  # assessment (3006)
curl http://localhost:3007/health  # read (3007)
curl http://localhost:3010/health  # ops-admin (3010)
curl http://localhost:3011/health  # evidence (3011)
curl http://localhost:3012/health  # ops (3012)
```

### Metrics

```bash
# Get all metrics
curl "http://localhost:3012/metrics"

# Filter by service
curl "http://localhost:3012/metrics" | grep evidence
curl "http://localhost:3012/metrics" | grep review
curl "http://localhost:3012/metrics" | grep overload
```

### Review Operations

```bash
# Claim review
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/claim \
  -H "Content-Type: application/json" \
  -d '{"reviewerRole": "teacher"}'

# Approve review
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/approve \
  -H "Content-Type: application/json" \
  -d '{"comment": "Excellent work!"}'

# Reject review
curl -X POST http://localhost:3011/api/evidence/reviews/rev-123/reject \
  -H "Content-Type: application/json" \
  -d '{"comment": "Needs improvement"}'
```

### Enforcement Check

```bash
# Check if progress is allowed (via enforcement API)
curl -X POST http://localhost:3011/api/ops/evidence/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-456",
    "action": "lesson_complete"
  }'
```

---

## Quick Troubleshooting Checklist

- [ ] All services running? (`curl http://localhost:XXXX/health`)
- [ ] Port conflicts? (`lsof -i :XXXX`)
- [ ] Event bus connected? (check logs)
- [ ] Consumers registered? (check service bootstrap)
- [ ] Overload detected? (`curl http://localhost:3012/api/ops/overload/status`)
- [ ] Hard gate enabled? (`curl http://localhost:3012/api/ops/policies/hard-gate`)
- [ ] Degrade mode active? (check overload status)
- [ ] Review queue stuck? (check pending reviews)
- [ ] SLA breaches? (check snapshot)

---

## Phase 1 Limitations

- **In-Memory Stores**: All data is lost on restart
- **No Persistence**: No database, all in-memory Maps
- **No UI**: Backend APIs only, no dashboard
- **Limited Metrics**: Basic metrics only, no advanced analytics
- **No RBAC**: No role-based access control for ops endpoints
- **No Audit Trail**: Audit logs are in-memory only

See `docs/phase-1/closure.md` for full Phase 1 status.
