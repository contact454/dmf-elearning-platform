# Contract Inventory
## Liệt kê Hợp đồng Dịch vụ - Step 4

**Objective**: Define command and query contracts for all service domains, prioritizing write operations (commands) that emit domain events, aligned with existing event catalog and shared types.

---

## Plan

1. **Scan existing structure**: contracts/, services/, packages/shared
2. **Identify service domains**: onboarding, curriculum, practice, assessment, mentoring, motivation-progress
3. **Prioritize commands**: Write operations that mutate state and emit events
4. **Define command contracts**: Input DTO, Output DTO, Domain Events emitted
5. **Define query contracts**: Read operations (minimal, for MVP)
6. **Align with existing**: Use @dmf/shared types, existing events from catalog
7. **Document DTOs needed**: List new DTOs to create in packages/shared/src/contracts
8. **Map to OpenAPI**: Reference existing api-gateway.openapi.yaml endpoints

---

## Service Domains

Based on existing services/ structure:
- **onboarding**: User registration, placement testing, profile management
- **curriculum**: Course enrollment, progress tracking, unit/lesson unlocks
- **practice**: Lesson attempts, activity submissions
- **assessment**: Quizzes, formal assessments, level tests
- **mentoring**: Feedback requests and publishing
- **motivation-progress**: Mastery tracking, skill scores, progress aggregation

---

## Command Contracts (Write Operations)

### Onboarding Service

#### Command: RegisterUser
- **VN**: Đăng ký người dùng mới
- **Input DTO**: 
  - `email: string` (required)
  - `role: UserRole` (required)
  - `firstName?: string`
  - `lastName?: string`
  - `targetLanguage?: LanguageCode`
- **Output DTO**: 
  - `userId: UserId`
  - `email: string`
  - `role: UserRole`
  - `createdAt: string` (ISO 8601)
- **Domain Events**: `system.user.registered`
- **Notes**: Creates User entity, initializes empty progress

#### Command: SubmitPlacementTest
- **VN**: Nộp kết quả bài kiểm tra định vị
- **Input DTO**:
  - `userId: UserId` (required)
  - `answers: object[]` (placement test answers)
- **Output DTO**:
  - `assessmentId: AssessmentId`
  - `level: CEFRLevel` (recommended level)
  - `nextAction: 'enroll' | 'retake'`
- **Domain Events**: `assessment.level_test.completed`
- **Notes**: Delegates to assessment-service, emits event

#### Command: UpdateUserProfile
- **VN**: Cập nhật thông tin hồ sơ người dùng
- **Input DTO**:
  - `userId: UserId` (from context)
  - `firstName?: string`
  - `lastName?: string`
  - `targetLanguage?: LanguageCode`
- **Output DTO**:
  - `userId: UserId`
  - `updatedFields: string[]` (list of updated fields)
- **Domain Events**: `system.profile.updated`
- **Notes**: Updates User entity, may trigger curriculum recalculation

---

### Curriculum Service

#### Command: EnrollInCourse
- **VN**: Ghi danh vào khóa học
- **Input DTO**:
  - `userId: UserId` (required)
  - `courseId: CourseId` (required)
- **Output DTO**:
  - `enrollmentId: EnrollmentId`
  - `courseId: CourseId`
  - `status: EnrollmentStatus`
  - `nextAction?: 'start_lesson' | 'take_placement'`
- **Domain Events**: `curriculum.course.enrolled`
- **Notes**: Creates Enrollment entity, links to User

#### Command: UnlockUnit
- **VN**: Mở khóa đơn vị học (internal command, may be triggered by events)
- **Input DTO**:
  - `userId: UserId` (required)
  - `unitId: UnitId` (required)
  - `courseId: CourseId` (required)
  - `reason: 'mastery' | 'assessment' | 'manual' | 'srs'` (required)
- **Output DTO**:
  - `unitId: UnitId`
  - `unlockedAt: string` (ISO 8601)
- **Domain Events**: `curriculum.unit.unlocked`
- **Notes**: Internal command, typically triggered by lesson.completed or assessment events

---

### Practice Service

#### Command: StartLessonAttempt
- **VN**: Bắt đầu phiên học bài
- **Input DTO**:
  - `userId: UserId` (required)
  - `lessonId: LessonId` (required)
- **Output DTO**:
  - `attemptId: AttemptId`
  - `lessonId: LessonId`
  - `status: AttemptStatus` (in-progress)
  - `startedAt: string` (ISO 8601)
- **Domain Events**: `learning.lesson.started`
- **Notes**: Creates Attempt entity, used as session_id in events

#### Command: CompleteLessonAttempt
- **VN**: Hoàn thành hoặc bỏ dở phiên học
- **Input DTO**:
  - `attemptId: AttemptId` (required)
  - `status: 'completed' | 'abandoned'` (required)
  - `score?: number` (0-100, if completed)
- **Output DTO**:
  - `attemptId: AttemptId`
  - `status: AttemptStatus`
  - `score?: number`
  - `completedAt: string` (ISO 8601)
- **Domain Events**: `learning.lesson.completed` OR `learning.lesson.abandoned`
- **Notes**: Updates Attempt entity, status determines which event is emitted

#### Command: SubmitActivity
- **VN**: Nộp câu trả lời cho hoạt động
- **Input DTO**:
  - `attemptId: AttemptId` (required)
  - `activityId: ActivityId` (required)
  - `type: SubmissionType` (required: 'speaking' | 'writing')
  - `audioUrl?: string` (if speaking)
  - `durationMs?: number` (if speaking)
  - `text?: string` (if writing)
- **Output DTO**:
  - `submissionId: SubmissionId`
  - `attemptId: AttemptId`
  - `activityId: ActivityId`
  - `isCorrect?: boolean`
- **Domain Events**: `learning.submission.created`
- **Notes**: Creates Submission entity, type determines payload structure

---

### Assessment Service

#### Command: StartQuiz
- **VN**: Bắt đầu bài kiểm tra
- **Input DTO**:
  - `userId: UserId` (required)
  - `assessmentId: AssessmentId` (required)
- **Output DTO**:
  - `attemptId?: AttemptId` (if applicable)
  - `assessmentId: AssessmentId`
  - `status: AssessmentStatus` (in-progress)
- **Domain Events**: `assessment.quiz.started`
- **Notes**: Creates Assessment attempt, may create Attempt entity

#### Command: SubmitQuiz
- **VN**: Nộp đáp án bài kiểm tra
- **Input DTO**:
  - `assessmentId: AssessmentId` (required)
  - `attemptId?: AttemptId` (if started via /start)
  - `answers: object[]` (quiz answers)
- **Output DTO**:
  - `assessmentId: AssessmentId`
  - `score: number` (0-100, required)
  - `levelHint?: CEFRLevel` (inferred level)
- **Domain Events**: `assessment.quiz.submitted`
- **Notes**: Grades quiz, calculates score, may infer CEFR level

---

### Mentoring Service

#### Command: RequestFeedback
- **VN**: Yêu cầu phản hồi cho bài nộp
- **Input DTO**:
  - `submissionId: SubmissionId` (required)
- **Output DTO**:
  - `requestId: string` (feedback request ID)
  - `submissionId: SubmissionId`
  - `status: 'queued' | 'processing'`
- **Domain Events**: `mentoring.feedback.requested`
- **Notes**: Creates Feedback request, may trigger AI analysis

#### Command: PublishFeedback
- **VN**: Xuất bản phản hồi (AI/giáo viên/mentor)
- **Input DTO**:
  - `submissionId: SubmissionId` (required)
  - `authorId: UserId` (required, teacher/mentor ID)
  - `author: FeedbackAuthor` (required: 'ai' | 'teacher' | 'mentor')
  - `text: string` (required, Markdown)
  - `corrections?: string[]`
  - `targetAttemptId?: AttemptId` (if feedback targets attempt-level)
- **Output DTO**:
  - `feedbackId: FeedbackId`
  - `submissionId: SubmissionId`
  - `publishedAt: string` (ISO 8601)
- **Domain Events**: `mentoring.feedback.published`
- **Notes**: Creates Feedback entity, author distinguishes AI vs human feedback

---

### Motivation-Progress Service

#### Command: UpdateSkillScore
- **VN**: Cập nhật điểm kỹ năng (internal command, may be triggered by events)
- **Input DTO**:
  - `userId: UserId` (required)
  - `skill: SkillType` (required)
  - `scoreVal: number` (required, 0.0-1.0)
- **Output DTO**:
  - `userId: UserId`
  - `skill: SkillType`
  - `scoreVal: number`
  - `updatedAt: string` (ISO 8601)
- **Domain Events**: None (internal state update, may trigger curriculum unlocks via other events)
- **Notes**: Updates SkillScore entity, typically triggered by lesson.completed or quiz.submitted events

---

## Query Contracts (Read Operations - MVP Minimal)

### Onboarding Service

#### Query: GetUserProfile
- **VN**: Lấy thông tin hồ sơ người dùng
- **Input**: `userId: UserId` (from context or query param)
- **Output**: User entity (from @dmf/shared)
- **Notes**: Returns User entity, read-only

### Curriculum Service

#### Query: GetNextCurriculum
- **VN**: Lấy bài học/đơn vị tiếp theo được đề xuất
- **Input**: `userId: UserId` (from context or query param)
- **Output**: 
  - `type: 'lesson' | 'unit' | 'assessment' | 'srs_review'`
  - `id: string` (lessonId, unitId, etc.)
  - `title?: string`
  - `reason?: 'mastery' | 'assessment' | 'manual' | 'srs'`
- **Notes**: Returns next recommended item, read-only

#### Query: GetProgress
- **VN**: Lấy tiến độ học tập (unlocks, mastery)
- **Input**: `userId: UserId` (from context)
- **Output**: 
  - `unlockedUnits: UnitId[]`
  - `unlockedLessons: LessonId[]`
  - `currentUnit?: UnitId`
- **Notes**: Returns progress state, read-only

### Practice Service

#### Query: GetAttempt
- **VN**: Lấy thông tin phiên học
- **Input**: `attemptId: AttemptId` (required)
- **Output**: Attempt entity (from @dmf/shared)
- **Notes**: Returns Attempt entity, read-only

#### Query: GetSubmissions
- **VN**: Lấy danh sách bài nộp trong phiên học
- **Input**: `attemptId: AttemptId` (required)
- **Output**: Submission[] (array of Submission entities)
- **Notes**: Returns submissions for an attempt, read-only

### Assessment Service

#### Query: GetAssessment
- **VN**: Lấy thông tin bài kiểm tra
- **Input**: `assessmentId: AssessmentId` (required)
- **Output**: Assessment entity (from @dmf/shared)
- **Notes**: Returns Assessment entity, read-only

### Mentoring Service

#### Query: GetFeedback
- **VN**: Lấy phản hồi cho bài nộp
- **Input**: `submissionId: SubmissionId` (required)
- **Output**: Feedback entity (from @dmf/shared)
- **Notes**: Returns Feedback entity, read-only

### Motivation-Progress Service

#### Query: GetSkillScores
- **VN**: Lấy điểm kỹ năng của người dùng
- **Input**: `userId: UserId` (from context)
- **Output**: SkillScore[] (array of SkillScore entities)
- **Notes**: Returns all skill scores for user, read-only

---

## DTOs to Create in @dmf/shared

### New DTOs Needed (not yet in packages/shared/src/contracts):

1. **EnrollCourseInput**
   - `userId: UserId`
   - `courseId: CourseId`

2. **CompleteLessonInput**
   - `attemptId: AttemptId`
   - `status: 'completed' | 'abandoned'`
   - `score?: number`

3. **StartQuizInput**
   - `userId: UserId`
   - `assessmentId: AssessmentId`

4. **SubmitQuizInput**
   - `assessmentId: AssessmentId`
   - `attemptId?: AttemptId`
   - `answers: object[]`

5. **RequestFeedbackInput**
   - `submissionId: SubmissionId`

6. **UpdateSkillScoreInput**
   - `userId: UserId`
   - `skill: SkillType`
   - `scoreVal: number`

### Existing DTOs (already in packages/shared/src/contracts):
- `CreateAttemptInput` ✅
- `SubmitSpeakingInput` ✅
- `SubmitWritingInput` ✅
- `RecordFeedbackInput` ✅

---

## Files to Create/Modify

### To Create:
1. `docs/architecture/contract-inventory.md` (this file)
2. `packages/shared/src/contracts/enroll.ts` (EnrollCourseInput)
3. `packages/shared/src/contracts/complete.ts` (CompleteLessonInput)
4. `packages/shared/src/contracts/quiz.ts` (StartQuizInput, SubmitQuizInput)
5. `packages/shared/src/contracts/feedback.ts` (RequestFeedbackInput - if not in RecordFeedbackInput)
6. `packages/shared/src/contracts/skill.ts` (UpdateSkillScoreInput)

### To Modify:
1. `packages/shared/src/contracts/index.ts` (export new DTOs)
2. `contracts/openapi/api-gateway.openapi.yaml` (reference new DTOs, ensure alignment)
3. `docs/architecture/api-map.md` (update with new command details if needed)

---

## Alignment with Existing

### Events (from contracts/events/events.catalog.md):
- ✅ All 15 events referenced
- ✅ No new events proposed
- ✅ Event names match catalog exactly

### Types (from packages/shared):
- ✅ Uses existing ID types (UserId, LessonId, AttemptId, etc.)
- ✅ Uses existing enums (UserRole, CEFRLevel, SkillType, etc.)
- ✅ Aligns with existing entities

### OpenAPI (from contracts/openapi/api-gateway.openapi.yaml):
- ✅ Commands align with existing POST endpoints
- ✅ Queries align with existing GET endpoints
- ✅ DTOs reference existing schemas where available

---

## Summary

**Total Commands**: 12  
**Total Queries**: 8 (MVP minimal)  
**New DTOs Needed**: 6  
**Existing DTOs Reused**: 4  

**Service Breakdown**:
- Onboarding: 3 commands, 1 query
- Curriculum: 2 commands, 2 queries
- Practice: 3 commands, 2 queries
- Assessment: 2 commands, 1 query
- Mentoring: 2 commands, 1 query
- Motivation-Progress: 1 command, 1 query

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Inventory Complete - Ready for Step 4 Implementation
