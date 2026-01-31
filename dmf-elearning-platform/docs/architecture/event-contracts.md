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

# STEP 5C — Event Contracts (MVP)
## Hợp đồng Sự kiện (Payload + Validation)

This document defines event payload contracts for all events used in the MVP. Events represent past tense facts that have occurred in the system. Payloads are minimal (IDs only + timestamps) to maintain loose coupling.

---

## 0. Rules (Quy tắc)

- **Events are past tense**: Event names use past tense verbs (started, completed, submitted, etc.)
- **Use event catalog as authority**: Only events listed in `contracts/events/events.catalog.md` are valid
- **Payloads are minimal**: IDs + occurredAt + correlationId (no derived outcomes unless explicitly in catalog)
- **One emitting service per event**: Each event has exactly one service that emits it
- **No derived outcomes in payload**: Scores, mastery, unlock status are NOT in event payloads unless explicitly present in catalog

---

## 1. Event List (From Catalog)

**Events used in MVP** (from `command-handler-event-flow.md` and `state-transition-mapping.md`):

**Learning Domain**:
- `learning.lesson.started`
- `learning.lesson.completed`
- `learning.lesson.abandoned`
- `learning.submission.created`

**Assessment Domain**:
- `assessment.quiz.started`
- `assessment.quiz.submitted`
- `assessment.level_test.completed`

**Curriculum Domain**:
- `curriculum.unit.unlocked`
- `curriculum.course.enrolled`
- `curriculum.srs_items.due`

**Mentoring Domain**:
- `mentoring.feedback.requested`
- `mentoring.feedback.published`

**System/User Domain**:
- `system.user.registered`
- `system.user.login`
- `system.profile.updated`

---

--------------------------------------------------
### Event: learning.lesson.started

**Emitted by**: `practice-service`

**Meaning (Ý nghĩa)**:
User has started a lesson session (người dùng đã bắt đầu phiên học bài). An Attempt entity has been created.

**Payload (IDs only)**:
```typescript
interface LearningLessonStartedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  attemptId: AttemptId;
  userId: UserId;
  lessonId: LessonId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `attemptId`: ID of the Attempt entity created
- `userId`: ID of the user who started the lesson
- `lessonId`: ID of the lesson being started

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `attemptId`: Must be valid AttemptId format
- `userId`: Must be valid UserId format
- `lessonId`: Must be valid LessonId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `attemptId` is missing or invalid format
- `userId` is missing or invalid format
- `lessonId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Attempt entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `correlationId` + `attemptId` (if correlationId provided)

**Ordering assumptions**: Events are emitted after state mutation (Attempt created). No ordering dependencies with other events.

**At-least-once safety notes**: Event consumers should check if Attempt already exists before processing. Processing same event multiple times should be idempotent (no side effects if Attempt already exists).

**Consumers (Read-only expectations)**:
- None (event is informational, no state mutations triggered by this event)

---

--------------------------------------------------
### Event: learning.lesson.completed

**Emitted by**: `practice-service`

**Meaning (Ý nghĩa)**:
User has completed a lesson session (người dùng đã hoàn thành phiên học bài). Attempt status is 'completed'.

**Payload (IDs only)**:
```typescript
interface LearningLessonCompletedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  attemptId: AttemptId;
  userId: UserId;
  lessonId: LessonId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `attemptId`: ID of the Attempt entity that was completed
- `userId`: ID of the user who completed the lesson
- `lessonId`: ID of the lesson that was completed

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `attemptId`: Must be valid AttemptId format
- `userId`: Must be valid UserId format
- `lessonId`: Must be valid LessonId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `attemptId` is missing or invalid format
- `userId` is missing or invalid format
- `lessonId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Attempt entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `attemptId` (natural key - one completion per attempt)

**Ordering assumptions**: Event is emitted after Attempt state mutation. Consumers may process this event to update derived states (ProgressState, MasteryState). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service, motivation-progress-service) should use `attemptId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `attemptId`, `userId`, `lessonId` to update ProgressState (adds lessonId to completedLessonIds, may unlock next lesson/unit)
- `motivation-progress-service`: Uses `attemptId`, `userId`, `lessonId` to update MasteryState and SkillScore (reads Attempt entity to get score, aggregates scores from lesson)
- `assessment-service`: May use `attemptId` to invalidate ReadinessState cache (conditional, reads Attempt entity to check score)

---

--------------------------------------------------
### Event: learning.lesson.abandoned

**Emitted by**: `practice-service`

**Meaning (Ý nghĩa)**:
User has abandoned a lesson session (người dùng đã bỏ dở phiên học bài). Attempt status is 'abandoned'.

**Payload (IDs only)**:
```typescript
interface LearningLessonAbandonedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  attemptId: AttemptId;
  userId: UserId;
  lessonId: LessonId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `attemptId`: ID of the Attempt entity that was abandoned
- `userId`: ID of the user who abandoned the lesson
- `lessonId`: ID of the lesson that was abandoned

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `attemptId`: Must be valid AttemptId format
- `userId`: Must be valid UserId format
- `lessonId`: Must be valid LessonId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `attemptId` is missing or invalid format
- `userId` is missing or invalid format
- `lessonId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Attempt entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `attemptId` (natural key - one abandonment per attempt)

**Ordering assumptions**: Event is emitted after Attempt state mutation. No ordering dependencies with other events.

**At-least-once safety notes**: Processing same event multiple times should be idempotent (no side effects if Attempt already abandoned). Abandoned attempts do NOT trigger progress or mastery updates.

**Consumers (Read-only expectations)**:
- None (abandoned attempts do not affect progress or mastery, no state mutations triggered)

---

--------------------------------------------------
### Event: learning.submission.created

**Emitted by**: `practice-service`

**Meaning (Ý nghĩa)**:
User has submitted an answer to an activity (người dùng đã nộp câu trả lời cho hoạt động). A Submission entity has been created.

**Payload (IDs only)**:
```typescript
interface LearningSubmissionCreatedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  submissionId: SubmissionId;
  attemptId: AttemptId;
  activityId: ActivityId;
  lessonId: LessonId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `submissionId`: ID of the Submission entity created
- `attemptId`: ID of the Attempt this submission belongs to
- `activityId`: ID of the activity being answered
- `lessonId`: ID of the lesson (denormalized from attempt)

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `submissionId`: Must be valid SubmissionId format
- `attemptId`: Must be valid AttemptId format
- `activityId`: Must be valid ActivityId format
- `lessonId`: Must be valid LessonId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `submissionId` is missing or invalid format
- `attemptId` is missing or invalid format
- `activityId` is missing or invalid format
- `lessonId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Submission entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `submissionId` (natural key - one submission per submissionId)

**Ordering assumptions**: Event is emitted after Submission state mutation. Consumers may process this event to update derived states (MasteryState). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (motivation-progress-service) should use `submissionId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `motivation-progress-service`: Uses `submissionId`, `attemptId`, `activityId`, `lessonId` to update MasteryState (reads Submission entity to get type and scores, aggregates submission scores into lesson mastery)

---

--------------------------------------------------
### Event: assessment.quiz.started

**Emitted by**: `assessment-service`

**Meaning (Ý nghĩa)**:
User has started a quiz attempt (người dùng đã bắt đầu làm quiz). Assessment status is 'in-progress'.

**Payload (IDs only)**:
```typescript
interface AssessmentQuizStartedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  assessmentId: AssessmentId;
  userId: UserId;
  attemptId?: AttemptId;   // if applicable
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `assessmentId`: ID of the Assessment entity
- `userId`: ID of the user who started the quiz

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)
- `attemptId`: ID of the attempt if applicable

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `assessmentId`: Must be valid AssessmentId format
- `userId`: Must be valid UserId format
- `attemptId`: Must be valid AttemptId format if provided
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `assessmentId` is missing or invalid format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional fields are valid if provided

**Defer to domain logic if**:
- Assessment entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `correlationId` + `assessmentId` (if correlationId provided)

**Ordering assumptions**: Event is emitted after Assessment state mutation. No ordering dependencies with other events.

**At-least-once safety notes**: Processing same event multiple times should be idempotent (no side effects if Assessment already started).

**Consumers (Read-only expectations)**:
- None (event is informational, no state mutations triggered by this event)

---

--------------------------------------------------
### Event: assessment.quiz.submitted

**Emitted by**: `assessment-service`

**Meaning (Ý nghĩa)**:
User has submitted quiz answers (người dùng đã nộp đáp án quiz). Assessment status is 'graded'.

**Payload (IDs only)**:
```typescript
interface AssessmentQuizSubmittedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  assessmentId: AssessmentId;
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `assessmentId`: ID of the Assessment entity that was submitted
- `userId`: ID of the user who submitted the quiz

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `assessmentId`: Must be valid AssessmentId format
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `assessmentId` is missing or invalid format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Assessment entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `assessmentId` (natural key - one submission per assessment)

**Ordering assumptions**: Event is emitted after Assessment state mutation. Consumers may process this event to update derived states (MasteryState, ReadinessState cache invalidation). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (motivation-progress-service, assessment-service for cache invalidation) should use `assessmentId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `motivation-progress-service`: Uses `assessmentId`, `userId` to update MasteryState and SkillScore (reads Assessment entity to get score, aggregates assessment scores per skill)
- `assessment-service`: Uses `assessmentId` to invalidate ReadinessState cache (recompute on next read)

---

--------------------------------------------------
### Event: assessment.level_test.completed

**Emitted by**: `assessment-service`

**Meaning (Ý nghĩa)**:
User has completed a level test (placement test) (người dùng đã hoàn thành bài kiểm tra định vị).

**Payload (IDs only)**:
```typescript
interface AssessmentLevelTestCompletedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  assessmentId: AssessmentId;
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `assessmentId`: ID of the Assessment entity that was completed
- `userId`: ID of the user who completed the test

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `assessmentId`: Must be valid AssessmentId format
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `assessmentId` is missing or invalid format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Assessment entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `assessmentId` (natural key - one completion per assessment)

**Ordering assumptions**: Event is emitted after Assessment state mutation and CEFR level determination. Consumers may process this event to update derived states (ProgressState, ReadinessState cache invalidation). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service, assessment-service for cache invalidation) should use `assessmentId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `assessmentId`, `userId` to update ProgressState (reads Assessment entity to get cefrLevel, unlocks initial units up to determined CEFR level)
- `assessment-service`: Uses `assessmentId` to invalidate ReadinessState cache (recompute on next read)

---

--------------------------------------------------
### Event: curriculum.course.enrolled

**Emitted by**: `curriculum-service`

**Meaning (Ý nghĩa)**:
User has enrolled in a course (người dùng đã ghi danh khóa học). An Enrollment entity has been created.

**Payload (IDs only)**:
```typescript
interface CurriculumCourseEnrolledEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  enrollmentId: EnrollmentId;
  userId: UserId;
  courseId: CourseId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `enrollmentId`: ID of the Enrollment entity created
- `userId`: ID of the user who enrolled
- `courseId`: ID of the course enrolled in

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `enrollmentId`: Must be valid EnrollmentId format
- `userId`: Must be valid UserId format
- `courseId`: Must be valid CourseId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `enrollmentId` is missing or invalid format
- `userId` is missing or invalid format
- `courseId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Enrollment entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `enrollmentId` (natural key - one enrollment per enrollmentId)

**Ordering assumptions**: Event is emitted after Enrollment state mutation. Consumers may process this event to initialize derived states (ProgressState). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service) should use `enrollmentId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `enrollmentId`, `userId`, `courseId` to initialize ProgressState (empty state, no course enrolled yet)

---

--------------------------------------------------
### Event: curriculum.unit.unlocked

**Emitted by**: `progress-service`

**Meaning (Ý nghĩa)**:
A unit has been unlocked for a user (đơn vị đã được mở khóa cho người dùng). This is an informational event emitted after ProgressState update.

**Payload (IDs only)**:
```typescript
interface CurriculumUnitUnlockedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  userId: UserId;
  unitId: UnitId;
  courseId: CourseId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `userId`: ID of the user for whom unit was unlocked
- `unitId`: ID of the unit that was unlocked
- `courseId`: ID of the course the unit belongs to

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `userId`: Must be valid UserId format
- `unitId`: Must be valid UnitId format
- `courseId`: Must be valid CourseId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `userId` is missing or invalid format
- `unitId` is missing or invalid format
- `courseId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Unlock eligibility validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `userId` + `unitId` (natural key - one unlock per user+unit)

**Ordering assumptions**: Event is emitted after ProgressState update. Event is informational only (ProgressState already updated). Consumers may process this event to update derived states. No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service itself) should use `userId` + `unitId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `userId`, `unitId`, `courseId` to update ProgressState (adds unitId to unlockedUnitIds, adds lessons in unit to unlockedLessonIds)

**Note**: This event is informational (emitted by progress-service itself after ProgressState update). Event is emitted only if unlock actually occurs (not for every access check).

---

--------------------------------------------------
### Event: curriculum.srs_items.due

**Emitted by**: `curriculum-service`

**Meaning (Ý nghĩa)**:
SRS items are due for review (các mục ôn tập đã đến hạn). This is an informational event emitted by the SRS scheduler.

**Payload (IDs only)**:
```typescript
interface CurriculumSrsItemsDueEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  userId: UserId;
  courseId?: CourseId;      // optional, if filtering by course
  dueItemIds: SRSItemId[];  // Array of SRS item IDs that are due
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `userId`: ID of the user for whom items are due
- `dueItemIds`: Array of SRS item IDs that are due for review

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)
- `courseId`: ID of the course if filtering by course

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `userId`: Must be valid UserId format
- `courseId`: Must be valid CourseId format if provided
- `dueItemIds`: Must be non-empty array of valid SRSItemId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `userId` is missing or invalid format
- `dueItemIds` is missing or empty array
- Any item in `dueItemIds` is invalid SRSItemId format

**Accept if**:
- All required fields are present and valid
- `dueItemIds` is non-empty array with valid IDs
- Optional fields are valid if provided

**Defer to domain logic if**:
- SRS scheduling logic (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `userId` + `occurredAt` (natural key - one scheduling per user+time)

**Ordering assumptions**: Event is informational only (no state mutation in emitting service). Consumers may process this event to update SRSItem state. No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (curriculum-service itself) should use `eventId` or `userId` + `occurredAt` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `curriculum-service`: Uses `userId`, `dueItemIds` to update SRSItem state (updates interval, easeFactor, repetitions, nextReviewAt, lastReviewedAt for due items)

**Note**: This event is informational only (no state mutation in emitting service). SRS review affects mastery via `learning.lesson.completed` event when review is completed (not in this handler).

---

--------------------------------------------------
### Event: mentoring.feedback.requested

**Emitted by**: `mentoring-service`

**Meaning (Ý nghĩa)**:
User has requested feedback on a submission (người dùng đã yêu cầu phản hồi cho câu trả lời). A FeedbackRequest entity has been created.

**Payload (IDs only)**:
```typescript
interface MentoringFeedbackRequestedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  submissionId: SubmissionId;
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `submissionId`: ID of the submission feedback is requested for
- `userId`: ID of the user requesting feedback

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `submissionId`: Must be valid SubmissionId format
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `submissionId` is missing or invalid format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- FeedbackRequest entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `submissionId` (natural key - one request per submission, returns existing if pending)

**Ordering assumptions**: Event is emitted after FeedbackRequest state mutation. No ordering dependencies with other events.

**At-least-once safety notes**: Processing same event multiple times should be idempotent (no side effects if FeedbackRequest already exists).

**Consumers (Read-only expectations)**:
- None (event is informational, no state mutations triggered by this event)

---

--------------------------------------------------
### Event: mentoring.feedback.published

**Emitted by**: `mentoring-service`

**Meaning (Ý nghĩa)**:
Feedback has been published on a submission (phản hồi đã được xuất bản cho câu trả lời). A Feedback entity has been created.

**Payload (IDs only)**:
```typescript
interface MentoringFeedbackPublishedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  feedbackId: FeedbackId;
  submissionId: SubmissionId;
  authorId: string;          // Teacher/Mentor ID or 'ai' for AI feedback
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `feedbackId`: ID of the Feedback entity created
- `submissionId`: ID of the submission feedback is for
- `authorId`: Teacher/Mentor ID or 'ai' string for AI feedback

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `feedbackId`: Must be valid FeedbackId format
- `submissionId`: Must be valid SubmissionId format
- `authorId`: Must be valid ID format or 'ai' string
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `feedbackId` is missing or invalid format
- `submissionId` is missing or invalid format
- `authorId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Feedback entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `feedbackId` (natural key - one feedback per feedbackId)

**Ordering assumptions**: Event is emitted after Feedback state mutation. Consumers may process this event to update derived states (MasteryState, ReadinessState cache invalidation). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (motivation-progress-service, assessment-service for cache invalidation) should use `feedbackId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `motivation-progress-service`: Uses `feedbackId`, `submissionId`, `authorId` to update MasteryState (reads Feedback entity to get authorRole and rubric scores, incorporates feedback rubric scores with author weight)
- `assessment-service`: May use `feedbackId` to invalidate ReadinessState cache (conditional, reads Feedback entity to check if feedback affects mastery significantly)

---

--------------------------------------------------
### Event: system.user.registered

**Emitted by**: `onboarding-service`

**Meaning (Ý nghĩa)**:
User has registered an account (người dùng đã đăng ký tài khoản). A User entity has been created.

**Payload (IDs only)**:
```typescript
interface SystemUserRegisteredEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `userId`: ID of the User entity created

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- User entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `userId` (natural key - one registration per user)

**Ordering assumptions**: Event is emitted after User state mutation. Consumers may process this event to initialize derived states (ProgressState). No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service) should use `userId` as deduplication key. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `userId` to initialize ProgressState (reads User entity to get role, creates empty state if user role is 'learner')

---

--------------------------------------------------
### Event: system.user.login

**Emitted by**: `onboarding-service`

**Meaning (Ý nghĩa)**:
User has logged in (người dùng đã đăng nhập). A Session entity has been created.

**Payload (IDs only)**:
```typescript
interface SystemUserLoginEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `userId`: ID of the user who logged in

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Session entity validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `correlationId` + `userId` (if correlationId provided)

**Ordering assumptions**: Event is emitted after Session state mutation. No ordering dependencies with other events.

**At-least-once safety notes**: Processing same event multiple times should be idempotent (no side effects, login creates new sessions).

**Consumers (Read-only expectations)**:
- None (event is informational, no state mutations triggered by this event)

---

--------------------------------------------------
### Event: system.profile.updated

**Emitted by**: `onboarding-service`

**Meaning (Ý nghĩa)**:
User profile has been updated (hồ sơ người dùng đã được cập nhật). User and/or LearnerProfile entities have been updated.

**Payload (IDs only)**:
```typescript
interface SystemProfileUpdatedEventPayload {
  eventId: string;
  occurredAt: string;       // ISO 8601
  correlationId?: string;   // from command when applicable
  userId: UserId;
}
```

**Field Rules**:

**Required**:
- `eventId`: Unique event identifier
- `occurredAt`: ISO 8601 timestamp when event occurred
- `userId`: ID of the user whose profile was updated

**Optional**:
- `correlationId`: Client-provided correlation ID from command (if provided)

**Constraints**:
- `eventId`: Must be unique string
- `occurredAt`: Must be valid ISO 8601 timestamp
- `userId`: Must be valid UserId format
- `correlationId`: Must be unique string if provided

**Validation Rules (Sync)**:

**Reject if**:
- `eventId` is missing or not unique
- `occurredAt` is missing or invalid ISO 8601 format
- `userId` is missing or invalid format

**Accept if**:
- All required fields are present and valid
- Optional `correlationId` is valid if provided

**Defer to domain logic if**:
- Profile update validation (handled by emitting service before event emission)

**Idempotency / Replay**:

**Dedupe key**: `eventId` (primary) or `userId` (natural key - one update per user per event)

**Ordering assumptions**: Event is emitted after User/LearnerProfile state mutation. Consumers may process this event to reset/recompute derived states (ProgressState, MasteryState, SkillScore, ReadinessState cache invalidation) if targetLanguage changed. No strict ordering dependencies.

**At-least-once safety notes**: Event consumers (progress-service, motivation-progress-service, assessment-service for cache invalidation) should use `userId` as deduplication key. Consumers read User/LearnerProfile entity to check if targetLanguage changed. Processing same event multiple times should result in same state (idempotent).

**Consumers (Read-only expectations)**:
- `progress-service`: Uses `userId` to reset/recompute ProgressState (reads User/LearnerProfile entity to check if targetLanguage changed)
- `motivation-progress-service`: Uses `userId` to reset/recompute MasteryState and SkillScore (reads User/LearnerProfile entity to check if targetLanguage changed)
- `assessment-service`: Uses `userId` to invalidate ReadinessState cache (reads User/LearnerProfile entity to check if targetLanguage changed)

---

## 2. Forbidden Patterns (Cấm)

### Pattern 1: Derived Outcomes in Payload

**Forbidden**:
- ❌ `masteryLevel` field in `learning.lesson.completed` event
- ❌ `unlocked` field in `learning.lesson.completed` event
- ❌ `readinessStatus` field in `assessment.quiz.submitted` event
- ❌ `progressState` object in `curriculum.course.enrolled` event

**Reason**: Events represent facts that occurred, not computed outcomes. Mastery, unlock status, and readiness are computed by consuming services from events, not included in event payloads.

**Note**: All computed outcomes (scores, mastery, unlock status, readiness) are NOT included in event payloads. Consumers read state entities to get computed values.

### Pattern 2: Foreign State Mutation Assumptions

**Forbidden**:
- ❌ Event payload containing full state objects (e.g., full Attempt object, full User object)
- ❌ Event payload containing computed derived states (e.g., MasteryState, ProgressState)

**Reason**: Events should contain only IDs and minimal metadata. Consumers read state from their own storage or from foreign services (read-only). Events maintain loose coupling.

### Pattern 3: Vague Meta/Data Blobs

**Forbidden**:
- ❌ `metadata: object` field with arbitrary structure
- ❌ `data: unknown` field with unspecified structure
- ❌ `extra: any` field

**Reason**: Event payloads must be explicit and typed. All fields must have clear meaning and validation rules.

---

## 3. Audit Checklist

- [x] All events referenced in STEP 4.3 (`command-handler-event-flow.md`) are covered
- [x] All events referenced in STEP 5B (`state-transition-mapping.md`) are covered
- [x] No new events invented (all events exist in `contracts/events/events.catalog.md`)
- [x] Payloads are IDs-only + timestamps (no derived outcomes unless explicitly in catalog)
- [x] Emitting service matches ownership (from STEP 4.3)
- [x] Consumer expectations match STEP 5B (which services consume which events and which IDs they use)
- [x] All required fields are specified
- [x] All optional fields are marked as optional
- [x] Validation rules are synchronous (format, presence, enum)
- [x] Idempotency strategies are specified per event
- [x] Forbidden patterns are documented

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - Event contracts defined for MVP  
**Related Documents**: 
- `contracts/events/events.catalog.md` (Domain events catalog - authoritative source)
- `docs/architecture/command-handler-event-flow.md` (STEP 4.3 - Handler event flow)
- `docs/architecture/state-transition-mapping.md` (STEP 5B - State transition mapping)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
- `docs/architecture/state-models.md` (STEP 5A - State models)
