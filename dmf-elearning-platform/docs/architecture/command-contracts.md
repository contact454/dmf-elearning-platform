# STEP 4.2 — Command Contracts (MVP)
## Hợp đồng Lệnh (Payload + Validation)

This document defines command contracts (payload schemas, validation rules, and ownership boundaries) for all commands defined in STEP 4.1. Commands represent user/system intent to perform actions, not outcomes or state mutations.

---

## Learning / Practice Domain Commands

--------------------------------------------------
### Command: learning.lesson.start

**Handled by**: `practice-service`

**Intent (Ý định)**:
User intends to start learning a lesson (bắt đầu học bài). This creates a learning session (attempt) for tracking progress.

**Payload Schema**:
```typescript
interface StartLessonCommand {
    userId: UserId;
    lessonId: LessonId;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User who intends to start the lesson
- `lessonId`: Lesson to be started

**Optional fields**:
- `correlationId`: Client-provided ID for idempotency (prevents duplicate attempts)

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `lessonId`: Must be valid LessonId format
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `lessonId` must exist in Lesson entity
- Lesson must be unlocked for user (query curriculum-service)
- User must not have an active attempt for this lesson (or allow resume)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- Lesson does not exist
- Lesson is not unlocked for user
- Active attempt already exists (unless resume allowed)
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Unlock eligibility determination (queries curriculum-service)
- Attempt creation logic

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `userId` + `lessonId` + active attempt check

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Attempt state (owned by `practice-service`)

**What state it MUST NOT touch**:
- ProgressState (read-only, for unlock check only)
- MasteryState (not accessed)
- Lesson state (read-only, from curriculum-service)
- User state (read-only, from onboarding-service)

--------------------------------------------------
### Command: learning.lesson.complete

**Handled by**: `practice-service`

**Intent (Ý định)**:
User intends to finish/complete a lesson (hoàn thành bài học). This signals the end of a learning session.

**Payload Schema**:
```typescript
interface CompleteLessonCommand {
    attemptId: AttemptId;
    status: 'completed' | 'abandoned';
}
```

**Field Rules**:

**Required fields**:
- `attemptId`: Attempt to be completed
- `status`: Either 'completed' (finished) or 'abandoned' (quit)

**Optional fields**:
None

**Constraints (enum, format, length)**:
- `attemptId`: Must be valid AttemptId format
- `status`: Must be either 'completed' or 'abandoned'

**Validation Rules**:

**What is validated synchronously**:
- `attemptId` must exist and be in 'in-progress' status
- `status` must be either 'completed' or 'abandoned'
- Attempt must belong to the authenticated user

**What causes rejection**:
- Attempt does not exist
- Attempt is not in 'in-progress' status
- Attempt does not belong to authenticated user
- Invalid `status` value

**What is deferred to domain logic**:
- Score calculation (computed by service, not in command)
- Mastery determination (computed via event reactions)
- Progress update (computed via event reactions)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `attemptId` (completing an already-completed attempt returns success)

**Ownership Boundary**:

**What state this command may create/change**:
- Updates Attempt state (owned by `practice-service`)

**What state it MUST NOT touch**:
- MasteryState (updated via event reactions, not directly)
- ProgressState (updated via event reactions, not directly)
- Submission state (read-only)

--------------------------------------------------
### Command: learning.lesson.abandon

**Handled by**: `practice-service`

**Intent (Ý định)**:
User intends to quit/abandon a lesson mid-session (bỏ dở bài học). This is a specific case of completion with status 'abandoned'.

**Payload Schema**:
```typescript
interface AbandonLessonCommand {
    attemptId: AttemptId;
}
```

**Field Rules**:

**Required fields**:
- `attemptId`: Attempt to be abandoned

**Optional fields**:
None

**Constraints (enum, format, length)**:
- `attemptId`: Must be valid AttemptId format

**Validation Rules**:

**What is validated synchronously**:
- `attemptId` must exist and be in 'in-progress' status
- Attempt must belong to the authenticated user

**What causes rejection**:
- Attempt does not exist
- Attempt is not in 'in-progress' status
- Attempt does not belong to authenticated user

**What is deferred to domain logic**:
- Abandonment handling (equivalent to `learning.lesson.complete` with `status: 'abandoned'`)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `attemptId` (abandoning an already-abandoned attempt returns success)

**Ownership Boundary**:

**What state this command may create/change**:
- Updates Attempt state (owned by `practice-service`)

**What state it MUST NOT touch**:
- MasteryState (not updated for abandoned attempts)
- ProgressState (not updated for abandoned attempts)
- Submission state (read-only)

--------------------------------------------------
### Command: learning.activity.submit

**Handled by**: `practice-service`

**Intent (Ý định)**:
User intends to submit an answer to an activity (nộp câu trả lời). This supports quiz, listening, speaking, and writing activity types.

**Payload Schema**:
```typescript
interface SubmitActivityCommand {
    attemptId: AttemptId;
    activityId: ActivityId;
    type: 'quiz' | 'listening' | 'speaking' | 'writing';
    
    // For quiz/listening activities
    answer?: unknown; // Answer payload (structure depends on activity type)
    
    // For speaking activities
    audioUrl?: string; // Required if type='speaking'
    durationMs?: number; // Optional if type='speaking'
    
    // For writing activities
    text?: string; // Required if type='writing'
    
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `attemptId`: Attempt this submission belongs to
- `activityId`: Activity being answered
- `type`: Activity type ('quiz', 'listening', 'speaking', or 'writing')

**Optional fields**:
- `answer`: Answer payload for quiz/listening (structure depends on activity type)
- `audioUrl`: Audio file URL (required if type='speaking')
- `durationMs`: Audio duration in milliseconds (optional if type='speaking')
- `text`: Written answer text (required if type='writing')
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `attemptId`: Must be valid AttemptId format
- `activityId`: Must be valid ActivityId format
- `type`: Must be one of 'quiz', 'listening', 'speaking', 'writing'
- `audioUrl`: Must be valid URL format if provided
- `text`: Must be non-empty string if provided
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `attemptId` must exist and be in 'in-progress' status
- `activityId` must exist and belong to the lesson in the attempt
- `type` must match activity's actual type
- If `type` is 'speaking': `audioUrl` must be provided and valid URL
- If `type` is 'writing': `text` must be provided and non-empty
- If `type` is 'quiz' or 'listening': `answer` must be provided
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- Attempt does not exist or not in 'in-progress' status
- Activity does not exist or does not belong to lesson
- `type` does not match activity type
- Missing required fields for specific type (audioUrl for speaking, text for writing, answer for quiz/listening)
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Answer validation (structure depends on activity type)
- Score calculation (computed by service, not in command)
- Correctness determination (computed by service)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `attemptId` + `activityId`

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Submission state (owned by `practice-service`)

**What state it MUST NOT touch**:
- MasteryState (updated via event reactions, not directly)
- ProgressState (updated via event reactions, not directly)
- Attempt state (read-only, to validate attempt)
- Activity state (read-only, from curriculum-service)

---

## Assessment Domain Commands

--------------------------------------------------
### Command: assessment.quiz.start

**Handled by**: `assessment-service`

**Intent (Ý định)**:
User intends to start a quiz attempt (bắt đầu làm quiz). This creates an assessment session.

**Payload Schema**:
```typescript
interface StartQuizCommand {
    userId: UserId;
    assessmentId: AssessmentId;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User who intends to start the quiz
- `assessmentId`: Assessment/quiz to be started

**Optional fields**:
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `assessmentId`: Must be valid AssessmentId format
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `assessmentId` must exist in Assessment entity
- Assessment must be available for user (not already completed, not expired)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- Assessment does not exist
- Assessment already completed
- Assessment expired
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Assessment availability determination
- Attempt creation logic

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `assessmentId` + `userId`

**Ownership Boundary**:

**What state this command may create/change**:
- Creates/updates Assessment state (owned by `assessment-service`)

**What state it MUST NOT touch**:
- User state (read-only, from onboarding-service)
- MasteryState (not accessed)
- ReadinessState (not accessed)

--------------------------------------------------
### Command: assessment.quiz.submit

**Handled by**: `assessment-service`

**Intent (Ý định)**:
User intends to submit quiz answers (nộp đáp án quiz). This signals completion of a quiz attempt.

**Payload Schema**:
```typescript
interface SubmitQuizCommand {
    assessmentId: AssessmentId;
    attemptId?: AttemptId;
    answers: object[];
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `assessmentId`: Assessment being submitted
- `answers`: Array of quiz answers (structure depends on assessment type)

**Optional fields**:
- `attemptId`: Attempt ID if quiz was started via `assessment.quiz.start`
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `assessmentId`: Must be valid AssessmentId format
- `attemptId`: Must be valid AttemptId format if provided
- `answers`: Must be non-empty array
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `assessmentId` must exist and be in 'in-progress' status
- `answers` must be a non-empty array
- Number of answers must match assessment question count
- Answer format must match assessment type (multiple-choice, fill-gap, etc.)
- If `attemptId` provided, it must match the assessment's current attempt
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- Assessment does not exist or not in 'in-progress' status
- Empty `answers` array
- Answer count mismatch
- Invalid answer format
- `attemptId` mismatch if provided
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Score calculation (computed by service, not in command)
- Correctness determination (computed by service)
- Readiness computation (read-only, no state mutation)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `assessmentId`

**Ownership Boundary**:

**What state this command may create/change**:
- Updates Assessment state (owned by `assessment-service`)

**What state it MUST NOT touch**:
- MasteryState (updated via event reactions, not directly)
- ReadinessState (computed read-only, not mutated)
- User state (read-only)

--------------------------------------------------
### Command: assessment.placement.take

**Handled by**: `assessment-service`

**Intent (Ý định)**:
User intends to take placement test (làm bài kiểm tra định vị). This represents the user's intent to enter the placement test flow.

**Payload Schema**:
```typescript
interface TakePlacementCommand {
    userId: UserId;
    targetLanguage: LanguageCode;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User who intends to take placement test
- `targetLanguage`: Language being tested (e.g., 'de', 'en')

**Optional fields**:
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `targetLanguage`: Must be valid LanguageCode enum value ('de' or 'en')
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `targetLanguage` must be a valid LanguageCode enum value
- User must not have a recent placement test result (or allow retake)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- Invalid `targetLanguage` value
- Recent placement test exists (if retake not allowed)
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Placement test creation
- CEFR level determination (computed after test completion, not in command)
- Event emission (only after full test completion)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `userId` + `targetLanguage`

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Assessment state (owned by `assessment-service`)

**What state it MUST NOT touch**:
- User state (read-only, from onboarding-service)
- ReadinessState (computed after completion, not in command)
- CEFR level (computed outcome, not in command payload)

---

## Mentoring / Feedback Domain Commands

--------------------------------------------------
### Command: mentoring.feedback.request

**Handled by**: `mentoring-service`

**Intent (Ý định)**:
User intends to request feedback on a submission (yêu cầu phản hồi). This triggers feedback generation (AI or human).

**Payload Schema**:
```typescript
interface RequestFeedbackCommand {
    submissionId: SubmissionId;
    userId: UserId;
    priority?: 'normal' | 'urgent';
}
```

**Field Rules**:

**Required fields**:
- `submissionId`: Submission to get feedback on
- `userId`: User requesting feedback

**Optional fields**:
- `priority`: Feedback priority ('normal' or 'urgent')

**Constraints (enum, format, length)**:
- `submissionId`: Must be valid SubmissionId format
- `userId`: Must be valid UserId format
- `priority`: Must be either 'normal' or 'urgent' if provided

**Validation Rules**:

**What is validated synchronously**:
- `submissionId` must exist in Submission entity
- `userId` must match submission's attempt owner
- Submission must be of type 'speaking' or 'writing' (feedback not applicable to quiz items)
- `priority` must be either 'normal' or 'urgent' if provided

**What causes rejection**:
- Submission does not exist
- `userId` does not match submission owner
- Submission type is not 'speaking' or 'writing'
- Invalid `priority` value

**What is deferred to domain logic**:
- Feedback request creation
- AI analysis triggering (read-only operation)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `submissionId` (requesting feedback on a submission that already has a pending request returns existing request)

**Ownership Boundary**:

**What state this command may create/change**:
- Creates FeedbackRequest state (owned by `mentoring-service`)

**What state it MUST NOT touch**:
- Submission state (read-only, from practice-service)
- MasteryState (not accessed)
- Feedback state (not yet created)

--------------------------------------------------
### Command: mentoring.feedback.publish

**Handled by**: `mentoring-service`

**Intent (Ý định)**:
Teacher/Mentor intends to publish feedback (xuất bản phản hồi). This makes feedback available to the learner.

**Payload Schema**:
```typescript
interface PublishFeedbackCommand {
    submissionId: SubmissionId;
    authorId: string;
    authorRole: 'teacher' | 'mentor' | 'ai';
    text: string;
    corrections?: string[];
    rubricScores?: {
        pronunciation?: number;
        fluency?: number;
        grammarAccuracy?: number;
        taskCompletion?: number;
        coherence?: number;
        vocabRange?: number;
    };
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `submissionId`: Submission this feedback is for
- `authorId`: Teacher/Mentor ID (or 'ai' for AI feedback)
- `authorRole`: Feedback author role ('teacher', 'mentor', or 'ai')
- `text`: Feedback text (Markdown format)

**Optional fields**:
- `corrections`: List of corrections
- `rubricScores`: Rubric scores for speaking/writing (structure depends on submission type)
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `submissionId`: Must be valid SubmissionId format
- `authorId`: Must be valid ID format (or 'ai' string)
- `authorRole`: Must be one of 'teacher', 'mentor', 'ai'
- `text`: Must be non-empty string
- `corrections`: Array of strings if provided
- `rubricScores`: All scores must be in range 0.0-1.0 if provided
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `submissionId` must exist in Submission entity
- `authorId` must exist if `authorRole` is 'teacher' or 'mentor'
- `authorRole` must be a valid enum value ('teacher', 'mentor', or 'ai')
- `text` must be non-empty
- `rubricScores` must match submission type (speaking vs writing have different rubrics)
- All rubric scores must be in range 0.0-1.0
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- Submission does not exist
- `authorId` does not exist (if authorRole is 'teacher' or 'mentor')
- Invalid `authorRole` value
- Empty `text`
- Rubric scores out of range (0.0-1.0)
- Rubric structure mismatch with submission type
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Feedback creation
- Mastery impact (computed via event reactions, not directly)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `submissionId` + `authorId`

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Feedback state (owned by `mentoring-service`)

**What state it MUST NOT touch**:
- Submission state (read-only, from practice-service)
- MasteryState (updated via event reactions, not directly)
- ProgressState (not accessed)

---

## Progress / Curriculum Domain Commands

--------------------------------------------------
### Command: curriculum.course.enroll

**Handled by**: `curriculum-service`

**Intent (Ý định)**:
User intends to enroll in a course (ghi danh khóa học). This creates an enrollment relationship.

**Payload Schema**:
```typescript
interface EnrollInCourseCommand {
    userId: UserId;
    courseId: CourseId;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User who intends to enroll
- `courseId`: Course to enroll in

**Optional fields**:
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `courseId`: Must be valid CourseId format
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `courseId` must exist in Course entity
- User must not already be enrolled in this course (or allow re-enrollment)
- Course must be available for enrollment (not archived, not full capacity)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- Course does not exist
- User already enrolled (if re-enrollment not allowed)
- Course archived or full capacity
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Enrollment creation
- ProgressState initialization (via event reactions, not directly)
- MasteryState initialization (via event reactions, not directly)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `userId` + `courseId`

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Enrollment state (owned by `curriculum-service`)

**What state it MUST NOT touch**:
- User state (read-only, from onboarding-service)
- ProgressState (initialized via event reactions, not directly)
- MasteryState (initialized via event reactions, not directly)
- Course state (read-only)

--------------------------------------------------
### Command: curriculum.unit.access

**Handled by**: `progress-service`

**Intent (Ý định)**:
System intends to check/access unit eligibility (kiểm tra điều kiện truy cập đơn vị). This is an internal system command representing intent to evaluate unit access eligibility. Not exposed to client applications.

**Payload Schema**:
```typescript
interface AccessUnitCommand {
    userId: UserId;
    unitId: UnitId;
    courseId: CourseId;
    reason: 'mastery' | 'assessment' | 'manual' | 'srs';
}
```

**Field Rules**:

**Required fields**:
- `userId`: User requesting access
- `unitId`: Unit to check access for
- `courseId`: Course the unit belongs to
- `reason`: Reason for access check ('mastery', 'assessment', 'manual', or 'srs')

**Optional fields**:
None

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `unitId`: Must be valid UnitId format
- `courseId`: Must be valid CourseId format
- `reason`: Must be one of 'mastery', 'assessment', 'manual', 'srs'

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `unitId` must exist in Unit entity
- `courseId` must exist in Course entity
- Unit must belong to the specified course
- `reason` must be a valid enum value

**What causes rejection**:
- User does not exist
- Unit does not exist
- Course does not exist
- Unit does not belong to course
- Invalid `reason` value

**What is deferred to domain logic**:
- Eligibility evaluation (queries curriculum-service for unlock rules)
- ProgressState update if eligible (via internal logic)
- Event emission if unlock occurs (informational, after state update)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `userId` + `unitId` (checking access multiple times returns same eligibility result)

**Ownership Boundary**:

**What state this command may create/change**:
- May trigger ProgressState update if eligible (via internal logic, owned by `progress-service`)

**What state it MUST NOT touch**:
- Curriculum state (read-only, queries curriculum-service for unlock eligibility rules)
- MasteryState (read-only, from motivation-progress-service)
- Enrollment state (read-only)
- Not exposed to client applications (internal system command only)

---

## System / Automation Domain Commands

--------------------------------------------------
### Command: system.user.register

**Handled by**: `onboarding-service`

**Intent (Ý định)**:
User intends to register/create account (đăng ký tài khoản). This creates a new user account.

**Payload Schema**:
```typescript
interface RegisterUserCommand {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `email`: User email address
- `password`: User password (will be hashed on server)
- `role`: User role ('learner', 'teacher', 'mentor', or 'admin')

**Optional fields**:
- `firstName`: User first name
- `lastName`: User last name
- `targetLanguage`: Target learning language (e.g., 'de', 'en')
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `email`: Must be valid email format and unique
- `password`: Must meet security requirements (min length, complexity)
- `role`: Must be valid UserRole enum value
- `targetLanguage`: Must be valid LanguageCode enum value if provided
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `email` must be valid email format and unique (not already registered)
- `password` must meet security requirements (min length, complexity)
- `role` must be a valid UserRole enum value
- `targetLanguage` must be a valid LanguageCode enum value if provided
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- Invalid email format
- Email already registered
- Password does not meet security requirements
- Invalid `role` value
- Invalid `targetLanguage` value
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- User creation
- LearnerProfile creation (if role is 'learner')
- ProgressState initialization (via event reactions, not directly)
- MasteryState initialization (via event reactions, not directly)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `email` (email must be unique)

**Ownership Boundary**:

**What state this command may create/change**:
- Creates User state (owned by `onboarding-service`)
- Creates LearnerProfile state (owned by `onboarding-service`, if role is 'learner')

**What state it MUST NOT touch**:
- ProgressState (initialized via event reactions, not directly)
- MasteryState (initialized via event reactions, not directly)
- ReadinessState (initialized via event reactions, not directly)

--------------------------------------------------
### Command: system.user.login

**Handled by**: `onboarding-service`

**Intent (Ý định)**:
User intends to log in (đăng nhập). This authenticates the user and creates a session.

**Payload Schema**:
```typescript
interface LoginUserCommand {
    email: string;
    password: string;
    deviceId?: string;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `email`: User email address
- `password`: User password (plain text, verified against stored hash)

**Optional fields**:
- `deviceId`: Device identifier (for session tracking)
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `email`: Must be valid email format
- `password`: Plain text password (verified on server)
- `deviceId`: String identifier if provided
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `email` must exist in User entity
- `password` must match stored password hash
- User account must be active (not suspended, not deleted)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- Password does not match
- User account suspended or deleted
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Session creation
- Authentication token generation (not in command payload)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `email` + `deviceId` (logging in multiple times creates new sessions, idempotent at session level)

**Ownership Boundary**:

**What state this command may create/change**:
- Creates Session state (owned by `onboarding-service`)

**What state it MUST NOT touch**:
- User state (read-only, login is read-only operation)
- Authentication result (computed by service, not in command payload)
- Token generation (not in command payload)

--------------------------------------------------
### Command: system.profile.modify

**Handled by**: `onboarding-service`

**Intent (Ý định)**:
User intends to modify profile information (sửa thông tin hồ sơ). This updates user profile fields. Some fields have side effects (e.g., `targetLanguage` change may trigger learning state reset).

**Payload Schema**:
```typescript
interface ModifyProfileCommand {
    userId: UserId;
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
    avatarUrl?: string;
    notificationPreferences?: object;
    correlationId?: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User modifying profile (typically from authentication context)

**Optional fields**:
- `firstName`: First name
- `lastName`: Last name
- `targetLanguage`: Target learning language (e.g., 'de', 'en') - **Side effect**: May trigger learning state reset
- `avatarUrl`: Avatar image URL
- `notificationPreferences`: Notification preferences object
- `correlationId`: Client-provided ID for idempotency

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `targetLanguage`: Must be valid LanguageCode enum value if provided
- `avatarUrl`: Must be valid URL format if provided
- `correlationId`: Must be unique if provided

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `userId` must match authenticated user (authorization check)
- `targetLanguage` must be a valid LanguageCode enum value if provided
- `avatarUrl` must be valid URL format if provided
- At least one optional field must be provided (cannot submit empty update)
- `correlationId` must be unique if provided (idempotency check)

**What causes rejection**:
- User does not exist
- `userId` does not match authenticated user
- Invalid `targetLanguage` value
- Invalid `avatarUrl` format
- Empty update (no fields provided)
- Duplicate `correlationId` if provided

**What is deferred to domain logic**:
- Profile update
- Learning state reset (if `targetLanguage` changed, via event reactions)
- ProgressState reset/recomputation (via event reactions, not directly)
- MasteryState reset/recomputation (via event reactions, not directly)
- ReadinessState reset/recomputation (via event reactions, not directly)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `correlationId` (if provided) or `userId` (modifying profile with same values returns success)

**Ownership Boundary**:

**What state this command may create/change**:
- Updates User state (owned by `onboarding-service`)
- Updates LearnerProfile state (owned by `onboarding-service`, if applicable)

**What state it MUST NOT touch**:
- ProgressState (reset/recomputed via event reactions if `targetLanguage` changed, not directly)
- MasteryState (reset/recomputed via event reactions if `targetLanguage` changed, not directly)
- ReadinessState (reset/recomputed via event reactions if `targetLanguage` changed, not directly)

**Note**: If `targetLanguage` (learningLanguage) changes, this may trigger reset/recomputation of ProgressState, MasteryState, and ReadinessState via event reactions. Other profile changes (firstName, lastName, avatarUrl, notificationPreferences) do NOT affect learning states.

--------------------------------------------------
### Command: system.srs.schedule

**Handled by**: `curriculum-service`

**Intent (Ý định)**:
System intends to schedule SRS review items (lên lịch ôn tập). This is an automated command that determines which SRS items are due for review.

**Payload Schema**:
```typescript
interface ScheduleSRSCommand {
    userId: UserId;
    courseId?: CourseId;
    scheduledAt: string;
}
```

**Field Rules**:

**Required fields**:
- `userId`: User to schedule SRS items for
- `scheduledAt`: ISO 8601 timestamp of scheduling time

**Optional fields**:
- `courseId`: Course filter (if provided, only schedule items for this course)

**Constraints (enum, format, length)**:
- `userId`: Must be valid UserId format
- `courseId`: Must be valid CourseId format if provided
- `scheduledAt`: Must be valid ISO 8601 timestamp

**Validation Rules**:

**What is validated synchronously**:
- `userId` must exist in User entity
- `courseId` must exist in Course entity if provided
- `scheduledAt` must be valid ISO 8601 timestamp
- User must have active enrollment(s) if `courseId` not provided

**What causes rejection**:
- User does not exist
- Course does not exist (if provided)
- Invalid `scheduledAt` format
- No active enrollments (if `courseId` not provided)

**What is deferred to domain logic**:
- SRS item due determination
- Event emission (informational, no state mutation)

**Idempotency**:
- **Is it idempotent?** Yes
- **If yes, which key**: `userId` + `scheduledAt` (scheduling SRS items multiple times returns same due items)

**Ownership Boundary**:

**What state this command may create/change**:
- No state mutation (read-only operation)

**What state it MUST NOT touch**:
- SRSItem state (read-only, SRS items are updated when review is completed)
- Enrollment state (read-only)
- ProgressState (not accessed)
- MasteryState (not accessed)

**Note**: This is an automated system command (not user-facing). It triggers `curriculum.srs_items.due` event which is informational only. SRS review affects mastery via `learning.lesson.completed` event when review is completed.

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Command contracts defined for MVP  
**Related Documents**: 
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/state-ownership.md` (State ownership rules)
- `contracts/events/events.catalog.md` (Domain events)
