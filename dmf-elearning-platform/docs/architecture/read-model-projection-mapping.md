Status: FROZEN
Freeze Scope: STEP 7 — Read Model Projection + Query Endpoint Mapping
Freeze Date: 2026-01-18 (Asia/Ho_Chi_Minh)
Freeze Notes:
- STEP 5C IDs-only policy enforced: Projection reads userId from Attempt entity (via attemptId) for SubmissionDetailView on learning.submission.created.
- Audit verdict: PASS (STEP 7A fixed 1 CRITICAL; STEP 7B no issues).

---

# STEP 7A — Read Model Projection Mapping (MVP)
## Bản đồ Event → Projector → Read Model → Query

This document maps how events are consumed by projectors to update read models, and which query endpoints use each read model.

---

## 0. Rules (Quy tắc)

- **Projectors consume events (at-least-once)**: Event consumers handle events with at-least-once delivery semantics
- **IDs-only event payloads: non-ID fields populated via read-only lookups**: Event payloads contain IDs only (per STEP 5C); projectors must fetch non-ID fields (titles, scores, etc.) via read-only service APIs
- **Single writer per read model (one projector owner)**: Each read model has exactly one projector that maintains it
- **Idempotency: dedupe by eventId, keep lastProcessedEventAt**: Projectors use `eventId` as primary deduplication key and track `lastProcessedEventAt` for ordering
- **Rebuild strategy: replay from event store, deterministic results**: Projectors can rebuild read models by replaying events from event store in deterministic order

---

## 1. Mapping Index (Mục lục)

| Read Model Name | Projector Owner | Service |
|----------------|-----------------|---------|
| `LearnerDashboardView` | `LearnerDashboardProjector` | `progress-service` |
| `LearnerCourseProgressView` | `LearnerCourseProgressProjector` | `progress-service` |
| `LessonAttemptListView` | `LessonAttemptListProjector` | `practice-service` |
| `LessonAttemptDetailView` | `LessonAttemptDetailProjector` | `practice-service` |
| `SubmissionListView` | `SubmissionListProjector` | `practice-service` |
| `SubmissionDetailView` | `SubmissionDetailProjector` | `practice-service` |
| `MasterySnapshotView` | `MasterySnapshotProjector` | `motivation-progress-service` |
| `ReadinessSnapshotView` | `ReadinessSnapshotProjector` | `assessment-service` |
| `FeedbackQueueView` | `FeedbackQueueProjector` | `mentoring-service` |
| `FeedbackRequestDetailView` | `FeedbackRequestDetailProjector` | `mentoring-service` |

---

## 2. Read Model Mappings (By Read Model)

--------------------------------------------------
### Read Model: LearnerDashboardView

**Owned by (Projector Owner)**: `progress-service` / `LearnerDashboardProjector`

**Purpose**:
- Provides an overview of learner's current progress, active course, mastery summary, and readiness status for the learner dashboard

**Stored Keys**:
- Primary key: `userId` (one dashboard per user)

**Consumed Events (from catalog only)**:
- `learning.lesson.completed`
- `curriculum.course.enrolled`
- `system.user.registered`
- `assessment.level_test.completed`
- `system.profile.updated`

**Field Updates (per event)**:

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - `progressSummary.completedLessons`: Increment count (if lessonId not already in completed list)
    - `progressSummary.completedUnits`: Update if all lessons in unit are completed (query ProgressState)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Reads ProgressState (own state) to determine completion status
    - May update `currentLessonId` if lesson was current lesson

- **Event**: `curriculum.course.enrolled`
  - **Updates**:
    - `currentCourseId`: Set to event.courseId
    - `progressSummary.totalLessons`: Fetch from curriculum-service (read-only lookup)
    - `progressSummary.totalUnits`: Fetch from curriculum-service (read-only lookup)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Initializes dashboard if not exists
    - Resets progressSummary counts if switching courses

- **Event**: `system.user.registered`
  - **Updates**:
    - `userId`: Set to event.userId
    - Initialize empty dashboard (all fields empty/default)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Only creates dashboard if user role is 'learner'

- **Event**: `assessment.level_test.completed`
  - **Updates**:
    - `currentUnitId`: May update based on unlocked units (read ProgressState)
    - `currentLessonId`: May update based on unlocked lessons (read ProgressState)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Placement test completion unlocks initial content

- **Event**: `system.profile.updated`
  - **Updates**:
    - Reset all fields if targetLanguage changed (read LearnerProfile to check)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Only resets if targetLanguage (learningLanguage) changed

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `motivation-progress-service`
  - **Read endpoint or entity**: MasteryState (read-only API: GET /api/internal/mastery/:userId)
  - **Used to populate**: `masterySummary.overallScore`, `masterySummary.skillScores`
  - **Cache guidance**: Cache for 60 seconds (mastery updates less frequently than dashboard)

- **Source service**: `assessment-service`
  - **Read endpoint or entity**: ReadinessSnapshotView (read-only API: GET /api/internal/readiness/:userId)
  - **Used to populate**: `readinessStatus`
  - **Cache guidance**: Cache for 60 seconds (readiness updates infrequently)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Course metadata (read-only API: GET /api/internal/courses/:courseId)
  - **Used to populate**: `progressSummary.totalLessons`, `progressSummary.totalUnits`
  - **Cache guidance**: Cache for 300 seconds (course structure rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, last-write-wins for same field
- **Rebuild**: Replay all events for userId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/dashboard` → uses this read model

**PII / Safety Notes**:
- Excludes User.email, User.passwordHash, raw submission answers, assessment answers
- Computed fields (score, cefrLevel, readiness) are derived from write entities/computation, NOT from event payloads

--------------------------------------------------
### Read Model: LearnerCourseProgressView

**Owned by (Projector Owner)**: `progress-service` / `LearnerCourseProgressProjector`

**Purpose**:
- Provides detailed progress view for a specific course, including completed/unlocked lessons and units

**Stored Keys**:
- Primary key: `userId` + `courseId` (one view per user per course)

**Consumed Events (from catalog only)**:
- `learning.lesson.completed`
- `curriculum.course.enrolled`
- `curriculum.unit.unlocked`
- `system.profile.updated`

**Field Updates (per event)**:

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - `units[].lessons[].isCompleted`: Set to true for lessonId from event
    - `units[].isCompleted`: Set to true if all lessons in unit are completed (query ProgressState)
    - `progressPercentage`: Recalculate based on completed lessons count
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Reads ProgressState (own state) to determine completion status

- **Event**: `curriculum.course.enrolled`
  - **Updates**:
    - `userId`: Set to event.userId
    - `courseId`: Set to event.courseId
    - `enrollmentId`: Set to event.enrollmentId
    - `enrolledAt`: Set to event.occurredAt
    - `units`: Initialize from course structure (fetch from curriculum-service)
    - `progressPercentage`: Initialize to 0
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Fetches course structure to populate units and lessons

- **Event**: `curriculum.unit.unlocked`
  - **Updates**:
    - `units[].isUnlocked`: Set to true for unitId from event
    - `units[].lessons[].isUnlocked`: Set to true for all lessons in unlocked unit
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Reads ProgressState (own state) to determine unlock status

- **Event**: `system.profile.updated`
  - **Updates**:
    - Reset all fields if targetLanguage changed (read LearnerProfile to check)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Only resets if targetLanguage (learningLanguage) changed

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Course structure (read-only API: GET /api/internal/courses/:courseId/structure)
  - **Used to populate**: `units[].unitTitle`, `units[].lessons[].lessonTitle`, unit/lesson hierarchy
  - **Cache guidance**: Cache for 300 seconds (course structure rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, last-write-wins for same field
- **Rebuild**: Replay all events for userId + courseId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/courses/:courseId/progress` → uses this read model

**PII / Safety Notes**:
- Excludes User.email, User.passwordHash

--------------------------------------------------
### Read Model: LessonAttemptListView

**Owned by (Projector Owner)**: `practice-service` / `LessonAttemptListProjector`

**Purpose**:
- Provides a list of all attempts for a specific lesson, optimized for pagination and filtering

**Stored Keys**:
- Primary key: `userId` + `lessonId` (one list per user per lesson)

**Consumed Events (from catalog only)**:
- `learning.lesson.started`
- `learning.lesson.completed`
- `learning.lesson.abandoned`

**Field Updates (per event)**:

- **Event**: `learning.lesson.started`
  - **Updates**:
    - `attempts[]`: Add new attempt entry
      - `attemptId`: From event.attemptId
      - `status`: Set to 'in-progress'
      - `startedAt`: Set to event.occurredAt
      - `score`: Not set (computed later)
    - `totalCount`: Increment
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Creates new attempt entry in list

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - `attempts[].status`: Update to 'completed' for attemptId from event
    - `attempts[].score`: Read Attempt entity (own state) to get computed score
    - `attempts[].completedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Score is read from Attempt entity, NOT from event payload

- **Event**: `learning.lesson.abandoned`
  - **Updates**:
    - `attempts[].status`: Update to 'abandoned' for attemptId from event
    - `attempts[].completedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Abandoned attempts do not have scores

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `practice-service` (own state)
  - **Read endpoint or entity**: Attempt entity (read from own database)
  - **Used to populate**: `attempts[].score` (computed by practice-service, not in event)
  - **Cache guidance**: No cache needed (own state)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, upsert attempts by attemptId
- **Rebuild**: Replay all events for userId + lessonId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/lessons/:lessonId/attempts` → uses this read model

**PII / Safety Notes**:
- Excludes raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary)
- Score field is derived by reading Attempt entity (own state), NOT from event payloads

--------------------------------------------------
### Read Model: LessonAttemptDetailView

**Owned by (Projector Owner)**: `practice-service` / `LessonAttemptDetailProjector`

**Purpose**:
- Provides detailed view of a single attempt, including all submissions and scores

**Stored Keys**:
- Primary key: `attemptId` (one view per attempt)

**Consumed Events (from catalog only)**:
- `learning.lesson.started`
- `learning.lesson.completed`
- `learning.submission.created`

**Field Updates (per event)**:

- **Event**: `learning.lesson.started`
  - **Updates**:
    - `attemptId`: Set to event.attemptId
    - `userId`: Set to event.userId
    - `lessonId`: Set to event.lessonId
    - `status`: Set to 'in-progress'
    - `startedAt`: Set to event.occurredAt
    - `submissions`: Initialize to empty array
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Creates new attempt detail view

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - `status`: Update to 'completed' or 'abandoned' (read Attempt entity to determine)
    - `score`: Read Attempt entity (own state) to get computed score
    - `completedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Score is read from Attempt entity, NOT from event payload

- **Event**: `learning.submission.created`
  - **Updates**:
    - `submissions[]`: Add new submission entry
      - `submissionId`: From event.submissionId
      - `attemptId`: From event.attemptId
      - `activityId`: From event.activityId
      - `type`: Read Submission entity (own state) to get type
      - `score`: Read Submission entity (own state) to get computed score (if graded)
      - `createdAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Submission type and score are read from Submission entity, NOT from event payload

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `practice-service` (own state)
  - **Read endpoint or entity**: Attempt entity (read from own database)
  - **Used to populate**: `status`, `score`, `startedAt`, `completedAt`
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `practice-service` (own state)
  - **Read endpoint or entity**: Submission entities (read from own database)
  - **Used to populate**: `submissions[].type`, `submissions[].score`
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Lesson metadata (read-only API: GET /api/internal/lessons/:lessonId)
  - **Used to populate**: `lessonTitle`, `submissions[].activityTitle`
  - **Cache guidance**: Cache for 300 seconds (lesson metadata rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, merge submissions by submissionId
- **Rebuild**: Replay all events for attemptId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/attempts/:attemptId` → uses this read model

**PII / Safety Notes**:
- Excludes raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary)
- Score fields are derived by reading Attempt and Submission entities (own state), NOT from event payloads

--------------------------------------------------
### Read Model: SubmissionListView

**Owned by (Projector Owner)**: `practice-service` / `SubmissionListProjector`

**Purpose**:
- Provides a list of submissions with feedback status, optimized for learner and teacher views

**Stored Keys**:
- Primary key: `userId` (for learner view) OR `authorId` (for teacher view, if filtering by teacher)

**Consumed Events (from catalog only)**:
- `learning.submission.created`
- `mentoring.feedback.published`

**Field Updates (per event)**:

- **Event**: `learning.submission.created`
  - **Updates**:
    - `submissions[]`: Add new submission entry
      - `submissionId`: From event.submissionId
      - `attemptId`: From event.attemptId
      - `lessonId`: From event.lessonId
      - `activityId`: From event.activityId
      - `type`: Read Submission entity (own state) to get type
      - `hasFeedback`: Set to false
      - `createdAt`: Set to event.occurredAt
    - `totalCount`: Increment
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Submission type is read from Submission entity, NOT from event payload

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - `submissions[].hasFeedback`: Set to true for submissionId from event
    - `submissions[].feedbackId`: Set to event.feedbackId
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Updates existing submission entry if exists

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `practice-service` (own state)
  - **Read endpoint or entity**: Submission entities (read from own database)
  - **Used to populate**: `submissions[].type`
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `mentoring-service`
  - **Read endpoint or entity**: Feedback entities (read-only API: GET /api/internal/feedback/:feedbackId)
  - **Used to populate**: `submissions[].hasFeedback`, `submissions[].feedbackId`
  - **Cache guidance**: Cache for 60 seconds (feedback status updates frequently)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Lesson/activity metadata (read-only API: GET /api/internal/lessons/:lessonId)
  - **Used to populate**: `submissions[].lessonTitle`, `submissions[].activityTitle`
  - **Cache guidance**: Cache for 300 seconds (lesson metadata rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, upsert submissions by submissionId
- **Rebuild**: Replay all events for userId or authorId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/submissions` → uses this read model

**PII / Safety Notes**:
- Excludes raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary)
- Includes only metadata and feedback status

--------------------------------------------------
### Read Model: SubmissionDetailView

**Owned by (Projector Owner)**: `practice-service` / `SubmissionDetailProjector`

**Purpose**:
- Provides detailed view of a single submission with feedback, for learner review and teacher feedback creation

**Stored Keys**:
- Primary key: `submissionId` (one view per submission)

**Consumed Events (from catalog only)**:
- `learning.submission.created`
- `mentoring.feedback.published`

**Field Updates (per event)**:

- **Event**: `learning.submission.created`
  - **Updates**:
    - `submissionId`: Set to event.submissionId
    - `attemptId`: Set to event.attemptId
    - `userId`: Read from Attempt entity (own state, via attemptId from event)
    - `lessonId`: Set to event.lessonId
    - `activityId`: Set to event.activityId
    - `type`: Read Submission entity (own state) to get type
    - `content`: Read Submission entity (own state) to get content (audioUrl, text, answer) - only if authorized
    - `score`: Read Submission entity (own state) to get computed score (if graded)
    - `createdAt`: Set to event.occurredAt
    - `feedback`: Set to null
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Content and score are read from Submission entity, NOT from event payload

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - `feedback`: Update with feedback details
      - `feedbackId`: From event.feedbackId
      - `authorId`: Read Feedback entity (read-only API) to get authorId
      - `authorRole`: Read Feedback entity (read-only API) to get authorRole
      - `text`: Read Feedback entity (read-only API) to get text
      - `rubricScores`: Read Feedback entity (read-only API) to get rubricScores
      - `publishedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Feedback details are read from Feedback entity, NOT from event payload

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `practice-service` (own state)
  - **Read endpoint or entity**: Submission entity (read from own database)
  - **Used to populate**: `type`, `content`, `score`, `userId` (via Attempt)
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `mentoring-service`
  - **Read endpoint or entity**: Feedback entity (read-only API: GET /api/internal/feedback/:feedbackId)
  - **Used to populate**: `feedback.authorId`, `feedback.authorRole`, `feedback.text`, `feedback.rubricScores`
  - **Cache guidance**: Cache for 60 seconds (feedback updates infrequently)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Lesson/activity metadata (read-only API: GET /api/internal/lessons/:lessonId)
  - **Used to populate**: `lessonTitle`, `activityTitle`
  - **Cache guidance**: Cache for 300 seconds (lesson metadata rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, merge feedback updates
- **Rebuild**: Replay all events for submissionId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/submissions/:submissionId` → uses this read model
- `GET /api/teacher/submissions/:submissionId` → uses this read model

**PII / Safety Notes**:
- Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary), feedback text
- Content (audioUrl, text, answer) included only for authorized viewers (submission owner or teacher/mentor with access)
- Excludes User.email, User.passwordHash
- Score field is derived by reading Submission entity (own state), NOT from event payloads

--------------------------------------------------
### Read Model: MasterySnapshotView

**Owned by (Projector Owner)**: `motivation-progress-service` / `MasterySnapshotProjector`

**Purpose**:
- Provides a current snapshot of learner's mastery state, optimized for quick display

**Stored Keys**:
- Primary key: `userId` (one snapshot per user)

**Consumed Events (from catalog only)**:
- `learning.lesson.completed`
- `learning.submission.created`
- `assessment.quiz.submitted`
- `mentoring.feedback.published`
- `system.profile.updated`

**Field Updates (per event)**:

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - `lessonMastery[]`: Add or update entry for lessonId from event
      - `lessonId`: From event.lessonId
      - `overallScore`: Read MasteryState (own state) to get computed overallScore
      - `skillBreakdown`: Read MasteryState (own state) to get computed skillBreakdown
      - `lastUpdatedAt`: Set to event.occurredAt
    - `skillScores[]`: Update per-skill scores (read MasteryState to get aggregated scores)
      - `scoreVal`: Read MasteryState (own state) to get computed scoreVal per skill
      - `lastUpdatedAt`: Set to event.occurredAt for each skill
    - `lastCalculatedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - All score fields are read from MasteryState (own state), NOT from event payloads

- **Event**: `learning.submission.created`
  - **Updates**:
    - `lessonMastery[]`: Update entry for lesson containing submission (if lesson not yet completed)
      - `skillBreakdown`: Read MasteryState (own state) to get updated skillBreakdown
      - `overallScore`: Read MasteryState (own state) to get recalculated overallScore
      - `lastUpdatedAt`: Set to event.occurredAt
    - `skillScores[]`: Update per-skill scores based on submission type
      - `scoreVal`: Read MasteryState (own state) to get updated scoreVal per skill
      - `lastUpdatedAt`: Set to event.occurredAt for each skill
    - `lastCalculatedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Submission scores contribute to mastery even before lesson completion

- **Event**: `assessment.quiz.submitted`
  - **Updates**:
    - `skillScores[]`: Update per-skill scores based on assessment type
      - `scoreVal`: Read MasteryState (own state) to get updated scoreVal per skill
      - `lastUpdatedAt`: Set to event.occurredAt for each skill
    - `lastCalculatedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Assessment scores contribute to mastery calculation

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - `lessonMastery[]`: Update entry for lesson containing submission
      - `skillBreakdown`: Read MasteryState (own state) to get updated skillBreakdown (incorporates feedback)
      - `overallScore`: Read MasteryState (own state) to get recalculated overallScore
      - `lastUpdatedAt`: Set to event.occurredAt
    - `skillScores[]`: Update per-skill scores (speaking/writing) based on feedback
      - `scoreVal`: Read MasteryState (own state) to get updated scoreVal per skill
      - `lastUpdatedAt`: Set to event.occurredAt for each skill
    - `lastCalculatedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Feedback affects mastery only for speaking/writing submissions

- **Event**: `system.profile.updated`
  - **Updates**:
    - Reset all fields if targetLanguage changed (read LearnerProfile to check)
      - `skillScores`: Reset to empty object
      - `lessonMastery`: Reset to empty array
    - `lastCalculatedAt`: Set to event.occurredAt
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Only resets if targetLanguage (learningLanguage) changed

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `motivation-progress-service` (own state)
  - **Read endpoint or entity**: MasteryState and SkillScore entities (read from own database)
  - **Used to populate**: All score fields (scoreVal, overallScore, skillBreakdown)
  - **Cache guidance**: No cache needed (own state)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, recalculate aggregates deterministically
- **Rebuild**: Replay all events for userId from event store, ordered by occurredAt, recalculate MasteryState and SkillScore, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/mastery` → uses this read model

**PII / Safety Notes**:
- Excludes raw quiz answers payloads, secrets
- Includes only aggregated scores
- Score fields (scoreVal, overallScore, skillBreakdown) are derived by reading MasteryState and SkillScore entities (own state), NOT from event payloads

--------------------------------------------------
### Read Model: ReadinessSnapshotView

**Owned by (Projector Owner)**: `assessment-service` / `ReadinessSnapshotProjector`

**Purpose**:
- Provides a cached snapshot of learner's readiness state (computed by education/readiness-model)

**Stored Keys**:
- Primary key: `userId` (one snapshot per user)

**Consumed Events (from catalog only)**:
- `assessment.quiz.submitted` (cache invalidation)
- `assessment.level_test.completed` (cache invalidation)
- `learning.lesson.completed` (cache invalidation, conditional)
- `mentoring.feedback.published` (cache invalidation, conditional)
- `system.profile.updated` (cache invalidation, conditional)

**Field Updates (per event)**:

- **Event**: `assessment.quiz.submitted`
  - **Updates**:
    - Invalidate cache (mark as stale, do not recompute immediately)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Cache invalidation only; recomputation happens on next read

- **Event**: `assessment.level_test.completed`
  - **Updates**:
    - Invalidate cache (mark as stale, do not recompute immediately)
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Cache invalidation only; recomputation happens on next read

- **Event**: `learning.lesson.completed`
  - **Updates**:
    - May invalidate cache if score indicates significant progress (read Attempt entity to check score threshold)
    - `lastUpdatedAt`: Set to event.occurredAt (if invalidated)
  - **Notes**:
    - Conditional invalidation based on score threshold

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - May invalidate cache if feedback affects mastery significantly (read Feedback entity to check impact)
    - `lastUpdatedAt`: Set to event.occurredAt (if invalidated)
  - **Notes**:
    - Conditional invalidation based on feedback impact

- **Event**: `system.profile.updated`
  - **Updates**:
    - Invalidate cache if targetLanguage changed (read LearnerProfile to check)
    - `lastUpdatedAt`: Set to event.occurredAt (if invalidated)
  - **Notes**:
    - Only invalidates if targetLanguage (learningLanguage) changed

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `education/readiness-model` (pure function)
  - **Read endpoint or entity**: ReadinessState computation (pure function call)
  - **Used to populate**: `readiness.overall`, `readiness.perSkill`, `readiness.blockers`, `computedAt`
  - **Cache guidance**: Cache computed result until invalidated by events

- **Source service**: `motivation-progress-service`
  - **Read endpoint or entity**: MasteryState (read-only API: GET /api/internal/mastery/:userId)
  - **Used to populate**: Input for readiness computation
  - **Cache guidance**: Cache for 60 seconds (mastery updates less frequently)

- **Source service**: `assessment-service` (own state)
  - **Read endpoint or entity**: Assessment results (read from own database)
  - **Used to populate**: Input for readiness computation, `sourceRefs.assessmentId`
  - **Cache guidance**: No cache needed (own state)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, cache invalidation is event-driven
- **Rebuild**: Replay all events for userId from event store, ordered by occurredAt, recompute readiness on-demand, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/learner/readiness` → uses this read model

**PII / Safety Notes**:
- Excludes raw assessment answers
- Includes only readiness results and blockers
- Readiness fields (overall, perSkill, blockers) are computed by education/readiness-model (pure function) from MasteryState + Assessment results, NOT from event payloads

--------------------------------------------------
### Read Model: FeedbackQueueView

**Owned by (Projector Owner)**: `mentoring-service` / `FeedbackQueueProjector`

**Purpose**:
- Provides a list of pending feedback requests for teachers and mentors

**Stored Keys**:
- Primary key: `authorId` (one queue per teacher/mentor)

**Consumed Events (from catalog only)**:
- `mentoring.feedback.requested`
- `mentoring.feedback.published`

**Field Updates (per event)**:

- **Event**: `mentoring.feedback.requested`
  - **Updates**:
    - `requests[]`: Add new request entry
      - `feedbackRequestId`: Read FeedbackRequest entity (own state) to get feedbackRequestId
      - `submissionId`: From event.submissionId
      - `userId`: Read FeedbackRequest entity (own state) to get userId
      - `lessonId`: Read Submission entity (read-only API) to get lessonId
      - `activityId`: Read Submission entity (read-only API) to get activityId
      - `type`: Read Submission entity (read-only API) to get type
      - `priority`: Read FeedbackRequest entity (own state) to get priority
      - `requestedAt`: Set to event.occurredAt
    - `totalCount`: Increment
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Request details are read from FeedbackRequest entity (own state) and Submission entity (read-only API)

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - `requests[]`: Remove request entry for submissionId from event
    - `totalCount`: Decrement
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Removes request when feedback is provided

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `mentoring-service` (own state)
  - **Read endpoint or entity**: FeedbackRequest entities (read from own database)
  - **Used to populate**: `requests[].feedbackRequestId`, `requests[].userId`, `requests[].priority`
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `practice-service`
  - **Read endpoint or entity**: Submission metadata (read-only API: GET /api/internal/submissions/:submissionId)
  - **Used to populate**: `requests[].lessonId`, `requests[].activityId`, `requests[].type`
  - **Cache guidance**: Cache for 60 seconds (submission metadata updates infrequently)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Lesson/activity metadata (read-only API: GET /api/internal/lessons/:lessonId)
  - **Used to populate**: `requests[].lessonTitle`, `requests[].activityTitle`
  - **Cache guidance**: Cache for 300 seconds (lesson metadata rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, remove requests when feedback published
- **Rebuild**: Replay all events for authorId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/teacher/feedback-queue` → uses this read model

**PII / Safety Notes**:
- Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary)
- Includes only metadata
- Excludes learner email, includes only userId

--------------------------------------------------
### Read Model: FeedbackRequestDetailView

**Owned by (Projector Owner)**: `mentoring-service` / `FeedbackRequestDetailProjector`

**Purpose**:
- Provides detailed view of a single feedback request with submission context and learner summary

**Stored Keys**:
- Primary key: `feedbackRequestId` (one view per feedback request)

**Consumed Events (from catalog only)**:
- `mentoring.feedback.requested`
- `mentoring.feedback.published`

**Field Updates (per event)**:

- **Event**: `mentoring.feedback.requested`
  - **Updates**:
    - `feedbackRequestId`: Read FeedbackRequest entity (own state) to get feedbackRequestId
    - `submissionId`: From event.submissionId
    - `userId`: Read FeedbackRequest entity (own state) to get userId
    - `lessonId`: Read Submission entity (read-only API) to get lessonId
    - `activityId`: Read Submission entity (read-only API) to get activityId
    - `type`: Read Submission entity (read-only API) to get type
    - `priority`: Read FeedbackRequest entity (own state) to get priority
    - `requestedAt`: Set to event.occurredAt
    - `status`: Set to 'pending'
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Request details are read from FeedbackRequest entity (own state) and Submission entity (read-only API)

- **Event**: `mentoring.feedback.published`
  - **Updates**:
    - `status`: Update to 'completed'
    - `feedbackId`: Set to event.feedbackId
    - `lastUpdatedAt`: Set to event.occurredAt
  - **Notes**:
    - Updates status when feedback is provided

**External Read-only Lookups (to enrich fields)**:

- **Source service**: `mentoring-service` (own state)
  - **Read endpoint or entity**: FeedbackRequest entity (read from own database)
  - **Used to populate**: `feedbackRequestId`, `userId`, `priority`, `status`
  - **Cache guidance**: No cache needed (own state)

- **Source service**: `practice-service`
  - **Read endpoint or entity**: Submission metadata (read-only API: GET /api/internal/submissions/:submissionId)
  - **Used to populate**: `lessonId`, `activityId`, `type`
  - **Cache guidance**: Cache for 60 seconds (submission metadata updates infrequently)

- **Source service**: `onboarding-service`
  - **Read endpoint or entity**: LearnerProfile (read-only API: GET /api/internal/learners/:userId/profile)
  - **Used to populate**: `learnerSummary.firstName`, `learnerSummary.lastName`, `learnerSummary.targetLanguage`
  - **Cache guidance**: Cache for 300 seconds (learner profile updates infrequently)

- **Source service**: `curriculum-service`
  - **Read endpoint or entity**: Lesson/activity metadata (read-only API: GET /api/internal/lessons/:lessonId)
  - **Used to populate**: `lessonTitle`, `activityTitle`
  - **Cache guidance**: Cache for 300 seconds (lesson metadata rarely changes)

**Idempotency & Replay**:
- **Dedupe key**: `eventId` (primary)
- **Ordering**: Process events in order by `occurredAt`, merge status updates
- **Rebuild**: Replay all events for feedbackRequestId from event store, ordered by occurredAt, deterministic results

**Query Usage (STEP 6 endpoints)**:
- `GET /api/teacher/feedback-requests/:feedbackRequestId` → uses this read model

**PII / Safety Notes**:
- Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets
- Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary)
- Excludes learner email, User.passwordHash
- Raw submission content fetched separately via SubmissionDetailView if authorized

---

## 3. Audit Checklist

- [x] All STEP 6 read models are included (10 read models, no more, no less)
- [x] Only events from the catalog are referenced (all events exist in `contracts/events/events.catalog.md`)
- [x] Field-level updates specified (no vague "update model" statements)
- [x] Non-ID fields only via read-only lookups (no cross-DB writes, all external data via read-only APIs)
- [x] Each read model maps to at least one query endpoint (all read models are used by STEP 6 endpoints)
- [x] No new concepts introduced (all events, read models, and endpoints from STEP 6)

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - Read model projection mapping defined for MVP  
**Related Documents**: 
- `docs/architecture/read-model-inventory.md` (STEP 6A - Read model inventory)
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query API contracts)
- `docs/architecture/event-contracts.md` (STEP 5C - Event payloads)
- `contracts/events/events.catalog.md` (Domain events catalog)
