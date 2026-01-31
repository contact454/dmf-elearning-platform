**Status**: FROZEN  
**Freeze Scope**: STEP 5A — State Models + Ownership Invariants  
**Freeze Date**: 2026-01-17 (Asia/Ho_Chi_Minh)  
**Freeze Notes**:
- ReadinessState is computed by education/readiness-model (pure) and may be cached by assessment-service (cache is not source of truth).
- SRSItem mutation flow clarified: system.srs.schedule → curriculum.srs_items.due → curriculum-service updates SRSItem (event reaction).

---

# State Ownership Invariants (Freeze)
## Bất biến Quyền Sở hữu Trạng thái (Đóng băng)

This document defines hard rules for state ownership and mutation boundaries. These invariants must be enforced to prevent cross-service state mutations and maintain architectural integrity.

---

## 1. Ownership Rules (Hard Rules)

### Rule 1: Single Writer per State

**A service may mutate ONLY its owned write states.**

Each state entity has exactly one owning service that has exclusive WRITE access. Other services can READ or REACT via events, but cannot directly mutate foreign state.

**Enforcement**:
- Command handlers may only write to states owned by their service
- Direct database writes to foreign state are forbidden
- Cross-service mutation APIs are forbidden

**Examples**:
- ✅ `practice-service` writes Attempt (owned by practice-service)
- ✅ `assessment-service` writes Assessment (owned by assessment-service)
- ❌ `practice-service` writes ProgressState (owned by progress-service)
- ❌ `assessment-service` writes MasteryState (owned by motivation-progress-service)

---

### Rule 2: Derived States are Event-Only

**A service may update derived states ONLY from events.**

Derived states (ProgressState, MasteryState, SkillScore, ReadinessState) are computed from domain events. They are NEVER written by command handlers.

**Enforcement**:
- Command handlers must NOT write derived states
- Derived states are updated only by event consumers
- Event consumers may read foreign state but write only their own derived state

**Examples**:
- ✅ `progress-service` updates ProgressState from `learning.lesson.completed` event
- ✅ `motivation-progress-service` updates MasteryState from `learning.lesson.completed` event
- ❌ `learning.lesson.complete` command writes ProgressState directly
- ❌ `assessment.quiz.submit` command writes MasteryState directly

---

### Rule 3: Cross-Service State Mutation is Forbidden

**No service may directly mutate state owned by another service.**

State mutations must happen through:
1. Commands (write states only, owned by handling service)
2. Events (derived states only, consumed by owning service)

**Enforcement**:
- No direct database access to foreign state for writes
- No cross-service mutation APIs
- No shared write access to state

**Examples**:
- ✅ `practice-service` reads User (read-only) to validate command
- ✅ `progress-service` reads MasteryState (read-only) to check unlock eligibility
- ❌ `practice-service` writes ProgressState (cross-service mutation)
- ❌ `assessment-service` writes MasteryState (cross-service mutation)

---

## 2. Allowed Read Access (Soft Rules)

### Read-Only Lookups Between Services

Services may read foreign state for validation and decision-making, but must not mutate it.

**Allowed Patterns**:

**practice-service**:
- Reads User (from onboarding-service) to validate user exists
- Reads Lesson, Activity (from curriculum-service) to validate lesson/activity exists
- Reads ProgressState (from progress-service) to check unlock eligibility

**assessment-service**:
- Reads User (from onboarding-service) to validate user exists
- Reads Submission (from practice-service) to evaluate answers (if applicable)

**mentoring-service**:
- Reads Submission (from practice-service) to generate feedback
- Reads User (from onboarding-service) to validate user exists

**curriculum-service**:
- Reads User (from onboarding-service) to validate user exists
- Reads ProgressState (from progress-service) to check unlock eligibility (read-only API)
- Reads MasteryState (from motivation-progress-service) to check unlock eligibility (read-only API)

**progress-service**:
- Reads User (from onboarding-service) to validate user exists
- Reads Course, Unit, Lesson (from curriculum-service) to check unlock rules (read-only)
- Reads MasteryState (from motivation-progress-service) to check unlock eligibility (read-only)

**motivation-progress-service**:
- Reads User (from onboarding-service) to validate user exists
- Reads Attempt (from practice-service) to compute mastery
- Reads Submission (from practice-service) to compute mastery
- Reads Assessment (from assessment-service) to compute mastery
- Reads Feedback (from mentoring-service) to compute mastery

**onboarding-service**:
- Reads Enrollment (from curriculum-service) to display user enrollments
- Reads ProgressState (from progress-service) to display user progress
- Reads Assessment (from assessment-service) to display placement results
- Reads ReadinessState (computed by education/readiness-model) to display readiness status

**Note**: These are conceptual reads. Implementation may use:
- Direct service-to-service API calls (read-only endpoints)
- Event sourcing (read from event stream)
- Shared read replicas (read-only database access)

**Must not imply direct DB access**: Services should not access foreign databases directly. Use service APIs or read replicas.

---

## 3. Forbidden Patterns (With examples)

### Pattern 1: Commands Writing Mastery/Progress

**Forbidden**:
- ❌ Command `learning.lesson.complete` writing MasteryState directly
- ❌ Command `assessment.quiz.submit` writing MasteryState directly
- ❌ Command `learning.lesson.start` writing ProgressState directly
- ❌ Command `curriculum.course.enroll` writing ProgressState directly

**Reason**: MasteryState and ProgressState are derived states, computed from events. Commands express intent, not outcomes. Mastery and progress are outcomes computed by owning services from learning events.

**Correct Pattern**:
- ✅ Command `learning.lesson.complete` updates Attempt, emits `learning.lesson.completed` event
- ✅ `motivation-progress-service` consumes `learning.lesson.completed` event, updates MasteryState
- ✅ `progress-service` consumes `learning.lesson.completed` event, updates ProgressState

---

### Pattern 2: Embedding Progress Flags in Curriculum Entities

**Forbidden**:
- ❌ `unlocked` field in Lesson entity
- ❌ `unlocked` field in Unit entity
- ❌ `completed` field in Lesson entity
- ❌ `inProgress` field in Lesson entity

**Reason**: Progress status is learner state (ProgressState), not curriculum content. Curriculum content (Course, Unit, Lesson) is read-only content. Unlock eligibility is computed by progress-service based on ProgressState and curriculum rules.

**Correct Pattern**:
- ✅ ProgressState tracks unlockedUnitIds and unlockedLessonIds (learner state)
- ✅ Curriculum entities (Course, Unit, Lesson) are read-only content
- ✅ progress-service queries curriculum-service (read-only) for unlock rules, then updates ProgressState

---

### Pattern 3: Storing Unlock Booleans in Curriculum

**Forbidden**:
- ❌ `isUnlocked` field in Course entity
- ❌ `unlockStatus` field in Unit entity
- ❌ `unlockRules` stored as part of Lesson entity

**Reason**: Unlock status is learner state (ProgressState), not curriculum content. Curriculum content defines rules (luật học), not learner state (trạng thái người học). Unlock eligibility is computed by progress-service based on ProgressState and curriculum rules.

**Correct Pattern**:
- ✅ Curriculum entities define unlock rules (prerequisites, mastery thresholds)
- ✅ progress-service queries curriculum-service (read-only) for unlock rules
- ✅ progress-service computes unlock eligibility based on ProgressState and rules
- ✅ progress-service updates ProgressState (unlockedUnitIds, unlockedLessonIds)

---

### Pattern 4: Using Score/Mastery/Unlock Fields in Command Payloads

**Forbidden**:
- ❌ `score` field in `learning.lesson.complete` command
- ❌ `score` field in `assessment.quiz.submit` command
- ❌ `masteryLevel` field in `learning.lesson.complete` command
- ❌ `unlocked` field in `curriculum.unit.access` command

**Reason**: Scores, mastery, and unlock status are computed outcomes, not intent. Commands express intent, scores are computed by services and represented in events.

**Correct Pattern**:
- ✅ Command `learning.lesson.complete` contains only `attemptId` and `status`
- ✅ Service computes score from submissions, updates Attempt, emits event with score
- ✅ Command `assessment.quiz.submit` contains only `assessmentId` and `answers`
- ✅ Service computes score from answers, updates Assessment, emits event with score

---

### Pattern 5: Cross-Service Rejection Decisions

**Forbidden**:
- ❌ `practice-service` rejects command because `progress-service` would reject it
- ❌ `assessment-service` rejects command because `motivation-progress-service` would reject it
- ❌ `curriculum-service` rejects command because `progress-service` would reject it

**Reason**: Each service makes its own rejection decisions based on its own state and validation rules. Services may read foreign state for validation, but rejections are based on their own state or validation rules, not on preventing foreign state mutation.

**Correct Pattern**:
- ✅ `practice-service` reads ProgressState (read-only) to check unlock eligibility, rejects if not unlocked
- ✅ `practice-service` reads User (read-only) to validate user exists, rejects if user does not exist
- ✅ Each service validates based on its own state and read-only checks of foreign state

---

### Pattern 6: Mastery Flags in Attempt

**Forbidden**:
- ❌ `mastered` field in Attempt entity
- ❌ `masteryScore` field in Attempt entity
- ❌ `skillScores` field in Attempt entity

**Reason**: Mastery is computed state (MasteryState), not session state. Attempt represents a single lesson session. Mastery is computed by motivation-progress-service from multiple events.

**Correct Pattern**:
- ✅ Attempt contains only session state (status, score for this attempt)
- ✅ MasteryState contains aggregated mastery scores across all attempts
- ✅ motivation-progress-service computes MasteryState from `learning.lesson.completed` events

---

### Pattern 7: Unlock Command State

**Forbidden**:
- ❌ `Unlock` entity or state
- ❌ `UnlockRequest` entity or state
- ❌ `UnlockEvent` entity or state

**Reason**: Unlock is an outcome, not an intent. Use `curriculum.unit.access` (internal command) to check eligibility. Unlock status is represented in ProgressState, computed from events.

**Correct Pattern**:
- ✅ `curriculum.unit.access` (internal command) checks eligibility, updates ProgressState if eligible
- ✅ ProgressState tracks unlockedUnitIds and unlockedLessonIds
- ✅ `curriculum.unit.unlocked` event is informational (emitted after ProgressState updated)

---

## 4. Enforcement Checklist

Use this checklist to review PRs and reject violations:

### Command Handler Review

- [ ] Command handler writes ONLY to states owned by its service
- [ ] Command handler does NOT write derived states (ProgressState, MasteryState, SkillScore, ReadinessState)
- [ ] Command handler does NOT write foreign state directly
- [ ] Command handler reads foreign state only for validation (read-only)
- [ ] Command payload does NOT contain score, mastery, or unlock fields

### Event Consumer Review

- [ ] Event consumer writes ONLY to states owned by its service
- [ ] Event consumer does NOT write foreign state directly
- [ ] Event consumer may read foreign state for computation (read-only)
- [ ] Derived state updates happen only in event consumers, not command handlers

### State Model Review

- [ ] State model does NOT contain unlock flags in curriculum entities
- [ ] State model does NOT contain progress flags in curriculum entities
- [ ] State model does NOT contain mastery flags in session entities (Attempt)
- [ ] State model does NOT contain score fields in command payloads
- [ ] State model separates learner state from curriculum content

### Service API Review

- [ ] Service API does NOT expose mutation endpoints for foreign state
- [ ] Service API exposes read-only endpoints for foreign state (if needed)
- [ ] Service API does NOT allow cross-service state mutation
- [ ] Service API validates ownership before mutations

### Database Access Review

- [ ] Service does NOT write directly to foreign databases
- [ ] Service may read from foreign databases (read replicas) for validation
- [ ] Service uses service APIs or event sourcing for foreign state access
- [ ] Service does NOT share write access to state

---

**Last Updated**: 2024-12-19  
**Status**: ✅ FROZEN - Ownership invariants defined and locked  
**Related Documents**: 
- `docs/architecture/state-inventory.md` (State inventory - authoritative source)
- `docs/architecture/state-models.md` (STEP 5A - State models)
- `docs/architecture/state-ownership.md` (State ownership rules)
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
