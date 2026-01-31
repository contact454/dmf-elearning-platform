# STEP 6B — Query API Contracts (MVP)
## Hợp đồng API Truy vấn (Read-only)

This document defines query API contracts for all read-only endpoints in the MVP. Queries return read models and never mutate state.

---

## 0. Principles (Nguyên tắc)

- **Queries do not mutate state**: All endpoints are read-only (GET requests)
- **Endpoints return read models**: Response shapes match read models defined in `read-model-inventory.md`
- **Errors use STEP 4.4 failure categories**: NotFound, Forbidden, ValidationError, TransientFailure
- **Auth: role-based and ownership-based**: Users can only query their own data unless they have teacher/mentor/admin roles
- **Pagination for list endpoints**: All list endpoints support pagination (limit, offset)
- **Caching notes**: Optional ETag and maxAge hints for client-side caching
- **Computed fields source**: Computed fields (score, cefrLevel, readiness) are obtained via read-only lookups of write entities or pure computation models; events provide IDs only

---

## 1. Learner App Queries (Truy vấn Ứng dụng Học viên)

### GET /api/learner/dashboard

**Purpose**: Returns learner dashboard overview with progress, mastery, and readiness summary.

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user

**Request Params**:
```typescript
interface LearnerDashboardRequest {
  // No params (uses authenticated userId from session)
}
```

**Response**:
```typescript
interface LearnerDashboardResponse {
  dashboard: LearnerDashboardView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: User not found or not a learner
- `403 Forbidden`: User does not have learner role or userId mismatch
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from dashboard view
- maxAge: 60 seconds (dashboard updates frequently)

**Serving Service**: `progress-service`

---

### GET /api/learner/courses/:courseId/progress

**Purpose**: Returns detailed progress view for a specific course.

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user, user must be enrolled in course

**Request Params**:
```typescript
interface LearnerCourseProgressRequest {
  courseId: CourseId; // Path parameter
}
```

**Response**:
```typescript
interface LearnerCourseProgressResponse {
  progress: LearnerCourseProgressView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: Course not found or user not enrolled
- `403 Forbidden`: User does not have learner role or userId mismatch
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from progress view
- maxAge: 300 seconds (progress updates less frequently)

**Serving Service**: `progress-service`

---

### GET /api/learner/lessons/:lessonId/attempts

**Purpose**: Returns list of attempts for a specific lesson.

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user

**Request Params**:
```typescript
interface LessonAttemptListRequest {
  lessonId: LessonId; // Path parameter
  limit?: number; // Default: 20, max: 100
  offset?: number; // Default: 0
}
```

**Response**:
```typescript
interface LessonAttemptListResponse {
  attempts: LessonAttemptListView; // From read-model-inventory.md
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**Errors**:
- `404 NotFound`: Lesson not found
- `403 Forbidden`: User does not have learner role, userId mismatch, or lesson not unlocked
- `400 ValidationError`: Invalid limit or offset values
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from attempt list view
- maxAge: 180 seconds

**Serving Service**: `practice-service`

---

### GET /api/learner/attempts/:attemptId

**Purpose**: Returns detailed view of a single attempt with submissions. Does NOT compute mastery or unlock status (those are derived states).

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user and attempt owner

**Request Params**:
```typescript
interface LessonAttemptDetailRequest {
  attemptId: AttemptId; // Path parameter
}
```

**Response**:
```typescript
interface LessonAttemptDetailResponse {
  attempt: LessonAttemptDetailView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: Attempt not found
- `403 Forbidden`: User does not have learner role, userId mismatch, or attempt does not belong to user
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from attempt detail view
- maxAge: 300 seconds (attempt details are immutable after completion)

**Serving Service**: `practice-service`

---

### GET /api/learner/submissions

**Purpose**: Returns list of learner's submissions with feedback status.

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user

**Request Params**:
```typescript
interface SubmissionListRequest {
  lessonId?: LessonId; // Optional filter
  attemptId?: AttemptId; // Optional filter
  type?: SubmissionType; // Optional filter
  limit?: number; // Default: 20, max: 100
  offset?: number; // Default: 0
}
```

**Response**:
```typescript
interface SubmissionListResponse {
  submissions: SubmissionListView; // From read-model-inventory.md
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**Errors**:
- `403 Forbidden`: User does not have learner role or userId mismatch
- `400 ValidationError`: Invalid filter values or pagination params
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from submission list view
- maxAge: 120 seconds

**Serving Service**: `practice-service`

---

### GET /api/learner/submissions/:submissionId

**Purpose**: Returns detailed view of a single submission with feedback summary.

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user and submission owner

**Request Params**:
```typescript
interface SubmissionDetailRequest {
  submissionId: SubmissionId; // Path parameter
}
```

**Response**:
```typescript
interface SubmissionDetailResponse {
  submission: SubmissionDetailView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: Submission not found
- `403 Forbidden`: User does not have learner role, userId mismatch, or submission does not belong to user
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from submission detail view
- maxAge: 300 seconds (submission details are immutable after creation, feedback may update)

**Serving Service**: `practice-service`

---

### GET /api/learner/mastery

**Purpose**: Returns current mastery snapshot (read-only).

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user

**Request Params**:
```typescript
interface MasterySnapshotRequest {
  // No params (uses authenticated userId from session)
}
```

**Response**:
```typescript
interface MasterySnapshotResponse {
  mastery: MasterySnapshotView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: User not found or not a learner
- `403 Forbidden`: User does not have learner role or userId mismatch
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastCalculatedAt` from mastery snapshot
- maxAge: 300 seconds (mastery updates less frequently)

**Serving Service**: `motivation-progress-service`

---

### GET /api/learner/readiness

**Purpose**: Returns current readiness snapshot (computed/cached; explicitly state it may be cached).

**Auth**: 
- Role: `learner`
- Ownership: `userId` must match authenticated user

**Request Params**:
```typescript
interface ReadinessSnapshotRequest {
  // No params (uses authenticated userId from session)
}
```

**Response**:
```typescript
interface ReadinessSnapshotResponse {
  readiness: ReadinessSnapshotView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: User not found or not a learner
- `403 Forbidden`: User does not have learner role or userId mismatch
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `computedAt` from readiness snapshot
- maxAge: 600 seconds (readiness updates infrequently, cache is authoritative until invalidated)
- **Note**: This endpoint may return cached data. Cache is invalidated by events; recomputation happens on-demand.

**Serving Service**: `assessment-service`

---

## 2. Teacher/Mentor Dashboard Queries (Truy vấn Giáo viên/Mentor)

### GET /api/teacher/feedback-queue

**Purpose**: Returns list of pending feedback requests for authenticated teacher/mentor.

**Auth**: 
- Role: `teacher` OR `mentor`
- Ownership: `authorId` must match authenticated user (teacher/mentor can only see their own queue)

**Request Params**:
```typescript
interface FeedbackQueueRequest {
  priority?: 'low' | 'normal' | 'high'; // Optional filter
  status?: 'pending' | 'processing'; // Optional filter
  limit?: number; // Default: 20, max: 100
  offset?: number; // Default: 0
}
```

**Response**:
```typescript
interface FeedbackQueueResponse {
  queue: FeedbackQueueView; // From read-model-inventory.md
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**Errors**:
- `403 Forbidden`: User does not have teacher or mentor role
- `400 ValidationError`: Invalid filter values or pagination params
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from feedback queue view
- maxAge: 30 seconds (queue updates frequently)

**Serving Service**: `mentoring-service`

---

### GET /api/teacher/feedback-requests/:feedbackRequestId

**Purpose**: Returns detailed view of a feedback request with submission context and learner summary.

**Auth**: 
- Role: `teacher` OR `mentor`
- Ownership: Feedback request must belong to authenticated teacher/mentor. Teacher/Mentor may access feedback request ONLY when there exists a FeedbackRequest or Feedback entity linking them to that request (feedback queue linkage). No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

**Request Params**:
```typescript
interface FeedbackRequestDetailRequest {
  feedbackRequestId: string; // Path parameter
}
```

**Response**:
```typescript
interface FeedbackRequestDetailResponse {
  request: FeedbackRequestDetailView; // From read-model-inventory.md
}
```

**Errors**:
- `404 NotFound`: Feedback request not found
- `403 Forbidden`: User does not have teacher or mentor role, or no access to feedback request
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from feedback request detail view
- maxAge: 60 seconds

**Serving Service**: `mentoring-service`

**Note**: No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

---

### GET /api/teacher/submissions/:submissionId

**Purpose**: Returns detailed view of a submission for feedback creation. Fetches text/audioUrl references, NOT raw files (files are served separately).

**Auth**: 
- Role: `teacher` OR `mentor`
- Ownership: Teacher/Mentor may access submission detail ONLY when there exists a FeedbackRequest or Feedback entity linking them to that submission (feedback queue linkage). No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

**Request Params**:
```typescript
interface TeacherSubmissionDetailRequest {
  submissionId: SubmissionId; // Path parameter
}
```

**Response**:
```typescript
interface TeacherSubmissionDetailResponse {
  submission: SubmissionDetailView; // From read-model-inventory.md (includes full content: audioUrl, text, answer)
}
```

**Errors**:
- `404 NotFound`: Submission not found
- `403 Forbidden`: User does not have teacher or mentor role, or no access to submission (no pending feedback request linked to teacher/mentor)
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on `lastUpdatedAt` from submission detail view
- maxAge: 300 seconds

**Serving Service**: `practice-service`

**Note**: No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

---

### GET /api/teacher/learners/:userId/summary

**Purpose**: Returns limited learner profile summary for teacher/mentor view (name, targetLanguage, progress snapshot).

**Auth**: 
- Role: `teacher` OR `mentor`
- Ownership: Teacher/Mentor may access learner summary ONLY when there exists a FeedbackRequest or Feedback entity linking them to a submission from that learner (feedback queue linkage). No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

**Request Params**:
```typescript
interface LearnerSummaryRequest {
  userId: UserId; // Path parameter
}
```

**Response**:
```typescript
interface LearnerSummaryResponse {
  profile: {
    userId: UserId;
    firstName?: string;
    lastName?: string;
    targetLanguage: LanguageCode;
    progressSnapshot: {
      completedLessons: number;
      currentLessonId?: LessonId;
    };
    masterySnapshot: {
      overallScore: number; // 0-1
    };
  };
}
```

**Errors**:
- `404 NotFound`: Learner not found
- `403 Forbidden`: User does not have teacher or mentor role, or no access to learner (no feedback request linkage)
- `500 TransientFailure`: Service unavailable (retryable)

**Caching Notes**:
- ETag: Based on profile `updatedAt` timestamp
- maxAge: 600 seconds

**Serving Service**: `onboarding-service` (composes from User, LearnerProfile, ProgressState read-only, MasteryState read-only)

**Note**: No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.

---

## 3. Admin Queries (Truy vấn Quản trị)

**Status**: Out of scope for MVP

Admin queries (user search, enrollment list, system metrics) are explicitly excluded from MVP scope. These will be added in a future release.

---

## 4. Projection Ownership & Data Access Rules (Quy tắc Sở hữu & Truy cập Dữ liệu)

### Service Ownership of Read Models

Each read model is owned by exactly one service that maintains the projection:

- **progress-service** owns:
  - `LearnerDashboardView`
  - `LearnerCourseProgressView`
  - Serves endpoints: `/api/learner/dashboard`, `/api/learner/courses/:courseId/progress`

- **practice-service** owns:
  - `LessonAttemptListView`
  - `LessonAttemptDetailView`
  - `SubmissionListView`
  - `SubmissionDetailView`
  - Serves endpoints: `/api/learner/lessons/:lessonId/attempts`, `/api/learner/attempts/:attemptId`, `/api/learner/submissions`, `/api/learner/submissions/:submissionId`, `/api/teacher/submissions/:submissionId`

- **mentoring-service** owns:
  - `FeedbackQueueView`
  - `FeedbackRequestDetailView`
  - Serves endpoints: `/api/teacher/feedback-queue`, `/api/teacher/feedback-requests/:feedbackRequestId`

- **motivation-progress-service** owns:
  - `MasterySnapshotView`
  - Serves endpoints: `/api/learner/mastery`

- **assessment-service** owns:
  - `ReadinessSnapshotView`
  - Serves endpoints: `/api/learner/readiness`

- **onboarding-service** serves:
  - `/api/teacher/learners/:userId/summary` (composes from multiple read models via read-only APIs)

### Cross-Service Data Access Rules

**Rule 1: Read Models Must Be Owned by Serving Service**
- Each read model is maintained by exactly one service
- The service that serves the endpoint owns the read model projection

**Rule 2: Cross-Service Data via Read-Only APIs**
- If a read model needs data from another service, the projector fetches it via read-only service APIs (not direct DB access)
- Examples:
  - `LearnerDashboardView` (progress-service) fetches MasteryState via read-only API from motivation-progress-service
  - `SubmissionDetailView` (practice-service) fetches Feedback via read-only API from mentoring-service
  - `SubmissionDetailView` (practice-service) fetches lesson metadata via read-only API from curriculum-service

**Rule 3: No Direct Database Access Across Services**
- Services MUST NOT access foreign service databases directly
- All cross-service data access must go through:
  - Read-only service APIs (REST/GraphQL)
  - Event payloads (IDs only, then fetch via read-only API if needed)

**Rule 4: Composition Endpoints**
- Some endpoints may compose data from multiple read models
- Example: `/api/teacher/learners/:userId/summary` (onboarding-service) composes:
  - User + LearnerProfile (own state)
  - ProgressState snapshot (read-only API from progress-service)
  - MasteryState snapshot (read-only API from motivation-progress-service)

**Rule 5: Idempotency for Projections**
- Projections must handle event replay idempotently
- Each projection uses `eventId` as primary idempotency key
- Natural keys (userId, attemptId, submissionId, etc.) are used as secondary deduplication keys
- Late-arriving events are handled by replaying events in order and merging updates

**Rule 6: Cache Invalidation**
- Read models are updated by event reactions
- Cache invalidation (if implemented) is event-driven
- Example: `ReadinessSnapshotView` cache is invalidated by events, recomputed on next read

**Rule 7: Teacher/Mentor Access in MVP**
- No assignment or course-role model exists in MVP; access is derived only from feedback request linkage
- Teacher/Mentor may access learner/submission detail ONLY when there exists a FeedbackRequest or Feedback entity linking them to that submission (feedback queue linkage)
- Do NOT allow "same course" or "global access" assumptions
- If an endpoint requires teacher/mentor to fetch submission/learner data, it must be constrained by the feedback request linkage

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - Query API contracts defined for MVP  
**Related Documents**: 
- `docs/architecture/read-model-inventory.md` (STEP 6A - Read model inventory)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Failure categories)
- `docs/architecture/state-models.md` (STEP 5A - Write state models)
- `docs/architecture/event-contracts.md` (STEP 5C - Event payloads)
