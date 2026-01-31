# STEP 8B — Authorization Matrix (RBAC + Ownership)
## Ma trận Phân quyền (Vai trò + Sở hữu dữ liệu)

**Status**: FROZEN  
**Freeze Scope**: STEP 8B — Authorization Matrix  
**Freeze Date**: 2026-01-18 (Asia/Ho_Chi_Minh)  
**Freeze Notes**:
- Ownership checks are deterministic (Submission -> Attempt -> userId; Feedback/FeedbackRequest follow the same chain).
- Teacher/Mentor visibility is restricted to queue/request boundary (no assignment state in MVP).
- Error semantics standardized: 403 only for role violations; 404 for ownership failures to hide existence.

---

This document defines role-based access control (RBAC) and ownership rules for all command and query endpoints in the MVP. It specifies who can perform which actions and access which data.

---

## 0. Roles (Vai trò)

### learner
- **Allowed apps**: `web-learner`, `mobile` (learner app)
- **Default capabilities**: 
  - Can perform learning actions on own entities only
  - Can view own dashboard, progress, attempts, submissions, mastery, readiness
  - Can request feedback on own submissions
  - Cannot access teacher/mentor features

### teacher
- **Allowed apps**: `web-teacher`
- **Default capabilities**:
  - Can publish feedback on submissions linked via FeedbackRequest
  - Can view feedback queue (own queue only)
  - Can view submission detail and learner summary (via FeedbackRequest linkage only)
  - Cannot browse arbitrary learners or submissions
  - Cannot access learner dashboard features

### mentor
- **Allowed apps**: `web-teacher` (shared with teacher)
- **Default capabilities**:
  - Same as teacher (feedback publishing, queue access, submission/learner access via linkage)
  - No distinction from teacher in MVP (both use same dashboard)

### admin
- **Allowed apps**: `web-admin` (out of scope for MVP)
- **Default capabilities**:
  - Read-only oversight (if implemented)
  - All admin queries are explicitly out of scope for MVP

### system
- **Type**: Internal actor (not a human role)
- **Default capabilities**:
  - Can call automated commands (`system.srs.schedule`, `curriculum.unit.access`)
  - Cannot be authenticated via user session
  - Commands triggered by system logic or scheduled jobs

---

## 1. Identity & Claims (Danh tính & Claims)

### Required Claims in Requests

All authenticated requests must include:

- **userId**: `UserId` - Unique identifier for the authenticated user
- **role**: `UserRole` - One of: `learner`, `teacher`, `mentor`, `admin`
- **sessionId**: `string` (optional) - Session identifier for audit/logging
- **correlationId**: `string` (optional) - Client-provided correlation ID for idempotency

### Optional Claims

- **locale**: `string` (optional) - User's preferred locale for responses

### Token/Session Source

- Tokens issued by `onboarding-service` after successful `system.user.login`
- Session entity (ephemeral) created by `onboarding-service`
- Token validation: `onboarding-service` validates token and returns claims
- No implementation detail required here (conceptual only)

---

## 2. Ownership Rules (Quy tắc Sở hữu dữ liệu)

### Attempt
- **Owned by**: `Attempt.userId`
- **Check**: `Attempt.userId === authenticated.userId`
- **Note**: Learner can only access/modify own attempts

### Submission
- **Owned by**: `Submission.userId` (derived via `Attempt.userId` from `Submission.attemptId`)
- **Check**: 
  1. Load Attempt via `Submission.attemptId`
  2. Verify `Attempt.userId === authenticated.userId`
- **Note**: Submission ownership determined via parent Attempt

### Assessment
- **Owned by**: `Assessment.userId`
- **Check**: `Assessment.userId === authenticated.userId`
- **Note**: Learner can only access own assessments

### Enrollment
- **Owned by**: `Enrollment.userId`
- **Check**: `Enrollment.userId === authenticated.userId`
- **Note**: Learner can only enroll for self

### ProgressState
- **Owned by**: `ProgressState.userId`
- **Check**: `ProgressState.userId === authenticated.userId`
- **Note**: Progress is per-user, self-only

### MasteryState
- **Owned by**: `MasteryState.userId`
- **Check**: `MasteryState.userId === authenticated.userId`
- **Note**: Mastery is per-user, self-only

### FeedbackRequest
- **Owned by**: `FeedbackRequest.userId` (requester)
- **Check**: `FeedbackRequest.userId === authenticated.userId` (for requester)
- **Note**: 
  - Requester (learner) can view own requests
  - Teacher/Mentor can view if request is in their queue (see visibility rule below)

### Feedback
- **Tied to**: `Feedback.submissionId` and `Feedback.feedbackRequestId`
- **Ownership checks (deterministic)**:
  - **Learner (submission owner)**: 
    1. Load Submission via `Feedback.submissionId`
    2. Load Attempt via `Submission.attemptId`
    3. Verify `Attempt.userId === authenticated.userId`
  - **Teacher/Mentor (author)**: 
    1. Verify `Feedback.authorId === authenticated.userId` AND `Feedback.authorRole === authenticated.role`
  - **Teacher/Mentor (queue access)**: 
    1. Load FeedbackRequest via `Feedback.feedbackRequestId`
    2. Verify `FeedbackRequest.authorId === authenticated.userId` AND `FeedbackRequest.status IN ('pending', 'completed')`

### ReadinessState
- **Computed for**: `userId` (computed by education/readiness-model)
- **View access**: 
  - Learner: Can view own readiness
  - Teacher/Mentor: Cannot view (out of scope for MVP)
  - Admin: Out of scope for MVP

### Teacher/Mentor Visibility (MVP) — No Assignment State

**Rule**: Teacher/Mentor can only access items that are visible in their feedback queue.

**Queue Visibility**:
- Teacher/Mentor can see FeedbackRequest if:
  - `FeedbackRequest.authorId === authenticated.userId` (assigned to them)
  - OR `FeedbackRequest.status === 'pending'` AND no explicit assignment (if queue is open)
- **MVP Constraint**: Queue is the authorization boundary. No assignment state exists.

**RequestId-Based Access**:
- Teacher/Mentor can access submission detail if:
  - `FeedbackRequest.submissionId === requestedSubmissionId` AND
  - `FeedbackRequest.authorId === authenticated.userId` AND
  - `FeedbackRequest.status IN ('pending', 'completed')`
- Teacher/Mentor can access learner summary if:
  - EXISTS FeedbackRequest WHERE `FeedbackRequest.userId === requestedUserId` AND
  - `FeedbackRequest.authorId === authenticated.userId`
- **Explicit check required**: Must verify requestId exists and is in permitted queue before allowing access.

**Forbidden Patterns**:
- ❌ Cannot browse learners by courseId or arbitrary filters
- ❌ Cannot access submissions without FeedbackRequest linkage
- ❌ Cannot assume "same course" or "global teacher access"
- ❌ No assignment-based access (no AssignmentState in MVP)

---

## 3. Command Endpoint Authorization (Write-side)

| Command | Handler Service | Allowed Roles | Ownership Check | Forbidden Reasons |
|---------|----------------|---------------|-----------------|-------------------|
| `learning.lesson.start` | `practice-service` | `learner` | None (creates new Attempt) | If role is not `learner` |
| `learning.lesson.complete` | `practice-service` | `learner` | `Attempt.userId === authenticated.userId` | If role is not `learner` OR attempt does not belong to user |
| `learning.lesson.abandon` | `practice-service` | `learner` | `Attempt.userId === authenticated.userId` | If role is not `learner` OR attempt does not belong to user |
| `learning.activity.submit` | `practice-service` | `learner` | `Attempt.userId === authenticated.userId` (via attemptId in command) | If role is not `learner` OR attempt does not belong to user |
| `assessment.quiz.start` | `assessment-service` | `learner` | None (creates new Assessment) | If role is not `learner` |
| `assessment.quiz.submit` | `assessment-service` | `learner` | `Assessment.userId === authenticated.userId` | If role is not `learner` OR assessment does not belong to user |
| `assessment.placement.take` | `assessment-service` | `learner` | None (creates new Assessment) | If role is not `learner` |
| `mentoring.feedback.request` | `mentoring-service` | `learner` | Load Submission via `submissionId`, then load Attempt via `Submission.attemptId`, then verify `Attempt.userId === authenticated.userId` | If role is not `learner` OR submission does not belong to user |
| `mentoring.feedback.publish` | `mentoring-service` | `teacher`, `mentor` | `FeedbackRequest.authorId === authenticated.userId` AND `FeedbackRequest.status === 'pending'` AND `command.authorRole === authenticated.role` | If role is not `teacher`/`mentor` OR request not assigned OR `authorRole` mismatch |
| `curriculum.course.enroll` | `curriculum-service` | `learner` | `command.userId === authenticated.userId` | If role is not `learner` OR userId mismatch |
| `curriculum.unit.access` | `progress-service` | `system` | None (internal command) | If caller is not system actor |
| `system.user.register` | `onboarding-service` | Unauthenticated (public) | None (creates new User) | None (public endpoint) |
| `system.user.login` | `onboarding-service` | Unauthenticated (public) | None (authentication action) | None (public endpoint) |
| `system.profile.modify` | `onboarding-service` | `learner`, `teacher`, `mentor` | `command.userId === authenticated.userId` | If userId mismatch OR role not allowed |
| `system.srs.schedule` | `curriculum-service` | `system` | None (internal command) | If caller is not system actor |

### Special Authorization Rules

**mentoring.feedback.publish**:
- Must enforce `authorRole` consistency:
  - If `authenticated.role === 'teacher'` then `command.authorRole` MUST be `'teacher'`
  - If `authenticated.role === 'mentor'` then `command.authorRole` MUST be `'mentor'`
  - `authorRole === 'ai'` is only allowed for internal/system-triggered feedback (not user-triggered in MVP)

**system.user.login**:
- Public endpoint (no authentication required)
- Creates Session entity (ephemeral)
- Emits `system.user.login` event (not a command outcome, but an auth action)

**Error Response (Forbidden)**:
- Return `403 Forbidden` with STEP 4.4 error category
- Do not leak existence of entities (see Error Semantics section)

---

## 4. Query Endpoint Authorization (Read-side)

| Query Endpoint | Read Model | Allowed Roles | Ownership/Visibility Rule | PII Redactions |
|----------------|------------|---------------|--------------------------|----------------|
| `GET /api/learner/dashboard` | `LearnerDashboardView` | `learner` | `userId === authenticated.userId` | Never return `passwordHash`, `auth tokens` |
| `GET /api/learner/courses/:courseId/progress` | `LearnerCourseProgressView` | `learner` | `userId === authenticated.userId` AND user enrolled in course | Never return `passwordHash` |
| `GET /api/learner/lessons/:lessonId/attempts` | `LessonAttemptListView` | `learner` | `userId === authenticated.userId` | Never return `raw quiz answers payloads` |
| `GET /api/learner/attempts/:attemptId` | `LessonAttemptDetailView` | `learner` | `Attempt.userId === authenticated.userId` | Never return `raw quiz answers payloads`, `secrets` |
| `GET /api/learner/submissions` | `SubmissionListView` | `learner` | `userId === authenticated.userId` | Never return `raw quiz answers payloads` |
| `GET /api/learner/submissions/:submissionId` | `SubmissionDetailView` | `learner` | `Submission.userId === authenticated.userId` (via Attempt) | Never return `raw quiz answers payloads`, `secrets`. Allowed: own `audioUrl`, `text`, `answer` content |
| `GET /api/learner/mastery` | `MasterySnapshotView` | `learner` | `userId === authenticated.userId` | Never return `raw submission data`, only aggregated scores |
| `GET /api/learner/readiness` | `ReadinessSnapshotView` | `learner` | `userId === authenticated.userId` | Never return `raw assessment answers` |
| `GET /api/teacher/feedback-queue` | `FeedbackQueueView` | `teacher`, `mentor` | `authorId === authenticated.userId` (filter queue by authenticated user) | Never return `learner email`, `passwordHash`. Only `userId` shown |
| `GET /api/teacher/feedback-requests/:feedbackRequestId` | `FeedbackRequestDetailView` | `teacher`, `mentor` | `FeedbackRequest.authorId === authenticated.userId` | Never return `learner email`, `passwordHash`, `raw quiz answers`. Allowed: `firstName`, `lastName`, `targetLanguage` |
| `GET /api/teacher/submissions/:submissionId` | `SubmissionDetailView` | `teacher`, `mentor` | EXISTS `FeedbackRequest` WHERE `FeedbackRequest.submissionId === submissionId` AND `FeedbackRequest.authorId === authenticated.userId` | Never return `passwordHash`, `secrets`. Allowed: `audioUrl`, `text`, `answer` content (for grading) |
| `GET /api/teacher/learners/:userId/summary` | Composed (User, LearnerProfile, ProgressState, MasteryState) | `teacher`, `mentor` | EXISTS `FeedbackRequest` WHERE `FeedbackRequest.userId === requestedUserId` AND `FeedbackRequest.authorId === authenticated.userId` | Never return `email`, `passwordHash`, `auth tokens`. Allowed: `firstName`, `lastName`, `targetLanguage`, aggregated progress/mastery |

### Teacher/Mentor Access Rules (Detailed)

**Feedback Queue**:
- Teacher/Mentor can only see requests where `FeedbackRequest.authorId === authenticated.userId`
- No global queue browsing
- Queue is the authorization boundary

**Submission Detail**:
- Access allowed ONLY if:
  1. `FeedbackRequest.submissionId === requestedSubmissionId`
  2. `FeedbackRequest.authorId === authenticated.userId`
  3. `FeedbackRequest.status IN ('pending', 'completed')`
- Must verify requestId exists before allowing access

**Learner Summary**:
- Access allowed ONLY if:
  1. EXISTS `FeedbackRequest` WHERE `FeedbackRequest.userId === requestedUserId`
  2. `FeedbackRequest.authorId === authenticated.userId`
- Prevents arbitrary learner browsing

**Admin Endpoints**:
- All admin queries are explicitly out of scope for MVP
- If admin role is requested, return `404 NotFound` or `403 Forbidden` with "Out of scope for MVP" message

---

## 5. Error Semantics (STEP 4.4 mapping)

### Policy Choice: Security-by-Default (Option A)

**Default Policy**: Return `404 NotFound` to avoid leaking entity existence for unauthorized requests.

### Forbidden (403)

Return `403 Forbidden` when:
- Role is not allowed for the endpoint (e.g., learner tries to call teacher endpoint)
- User is authenticated but role does not match endpoint requirements

**Example**: Learner tries to call `/api/teacher/feedback-queue` → `403 Forbidden` (role violation)

### NotFound (404)

Return `404 NotFound` when:
- Entity does not exist
- Entity exists but user is not authorized (ownership check fails) — **security-by-default: hide existence**
- User not enrolled in course (for course-specific endpoints)
- FeedbackRequest does not exist OR not in teacher/mentor queue
- Submission does not belong to user (for learner endpoints)
- Attempt does not belong to user (for learner endpoints)

**Examples**: 
- Teacher tries to access submission without FeedbackRequest linkage → `404 NotFound` (hides existence)
- User tries to complete another user's attempt → `404 NotFound` (hides existence, ownership failure)

### ValidationError (400)

Return `400 ValidationError` when:
- Request parameters are invalid (missing required fields, invalid format)
- Command payload violates schema (STEP 4.2)
- `authorRole` mismatch in `mentoring.feedback.publish` (role vs command.authorRole)

### Conflict (409)

Return `409 Conflict` when:
- Idempotency violation (correlationId already processed)
- Attempt already completed (cannot complete twice)
- Enrollment already exists

### TransientFailure (500/503)

Return `500 TransientFailure` when:
- Service unavailable (retryable)
- Database connection failure
- Event bus unavailable

### IdempotentReplay (200/201)

Return success with existing entity when:
- Command already processed (correlationId dedupe)
- Event already consumed (eventId dedupe)

---

## 6. Teacher/Mentor Dashboard — Security Notes (Quan trọng)

### No Assignment State in MVP

- **Constraint**: No `AssignmentState` or `CourseRoleState` exists in MVP
- **Implication**: All teacher/mentor access is derived from `FeedbackRequest` linkage only
- **Enforcement**: Every teacher/mentor endpoint must verify `FeedbackRequest` exists and links to authenticated user

### Queue is Authorization Boundary

- **Rule**: `FeedbackQueueView` is the source of truth for what teacher/mentor can access
- **Implementation**: 
  - Queue query filters by `authorId === authenticated.userId`
  - All detail endpoints must verify requestId is in queue result set
  - No bypassing queue for direct entity access

### RequestId-Based Access

- **Pattern**: All teacher/mentor detail access requires explicit `feedbackRequestId` or `submissionId` that links to a request in queue
- **Prevents**: Enumeration attacks (cannot guess submissionIds or userIds)
- **Enforcement**: 
  - Submission detail: Must verify `FeedbackRequest.submissionId === submissionId` AND `FeedbackRequest.authorId === authenticated.userId`
  - Learner summary: Must verify EXISTS `FeedbackRequest` linking learner to teacher/mentor

### Prevent Enumeration

- **IDs are opaque**: Do not expose sequential IDs or predictable patterns
- **Rate limiting**: Implement rate limiting on teacher/mentor endpoints (suggested: 100 requests/minute per user)
- **Audit logging**: Log all teacher/mentor access attempts (requestId, submissionId, userId accessed, timestamp)
- **Error consistency**: Return `404 NotFound` for unauthorized access (hides existence)

### Rate Limiting & Audit Logging (High Level)

- **Rate limiting**: 
  - Per-user limits on query endpoints (prevent enumeration)
  - Per-role limits (teacher/mentor may have different limits than learner)
- **Audit logging**:
  - Log all command executions (userId, command, entityId, timestamp)
  - Log all query access (userId, endpoint, entityId accessed, timestamp)
  - Log authorization failures (403/404 with reason)
  - Retention: 90 days minimum (compliance)

---

## 7. Audit Checklist (Checklist tự kiểm)

### Command Authorization

- [ ] Every command has explicit allowed roles listed
- [ ] Every command has ownership check specified (or "None" if creates new entity)
- [ ] `mentoring.feedback.publish` enforces `authorRole` consistency
- [ ] System commands (`system.srs.schedule`, `curriculum.unit.access`) restricted to `system` role
- [ ] Public commands (`system.user.register`, `system.user.login`) marked as unauthenticated
- [ ] No command allows cross-user access (learner cannot act on other users' entities)

### Query Authorization

- [ ] Every query endpoint has allowed roles listed
- [ ] Every query endpoint has ownership/visibility rule specified
- [ ] Learner endpoints enforce self-only access (`userId === authenticated.userId`)
- [ ] Teacher/Mentor endpoints enforce FeedbackRequest linkage
- [ ] Teacher/Mentor cannot access arbitrary learners/submissions
- [ ] Admin endpoints marked as "Out of scope for MVP" if not implemented

### PII Redactions

- [ ] `passwordHash` never returned in any response
- [ ] `auth tokens` never returned in any response
- [ ] `raw quiz answers payloads` never returned
- [ ] `learner email` not returned in teacher/mentor views (only `userId` shown)
- [ ] Submission content (`audioUrl`, `text`, `answer`) only returned when authorized (learner own content OR teacher/mentor via FeedbackRequest)

### Error Handling

- [ ] Error responses use STEP 4.4 categories (Forbidden, NotFound, ValidationError, Conflict, TransientFailure, IdempotentReplay)
- [ ] Security-by-default policy applied (404 for unauthorized to hide existence)
- [ ] No information leakage in error messages

### Architecture Compliance

- [ ] No new commands/events/endpoints introduced
- [ ] No cross-service mutation implied (read-only service APIs only)
- [ ] IDs-only event payload policy unaffected (authorization does not change event contracts)
- [ ] Teacher/Mentor access does not require new assignment state
- [ ] All access rules use existing linkages (FeedbackRequest, submissionId, userId)

### Security

- [ ] Teacher/Mentor queue is authorization boundary
- [ ] RequestId-based access enforced (no direct entity access)
- [ ] Enumeration prevention (opaque IDs, rate limiting, 404 for unauthorized)
- [ ] Audit logging implemented (high level, not implementation detail)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Authorization matrix defined for MVP  
**Related Documents**: 
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Commands)
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query endpoints)
- `docs/architecture/permission-visibility-matrix.md` (STEP 7B - Permission rules)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Error categories)
