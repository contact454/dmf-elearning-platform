# STEP 8A — Implementation Backlog (MVP)

## 0. Principles

- Vertical slices over horizontal layers
- Commands → Events → State → Read Models → Query APIs
- Always respect single-writer + IDs-only event payloads
- Implementation order must reduce architectural risk early

---

## 1. MVP Scope Definition

### In Scope (MVP)

- Learner learning flow (lesson → submission → mastery/progress)
- Assessment (quiz + placement)
- Feedback (AI/Teacher/Mentor)
- Learner dashboard read models
- Teacher/Mentor dashboard read models
- Event bus + idempotent consumers

### Explicitly Out of Scope

- Admin dashboard
- Billing / payments
- Notifications (email/push)
- Content authoring tools
- Analytics beyond dashboards

---

## 2. Vertical Milestones Overview

- **M1**: System Foundations
- **M2**: Learner Core Flow
- **M3**: Progress & Mastery
- **M4**: Assessment
- **M5**: Teacher/Mentor Dashboard
- **M6**: Readiness + SRS
- **M7**: Hardening & Replay Safety

---

## 3. Detailed Milestones

--------------------------------------------------
### Milestone M1: System Foundations

**Goal**:
Enable user registration, login, and basic event bus infrastructure. Establishes authentication and event-driven communication patterns.

**Services Involved**:
- `onboarding-service`
- Event bus infrastructure (shared)

**Commands Implemented**:
- `system.user.register`
- `system.user.login`
- `system.profile.modify`

**Events Emitted / Consumed**:
- `system.user.registered` (emitted)
- `system.user.login` (emitted)
- `system.profile.updated` (emitted)

**States Written / Derived**:
- User (write state, onboarding-service)
- LearnerProfile (write state, onboarding-service)
- Session (ephemeral, onboarding-service)

**Read Models / Queries Unlocked**:
- None (foundation only)

**Dependencies**:
- None (first milestone)

**Acceptance Criteria**:
- User can register with email/password
- User can login and receive auth token
- User can modify profile (targetLanguage, firstName, lastName)
- Events are published to event bus
- Event consumers can subscribe and receive events
- Basic idempotency check on commands (correlationId)

**Notes**:
- Event bus must support at-least-once delivery
- Session management is ephemeral (not in read models)
- User registration creates LearnerProfile automatically

--------------------------------------------------
### Milestone M2: Learner Core Flow

**Goal**:
Enable learners to start lessons, submit activities, and complete lessons. Establishes core learning loop.

**Services Involved**:
- `practice-service`
- `curriculum-service` (read-only for lesson metadata)

**Commands Implemented**:
- `learning.lesson.start`
- `learning.activity.submit`
- `learning.lesson.complete`
- `learning.lesson.abandon`

**Events Emitted / Consumed**:
- `learning.lesson.started` (emitted)
- `learning.submission.created` (emitted)
- `learning.lesson.completed` (emitted)
- `learning.lesson.abandoned` (emitted)

**States Written / Derived**:
- Attempt (write state, practice-service)
- Submission (write state, practice-service)

**Read Models / Queries Unlocked**:
- `LessonAttemptListView` (projector + query)
- `LessonAttemptDetailView` (projector + query)
- `SubmissionListView` (projector + query)
- `SubmissionDetailView` (projector + query)
- Endpoints:
  - `GET /api/learner/lessons/:lessonId/attempts`
  - `GET /api/learner/attempts/:attemptId`
  - `GET /api/learner/submissions`
  - `GET /api/learner/submissions/:submissionId`

**Dependencies**:
- M1 (user registration/login)

**Acceptance Criteria**:
- Learner can start a lesson (creates Attempt)
- Learner can submit activity answers (creates Submission)
- Learner can complete or abandon lesson
- Attempt status transitions correctly (in-progress → completed/abandoned)
- Submission scores computed (if auto-graded)
- Read models update via event reactions
- Query endpoints return correct data (self-only access enforced)

**Notes**:
- Submission content (audioUrl, text, answer) stored in write state
- Scores computed by practice-service (not in event payload)
- Lesson metadata fetched from curriculum-service (read-only)

--------------------------------------------------
### Milestone M3: Progress & Mastery

**Goal**:
Track learner progress through courses and calculate mastery scores. Enables progress visualization and mastery tracking.

**Services Involved**:
- `progress-service`
- `curriculum-service`
- `motivation-progress-service`

**Commands Implemented**:
- `curriculum.course.enroll`
- `curriculum.unit.access` (internal, event-triggered)

**Events Emitted / Consumed**:
- `curriculum.course.enrolled` (emitted)
- `curriculum.unit.unlocked` (emitted, by progress-service)
- `learning.lesson.completed` (consumed by progress-service, motivation-progress-service)
- `learning.submission.created` (consumed by motivation-progress-service)
- `system.user.registered` (consumed by progress-service)
- `system.profile.updated` (consumed by progress-service, motivation-progress-service)

**States Written / Derived**:
- Enrollment (write state, curriculum-service)
- ProgressState (write state, progress-service)
- MasteryState (write state, motivation-progress-service)
- SkillScore (write state, motivation-progress-service)

**Read Models / Queries Unlocked**:
- `LearnerDashboardView` (projector + query)
- `LearnerCourseProgressView` (projector + query)
- `MasterySnapshotView` (projector + query)
- Endpoints:
  - `GET /api/learner/dashboard`
  - `GET /api/learner/courses/:courseId/progress`
  - `GET /api/learner/mastery`

**Dependencies**:
- M2 (lesson completion events)

**Acceptance Criteria**:
- Learner can enroll in course
- ProgressState tracks completed lessons/units
- Unit unlock logic works (based on prerequisites)
- MasteryState updates from lesson/submission events
- SkillScore aggregates per skill type
- Dashboard shows progress summary
- Course progress view shows detailed breakdown
- Mastery snapshot shows current skill levels

**Notes**:
- Unit unlock is outcome of eligibility check (no direct unlock command)
- Mastery calculation happens in motivation-progress-service (event reaction)
- ProgressState and MasteryState are separate (different services)

--------------------------------------------------
### Milestone M4: Assessment

**Goal**:
Enable quiz attempts and placement tests. Supports readiness computation input.

**Services Involved**:
- `assessment-service`
- `motivation-progress-service` (consumes assessment events)

**Commands Implemented**:
- `assessment.quiz.start`
- `assessment.quiz.submit`
- `assessment.placement.take`

**Events Emitted / Consumed**:
- `assessment.quiz.started` (emitted)
- `assessment.quiz.submitted` (emitted)
- `assessment.level_test.completed` (emitted)
- `assessment.quiz.submitted` (consumed by motivation-progress-service)

**States Written / Derived**:
- Assessment (write state, assessment-service)

**Read Models / Queries Unlocked**:
- None (assessment results not in read models, only used for readiness)

**Dependencies**:
- M3 (mastery tracking for quiz impact)

**Acceptance Criteria**:
- Learner can start quiz
- Learner can submit quiz answers
- Quiz scores computed and stored
- Placement test completion unlocks initial content
- Assessment events update mastery (via motivation-progress-service)
- Assessment results stored for readiness computation

**Notes**:
- Quiz answers stored in Assessment entity (not in read models)
- Placement test completion emits `assessment.level_test.completed`
- Assessment scores contribute to mastery calculation

--------------------------------------------------
### Milestone M5: Teacher/Mentor Dashboard

**Goal**:
Enable teachers and mentors to view feedback requests and provide feedback on submissions. Establishes feedback workflow.

**Services Involved**:
- `mentoring-service`
- `practice-service` (read-only for submission access)

**Commands Implemented**:
- `mentoring.feedback.request`
- `mentoring.feedback.publish`

**Events Emitted / Consumed**:
- `mentoring.feedback.requested` (emitted)
- `mentoring.feedback.published` (emitted)
- `learning.submission.created` (consumed by mentoring-service for queue)
- `mentoring.feedback.published` (consumed by practice-service, motivation-progress-service)

**States Written / Derived**:
- FeedbackRequest (write state, mentoring-service)
- Feedback (write state, mentoring-service)

**Read Models / Queries Unlocked**:
- `FeedbackQueueView` (projector + query)
- `FeedbackRequestDetailView` (projector + query)
- `SubmissionDetailView` (enhanced for teacher access)
- `SubmissionListView` (enhanced for teacher access)
- Endpoints:
  - `GET /api/teacher/feedback-queue`
  - `GET /api/teacher/feedback-requests/:feedbackRequestId`
  - `GET /api/teacher/submissions/:submissionId`
  - `GET /api/teacher/learners/:userId/summary`

**Dependencies**:
- M2 (submissions exist)
- M3 (learner profiles exist)

**Acceptance Criteria**:
- Learner can request feedback on submission
- Teacher/Mentor sees pending feedback requests in queue
- Teacher/Mentor can view submission detail (via FeedbackRequest linkage)
- Teacher/Mentor can publish feedback with rubric scores
- Feedback affects mastery (for speaking/writing submissions)
- Access control enforced (FeedbackRequest/Feedback linkage only)
- No assignment or course-role assumptions

**Notes**:
- Teacher/Mentor access ONLY via FeedbackRequest/Feedback linkage
- Feedback text and rubricScores stored in Feedback entity
- Feedback events update mastery (event reaction in motivation-progress-service)
- Learner summary endpoint composes data from multiple services (read-only)

--------------------------------------------------
### Milestone M6: Readiness + SRS

**Goal**:
Enable readiness computation and spaced repetition scheduling. Completes learner dashboard capabilities.

**Services Involved**:
- `assessment-service` (readiness computation)
- `curriculum-service` (SRS scheduling)
- `education/readiness-model` (pure function)

**Commands Implemented**:
- `system.srs.schedule` (system automated)

**Events Emitted / Consumed**:
- `curriculum.srs_items.due` (emitted)
- `assessment.quiz.submitted` (consumed for readiness cache invalidation)
- `assessment.level_test.completed` (consumed for readiness cache invalidation)
- `learning.lesson.completed` (consumed for readiness cache invalidation, conditional)
- `mentoring.feedback.published` (consumed for readiness cache invalidation, conditional)
- `system.profile.updated` (consumed for readiness cache invalidation, conditional)

**States Written / Derived**:
- SRSItem (write state, curriculum-service, updated via event reaction)
- ReadinessState (computed, cached by assessment-service, source of truth is education/readiness-model)

**Read Models / Queries Unlocked**:
- `ReadinessSnapshotView` (projector + query)
- Endpoints:
  - `GET /api/learner/readiness`

**Dependencies**:
- M3 (mastery state exists)
- M4 (assessment results exist)

**Acceptance Criteria**:
- Readiness computed from MasteryState + Assessment results
- Readiness cache invalidated on relevant events
- Readiness snapshot available via query endpoint
- SRS items scheduled and marked due
- SRS items updated when reviewed (via event reaction)
- Learner dashboard shows readiness status

**Notes**:
- ReadinessState is computed (pure function), not owned by any service
- Assessment-service caches readiness (cache is not source of truth)
- SRSItem updated via event reaction (curriculum-service consumes `curriculum.srs_items.due`)

--------------------------------------------------
### Milestone M7: Hardening & Replay Safety

**Goal**:
Ensure idempotency, replay safety, and error handling across all services. Production-ready reliability.

**Services Involved**:
- All services

**Commands Implemented**:
- None (hardening existing commands)

**Events Emitted / Consumed**:
- All events (idempotency verified)

**States Written / Derived**:
- All states (replay safety verified)

**Read Models / Queries Unlocked**:
- All read models (rebuild capability verified)

**Dependencies**:
- M1-M6 (all features implemented)

**Acceptance Criteria**:
- All command handlers are idempotent (correlationId or natural key dedupe)
- All event consumers are idempotent (eventId dedupe)
- All projectors can rebuild from event store (deterministic replay)
- Dead-letter handling for failed events (basic)
- Outbox pattern implemented (if needed for reliability)
- Error handling uses STEP 4.4 categories (ValidationError, NotFound, Forbidden, Conflict, TransientFailure, IdempotentReplay)
- Event ordering preserved where required
- At-least-once delivery handled safely

**Notes**:
- Idempotency is critical for all write operations
- Projection rebuild must be deterministic (same events → same read model state)
- Dead-letter queue for events that fail after retries
- Outbox pattern may be needed if service DB and event bus are separate

---

## 4. Learner App Flow Coverage

### Lesson Start
- **M2**: `learning.lesson.start` command, `learning.lesson.started` event, Attempt creation

### Activity Submission
- **M2**: `learning.activity.submit` command, `learning.submission.created` event, Submission creation

### Lesson Completion
- **M2**: `learning.lesson.complete` command, `learning.lesson.completed` event
- **M3**: ProgressState and MasteryState updated (event reactions)

### Quiz / Placement
- **M4**: `assessment.quiz.start`, `assessment.quiz.submit`, `assessment.placement.take` commands
- **M4**: Assessment events emitted and consumed

### Learner Dashboard
- **M3**: Progress summary (LearnerDashboardView)
- **M3**: Mastery snapshot (MasterySnapshotView)
- **M6**: Readiness snapshot (ReadinessSnapshotView)
- **M2**: Attempt and submission lists (LessonAttemptListView, SubmissionListView)

---

## 5. Teacher / Mentor Dashboard Coverage

### Feedback Queue
- **M5**: `FeedbackQueueView` read model
- **M5**: `GET /api/teacher/feedback-queue` endpoint
- Unlocked by: M5

### Submission Detail
- **M5**: `SubmissionDetailView` enhanced for teacher access
- **M5**: `GET /api/teacher/submissions/:submissionId` endpoint
- Access via FeedbackRequest/Feedback linkage only
- Unlocked by: M5

### Learner Summary
- **M5**: `GET /api/teacher/learners/:userId/summary` endpoint
- Composes User, LearnerProfile, ProgressState, MasteryState (read-only)
- Access via FeedbackRequest/Feedback linkage only
- Unlocked by: M5

### Feedback Request Detail
- **M5**: `FeedbackRequestDetailView` read model
- **M5**: `GET /api/teacher/feedback-requests/:feedbackRequestId` endpoint
- Unlocked by: M5

**Note**: No assignment or admin features beyond MVP. All teacher/mentor access is via FeedbackRequest/Feedback linkage only.

---

## 6. Technical Foundations Checklist

### Event Bus (pub/sub)
- **M1**: Basic event bus infrastructure
- **M7**: Production hardening (ordering, partitioning if needed)

### Outbox / Inbox Pattern
- **M7**: Implemented if service DB and event bus are separate (reliability)

### Idempotent Command Handlers
- **M1**: Basic correlationId support
- **M7**: Full idempotency verification across all commands

### Idempotent Event Consumers
- **M2**: EventId deduplication in projectors
- **M7**: Full idempotency verification across all consumers

### Projection Rebuild / Replay
- **M2**: Basic replay capability (deterministic)
- **M7**: Full rebuild verification for all read models

### Dead-letter Handling (basic)
- **M7**: Dead-letter queue for failed events after retries

---

## 7. Risk Reduction Rationale

### Why This Order Minimizes Rework

1. **M1 (Foundations) First**: Establishes authentication and event bus patterns early. All subsequent features depend on these.

2. **M2 (Core Flow) Second**: Delivers end-to-end learner value quickly. Creates events that other features consume.

3. **M3 (Progress/Mastery) Third**: Builds on M2 events. Establishes event reaction patterns (derived state updates).

4. **M4 (Assessment) Fourth**: Adds assessment capability without breaking existing flows. Assessment events integrate with mastery.

5. **M5 (Teacher/Mentor) Fifth**: Adds feedback workflow using existing submissions. Demonstrates cross-service read-only access patterns.

6. **M6 (Readiness/SRS) Sixth**: Completes learner dashboard. Uses computed state pattern (readiness) and event-driven scheduling (SRS).

7. **M7 (Hardening) Last**: Ensures production reliability after all features are implemented. Verifies idempotency and replay safety.

### Architectural Risks Eliminated Early

- **Event Bus Risk (M1)**: Event-driven architecture validated before building features on top
- **Single-Writer Risk (M2-M3)**: State ownership patterns established early
- **IDs-Only Payload Risk (M2)**: Event payload contracts enforced from start
- **Event Reaction Risk (M3)**: Derived state updates tested before complex dependencies
- **Cross-Service Access Risk (M5)**: Read-only service APIs validated before heavy usage

### Why Projections & Events Are Not Postponed

- **Read Models (M2-M6)**: Built incrementally with each feature. Enables query testing alongside write-side.
- **Events (M1-M6)**: Required for event reactions. Cannot defer without breaking derived state updates.
- **Idempotency (M1, M7)**: Basic support in M1, full verification in M7. Prevents data corruption early.

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Implementation backlog defined for MVP  
**Related Documents**: 
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Commands)
- `docs/architecture/state-transition-mapping.md` (STEP 5B - State transitions)
- `docs/architecture/event-contracts.md` (STEP 5C - Event payloads)
- `docs/architecture/read-model-inventory.md` (STEP 6A - Read models)
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query APIs)
