# API Map
## Bản đồ Endpoint MVP

This document provides a comprehensive map of all MVP API endpoints, their ownership, and usage.

---

## Overview

**Total Endpoints**: 12  
**API Gateway**: `contracts/openapi/api-gateway.openapi.yaml`  
**Status**: Schema-first blueprint (no runtime implementation)

---

## Endpoint Table

| Endpoint | Method | Owner Service | Purpose | Request | Response | Notes |
|----------|--------|---------------|---------|---------|----------|-------|
| `/onboarding/placement` | POST | `onboarding` | Submit placement test results for level assessment | `SubmitPlacementInput` | `PlacementTestResponse` | Emits `assessment.level_test.completed` |
| `/curriculum/enroll` | POST | `curriculum` | Enroll user in a course/level | `EnrollCourseInput` | `EnrollmentResponse` | Emits `curriculum.course.enrolled` |
| `/curriculum/next` | GET | `curriculum` | Get next recommended lesson/unit for user | `userId` (query) | `NextCurriculumResponse` | Used for navigation |
| `/practice/lesson/start` | POST | `practice` | Initialize a lesson attempt session | `CreateAttemptInput` | `AttemptResponse` | Emits `learning.lesson.started` |
| `/practice/lesson/complete` | POST | `practice` | Mark lesson attempt as completed/abandoned | `CompleteLessonInput` | `LessonCompletionResponse` | Emits `learning.lesson.completed` or `learning.lesson.abandoned` |
| `/practice/submission` | POST | `practice` | Submit activity answer (speaking/writing) | `SubmitSpeakingInput` or `SubmitWritingInput` | `SubmissionResponse` | Emits `learning.submission.created` |
| `/assessment/quiz/start` | POST | `assessment` | Initialize a quiz/assessment attempt | `StartQuizInput` | `QuizAttemptResponse` | Emits `assessment.quiz.started` |
| `/assessment/quiz/submit` | POST | `assessment` | Submit quiz answers for grading | `SubmitQuizInput` | `QuizSubmissionResponse` | Emits `assessment.quiz.submitted` |
| `/mentoring/feedback/request` | POST | `mentoring` | Request feedback for a submission | `RequestFeedbackInput` | `FeedbackRequestResponse` | Emits `mentoring.feedback.requested` |
| `/mentoring/feedback/publish` | POST | `mentoring` | Publish feedback (AI/teacher/mentor) | `RecordFeedbackInput` | `FeedbackResponse` | Emits `mentoring.feedback.published` |
| `/system/user/register` | POST | `onboarding` | Register a new user account | `RegisterUserInput` | `UserResponse` | Emits `system.user.registered` |
| `/system/user/login` | POST | `onboarding` | Authenticate user and create session | `LoginUserInput` | `LoginResponse` | Emits `system.user.login` (TODO: auth placeholder) |
| `/system/user/profile` | PATCH | `onboarding` | Update user profile information | `UpdateProfileInput` | `UserResponse` | Emits `system.profile.updated` |

---

## Service Ownership

### Onboarding Service (`services/onboarding/`)
- `/onboarding/placement` - Placement test submission
- `/system/user/register` - User registration
- `/system/user/login` - User authentication
- `/system/user/profile` - Profile management

### Curriculum Service (`services/curriculum/`)
- `/curriculum/enroll` - Course enrollment
- `/curriculum/next` - Next lesson/unit recommendation

### Practice Service (`services/practice/`)
- `/practice/lesson/start` - Start lesson attempt
- `/practice/lesson/complete` - Complete/abandon lesson
- `/practice/submission` - Submit activity answer

### Assessment Service (`services/assessment/`)
- `/assessment/quiz/start` - Start quiz attempt
- `/assessment/quiz/submit` - Submit quiz answers

### Mentoring Service (`services/mentoring/`)
- `/mentoring/feedback/request` - Request feedback
- `/mentoring/feedback/publish` - Publish feedback

---

## Request/Response DTOs

### From @dmf/shared (Referenced)
- `CreateAttemptInput` - Used by `/practice/lesson/start`
- `SubmitSpeakingInput` - Used by `/practice/submission` (speaking)
- `SubmitWritingInput` - Used by `/practice/submission` (writing)
- `RecordFeedbackInput` - Used by `/mentoring/feedback/publish`

### New Schemas (TODO: Move to @dmf/shared)
- `SubmitPlacementInput` - Placement test submission
- `EnrollCourseInput` - Course enrollment
- `CompleteLessonInput` - Lesson completion
- `StartQuizInput` - Quiz start
- `SubmitQuizInput` - Quiz submission
- `RequestFeedbackInput` - Feedback request
- `RegisterUserInput` - User registration
- `LoginUserInput` - User login
- `UpdateProfileInput` - Profile update

---

## Response Patterns

### Standard Success Response
All endpoints return:
- IDs (attemptId, submissionId, enrollmentId, etc.)
- Status (when applicable)
- `nextAction` hint (when relevant for UX)

### Standard Error Response
All endpoints return `ErrorResponse` on error:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "requestId": "uuid",
  "details": {}
}
```

---

## Notes

1. **Schema-First**: All endpoints are defined in OpenAPI spec only. No runtime implementation yet.
2. **DTO Alignment**: Endpoints reference `@dmf/shared` DTOs where available. New schemas are marked with TODO for migration.
3. **Event Emission**: Each endpoint documents which domain events it emits (see `api-to-events-mapping.md`).
4. **Auth Placeholder**: `/system/user/login` includes auth placeholder. Actual auth implementation TBD.
5. **No Business Logic**: This is a blueprint only. Business logic will be implemented in services.

---

**Last Updated**: 2024-12-19  
**Status**: ✅ MVP Blueprint Complete
