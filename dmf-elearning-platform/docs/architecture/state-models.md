**Status**: FROZEN  
**Freeze Scope**: STEP 5A — State Models + Ownership Invariants  
**Freeze Date**: 2026-01-17 (Asia/Ho_Chi_Minh)  
**Freeze Notes**:
- ReadinessState is computed by education/readiness-model (pure) and may be cached by assessment-service (cache is not source of truth).
- SRSItem mutation flow clarified: system.srs.schedule → curriculum.srs_items.due → curriculum-service updates SRSItem (event reaction).

---

# STEP 5A — State Models (Write + Derived)
## Mô hình Trạng thái (Ghi + Tính toán)

This document defines explicit state model definitions for all services. It converts the frozen State Inventory (`docs/architecture/state-inventory.md`) into TypeScript interfaces and invariants.

---

## 0. Source of Truth

**Authority**: `docs/architecture/state-inventory.md` is the authoritative source for all states in the system.

**No new states introduced**: All states defined in this document exist in the state inventory. No additional states are created.

**State Classification** (from state-inventory.md):
- Write State: Authoritative, persisted, mutated by commands
- Read State: Query-optimized, may be derived or cached (not defined here, out of scope)
- Derived State: Computed from events, NOT written by commands
- Ephemeral State: In-memory, session-based, not persisted

---

## 1. Shared Types (Import-only)

This document references the following shared types from `@dmf/shared`. They are NOT defined here:

**ID Types**:
- `UserId`, `EnrollmentId`, `CourseId`, `UnitId`, `LessonId`, `ActivityId`
- `AttemptId`, `SubmissionId`, `AssessmentId`, `FeedbackId`, `SRSItemId`

**Enum Types**:
- `UserRole`, `LanguageCode`, `CEFRLevel`, `SkillType`
- `AttemptStatus`, `SubmissionType`, `ActivityType`, `AssessmentType`, `AssessmentStatus`
- `EnrollmentStatus`, `FeedbackAuthor`, `ReadinessStatus`

**Note**: Import these types from `@dmf/shared` packages. Do not redefine them.

---

## 2. State Models by Service

--------------------------------------------------
### practice-service

**Owned Write States (Authoritative, persisted)**:

#### Attempt

Represents a single lesson session (phiên học bài).

```typescript
interface Attempt {
    attemptId: AttemptId;
    userId: UserId;
    lessonId: LessonId;
    status: AttemptStatus; // 'in-progress' | 'completed' | 'abandoned'
    score?: number; // 0-100, computed by service (not in command)
    startedAt: string; // ISO 8601 timestamp
    completedAt?: string; // ISO 8601 timestamp (if completed or abandoned)
    version: number; // For optimistic locking
}
```

#### Submission

Represents a single answer to an activity (câu trả lời cho hoạt động).

```typescript
interface Submission {
    submissionId: SubmissionId;
    attemptId: AttemptId;
    activityId: ActivityId;
    lessonId: LessonId; // Denormalized for query performance
    type: SubmissionType; // 'speaking' | 'writing' | 'quiz' | 'listening'
    
    // For speaking submissions
    audioUrl?: string; // Required if type='speaking'
    durationMs?: number; // Optional if type='speaking'
    
    // For writing submissions
    text?: string; // Required if type='writing'
    
    // For quiz/listening submissions
    answer?: unknown; // Answer payload (structure depends on activity type)
    
    createdAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Owned Derived States (Computed from events)**:

None. practice-service owns only write states.

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- practice-service MUST NOT mutate ProgressState (owned by progress-service)
- practice-service MUST NOT mutate MasteryState (owned by motivation-progress-service)
- practice-service MUST NOT mutate Assessment (owned by assessment-service)
- practice-service MUST NOT mutate Feedback (owned by mentoring-service)
- practice-service MUST NOT mutate User (owned by onboarding-service)
- practice-service MUST NOT mutate Course, Unit, Lesson, Activity (owned by curriculum-service, read-only content)

**Domain invariants**:
- Attempt.status must be 'in-progress' before it can be completed or abandoned
- Attempt.score is computed by service (not provided in command payload)
- Submission.type must match activity type
- Submission must belong to an Attempt that is in 'in-progress' status
- Submission.audioUrl is required if type is 'speaking'
- Submission.text is required if type is 'writing'
- Submission.answer is required if type is 'quiz' or 'listening'

**Idempotency invariants**:
- Attempt creation is idempotent via correlationId (returns existing attempt if correlationId matches)
- Submission creation is idempotent via correlationId (returns existing submission if correlationId matches)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- `learning.lesson.start` → Creates Attempt (status: 'in-progress')
- `learning.lesson.complete` → Updates Attempt (status: 'completed' or 'abandoned', score computed)
- `learning.lesson.abandon` → Updates Attempt (status: 'abandoned')
- `learning.activity.submit` → Creates Submission

**Events that update derived states**:
- None (practice-service owns only write states)

---

--------------------------------------------------
### assessment-service

**Owned Write States (Authoritative, persisted)**:

#### Assessment

Represents a formal test (quiz, placement, level exam).

```typescript
interface Assessment {
    assessmentId: AssessmentId;
    userId: UserId;
    type: AssessmentType; // 'placement' | 'unit-test' | 'level-exam'
    status: AssessmentStatus; // 'scheduled' | 'in-progress' | 'graded'
    
    // Assessment content (read-only, from curriculum)
    questions?: unknown[]; // Question structure depends on assessment type
    
    // Answers (submitted by user)
    answers?: unknown[]; // Answer structure depends on assessment type
    
    // Results (computed by service)
    score?: number; // 0-100, computed by service (not in command)
    cefrLevel?: CEFRLevel; // Computed after placement test completion (not in command)
    
    // Metadata
    startedAt?: string; // ISO 8601 timestamp
    submittedAt?: string; // ISO 8601 timestamp
    gradedAt?: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Owned Derived States (Computed from events)**:

None. assessment-service owns only write states.

**Cached Computed States (Computed externally, may be cached)**:

#### ReadinessState

Represents learner's readiness for next level (exam readiness + pathway readiness). **Computed on read; may be cached**.

**Note**: ReadinessState is NOT owned by any service. It is computed by `education/readiness-model` (pure, stateless function) from MasteryState + Assessment results. `assessment-service` (preferred) or `onboarding-service` (optional) may cache computed results for performance, but the cache is NOT the source of truth. The computation logic is pure and stateless.

```typescript
interface ReadinessState {
    userId: UserId;
    computedAt: string; // ISO 8601 timestamp (when computation occurred)
    
    // Readiness status (trạng thái sẵn sàng)
    readiness: {
        overall: 'ready' | 'not_ready' | 'unknown';
        perSkill: {
            listening: 'ready' | 'not_ready' | 'unknown';
            reading: 'ready' | 'not_ready' | 'unknown';
            speaking: 'ready' | 'not_ready' | 'unknown';
            writing: 'ready' | 'not_ready' | 'unknown';
        };
        blockers: string[]; // Human-readable reasons blocking readiness
    };
    
    // Source references (IDs only, for traceability)
    sourceRefs?: {
        assessmentId?: AssessmentId; // Last assessment used for readiness
        masteryVersion?: number; // Version of MasteryState used in computation
    };
}
```

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- assessment-service MUST NOT mutate Attempt (owned by practice-service)
- assessment-service MUST NOT mutate Submission (owned by practice-service)
- assessment-service MUST NOT mutate MasteryState (owned by motivation-progress-service)
- assessment-service MUST NOT mutate ReadinessState (computed by education/readiness-model, may cache but not own)
- assessment-service MUST NOT mutate ProgressState (owned by progress-service)
- assessment-service MUST NOT mutate User (owned by onboarding-service)
- ReadinessState cache must be invalidated when relevant events occur (assessment.quiz.submitted, assessment.level_test.completed, learning.lesson.completed with high score)

**Domain invariants**:
- Assessment.status must be 'in-progress' before it can be submitted
- Assessment.score is computed by service (not provided in command payload)
- Assessment.cefrLevel is computed after placement test completion (not in command payload)
- Assessment.answers must match question count
- Assessment.type determines question and answer structure
- ReadinessState is computed from MasteryState + Assessment results (pure function, no side effects)
- ReadinessState cache is optional and must be invalidated by relevant events
- ReadinessState.computedAt must reflect when computation occurred
- ReadinessState.readiness.overall and perSkill values must be valid enum values

**Idempotency invariants**:
- Assessment creation is idempotent via correlationId (returns existing assessment if correlationId matches)
- Assessment submission is idempotent via correlationId (returns existing result if correlationId matches)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- `assessment.quiz.start` → Creates/Updates Assessment (status: 'in-progress')
- `assessment.quiz.submit` → Updates Assessment (status: 'graded', score computed)
- `assessment.placement.take` → Creates Assessment (type: 'placement', status: 'in-progress')

**Events that update derived states**:
- None (assessment-service owns only write states)

**Computed state cache invalidation**:
- `assessment.quiz.submitted` → Invalidates ReadinessState cache (recompute on next read)
- `assessment.level_test.completed` → Invalidates ReadinessState cache (recompute on next read)
- `learning.lesson.completed` → May invalidate ReadinessState cache if score indicates significant progress (recompute on next read)
- `mentoring.feedback.published` → May invalidate ReadinessState cache if feedback affects mastery significantly (recompute on next read)

---

--------------------------------------------------
### mentoring-service

**Owned Write States (Authoritative, persisted)**:

#### Feedback

Represents AI/teacher/mentor feedback on a submission.

```typescript
interface Feedback {
    feedbackId: FeedbackId;
    submissionId: SubmissionId;
    authorId: string; // Teacher/Mentor ID or 'ai' for AI feedback
    authorRole: FeedbackAuthor; // 'teacher' | 'mentor' | 'ai'
    text: string; // Feedback text (Markdown format)
    corrections?: string[]; // List of corrections
    
    // Rubric scores (optional, for speaking/writing)
    rubricScores?: {
        pronunciation?: number; // 0.0-1.0
        fluency?: number; // 0.0-1.0
        grammarAccuracy?: number; // 0.0-1.0
        taskCompletion?: number; // 0.0-1.0
        coherence?: number; // 0.0-1.0 (for writing)
        vocabRange?: number; // 0.0-1.0 (for writing)
    };
    
    publishedAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

#### FeedbackRequest

Tracks feedback request status.

```typescript
interface FeedbackRequest {
    feedbackRequestId: string; // Internal ID
    submissionId: SubmissionId;
    userId: UserId;
    priority: 'normal' | 'urgent';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestedAt: string; // ISO 8601 timestamp
    completedAt?: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Owned Derived States (Computed from events)**:

None. mentoring-service owns only write states.

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- mentoring-service MUST NOT mutate Submission (owned by practice-service)
- mentoring-service MUST NOT mutate MasteryState (owned by motivation-progress-service, updated via event reactions)
- mentoring-service MUST NOT mutate User (owned by onboarding-service)
- mentoring-service MUST NOT mutate Attempt (owned by practice-service)

**Domain invariants**:
- Feedback.submissionId must reference an existing Submission
- Feedback.authorId must exist if authorRole is 'teacher' or 'mentor'
- Feedback.text must be non-empty
- Feedback.rubricScores must match submission type (speaking vs writing have different rubrics)
- All rubric scores must be in range 0.0-1.0
- FeedbackRequest.submissionId must reference a Submission of type 'speaking' or 'writing'
- FeedbackRequest.userId must match submission's attempt owner

**Idempotency invariants**:
- Feedback creation is idempotent via correlationId (returns existing feedback if correlationId matches)
- FeedbackRequest creation is idempotent (returns existing request if submission already has pending request)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- `mentoring.feedback.request` → Creates FeedbackRequest
- `mentoring.feedback.publish` → Creates Feedback

**Events that update derived states**:
- None (mentoring-service owns only write states)

---

--------------------------------------------------
### curriculum-service

**Owned Write States (Authoritative, persisted)**:

#### Enrollment

Represents association between User and Course.

```typescript
interface Enrollment {
    enrollmentId: EnrollmentId;
    userId: UserId;
    courseId: CourseId;
    status: EnrollmentStatus; // 'active' | 'completed' | 'dropped'
    enrolledAt: string; // ISO 8601 timestamp
    completedAt?: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

#### SRSItem

Spaced repetition state (intervals, ease factor, next review).

```typescript
interface SRSItem {
    srsItemId: SRSItemId;
    userId: UserId;
    courseId: CourseId;
    lessonId: LessonId;
    activityId?: ActivityId; // Optional, for activity-specific SRS
    
    // SRS algorithm state
    interval: number; // Days until next review
    easeFactor: number; // Ease factor (typically 2.5)
    repetitions: number; // Number of successful reviews
    nextReviewAt: string; // ISO 8601 timestamp
    
    // Metadata
    lastReviewedAt?: string; // ISO 8601 timestamp
    createdAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Owned Read States (Query-optimized, curriculum content)**:

**Note**: Course, Unit, Lesson, Activity are read-only curriculum content. They are not mutated by learning commands and are out of scope for this document (query models).

**Owned Derived States (Computed from events)**:

None. curriculum-service owns write states and read states (curriculum content).

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- curriculum-service MUST NOT mutate ProgressState (owned by progress-service)
- curriculum-service MUST NOT mutate MasteryState (owned by motivation-progress-service)
- curriculum-service MUST NOT mutate Attempt (owned by practice-service)
- curriculum-service MUST NOT mutate Submission (owned by practice-service)
- curriculum-service MUST NOT mutate User (owned by onboarding-service)
- curriculum-service MUST NOT add unlock flags to Course, Unit, Lesson (unlock is learner state, not curriculum content)

**Domain invariants**:
- Enrollment.userId must reference an existing User
- Enrollment.courseId must reference an existing Course
- Enrollment.status must be 'active' for new enrollments
- SRSItem.userId must reference an existing User
- SRSItem.courseId must reference an existing Course
- SRSItem.lessonId must reference an existing Lesson
- SRSItem.interval must be positive
- SRSItem.easeFactor must be >= 1.3 (typical minimum)
- SRSItem.nextReviewAt must be in the future

**Idempotency invariants**:
- Enrollment creation is idempotent via correlationId (returns existing enrollment if correlationId matches)
- SRSItem updates are idempotent (same scheduling returns same due items)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- `curriculum.course.enroll` → Creates Enrollment
- `system.srs.schedule` → Reads SRSItem (read-only, triggers event)

**Events that update derived states**:
- `curriculum.srs_items.due` → Updates SRSItem (indirect, via event reaction)

**Note**: `system.srs.schedule` command (handled by curriculum-service) is read-only and emits `curriculum.srs_items.due` event. The curriculum-service then updates SRSItem state based on that event reaction.

---

--------------------------------------------------
### progress-service

**Owned Write States (Authoritative, persisted)**:

None. progress-service owns only derived state.

**Owned Derived States (Computed from events)**:

#### ProgressState

Tracks which units/lessons are unlocked and completed. **Updated by events only**.

```typescript
interface ProgressState {
    userId: UserId;
    courseId: CourseId;
    enrollmentId: EnrollmentId;
    
    // Unlocked content (nội dung đã mở khóa)
    unlockedUnitIds: UnitId[]; // Units available to learner
    unlockedLessonIds: LessonId[]; // Lessons available to learner
    
    // Completed content (nội dung đã hoàn thành)
    completedUnitIds: UnitId[]; // Units fully completed
    completedLessonIds: LessonId[]; // Lessons fully completed
    
    // Current position (vị trí hiện tại)
    currentUnitId?: UnitId; // Currently active unit
    currentLessonId?: LessonId; // Currently active lesson
    
    // Metadata (siêu dữ liệu)
    lastUpdatedAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- progress-service MUST NOT mutate MasteryState (owned by motivation-progress-service)
- progress-service MUST NOT mutate Course, Unit, Lesson (owned by curriculum-service, curriculum content)
- progress-service MUST NOT mutate Enrollment (owned by curriculum-service)
- progress-service MUST NOT mutate Attempt (owned by practice-service)
- progress-service MUST NOT mutate User (owned by onboarding-service)
- progress-service MUST NOT write ProgressState from commands (only from events)

**Domain invariants**:
- ProgressState.userId must reference an existing User
- ProgressState.courseId must reference an existing Course
- ProgressState.enrollmentId must reference an existing Enrollment
- ProgressState.unlockedLessonIds must be subset of lessons in unlockedUnitIds
- ProgressState.completedLessonIds must be subset of unlockedLessonIds
- ProgressState.completedUnitIds must be subset of unlockedUnitIds
- ProgressState.currentLessonId must be in unlockedLessonIds
- ProgressState.currentUnitId must be in unlockedUnitIds

**Idempotency invariants**:
- ProgressState updates are idempotent (same event processed multiple times results in same state)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- None. ProgressState is derived state, never written by commands.

**Events that update derived states**:
- `learning.lesson.completed` → Updates ProgressState (may unlock next lesson/unit if eligible)
- `assessment.level_test.completed` → Updates ProgressState (unlocks initial units up to determined level)
- `curriculum.course.enrolled` → Initializes ProgressState (empty state)
- `curriculum.unit.unlocked` → Updates ProgressState (adds unit to unlockedUnitIds)
- `system.user.registered` → Initializes ProgressState (empty state, if learner)
- `system.profile.updated` → Resets/Recomputes ProgressState (if targetLanguage changed)

---

--------------------------------------------------
### motivation-progress-service

**Owned Write States (Authoritative, persisted)**:

None. motivation-progress-service owns only derived states.

**Owned Derived States (Computed from events)**:

#### MasteryState

Tracks per-skill and per-lesson mastery scores. **Updated by events only**.

```typescript
interface MasteryState {
    userId: UserId;
    
    // Per-skill mastery (độ vững theo kỹ năng)
    skillScores: {
        skill: SkillType; // listening, reading, speaking, writing, vocabulary, grammar
        scoreVal: number; // 0.0 to 1.0 (normalized)
        lastUpdatedAt: string; // ISO 8601
    }[];
    
    // Per-lesson mastery (độ vững theo bài)
    lessonMastery: {
        lessonId: LessonId;
        skillBreakdown: {
            skill: SkillType;
            scoreVal: number; // 0.0 to 1.0
        }[];
        overallScore: number; // 0.0 to 1.0 (weighted average)
        lastUpdatedAt: string; // ISO 8601
    }[];
    
    // Per-unit mastery (độ vững theo đơn vị)
    // NOTE: In MVP, unitMastery MAY be derived from lessonMastery, not necessarily persisted
    unitMastery?: {
        unitId: UnitId;
        skillBreakdown: {
            skill: SkillType;
            scoreVal: number; // 0.0 to 1.0
        }[];
        overallScore: number; // 0.0 to 1.0 (weighted average)
        lastUpdatedAt: string; // ISO 8601
    }[];
    
    // Metadata (siêu dữ liệu)
    lastCalculatedAt: string; // ISO 8601
    version: number; // For optimistic locking
}
```

#### SkillScore

Granular proficiency per skill (grammar, vocab, speaking, etc.). **Updated by events only**.

```typescript
interface SkillScore {
    userId: UserId;
    skill: SkillType; // listening, reading, speaking, writing, vocabulary, grammar
    scoreVal: number; // 0.0 to 1.0 (normalized)
    lastUpdatedAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Note**: SkillScore may be denormalized from MasteryState.skillScores for query performance, or may be the source of truth with MasteryState.skillScores derived from it. Implementation detail.

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- motivation-progress-service MUST NOT mutate Attempt (owned by practice-service)
- motivation-progress-service MUST NOT mutate Submission (owned by practice-service)
- motivation-progress-service MUST NOT mutate Assessment (owned by assessment-service)
- motivation-progress-service MUST NOT mutate Feedback (owned by mentoring-service)
- motivation-progress-service MUST NOT mutate ProgressState (owned by progress-service)
- motivation-progress-service MUST NOT mutate User (owned by onboarding-service)
- motivation-progress-service MUST NOT write MasteryState or SkillScore from commands (only from events)

**Domain invariants**:
- MasteryState.userId must reference an existing User
- All scoreVal fields must be in range 0.0-1.0
- MasteryState.lessonMastery.overallScore must be weighted average of skillBreakdown scores
- MasteryState.unitMastery.overallScore must be weighted average of skillBreakdown scores (if persisted)
- SkillScore.scoreVal must be in range 0.0-1.0
- SkillScore.skill must be valid SkillType enum value

**Idempotency invariants**:
- MasteryState updates are idempotent (same event processed multiple times results in same state)
- SkillScore updates are idempotent (same event processed multiple times results in same state)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- None. MasteryState and SkillScore are derived states, never written by commands.

**Events that update derived states**:
- `learning.lesson.completed` → Updates MasteryState and SkillScore (aggregates scores from lesson)
- `learning.submission.created` → Updates MasteryState (aggregates submission scores)
- `assessment.quiz.submitted` → Updates MasteryState and SkillScore (aggregates assessment scores)
- `mentoring.feedback.published` → Updates MasteryState (incorporates feedback rubric scores)
- `system.profile.updated` → Resets/Recomputes MasteryState and SkillScore (if targetLanguage changed)

---

--------------------------------------------------
### onboarding-service

**Owned Write States (Authoritative, persisted)**:

#### User

Represents identity and profile.

```typescript
interface User {
    userId: UserId;
    email: string; // Unique
    passwordHash: string; // Hashed password (never plain text)
    role: UserRole; // 'learner' | 'teacher' | 'mentor' | 'admin'
    firstName?: string;
    lastName?: string;
    createdAt: string; // ISO 8601 timestamp
    updatedAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

#### LearnerProfile

Extended profile for learners.

```typescript
interface LearnerProfile {
    userId: UserId; // Foreign key to User
    targetLanguage: LanguageCode; // 'de' | 'en'
    avatarUrl?: string;
    notificationPreferences?: {
        email?: boolean;
        push?: boolean;
        // ... other preferences
    };
    createdAt: string; // ISO 8601 timestamp
    updatedAt: string; // ISO 8601 timestamp
    version: number; // For optimistic locking
}
```

**Owned Ephemeral States (In-memory, session-based)**:

#### Session

Login session tracking (not persisted).

```typescript
interface Session {
    sessionId: string; // Internal session ID
    userId: UserId;
    deviceId?: string;
    token: string; // Authentication token (JWT or similar)
    expiresAt: string; // ISO 8601 timestamp
    createdAt: string; // ISO 8601 timestamp
}
```

**Owned Derived States (Computed from events)**:

None. onboarding-service owns only write states and ephemeral state.

**State Invariants (Bất biến / invariants)**:

**Ownership invariants**:
- onboarding-service MUST NOT mutate Enrollment (owned by curriculum-service)
- onboarding-service MUST NOT mutate ProgressState (owned by progress-service)
- onboarding-service MUST NOT mutate MasteryState (owned by motivation-progress-service)
- onboarding-service MUST NOT mutate Attempt (owned by practice-service)
- onboarding-service MUST NOT mutate Assessment (owned by assessment-service)
- onboarding-service MUST NOT initialize ProgressState, MasteryState, or ReadinessState from commands (initialized via event reactions)

**Domain invariants**:
- User.email must be unique and valid email format
- User.passwordHash must be hashed (never plain text)
- User.role must be valid UserRole enum value
- LearnerProfile.userId must reference an existing User with role 'learner'
- LearnerProfile.targetLanguage must be valid LanguageCode enum value
- Session.userId must reference an existing User
- Session.token must be valid authentication token
- Session.expiresAt must be in the future

**Idempotency invariants**:
- User creation is idempotent via correlationId or email (returns existing user if email matches)
- LearnerProfile creation is idempotent (returns existing profile if userId matches)
- Session creation is idempotent via correlationId (returns existing session if correlationId matches)

**Mutation Triggers (What updates this state)**:

**Commands that write it**:
- `system.user.register` → Creates User and LearnerProfile (if role is 'learner')
- `system.user.login` → Creates Session (ephemeral)
- `system.profile.modify` → Updates User and/or LearnerProfile

**Events that update derived states**:
- None (onboarding-service owns only write states and ephemeral state)

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - State models defined for all services  
**Related Documents**: 
- `docs/architecture/state-inventory.md` (State inventory - authoritative source)
- `docs/architecture/state-ownership-invariants.md` (Ownership invariants)
- `docs/architecture/learning-state-model.md` (Learning state model details)
- `docs/architecture/command-taxonomy.md` (STEP 4.1 - Command taxonomy)
- `docs/architecture/command-contracts.md` (STEP 4.2 - Command contracts)
