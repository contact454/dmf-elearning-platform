# State Inventory & Ownership Freeze
## Kiểm kê Trạng thái và Đóng băng Quyền Sở hữu

This document provides a complete inventory of all states that exist, are implied, or are referenced across STEP 1 → STEP 4. The goal is to make all states explicit, classify them correctly, freeze state ownership boundaries, and prevent hidden or accidental state creation in STEP 5+.

---

## 1. State Classification Rules

### Write State (Authoritative, persisted, mutated by commands)

**Definition**: State that is the source of truth, persisted in storage, and mutated directly by command handlers.

**Rules**:
- Mutated synchronously by command handlers
- Persisted immediately before event emission
- Owned by exactly one service
- Other services may read but cannot write
- Changes trigger domain events

**Examples**: Attempt, Submission, Assessment, User, Enrollment

---

### Read State (Query-optimized, may be derived or cached)

**Definition**: State optimized for queries, may be derived from write state or cached for performance.

**Rules**:
- May be materialized views or cached copies
- Updated asynchronously from write state or events
- Can be rebuilt from source of truth
- Not mutated directly by commands
- May be owned by query service or shared

**Examples**: Course, Unit, Lesson (curriculum content), Activity

---

### Derived State (Computed from events, NOT written by commands)

**Definition**: State computed from domain events, never mutated directly by commands.

**Rules**:
- Computed asynchronously from events
- Never written by command handlers
- Owned by service that computes it
- May be recomputed from event history
- Represents aggregated or computed outcomes

**Examples**: ProgressState, MasteryState, ReadinessState

---

### Ephemeral State (In-memory, session-based, not persisted)

**Definition**: Temporary state that exists only during a session or request, not persisted.

**Rules**:
- Exists only in memory
- Not persisted to storage
- Tied to session or request lifecycle
- May be used for caching or temporary tracking
- Lost on service restart

**Examples**: Session (login session), temporary request context

---

## 2. State Inventory Table (MASTER)

| State Name | Category | Owning Service | Mutated By | Source of Truth | Notes |
|------------|----------|----------------|------------|-----------------|-------|
| Attempt | Write | practice-service | Command (learning.lesson.start, learning.lesson.complete, learning.lesson.abandon) | practice-service storage | Represents a single lesson session |
| Submission | Write | practice-service | Command (learning.activity.submit) | practice-service storage | Represents a single answer to an activity |
| Assessment | Write | assessment-service | Command (assessment.quiz.start, assessment.quiz.submit, assessment.placement.take) | assessment-service storage | Represents a formal test (quiz, placement, level exam) |
| Feedback | Write | mentoring-service | Command (mentoring.feedback.publish) | mentoring-service storage | Represents AI/teacher/mentor feedback on a submission |
| FeedbackRequest | Write | mentoring-service | Command (mentoring.feedback.request) | mentoring-service storage | Tracks feedback request status |
| Enrollment | Write | curriculum-service | Command (curriculum.course.enroll) | curriculum-service storage | Represents association between User and Course |
| User | Write | onboarding-service | Command (system.user.register, system.profile.modify) | onboarding-service storage | Represents identity and profile |
| LearnerProfile | Write | onboarding-service | Command (system.user.register, system.profile.modify) | onboarding-service storage | Extended profile for learners |
| Session | Ephemeral | onboarding-service | Command (system.user.login) | In-memory (not persisted) | Login session tracking |
| Course | Read | curriculum-service | None (curriculum content) | curriculum-service storage | Curriculum content, read-only for other services |
| Unit | Read | curriculum-service | None (curriculum content) | curriculum-service storage | Curriculum content, read-only for other services |
| Lesson | Read | curriculum-service | None (curriculum content) | curriculum-service storage | Curriculum content, read-only for other services |
| Activity | Read | curriculum-service | None (curriculum content) | curriculum-service storage | Curriculum content, read-only for other services |
| SRSItem | Write | curriculum-service | Event (curriculum.srs_items.due, indirect via system.srs.schedule) | curriculum-service storage | Spaced repetition state (intervals, ease factor, next review) |
| ProgressState | Derived | progress-service | Event (learning.lesson.completed, assessment.level_test.completed, curriculum.course.enrolled, etc.) | progress-service storage (computed) | Tracks which units/lessons are unlocked and completed |
| MasteryState | Derived | motivation-progress-service | Event (learning.lesson.completed, learning.submission.created, assessment.quiz.submitted, mentoring.feedback.published) | motivation-progress-service storage (computed) | Tracks per-skill and per-lesson mastery scores |
| ReadinessState | Derived | education/readiness-model | Event (assessment.level_test.completed, assessment.quiz.submitted) | Computed (may be cached) | Computed readiness status (not persisted directly) |
| SkillScore | Derived | motivation-progress-service | Event (learning.lesson.completed, assessment.quiz.submitted) | motivation-progress-service storage (computed) | Granular proficiency per skill (grammar, vocab, speaking, etc.) |

---

## 3. State-by-Service Breakdown

### practice-service

**Owned States**:
- Attempt (Write)
- Submission (Write)

**Read-only External States**:
- User (from onboarding-service)
- Lesson, Activity (from curriculum-service)
- ProgressState (from progress-service, for unlock checks)

**States it MUST NOT mutate**:
- ProgressState (owned by progress-service)
- MasteryState (owned by motivation-progress-service)
- Assessment (owned by assessment-service)
- Feedback (owned by mentoring-service)
- User (owned by onboarding-service)
- Course, Unit, Lesson (owned by curriculum-service)

---

### assessment-service

**Owned States**:
- Assessment (Write)

**Read-only External States**:
- User (from onboarding-service)
- Submission (from practice-service, for evaluation)

**States it MUST NOT mutate**:
- Attempt (owned by practice-service)
- Submission (owned by practice-service)
- MasteryState (owned by motivation-progress-service)
- ReadinessState (computed by education/readiness-model)
- ProgressState (owned by progress-service)
- User (owned by onboarding-service)

---

### mentoring-service

**Owned States**:
- Feedback (Write)
- FeedbackRequest (Write)

**Read-only External States**:
- Submission (from practice-service)
- User (from onboarding-service)

**States it MUST NOT mutate**:
- Submission (owned by practice-service)
- MasteryState (owned by motivation-progress-service, updated via event reactions)
- User (owned by onboarding-service)
- Attempt (owned by practice-service)

---

### curriculum-service

**Owned States**:
- Enrollment (Write)
- Course (Read - curriculum content)
- Unit (Read - curriculum content)
- Lesson (Read - curriculum content)
- Activity (Read - curriculum content)
- SRSItem (Write)

**Read-only External States**:
- User (from onboarding-service)
- ProgressState (from progress-service, for unlock eligibility checks)
- MasteryState (from motivation-progress-service, for unlock eligibility checks)

**States it MUST NOT mutate**:
- ProgressState (owned by progress-service)
- MasteryState (owned by motivation-progress-service)
- Attempt (owned by practice-service)
- Submission (owned by practice-service)
- User (owned by onboarding-service)

---

### progress-service

**Owned States**:
- ProgressState (Derived)

**Read-only External States**:
- User (from onboarding-service)
- Course, Unit, Lesson (from curriculum-service, for unlock rules)
- MasteryState (from motivation-progress-service, for unlock eligibility)

**States it MUST NOT mutate**:
- MasteryState (owned by motivation-progress-service)
- Course, Unit, Lesson (owned by curriculum-service, curriculum content)
- Enrollment (owned by curriculum-service)
- Attempt (owned by practice-service)
- User (owned by onboarding-service)

---

### motivation-progress-service

**Owned States**:
- MasteryState (Derived)
- SkillScore (Derived)

**Read-only External States**:
- User (from onboarding-service)
- Attempt (from practice-service)
- Submission (from practice-service)
- Assessment (from assessment-service)
- Feedback (from mentoring-service)

**States it MUST NOT mutate**:
- Attempt (owned by practice-service)
- Submission (owned by practice-service)
- Assessment (owned by assessment-service)
- Feedback (owned by mentoring-service)
- ProgressState (owned by progress-service)
- User (owned by onboarding-service)

---

### onboarding-service

**Owned States**:
- User (Write)
- LearnerProfile (Write)
- Session (Ephemeral)

**Read-only External States**:
- Enrollment (from curriculum-service)
- ProgressState (from progress-service)
- Assessment (from assessment-service, for placement results)
- ReadinessState (computed by education/readiness-model)

**States it MUST NOT mutate**:
- Enrollment (owned by curriculum-service)
- ProgressState (owned by progress-service)
- MasteryState (owned by motivation-progress-service)
- Attempt (owned by practice-service)
- Assessment (owned by assessment-service)

---

## 4. Command → State Touch Matrix

| Command | Write States Touched | Read States Accessed | Forbidden State Access |
|---------|---------------------|---------------------|----------------------|
| `learning.lesson.start` | Attempt (create) | User (onboarding-service), Lesson (curriculum-service), ProgressState (progress-service) | ProgressState (write), MasteryState (any), Course/Unit/Lesson (write) |
| `learning.lesson.complete` | Attempt (update) | Attempt (own), Submission (own) | ProgressState (write), MasteryState (write), Lesson (write) |
| `learning.lesson.abandon` | Attempt (update) | Attempt (own) | ProgressState (write), MasteryState (write), Lesson (write) |
| `learning.activity.submit` | Submission (create) | Attempt (own), Activity (curriculum-service) | ProgressState (write), MasteryState (write), Activity (write) |
| `assessment.quiz.start` | Assessment (create/update) | User (onboarding-service) | Attempt (write), Submission (write), MasteryState (write) |
| `assessment.quiz.submit` | Assessment (update) | Assessment (own) | MasteryState (write), ReadinessState (write), Attempt (write) |
| `assessment.placement.take` | Assessment (create) | User (onboarding-service) | ReadinessState (write), MasteryState (write), ProgressState (write) |
| `mentoring.feedback.request` | FeedbackRequest (create) | Submission (practice-service), User (onboarding-service) | Feedback (write), MasteryState (write), Submission (write) |
| `mentoring.feedback.publish` | Feedback (create) | Submission (practice-service), User (onboarding-service) | MasteryState (write), Submission (write), Attempt (write) |
| `curriculum.course.enroll` | Enrollment (create) | User (onboarding-service), Course (own) | ProgressState (write), MasteryState (write), User (write) |
| `curriculum.unit.access` | ProgressState (update, if eligible) | User (onboarding-service), Unit (curriculum-service), Course (curriculum-service), ProgressState (own), MasteryState (motivation-progress-service) | Unit (write), Course (write), MasteryState (write), Enrollment (write) |
| `system.user.register` | User (create), LearnerProfile (create) | None | ProgressState (write), MasteryState (write), ReadinessState (write) |
| `system.user.login` | Session (create, ephemeral) | User (own) | User (write), ProgressState (write), MasteryState (write) |
| `system.profile.modify` | User (update), LearnerProfile (update) | User (own) | ProgressState (write), MasteryState (write), ReadinessState (write) |
| `system.srs.schedule` | None (read-only) | User (onboarding-service), Course (curriculum-service, if provided), SRSItem (own), Enrollment (own) | SRSItem (write, indirect via event), ProgressState (write), MasteryState (write) |

---

## 5. Event → State Mutation Matrix

| Event | State Mutated | Mutation Type | Owning Service |
|-------|---------------|---------------|----------------|
| `learning.lesson.started` | Attempt | Create | practice-service |
| `learning.lesson.completed` | Attempt | Update | practice-service |
| `learning.lesson.completed` | ProgressState | Update (computed) | progress-service |
| `learning.lesson.completed` | MasteryState | Update (computed) | motivation-progress-service |
| `learning.lesson.completed` | SkillScore | Update (computed) | motivation-progress-service |
| `learning.lesson.abandoned` | Attempt | Update | practice-service |
| `learning.submission.created` | Submission | Create | practice-service |
| `learning.submission.created` | MasteryState | Update (computed) | motivation-progress-service |
| `assessment.quiz.started` | Assessment | Create/Update | assessment-service |
| `assessment.quiz.submitted` | Assessment | Update | assessment-service |
| `assessment.quiz.submitted` | MasteryState | Update (computed) | motivation-progress-service |
| `assessment.quiz.submitted` | ReadinessState | Update (computed) | education/readiness-model |
| `assessment.level_test.completed` | Assessment | Update | assessment-service |
| `assessment.level_test.completed` | ProgressState | Update (computed) | progress-service |
| `assessment.level_test.completed` | ReadinessState | Update (computed) | education/readiness-model |
| `mentoring.feedback.requested` | FeedbackRequest | Create | mentoring-service |
| `mentoring.feedback.published` | Feedback | Create | mentoring-service |
| `mentoring.feedback.published` | MasteryState | Update (computed) | motivation-progress-service |
| `curriculum.course.enrolled` | Enrollment | Create | curriculum-service |
| `curriculum.course.enrolled` | ProgressState | Initialize (computed) | progress-service |
| `curriculum.unit.unlocked` | ProgressState | Update (computed) | progress-service |
| `curriculum.srs_items.due` | SRSItem | Update (indirect) | curriculum-service |
| `system.user.registered` | User | Create | onboarding-service |
| `system.user.registered` | LearnerProfile | Create | onboarding-service |
| `system.user.registered` | ProgressState | Initialize (computed) | progress-service |
| `system.user.login` | Session | Create (ephemeral) | onboarding-service |
| `system.profile.updated` | User | Update | onboarding-service |
| `system.profile.updated` | LearnerProfile | Update | onboarding-service |
| `system.profile.updated` | ProgressState | Reset/Recompute (computed, if targetLanguage changed) | progress-service |
| `system.profile.updated` | MasteryState | Reset/Recompute (computed, if targetLanguage changed) | motivation-progress-service |
| `system.profile.updated` | ReadinessState | Reset/Recompute (computed, if targetLanguage changed) | education/readiness-model |

---

## 6. Explicitly Forbidden States

### States that MUST NOT exist

**masteryState written by commands**:
- ❌ Command `learning.lesson.complete` writing MasteryState directly
- ❌ Command `assessment.quiz.submit` writing MasteryState directly
- **Reason**: MasteryState is derived state, computed from events. Commands express intent, not outcomes. Mastery is an outcome computed by motivation-progress-service from learning events.

**progressState written by commands**:
- ❌ Command `learning.lesson.start` writing ProgressState directly
- ❌ Command `curriculum.course.enroll` writing ProgressState directly
- **Reason**: ProgressState is derived state, computed from events. Commands express intent, not outcomes. Progress is an outcome computed by progress-service from learning and enrollment events.

**unlock booleans stored in curriculum**:
- ❌ `unlocked` field in Lesson entity
- ❌ `unlocked` field in Unit entity
- **Reason**: Unlock status is learner state (ProgressState), not curriculum content. Curriculum content (Course, Unit, Lesson) is read-only content. Unlock eligibility is computed by progress-service based on ProgressState and curriculum rules.

**score fields in command payloads**:
- ❌ `score` field in `learning.lesson.complete` command
- ❌ `score` field in `assessment.quiz.submit` command
- **Reason**: Scores are computed outcomes, not intent. Commands express intent, scores are computed by services and represented in events.

**readinessState written by commands**:
- ❌ Command `assessment.placement.take` writing ReadinessState directly
- ❌ Command `assessment.quiz.submit` writing ReadinessState directly
- **Reason**: ReadinessState is derived state, computed from events. Commands express intent, not outcomes. Readiness is an outcome computed by education/readiness-model from assessment events.

**progress flags embedded in lesson**:
- ❌ `completed` field in Lesson entity
- ❌ `inProgress` field in Lesson entity
- **Reason**: Progress status is learner state (ProgressState), not curriculum content. Curriculum content (Lesson) is read-only content. Progress is tracked in ProgressState by progress-service.

**mastery flags in attempt**:
- ❌ `mastered` field in Attempt entity
- ❌ `masteryScore` field in Attempt entity
- **Reason**: Mastery is computed state (MasteryState), not session state. Attempt represents a single lesson session. Mastery is computed by motivation-progress-service from multiple events.

**unlock command state**:
- ❌ `Unlock` entity or state
- ❌ `UnlockRequest` entity or state
- **Reason**: Unlock is an outcome, not an intent. Use `curriculum.unit.access` (internal command) to check eligibility. Unlock status is represented in ProgressState, computed from events.

---

## 7. Freeze Declaration

**This inventory is FROZEN.**

All states listed in this document are the complete and final inventory for MVP. All future steps (STEP 5+) MUST conform to this inventory:

- **No new states may be added** without explicit architecture review
- **State ownership boundaries are fixed** - services may only mutate states they own
- **Derived states remain derived** - they cannot be mutated by commands
- **Read states remain read-only** - curriculum content cannot be mutated by learning commands
- **Ephemeral states remain ephemeral** - they are not persisted

**State Classification Rules are LOCKED**:
- Write State: Authoritative, persisted, mutated by commands
- Read State: Query-optimized, may be derived or cached
- Derived State: Computed from events, NOT written by commands
- Ephemeral State: In-memory, session-based, not persisted

**Ownership Rules are FROZEN**:
- Each state has exactly one owning service
- Only the owning service may mutate the state
- Other services may read but cannot write
- Derived states are computed from events, never from commands

**This document serves as the authoritative reference** for all state-related decisions in STEP 5+.

---

**Last Updated**: 2024-12-19  
**Status**: ✅ FROZEN - State inventory complete and locked  
**Related Documents**: 
- `docs/architecture/state-ownership.md` (State ownership rules)
- `docs/architecture/learning-state-model.md` (Learning state model)
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
- `docs/architecture/command-handler-event-flow.md` (STEP 4.3 - Handler event flow)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Failure semantics)
