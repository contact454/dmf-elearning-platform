# Learning State Event Mapping
## Mapping Sự kiện sang Cập nhật Trạng thái

This document maps all 15 Domain Events to their effects on ProgressState, MasteryState, and ReadinessState. It defines which consumer services update which states and how.

---

## Overview (Tổng quan)

**Purpose**: Define how domain events trigger state updates in the learning state model.

**Principle**: Each event may affect one or more states. Consumer services react to events and update their owned states.

**States Affected**:
- **ProgressState** (owned by `progress-service`)
- **MasteryState** (owned by `motivation-progress-service`)
- **ReadinessState** (computed by `education/readiness-model`, cached by `assessment-service`)

---

## Event → State Update Mapping Table

| Event Name | State(s) Affected | Update Intent (Ý định cập nhật) | Consumer Service (Service nghe event) | Anti "Học Ảo" Notes |
|------------|-------------------|----------------------------------|--------------------------------------|---------------------|
| `learning.lesson.started` | None (read-only) | No state update | `analytics-service` (read-only) | Event logged for session tracking only. No state mutation. |
| `learning.lesson.completed` | **MasteryState**<br/>**ProgressState** | Increment mastery scores<br/>Unlock next lesson/unit if mastery threshold met | `motivation-progress-service` (updates MasteryState)<br/>`progress-service` (consumes event, queries curriculum-service for unlock eligibility, updates ProgressState) | **Critical**: MasteryState must be updated BEFORE ProgressState unlock check. progress-service queries curriculum-service (read-only) for unlock eligibility/prerequisites. Unlock requires mastery >= 0.7, not just completion. **Note**: Không dùng event trung gian 'unlock intent' để tránh bịa event ngoài catalog. |
| `learning.lesson.abandoned` | None (read-only) | No state update | `analytics-service` (read-only) | Event logged for abandonment tracking. No state mutation. |
| `learning.submission.created` | **MasteryState** (indirect) | May update skill scores if submission is evaluated | `assessment-service` (evaluates submission, may update SkillScore via API)<br/>`motivation-progress-service` (aggregates SkillScore into MasteryState) | Submission type (speaking/writing) must be included in payload. Only evaluated submissions affect mastery. |
| `assessment.quiz.started` | None (read-only) | No state update | `analytics-service` (read-only) | Event logged for quiz session tracking. No state mutation. |
| `assessment.quiz.submitted` | **MasteryState**<br/>**ReadinessState`<br/>**ProgressState** (if level exam) | Update skill scores from quiz results<br/>Recompute readiness if placement test<br/>Unlock units if level exam | `motivation-progress-service` (updates MasteryState from quiz score)<br/>`education/readiness-model` (recomputes ReadinessState)<br/>`curriculum-service` (unlocks units if level exam) | **Critical**: Quiz score must be included in payload. Readiness recomputation requires mastery + assessment results. |
| `assessment.level_test.completed` | **ReadinessState`<br/>**ProgressState`<br/>**MasteryState** (indirect) | Set initial CEFR level<br/>Unlock initial units up to determined level<br/>Initialize mastery baseline | `onboarding-service` (sets user's initial level in profile)<br/>`education/readiness-model` (computes initial ReadinessState)<br/>`curriculum-service` (unlocks units up to level)<br/>`motivation-progress-service` (initializes MasteryState baseline) | **Critical**: Initial level must be set from assessment results, not guessed. Unlocks must respect level boundaries. |
| `curriculum.unit.unlocked` | None (informational) | Event is informational - ProgressState already updated | `analytics-service` (read-only tracking)<br/>UI read models (read-only) | Event is emitted by progress-service AFTER ProgressState is updated. This is an informational event for analytics/UI. No state mutations occur on this event. |
| `curriculum.course.enrolled` | **ProgressState`<br/>**MasteryState** (initialize) | Initialize empty progress state<br/>Initialize empty mastery state | `progress-service` (initializes ProgressState)<br/>`motivation-progress-service` (initializes MasteryState) | Progress and Mastery states must be initialized empty (no unlocks, no scores). |
| `curriculum.srs_items.due` | None (read-only) | No state update | `practice-service` (suggests review activities)<br/>`analytics-service` (read-only) | Event logged for SRS engagement. No state mutation. SRS review affects mastery via `learning.lesson.completed` when review is completed. |
| `mentoring.feedback.requested` | None (read-only) | No state update | `ai/content-tagging` (analyzes submission)<br/>`analytics-service` (read-only) | Event logged for feedback request tracking. No state mutation. Feedback affects mastery when published. |
| `mentoring.feedback.published` | **MasteryState** (indirect) | May update speaking/writing mastery if feedback includes scores | `motivation-progress-service` (aggregates feedback scores into MasteryState) | **Critical**: Feedback author (AI/teacher/mentor) must be included in payload. Only scored feedback affects mastery. |
| `system.user.registered` | **ProgressState`<br/>**MasteryState`<br/>**ReadinessState** (initialize) | Initialize empty progress state<br/>Initialize empty mastery state<br/>Initialize empty readiness state | `progress-service` (initializes ProgressState)<br/>`motivation-progress-service` (initializes MasteryState)<br/>`education/readiness-model` (computes initial ReadinessState)<br/>`assessment-service` (caches ReadinessState) | All states initialized empty. No unlocks, no scores, no readiness until first assessment. |
| `system.user.login` | None (read-only) | No state update | `analytics-service` (read-only)<br/>`observability-service` (audit log) | Event logged for login tracking and audit. No state mutation. |
| `system.profile.updated` | **ProgressState`<br/>**MasteryState`<br/>**ReadinessState** (recompute ONLY if learningLanguage changed) | Reset/recompute states ONLY if learningLanguage changed<br/>Do NOT reset on UI language, avatar, notification changes | `progress-service` (resets ProgressState if learningLanguage changed)<br/>`motivation-progress-service` (resets MasteryState if learningLanguage changed)<br/>`education/readiness-model` (recomputes ReadinessState if learningLanguage changed)<br/>`assessment-service` (invalidates cached ReadinessState if learningLanguage changed) | **Critical**: Only reset/recompute if `profile.updated.learningLanguageChanged === true`. Do NOT reset on UI language, avatar, notification, or other profile changes. Anti-pattern: Không được reset state khi chỉ đổi UI/ngôn ngữ hiển thị. |

---

## Detailed Event Reactions (Phản ứng Chi tiết)

### Learning Domain Events

#### `learning.lesson.started`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Service**: `analytics-service` (read-only tracking)
- **Notes**: Event is logged for session tracking. No state mutation. Attempt state is created by practice-service (emitter), but this is not part of learning state model.

#### `learning.lesson.completed`
- **State(s) Affected**: 
  - **MasteryState** (owned by `motivation-progress-service`)
  - **ProgressState** (owned by `progress-service`)
- **Update Intent**: 
  1. Increment mastery scores (aggregate lesson score into skill scores)
  2. Unlock next lesson/unit if mastery threshold met (check MasteryState, update ProgressState)
- **Consumer Services**: 
  - `motivation-progress-service` → Updates MasteryState (aggregates lesson score into skill scores)
  - `progress-service` → Consumes `learning.lesson.completed` event, queries curriculum-service (read-only) for unlock eligibility/prerequisites, updates ProgressState if eligible
- **Anti "Học Ảo" Notes**: 
  - **Critical**: MasteryState must be updated BEFORE ProgressState unlock check
  - Unlock requires mastery >= 0.7, not just completion
  - Lesson score must be included in event payload (`score?: number`)
  - If score < 0.7, lesson is "completed" but not "mastered" → no unlock

#### `learning.lesson.abandoned`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Service**: `analytics-service` (read-only tracking)
- **Notes**: Event is logged for abandonment tracking. No state mutation. Attempt state is updated by practice-service (emitter), but this is not part of learning state model.

#### `learning.submission.created`
- **State(s) Affected**: **MasteryState** (indirect, via SkillScore)
- **Update Intent**: May update skill scores if submission is evaluated
- **Consumer Services**: 
  - `assessment-service` → Evaluates submission, may update SkillScore via API (if auto-evaluation enabled)
  - `motivation-progress-service` → Aggregates SkillScore into MasteryState
- **Anti "Học Ảo" Notes**: 
  - Submission type (speaking/writing) must be included in payload (`type: SubmissionType`)
  - Only evaluated submissions affect mastery (not all submissions are auto-evaluated)
  - Speaking/writing submissions require feedback for mastery calculation

---

### Assessment Domain Events

#### `assessment.quiz.started`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Service**: `analytics-service` (read-only tracking)
- **Notes**: Event is logged for quiz session tracking. No state mutation. Assessment state is created by assessment-service (emitter), but this is not part of learning state model.

#### `assessment.quiz.submitted`
- **State(s) Affected**: 
  - **MasteryState** (owned by `motivation-progress-service`)
  - **ReadinessState` (computed by `education/readiness-model`, cached by `assessment-service`)
  - **ProgressState** (owned by `progress-service`, if level exam)
- **Update Intent**: 
  1. Update skill scores from quiz results (aggregate quiz score into MasteryState)
  2. Recompute readiness if placement test (compute ReadinessState from MasteryState + assessment results)
  3. Unlock units if level exam (check MasteryState, update ProgressState)
- **Consumer Services**: 
  - `motivation-progress-service` → Updates MasteryState (aggregates quiz score into skill scores)
  - `education/readiness-model` → Recomputes ReadinessState (if placement test)
  - `assessment-service` → Caches computed ReadinessState
  - `progress-service` → Consumes `assessment.quiz.submitted` event (if level exam), queries curriculum-service (read-only) for unlock eligibility, updates ProgressState if eligible
- **Anti "Học Ảo" Notes**: 
  - **Critical**: Quiz score must be included in payload (`score: number`)
  - Readiness recomputation requires mastery + assessment results (not just assessment)
  - Level hint may be included in payload (`levelHint?: CEFRLevel`) for readiness calculation

#### `assessment.level_test.completed`
- **State(s) Affected**: 
  - **ReadinessState` (computed by `education/readiness-model`, cached by `assessment-service`)
  - **ProgressState` (owned by `progress-service`)
  - **MasteryState** (owned by `motivation-progress-service`, indirect - initialize baseline)
- **Update Intent**: 
  1. Set initial CEFR level (compute initial ReadinessState)
  2. Unlock initial units up to determined level (update ProgressState)
  3. Initialize mastery baseline (initialize MasteryState with assessment results)
- **Consumer Services**: 
  - `onboarding-service` → Sets user's initial level in profile (from ReadinessState)
  - `education/readiness-model` → Computes initial ReadinessState (from assessment results)
  - `assessment-service` → Caches computed ReadinessState
  - `progress-service` → Consumes `assessment.level_test.completed` event, queries curriculum-service (read-only) for initial unlock eligibility based on level, updates ProgressState
  - `motivation-progress-service` → Initializes MasteryState baseline (from assessment results)
- **Anti "Học Ảo" Notes**: 
  - **Critical**: Initial level must be set from assessment results, not guessed
  - Unlocks must respect level boundaries (e.g., A1 user cannot unlock B1 units)
  - Mastery baseline is initialized from assessment, not zero

---

### Curriculum Domain Events

#### `curriculum.unit.unlocked`
- **State(s) Affected**: None (informational - ProgressState already updated)
- **Update Intent**: Event is informational - no state mutations occur
- **Emitter**: `progress-service` (emits AFTER updating ProgressState)
- **Consumer Services**: 
  - `analytics-service` (read-only tracking)
  - UI read models (read-only, for real-time UI updates)
- **Notes**: Event is emitted by progress-service AFTER ProgressState is updated. This is an informational event for analytics and UI. No state mutations occur on this event. Consumers are read-only.

#### `curriculum.course.enrolled`
- **State(s) Affected**: 
  - **ProgressState` (owned by `progress-service`)
  - **MasteryState** (owned by `motivation-progress-service`)
- **Update Intent**: 
  1. Initialize empty progress state (no unlocks, no completions)
  2. Initialize empty mastery state (no scores)
- **Consumer Services**: 
  - `progress-service` → Initializes ProgressState (empty, no unlocks)
  - `motivation-progress-service` → Initializes MasteryState (empty, no scores)
- **Notes**: Progress and Mastery states must be initialized empty. No unlocks, no scores until learner completes lessons/assessments.

#### `curriculum.srs_items.due`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Services**: 
  - `practice-service` → Suggests review activities
  - `analytics-service` (read-only tracking)
- **Notes**: Event is logged for SRS engagement. No state mutation. SRS review affects mastery via `learning.lesson.completed` when review is completed.

---

### Mentoring Domain Events

#### `mentoring.feedback.requested`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Services**: 
  - `ai/content-tagging` → Analyzes submission for feedback generation
  - `analytics-service` (read-only tracking)
- **Notes**: Event is logged for feedback request tracking. No state mutation. Feedback affects mastery when published.

#### `mentoring.feedback.published`
- **State(s) Affected**: **MasteryState** (indirect, via SkillScore)
- **Update Intent**: May update speaking/writing mastery if feedback includes scores
- **Consumer Service**: `motivation-progress-service` → Aggregates feedback scores into MasteryState
- **Anti "Học Ảo" Notes**: 
  - **Critical**: Feedback author (AI/teacher/mentor) must be included in payload (`author: FeedbackAuthor`)
  - Only scored feedback affects mastery (not all feedback includes scores)
  - Speaking/writing feedback scores are weighted differently (human feedback > AI feedback)

---

### System Domain Events

#### `system.user.registered`
- **State(s) Affected**: 
  - **ProgressState` (owned by `progress-service`)
  - **MasteryState` (owned by `motivation-progress-service`)
  - **ReadinessState` (computed by `education/readiness-model`, cached by `assessment-service`)
- **Update Intent**: 
  1. Initialize empty progress state (no unlocks, no completions)
  2. Initialize empty mastery state (no scores)
  3. Initialize empty readiness state (no level, not ready)
- **Consumer Services**: 
  - `progress-service` → Initializes ProgressState (empty)
  - `motivation-progress-service` → Initializes MasteryState (empty)
  - `education/readiness-model` → Computes initial ReadinessState (empty, no level)
  - `assessment-service` → Caches computed ReadinessState
- **Notes**: All states initialized empty. No unlocks, no scores, no readiness until first assessment (placement test or level test).

#### `system.user.login`
- **State(s) Affected**: None (read-only)
- **Update Intent**: No state update
- **Consumer Services**: 
  - `analytics-service` (read-only tracking)
  - `observability-service` (audit log)
- **Notes**: Event is logged for login tracking and audit. No state mutation.

#### `system.profile.updated`
- **State(s) Affected**: 
  - **ProgressState` (owned by `progress-service`, reset ONLY if learningLanguage changed)
  - **MasteryState` (owned by `motivation-progress-service`, reset ONLY if learningLanguage changed)
  - **ReadinessState` (computed by `education/readiness-model`, cached by `assessment-service`, recompute ONLY if learningLanguage changed)
- **Update Intent**: 
  1. Reset/recompute states ONLY if `profile.updated.learningLanguageChanged === true`
  2. Do NOT reset on UI language, avatar, notification, or other profile changes
- **Consumer Services**: 
  - `progress-service` → Resets ProgressState (ONLY if learningLanguage changed)
  - `motivation-progress-service` → Resets MasteryState (ONLY if learningLanguage changed)
  - `education/readiness-model` → Recomputes ReadinessState (ONLY if learningLanguage changed)
  - `assessment-service` → Invalidates cached ReadinessState (ONLY if learningLanguage changed)
- **Anti-pattern Warning**: 
  - ❌ Do NOT reset states when UI language changes (e.g., English UI → Vietnamese UI)
  - ❌ Do NOT reset states when avatar, notification preferences, or other profile fields change
  - ✅ ONLY reset states when learning language changes (e.g., learning German → learning French)
  - **Vietnamese**: Không được reset state khi chỉ đổi UI/ngôn ngữ hiển thị
- **Notes**: If learning language changes, all states must be reset/recomputed for new language. Old language progress/mastery/readiness is not transferable. Other profile changes (UI language, avatar, etc.) do NOT affect learning states.

---

## State Update Order (Thứ tự Cập nhật State)

### Critical Ordering Rules (Quy tắc Thứ tự Quan trọng)

1. **MasteryState BEFORE ProgressState**:
   - When `learning.lesson.completed` is emitted:
     1. `motivation-progress-service` updates MasteryState FIRST
     2. `progress-service` consumes event, queries curriculum-service (read-only) for unlock eligibility/prerequisites, then updates ProgressState
   - Why: Unlock decision requires mastery score. Mastery must be computed before unlock check. progress-service queries curriculum-service (rules engine) for unlock eligibility, then updates ProgressState.

2. **MasteryState + Assessment BEFORE ReadinessState**:
   - When `assessment.quiz.submitted` is emitted:
     1. `motivation-progress-service` updates MasteryState FIRST
     2. `education/readiness-model` reads MasteryState + Assessment results, then computes ReadinessState
   - Why: Readiness computation requires both mastery and assessment results.

3. **ReadinessState BEFORE ProgressState (for level tests)**:
   - When `assessment.level_test.completed` is emitted:
     1. `education/readiness-model` computes ReadinessState FIRST
     2. `curriculum-service` reads ReadinessState (currentLevel), then updates ProgressState
   - Why: Unlock boundaries depend on CEFR level. Level must be determined before unlocks.

### Update Flow Example (Ví dụ Luồng Cập nhật)

**Scenario**: Learner completes a lesson with score 0.8 (80%)

1. `practice-service` emits `learning.lesson.completed` event
2. `motivation-progress-service` reacts:
   - Reads event payload (lessonId, attemptId, score: 0.8)
   - Updates MasteryState: aggregates score 0.8 into skill scores
   - MasteryState.lessonMastery[lessonId].overallScore = 0.8
3. `progress-service` reacts:
   - Consumes `learning.lesson.completed` event
   - Queries curriculum-service (read-only) for unlock eligibility (checks MasteryState, threshold >= 0.7)
   - Checks unlock threshold: 0.8 >= 0.7 ✅ (threshold met)
   - Updates ProgressState: unlocks next lesson
   - Emits `curriculum.unit.unlocked` event (informational, after ProgressState updated)

---

## Anti "Học Ảo" Measurement Matrix (Ma trận Đo lường Chống Học Ảo)

| Event | Outcome Signal (Tín hiệu Kết quả) | Mastery Signal (Tín hiệu Độ vững) | Readiness Signal (Tín hiệu Sẵn sàng) |
|-------|-----------------------------------|-----------------------------------|--------------------------------------|
| `learning.lesson.completed` | ✅ `status: 'completed'`<br/>✅ `score?: number` | ✅ Score aggregated into MasteryState<br/>✅ Unlock requires mastery >= 0.7 | ❌ Not directly (readiness requires assessment) |
| `learning.submission.created` | ✅ `type: SubmissionType`<br/>✅ `activityId`, `lessonId` | ✅ Only evaluated submissions affect mastery<br/>✅ Speaking/writing require feedback | ❌ Not directly |
| `assessment.quiz.submitted` | ✅ `score: number` (required)<br/>✅ `levelHint?: CEFRLevel` | ✅ Score aggregated into MasteryState | ✅ Readiness recomputed from mastery + assessment |
| `assessment.level_test.completed` | ✅ `finalGrade?: number` | ✅ Baseline initialized from assessment | ✅ Initial ReadinessState computed |
| `mentoring.feedback.published` | ✅ `author: FeedbackAuthor`<br/>✅ `targetAttemptId?` | ✅ Only scored feedback affects mastery<br/>✅ Human feedback weighted higher | ❌ Not directly |

---

## Verification Checklist (Danh sách Kiểm tra)

Before implementing event consumers, verify:
- [ ] Consumer service owns the state it wants to mutate
- [ ] Consumer does not mutate foreign state directly
- [ ] State update order is correct (MasteryState before ProgressState, etc.)
- [ ] Anti "học ảo" signals are included in event payloads
- [ ] Readiness computation requires both mastery and assessment results
- [ ] Unlock decisions require mastery thresholds (not just completion)

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - All 15 events mapped to state updates
