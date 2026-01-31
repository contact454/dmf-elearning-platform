Status: FROZEN
Freeze Scope: STEP 7 — Read Model Projection + Query Endpoint Mapping
Freeze Date: 2026-01-18 (Asia/Ho_Chi_Minh)
Freeze Notes:
- STEP 5C IDs-only policy enforced: Projection reads userId from Attempt entity (via attemptId) for SubmissionDetailView on learning.submission.created.
- Audit verdict: PASS (STEP 7A fixed 1 CRITICAL; STEP 7B no issues).

---

# STEP 7B — Permission & Visibility Matrix (MVP)
## Ma trận Quyền truy cập & Hiển thị (Learner / Teacher / Mentor / Admin)

This document defines role-based visibility and access rules for all read endpoints in the MVP. It specifies which roles can access which endpoints, ownership constraints, and field-level visibility rules.

---

## 0. Roles (Vai trò)

- **learner**: User with role 'learner' (học viên)
- **teacher**: User with role 'teacher' (giáo viên)
- **mentor**: User with role 'mentor' (người hướng dẫn)
- **admin**: User with role 'admin' (quản trị viên)

**Note**: Use only these roles; align with shared `UserRole` enum. No custom roles or role combinations.

---

## 1. Global Rules (Quy tắc chung)

- **Default deny**: Endpoints require explicit allow; if role is not listed, access is denied
- **Learner: self-only access**: Learner can only access their own data (userId must match authenticated userId)
- **Teacher/Mentor: access only via linkage (FeedbackRequest/Feedback) in MVP**: Teacher/Mentor may access learner/submission data ONLY when there exists a FeedbackRequest or Feedback entity linking them to that submission. No assignment or course-role model exists in MVP; access is derived only from feedback request linkage.
- **Admin: read-all (still PII-limited where required)**: Admin can access all data but must still respect PII constraints (passwordHash, raw sensitive content)
- **Error categories: use STEP 4.4**: Forbidden, NotFound, ValidationError, TransientFailure
- **PII rules: never expose passwordHash; avoid raw sensitive content where not required**: Never expose passwordHash, auth tokens, raw quiz answers payloads, secrets. Allowed (under proper authorization): writing text content, audioUrl reference (not raw binary), feedback text.

---

## 2. Endpoint Access Matrix (Theo endpoint)

| Endpoint | Read Model(s) Used | Allowed Roles | Ownership/Linkage Rule | Forbidden Error (when violated) |
|----------|-------------------|---------------|------------------------|--------------------------------|
| `GET /api/learner/dashboard` | `LearnerDashboardView` | `learner` | Self-only (userId must match authenticated user) | `403 Forbidden` if not learner or userId mismatch |
| `GET /api/learner/courses/:courseId/progress` | `LearnerCourseProgressView` | `learner` | Self-only (userId must match authenticated user, user must be enrolled) | `403 Forbidden` if not learner or userId mismatch; `404 NotFound` if not enrolled |
| `GET /api/learner/lessons/:lessonId/attempts` | `LessonAttemptListView` | `learner` | Self-only (userId must match authenticated user) | `403 Forbidden` if not learner or userId mismatch or lesson not unlocked |
| `GET /api/learner/attempts/:attemptId` | `LessonAttemptDetailView` | `learner` | Self-only (userId must match authenticated user and attempt owner) | `403 Forbidden` if not learner or userId mismatch or attempt does not belong to user |
| `GET /api/learner/submissions` | `SubmissionListView` | `learner` | Self-only (userId must match authenticated user) | `403 Forbidden` if not learner or userId mismatch |
| `GET /api/learner/submissions/:submissionId` | `SubmissionDetailView` | `learner` | Self-only (userId must match authenticated user and submission owner) | `403 Forbidden` if not learner or userId mismatch or submission does not belong to user |
| `GET /api/learner/mastery` | `MasterySnapshotView` | `learner` | Self-only (userId must match authenticated user) | `403 Forbidden` if not learner or userId mismatch |
| `GET /api/learner/readiness` | `ReadinessSnapshotView` | `learner` | Self-only (userId must match authenticated user) | `403 Forbidden` if not learner or userId mismatch |
| `GET /api/teacher/feedback-queue` | `FeedbackQueueView` | `teacher`, `mentor` | Self-only (authorId must match authenticated user) | `403 Forbidden` if not teacher or mentor |
| `GET /api/teacher/feedback-requests/:feedbackRequestId` | `FeedbackRequestDetailView` | `teacher`, `mentor` | Via feedback request linkage (FeedbackRequest must link to authenticated teacher/mentor) | `403 Forbidden` if not teacher/mentor or no access to feedback request |
| `GET /api/teacher/submissions/:submissionId` | `SubmissionDetailView` | `teacher`, `mentor` | Via feedback request linkage (FeedbackRequest or Feedback must link submission to authenticated teacher/mentor) | `403 Forbidden` if not teacher/mentor or no feedback request linkage |
| `GET /api/teacher/learners/:userId/summary` | Composed (User, LearnerProfile, ProgressState, MasteryState) | `teacher`, `mentor` | Via feedback request linkage (FeedbackRequest or Feedback must link authenticated teacher/mentor to a submission from that learner) | `403 Forbidden` if not teacher/mentor or no feedback request linkage |

**Note**: Admin role is out of scope for MVP. All admin queries are explicitly excluded from MVP scope.

---

## 3. Field Visibility Rules (Theo read model)

--------------------------------------------------
### Read Model: LearnerDashboardView

**Visible to learner**:
- All fields: `userId`, `currentCourseId`, `currentUnitId`, `currentLessonId`, `progressSummary`, `masterySummary`, `readinessStatus`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner dashboard in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner dashboard in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `userId`, `currentCourseId`, `currentUnitId`, `currentLessonId`, `progressSummary`, `masterySummary`, `readinessStatus`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner dashboard is self-only; no teacher/mentor access in MVP
- All fields are aggregated summaries; no raw sensitive data

--------------------------------------------------
### Read Model: LearnerCourseProgressView

**Visible to learner**:
- All fields: `userId`, `courseId`, `enrollmentId`, `enrolledAt`, `units`, `progressPercentage`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner course progress in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner course progress in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `userId`, `courseId`, `enrollmentId`, `enrolledAt`, `units`, `progressPercentage`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner course progress is self-only; no teacher/mentor access in MVP
- All fields are progress metadata; no raw sensitive data

--------------------------------------------------
### Read Model: LessonAttemptListView

**Visible to learner**:
- All fields: `userId`, `lessonId`, `attempts[]` (including `attemptId`, `status`, `score`, `startedAt`, `completedAt`), `totalCount`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner attempt list in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner attempt list in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `userId`, `lessonId`, `attempts[]`, `totalCount`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner attempt list is self-only; no teacher/mentor access in MVP
- Score fields are computed from Attempt entity, not from event payloads

--------------------------------------------------
### Read Model: LessonAttemptDetailView

**Visible to learner**:
- All fields: `attemptId`, `userId`, `lessonId`, `lessonTitle`, `status`, `score`, `startedAt`, `completedAt`, `submissions[]` (including `submissionId`, `activityId`, `activityTitle`, `type`, `score`, `createdAt`), `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner attempt detail in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner attempt detail in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `attemptId`, `userId`, `lessonId`, `lessonTitle`, `status`, `score`, `startedAt`, `completedAt`, `submissions[]`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner attempt detail is self-only; no teacher/mentor access in MVP
- Score fields are computed from Attempt and Submission entities, not from event payloads
- No raw submission content (audioUrl, text, answer) in this view

--------------------------------------------------
### Read Model: SubmissionListView

**Visible to learner**:
- All fields: `userId`, `submissions[]` (including `submissionId`, `attemptId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `hasFeedback`, `feedbackId`, `createdAt`), `totalCount`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- All fields: `authorId`, `submissions[]` (including `submissionId`, `attemptId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `hasFeedback`, `feedbackId`, `createdAt`), `totalCount`, `lastUpdatedAt`
- **Access constraint**: Only submissions linked to FeedbackRequests where teacher is the authorId

**Redacted for teacher**:
- `userId` (not applicable for teacher view)
- Raw submission content (audioUrl, text, answer) - not in this list view

**Visible to mentor**:
- All fields: `authorId`, `submissions[]` (including `submissionId`, `attemptId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `hasFeedback`, `feedbackId`, `createdAt`), `totalCount`, `lastUpdatedAt`
- **Access constraint**: Only submissions linked to FeedbackRequests where mentor is the authorId

**Redacted for mentor**:
- `userId` (not applicable for mentor view)
- Raw submission content (audioUrl, text, answer) - not in this list view

**Visible to admin**:
- All fields: `userId`, `authorId`, `submissions[]`, `totalCount`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner sees own submissions only
- Teacher/Mentor sees only submissions linked to their FeedbackRequests
- This is a list view; no raw content included

--------------------------------------------------
### Read Model: SubmissionDetailView

**Visible to learner**:
- All fields: `submissionId`, `attemptId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `content` (audioUrl, text, answer), `score`, `createdAt`, `feedback`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner, including own submission content)

**Visible to teacher**:
- All fields: `submissionId`, `attemptId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `content` (audioUrl, text, answer), `score`, `createdAt`, `feedback`, `lastUpdatedAt`
- **Access constraint**: Only if FeedbackRequest or Feedback links submission to authenticated teacher

**Redacted for teacher**:
- None (teacher can see full submission content when linked via feedback request)

**Visible to mentor**:
- All fields: `submissionId`, `attemptId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `content` (audioUrl, text, answer), `score`, `createdAt`, `feedback`, `lastUpdatedAt`
- **Access constraint**: Only if FeedbackRequest or Feedback links submission to authenticated mentor

**Redacted for mentor**:
- None (mentor can see full submission content when linked via feedback request)

**Visible to admin**:
- All fields: `submissionId`, `attemptId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `content`, `score`, `createdAt`, `feedback`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner sees own submission content
- Teacher/Mentor sees submission content only when linked via FeedbackRequest/Feedback
- Content includes audioUrl reference (not raw binary), text, answer
- Score field is computed from Submission entity, not from event payloads

--------------------------------------------------
### Read Model: MasterySnapshotView

**Visible to learner**:
- All fields: `userId`, `skillScores`, `lessonMastery`, `lastCalculatedAt`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner mastery snapshot in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner mastery snapshot in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `userId`, `skillScores`, `lessonMastery`, `lastCalculatedAt`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner mastery snapshot is self-only; no teacher/mentor access in MVP
- All score fields are aggregated; no raw submission data

--------------------------------------------------
### Read Model: ReadinessSnapshotView

**Visible to learner**:
- All fields: `userId`, `computedAt`, `readiness` (overall, perSkill, blockers), `sourceRefs`, `lastUpdatedAt`

**Redacted for learner**:
- None (all fields visible to owner)

**Visible to teacher**:
- None (teacher cannot access learner readiness snapshot in MVP)

**Redacted for teacher**:
- All fields (no access)

**Visible to mentor**:
- None (mentor cannot access learner readiness snapshot in MVP)

**Redacted for mentor**:
- All fields (no access)

**Visible to admin**:
- All fields: `userId`, `computedAt`, `readiness`, `sourceRefs`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Learner readiness snapshot is self-only; no teacher/mentor access in MVP
- Readiness fields are computed by education/readiness-model, not from event payloads

--------------------------------------------------
### Read Model: FeedbackQueueView

**Visible to learner**:
- None (learner cannot access feedback queue in MVP)

**Redacted for learner**:
- All fields (no access)

**Visible to teacher**:
- All fields: `authorId`, `requests[]` (including `feedbackRequestId`, `submissionId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `priority`, `requestedAt`), `totalCount`, `lastUpdatedAt`
- **Access constraint**: Only if authorId matches authenticated teacher

**Redacted for teacher**:
- Raw submission content (audioUrl, text, answer) - not in this queue view
- Learner email (only userId shown)

**Visible to mentor**:
- All fields: `authorId`, `requests[]` (including `feedbackRequestId`, `submissionId`, `userId`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `priority`, `requestedAt`), `totalCount`, `lastUpdatedAt`
- **Access constraint**: Only if authorId matches authenticated mentor

**Redacted for mentor**:
- Raw submission content (audioUrl, text, answer) - not in this queue view
- Learner email (only userId shown)

**Visible to admin**:
- All fields: `authorId`, `requests[]`, `totalCount`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Feedback queue is teacher/mentor-only; no learner access
- Teacher/Mentor sees only their own queue (authorId must match)
- This is a list view; no raw content included

--------------------------------------------------
### Read Model: FeedbackRequestDetailView

**Visible to learner**:
- None (learner cannot access feedback request detail in MVP)

**Redacted for learner**:
- All fields (no access)

**Visible to teacher**:
- All fields: `feedbackRequestId`, `submissionId`, `userId`, `learnerSummary` (firstName, lastName, targetLanguage), `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `priority`, `requestedAt`, `status`, `feedbackId`, `lastUpdatedAt`
- **Access constraint**: Only if FeedbackRequest links to authenticated teacher

**Redacted for teacher**:
- Raw submission content (audioUrl, text, answer) - not in this view (fetched separately via SubmissionDetailView)
- Learner email (only userId and name shown)

**Visible to mentor**:
- All fields: `feedbackRequestId`, `submissionId`, `userId`, `learnerSummary` (firstName, lastName, targetLanguage), `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `priority`, `requestedAt`, `status`, `feedbackId`, `lastUpdatedAt`
- **Access constraint**: Only if FeedbackRequest links to authenticated mentor

**Redacted for mentor**:
- Raw submission content (audioUrl, text, answer) - not in this view (fetched separately via SubmissionDetailView)
- Learner email (only userId and name shown)

**Visible to admin**:
- All fields: `feedbackRequestId`, `submissionId`, `userId`, `learnerSummary`, `lessonId`, `lessonTitle`, `activityId`, `activityTitle`, `type`, `priority`, `requestedAt`, `status`, `feedbackId`, `lastUpdatedAt`

**Redacted for admin**:
- None (admin can read all, but admin queries are out of scope for MVP)

**Notes**:
- Feedback request detail is teacher/mentor-only; no learner access
- Teacher/Mentor sees only feedback requests linked to them
- Raw submission content is not in this view; fetched separately via SubmissionDetailView if authorized

---

## 4. Teacher/Mentor Dashboard Rules (MVP constraints)

### Feedback Queue Visibility

- **Rule**: Teacher/Mentor can only see their own feedback queue
- **Implementation**: Filter `FeedbackQueueView` by `authorId` matching authenticated user
- **Error**: `403 Forbidden` if user is not teacher/mentor or attempts to access another teacher/mentor's queue

### Submission Detail Access Rule

- **Rule**: Teacher/Mentor may access submission detail ONLY when there exists a FeedbackRequest or Feedback entity linking them to that submission
- **Implementation**: 
  - Check if FeedbackRequest exists with `submissionId` and `authorId` matching authenticated teacher/mentor
  - OR check if Feedback exists with `submissionId` and `authorId` matching authenticated teacher/mentor
- **Error**: `403 Forbidden` if no feedback request linkage exists
- **Note**: No assignment state; linkage only

### Learner Summary Access Rule

- **Rule**: Teacher/Mentor may access learner summary ONLY when there exists a FeedbackRequest or Feedback entity linking them to a submission from that learner
- **Implementation**:
  - Check if any FeedbackRequest or Feedback exists with `userId` matching requested learner AND `authorId` matching authenticated teacher/mentor
- **Error**: `403 Forbidden` if no feedback request linkage exists
- **Note**: No assignment state; linkage only

### No Assignment State; Linkage Only

- **MVP Constraint**: No assignment or course-role model exists in MVP
- **Access Derivation**: All teacher/mentor access is derived only from feedback request linkage
- **Forbidden Patterns**:
  - ❌ "Same course" access assumption
  - ❌ "Global teacher access" assumption
  - ❌ Assignment-based access (no AssignmentState in MVP)
  - ❌ Course-role-based access (no CourseRoleState in MVP)
- **Allowed Pattern**:
  - ✅ FeedbackRequest/Feedback entity linkage only

---

## 5. Audit Checklist

- [x] Every STEP 6 endpoint appears in Section 2 (12 endpoints: 8 learner + 4 teacher/mentor)
- [x] Every STEP 6 read model appears in Section 3 (10 read models)
- [x] No new roles/endpoints/models introduced
- [x] Linkage constraints do not require new state (FeedbackRequest/Feedback linkage only, no AssignmentState)
- [x] Uses STEP 4.4 failure categories only (Forbidden, NotFound, ValidationError, TransientFailure)
- [x] Teacher/Mentor access rules explicitly state feedback request linkage requirement
- [x] PII constraints align with STEP 6 read model inventory
- [x] Field visibility rules specify what each role can see per read model

---

**Last Updated**: 2026-01-17  
**Status**: ✅ Complete - Permission & visibility matrix defined for MVP  
**Related Documents**: 
- `docs/architecture/query-api-contracts.md` (STEP 6B - Query API contracts)
- `docs/architecture/read-model-inventory.md` (STEP 6A - Read model inventory)
- `docs/architecture/command-failure-semantics.md` (STEP 4.4 - Failure categories)
