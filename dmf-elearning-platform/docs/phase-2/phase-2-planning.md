# Phase 2 Planning: Modern Ops & Persistence

## 🎯 Phase 2 in Plain Language

**What is Phase 2?**

Phase 2 is about making the DMF E-Learning Platform **production-ready for long-term operation**. It's not about adding new learning features. It's about ensuring:

1. **Data survives restarts** - No more "lost on restart" in-memory data
2. **History is auditable** - You can see what happened, when, and why
3. **Learning is verifiable** - No "virtual completion" without real evidence
4. **Operations are transparent** - Admins can see policy decisions, overloads, and system state
5. **System is debuggable** - 6 months later, you can still understand what happened

**Think of it as:** Building the "operational foundation" so the system can run reliably for 2-3 years in production.

---

## 🧩 Core Tracks Breakdown

### Track A: Persistence & Replay Safety

**Problem:** Currently, all data is in-memory. If a service restarts, data is lost. Events can't be replayed. Read models can't be rebuilt.

**Solution:** Design foundations for:
- **Event replay** - Replay events safely, idempotently, in order
- **Read-model rebuild** - Rebuild read models from events deterministically
- **Snapshot strategy** - When to snapshot, where to store, how to restore

**Key Questions to Answer:**
- What events CAN be replayed? (e.g., `learning.lesson.completed` - yes)
- What events CANNOT be replayed? (e.g., `ops.degrade.activated` - maybe not, depends on context)
- When should we snapshot? (e.g., after every N events, or on specific boundaries)
- How do we ensure idempotency during replay?

**Deliverables:**
- `ReplayStrategy` concept (what can/cannot be replayed)
- `SnapshotBoundary` definition (when to snapshot)
- Clear rules: replayable vs non-replayable events
- Replay planner (how to plan a safe replay)

---

### Track B: Evidence System (Anti-Virtual Learning)

**Problem:** Phase 1 has basic evidence tracking, but it's not formalized. Evidence lifecycle is unclear. Evidence-to-progress mapping is implicit.

**Solution:** Formalize EvidenceItem as a first-class domain concept.

**Rules:**
- **No learning progress without evidence** - Progress requires verifiable EvidenceItems
- **Evidence is append-only** - Once created, evidence cannot be modified (only revoked/expired)
- **Evidence is referenceable by ID only** - No nested objects, just IDs (contracts-first)

**Evidence Lifecycle:**
1. **Created** - EvidenceItem is created (e.g., speaking recording, writing submission)
2. **Validated** - Evidence passes validation (auto or manual review)
3. **Expired/Revoked** - Evidence is no longer valid (timeout, fraud detection, etc.)

**Mapping:**
- Evidence → Progress eligibility (which progress requires which evidence)
- Evidence → Enforcement (soft gate vs hard gate)

**Deliverables:**
- `EvidenceItem` domain type (minimal, IDs-only)
- `EvidenceStatus` enum (created, validated, expired, revoked)
- Evidence lifecycle contracts (events for status changes)
- Evidence-to-progress mapping rules

---

### Track C: Ops Visibility & Policy Enforcement

**Problem:** Phase 1 has ops events and policy enforcement, but:
- Policy decisions are not explicitly recorded (why was action blocked/allowed?)
- Audit trail is not admin-readable (just events, no structured audit records)
- Policy violations are detected but not systematically tracked

**Solution:** Lay groundwork for operational control and visibility.

**Focus Areas:**
- **Policy violations** - Track when and why policies block actions
- **Soft gates vs hard gates** - Record which gate triggered and why
- **Auditability** - Structured audit records that admins can query

**Deliverables:**
- `PolicyDecision` type (action, reason, policyId, timestamp, actor)
- `AuditRecord` type (what happened, who did it, when, why)
- Ops-level events formalization (already partially exist - formalize them)
- Policy decision recording (why an action was blocked/allowed)

---

### Track D: Admin Safety & Governance (Lightweight)

**Problem:** Phase 1 has no RBAC, no actor tracking, no guardrails for dangerous operations.

**Solution:** Lightweight structure (no full RBAC yet) for:
- **Actor types** - system / admin / mentor / automation
- **Correlation** - Link admin actions to resulting events
- **Guardrails** - Protect against dangerous operations (delete, override, replay)

**Deliverables:**
- Actor types enum (system, admin, mentor, automation)
- Correlation tracking (admin action → resulting events)
- Guardrails for dangerous operations (delete, override, replay)
- Admin action contracts (what admin actions are allowed)

---

## 🚫 What Phase 2 Will NOT Do

**Explicitly out of scope:**

1. **No UI development** - Backend foundations only
2. **No full RBAC** - Just actor types and basic guardrails
3. **No database migration system** - That's Phase 3 (we'll use SQLite for now)
4. **No file storage** - Evidence references files by ID, but storage is Phase 3
5. **No advanced analytics** - Just basic audit trail queries
6. **No refactoring Phase 1 code** - Only add new primitives, don't break existing
7. **No contract changes** - All new concepts are opt-in, existing contracts unchanged

---

## 📋 Minimal Viable Primitives

### Track A Primitives

```typescript
// ReplayStrategy: What can/cannot be replayed
type ReplayStrategy = {
  eventName: string;
  replayable: boolean;
  reason?: string; // Why it's not replayable
  requiresSnapshot?: boolean; // Does this event require snapshot before replay?
};

// SnapshotBoundary: When to snapshot
type SnapshotBoundary = {
  eventName: string;
  snapshotAfter: boolean; // Snapshot after this event
  snapshotBefore?: boolean; // Snapshot before this event
};
```

### Track B Primitives

```typescript
// EvidenceItem: First-class domain concept
type EvidenceItem = {
  evidenceId: string;
  userId: string;
  evidenceType: 'speaking' | 'writing' | 'screen_recording' | 'teacher_validation' | 'activity_submission';
  status: EvidenceStatus;
  createdAt: string;
  validatedAt?: string;
  expiredAt?: string;
  revokedAt?: string;
  correlationId: string;
};

// EvidenceStatus: Lifecycle states
enum EvidenceStatus {
  CREATED = 'created',
  VALIDATED = 'validated',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}
```

### Track C Primitives

```typescript
// PolicyDecision: Why an action was blocked/allowed
type PolicyDecision = {
  decisionId: string;
  action: string; // e.g., 'lesson.complete'
  allowed: boolean;
  reason: string;
  policyId: string;
  gateType?: 'soft' | 'hard';
  timestamp: string;
  actorUserId: string;
  correlationId: string;
};

// AuditRecord: Structured audit trail
type AuditRecord = {
  auditId: string;
  eventName: string;
  actorType: 'system' | 'admin' | 'mentor' | 'automation';
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  correlationId: string;
  metadata?: Record<string, unknown>;
};
```

### Track D Primitives

```typescript
// ActorType: Who performed the action
enum ActorType {
  SYSTEM = 'system',
  ADMIN = 'admin',
  MENTOR = 'mentor',
  AUTOMATION = 'automation',
}

// DangerousOperation: Guardrails
type DangerousOperation = {
  operation: 'delete' | 'override' | 'replay' | 'bulk_update';
  requiresConfirmation: boolean;
  requiresAudit: boolean;
  allowedActors: ActorType[];
};
```

---

## 🏗️ Proposed Structure

```
packages/
  evidence/
    domain/
      EvidenceItem.ts          # Track B: EvidenceItem type
      EvidenceStatus.ts        # Track B: Status enum
      EvidenceLifecycle.ts    # Track B: Lifecycle rules
    contracts/
      evidence.events.ts      # Track B: Evidence lifecycle events

  ops/
    domain/
      PolicyDecision.ts       # Track C: Policy decision type
      AuditRecord.ts          # Track C: Audit record type
      ActorType.ts            # Track D: Actor types
      DangerousOperation.ts  # Track D: Guardrails
    contracts/
      ops.events.ts           # Track C: Ops events (formalize existing)

  read-models/
    replay/
      ReplayStrategy.ts       # Track A: What can/cannot replay
      SnapshotBoundary.ts     # Track A: When to snapshot
      ReplayPlanner.ts        # Track A: How to plan replay

docs/
  phase-2/
    persistence-principles.md  # Track A: Replay rules
    evidence-model.md          # Track B: Evidence lifecycle
    ops-visibility.md          # Track C: Audit trail design
    admin-safety.md            # Track D: Guardrails
```

---

## ✅ Quality Gates

Before considering Phase 2 "started":

- [ ] No Phase 1 tests break
- [ ] Contract-lock still validates
- [ ] New concepts are opt-in (existing code unchanged)
- [ ] Every new primitive answers: "What problem does this solve in real operations?"

---

## 🎯 Success Criteria

Phase 2 is "complete" when:

1. **Replay Safety** - Clear rules for what can/cannot be replayed
2. **Evidence Formalization** - EvidenceItem is a first-class concept with clear lifecycle
3. **Ops Visibility** - Policy decisions and audit records are structured and queryable
4. **Admin Safety** - Actor types and guardrails are defined
5. **Documentation** - All principles are documented and clear

---

## 🚀 Next Steps

1. **Scaffold Track A** - ReplayStrategy, SnapshotBoundary, ReplayPlanner
2. **Scaffold Track B** - EvidenceItem domain types, EvidenceStatus, lifecycle events
3. **Scaffold Track C** - PolicyDecision, AuditRecord, ops events formalization
4. **Scaffold Track D** - ActorType, DangerousOperation, correlation tracking
5. **Verify** - Build, test, contract-lock all pass

---

**Phase 2 is about building the operational foundation, not adding features.**