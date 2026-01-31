# Learning State Model
## Mô hình Trạng thái Học tập

This document defines the canonical learning state for DMF Hybrid language learning platform. It describes three core state objects: Progress (tiến độ), Mastery (độ vững), and Readiness (sẵn sàng).

---

## Overview (Tổng quan)

**Purpose**: Define how learning progress, skill mastery, and readiness are measured and stored in the DMF platform.

**Principle**: State must support anti "học ảo" (anti-hallucination) measurement - completion without mastery should not pass readiness gates.

**Implementation Approach**: Rule-based first (no ML in MVP). States are computed from domain events and stored by owning services.

---

## 1. ProgressState (Trạng thái Tiến độ)

### What it Measures (Đo gì)
ProgressState tracks **where the learner is in the curriculum** (học tới đâu trong lộ trình). It answers:
- Which units/lessons are unlocked (đơn vị/bài nào đã mở khóa)
- Which units/lessons are completed (đơn vị/bài nào đã hoàn thành)
- Current position in the learning path (vị trí hiện tại trong lộ trình)

### Key Fields (Các trường chính)

Using `@dmf/shared` types:

```typescript
interface ProgressState {
    userId: UserId;
    courseId: CourseId;
    enrollmentId: EnrollmentId;
    
    // Unlocked content (nội dung đã mở khóa)
    unlockedUnitIds: UnitId[];      // Units available to learner
    unlockedLessonIds: LessonId[];   // Lessons available to learner
    
    // Completed content (nội dung đã hoàn thành)
    completedUnitIds: UnitId[];      // Units fully completed
    completedLessonIds: LessonId[];  // Lessons fully completed
    
    // Current position (vị trí hiện tại)
    currentUnitId?: UnitId;          // Currently active unit
    currentLessonId?: LessonId;      // Currently active lesson
    
    // Metadata (siêu dữ liệu)
    lastUpdatedAt: string;           // ISO 8601 timestamp
    version: number;                 // For optimistic locking
}
```

### Ownership (Quyền sở hữu dữ liệu)

- **Owner Service**: `progress-service`
- **Who can READ**: 
  - `curriculum-service` (read-only, checks unlock rules)
  - `practice-service` (check if lesson is unlocked)
  - `onboarding-service` (display user progress)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `progress-service` ONLY

**Why**: Progress is learner state (trạng thái người học), not curriculum rules (luật học). curriculum-service is a rules engine (luật học) that provides unlock eligibility checks (read-only API). progress-service consumes learning events, queries curriculum-service for unlock eligibility, then updates ProgressState. This separation prevents mixing curriculum logic with learner state.

**Note**: Không dùng event trung gian 'unlock intent' để tránh bịa event ngoài catalog. progress-service consumes learning events directly (e.g., `learning.lesson.completed`), queries curriculum-service (read-only) for unlock eligibility/prerequisites, then updates ProgressState.

### Read Model (Mô hình đọc)

Other services read ProgressState via:
- Direct read API from progress-service (for real-time checks)
- Event reactions (progress-service consumes learning events, queries curriculum-service for unlock eligibility, then updates ProgressState)

### Example Snapshot (Ví dụ trạng thái)

```json
{
  "userId": "user-123",
  "courseId": "course-de-a1",
  "enrollmentId": "enrollment-456",
  "unlockedUnitIds": ["unit-1", "unit-2", "unit-3"],
  "unlockedLessonIds": ["lesson-1-1", "lesson-1-2", "lesson-2-1"],
  "completedUnitIds": ["unit-1"],
  "completedLessonIds": ["lesson-1-1", "lesson-1-2"],
  "currentUnitId": "unit-2",
  "currentLessonId": "lesson-2-1",
  "lastUpdatedAt": "2024-12-19T10:30:00Z",
  "version": 5
}
```

---

## 2. MasteryState (Trạng thái Độ vững)

### What it Measures (Đo gì)
MasteryState tracks **how well the learner knows each skill** (học có chắc hay chỉ hoàn thành). It answers:
- Per-skill proficiency (độ thành thạo theo kỹ năng: nghe/đọc/nói/viết)
- Per-lesson/unit mastery (độ vững theo bài/đơn vị)
- Mastery trends over time (xu hướng độ vững theo thời gian)

**Critical for Anti "Học Ảo"**: Completion without mastery should NOT pass readiness gates. MasteryState ensures learners cannot progress by "clicking through" without demonstrating understanding.

### Key Fields (Các trường chính)

Using `@dmf/shared` types:

```typescript
interface MasteryState {
    userId: UserId;
    
    // Per-skill mastery (độ vững theo kỹ năng)
    skillScores: {
        skill: SkillType;           // listening, reading, speaking, writing
        scoreVal: number;           // 0.0 to 1.0 (normalized)
        lastUpdatedAt: string;      // ISO 8601
    }[];
    
    // Per-lesson mastery (độ vững theo bài)
    lessonMastery: {
        lessonId: LessonId;
        skillBreakdown: {
            skill: SkillType;
            scoreVal: number;        // 0.0 to 1.0
        }[];
        overallScore: number;        // 0.0 to 1.0 (weighted average)
        lastUpdatedAt: string;       // ISO 8601
    }[];
    
    // Per-unit mastery (độ vững theo đơn vị)
    // NOTE: In MVP, unitMastery MAY be derived from lessonMastery, not necessarily persisted
    // Lưu ý: Trong MVP, unitMastery có thể được tính từ lessonMastery, không nhất thiết lưu trữ
    unitMastery?: {
        unitId: UnitId;
        skillBreakdown: {
            skill: SkillType;
            scoreVal: number;        // 0.0 to 1.0
        }[];
        overallScore: number;       // 0.0 to 1.0 (weighted average)
        lastUpdatedAt: string;      // ISO 8601
    }[];
    
    // Metadata (siêu dữ liệu)
    lastCalculatedAt: string;       // ISO 8601
    version: number;                // For optimistic locking
}
```

### Ownership (Quyền sở hữu dữ liệu)

- **Owner Service**: `motivation-progress-service`
- **Who can READ**: 
  - `curriculum-service` (check mastery for unlocks)
  - `onboarding-service` (display skill levels)
  - `assessment-service` (read for readiness calculation)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `motivation-progress-service` ONLY

**Why**: Mastery calculation is progress/motivation logic. motivation-progress-service aggregates scores from lessons, assessments, and feedback to compute mastery.

**MVP Note**: In MVP, `skillScores` and `lessonMastery` are core (required). `unitMastery` is DERIVED and OPTIONAL - it can be computed on-demand from `lessonMastery` to reduce storage and improve scalability. Persist `unitMastery` only if query performance requires it.

**Lưu ý MVP**: Trong MVP, `skillScores` và `lessonMastery` là cốt lõi (bắt buộc). `unitMastery` là TÍNH TOÁN và TÙY CHỌN - có thể tính từ `lessonMastery` khi cần để giảm lưu trữ và cải thiện khả năng mở rộng. Chỉ lưu `unitMastery` nếu hiệu suất truy vấn yêu cầu.

### Read Model (Mô hình đọc)

Other services read MasteryState via:
- Direct read API from motivation-progress-service (for real-time checks)
- Event reactions (motivation-progress-service updates MasteryState after `learning.lesson.completed` or `assessment.quiz.submitted`)

### Anti "Học Ảo" Rules (Quy tắc chống học ảo)

1. **Mastery Thresholds (Ngưỡng độ vững)**:
   - Lesson completion requires `overallScore >= 0.7` (70%) to count as "mastered"
   - Unit completion requires all lessons in unit to be mastered
   - Readiness gates require mastery, not just completion

2. **Skill Balance (Cân bằng kỹ năng)**:
   - All 4 skills (listening, reading, speaking, writing) must be above threshold
   - Weak skills (score < 0.6) are blockers for readiness

3. **Time Decay (Suy giảm theo thời gian)**:
   - Mastery scores decay if not practiced (SRS review required)
   - Decay rate depends on skill type (speaking/writing decay faster than reading/listening)

### Example Snapshot (Ví dụ trạng thái)

```json
{
  "userId": "user-123",
  "skillScores": [
    {
      "skill": "listening",
      "scoreVal": 0.75,
      "lastUpdatedAt": "2024-12-19T10:00:00Z"
    },
    {
      "skill": "reading",
      "scoreVal": 0.80,
      "lastUpdatedAt": "2024-12-19T09:30:00Z"
    },
    {
      "skill": "speaking",
      "scoreVal": 0.65,
      "lastUpdatedAt": "2024-12-19T08:00:00Z"
    },
    {
      "skill": "writing",
      "scoreVal": 0.70,
      "lastUpdatedAt": "2024-12-19T07:00:00Z"
    }
  ],
  "lessonMastery": [
    {
      "lessonId": "lesson-1-1",
      "skillBreakdown": [
        { "skill": "listening", "scoreVal": 0.80 },
        { "skill": "reading", "scoreVal": 0.75 },
        { "skill": "speaking", "scoreVal": 0.70 },
        { "skill": "writing", "scoreVal": 0.65 }
      ],
      "overallScore": 0.725,
      "lastUpdatedAt": "2024-12-19T10:00:00Z"
    }
  ],
  "unitMastery": [
    {
      "unitId": "unit-1",
      "skillBreakdown": [
        { "skill": "listening", "scoreVal": 0.75 },
        { "skill": "reading", "scoreVal": 0.80 },
        { "skill": "speaking", "scoreVal": 0.65 },
        { "skill": "writing", "scoreVal": 0.70 }
      ],
      "overallScore": 0.725,
      "lastUpdatedAt": "2024-12-19T10:00:00Z"
    }
  ],
  "lastCalculatedAt": "2024-12-19T10:00:00Z",
  "version": 3
}
```

---

## 3. ReadinessState (Trạng thái Sẵn sàng)

### What it Measures (Đo gì)
ReadinessState tracks **whether the learner is ready for the next level** (đủ điều kiện thi / lên level / tư vấn du học). It answers:
- Current CEFR level (mức CEFR hiện tại)
- Readiness for next level (sẵn sàng lên level tiếp theo)
- Blockers preventing progress (cản trở tiến bộ)
- Confidence score (điểm tin cậy)

**DMF Context**: Readiness supports both exam readiness (thi) and pathway readiness (du học tư vấn).

### Key Fields (Các trường chính)

Using `@dmf/shared` types:

```typescript
interface ReadinessState {
    userId: UserId;
    
    // Current level (mức hiện tại)
    currentLevel: string;            // CEFR level (e.g., "A1", "A2", "B1")
    
    // Readiness status (trạng thái sẵn sàng)
    isReadyForNext: boolean;         // Ready to advance to next level
    targetLevel?: string;            // Target CEFR level (if different from next)
    
    // Blockers (cản trở)
    blockers?: string[];             // List of weak skills blocking progress
                                     // e.g., ["speaking < 0.6", "writing < 0.6"]
    
    // Confidence (tin cậy)
    confidence: number;              // 0.0 to 1.0 (how confident we are in readiness)
    
    // Assessment metadata (siêu dữ liệu đánh giá)
    lastAssessedAt: string;          // ISO 8601 (last readiness assessment)
    assessmentId?: AssessmentId;     // Last assessment used for readiness
    
    // Metadata (siêu dữ liệu)
    version: number;                 // For optimistic locking
}
```

### Ownership (Quyền sở hữu dữ liệu)

- **Computation Logic**: `education/readiness-model` (pure, stateless)
- **Cached Storage**: `assessment-service` or `onboarding-service` (caches computed results)
- **Who can READ**: 
  - `onboarding-service` (display readiness status)
  - `curriculum-service` (check if ready for next level)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `education/readiness-model` computes ReadinessState (pure function, no storage)
  - `assessment-service` or `onboarding-service` caches computed results (with version field for optimistic locking)

**Why**: Readiness is computed from pedagogy rules (CEFR alignment, skill thresholds). Computation logic is pure and stateless (no database, no service dependencies). Computed results are cached by services for performance. The `version` field is valid for cached snapshots, not for computation logic.

**Lưu ý**: Readiness được tính toán (computed), sau đó lưu tạm (cached) để dùng lại. Logic tính toán là thuần túy (pure), không lưu trữ. Kết quả tính toán được cache bởi service với version field để khóa lạc quan.

### Lifecycle (Vòng đời)

1. **Compute** (Tính toán): `education/readiness-model` computes ReadinessState from MasteryState + Assessment results (pure function, no side effects)
2. **Cache** (Lưu tạm): `assessment-service` or `onboarding-service` caches computed result (with version field)
3. **Invalidate** (Vô hiệu hóa): Cache is invalidated when new events occur (e.g., `assessment.quiz.submitted`, `learning.lesson.completed` with high score)
4. **Recompute** (Tính lại): On cache miss or invalidation, `education/readiness-model` recomputes ReadinessState

**Note**: ReadinessState may be cached by `onboarding-service` or `assessment-service` for performance, but computation logic lives in `education/readiness-model`.

### Read Model (Mô hình đọc)

Other services read ReadinessState via:
- Direct read API from assessment-service (cached) or education/readiness-model (computed)
- Event reactions (readiness recomputed after `assessment.quiz.submitted` or `assessment.level_test.completed`)

### Example Snapshot (Ví dụ trạng thái)

```json
{
  "userId": "user-123",
  "currentLevel": "A1",
  "isReadyForNext": false,
  "targetLevel": "A2",
  "blockers": [
    "speaking < 0.6 (current: 0.65)",
    "writing < 0.6 (current: 0.70)"
  ],
  "confidence": 0.75,
  "lastAssessedAt": "2024-12-19T10:00:00Z",
  "assessmentId": "assessment-789",
  "version": 2
}
```

---

## Single Writer per State (Mỗi state chỉ 1 service được ghi)

### Principle (Nguyên tắc)

Each state entity has **ONE owner service** that has exclusive WRITE access. Other services can READ or REACT via events, but cannot directly mutate foreign state.

### Proposed Owners (Chủ sở hữu đề xuất)

| State | Owner Service | Reason (Lý do) |
|-------|---------------|----------------|
| **ProgressState** | `progress-service` | Progress is learner state (trạng thái người học), not curriculum rules (luật học). curriculum-service is a rules engine (read-only API for unlock eligibility). progress-service consumes learning events, queries curriculum-service, then updates ProgressState. |
| **MasteryState** | `motivation-progress-service` | Mastery calculation aggregates scores from lessons, assessments, and feedback. This is progress/motivation logic, not curriculum logic. |
| **ReadinessState** | `education/readiness-model` (computed) + `assessment-service` (cached) | Readiness is computed from pedagogy rules (CEFR alignment, skill thresholds). Education layer owns the computation logic (stateless, pure). Computed results are cached by assessment-service with version field for optimistic locking. |

### Why This Separation (Tại sao tách biệt)

1. **ProgressState (progress-service)**:
   - Progress-service owns learner progress state (trạng thái tiến độ người học)
   - Curriculum-service is a rules engine (luật học) that provides unlock eligibility checks (read-only API)
   - Progress-service consumes learning events (e.g., `learning.lesson.completed`), queries curriculum-service for unlock eligibility/prerequisites, then updates ProgressState
   - This separation prevents mixing curriculum rules (luật học) with learner state (trạng thái người học)
   - **Note**: Không dùng event trung gian 'unlock intent' để tránh bịa event ngoài catalog

2. **MasteryState (motivation-progress-service)**:
   - Motivation-progress-service aggregates scores from multiple sources (lessons, assessments, feedback)
   - Mastery calculation is progress/motivation domain logic
   - Separating mastery from curriculum allows independent evolution (e.g., adding gamification, streaks)

3. **ReadinessState (education/readiness-model computed, assessment-service cached)**:
   - Readiness is computed from pedagogy rules (CEFR standards, skill thresholds)
   - Education layer is stateless and pure (no database, no service dependencies)
   - Computation logic is pure (stateless function)
   - Computed results are cached by assessment-service (with version field for optimistic locking)
   - Cache is invalidated when new events occur (e.g., assessment completed, mastery updated)

### Access Patterns (Mẫu truy cập)

**✅ Allowed**:
- Service reads foreign state to make decisions (e.g., curriculum-service reads MasteryState to check unlock threshold)
- Service reacts to events and writes its own state (e.g., motivation-progress-service reacts to `learning.lesson.completed` and updates MasteryState)

**❌ Forbidden**:
- Service writes foreign state directly (e.g., curriculum-service cannot write MasteryState)
- Service emits event and then consumes it to mutate its own state (unless explicitly documented)

---

## MVP Boundaries (Giới hạn MVP)

### What is in MVP (Có trong MVP)

1. **Rule-based Scoring (Tính điểm theo quy tắc)**:
   - Lesson scores: weighted average of activity scores
   - Unit scores: weighted average of lesson scores
   - Skill scores: per-skill aggregation from lessons and assessments

2. **Per-skill Mastery (Độ vững theo kỹ năng)**:
   - Track listening, reading, speaking, writing separately
   - Mastery thresholds: 0.7 (70%) for lesson completion, 0.6 (60%) for readiness

3. **Readiness Gate Basics (Cổng sẵn sàng cơ bản)**:
   - Check all 4 skills above threshold (0.6)
   - Check unit completion (all lessons mastered)
   - Check assessment score (if level test)

### What is NOT in MVP (Chưa làm)

1. **ML Personalization (Cá nhân hóa bằng ML)**:
   - No adaptive difficulty (độ khó tự điều chỉnh)
   - No personalized content recommendations (gợi ý nội dung cá nhân)
   - No predictive modeling (mô hình dự đoán)

2. **Adaptive Difficulty (Độ khó tự điều chỉnh)**:
   - No automatic difficulty adjustment based on performance
   - No A/B testing of difficulty levels

3. **Long-term Prediction (Dự đoán dài hạn)**:
   - No prediction of "time to next level"
   - No prediction of "exam readiness date"

### Anti-patterns to Avoid (Tránh sai lầm)

1. **Over-gamification (Gamification quá mức)**:
   - ❌ Do NOT unlock content based on "points" or "badges" alone
   - ✅ Unlock content based on mastery thresholds

2. **Progress-only Gating (Chỉ dựa vào tiến độ)**:
   - ❌ Do NOT allow progression by "completing" lessons without demonstrating mastery
   - ✅ Require mastery (score >= 0.7) for lesson completion to count

3. **Ignoring Speaking Feedback (Bỏ qua phản hồi nói)**:
   - ❌ Do NOT calculate speaking mastery without feedback scores
   - ✅ Require speaking feedback (from AI or mentor) for speaking mastery calculation

---

## State Relationships (Mối quan hệ giữa các state)

```
ProgressState (progress-service)
    ↓ reads
MasteryState (motivation-progress-service)
    ↓ reads
ReadinessState (education/readiness-model computed, assessment-service cached)
    ↓ computed from
MasteryState + Assessment results
```

**Flow**:
1. Learner completes lesson → `learning.lesson.completed` event
2. motivation-progress-service updates MasteryState (aggregates scores)
3. progress-service consumes `learning.lesson.completed` event → queries curriculum-service (read-only) for unlock eligibility → updates ProgressState if eligible
4. progress-service emits `curriculum.unit.unlocked` event (informational, after ProgressState updated)
5. assessment-service (or education/readiness-model) reads MasteryState → computes ReadinessState → caches result

---

## Verification Checklist (Danh sách kiểm tra)

Before implementing state updates, verify:
- [ ] Service only WRITEs to state it owns
- [ ] Service REACTs to events to mutate its own state (not foreign state)
- [ ] MasteryState supports anti "học ảo" (completion without mastery should not pass readiness)
- [ ] ReadinessState is computed from pedagogy rules (not just completion)
- [ ] ProgressState unlock rules require mastery thresholds (not just completion)

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Learning state model defined
