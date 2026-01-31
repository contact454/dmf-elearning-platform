Status: FROZEN

Freeze Scope:
- STEP 5B — State Transition Mapping (Write + Derived)
- STEP 5C — Event Contracts (Payload + Validation)

Freeze Date:
- 2026-01-17 (Asia/Ho_Chi_Minh)

Freeze Notes:
- All command → state transitions align with STEP 4.1–4.4 and STEP 5A.
- Derived states are updated by event reactions only.
- ReadinessState is computed by education/readiness-model (pure) and may be cached; cache is not source of truth.
- Event payloads are IDs-only and match contracts/events/events.catalog.md.
- system.user.login is the canonical login event name per catalog.

---

# STEP 5B — State Transition Mapping (Write + Derived)
## Ánh xạ Chuyển trạng thái (Ghi + Tính toán)

This document provides field-level mapping of state transitions for all service-owned states. It defines which commands mutate write states and which events update derived states, with explicit field-level changes and idempotency strategies.

---

## 0. Rules (Quy tắc)

- **Single-writer enforcement**: Each state has exactly one owning service with exclusive write access
- **Commands mutate only owned write state**: Command handlers may only write to states owned by their service
- **Derived state updated by events only**: Derived states (ProgressState, MasteryState, SkillScore) are never written by commands, only updated via event reactions
- **Idempotency rules**: Commands support idempotency via correlationId or natural keys (userId + entityId)
- **Event replay safety**: Events are designed for at-least-once delivery; event consumers must handle duplicate events idempotently

---

## 1. Mapping Index (Mục lục ánh xạ)

**Services covered**:
1. `practice-service` - Attempt, Submission
2. `assessment-service` - Assessment, ReadinessState (cached)
3. `mentoring-service` - Feedback, FeedbackRequest
4. `curriculum-service` - Enrollment, SRSItem
5. `progress-service` - ProgressState (derived)
6. `motivation-progress-service` - MasteryState, SkillScore (derived)
7. `onboarding-service` - User, LearnerProfile, Session

---

## practice-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

#### State: Attempt

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `learning.lesson.start`
  - **Preconditions (điều kiện sync)**:
    - User exists (read from onboarding-service)
    - Lesson exists (read from curriculum-service)
    - Lesson is unlocked for user (read ProgressState from progress-service, query unlock rules from curriculum-service)
    - No active attempt exists for this lesson (or allow resume)
    - If `correlationId` provided, check for existing attempt with same correlationId
  - **Writes (ghi field-level)**:
    - `attemptId`: Generated (new entity)
    - `userId`: From command.userId
    - `lessonId`: From command.lessonId
    - `status`: Set to 'in-progress'
    - `startedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - `score` (computed later, not in command)
    - `completedAt` (not applicable for new attempt)
    - ProgressState (owned by progress-service)
    - MasteryState (owned by motivation-progress-service)
  - **Emits (phát sự kiện)**: `learning.lesson.started` (attemptId, userId, lessonId)
  - **Idempotency**: If `correlationId` provided and attempt exists with same correlationId, return existing attempt

- **Command**: `learning.lesson.complete`
  - **Preconditions (điều kiện sync)**:
    - Attempt exists
    - Attempt is in 'in-progress' status
    - Attempt belongs to authenticated user (authorization check)
  - **Writes (ghi field-level)**:
    - `status`: Set to 'completed' or 'abandoned' (from command.status)
    - `score`: Computed from submissions (if status is 'completed', service logic)
    - `completedAt`: Set to current timestamp
    - `version`: Incremented
  - **Does NOT write (không được ghi)**:
    - `attemptId`, `userId`, `lessonId`, `startedAt` (immutable after creation)
    - MasteryState (updated via event reactions)
    - ProgressState (updated via event reactions)
  - **Emits (phát sự kiện)**:
    - `learning.lesson.completed` (attemptId, userId, lessonId, score) - if status is 'completed'
    - `learning.lesson.abandoned` (attemptId, userId, lessonId) - if status is 'abandoned'
  - **Idempotency**: Completing an already-completed attempt returns success (idempotent)

- **Command**: `learning.lesson.abandon`
  - **Preconditions (điều kiện sync)**:
    - Attempt exists
    - Attempt is in 'in-progress' status
    - Attempt belongs to authenticated user (authorization check)
  - **Writes (ghi field-level)**:
    - `status`: Set to 'abandoned'
    - `completedAt`: Set to current timestamp
    - `version`: Incremented
  - **Does NOT write (không được ghi)**:
    - `score` (not computed for abandoned attempts)
    - MasteryState (not updated for abandoned attempts)
    - ProgressState (not updated for abandoned attempts)
  - **Emits (phát sự kiện)**: `learning.lesson.abandoned` (attemptId, userId, lessonId)
  - **Idempotency**: Abandoning an already-abandoned attempt returns success (idempotent)

#### State: Submission

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `learning.activity.submit`
  - **Preconditions (điều kiện sync)**:
    - Attempt exists and is in 'in-progress' status
    - Activity exists and belongs to the lesson in the attempt (read from curriculum-service)
    - Submission type matches activity type
    - Required fields present based on type (audioUrl for speaking, text for writing, answer for quiz/listening)
    - If `correlationId` provided, check for existing submission with same correlationId
  - **Writes (ghi field-level)**:
    - `submissionId`: Generated (new entity)
    - `attemptId`: From command.attemptId
    - `activityId`: From command.activityId
    - `lessonId`: Denormalized from attempt.lessonId
    - `type`: From command.type ('speaking' | 'writing' | 'quiz' | 'listening')
    - `audioUrl`: From command.audioUrl (if type is 'speaking')
    - `durationMs`: From command.durationMs (if type is 'speaking', optional)
    - `text`: From command.text (if type is 'writing')
    - `answer`: From command.answer (if type is 'quiz' or 'listening')
    - `createdAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - MasteryState (updated via event reactions)
    - ProgressState (updated via event reactions)
    - Attempt state (read-only, to validate attempt)
  - **Emits (phát sự kiện)**: `learning.submission.created` (submissionId, attemptId, activityId, lessonId, type)
  - **Idempotency**: If `correlationId` provided and submission exists with same correlationId, return existing submission

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

None. practice-service owns only write states.

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads User (from onboarding-service) to validate user exists
- Reads Lesson, Activity (from curriculum-service) to validate lesson/activity exists
- Reads ProgressState (from progress-service) to check unlock eligibility

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate ProgressState (owned by progress-service)
- MUST NOT mutate MasteryState (owned by motivation-progress-service)
- MUST NOT mutate Assessment (owned by assessment-service)
- MUST NOT mutate Feedback (owned by mentoring-service)
- MUST NOT mutate User (owned by onboarding-service)
- MUST NOT mutate Course, Unit, Lesson, Activity (owned by curriculum-service, read-only content)

---

## assessment-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

#### State: Assessment

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `assessment.quiz.start`
  - **Preconditions (điều kiện sync)**:
    - User exists (read from onboarding-service)
    - Assessment exists
    - Assessment is available for user (not already completed, not expired)
    - If `correlationId` provided, check for existing assessment attempt with same correlationId
  - **Writes (ghi field-level)**:
    - `assessmentId`: From command.assessmentId or generated (if creating new)
    - `userId`: From command.userId
    - `status`: Set to 'in-progress'
    - `startedAt`: Set to current timestamp
    - `version`: Set to 1 (if new) or incremented (if updating)
  - **Does NOT write (không được ghi)**:
    - `score` (computed later, not in command)
    - `cefrLevel` (computed after completion, not in command)
    - `answers` (not submitted yet)
    - `submittedAt`, `gradedAt` (not applicable yet)
  - **Emits (phát sự kiện)**: `assessment.quiz.started` (assessmentId, userId, attemptId if applicable)
  - **Idempotency**: If `correlationId` provided and assessment attempt exists, return existing attempt

- **Command**: `assessment.quiz.submit`
  - **Preconditions (điều kiện sync)**:
    - Assessment exists and is in 'in-progress' status
    - Answers array is non-empty and matches question count
    - Answer format matches assessment type
    - If `attemptId` provided, it matches assessment's current attempt
  - **Writes (ghi field-level)**:
    - `answers`: Set from command.answers
    - `score`: Computed from answers (service logic, not in command)
    - `status`: Set to 'graded'
    - `submittedAt`: Set to current timestamp
    - `gradedAt`: Set to current timestamp
    - `version`: Incremented
  - **Does NOT write (không được ghi)**:
    - `assessmentId`, `userId`, `type`, `startedAt` (immutable after creation)
    - `cefrLevel` (only for placement tests, computed separately)
    - MasteryState (updated via event reactions)
    - ReadinessState (computed read-only, not mutated)
  - **Emits (phát sự kiện)**: `assessment.quiz.submitted` (assessmentId, userId, score)
  - **Idempotency**: If `correlationId` provided and submission already processed, return existing result

- **Command**: `assessment.placement.take`
  - **Preconditions (điều kiện sync)**:
    - User exists (read from onboarding-service)
    - Target language is valid LanguageCode enum value
    - User does not have recent placement test result (or allow retake)
    - If `correlationId` provided, check for existing placement test with same correlationId
  - **Writes (ghi field-level)**:
    - `assessmentId`: Generated (new entity)
    - `userId`: From command.userId
    - `type`: Set to 'placement'
    - `status`: Set to 'in-progress'
    - `startedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - `score` (computed after completion, not in command)
    - `cefrLevel` (computed after completion, not in command)
    - `answers` (not submitted yet)
    - ReadinessState (computed after completion, not in command)
  - **Emits (phát sự kiện)**: No event emitted immediately (event emitted only after full test completion via `assessment.quiz.submit` or similar, then `assessment.level_test.completed` with assessmentId, userId, cefrLevel)
  - **Idempotency**: If `correlationId` provided and placement test in progress, return existing assessment

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

None. assessment-service owns only write states.

### 3) Cached Computed States (Trạng thái Tính toán — có thể cache)

#### State: ReadinessState

**Note**: ReadinessState is NOT owned by any service. It is computed by `education/readiness-model` (pure, stateless function) from MasteryState + Assessment results. `assessment-service` (preferred) or `onboarding-service` (optional) may cache computed results for performance, but the cache is NOT the source of truth.

**Cache Invalidation Triggers (Sự kiện làm mất hiệu lực cache)**:

- **Event**: `assessment.quiz.submitted`
  - **Rationale**: Quiz submission may affect readiness assessment (new assessment data available)
  - **Action**: Invalidate ReadinessState cache (recompute on next read)
  - **Cache fields affected**: All fields (full recomputation)

- **Event**: `assessment.level_test.completed`
  - **Rationale**: Level test completion provides definitive readiness assessment (CEFR level determined)
  - **Action**: Invalidate ReadinessState cache (recompute on next read)
  - **Cache fields affected**: All fields (full recomputation)

- **Event**: `learning.lesson.completed`
  - **Rationale**: Lesson completion with high score may indicate readiness progress (if score indicates significant mastery improvement)
  - **Action**: May invalidate ReadinessState cache if score indicates significant progress (recompute on next read, conditional on score threshold)
  - **Cache fields affected**: All fields (full recomputation if invalidated)

- **Event**: `mentoring.feedback.published`
  - **Rationale**: Feedback on speaking/writing may affect readiness assessment (if feedback significantly impacts mastery)
  - **Action**: May invalidate ReadinessState cache if feedback affects mastery significantly (recompute on next read, conditional on feedback impact)
  - **Cache fields affected**: All fields (full recomputation if invalidated)

- **Event**: `system.profile.updated`
  - **Rationale**: Target language change resets all learning states including readiness
  - **Action**: Invalidate ReadinessState cache (recompute on next read, if targetLanguage changed)
  - **Cache fields affected**: All fields (full recomputation if targetLanguage changed)

**Cache Behavior**:
- Cache is optional (computation can happen on-demand)
- Cache must be invalidated when relevant events occur
- Cache is NOT the source of truth (computation logic is authoritative)
- Cache may be stored by assessment-service or onboarding-service for performance
- Cache includes `computedAt` timestamp to track freshness

**No State Ownership Violation**:
- ReadinessState is NOT mutated by any service
- Services may cache computed results but do not own the state
- Computation is pure function (no side effects, no state mutation)
- Cache invalidation does not mutate state (only marks cache as stale)

### 4) External Reads Allowed (Được phép đọc từ service khác)

- Reads User (from onboarding-service) to validate user exists
- Reads Submission (from practice-service) to evaluate answers (if applicable)
- Reads MasteryState (from motivation-progress-service) for readiness computation (read-only)
- Reads Assessment (own state) for readiness computation

### 5) Forbidden Mutations (Cấm)

- MUST NOT mutate Attempt (owned by practice-service)
- MUST NOT mutate Submission (owned by practice-service)
- MUST NOT mutate MasteryState (owned by motivation-progress-service)
- MUST NOT mutate ReadinessState (computed by education/readiness-model, may cache but not own)
- MUST NOT mutate ProgressState (owned by progress-service)
- MUST NOT mutate User (owned by onboarding-service)

---

## mentoring-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

#### State: Feedback

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `mentoring.feedback.publish`
  - **Preconditions (điều kiện sync)**:
    - Submission exists (read from practice-service)
    - Author ID exists if authorRole is 'teacher' or 'mentor'
    - Author role is valid enum value ('teacher', 'mentor', or 'ai')
    - Text is non-empty
    - Rubric scores are in range 0.0-1.0 if provided
    - Rubric structure matches submission type
    - If `correlationId` provided, check for existing feedback with same correlationId
  - **Writes (ghi field-level)**:
    - `feedbackId`: Generated (new entity)
    - `submissionId`: From command.submissionId
    - `authorId`: From command.authorId
    - `authorRole`: From command.authorRole ('teacher' | 'mentor' | 'ai')
    - `text`: From command.text
    - `corrections`: From command.corrections (optional)
    - `rubricScores`: From command.rubricScores (optional, structure depends on submission type)
    - `publishedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - Submission state (read-only, from practice-service)
    - MasteryState (updated via event reactions)
    - ProgressState (not accessed)
  - **Emits (phát sự kiện)**: `mentoring.feedback.published` (feedbackId, submissionId, authorRole, authorId)
  - **Idempotency**: If `correlationId` provided and feedback already published, return existing feedback

#### State: FeedbackRequest

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `mentoring.feedback.request`
  - **Preconditions (điều kiện sync)**:
    - Submission exists (read from practice-service)
    - User ID matches submission's attempt owner
    - Submission type is 'speaking' or 'writing' (feedback not applicable to quiz items)
    - Priority is valid enum value if provided
  - **Writes (ghi field-level)**:
    - `feedbackRequestId`: Generated (new entity) or return existing if pending request exists
    - `submissionId`: From command.submissionId
    - `userId`: From command.userId
    - `priority`: From command.priority (default 'normal')
    - `status`: Set to 'pending'
    - `requestedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - Feedback state (not yet created)
    - Submission state (read-only)
    - MasteryState (not accessed)
  - **Emits (phát sự kiện)**: `mentoring.feedback.requested` (submissionId, userId, priority if provided)
  - **Idempotency**: Requesting feedback on submission that already has pending request returns existing request

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

None. mentoring-service owns only write states.

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads Submission (from practice-service) to generate feedback
- Reads User (from onboarding-service) to validate user exists

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate Submission (owned by practice-service)
- MUST NOT mutate MasteryState (owned by motivation-progress-service, updated via event reactions)
- MUST NOT mutate User (owned by onboarding-service)
- MUST NOT mutate Attempt (owned by practice-service)

---

## curriculum-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

#### State: Enrollment

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `curriculum.course.enroll`
  - **Preconditions (điều kiện sync)**:
    - User exists (read from onboarding-service)
    - Course exists
    - Course is available for enrollment (not archived, not full capacity)
    - User is not already enrolled (or allow re-enrollment)
    - If `correlationId` provided, check for existing enrollment with same correlationId
  - **Writes (ghi field-level)**:
    - `enrollmentId`: Generated (new entity)
    - `userId`: From command.userId
    - `courseId`: From command.courseId
    - `status`: Set to 'active'
    - `enrolledAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - `completedAt` (not applicable for new enrollment)
    - User state (read-only, from onboarding-service)
    - ProgressState (initialized via event reactions)
    - MasteryState (initialized via event reactions)
    - Course state (read-only)
  - **Emits (phát sự kiện)**: `curriculum.course.enrolled` (enrollmentId, userId, courseId)
  - **Idempotency**: If `correlationId` provided and enrollment exists, return existing enrollment

#### State: SRSItem

**Updated By Events (cập nhật bởi sự kiện)**:

- **Event**: `curriculum.srs_items.due`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `curriculum.srs_items.due` received
    - SRSItem exists for due items (read from own storage)
    - User has active enrollment
  - **Updates (field-level)**:
    - `interval`: Updated based on SRS algorithm (recalculated based on review performance)
    - `easeFactor`: Updated based on SRS algorithm (adjusted based on review performance)
    - `repetitions`: Incremented if review successful
    - `nextReviewAt`: Recalculated based on interval
    - `lastReviewedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: `srsItemId` + event timestamp
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: `system.srs.schedule` command (handled by curriculum-service) is read-only and emits `curriculum.srs_items.due` event. The curriculum-service then updates SRSItem state based on that event reaction.

**Note**: `system.srs.schedule` command does NOT mutate SRSItem state directly. It is read-only and emits `curriculum.srs_items.due` event. SRSItem is updated via event reaction to that event.

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

None. curriculum-service owns write states and read states (curriculum content).

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads User (from onboarding-service) to validate user exists
- Reads ProgressState (from progress-service) to check unlock eligibility (read-only API)
- Reads MasteryState (from motivation-progress-service) to check unlock eligibility (read-only API)

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate ProgressState (owned by progress-service)
- MUST NOT mutate MasteryState (owned by motivation-progress-service)
- MUST NOT mutate Attempt (owned by practice-service)
- MUST NOT mutate Submission (owned by practice-service)
- MUST NOT mutate User (owned by onboarding-service)
- MUST NOT add unlock flags to Course, Unit, Lesson (unlock is learner state, not curriculum content)

---

## progress-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

None. progress-service owns only derived state.

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

#### State: ProgressState

**Updated By Events (cập nhật bởi sự kiện)**:

- **Event**: `learning.lesson.completed`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `learning.lesson.completed` received
    - User exists (read from onboarding-service)
    - Lesson exists (read from curriculum-service)
    - ProgressState exists for user (or create if missing)
  - **Updates (field-level)**:
    - `completedLessonIds`: Add `lessonId` from event (if not already present)
    - `completedUnitIds`: Add `unitId` if all lessons in unit are completed (query curriculum-service for unit structure)
    - `unlockedLessonIds`: Add next lesson(s) if eligible (query curriculum-service for unlock rules)
    - `unlockedUnitIds`: Add next unit(s) if eligible (query curriculum-service for unlock rules)
    - `currentLessonId`: Update to next unlocked lesson if applicable
    - `currentUnitId`: Update to next unlocked unit if applicable
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `learning.lesson.completed` with `attemptId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Unlock eligibility check queries curriculum-service (read-only) for unlock rules

- **Event**: `assessment.level_test.completed`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `assessment.level_test.completed` received
    - User exists (read from onboarding-service)
    - Assessment exists (read from assessment-service, read-only)
    - ProgressState exists for user (or create if missing)
  - **Updates (field-level)**:
    - `unlockedUnitIds`: Unlock initial units up to determined CEFR level (based on event.cefrLevel, query curriculum-service for unit structure)
    - `unlockedLessonIds`: Add lessons in unlocked units
    - `currentUnitId`: Set to first unlocked unit
    - `currentLessonId`: Set to first unlocked lesson
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Set to 1 (if new) or incremented (if updating)
  - **Idempotency / Replay**:
    - Key: Event `assessment.level_test.completed` with `assessmentId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Placement test completion unlocks initial content based on CEFR level determination

- **Event**: `curriculum.course.enrolled`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `curriculum.course.enrolled` received
    - User exists (read from onboarding-service)
    - Course exists (read from curriculum-service, read-only)
  - **Updates (field-level)**:
    - `userId`: From event.userId
    - `courseId`: From event.courseId
    - `enrollmentId`: From event.enrollmentId
    - `unlockedUnitIds`: Initialize to [] (empty, will be populated by unlock rules)
    - `unlockedLessonIds`: Initialize to [] (empty)
    - `completedUnitIds`: Initialize to []
    - `completedLessonIds`: Initialize to []
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Idempotency / Replay**:
    - Key: Event `curriculum.course.enrolled` with `enrollmentId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Initializes empty ProgressState, unlock happens via other events or curriculum.unit.access

- **Event**: `curriculum.unit.unlocked`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `curriculum.unit.unlocked` received
    - User exists (read from onboarding-service)
    - Unit exists (read from curriculum-service, read-only)
    - ProgressState exists for user
  - **Updates (field-level)**:
    - `unlockedUnitIds`: Add `unitId` from event (if not already present)
    - `unlockedLessonIds`: Add lessons in unit (if not already present, query curriculum-service for unit structure)
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `curriculum.unit.unlocked` with `unitId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: This event is informational (emitted by progress-service itself after ProgressState update). Event is emitted only if unlock actually occurs (not for every access check).

- **Event**: `system.user.registered`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `system.user.registered` received
    - User exists (read from onboarding-service)
    - User role is 'learner' (only learners have ProgressState)
  - **Updates (field-level)**:
    - `userId`: From event.userId
    - Initialize empty state (no course enrolled yet)
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Idempotency / Replay**:
    - Key: Event `system.user.registered` with `userId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Only creates ProgressState if user role is 'learner'. ProgressState remains empty until user enrolls in a course.

- **Event**: `system.profile.updated`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `system.profile.updated` received
    - User exists (read from onboarding-service)
    - Event payload indicates `targetLanguage` (learningLanguage) changed
    - ProgressState exists for user
  - **Updates (field-level)**:
    - `unlockedUnitIds`: Reset to []
    - `unlockedLessonIds`: Reset to []
    - `completedUnitIds`: Reset to []
    - `completedLessonIds`: Reset to []
    - `currentUnitId`: Clear (set to undefined)
    - `currentLessonId`: Clear (set to undefined)
    - `lastUpdatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `system.profile.updated` with `userId` + `targetLanguage` change flag
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Only resets/recomputes if `targetLanguage` (learningLanguage) changed. Other profile changes (firstName, lastName, avatarUrl, notificationPreferences) do NOT affect ProgressState.

**Internal Command Handling**:

- **Command**: `curriculum.unit.access` (INTERNAL, handled by progress-service)
  - **Preconditions (điều kiện sync)**:
    - User exists (read from onboarding-service)
    - Unit exists (read from curriculum-service)
    - Course exists (read from curriculum-service)
    - Unit belongs to the specified course
    - Reason is valid enum value
  - **Processing**:
    - Read ProgressState (from progress-service)
    - Read MasteryState (read-only query to motivation-progress-service)
    - Query curriculum-service for unlock eligibility rules (read-only)
    - Evaluate eligibility based on progress, mastery, and unlock rules
    - If eligible, update ProgressState (unlock unit) - same field updates as `curriculum.unit.unlocked` event reaction
    - If unlock occurred, emit `curriculum.unit.unlocked` event (informational, after state update)
  - **Notes**: This is an INTERNAL system command (not exposed to client applications). May emit no event if unit is not eligible (eligibility check only).

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads User (from onboarding-service) to validate user exists
- Reads Course, Unit, Lesson (from curriculum-service) to check unlock rules (read-only)
- Reads MasteryState (from motivation-progress-service) to check unlock eligibility (read-only)

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate MasteryState (owned by motivation-progress-service)
- MUST NOT mutate Course, Unit, Lesson (owned by curriculum-service, curriculum content)
- MUST NOT mutate Enrollment (owned by curriculum-service)
- MUST NOT mutate Attempt (owned by practice-service)
- MUST NOT mutate User (owned by onboarding-service)
- MUST NOT write ProgressState from commands (only from events)

---

## motivation-progress-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

None. motivation-progress-service owns only derived states.

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

#### State: MasteryState

**Updated By Events (cập nhật bởi sự kiện)**:

- **Event**: `learning.lesson.completed`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `learning.lesson.completed` received
    - User exists (read from onboarding-service)
    - Attempt exists (read from practice-service, read-only)
    - Submissions exist for attempt (read from practice-service, read-only)
  - **Updates (field-level)**:
    - `lessonMastery`: Add or update entry for `lessonId` from event
      - `lessonId`: From event.lessonId
      - `skillBreakdown`: Calculate per-skill scores from submissions (aggregate submission scores per skill)
      - `overallScore`: Calculate weighted average of skillBreakdown scores
      - `lastUpdatedAt`: Set to current timestamp
    - `skillScores`: Update per-skill scores (aggregate across all lessons)
      - For each skill: aggregate score from lessonMastery entries
      - `lastUpdatedAt`: Set to current timestamp for each skill
    - `unitMastery`: Update if persisted (aggregate from lessonMastery for unit)
    - `lastCalculatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `learning.lesson.completed` with `attemptId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Score aggregation follows scoring rules (weighted averages, evidence minimums). Reference existing scoring rules docs for formulas.

- **Event**: `learning.submission.created`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `learning.submission.created` received
    - User exists (read from onboarding-service)
    - Submission exists (read from practice-service, read-only)
    - Attempt exists (read from practice-service, read-only)
  - **Updates (field-level)**:
    - `lessonMastery`: Update entry for lesson containing submission (if lesson not yet completed)
      - `skillBreakdown`: Aggregate submission score into lesson mastery
      - `overallScore`: Recalculate weighted average
      - `lastUpdatedAt`: Set to current timestamp
    - `skillScores`: Update per-skill scores based on submission type
      - For each skill affected by submission type: aggregate submission score
      - `lastUpdatedAt`: Set to current timestamp for each skill
    - `lastCalculatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `learning.submission.created` with `submissionId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Submission scores contribute to mastery even before lesson completion. Mastery calculation aggregates from multiple sources (lessons, assessments, feedback).

- **Event**: `assessment.quiz.submitted`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `assessment.quiz.submitted` received
    - User exists (read from onboarding-service)
    - Assessment exists (read from assessment-service, read-only)
  - **Updates (field-level)**:
    - `skillScores`: Update per-skill scores based on assessment type
      - Aggregate assessment score into skill scores
      - `lastUpdatedAt`: Set to current timestamp for each skill
    - `lastCalculatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `assessment.quiz.submitted` with `assessmentId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Assessment scores contribute to mastery calculation. Assessment type determines which skills are affected.

- **Event**: `mentoring.feedback.published`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `mentoring.feedback.published` received
    - User exists (read from onboarding-service)
    - Feedback exists (read from mentoring-service, read-only)
    - Submission exists (read from practice-service, read-only)
  - **Updates (field-level)**:
    - `lessonMastery`: Update entry for lesson containing submission
      - `skillBreakdown`: Incorporate feedback rubric scores (apply author weight: teacher > mentor > ai)
      - `overallScore`: Recalculate weighted average
      - `lastUpdatedAt`: Set to current timestamp
    - `skillScores`: Update per-skill scores (speaking/writing) based on feedback
      - Aggregate rubric scores with author weight
      - `lastUpdatedAt`: Set to current timestamp for each skill
    - `lastCalculatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `mentoring.feedback.published` with `feedbackId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Feedback affects mastery only for speaking/writing submissions. Author weight determines contribution strength (teacher feedback has higher weight than AI).

- **Event**: `system.profile.updated`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `system.profile.updated` received
    - User exists (read from onboarding-service)
    - Event payload indicates `targetLanguage` (learningLanguage) changed
    - MasteryState exists for user
  - **Updates (field-level)**:
    - `skillScores`: Reset to []
    - `lessonMastery`: Reset to []
    - `unitMastery`: Reset to [] (if persisted)
    - `lastCalculatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `system.profile.updated` with `userId` + `targetLanguage` change flag
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Only resets/recomputes if `targetLanguage` (learningLanguage) changed. Other profile changes do NOT affect MasteryState.

#### State: SkillScore

**Updated By Events (cập nhật bởi sự kiện)**:

- **Event**: `learning.lesson.completed`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `learning.lesson.completed` received
    - User exists (read from onboarding-service)
    - MasteryState updated (from same event reaction)
  - **Updates (field-level)**:
    - For each skill: Update SkillScore entry
      - `scoreVal`: Aggregate per-skill scores from lessonMastery
      - `lastUpdatedAt`: Set to current timestamp
      - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `learning.lesson.completed` with `attemptId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: SkillScore may be denormalized from MasteryState.skillScores for query performance, or may be the source of truth with MasteryState.skillScores derived from it. Implementation detail.

- **Event**: `assessment.quiz.submitted`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `assessment.quiz.submitted` received
    - User exists (read from onboarding-service)
    - Assessment exists (read from assessment-service, read-only)
  - **Updates (field-level)**:
    - For each skill affected by assessment type: Update SkillScore entry
      - `scoreVal`: Aggregate assessment scores per skill
      - `lastUpdatedAt`: Set to current timestamp
      - `version`: Incremented
  - **Idempotency / Replay**:
    - Key: Event `assessment.quiz.submitted` with `assessmentId`
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Assessment scores contribute to skill-level proficiency.

- **Event**: `system.profile.updated`
  - **Preconditions for apply (điều kiện áp dụng)**:
    - Event `system.profile.updated` received
    - User exists (read from onboarding-service)
    - Event payload indicates `targetLanguage` (learningLanguage) changed
    - SkillScore exists for user
  - **Updates (field-level)**:
    - All SkillScore entries: Reset scores (clear all entries or set scoreVal to 0.0)
    - `lastUpdatedAt`: Set to current timestamp for each entry
    - `version`: Incremented for each entry
  - **Idempotency / Replay**:
    - Key: Event `system.profile.updated` with `userId` + `targetLanguage` change flag
    - Behavior: Processing same event multiple times results in same state (idempotent)
  - **Notes**: Only resets if `targetLanguage` (learningLanguage) changed. Other profile changes do NOT affect SkillScore.

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads User (from onboarding-service) to validate user exists
- Reads Attempt (from practice-service) to compute mastery
- Reads Submission (from practice-service) to compute mastery
- Reads Assessment (from assessment-service) to compute mastery
- Reads Feedback (from mentoring-service) to compute mastery

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate Attempt (owned by practice-service)
- MUST NOT mutate Submission (owned by practice-service)
- MUST NOT mutate Assessment (owned by assessment-service)
- MUST NOT mutate Feedback (owned by mentoring-service)
- MUST NOT mutate ProgressState (owned by progress-service)
- MUST NOT mutate User (owned by onboarding-service)
- MUST NOT write MasteryState or SkillScore from commands (only from events)

---

## onboarding-service

### 1) Owned Write States (Trạng thái Ghi — service sở hữu)

#### State: User

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `system.user.register`
  - **Preconditions (điều kiện sync)**:
    - Email is valid format and unique (not already registered)
    - Password meets security requirements (min length, complexity)
    - Role is valid UserRole enum value
    - Target language is valid LanguageCode enum value if provided
    - If `correlationId` provided, check for existing user with same correlationId
  - **Writes (ghi field-level)**:
    - `userId`: Generated (new entity)
    - `email`: From command.email (must be unique)
    - `passwordHash`: Hash of command.password (computed by service)
    - `role`: From command.role
    - `firstName`: From command.firstName (optional)
    - `lastName`: From command.lastName (optional)
    - `createdAt`: Set to current timestamp
    - `updatedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - ProgressState (initialized via event reactions)
    - MasteryState (initialized via event reactions)
    - ReadinessState (initialized via event reactions)
  - **Emits (phát sự kiện)**: `system.user.registered` (userId, email, role)
  - **Idempotency**: If `correlationId` provided and user exists with same correlationId or email, return existing user

- **Command**: `system.profile.modify`
  - **Preconditions (điều kiện sync)**:
    - User exists
    - User ID matches authenticated user (authorization check)
    - At least one optional field is provided (cannot submit empty update)
    - Target language is valid LanguageCode enum value if provided
    - Avatar URL is valid URL format if provided
  - **Writes (ghi field-level)**:
    - `firstName`: Update if provided in command
    - `lastName`: Update if provided in command
    - `updatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Does NOT write (không được ghi)**:
    - `userId`, `email`, `passwordHash`, `role`, `createdAt` (immutable or not in command)
    - ProgressState (reset/recomputed via event reactions if targetLanguage changed)
    - MasteryState (reset/recomputed via event reactions if targetLanguage changed)
    - ReadinessState (reset/recomputed via event reactions if targetLanguage changed)
  - **Emits (phát sự kiện)**: `system.profile.updated` (userId, updatedFields)
  - **Idempotency**: Modifying profile with same values returns success (idempotent)

#### State: LearnerProfile

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `system.user.register` (if role is 'learner')
  - **Preconditions (điều kiện sync)**:
    - User created (from same command)
    - User role is 'learner'
    - Target language is valid LanguageCode enum value if provided
  - **Writes (ghi field-level)**:
    - `userId`: From User entity
    - `targetLanguage`: From command.targetLanguage (optional)
    - `avatarUrl`: From command.avatarUrl (optional)
    - `notificationPreferences`: From command.notificationPreferences (optional)
    - `createdAt`: Set to current timestamp
    - `updatedAt`: Set to current timestamp
    - `version`: Set to 1
  - **Does NOT write (không được ghi)**:
    - ProgressState (initialized via event reactions)
    - MasteryState (initialized via event reactions)
    - ReadinessState (initialized via event reactions)
  - **Emits (phát sự kiện)**: None (User creation event covers this)
  - **Idempotency**: If LearnerProfile exists for userId, return existing profile

- **Command**: `system.profile.modify` (if applicable fields provided)
  - **Preconditions (điều kiện sync)**:
    - User exists
    - User ID matches authenticated user (authorization check)
    - LearnerProfile exists (if updating learner-specific fields)
    - At least one optional field is provided
  - **Writes (ghi field-level)**:
    - `targetLanguage`: Update if provided in command
    - `avatarUrl`: Update if provided in command
    - `notificationPreferences`: Update if provided in command
    - `updatedAt`: Set to current timestamp
    - `version`: Incremented
  - **Does NOT write (không được ghi)**:
    - `userId`, `createdAt` (immutable)
    - ProgressState (reset/recomputed via event reactions if targetLanguage changed)
    - MasteryState (reset/recomputed via event reactions if targetLanguage changed)
    - ReadinessState (reset/recomputed via event reactions if targetLanguage changed)
  - **Emits (phát sự kiện)**: `system.profile.updated` (userId, updatedFields)
  - **Idempotency**: Modifying profile with same values returns success (idempotent)

#### State: Session

**Mutated By Commands (bị thay đổi bởi lệnh)**:

- **Command**: `system.user.login`
  - **Preconditions (điều kiện sync)**:
    - Email exists in User entity
    - Password matches stored password hash
    - User account is active (not suspended, not deleted)
    - If `correlationId` provided, check idempotency
  - **Writes (ghi field-level)**:
    - `sessionId`: Generated (new entity, ephemeral)
    - `userId`: From User entity
    - `deviceId`: From command.deviceId (optional)
    - `token`: Generated authentication token (JWT or similar, computed by service)
    - `expiresAt`: Set to current timestamp + session TTL
    - `createdAt`: Set to current timestamp
  - **Does NOT write (không được ghi)**:
    - User state (read-only, login does not mutate user entity)
    - Authentication result (computed by service, not in command payload)
  - **Emits (phát sự kiện)**: `system.user.login` (userId)
  - **Idempotency**: Logging in multiple times creates new sessions (idempotent at session level)

### 2) Owned Derived States (Trạng thái Tính toán — cập nhật bởi event)

None. onboarding-service owns only write states and ephemeral state.

### 3) External Reads Allowed (Được phép đọc từ service khác)

- Reads Enrollment (from curriculum-service) to display user enrollments
- Reads ProgressState (from progress-service) to display user progress
- Reads Assessment (from assessment-service) to display placement results
- Reads ReadinessState (computed by education/readiness-model) to display readiness status

### 4) Forbidden Mutations (Cấm)

- MUST NOT mutate Enrollment (owned by curriculum-service)
- MUST NOT mutate ProgressState (owned by progress-service)
- MUST NOT mutate MasteryState (owned by motivation-progress-service)
- MUST NOT mutate Attempt (owned by practice-service)
- MUST NOT mutate Assessment (owned by assessment-service)
- MUST NOT initialize ProgressState, MasteryState, or ReadinessState from commands (initialized via event reactions)

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - State transition mapping defined for MVP  
**Related Documents**: 
- `docs/architecture/state-inventory.md` (State inventory - authoritative source)
- `docs/architecture/state-models.md` (STEP 5A - State models)
- `docs/architecture/state-ownership-invariants.md` (STEP 5A - Ownership invariants)
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
- `docs/architecture/command-handler-event-flow.md` (STEP 4.3 - Handler event flow)
- `contracts/events/events.catalog.md` (Domain events catalog)
