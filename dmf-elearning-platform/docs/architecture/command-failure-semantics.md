# STEP 4.4 — Command Failure & Rejection Semantics (MVP)
## Ngữ nghĩa Lỗi và Từ chối Lệnh

This document defines how command handling fails and when commands are rejected. This step answers: "When is a command rejected synchronously? When is a command accepted but later fails? Which failures are retryable? Which failures are terminal? How idempotency affects failure behavior?"

---

## 1. Failure Categories (Phân loại Lỗi)

### ValidationError

**Description**: Command payload fails format, type, or constraint validation. Field values are invalid (wrong type, out of range, missing required fields, invalid enum values).

**Is command accepted?** No

**Is event emitted?** No

**Retryable?** No (client must fix payload)

**Typical HTTP mapping**: 400 Bad Request

---

### NotFound

**Description**: Referenced entity does not exist. Required entity (user, lesson, attempt, etc.) referenced in command payload cannot be found.

**Is command accepted?** No

**Is event emitted?** No

**Retryable?** No (entity must exist first)

**Typical HTTP mapping**: 404 Not Found

---

### Forbidden

**Description**: Authorization or permission check fails. User is not authorized to perform the action (does not own resource, lacks permission, account suspended).

**Is command accepted?** No

**Is event emitted?** No

**Retryable?** No (permission issue, not transient)

**Typical HTTP mapping**: 403 Forbidden

---

### Conflict

**Description**: Business rule violation or state conflict. Command violates business rules (already enrolled, active attempt exists, course full, assessment expired).

**Is command accepted?** No

**Is event emitted?** No

**Retryable?** No (business rule violation, not transient)

**Typical HTTP mapping**: 409 Conflict

---

### IdempotentReplay

**Description**: Command is a safe replay of an already-processed command. Same intent with same correlationId or natural key already executed successfully.

**Is command accepted?** Yes (returns existing result)

**Is event emitted?** No (no new event, existing state returned)

**Retryable?** N/A (not a failure, success with existing result)

**Typical HTTP mapping**: 200 OK (with existing result) or 201 Created (if idempotent create)

---

### TransientFailure

**Description**: Temporary system failure that may succeed on retry. Database connection failure, network timeout, service unavailable (not business logic failure).

**Is command accepted?** No (or unknown, depends on when failure occurs)

**Is event emitted?** No (command not processed)

**Retryable?** Yes (transient, may succeed on retry)

**Typical HTTP mapping**: 503 Service Unavailable or 500 Internal Server Error

---

## 2. Command Failure Matrix

### Learning / Practice Domain Commands

| Command | Failure Type | Trigger Condition | Sync Reject or Async Fail | Event Emitted? | Retry Allowed? | Notes |
|---------|--------------|-------------------|---------------------------|----------------|----------------|-------|
| `learning.lesson.start` | ValidationError | Invalid userId or lessonId format, invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `learning.lesson.start` | NotFound | User does not exist, lesson does not exist | Sync Reject | No | No | Entity must exist first |
| `learning.lesson.start` | Forbidden | User account suspended or deleted | Sync Reject | No | No | Authorization check |
| `learning.lesson.start` | Conflict | Lesson not unlocked for user, active attempt already exists (if resume not allowed) | Sync Reject | No | No | Business rule violation |
| `learning.lesson.start` | IdempotentReplay | correlationId provided and attempt already exists | Sync Accept (return existing) | No | N/A | Returns existing attempt |
| `learning.lesson.start` | TransientFailure | Database connection failure, curriculum-service unavailable for unlock check | Sync Reject | No | Yes | May succeed on retry |
| `learning.lesson.complete` | ValidationError | Invalid attemptId format, invalid status value | Sync Reject | No | No | Client must fix payload |
| `learning.lesson.complete` | NotFound | Attempt does not exist | Sync Reject | No | No | Attempt must exist first |
| `learning.lesson.complete` | Forbidden | Attempt does not belong to authenticated user | Sync Reject | No | No | Authorization check |
| `learning.lesson.complete` | Conflict | Attempt is not in 'in-progress' status (already completed or abandoned) | Sync Reject | No | No | State conflict |
| `learning.lesson.complete` | IdempotentReplay | Attempt already completed with same status | Sync Accept (return success) | No | N/A | Idempotent operation |
| `learning.lesson.complete` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `learning.lesson.abandon` | ValidationError | Invalid attemptId format | Sync Reject | No | No | Client must fix payload |
| `learning.lesson.abandon` | NotFound | Attempt does not exist | Sync Reject | No | No | Attempt must exist first |
| `learning.lesson.abandon` | Forbidden | Attempt does not belong to authenticated user | Sync Reject | No | No | Authorization check |
| `learning.lesson.abandon` | Conflict | Attempt is not in 'in-progress' status | Sync Reject | No | No | State conflict |
| `learning.lesson.abandon` | IdempotentReplay | Attempt already abandoned | Sync Accept (return success) | No | N/A | Idempotent operation |
| `learning.lesson.abandon` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `learning.activity.submit` | ValidationError | Invalid attemptId or activityId format, missing required fields (audioUrl for speaking, text for writing, answer for quiz/listening), invalid type enum | Sync Reject | No | No | Client must fix payload |
| `learning.activity.submit` | NotFound | Attempt does not exist, activity does not exist | Sync Reject | No | No | Entity must exist first |
| `learning.activity.submit` | Forbidden | Attempt does not belong to authenticated user | Sync Reject | No | No | Authorization check |
| `learning.activity.submit` | Conflict | Attempt is not in 'in-progress' status, activity does not belong to lesson, submission type does not match activity type | Sync Reject | No | No | Business rule violation |
| `learning.activity.submit` | IdempotentReplay | correlationId provided and submission already exists | Sync Accept (return existing) | No | N/A | Returns existing submission |
| `learning.activity.submit` | TransientFailure | Database connection failure, curriculum-service unavailable for activity validation | Sync Reject | No | Yes | May succeed on retry |

### Assessment Domain Commands

| Command | Failure Type | Trigger Condition | Sync Reject or Async Fail | Event Emitted? | Retry Allowed? | Notes |
|---------|--------------|-------------------|---------------------------|----------------|----------------|-------|
| `assessment.quiz.start` | ValidationError | Invalid userId or assessmentId format, invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `assessment.quiz.start` | NotFound | User does not exist, assessment does not exist | Sync Reject | No | No | Entity must exist first |
| `assessment.quiz.start` | Forbidden | User account suspended or deleted | Sync Reject | No | No | Authorization check |
| `assessment.quiz.start` | Conflict | Assessment already completed, assessment expired, assessment not available | Sync Reject | No | No | Business rule violation |
| `assessment.quiz.start` | IdempotentReplay | correlationId provided and assessment attempt already exists | Sync Accept (return existing) | No | N/A | Returns existing attempt |
| `assessment.quiz.start` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `assessment.quiz.submit` | ValidationError | Invalid assessmentId format, empty answers array, invalid answer format, invalid attemptId format | Sync Reject | No | No | Client must fix payload |
| `assessment.quiz.submit` | NotFound | Assessment does not exist | Sync Reject | No | No | Assessment must exist first |
| `assessment.quiz.submit` | Forbidden | Assessment does not belong to authenticated user | Sync Reject | No | No | Authorization check |
| `assessment.quiz.submit` | Conflict | Assessment is not in 'in-progress' status, answer count mismatch, attemptId mismatch if provided | Sync Reject | No | No | Business rule violation |
| `assessment.quiz.submit` | IdempotentReplay | correlationId provided and submission already processed | Sync Accept (return existing) | No | N/A | Returns existing result |
| `assessment.quiz.submit` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `assessment.placement.take` | ValidationError | Invalid userId format, invalid targetLanguage enum value, invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `assessment.placement.take` | NotFound | User does not exist | Sync Reject | No | No | User must exist first |
| `assessment.placement.take` | Forbidden | User account suspended or deleted | Sync Reject | No | No | Authorization check |
| `assessment.placement.take` | Conflict | Recent placement test exists (if retake not allowed) | Sync Reject | No | No | Business rule violation |
| `assessment.placement.take` | IdempotentReplay | correlationId provided and placement test already in progress | Sync Accept (return existing) | No | N/A | Returns existing assessment |
| `assessment.placement.take` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |

### Mentoring / Feedback Domain Commands

| Command | Failure Type | Trigger Condition | Sync Reject or Async Fail | Event Emitted? | Retry Allowed? | Notes |
|---------|--------------|-------------------|---------------------------|----------------|----------------|-------|
| `mentoring.feedback.request` | ValidationError | Invalid submissionId or userId format, invalid priority enum value | Sync Reject | No | No | Client must fix payload |
| `mentoring.feedback.request` | NotFound | Submission does not exist | Sync Reject | No | No | Submission must exist first |
| `mentoring.feedback.request` | Forbidden | User ID does not match submission's attempt owner | Sync Reject | No | No | Authorization check |
| `mentoring.feedback.request` | Conflict | Submission type is not 'speaking' or 'writing' (feedback not applicable to quiz items) | Sync Reject | No | No | Business rule violation |
| `mentoring.feedback.request` | IdempotentReplay | Submission already has pending feedback request | Sync Accept (return existing) | No | N/A | Returns existing request |
| `mentoring.feedback.request` | TransientFailure | Database connection failure, practice-service unavailable for submission validation | Sync Reject | No | Yes | May succeed on retry |
| `mentoring.feedback.publish` | ValidationError | Invalid submissionId format, invalid authorRole enum value, empty text, rubric scores out of range (0.0-1.0), invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `mentoring.feedback.publish` | NotFound | Submission does not exist, authorId does not exist (if authorRole is 'teacher' or 'mentor') | Sync Reject | No | No | Entity must exist first |
| `mentoring.feedback.publish` | Forbidden | Author does not have permission to publish feedback | Sync Reject | No | No | Authorization check |
| `mentoring.feedback.publish` | Conflict | Rubric structure does not match submission type | Sync Reject | No | No | Business rule violation |
| `mentoring.feedback.publish` | IdempotentReplay | correlationId provided and feedback already published | Sync Accept (return existing) | No | N/A | Returns existing feedback |
| `mentoring.feedback.publish` | TransientFailure | Database connection failure, practice-service unavailable for submission validation | Sync Reject | No | Yes | May succeed on retry |

### Progress / Curriculum Domain Commands

| Command | Failure Type | Trigger Condition | Sync Reject or Async Fail | Event Emitted? | Retry Allowed? | Notes |
|---------|--------------|-------------------|---------------------------|----------------|----------------|-------|
| `curriculum.course.enroll` | ValidationError | Invalid userId or courseId format, invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `curriculum.course.enroll` | NotFound | User does not exist, course does not exist | Sync Reject | No | No | Entity must exist first |
| `curriculum.course.enroll` | Forbidden | User account suspended or deleted | Sync Reject | No | No | Authorization check |
| `curriculum.course.enroll` | Conflict | User already enrolled (if re-enrollment not allowed), course archived, course full capacity | Sync Reject | No | No | Business rule violation |
| `curriculum.course.enroll` | IdempotentReplay | correlationId provided and enrollment already exists | Sync Accept (return existing) | No | N/A | Returns existing enrollment |
| `curriculum.course.enroll` | TransientFailure | Database connection failure, onboarding-service unavailable for user validation | Sync Reject | No | Yes | May succeed on retry |
| `curriculum.unit.access` | ValidationError | Invalid userId, unitId, or courseId format, invalid reason enum value | Sync Reject | No | No | Client must fix payload |
| `curriculum.unit.access` | NotFound | User does not exist, unit does not exist, course does not exist | Sync Reject | No | No | Entity must exist first |
| `curriculum.unit.access` | Conflict | Unit does not belong to specified course | Sync Reject | No | No | Business rule violation |
| `curriculum.unit.access` | IdempotentReplay | Same access check already performed (returns same eligibility result) | Sync Accept (return existing) | No | N/A | Idempotent operation |
| `curriculum.unit.access` | TransientFailure | Database connection failure, curriculum-service unavailable for unlock rules query, motivation-progress-service unavailable for MasteryState query | Sync Reject | No | Yes | May succeed on retry |

### System / Automation Domain Commands

| Command | Failure Type | Trigger Condition | Sync Reject or Async Fail | Event Emitted? | Retry Allowed? | Notes |
|---------|--------------|-------------------|---------------------------|----------------|----------------|-------|
| `system.user.register` | ValidationError | Invalid email format, password does not meet security requirements, invalid role enum value, invalid targetLanguage enum value, invalid correlationId format | Sync Reject | No | No | Client must fix payload |
| `system.user.register` | Conflict | Email already registered | Sync Reject | No | No | Business rule violation (email uniqueness) |
| `system.user.register` | IdempotentReplay | correlationId provided and user already exists, or email already registered (same user) | Sync Accept (return existing) | No | N/A | Returns existing user |
| `system.user.register` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `system.user.login` | ValidationError | Invalid email format, invalid password format, invalid deviceId or correlationId format | Sync Reject | No | No | Client must fix payload |
| `system.user.login` | NotFound | Email does not exist in User entity | Sync Reject | No | No | User must exist first |
| `system.user.login` | Forbidden | Password does not match stored hash, user account suspended or deleted | Sync Reject | No | No | Authentication or authorization failure |
| `system.user.login` | IdempotentReplay | correlationId provided and session already exists | Sync Accept (return existing) | No | N/A | Returns existing session |
| `system.user.login` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `system.profile.modify` | ValidationError | Invalid userId format, invalid targetLanguage enum value, invalid avatarUrl format, invalid correlationId format, no fields provided (empty update) | Sync Reject | No | No | Client must fix payload |
| `system.profile.modify` | NotFound | User does not exist | Sync Reject | No | No | User must exist first |
| `system.profile.modify` | Forbidden | User ID does not match authenticated user | Sync Reject | No | No | Authorization check |
| `system.profile.modify` | IdempotentReplay | Same profile values already set (modifying with same values returns success) | Sync Accept (return success) | No | N/A | Idempotent operation |
| `system.profile.modify` | TransientFailure | Database connection failure | Sync Reject | No | Yes | May succeed on retry |
| `system.srs.schedule` | ValidationError | Invalid userId format, invalid courseId format, invalid scheduledAt ISO 8601 timestamp format | Sync Reject | No | No | Client must fix payload |
| `system.srs.schedule` | NotFound | User does not exist, course does not exist (if courseId provided) | Sync Reject | No | No | Entity must exist first |
| `system.srs.schedule` | Conflict | User has no active enrollments (if courseId not provided) | Sync Reject | No | No | Business rule violation |
| `system.srs.schedule` | IdempotentReplay | Same scheduling already performed (returns same due items) | Sync Accept (return existing) | No | N/A | Idempotent operation |
| `system.srs.schedule` | TransientFailure | Database connection failure, onboarding-service unavailable for user validation | Sync Reject | No | Yes | May succeed on retry |

---

## 3. Idempotency & Failure Interaction

### Safe Replay (IdempotentReplay)

When a command is replayed with the same intent and same correlation key (correlationId or natural key like email, userId + lessonId), the handler recognizes this as a safe replay and returns the existing result without creating duplicate state or emitting duplicate events.

**Key Characteristics**:
- Command is accepted (not rejected)
- No new state is created (existing state returned)
- No new event is emitted (event already emitted on first execution)
- Returns success with existing result

**Examples**:
- `learning.lesson.start` with same `correlationId` → returns existing attempt
- `system.user.register` with same `email` → returns existing user
- `learning.lesson.complete` on already-completed attempt → returns success (idempotent)

### Duplicate Conflict

When a command attempts to create a resource that already exists but without a correlationId or with a different intent, this is a Conflict, not IdempotentReplay.

**Key Characteristics**:
- Command is rejected (Conflict failure)
- No state is created
- No event is emitted
- Client must resolve conflict (e.g., check existing state first)

**Examples**:
- `learning.lesson.start` without correlationId when active attempt exists → Conflict
- `curriculum.course.enroll` when already enrolled (if re-enrollment not allowed) → Conflict
- `system.user.register` with existing email but different correlationId → Conflict

### When IdempotentReplay vs Conflict

**IdempotentReplay is returned when**:
- Same correlationId provided and resource already exists
- Natural key uniqueness check passes (e.g., email for registration)
- Command is idempotent by design (e.g., completing already-completed attempt)

**Conflict is returned when**:
- Resource already exists but no correlationId provided (or different correlationId)
- Business rule violation (e.g., active attempt exists, already enrolled)
- State conflict (e.g., attempt not in expected status)

**Principle**: IdempotentReplay is a success case (safe replay), Conflict is a failure case (business rule violation).

---

## 4. Sync Rejection vs Async Failure

### Synchronous Rejection (MUST reject before state change)

**What MUST be rejected synchronously**:
- ValidationError (invalid payload format, type, constraints)
- NotFound (referenced entity does not exist)
- Forbidden (authorization or permission failure)
- Conflict (business rule violation, state conflict)
- TransientFailure (if detected before state mutation)

**Rules**:
- Synchronous rejection MUST emit NO events
- State is NOT mutated on rejection
- Rejection happens before any state change
- Client receives immediate error response

**Examples**:
- Invalid email format → ValidationError (sync reject, no event)
- User does not exist → NotFound (sync reject, no event)
- Attempt does not belong to user → Forbidden (sync reject, no event)
- Lesson not unlocked → Conflict (sync reject, no event)

### Asynchronous Failure (MAY fail after acceptance)

**What MAY fail asynchronously**:
- TransientFailure that occurs after command acceptance but before event emission
- System failures during state mutation (rare, should be handled as TransientFailure)

**Rules**:
- Asynchronous failure is rare (most failures are synchronous)
- If state mutation begins but fails, this is still TransientFailure (retryable)
- No compensating events are emitted (no such events exist in event catalog)
- Failure is handled as TransientFailure (retryable)

**Principle**: In MVP, all failures are synchronous rejections. Asynchronous failures are exceptional and handled as TransientFailure.

---

## 5. Ownership & Boundary Rules for Failures

### Service Ownership of Rejections

**A service may reject only commands it owns**:
- `practice-service` rejects `learning.*` commands
- `assessment-service` rejects `assessment.*` commands
- `mentoring-service` rejects `mentoring.*` commands
- `curriculum-service` rejects `curriculum.course.enroll` and `system.srs.schedule`
- `progress-service` rejects `curriculum.unit.access`
- `onboarding-service` rejects `system.user.*` and `system.profile.*` commands

**A service MUST NOT reject based on foreign state mutation**:
- A service cannot reject a command because it would mutate foreign state
- A service can only reject based on its own state or read-only checks of foreign state

**Read-only checks of foreign state are allowed for validation**:
- `practice-service` may query `onboarding-service` to check user exists (read-only)
- `practice-service` may query `curriculum-service` to check lesson exists (read-only)
- `practice-service` may query `progress-service` to check unlock eligibility (read-only)
- These are validation checks, not rejection based on foreign state mutation

**Examples**:
- ✅ `learning.lesson.start` rejected because user does not exist (read-only check of foreign state)
- ✅ `learning.lesson.start` rejected because lesson not unlocked (read-only check of foreign state)
- ❌ `learning.lesson.start` rejected because it would update MasteryState (foreign state, not owned by practice-service)
- ✅ `curriculum.unit.access` queries curriculum-service for unlock rules (read-only, allowed)

**Principle**: Services validate using read-only queries of foreign state, but rejections are based on their own state or validation rules, not on preventing foreign state mutation.

---

## 6. Forbidden Failure Patterns

### Explicitly Forbidden Patterns

**Rejecting commands based on mastery, score, readiness**:
- ❌ Reject `learning.lesson.start` because mastery level insufficient
- ❌ Reject `learning.activity.submit` because score would be too low
- ❌ Reject `curriculum.unit.access` because readiness not met
- **Reason**: Mastery, score, and readiness are outcomes, not intent. Commands express intent, not outcomes.

**Cross-service rejection decisions**:
- ❌ `practice-service` rejects command because `progress-service` would reject it
- ❌ `assessment-service` rejects command because `motivation-progress-service` would reject it
- **Reason**: Each service makes its own rejection decisions based on its own state and validation rules.

**Emitting events for validation errors**:
- ❌ Emit `learning.lesson.start.failed` event on ValidationError
- ❌ Emit `system.user.register.failed` event on Conflict
- **Reason**: Events represent facts that happened, not errors. Validation errors are not facts, they are rejections.

**Using failures to "signal" progress or unlock**:
- ❌ Reject `curriculum.unit.access` to signal unit is locked
- ❌ Reject `learning.lesson.start` to signal progress insufficient
- **Reason**: Failures are decisions (rejection), not signals. Use queries or events to signal state, not rejections.

**Rejecting based on computed outcomes**:
- ❌ Reject `learning.lesson.complete` because computed score is below threshold
- ❌ Reject `assessment.quiz.submit` because computed readiness is insufficient
- **Reason**: Scores and readiness are computed outcomes, not validation criteria. Commands express intent, outcomes are computed.

**Principle**: Failures represent validation or business rule violations, not outcomes or signals. Outcomes are computed and represented in events, not in rejections.

---

## 7. Design Principles Summary

- **Commands express intent**: Commands represent user/system intent to perform actions, not outcomes or computed results.

- **Failures are decisions, not outcomes**: Failures represent validation failures or business rule violations, not computed outcomes like scores or mastery.

- **Events represent facts, not errors**: Events represent facts that already happened (past tense), not errors or rejections. Validation errors do not emit events.

- **Idempotency is a first-class failure concern**: Idempotent commands handle replays gracefully (IdempotentReplay), while non-idempotent conflicts are rejected (Conflict).

- **Synchronous rejection is the norm**: Most failures are synchronous rejections before state mutation. Asynchronous failures are exceptional and handled as TransientFailure.

- **Ownership boundaries respect read-only queries**: Services may query foreign state read-only for validation, but rejections are based on their own state or validation rules.

- **No outcome-based rejections**: Commands are not rejected based on computed outcomes (scores, mastery, readiness). Outcomes are computed after command acceptance.

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Command failure semantics defined for MVP  
**Related Documents**: 
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
- `docs/architecture/command-handler-event-flow.md` (STEP 4.3 - Handler event flow)
- `docs/architecture/state-ownership.md` (State ownership rules)
