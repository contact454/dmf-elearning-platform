# STEP 6A — Read Model Inventory (MVP)
## Kho Mô hình Đọc (Tối ưu Truy vấn)

This document defines all read models (query-optimized projections) used in the MVP. Read models are updated by event reactions only and serve as the query-side of the CQRS pattern.

---

## 0. Principles (Nguyên tắc)

- **Read models are query-optimized projections**: Shaped for specific query patterns, not verbatim copies of write models
- **Updated by event reactions only (never by commands)**: Read models are never written by commands, only updated via event consumers
- **Single writer per read model (one owning service)**: Each read model has exactly one owning service that maintains it
- **IDs-only event payloads: projections fetch non-ID fields via read-only service APIs when needed**: Event payloads contain IDs only (per STEP 5C); projectors must fetch non-ID fields (titles, scores, etc.) via read-only service APIs
- **PII constraints: exclude sensitive data (passwordHash, tokens, raw quiz answers, etc.)**: Exclude passwordHash, auth tokens, raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary), feedback text
- **Projector idempotency: eventId as primary dedupe key (at-least-once safe)**: Projections use `eventId` as primary idempotency key for at-least-once delivery safety

---

## 1. Read Models List (Bảng Danh sách)

| Read Model Name | Owned By | Primary Consumers | Sources of Truth | Update Triggers (Events) | Notes |
|----------------|----------|-------------------|------------------|-------------------------|-------|
| `LearnerDashboardView` | `progress-service` | Learner app | ProgressState, MasteryState (read-only), ReadinessState (read-only), Enrollment (read-only) | `learning.lesson.completed`, `curriculum.course.enrolled`, `system.user.registered`, `assessment.level_test.completed`, `system.profile.updated` | Aggregates progress + mastery + readiness |
| `LearnerCourseProgressView` | `progress-service` | Learner app | ProgressState, Enrollment (read-only), Course structure (read-only) | `learning.lesson.completed`, `curriculum.course.enrolled`, `curriculum.unit.unlocked`, `system.profile.updated` | Per-course detailed progress |
| `LessonAttemptListView` | `practice-service` | Learner app | Attempt | `learning.lesson.started`, `learning.lesson.completed`, `learning.lesson.abandoned` | List of attempts for a lesson |
| `LessonAttemptDetailView` | `practice-service` | Learner app | Attempt, Submission, Lesson metadata (read-only) | `learning.lesson.started`, `learning.lesson.completed`, `learning.submission.created` | Single attempt with submissions |
| `SubmissionListView` | `practice-service` | Learner app, Teacher app | Submission, Feedback (read-only), Lesson metadata (read-only) | `learning.submission.created`, `mentoring.feedback.published` | List of submissions with feedback status |
| `SubmissionDetailView` | `practice-service` | Learner app, Teacher app | Submission, Feedback (read-only), Lesson metadata (read-only) | `learning.submission.created`, `mentoring.feedback.published` | Single submission with feedback |
| `MasterySnapshotView` | `motivation-progress-service` | Learner app | MasteryState, SkillScore | `learning.lesson.completed`, `learning.submission.created`, `assessment.quiz.submitted`, `mentoring.feedback.published`, `system.profile.updated` | Current mastery state snapshot |
| `ReadinessSnapshotView` | `assessment-service` | Learner app | ReadinessState (computed), MasteryState (read-only), Assessment (read-only) | Cache invalidation: `assessment.quiz.submitted`, `assessment.level_test.completed`, `learning.lesson.completed`, `mentoring.feedback.published`, `system.profile.updated` | Cached readiness computation |
| `FeedbackQueueView` | `mentoring-service` | Teacher app, Mentor app | FeedbackRequest, Submission (read-only), Lesson metadata (read-only) | `mentoring.feedback.requested`, `mentoring.feedback.published` | Pending feedback requests |
| `FeedbackRequestDetailView` | `mentoring-service` | Teacher app, Mentor app | FeedbackRequest, Submission (read-only), LearnerProfile (read-only), Lesson metadata (read-only) | `mentoring.feedback.requested`, `mentoring.feedback.published` | Single feedback request with context |

---

## 2. Read Model Definitions (Định nghĩa từng Mô hình)

### Read Model: LearnerDashboardView

**Owned by**: `progress-service`

**Purpose**: Provides an overview of learner's current progress, active course, mastery summary, and readiness status for the learner dashboard.

**TypeScript Interface**:
```typescript
interface LearnerDashboardView {
  userId: UserId;
  currentCourseId?: CourseId;
  currentUnitId?: UnitId;
  currentLessonId?: LessonId;
  progressSummary: {
    completedLessons: number;
    completedUnits: number;
    totalLessons: number;
    totalUnits: number;
  };
  masterySummary: {
    overallScore: number; // 0-1
    skillScores: { [skill: SkillType]: number }; // 0-1 per skill
  };
  readinessStatus: 'ready' | 'not_ready' | 'unknown';
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.lesson.completed` → Updates progressSummary
  - `curriculum.course.enrolled` → Sets currentCourseId
  - `assessment.level_test.completed` → May update currentUnitId/currentLessonId
  - `system.user.registered` → Initializes empty view
  - `system.profile.updated` → Resets if targetLanguage changed
- **Read-only lookups**:
  - MasteryState from `motivation-progress-service` (read-only API) → masterySummary
  - ReadinessSnapshotView from `assessment-service` (read-only API) → readinessStatus
  - Course metadata from `curriculum-service` (read-only API) → totalLessons, totalUnits

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` (natural key)
- **Late-arriving events handling**: Replay events in order, use `lastUpdatedAt` to detect stale projections
- **Aggregation**: Projector reads ProgressState (own state) and fetches MasteryState/ReadinessState via read-only APIs

**PII Constraints**: Excludes User.email, User.passwordHash, raw submission answers, assessment answers. **Note**: Computed fields (score, cefrLevel, readiness.overall/perSkill/blockers) are derived by reading authoritative write entities (Attempt/Assessment) or by computing via education/readiness-model; NOT from event payloads.

---

### Read Model: LearnerCourseProgressView

**Owned by**: `progress-service`

**Purpose**: Provides detailed progress view for a specific course, including completed/unlocked lessons and units.

**TypeScript Interface**:
```typescript
interface LearnerCourseProgressView {
  userId: UserId;
  courseId: CourseId;
  enrollmentId: EnrollmentId;
  enrolledAt: string; // ISO 8601
  units: Array<{
    unitId: UnitId;
    unitTitle: string;
    isCompleted: boolean;
    isUnlocked: boolean;
    lessons: Array<{
      lessonId: LessonId;
      lessonTitle: string;
      isCompleted: boolean;
      isUnlocked: boolean;
    }>;
  }>;
  progressPercentage: number; // 0-100
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.lesson.completed` → Updates lesson completion status
  - `curriculum.course.enrolled` → Initializes view
  - `curriculum.unit.unlocked` → Updates unit/lesson unlock status
  - `system.profile.updated` → Resets if targetLanguage changed
- **Read-only lookups**:
  - Course structure from `curriculum-service` (read-only API) → unit/lesson titles and hierarchy
  - ProgressState (own state) → completion and unlock status

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` + `courseId` (natural key)
- **Late-arriving events handling**: Replay events in order, merge unit/lesson updates
- **Aggregation**: Projector reads ProgressState (own state) and fetches course structure via read-only curriculum-service API

**PII Constraints**: Excludes User.email, User.passwordHash.

---

### Read Model: LessonAttemptListView

**Owned by**: `practice-service`

**Purpose**: Provides a list of all attempts for a specific lesson, optimized for pagination and filtering.

**TypeScript Interface**:
```typescript
interface LessonAttemptListView {
  userId: UserId;
  lessonId: LessonId;
  attempts: Array<{
    attemptId: AttemptId;
    status: AttemptStatus;
    score?: number; // 0-100
    startedAt: string; // ISO 8601
    completedAt?: string; // ISO 8601
  }>;
  totalCount: number;
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.lesson.started` → Adds new attempt
  - `learning.lesson.completed` → Updates attempt status and score
  - `learning.lesson.abandoned` → Updates attempt status
- **Read-only lookups**:
  - Attempt entities (own state) → attempt details

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` + `lessonId` (natural key)
- **Late-arriving events handling**: Replay events in order, upsert attempts by attemptId
- **Aggregation**: Projector reads Attempt entities (own state) filtered by userId and lessonId

**PII Constraints**: Excludes raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary). **Note**: Score field is derived by reading Attempt entity (own state); NOT from event payloads.

---

### Read Model: LessonAttemptDetailView

**Owned by**: `practice-service`

**Purpose**: Provides detailed view of a single attempt, including all submissions and scores.

**TypeScript Interface**:
```typescript
interface LessonAttemptDetailView {
  attemptId: AttemptId;
  userId: UserId;
  lessonId: LessonId;
  lessonTitle: string;
  status: AttemptStatus;
  score?: number; // 0-100
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  submissions: Array<{
    submissionId: SubmissionId;
    activityId: ActivityId;
    activityTitle: string;
    type: SubmissionType;
    score?: number; // 0-100
    createdAt: string; // ISO 8601
  }>;
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.lesson.started` → Creates attempt
  - `learning.lesson.completed` → Updates status and score
  - `learning.submission.created` → Adds submission to list
- **Read-only lookups**:
  - Attempt entity (own state) → attempt details
  - Submission entities (own state) → submission list
  - Lesson metadata from `curriculum-service` (read-only API) → lessonTitle, activity titles

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `attemptId` (natural key)
- **Late-arriving events handling**: Replay events in order, merge submissions by submissionId
- **Aggregation**: Projector reads Attempt and Submission entities (own state) and fetches lesson metadata via read-only curriculum-service API

**PII Constraints**: Excludes raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary). **Note**: Score fields are derived by reading Attempt and Submission entities (own state); NOT from event payloads.

---

### Read Model: SubmissionListView

**Owned by**: `practice-service`

**Purpose**: Provides a list of submissions with feedback status, optimized for learner and teacher views.

**TypeScript Interface**:
```typescript
interface SubmissionListView {
  userId?: UserId; // For learner view
  authorId?: UserId; // For teacher view, if filtering by teacher
  submissions: Array<{
    submissionId: SubmissionId;
    attemptId: AttemptId;
    lessonId: LessonId;
    lessonTitle: string;
    activityId: ActivityId;
    activityTitle: string;
    type: SubmissionType;
    hasFeedback: boolean;
    feedbackId?: FeedbackId;
    createdAt: string; // ISO 8601
  }>;
  totalCount: number;
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.submission.created` → Adds new submission
  - `mentoring.feedback.published` → Updates hasFeedback flag
- **Read-only lookups**:
  - Submission entities (own state) → submission list
  - Feedback entities from `mentoring-service` (read-only API) → feedback status
  - Lesson/activity metadata from `curriculum-service` (read-only API) → lessonTitle, activityTitle

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` or `authorId` (natural key)
- **Late-arriving events handling**: Replay events in order, upsert submissions by submissionId
- **Aggregation**: Projector reads Submission entities (own state), fetches Feedback status via read-only mentoring-service API, and fetches lesson/activity metadata via read-only curriculum-service API

**PII Constraints**: Excludes raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary). Includes only metadata and feedback status.

---

### Read Model: SubmissionDetailView

**Owned by**: `practice-service`

**Purpose**: Provides detailed view of a single submission with feedback, for learner review and teacher feedback creation.

**TypeScript Interface**:
```typescript
interface SubmissionDetailView {
  submissionId: SubmissionId;
  attemptId: AttemptId;
  userId: UserId;
  lessonId: LessonId;
  lessonTitle: string;
  activityId: ActivityId;
  activityTitle: string;
  type: SubmissionType;
  content: {
    audioUrl?: string; // Only if authorized viewer
    text?: string; // Only if authorized viewer
    answer?: unknown; // Only if authorized viewer
  };
  score?: number; // 0-100, if graded
  createdAt: string; // ISO 8601
  feedback: {
    feedbackId?: FeedbackId;
    authorId: string;
    authorRole: 'teacher' | 'mentor' | 'ai';
    text: string;
    rubricScores?: object;
    publishedAt: string; // ISO 8601
  } | null;
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.submission.created` → Creates submission
  - `mentoring.feedback.published` → Updates feedback
- **Read-only lookups**:
  - Submission entity (own state) → submission details
  - Feedback entity from `mentoring-service` (read-only API) → feedback details
  - Lesson/activity metadata from `curriculum-service` (read-only API) → lessonTitle, activityTitle

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `submissionId` (natural key)
- **Late-arriving events handling**: Replay events in order, merge feedback updates
- **Aggregation**: Projector reads Submission entity (own state), fetches Feedback via read-only mentoring-service API, and fetches lesson/activity metadata via read-only curriculum-service API

**PII Constraints**: Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary), feedback text. Content (audioUrl, text, answer) included only for authorized viewers (submission owner or teacher/mentor with access). Excludes User.email, User.passwordHash. **Note**: Score field is derived by reading Submission entity (own state); NOT from event payloads.

---

### Read Model: MasterySnapshotView

**Owned by**: `motivation-progress-service`

**Purpose**: Provides a current snapshot of learner's mastery state, optimized for quick display.

**TypeScript Interface**:
```typescript
interface MasterySnapshotView {
  userId: UserId;
  skillScores: {
    [skill: SkillType]: {
      scoreVal: number; // 0-1
      lastUpdatedAt: string; // ISO 8601
    };
  };
  lessonMastery: Array<{
    lessonId: LessonId;
    overallScore: number; // 0-1
    skillBreakdown: { [skill: SkillType]: number }; // 0-1 per skill
    lastUpdatedAt: string; // ISO 8601
  }>;
  lastCalculatedAt: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `learning.lesson.completed` → Updates lessonMastery and skillScores
  - `learning.submission.created` → Updates lessonMastery (if lesson not completed)
  - `assessment.quiz.submitted` → Updates skillScores
  - `mentoring.feedback.published` → Updates lessonMastery and skillScores (for speaking/writing)
  - `system.profile.updated` → Resets if targetLanguage changed
- **Read-only lookups**:
  - MasteryState (own state) → mastery data
  - SkillScore (own state) → skill scores

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` (natural key)
- **Late-arriving events handling**: Replay events in order, recalculate aggregates
- **Aggregation**: Projector reads MasteryState and SkillScore (own state), no cross-service lookups needed

**PII Constraints**: Excludes raw quiz answers payloads, secrets. Includes only aggregated scores. **Note**: Score fields (scoreVal, overallScore, skillBreakdown) are derived by reading MasteryState and SkillScore entities (own state); NOT from event payloads.

---

### Read Model: ReadinessSnapshotView

**Owned by**: `assessment-service`

**Purpose**: Provides a cached snapshot of learner's readiness state (computed by education/readiness-model).

**TypeScript Interface**:
```typescript
interface ReadinessSnapshotView {
  userId: UserId;
  computedAt: string; // ISO 8601
  readiness: {
    overall: 'ready' | 'not_ready' | 'unknown';
    perSkill: { [skill: SkillType]: 'ready' | 'not_ready' | 'unknown' };
    blockers: string[];
  };
  sourceRefs: {
    assessmentId?: AssessmentId;
    masteryVersion?: number;
  };
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed** (cache invalidation triggers):
  - `assessment.quiz.submitted` → Invalidates cache (recompute on next read)
  - `assessment.level_test.completed` → Invalidates cache (recompute on next read)
  - `learning.lesson.completed` → May invalidate cache (conditional on score threshold)
  - `mentoring.feedback.published` → May invalidate cache (conditional on feedback impact)
  - `system.profile.updated` → Invalidates cache if targetLanguage changed
- **Read-only lookups**:
  - ReadinessState computation (via education/readiness-model pure function) → readiness data
  - MasteryState from `motivation-progress-service` (read-only API) → input for computation
  - Assessment results from own state → input for computation

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `userId` (natural key)
- **Late-arriving events handling**: Cache invalidation is event-driven; computation happens on-demand on next read
- **Aggregation**: Cache is computed by education/readiness-model (pure function) from MasteryState + Assessment results. Cache is NOT the source of truth; computation is authoritative.

**PII Constraints**: Excludes raw assessment answers, includes only readiness results and blockers. **Note**: Readiness fields (overall, perSkill, blockers) are computed by education/readiness-model (pure function) from MasteryState + Assessment results; NOT from event payloads.

---

### Read Model: FeedbackQueueView

**Owned by**: `mentoring-service`

**Purpose**: Provides a list of pending feedback requests for teachers and mentors.

**TypeScript Interface**:
```typescript
interface FeedbackQueueView {
  authorId: UserId; // teacher/mentor ID
  requests: Array<{
    feedbackRequestId: string;
    submissionId: SubmissionId;
    userId: UserId;
    lessonId: LessonId;
    lessonTitle: string;
    activityId: ActivityId;
    activityTitle: string;
    type: SubmissionType;
    priority: 'low' | 'normal' | 'high';
    requestedAt: string; // ISO 8601
  }>;
  totalCount: number;
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `mentoring.feedback.requested` → Adds new request
  - `mentoring.feedback.published` → Removes request (feedback provided)
- **Read-only lookups**:
  - FeedbackRequest entities (own state) → request list
  - Submission metadata from `practice-service` (read-only API) → submission type and metadata
  - Lesson/activity metadata from `curriculum-service` (read-only API) → lessonTitle, activityTitle

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `authorId` (natural key)
- **Late-arriving events handling**: Replay events in order, remove requests when feedback published
- **Aggregation**: Projector reads FeedbackRequest entities (own state), fetches Submission metadata via read-only practice-service API, and fetches lesson/activity metadata via read-only curriculum-service API

**PII Constraints**: Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary). Includes only metadata. Excludes learner email, includes only userId.

---

### Read Model: FeedbackRequestDetailView

**Owned by**: `mentoring-service`

**Purpose**: Provides detailed view of a single feedback request with submission context and learner summary.

**TypeScript Interface**:
```typescript
interface FeedbackRequestDetailView {
  feedbackRequestId: string;
  submissionId: SubmissionId;
  userId: UserId;
  learnerSummary: {
    firstName?: string;
    lastName?: string;
    targetLanguage: LanguageCode;
  };
  lessonId: LessonId;
  lessonTitle: string;
  activityId: ActivityId;
  activityTitle: string;
  type: SubmissionType;
  priority: 'low' | 'normal' | 'high';
  requestedAt: string; // ISO 8601
  status: 'pending' | 'processing' | 'completed';
  feedbackId?: FeedbackId; // If completed
  lastUpdatedAt: string; // ISO 8601
}
```

**Data Sources**:
- **Events consumed**:
  - `mentoring.feedback.requested` → Creates request
  - `mentoring.feedback.published` → Updates status to completed
- **Read-only lookups**:
  - FeedbackRequest entity (own state) → request details
  - Submission metadata from `practice-service` (read-only API) → submission type
  - LearnerProfile from `onboarding-service` (read-only API) → learnerSummary
  - Lesson/activity metadata from `curriculum-service` (read-only API) → lessonTitle, activityTitle

**Update Strategy**:
- **Projector idempotency key**: `eventId` (primary), `feedbackRequestId` (natural key)
- **Late-arriving events handling**: Replay events in order, merge status updates
- **Aggregation**: Projector reads FeedbackRequest entity (own state), fetches Submission metadata via read-only practice-service API, fetches LearnerProfile via read-only onboarding-service API, and fetches lesson/activity metadata via read-only curriculum-service API

**PII Constraints**: Forbidden: passwordHash, auth tokens, raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary). Excludes learner email, User.passwordHash, raw submission content (content fetched separately via SubmissionDetailView if authorized).

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - Read model inventory defined for MVP  
**Related Documents**: 
- `docs/architecture/state-models.md` (STEP 5A - Write state models)
- `docs/architecture/state-transition-mapping.md` (STEP 5B - State transitions)
- `docs/architecture/event-contracts.md` (STEP 5C - Event payloads)
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query API contracts)
