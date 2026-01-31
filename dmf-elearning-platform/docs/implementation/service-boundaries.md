# Service Boundaries (MVP)
## Ranh giới Dịch vụ (Ai sở hữu cái gì)

This document restates "who owns what" in implementer language, based on frozen STEP 5A (State Ownership) and STEP 8B (Authorization).

---

## Ownership Rules (Quy tắc Sở hữu)

### Single Writer Per State (Một nơi được ghi)

**Rule**: Each state entity has ONE owner service that has exclusive WRITE access. Other services can READ or REACT via events, but cannot directly mutate foreign state.

**Enforcement**:
- Repository interfaces are service-scoped
- ESLint rule prevents importing foreign service repositories
- TypeScript compile-time check (repository types are service-specific)

---

## Write State Ownership (Sở hữu Trạng thái Ghi)

### practice-service

**Owns**:
- `Attempt` — Learning session state
- `Submission` — Activity answer state

**Can Write**:
- Create/update Attempt
- Create/update Submission

**Cannot Write**:
- ProgressState (read-only, for unlock check)
- MasteryState (not accessed)
- Assessment (not accessed)
- Feedback (read-only, for display)

**Read-Only Access**:
- User (from onboarding-service API)
- Lesson metadata (from curriculum-service API)
- Feedback (from mentoring-service API)

### assessment-service

**Owns**:
- `Assessment` — Quiz/test state

**Can Write**:
- Create/update Assessment

**Cannot Write**:
- Attempt (read-only, for context)
- Submission (read-only, for context)
- MasteryState (not accessed)
- ProgressState (not accessed)

**Read-Only Access**:
- User (from onboarding-service API)
- Attempt (from practice-service API, if needed)

### mentoring-service

**Owns**:
- `Feedback` — Feedback state
- `FeedbackRequest` — Feedback request state

**Can Write**:
- Create/update Feedback
- Create/update FeedbackRequest

**Cannot Write**:
- Submission (read-only, for context)
- Attempt (read-only, for context)
- MasteryState (not accessed)

**Read-Only Access**:
- Submission (from practice-service API)
- User (from onboarding-service API)
- Lesson metadata (from curriculum-service API)

### curriculum-service

**Owns**:
- `Enrollment` — Course enrollment state
- `Course` — Course structure (read-only for MVP, but owned)
- `Unit` — Unit structure (read-only for MVP, but owned)
- `Lesson` — Lesson structure (read-only for MVP, but owned)
- `SRSItem` — Spaced repetition item state

**Can Write**:
- Create/update Enrollment
- Create/update SRSItem

**Cannot Write**:
- ProgressState (not accessed)
- MasteryState (not accessed)
- Attempt (read-only, for unlock check)

**Read-Only Access**:
- User (from onboarding-service API)
- ProgressState (from progress-service API, for unlock eligibility check)

### onboarding-service

**Owns**:
- `User` — User identity state
- `LearnerProfile` — Learner profile state
- `Session` — Session state (ephemeral)

**Can Write**:
- Create/update User
- Create/update LearnerProfile
- Create/update Session

**Cannot Write**:
- Any other state (read-only for composition)

**Read-Only Access**:
- ProgressState (from progress-service API)
- MasteryState (from motivation-progress-service API)
- Enrollment (from curriculum-service API)

---

## Derived State Ownership (Sở hữu Trạng thái Tính toán)

### progress-service

**Owns**:
- `ProgressState` — Derived from events (unlocked lessons/units)

**Can Write**:
- Update ProgressState (via event consumers only)

**Cannot Write**:
- Attempt (read-only, via event payload IDs)
- Assessment (read-only, via event payload IDs)
- Enrollment (read-only, via event payload IDs)

**Event Consumers**:
- `learning.lesson.completed` → Updates ProgressState
- `curriculum.course.enrolled` → Initializes ProgressState
- `curriculum.unit.unlocked` → Updates ProgressState
- `system.user.registered` → Initializes ProgressState
- `assessment.level_test.completed` → Updates ProgressState (unlocks initial units)
- `system.profile.updated` → Resets ProgressState (if targetLanguage changed)

**Read-Only Access**:
- Attempt (from practice-service API, to get lessonId)
- Assessment (from assessment-service API, to get cefrLevel)
- Course/Unit/Lesson (from curriculum-service API, for unlock eligibility)

### motivation-progress-service

**Owns**:
- `MasteryState` — Derived from events (aggregated scores)
- `SkillScore` — Derived from events (per-skill scores)

**Can Write**:
- Update MasteryState (via event consumers only)
- Update SkillScore (via event consumers only)

**Cannot Write**:
- Attempt (read-only, via event payload IDs)
- Submission (read-only, via event payload IDs)
- Assessment (read-only, via event payload IDs)
- Feedback (read-only, via event payload IDs)

**Event Consumers**:
- `learning.lesson.completed` → Updates MasteryState (reads Attempt to get score)
- `learning.submission.created` → Updates MasteryState (reads Submission to get type/scores)
- `assessment.quiz.submitted` → Updates MasteryState (reads Assessment to get score)
- `mentoring.feedback.published` → Updates MasteryState (reads Feedback to get rubric scores)
- `system.profile.updated` → Resets MasteryState (if targetLanguage changed)

**Read-Only Access**:
- Attempt (from practice-service API, to get score)
- Submission (from practice-service API, to get type/scores)
- Assessment (from assessment-service API, to get score)
- Feedback (from mentoring-service API, to get rubric scores)

---

## Command Handling Rules (Quy tắc Xử lý Lệnh)

### Commands Are Intent-Only (Lệnh chỉ là ý định)

**Rule**: Commands represent user/system intent, not outcomes. Services determine outcomes and emit events.

**Enforcement**:
- Command handlers do NOT return computed outcomes (scores, mastery, unlock status)
- Command handlers emit events with IDs only
- Derived states are updated by event consumers, not command handlers

### Command → State → Event Flow

1. **Command received** → Handler validates authz and payload
2. **Handler mutates own state** → Creates/updates owned entity
3. **Handler emits event** → Event payload contains IDs only
4. **Event consumers react** → Update derived states (if needed)

**Example**:
```
learning.lesson.complete command
  → practice-service updates Attempt (status: 'completed')
  → practice-service emits learning.lesson.completed event (IDs only)
  → progress-service consumes event → updates ProgressState
  → motivation-progress-service consumes event → updates MasteryState
```

---

## Authorization Rules (Quy tắc Phân quyền)

### 403 Role-Only (403 chỉ sai role)

**Rule**: `403 Forbidden` is returned ONLY for role violations, not for ownership failures.

**Enforcement**:
- `forbidRole(role, allowedRoles)` → throws 403 if role not allowed
- Used in command handlers and query endpoints

**Example**:
```typescript
// ❌ Wrong: Return 403 for ownership failure
if (attempt.userId !== authenticated.userId) {
  throw new ForbiddenError(); // NO!
}

// ✅ Correct: Return 404 for ownership failure
if (attempt.userId !== authenticated.userId) {
  throw new NotFoundError(); // Hide existence
}
```

### 404 Ownership Hide Existence (404 khi sai ownership)

**Rule**: `404 NotFound` is returned for ownership failures to prevent enumeration.

**Enforcement**:
- `failOwnership()` → throws 404
- Used in command handlers and query endpoints

**Example**:
```typescript
// ✅ Correct: Return 404 for ownership failure
if (attempt.userId !== authenticated.userId) {
  failOwnership(); // Returns 404, hides existence
}
```

### Teacher/Mentor Queue Boundary (Teacher/Mentor truy cập theo hàng đợi)

**Rule**: Teacher/Mentor can only access entities via FeedbackRequest linkage (queue boundary).

**Enforcement**:
- All teacher/mentor endpoints verify FeedbackRequest exists
- No direct access to submissions/learners without FeedbackRequest linkage
- Queue is the authorization boundary

**Example**:
```typescript
// ✅ Correct: Verify FeedbackRequest linkage
const feedbackRequest = await feedbackRequestRepository.findBySubmissionId(submissionId);
if (!feedbackRequest || feedbackRequest.authorId !== authenticated.userId) {
  failOwnership(); // Returns 404, hides existence
}
```

---

## Cross-Service Communication Rules (Quy tắc Giao tiếp Liên dịch vụ)

### Read-Only Service APIs

**Rule**: Services communicate via read-only HTTP APIs, not direct DB access.

**Enforcement**:
- `src/read/` folder contains HTTP clients to other services
- NO direct DB access to foreign services
- All cross-service data access goes through HTTP APIs

**Example**:
```typescript
// ✅ Correct: Use read-only HTTP client
const attempt = await practiceServiceClient.getAttempt(attemptId);

// ❌ Wrong: Direct DB access
const attempt = await foreignDb.attempts.findById(attemptId); // NO!
```

### IDs-Only Event Payloads (Payload event chỉ ID)

**Rule**: Event payloads contain IDs only, not full data objects.

**Enforcement**:
- Event payload types in `packages/contracts` only contain IDs
- TypeScript compile-time check (no score/email/role in event payload types)
- Consumers fetch additional info via read-only service APIs

**Example**:
```typescript
// ✅ Correct: Event payload contains IDs only
await eventEmitter.emit({
  eventName: 'learning.lesson.completed',
  payload: {
    eventId: generateId(),
    occurredAt: new Date().toISOString(),
    attemptId: attempt.id,
    userId: attempt.userId,
    lessonId: attempt.lessonId,
  },
});

// ❌ Wrong: Event payload contains computed outcomes
await eventEmitter.emit({
  eventName: 'learning.lesson.completed',
  payload: {
    attemptId: attempt.id,
    score: attempt.score, // NO! Score is computed outcome
    masteryLevel: computeMastery(attempt), // NO! Mastery is computed outcome
  },
});
```

---

## Guardrails Checklist (Checklist Rào chắn)

### Before Implementing a Handler

- [ ] Verify command exists in `packages/contracts`
- [ ] Verify service owns the state being mutated
- [ ] Verify authz rules (403 role-only, 404 ownership)
- [ ] Verify event payload contains IDs only
- [ ] Verify no direct DB access to foreign services

### Before Implementing an Event Consumer

- [ ] Verify consumer updates own state only
- [ ] Verify consumer fetches non-ID data via read-only APIs
- [ ] Verify consumer handles idempotency (eventId dedupe)
- [ ] Verify consumer does NOT mutate foreign state

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Service boundaries documented
