# API to Events Mapping
## Ánh xạ Endpoint → Event

This document maps each API endpoint to the domain events it emits, including success/failure paths and data linkage.

---

## Overview

**Purpose**: Document which domain events are emitted by each endpoint, ensuring traceability from API calls to event streams.

**Event Catalog**: See `contracts/events/events.catalog.md` (15 events total)  
**Event Types**: See `packages/shared/src/events/` (typed definitions)

---

## Mapping Table

| Endpoint | Success Path → Events | Failure Path → Events | Data Linkage |
|----------|----------------------|----------------------|--------------|
| `POST /onboarding/placement` | `assessment.level_test.completed` | None (error response only) | `assessmentId` from response → event payload |
| `POST /curriculum/enroll` | `curriculum.course.enrolled` | None | `enrollmentId` from response → event payload |
| `GET /curriculum/next` | None (read-only) | None | N/A |
| `POST /practice/lesson/start` | `learning.lesson.started` | None | `attemptId` from response → event `session_id` and payload |
| `POST /practice/lesson/complete` | `learning.lesson.completed` OR `learning.lesson.abandoned` | None | `attemptId` from request → event payload; `status` determines event type |
| `POST /practice/submission` | `learning.submission.created` | None | `submissionId` from response → event payload; `attemptId` links to attempt |
| `POST /assessment/quiz/start` | `assessment.quiz.started` | None | `attemptId` from response → event payload `attemptId?` |
| `POST /assessment/quiz/submit` | `assessment.quiz.submitted` | None | `assessmentId` from request → event payload; `score` from response → event payload |
| `POST /mentoring/feedback/request` | `mentoring.feedback.requested` | None | `submissionId` from request → event payload |
| `POST /mentoring/feedback/publish` | `mentoring.feedback.published` | None | `feedbackId` from response → event payload; `submissionId` links to submission |
| `POST /system/user/register` | `system.user.registered` | None | `userId` from response → event payload and envelope `user_id` |
| `POST /system/user/login` | `system.user.login` | None | `userId` from response → event payload and envelope `user_id` |
| `PATCH /system/user/profile` | `system.profile.updated` | None | `userId` from request context → event payload and envelope `user_id` |

---

## Detailed Event Mappings

### Onboarding Service

#### `POST /onboarding/placement`
**Success Path**:
- Emits: `assessment.level_test.completed`
- Event Payload:
  ```typescript
  {
    assessmentId: string,        // From response
    attemptId?: AttemptId,       // If applicable
    finalGrade?: number          // If calculated
  }
  ```
- Envelope: `user_id` from request, `timestamp` = now

**Failure Path**: No events emitted (error response only)

**Data Linkage**: `assessmentId` from response connects to assessment entity.

---

### Curriculum Service

#### `POST /curriculum/enroll`
**Success Path**:
- Emits: `curriculum.course.enrolled`
- Event Payload:
  ```typescript
  {
    enrollmentId: EnrollmentId,  // From response
    courseId: CourseId          // From request
  }
  ```
- Envelope: `user_id` from request, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `enrollmentId` connects to enrollment entity.

---

#### `GET /curriculum/next`
**Success Path**: No events (read-only endpoint)

**Failure Path**: No events

**Data Linkage**: N/A (read-only)

---

### Practice Service

#### `POST /practice/lesson/start`
**Success Path**:
- Emits: `learning.lesson.started`
- Event Payload:
  ```typescript
  {
    lessonId: LessonId,         // From request
    attemptId: AttemptId        // From response
  }
  ```
- Envelope: `user_id` from request, `session_id` = `attemptId`, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `attemptId` links to attempt entity; used as `session_id` for correlation.

---

#### `POST /practice/lesson/complete`
**Success Path**:
- Emits: `learning.lesson.completed` OR `learning.lesson.abandoned`
- Event Type: Determined by request `status` field
- Event Payload:
  ```typescript
  {
    lessonId: LessonId,         // From attempt
    attemptId: AttemptId,       // From request
    status: AttemptStatus,      // From request ('completed' or 'abandoned')
    score?: number              // From request (if completed)
  }
  ```
- Envelope: `user_id` from request context, `session_id` = `attemptId`, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `attemptId` links to attempt entity; `status` determines which event is emitted.

---

#### `POST /practice/submission`
**Success Path**:
- Emits: `learning.submission.created`
- Event Payload:
  ```typescript
  {
    submissionId: SubmissionId,  // From response
    attemptId: AttemptId,       // From request
    activityId: ActivityId,     // From request
    lessonId: LessonId,         // From attempt context
    type: SubmissionType        // From request ('speaking' or 'writing')
  }
  ```
- Envelope: `user_id` from request context, `session_id` = `attemptId`, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `submissionId` links to submission entity; `attemptId` links to attempt; `activityId` links to activity.

---

### Assessment Service

#### `POST /assessment/quiz/start`
**Success Path**:
- Emits: `assessment.quiz.started`
- Event Payload:
  ```typescript
  {
    assessmentId: AssessmentId, // From request
    attemptId?: AttemptId       // From response (if applicable)
  }
  ```
- Envelope: `user_id` from request, `session_id` = `attemptId` (if present), `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `assessmentId` links to assessment entity; `attemptId` links to attempt (if created).

---

#### `POST /assessment/quiz/submit`
**Success Path**:
- Emits: `assessment.quiz.submitted`
- Event Payload:
  ```typescript
  {
    assessmentId: AssessmentId, // From request
    attemptId?: AttemptId,      // From request (if provided)
    score: number,              // From response (required)
    levelHint?: CEFRLevel       // From response (optional)
  }
  ```
- Envelope: `user_id` from request context, `session_id` = `attemptId` (if present), `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `assessmentId` links to assessment entity; `score` is required for anti "học ảo" measurement.

---

### Mentoring Service

#### `POST /mentoring/feedback/request`
**Success Path**:
- Emits: `mentoring.feedback.requested`
- Event Payload:
  ```typescript
  {
    submissionId: SubmissionId  // From request
  }
  ```
- Envelope: `user_id` from request context, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `submissionId` links to submission entity.

---

#### `POST /mentoring/feedback/publish`
**Success Path**:
- Emits: `mentoring.feedback.published`
- Event Payload:
  ```typescript
  {
    feedbackId: FeedbackId,     // From response
    submissionId: SubmissionId, // From request
    author: FeedbackAuthor,     // From request context (required)
    targetAttemptId?: AttemptId // Optional (if applicable)
  }
  ```
- Envelope: `user_id` from request context, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `feedbackId` links to feedback entity; `submissionId` links to submission; `author` distinguishes AI vs human feedback.

---

### System Service

#### `POST /system/user/register`
**Success Path**:
- Emits: `system.user.registered`
- Event Payload:
  ```typescript
  {
    userId: UserId,             // From response
    targetLanguage?: LanguageCode // From request (optional)
  }
  ```
- Envelope: `user_id` = `userId`, `timestamp` = now

**Failure Path**: No events emitted (409 Conflict if user exists)

**Data Linkage**: `userId` links to user entity.

---

#### `POST /system/user/login`
**Success Path**:
- Emits: `system.user.login`
- Event Payload:
  ```typescript
  {
    userId: UserId              // From response
  }
  ```
- Envelope: `user_id` = `userId`, `timestamp` = now, `context` may include device/IP

**Failure Path**: No events emitted (401 Unauthorized if invalid credentials)

**Data Linkage**: `userId` links to user entity.

---

#### `PATCH /system/user/profile`
**Success Path**:
- Emits: `system.profile.updated`
- Event Payload:
  ```typescript
  {
    userId: UserId              // From request context
  }
  ```
- Envelope: `user_id` = `userId`, `timestamp` = now

**Failure Path**: No events emitted

**Data Linkage**: `userId` links to user entity.

---

## Event Emission Rules

### Success Path
- Events are emitted **after** successful API processing
- Events are emitted **only** on HTTP 2xx responses
- Event payloads use data from API request/response

### Failure Path
- **No events emitted** on HTTP 4xx/5xx errors
- Exception: System audit events (future consideration)
- Error responses follow standard `ErrorResponse` schema

### Data Linkage
- **IDs from Response**: Used in event payloads (attemptId, submissionId, etc.)
- **IDs from Request**: Used when response doesn't provide them
- **Session Correlation**: `attemptId` often used as `session_id` in envelope
- **User Context**: `user_id` in envelope always matches authenticated user

---

## ID Flow Examples

### Lesson Practice Flow
```
1. POST /practice/lesson/start
   → Response: { attemptId: "attempt-123" }
   → Event: learning.lesson.started { lessonId, attemptId }
   → session_id: "attempt-123"

2. POST /practice/submission
   → Request: { attemptId: "attempt-123", activityId: "activity-456" }
   → Response: { submissionId: "submission-789" }
   → Event: learning.submission.created { submissionId, attemptId, activityId, lessonId, type }
   → session_id: "attempt-123" (correlates with step 1)

3. POST /practice/lesson/complete
   → Request: { attemptId: "attempt-123", status: "completed", score: 85 }
   → Event: learning.lesson.completed { lessonId, attemptId, status, score }
   → session_id: "attempt-123" (correlates with steps 1-2)
```

### Assessment Flow
```
1. POST /assessment/quiz/start
   → Request: { userId, assessmentId: "assessment-123" }
   → Response: { attemptId: "quiz-attempt-456" }
   → Event: assessment.quiz.started { assessmentId, attemptId }
   → session_id: "quiz-attempt-456"

2. POST /assessment/quiz/submit
   → Request: { assessmentId: "assessment-123", attemptId: "quiz-attempt-456", answers: [...] }
   → Response: { score: 75, levelHint: "B1" }
   → Event: assessment.quiz.submitted { assessmentId, attemptId, score, levelHint }
   → session_id: "quiz-attempt-456" (correlates with step 1)
```

---

## Verification Checklist

Before implementing endpoints, verify:
- [ ] Event name matches `contracts/events/events.catalog.md`
- [ ] Event payload structure matches `packages/shared/src/events/*.ts`
- [ ] All required payload fields are present
- [ ] IDs from API response/request are correctly mapped to event payload
- [ ] `session_id` in envelope uses appropriate correlation ID (attemptId, etc.)
- [ ] `user_id` in envelope matches authenticated user
- [ ] No events emitted on error paths (unless system audit)

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Mapping Complete - Ready for Implementation
