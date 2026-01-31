# Ops Admin Foundations (Nền móng Vận hành Quản trị)

## Overview

This document describes the ops/admin foundation layer for DMF E-Learning Platform. This layer provides:

- **RBAC (Role-Based Access Control)**: Permission model and diff engine
- **Policy Center**: Policy definition, versioning, and activation (scaffold - no enforcement)
- **Versioning & Rollback**: Generic versioning system for config, policy, and content
- **Ops Events**: Event-driven audit trail for all ops actions

**Important**: This is an **ops-level foundation**, not business features. Policies are **NOT enforced** into domain handlers (intentional design for Phase 2).

---

## A. RBAC Foundations

### A1. Permission Model

**Location**: `packages/ops-admin/src/rbac/permissions.ts`

**Permissions** (static registry):

- **Learner**: `learner.read.own`, `learner.write.own`, `learner.submit.own`, `learner.view.own.progress`
- **Teacher**: `teacher.read.assigned`, `teacher.evaluate.assigned`, `teacher.view.assigned.progress`
- **Mentor**: `mentor.read.assigned`, `mentor.review.assigned`, `mentor.view.assigned.progress`
- **Admin**: `admin.read.all`, `admin.manage.policy`, `admin.manage.content`, `admin.manage.rbac`, `admin.view.metrics`, `admin.view.audit`

**Roles**:

- `learner`: Standard learner role
- `teacher`: Teacher with evaluation permissions
- `mentor`: Mentor with review permissions
- `admin`: Administrator with management permissions
- `super_admin`: All permissions

### A2. Permission Diff Engine

**Location**: `packages/ops-admin/src/rbac/diff.ts`

**API**: `GET /api/ops/rbac/diff?from=teacher&to=mentor`

**Output**:
```json
{
  "from": {
    "role": "teacher",
    "name": "Teacher",
    "permissions": [...]
  },
  "to": {
    "role": "mentor",
    "name": "Mentor",
    "permissions": [...]
  },
  "diff": {
    "added": ["mentor.review.assigned"],
    "removed": ["teacher.evaluate.assigned"],
    "unchanged": ["learner.read.own", ...]
  }
}
```

**Purpose**: Admin can see "what permissions does role A have that role B doesn't" - prepares for RBAC UI in Phase 2.

---

## B. Policy Center (Scaffold)

### B1. Policy Definition

**Location**: `packages/ops-admin/src/policy/policy.types.ts`

**Policy Structure**:
```typescript
{
  id: string;
  version: number;
  scope: 'learning' | 'assessment' | 'curriculum' | 'rbac' | 'system';
  appliesTo: string[]; // Role IDs or user IDs
  rule: {
    type: string;
    [key: string]: unknown;
  };
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  createdBy: string;
  description?: string;
}
```

**Example Policy**:
```json
{
  "id": "lesson_submission_window",
  "version": 1,
  "scope": "learning",
  "appliesTo": ["learner"],
  "rule": {
    "type": "time_window",
    "maxMinutesAfterStart": 120
  },
  "status": "draft",
  "description": "Maximum time window for lesson submissions"
}
```

### B2. Policy Registry & Versioning

**Location**: `packages/ops-admin/src/policy/policy-registry.ts`

**Storage**: In-memory (Map) with version history

**APIs**:

- `GET /api/ops/policies` - List all policies (optional `?status=draft`)
- `GET /api/ops/policies/:id` - Get policy by ID
- `POST /api/ops/policies` - Create new policy (creates version 1)
- `POST /api/ops/policies/:id/activate` - Activate policy (creates new version with status=active)

**Versioning**:
- Each policy change creates a new version
- Version history is preserved (no deletion)
- Current version is always the latest

**⚠️ Important**: Policies are **NOT enforced** into domain handlers. This is intentional - enforcement will be added in Phase 2 with a rule engine.

---

## C. Versioning & Rollback

### C1. Versioned Resource Abstraction

**Location**: `packages/ops-admin/src/versioning/versioned-resource.ts`

**Interface**:
```typescript
interface VersionedResource<T> {
  id: string;
  version: number;
  payload: T;
  createdAt: string;
  createdBy: string;
}
```

**Generic Store**: `VersionedResourceStore<T>` - can be used for any resource type (config, policy, content, etc.)

### C2. Rollback Mechanism

**API**: `POST /api/ops/versioning/:resourceId/rollback`

**Request Body**:
```json
{
  "targetVersion": 2
}
```

**Behavior**:
- Does NOT delete versions
- Creates new version with payload from target version
- Emits `ops.resource.rolled_back` event
- Returns rolled-back resource

**Event**:
```json
{
  "eventId": "...",
  "occurredAt": "...",
  "actorUserId": "...",
  "resourceId": "...",
  "targetVersion": 2,
  "previousVersion": 3
}
```

---

## D. Ops Events (IDs-only)

**Location**: `packages/contracts/src/events/ops.ts`

**Events**:

1. **`ops.policy.created`**
   - Payload: `eventId`, `occurredAt`, `actorUserId`, `policyId`, `version`

2. **`ops.policy.activated`**
   - Payload: `eventId`, `occurredAt`, `actorUserId`, `policyId`, `version`

3. **`ops.resource.rolled_back`**
   - Payload: `eventId`, `occurredAt`, `actorUserId`, `resourceId`, `targetVersion`, `previousVersion`

4. **`ops.rbac.diff.viewed`** (optional, low priority)
   - Payload: `eventId`, `occurredAt`, `actorUserId`, `fromRole`, `toRole`

**Contract Compliance**: All events follow Track 5 contract lock - IDs-only payloads, no PII.

---

## E. Ops Admin Service

**Location**: `services/ops-admin-service`

**Port**: `3010`

**Endpoints**:

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/ops/rbac/diff?from=teacher&to=mentor` - RBAC diff
- `GET /api/ops/policies` - List policies
- `GET /api/ops/policies/:id` - Get policy
- `POST /api/ops/policies` - Create policy
- `POST /api/ops/policies/:id/activate` - Activate policy
- `POST /api/ops/versioning/:resourceId/rollback` - Rollback resource

**Features**:
- Request context middleware
- HTTP metrics middleware
- Event metrics consumers
- Audit logging for all ops actions
- No complex auth (dev mode: assume admin)

---

## F. Audit & Metrics Integration

### Audit Logging

All ops actions are audited:
- Policy creation → `ops.policy.create` command logged
- Policy activation → `ops.policy.activate` command logged
- Rollback → `ops.resource.rollback` command logged

**Audit Fields**: `commandName`, `userId`, `requestId`, `correlationId` (no PII)

### Metrics

**Ops Metrics** (exposed via `/metrics`):

- `ops_policy_created_total{service}` - Counter
- `ops_policy_activated_total{service}` - Counter
- `ops_rollback_total{service}` - Counter
- `ops_rbac_diff_requests_total{service}` - Counter

**HTTP Metrics**: Standard HTTP metrics (requests, duration) for all ops endpoints

---

## G. What's NOT Implemented (Intentional)

### ❌ Policy Enforcement

Policies are **NOT enforced** into domain handlers. This is intentional:

- Policies are stored and versioned
- Policies can be activated
- But domain handlers don't check policies yet

**Reason**: Policy enforcement requires a rule engine, which will be built in Phase 2.

### ❌ Full RBAC Enforcement

RBAC permissions are defined, but not enforced:

- Permissions are declared
- Roles have permission assignments
- But domain handlers don't check permissions yet

**Reason**: Full RBAC enforcement requires integration with auth system, which will be built in Phase 2.

### ❌ UI

No admin UI is built:

- APIs are ready
- Data structures are ready
- But no frontend dashboard

**Reason**: UI will be built in Phase 2.

---

## H. Usage Examples

### RBAC Diff

```bash
curl "http://localhost:3010/api/ops/rbac/diff?from=teacher&to=mentor"
```

### Create Policy

```bash
curl -X POST http://localhost:3010/api/ops/policies \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lesson_submission_window",
    "scope": "learning",
    "appliesTo": ["learner"],
    "rule": {
      "type": "time_window",
      "maxMinutesAfterStart": 120
    },
    "status": "draft",
    "description": "Maximum time window for lesson submissions"
  }'
```

### Activate Policy

```bash
curl -X POST http://localhost:3010/api/ops/policies/lesson_submission_window/activate
```

### Rollback Resource

```bash
curl -X POST http://localhost:3010/api/ops/versioning/my-resource/rollback \
  -H "Content-Type: application/json" \
  -d '{
    "targetVersion": 2
  }'
```

---

## I. Architecture Notes

### In-Memory Storage

All ops data is stored in-memory (Map):

- Policies: `Map<policyId, Policy>`
- Policy versions: `Map<policyId, PolicyVersion[]>`
- Versioned resources: `Map<resourceId, VersionedResource>`

**Production**: Replace with database (PostgreSQL/MongoDB) in Phase 2.

### Event-Driven

All ops actions emit events:

- Policy creation → `ops.policy.created`
- Policy activation → `ops.policy.activated`
- Rollback → `ops.resource.rolled_back`

Events are consumed by:
- Metrics consumers (increment counters)
- Audit loggers (record actions)
- Future: Rule engine (enforce policies)

### Contract-First

All ops events follow contract-first approach:

- Events defined in `@dmf/contracts/src/events/ops.ts`
- Schemas validated via Zod
- Registered in `eventRegistry`

---

## J. Future Enhancements (Phase 2)

1. **Policy Rule Engine**: Enforce policies into domain handlers
2. **RBAC Enforcement**: Check permissions in domain handlers
3. **Admin UI**: Dashboard for managing policies, RBAC, versioning
4. **Database Storage**: Replace in-memory storage with database
5. **Policy Templates**: Pre-defined policy templates for common scenarios
6. **RBAC UI**: Visual permission editor and role manager

---

## K. Verification

```bash
# Build all packages
pnpm build

# Start services (includes ops-admin-service on port 3010)
pnpm dev

# Test RBAC diff
curl "http://localhost:3010/api/ops/rbac/diff?from=teacher&to=mentor"

# Test policy creation
curl -X POST http://localhost:3010/api/ops/policies \
  -H "Content-Type: application/json" \
  -d '{"id":"test","scope":"learning","appliesTo":["learner"],"rule":{"type":"test"}}'

# Check metrics
curl http://localhost:3010/metrics

# Run E2E (should still pass)
pnpm e2e
```
