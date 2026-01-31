# Domain Events Payload Specification
## Spec Payload Sự kiện Hệ thống

This document defines the **semantics-frozen** payload specifications for all Domain Events in the DMF E-Learning Platform. Event payloads are contracts for measurement and must support anti "học ảo" (anti-hallucination) tracking.

---

## 1. Overview / Tổng quan

### Purpose

Event payloads serve as **measurement contracts** between services. They enable:
- **Outcome tracking**: Measure real learning progress (mastery, readiness)
- **Action traceability**: Link events to specific lessons, attempts, submissions
- **Anti "học ảo"**: Distinguish between activity (clicks) and achievement (mastery)

### Semantics Freeze

**Status**: 🧊 **SEMANTICS FROZEN** (as of 2024-12-19)

Event payload semantics are **locked**. This means:
- Field names and types are stable
- Field meanings (semantics) are documented and must not change without explicit approval
- Breaking changes require: schema update → shared types → documentation → coordinated release

---

## 2. Field Conventions / Quy ước Field

### Naming

- **camelCase** for all payload fields (`lessonId`, `attemptId`, `submissionId`)
- Use **@dmf/shared** ID types (`LessonId`, `AttemptId`, `UserId`, etc.)
- Use **@dmf/shared** enums (`AttemptStatus`, `SubmissionType`, `FeedbackAuthor`, etc.)

### Types

- **IDs**: Always use typed aliases from `@dmf/shared/src/ids`
- **Enums**: Use enums from `@dmf/shared/src/enums` (not string literals)
- **Numbers**: Use `number` with comments for ranges (e.g., `// 0-100`)
- **Strings**: Use string literal unions for constrained values (e.g., `'mastery' | 'assessment'`)

### Privacy & Size

- **DO NOT** include large text blobs (user answers, feedback text) unless explicitly needed
- **DO NOT** include PII beyond what's in the envelope (`user_id`)
- **DO** include IDs that allow fetching full data when needed

---

## 3. Event Payload Specifications / Spec Payload từng Event

### Learning Domain

#### `learning.lesson.started`

**Purpose**: Track when a user begins a lesson session.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `lessonId` | `LessonId` | ✅ | Lesson being started |
| `attemptId` | `AttemptId` | ✅ | Attempt session ID |

**Anti "học ảo" Signal**: Action trace (user started lesson X, attempt Y)

**Notes**: Minimal payload - outcome measured in `lesson.completed` event.

---

#### `learning.lesson.completed`

**Purpose**: Measure lesson completion outcome (pass/fail, score).

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `lessonId` | `LessonId` | ✅ | Lesson that was completed |
| `attemptId` | `AttemptId` | ✅ | Attempt session ID |
| `status` | `AttemptStatus` | ✅ | Completion status ('completed' or 'abandoned') |
| `score` | `number` | ❌ | Score 0-100 (optional, for mastery tracking) |

**Anti "học ảo" Signal**: 
- ✅ Outcome signal: `status` indicates completion vs abandonment
- ✅ Mastery signal: `score` (when present) indicates performance level
- ✅ Action trace: Links to specific lesson and attempt

**Notes**: 
- `status` is required to distinguish completion from abandonment
- `score` is optional but recommended for mastery tracking
- Future: May add `masteryDelta` (change in mastery level) if needed

---

#### `learning.lesson.abandoned`

**Purpose**: Track when a user quits a lesson mid-session.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `lessonId` | `LessonId` | ✅ | Lesson that was abandoned |
| `attemptId` | `AttemptId` | ✅ | Attempt session ID |

**Anti "học ảo" Signal**: Action trace (user abandoned lesson X, attempt Y)

**Notes**: Minimal payload - abandonment is a negative signal for engagement.

---

#### `learning.submission.created`

**Purpose**: Track individual answer submissions within a lesson.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `submissionId` | `SubmissionId` | ✅ | Unique submission ID |
| `attemptId` | `AttemptId` | ✅ | Attempt session ID |
| `activityId` | `ActivityId` | ✅ | Activity being answered |
| `lessonId` | `LessonId` | ✅ | Lesson containing the activity |
| `type` | `SubmissionType` | ✅ | Type of submission ('speaking' or 'writing') |

**Anti "học ảo" Signal**:
- ✅ Action trace: Links submission to activity, attempt, lesson
- ✅ Type signal: `type` distinguishes speaking vs writing (different skill measurement)

**Notes**: 
- `type` is required to measure different skills (speaking vs writing)
- Full submission data (answer text/audio) is stored separately, not in event

---

### Assessment Domain

#### `assessment.quiz.started`

**Purpose**: Track when a user begins a quiz.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `assessmentId` | `AssessmentId` | ✅ | Assessment/quiz ID |
| `attemptId` | `AttemptId` | ❌ | Attempt session ID (if applicable) |

**Anti "học ảo" Signal**: Action trace (user started quiz X)

**Notes**: Minimal payload - outcome measured in `quiz.submitted` event.

---

#### `assessment.quiz.submitted`

**Purpose**: Measure quiz submission outcome (score, level hint).

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `assessmentId` | `AssessmentId` | ✅ | Assessment/quiz ID |
| `attemptId` | `AttemptId` | ❌ | Attempt session ID (if applicable) |
| `score` | `number` | ✅ | Score 0-100 (required for anti "học ảo") |
| `levelHint` | `CEFRLevel` | ❌ | Inferred CEFR level from assessment |

**Anti "học ảo" Signal**:
- ✅ Outcome signal: `score` indicates performance
- ✅ Level signal: `levelHint` (when present) indicates readiness level

**Notes**: 
- `score` is required to measure actual performance (not just completion)
- `levelHint` is optional but useful for readiness tracking

---

#### `assessment.level_test.completed`

**Purpose**: Track completion of a formal level test (placement, level exam).

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `assessmentId` | `AssessmentId` | ✅ | Assessment/test ID |
| `attemptId` | `AttemptId` | ❌ | Attempt session ID (if applicable) |
| `finalGrade` | `number` | ❌ | Final grade 0-100 |

**Anti "học ảo" Signal**: Outcome signal (`finalGrade` when present)

**Notes**: 
- Used for placement tests and level exams
- `finalGrade` is optional but recommended for formal assessments

---

### Curriculum Domain

#### `curriculum.unit.unlocked`

**Purpose**: Track when a unit becomes available to a user.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `unitId` | `UnitId` | ✅ | Unit that was unlocked |
| `courseId` | `CourseId` | ✅ | Course containing the unit |
| `reason` | `'mastery' \| 'assessment' \| 'manual' \| 'srs'` | ✅ | Reason for unlock (required for anti "học ảo") |

**Anti "học ảo" Signal**:
- ✅ Outcome signal: `reason` distinguishes achievement-based unlocks from manual/admin unlocks
- ✅ Action trace: Links to specific unit and course

**Reason Values**:
- `'mastery'`: Unlocked due to lesson mastery (real progress)
- `'assessment'`: Unlocked due to assessment performance
- `'manual'`: Unlocked by admin/teacher (not achievement-based)
- `'srs'`: Unlocked due to spaced repetition completion

**Notes**: 
- `reason` is critical to distinguish real progress from manual unlocks
- Future: May add `unlockedBy` (UserId) for manual unlocks

---

#### `curriculum.course.enrolled`

**Purpose**: Track when a user enrolls in a course.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `enrollmentId` | `EnrollmentId` | ✅ | Enrollment record ID |
| `courseId` | `CourseId` | ✅ | Course enrolled in |

**Anti "học ảo" Signal**: Action trace (user enrolled in course X)

**Notes**: Minimal payload - enrollment is a prerequisite, not an outcome.

---

#### `curriculum.srs_items.due`

**Purpose**: Track when SRS (Spaced Repetition System) items become due for review.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `itemIds` | `SRSItemId[]` | ✅ | Array of SRS item IDs due |
| `count` | `number` | ✅ | Count of items due |

**Anti "học ảo" Signal**: Action trace (SRS items due for review)

**Notes**: 
- Used to trigger review notifications
- `count` is redundant but useful for quick filtering

---

### Mentoring Domain

#### `mentoring.feedback.requested`

**Purpose**: Track when feedback is requested for a submission.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `submissionId` | `SubmissionId` | ✅ | Submission requesting feedback for |

**Anti "học ảo" Signal**: Action trace (feedback requested for submission X)

**Notes**: Minimal payload - outcome measured in `feedback.published` event.

---

#### `mentoring.feedback.published`

**Purpose**: Track when feedback is published (by AI, teacher, or mentor).

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `feedbackId` | `FeedbackId` | ✅ | Feedback record ID |
| `submissionId` | `SubmissionId` | ✅ | Submission receiving feedback |
| `author` | `FeedbackAuthor` | ✅ | Author type ('ai', 'teacher', 'mentor') - required for anti "học ảo" |
| `targetAttemptId` | `AttemptId` | ❌ | Attempt ID if feedback targets attempt-level work |

**Anti "học ảo" Signal**:
- ✅ Outcome signal: `author` distinguishes AI vs human feedback (quality signal)
- ✅ Action trace: Links to submission and optionally attempt

**Notes**: 
- `author` is required to measure feedback quality (human feedback is higher value)
- `targetAttemptId` is optional for attempt-level feedback

---

### System Domain

#### `system.user.registered`

**Purpose**: Track new user registration.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `UserId` | ✅ | New user ID |
| `targetLanguage` | `LanguageCode` | ❌ | Target learning language |

**Anti "học ảo" Signal**: Action trace (user registered, target language X)

**Notes**: Minimal payload - registration is a prerequisite, not an outcome.

---

#### `system.user.login`

**Purpose**: Track user login events.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `UserId` | ✅ | User ID |

**Anti "học ảo" Signal**: Action trace (user logged in)

**Notes**: 
- Minimal payload by design (privacy, performance)
- Additional context (device, IP) in envelope `context` field

---

#### `system.profile.updated`

**Purpose**: Track when user profile is updated.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `UserId` | ✅ | User ID |

**Anti "học ảo" Signal**: Action trace (user updated profile)

**Notes**: Minimal payload - full profile data stored separately.

---

## 4. Semantics Freeze Policy / Chính sách Khóa Nghĩa

### Change Workflow

Any payload change must follow this sequence:

1. **Update Contract**: Update `contracts/events/events.schema.json` first
2. **Update Types**: Update `packages/shared/src/events/*.ts` to match
3. **Update Docs**: Update this spec document
4. **Coordinate Release**: Coordinate with all event consumers

### Breaking vs Non-Breaking Changes

**Breaking Changes** (require version bump):
- Removing a required field
- Changing a field type (e.g., `string` → `number`)
- Renaming a field
- Making a required field optional (if consumers depend on it)

**Non-Breaking Changes** (additive):
- Adding a new optional field
- Adding a new event (doesn't affect existing events)

### Adding New Fields

**Process**:
1. Add as **optional** first (`field?: Type`)
2. Update this spec document
3. Deploy and monitor
4. Later, make required if needed (with version bump)

**Example**:
```typescript
// Step 1: Add optional
export interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
    status: AttemptStatus;
    score?: number;
    masteryDelta?: number; // NEW: optional first
}

// Step 2: Later, make required (with version)
export interface LessonCompletedPayload {
    // ... existing fields ...
    masteryDelta: number; // Now required
    version?: '2.0'; // Version bump
}
```

---

## 5. Anti "Học Ảo" Measurement Matrix

| Event | Outcome Signal | Action Trace | Mastery Signal | Quality Signal |
|-------|----------------|--------------|----------------|----------------|
| `learning.lesson.completed` | ✅ `status` | ✅ `lessonId`, `attemptId` | ✅ `score?` | - |
| `learning.submission.created` | - | ✅ `submissionId`, `activityId` | ✅ `type` | - |
| `assessment.quiz.submitted` | ✅ `score` | ✅ `assessmentId` | ✅ `levelHint?` | - |
| `curriculum.unit.unlocked` | ✅ `reason` | ✅ `unitId`, `courseId` | - | ✅ `reason` |
| `mentoring.feedback.published` | ✅ `author` | ✅ `feedbackId`, `submissionId` | - | ✅ `author` |

**Legend**:
- **Outcome Signal**: Indicates completion/result (not just activity)
- **Action Trace**: Links to specific domain objects (lesson, attempt, etc.)
- **Mastery Signal**: Indicates skill level/performance
- **Quality Signal**: Distinguishes high-value vs low-value events

---

## 6. Verification Checklist

Before emitting an event, verify:

- [ ] All required fields are present
- [ ] Field types match this spec (use `@dmf/shared` types)
- [ ] Field names use camelCase
- [ ] Anti "học ảo" signals are included (where required)
- [ ] No large text blobs in payload
- [ ] No PII beyond envelope `user_id`
- [ ] Event name matches `contracts/events/events.catalog.md`

---

## 7. Summary / Tóm tắt

**Total Events**: 15  
**Domains**: 5 (Learning, Assessment, Curriculum, Mentoring, System)  
**Status**: 🧊 **SEMANTICS FROZEN**

**Recent Changes** (2024-12-19):
- Added `type` to `learning.submission.created` (required for skill measurement)
- Added `score` to `assessment.quiz.submitted` (required for anti "học ảo")
- Added `reason` to `curriculum.unit.unlocked` (required to distinguish achievement vs manual)
- Added `author` to `mentoring.feedback.published` (required for quality measurement)

**Next Review**: When new measurement requirements emerge (not on schedule)

---

**Last Updated**: 2024-12-19  
**Status**: 🧊 **SEMANTICS FROZEN** - Payload meanings are locked and documented
