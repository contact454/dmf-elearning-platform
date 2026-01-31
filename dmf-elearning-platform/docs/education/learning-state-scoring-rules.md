# Learning State Scoring Rules
## Luật tính Điểm cho Trạng thái Học tập

This document defines rule-based scoring (không ML) for DMF Hybrid language learning platform MVP. It specifies how ActivityScore, LessonScore, UnitScore, and SkillScore are calculated, when content is "completed" vs "mastered", and how decay and SRS (Spaced Repetition System) work.

---

## Overview (Tổng quan)

**Purpose**: Provide clear, implementable rules for calculating learning progress and mastery scores without machine learning. All rules are deterministic and based on evidence (bằng chứng).

**Principle**: Anti "học ảo" (anti-hallucination) - completion without mastery should not pass readiness gates. Scores must reflect actual skill proficiency, not just activity.

**Alignment**: This document aligns with STEP 5A (Learning State Model + Event Mapping). All scoring rules respect state ownership and event-driven updates.

---

## 1. Score Objects (Đối tượng Điểm)

### 1.1 ActivityScore (Điểm Hoạt động)

**Definition**: Score for a single activity (quiz item, speaking sample, writing task) within a lesson.

**Structure**:
```typescript
interface ActivityScore {
    activityId: ActivityId;
    attemptId: AttemptId;
    skillType: SkillType;        // listening, reading, speaking, writing
    scoreVal: number;            // 0.0 to 1.0 (normalized)
    evidenceType: 'quiz' | 'speaking' | 'writing' | 'listening';
    createdAt: string;           // ISO 8601 timestamp
    metadata?: {
        isCorrect?: boolean;     // For quiz items
        feedbackId?: FeedbackId;  // For speaking/writing (if evaluated)
        durationMs?: number;      // For speaking/listening
        wordCount?: number;       // For writing
    };
}
```

**Calculation Rules**:
- **Quiz items (multiple-choice, fill-gap)**: `scoreVal = 1.0` if correct, `0.0` if incorrect
- **Speaking**: Requires feedback evaluation. Score derived from rubric (see Section 4)
- **Writing**: Requires feedback evaluation. Score derived from rubric (see Section 4)
- **Listening**: Auto-evaluated if possible, otherwise requires feedback

**Evidence Requirement**: 
- Speaking/writing activities MUST have feedback (`feedbackId`) to be counted in mastery calculation
- Quiz items are auto-evaluated (no feedback required)

**Storage**: ActivityScore is NOT persisted in MasteryState. It is aggregated into LessonScore immediately after activity completion.

---

### 1.2 LessonScore (Điểm Bài học)

**Definition**: Aggregated score for a complete lesson, including all activities and skill breakdown.

**Structure**:
```typescript
interface LessonScore {
    lessonId: LessonId;
    overallScore: number;        // 0.0 to 1.0 (weighted average of skill scores)
    skillBreakdown: {
        skill: SkillType;
        scoreVal: number;         // 0.0 to 1.0
        evidenceCount: number;    // Number of activities contributing to this skill
    }[];
    evidenceCount: number;        // Total activities completed (quiz items, speaking samples, writing tasks)
    lastUpdatedAt: string;       // ISO 8601 timestamp
}
```

**Calculation Rules**:
1. **Per-skill aggregation**: For each skill (listening, reading, speaking, writing):
   - Collect all ActivityScores for that skill in the lesson
   - Calculate weighted average (see Section 3 for weights)
   - Count evidence (number of activities)

2. **Overall score**: Weighted average of skill scores:
   ```
   overallScore = Σ(skillScore × skillWeight) / Σ(skillWeight)
   ```
   Weights depend on CEFR level (see Section 3.2)

3. **Evidence count**: Total number of activities completed (not just correct answers)

**Score Threshold (Ngưỡng điểm)**: `overallScore >= 0.7` (70%) is required for mastery eligibility (đủ điều kiện mastered).

**Mastery Eligibility (Đủ điều kiện mastered)**: Lesson is "mastered" only if:
- `overallScore >= 0.7` (score threshold - ngưỡng điểm) AND
- `skillBreakdown[skill].evidenceCount >= minimum` for each skill required by the lesson (evidence minimums - ngưỡng bằng chứng)

**Storage**: LessonScore is stored in `MasteryState.lessonMastery[]` (owned by `motivation-progress-service`)

---

### 1.3 UnitScore (Điểm Đơn vị)

**Definition**: Aggregated score for a complete unit, derived from lesson mastery.

**Structure**:
```typescript
interface UnitScore {
    unitId: UnitId;
    overallScore: number;        // 0.0 to 1.0 (weighted average of lesson scores)
    skillBreakdown: {
        skill: SkillType;
        scoreVal: number;         // 0.0 to 1.0
    }[];
    lastUpdatedAt: string;       // ISO 8601 timestamp
}
```

**Calculation Rules**:
1. **Derived from lessons**: UnitScore is computed from `lessonMastery` for all lessons in the unit
2. **Per-skill aggregation**: Average skill scores across all lessons in unit
3. **Overall score**: Weighted average of lesson scores (all lessons weighted equally)

**MVP Note**: UnitScore is DERIVED and OPTIONAL in MVP. It can be computed on-demand from `lessonMastery` to reduce storage. Persist only if query performance requires it.

**Storage**: UnitScore MAY be stored in `MasteryState.unitMastery[]` (optional, derived)

---

### 1.4 SkillScore (Điểm Kỹ năng)

**Definition**: Overall proficiency score for a skill (listening, reading, speaking, writing) across all lessons and assessments, with time decay applied.

**Structure**:
```typescript
interface SkillScore {
    userId: UserId;
    skill: SkillType;
    scoreVal: number;            // 0.0 to 1.0 (with decay applied)
    lastUpdatedAt: string;       // ISO 8601 timestamp
    decayAppliedAt?: string;     // ISO 8601 (last decay calculation)
}
```

**Calculation Rules**:
1. **Aggregation**: Collect all lesson scores and assessment scores for the skill
2. **Time window**: Use scores from last 90 days (configurable)
3. **Weighted average**: Recent scores weighted higher (see Section 5 for decay)
4. **Decay application**: Apply decay based on time since last practice (see Section 5)

**Storage**: SkillScore is stored in `MasteryState.skillScores[]` (owned by `motivation-progress-service`)

---

## 2. Thresholds (Ngưỡng)

### 2.1 MVP Thresholds Table

| Threshold | Value | Purpose (Mục đích) | Notes |
|-----------|-------|-------------------|-------|
| `mastered_lesson_threshold` | 0.7 (70%) | Lesson is "mastered" if overallScore >= 0.7 | Below 0.7 = completed but not mastered |
| `readiness_skill_floor` | 0.6 (60%) | Minimum skill score for readiness gate | All 4 skills must be >= 0.6 |
| `unit_mastered_requires_all_lessons_mastered` | true | Unit is mastered only if all lessons are mastered | Prevents skipping weak lessons |
| `evidence_minimum_listening` | 3 | Minimum activities per skill to count mastery | Prevents "1 correct answer = mastery" |
| `evidence_minimum_reading` | 3 | Minimum activities per skill to count mastery | Prevents "1 correct answer = mastery" |
| `evidence_minimum_speaking` | 3 | Minimum samples per skill to count mastery | Requires multiple attempts |
| `evidence_minimum_writing` | 2 | Minimum samples per skill to count mastery | Requires multiple attempts (writing threshold is 2, not 3) |
| `speaking_writing_feedback_required` | true | Speaking/writing require feedback to count | Prevents auto-evaluation loophole |

### 2.2 "Completed" vs "Mastered"

**Completed (Hoàn thành)**:
- Learner finishes all activities in a lesson (regardless of score)
- Event: `learning.lesson.completed` is emitted with `status: 'completed'`
- ProgressState: Lesson is added to `completedLessonIds`
- MasteryState: LessonScore is calculated (even if < 0.7)

**Mastered (Thành thạo)**:
- Learner achieves `overallScore >= 0.7` for the lesson AND evidence minimum met per skill
- MasteryState: `lessonMastery[lessonId].overallScore >= 0.7`
- Mastery Eligibility (khả năng đạt mastery): Determined by rule (not stored) - lesson is "mastered" only if:
  - (a) `overallScore >= 0.7` AND
  - (b) `skillBreakdown[].evidenceCount >= minimum` for each skill required by the lesson
- ProgressState: Unlock eligibility check uses mastery eligibility (not just completion or score)
- Unlock: Next lesson/unit unlocked only if mastery eligibility is true

**Critical Rule**: Completion does NOT guarantee unlock. Unlock requires mastery eligibility (overallScore >= 0.7 AND evidence minimums met per skill). If evidence is missing for a skill, the lesson is "completed" but NOT "mastered", and explicit blockers are recorded (e.g., "speaking: insufficient evidence (2/3 samples)").

---

## 3. Weighting (Trọng số)

### 3.1 Skill Weights by CEFR Level

**Principle**: Different CEFR levels emphasize different skills. Weights reflect pedagogical priorities.

**Weight Table** (see `learning-state-scoring-tables.md` for full matrix):

| CEFR Level | Listening | Reading | Speaking | Writing | Notes |
|------------|-----------|---------|----------|---------|-------|
| A1 | 0.35 | 0.25 | 0.30 | 0.10 | Listening + Speaking priority |
| A2 | 0.30 | 0.25 | 0.30 | 0.15 | Balanced listening/speaking |
| B1 | 0.25 | 0.30 | 0.25 | 0.20 | Reading + Writing increase |
| B2 | 0.20 | 0.30 | 0.25 | 0.25 | Balanced all skills |
| C1 | 0.20 | 0.30 | 0.25 | 0.25 | Advanced: all skills equal |
| C2 | 0.20 | 0.30 | 0.25 | 0.25 | Advanced: all skills equal |

**Usage**: When calculating `LessonScore.overallScore`:
```
overallScore = (listeningScore × listeningWeight) + 
               (readingScore × readingWeight) + 
               (speakingScore × speakingWeight) + 
               (writingScore × writingWeight)
```

### 3.2 Feedback Weight (Trọng số Phản hồi)

**Principle**: Human feedback (teacher/mentor) is more reliable than AI feedback for speaking/writing. We separate score (điểm) from confidence (độ tin cậy) - they are independent concepts.

**Weight Table**:

| Feedback Author | Author Weight (trọng số) | Confidence Cap (trần tin cậy) | Notes |
|-----------------|-------------------------|-------------------------------|-------|
| Teacher | 1.0 | 1.0 | Full weight, full confidence |
| Mentor | 0.9 | 0.9 | Slightly lower than teacher |
| AI | 0.7 | 0.8 | Reduced weight, capped confidence |

**Usage**: When calculating speaking/writing mastery from feedback:
```
// Step 1: Apply author weight to score (điểm)
adjustedScore = feedbackScore × authorWeight

// Step 2: Calculate confidence (độ tin cậy) independently (not from score)
confidence = confidenceCap  // Independent cap based on author, not score

// Step 3: Use adjustedScore for mastery calculation
// Confidence is used for readiness/quality assessment, not for score calculation
```

**Explanation**: Confidence (độ tin cậy) is not the same as score (điểm). Score (điểm) reflects the quality of the submission after applying author weight. Confidence (độ tin cậy) reflects how much we trust the feedback source (Teacher=1.0, Mentor=0.9, AI=0.8), independent of the score value.

**Anti "Học Ảo" Rule**: If speaking/writing activity only has AI feedback, the adjusted score contribution is limited by author weight (0.7), and confidence is capped at 0.8 (80%) regardless of the feedback score value.

---

## 4. Feedback Scoring (Chấm Nói/Viết)

### 4.1 Speaking Rubric (Thang điểm Nói)

**Rubric Dimensions** (each 0.0 to 1.0):

1. **Pronunciation (Phát âm)**: Accuracy of sounds, stress, intonation
2. **Fluency (Độ trôi chảy)**: Pace, pauses, natural flow
3. **Grammar Accuracy (Độ chính xác ngữ pháp)**: Correct grammar structures
4. **Task Completion (Hoàn thành nhiệm vụ)**: Addresses prompt requirements

**Calculation**:
```
speakingScore = (pronunciation × 0.25) + 
                (fluency × 0.25) + 
                (grammarAccuracy × 0.25) + 
                (taskCompletion × 0.25)
```

**Evidence Requirement**: Minimum 3 speaking samples per lesson to count mastery. Single sample is not sufficient.

**Storage**: Rubric scores stored in `Feedback` entity (if schema supports). Otherwise, only `speakingScore` (0.0 to 1.0) is stored.

### 4.2 Writing Rubric (Thang điểm Viết)

**Rubric Dimensions** (each 0.0 to 1.0):

1. **Coherence (Tính mạch lạc)**: Logical flow, organization
2. **Grammar Accuracy (Độ chính xác ngữ pháp)**: Correct grammar structures
3. **Vocab Range (Từ vựng)**: Appropriate vocabulary, variety
4. **Task Completion (Hoàn thành nhiệm vụ)**: Addresses prompt requirements

**Calculation**:
```
writingScore = (coherence × 0.30) + 
               (grammarAccuracy × 0.30) + 
               (vocabRange × 0.20) + 
               (taskCompletion × 0.20)
```

**Evidence Requirement**: Minimum 2 writing samples per lesson to count mastery. Single sample is not sufficient.

**Storage**: Rubric scores stored in `Feedback` entity (if schema supports). Otherwise, only `writingScore` (0.0 to 1.0) is stored.

### 4.3 Feedback-to-Score Conversion

**Rule**: Feedback must include rubric scores OR a single `score` field (0.0 to 1.0).

**If rubric scores provided**:
- Calculate speakingScore or writingScore using rubric formula above
- Apply feedback author weight (Section 3.2) to get `adjustedScore` (điểm đã điều chỉnh)
- Calculate confidence (độ tin cậy) independently from `confidenceCap` based on author

**If only `score` field provided**:
- Use `score` directly
- Apply feedback author weight (Section 3.2) to get `adjustedScore` (điểm đã điều chỉnh)
- Calculate confidence (độ tin cậy) independently from `confidenceCap` based on author

**If no score provided**:
- Feedback does NOT contribute to mastery
- Activity is "completed" but not "mastered"

**Note**: Score (điểm) and confidence (độ tin cậy) are separate. Score is used for mastery calculation. Confidence (độ tin cậy) is used ONLY in ReadinessState computation (quality/reliability assessment), NOT used for Mastery scoring or unlock decisions.

---

## 5. Decay & SRS (Suy giảm & Ôn tập)

### 5.1 Decay Rules (Quy tắc Suy giảm)

**Principle**: Mastery scores decay over time if not practiced. Different skills decay at different rates. We use exponential decay (suy giảm hàm mũ) with half-life (thời gian bán rã) for deterministic, predictable decay.

**Decay Model**: Exponential decay (suy giảm hàm mũ) - score decreases exponentially over time, not linearly. Half-life (thời gian bán rã) is the time it takes for score to reduce to 50% of its original value.

**Half-Life Values**:

| Skill | Half-Life (days) | Notes |
|-------|-----------------|-------|
| Listening | ~420 days | Slow decay (passive skill) |
| Reading | ~420 days | Slow decay (passive skill) |
| Speaking | ~140 days | Fast decay (active skill) |
| Writing | ~140 days | Fast decay (active skill) |

**Calculation** (Exponential Decay):
```
daysSinceLastPractice = (now - lastUpdatedAt) / (24 * 60 * 60 * 1000)
halfLife = getHalfLifeForSkill(skill)  // e.g., 420 for listening, 140 for speaking
decayConstant = ln(0.5) / halfLife  // Natural log of 0.5 divided by half-life
decayFactor = exp(decayConstant × daysSinceLastPractice)  // Exponential decay
decayedScore = currentScore × max(decayFactor, 0.3)  // Floor at 0.3 (30%)
```

**Explanation**: Exponential decay (suy giảm hàm mũ) means the score decreases faster initially and slower over time, following a natural decay curve. The half-life (thời gian bán rã) determines how quickly the decay occurs.

**Decay Application**:
- Applied to `SkillScore` (not LessonScore or UnitScore)
- Calculated on-demand when SkillScore is read
- Stored in `SkillScore.decayAppliedAt` timestamp

### 5.2 SRS (Spaced Repetition System) Integration

**Principle**: SRS items trigger review activities. Completing review activities updates mastery (via `learning.lesson.completed` event).

**Flow**:
1. `curriculum.srs_items.due` event is emitted (informational, no state mutation)
2. `practice-service` suggests review activities based on SRS items
3. Learner completes review lesson → `learning.lesson.completed` event
4. `motivation-progress-service` updates MasteryState (aggregates review scores)
5. Decay is reset for reviewed skills

**SRS Review Scoring**:
- Review activities use same scoring rules as regular lessons
- Review scores contribute to mastery (same weight as new lessons)
- Completing review resets decay timer for that skill

**Anti "Học Ảo" Rule**: SRS review must be completed (not just started) to reset decay. Partial completion does not reset decay.

---

## 6. Anti-Gaming / Anti "Học Ảo" Guardrails

### 6.1 Evidence Minimums

**Rule**: Mastery eligibility (khả năng đạt mastery) requires minimum evidence count per skill. Evidence minimums are checked per skill, not as a cap on overallScore.

| Skill | Minimum Evidence | Purpose |
|-------|------------------|---------|
| Listening | 3 activities | Prevent "1 correct answer = mastery" |
| Reading | 3 activities | Prevent "1 correct answer = mastery" |
| Speaking | 3 samples | Require multiple attempts |
| Writing | 2 samples | Require multiple attempts |

**Enforcement**: 
- Lesson can always be marked "completed" (regardless of evidence count)
- Lesson is "mastered" ONLY if:
  - `overallScore >= 0.7` AND
  - `skillBreakdown[skill].evidenceCount >= minimum` for each skill required by the lesson
- If evidence is missing for a skill, do NOT block calculating the score; instead:
  - Calculate `overallScore` normally (do not cap at 0.6)
  - Set mastery eligibility to false
  - Record explicit blockers (e.g., "speaking: insufficient evidence (2/3 samples required)")
- Mastery eligibility (khả năng đạt mastery) is a rule-output (not stored in schema), computed from `skillBreakdown[].evidenceCount` and `overallScore`

### 6.2 Daily Cap (Giới hạn Hàng ngày)

**Rule**: Limit mastery score increase (mức tăng thêm) per day per skill to prevent spam. Daily cap applies to "delta increase" (mức tăng thêm) of SkillScore per skill per calendar day.

**Definition**:
- **Delta increase (mức tăng thêm)**: The amount by which SkillScore increases in a single day
- **Day boundary (ranh giới ngày)**: Uses user timezone (múi giờ người học) - calendar day in user's locale
- **Per-skill tracking**: Each skill (listening, reading, speaking, writing) has its own daily cap
- **No carryover**: If cap exceeded, extra delta is ignored for that day; it does not carry over to next day

**Cap Table**:

| Activity Type | Daily Cap (delta increase) | Notes |
|--------------|----------------------------|-------|
| Quiz items | +0.1 per skill per day | Micro tasks limited - applies to each skill separately |
| Speaking samples | +0.15 per day (speaking skill only) | Requires feedback - only affects speaking SkillScore |
| Writing samples | +0.15 per day (writing skill only) | Requires feedback - only affects writing SkillScore |
| Full lesson | +0.3 per day (distributed across skills) | Full lesson completion - delta distributed by skill weights |

**Aggregation Order Rule**: Daily caps are applied after aggregating all deltas per skill within the same calendar day. Activity-level caps constrain contribution before aggregation (if applicable). Per-skill daily cap is enforced last, after all deltas for that skill are aggregated.

**Enforcement Steps** (Pseudo-code):
```
1. Get user timezone (múi giờ người học) from user profile
2. Calculate current date in user timezone
3. For each skill:
   a. Aggregate all delta increases from activities within the same calendar day
   b. Calculate total delta increase = sum of all activity deltas for this skill today
   c. Get daily cap for this skill
   d. If total delta increase > daily cap:
      - Set total delta increase = daily cap (ignore excess)
      - newSkillScore = oldSkillScore + daily cap
   e. Record delta increase for this calendar day (for tracking)
4. If cap exceeded, excess delta is ignored (not accumulated, not carried over)
```

**Enforcement**: If daily cap exceeded, excess score increase is ignored (not accumulated, not carried over to next day). MVP uses simple per-day tracking (no complex rolling windows).

### 6.3 Unlock Requirements

**Rule**: Unlock requires mastery, not just completion or streak.

**Forbidden**:
- ❌ Unlock based on "points" or "badges" alone
- ❌ Unlock based on "streak" (consecutive days) alone
- ❌ Unlock based on "time spent" alone

**Required**:
- ✅ Unlock requires `lessonMastery[lessonId].overallScore >= 0.7`
- ✅ Unlock requires `evidenceCount >= minimum` per skill
- ✅ Unlock requires all prerequisites mastered

### 6.4 Speaking/Writing Evaluation Requirement

**Rule**: Speaking/writing activities MUST be evaluated before contributing to mastery.

**Enforcement**:
- If `feedbackId` is missing → activity does NOT contribute to mastery
- If `feedback.author` is missing → activity does NOT contribute to mastery
- For AI feedback: `adjustedScore = feedbackScore × authorWeight` (AI weight = 0.7), `confidence = confidenceCap` (AI = 0.8). Mastery uses `adjustedScore` (điểm đã điều chỉnh); confidence (độ tin cậy) is for readiness/quality assessment only, NOT used for mastery calculation or unlock decisions (không dùng để tính mastery/unlock). See Section 3.2 and 4.3 for details.

**Event Alignment**: `learning.submission.created` event includes `type: SubmissionType`. Only submissions with `type: 'speaking'` or `type: 'writing'` require feedback.

---

## 7. Implementation Notes (Ghi chú Triển khai)

### 7.1 Service Ownership

**MasteryState Updates**:
- **Owner**: `motivation-progress-service`
- **Reads**: Events (`learning.lesson.completed`, `assessment.quiz.submitted`, `mentoring.feedback.published`)
- **Writes**: `MasteryState` (skillScores, lessonMastery, unitMastery)

**ProgressState Updates**:
- **Owner**: `progress-service`
- **Reads**: Events (`learning.lesson.completed`, `assessment.level_test.completed`)
- **Queries**: `curriculum-service` (read-only, unlock eligibility)
- **Writes**: `ProgressState` (unlockedUnitIds, completedLessonIds, etc.)

**ReadinessState Computation**:
- **Computation**: `education/readiness-model` (pure, stateless)
- **Cache**: `assessment-service` (caches computed results)
- **Reads**: `MasteryState` + Assessment results

### 7.2 Pseudo-code (Mã giả)

#### updateMasteryFromLessonCompleted(event)

```typescript
function updateMasteryFromLessonCompleted(event: LearningLessonCompletedEvent) {
    // 1. Extract event data
    const { lessonId, attemptId, score } = event.payload;
    
    // 2. Load current MasteryState
    const masteryState = await loadMasteryState(event.user_id);
    
    // 3. Calculate ActivityScores from attempt (query practice-service)
    const activityScores = await getActivityScores(attemptId);
    
    // 4. Group by skill and calculate skill breakdown
    const skillBreakdown = calculateSkillBreakdown(activityScores, event.user_id);
    
    // 5. Calculate overallScore (weighted by CEFR level)
    const userLevel = await getUserCEFRLevel(event.user_id);
    const weights = getSkillWeights(userLevel);
    const overallScore = calculateWeightedAverage(skillBreakdown, weights);
    
    // 6. Check evidence minimums per skill
    const evidenceCheck = checkEvidenceMinimumsPerSkill(skillBreakdown);
    // Returns: { allMet: boolean, blockers: string[] }
    // e.g., { allMet: false, blockers: ["speaking: insufficient evidence (2/3 samples required)"] }
    
    // 7. Calculate mastery eligibility (khả năng đạt mastery) - rule output, not stored
    const masteryEligibility = overallScore >= 0.7 && evidenceCheck.allMet;
    
    // 8. Update lessonMastery (overallScore is calculated normally, not capped)
    // Note: masteryEligibility and blockers are rule-outputs (not stored in schema)
    masteryState.lessonMastery = updateOrInsert(
        masteryState.lessonMastery,
        {
            lessonId,
            overallScore: overallScore,  // Not capped - calculated normally
            skillBreakdown,  // Includes evidenceCount per skill (used to compute masteryEligibility)
            evidenceCount: activityScores.length,
            lastUpdatedAt: new Date().toISOString()
        }
    );
    
    // 9. Mastery eligibility (khả năng đạt mastery) is computed on-demand from:
    //    - overallScore >= 0.7
    //    - skillBreakdown[].evidenceCount >= minimum for each skill
    //    This is a rule-output, not stored in MasteryState
    
    // 10. Update skillScores (aggregate across all lessons)
    masteryState.skillScores = updateSkillScores(
        masteryState.skillScores,
        skillBreakdown,
        event.user_id
    );
    
    // 11. Apply decay to skillScores
    masteryState.skillScores = applyDecay(masteryState.skillScores);
    
    // 12. Save MasteryState
    await saveMasteryState(masteryState);
}
```

#### updateMasteryFromQuizSubmitted(event)

```typescript
function updateMasteryFromQuizSubmitted(event: AssessmentQuizSubmittedEvent) {
    // 1. Extract event data
    const { assessmentId, score, levelHint } = event.payload;
    
    // 2. Load current MasteryState
    const masteryState = await loadMasteryState(event.user_id);
    
    // 3. Get quiz skill breakdown (query assessment-service)
    const quizSkillBreakdown = await getQuizSkillBreakdown(assessmentId);
    
    // 4. Update skillScores (aggregate quiz scores)
    masteryState.skillScores = updateSkillScores(
        masteryState.skillScores,
        quizSkillBreakdown,
        event.user_id
    );
    
    // 5. Apply decay
    masteryState.skillScores = applyDecay(masteryState.skillScores);
    
    // 6. Save MasteryState
    await saveMasteryState(masteryState);
}
```

#### applyDecay(userId, now)

```typescript
function applyDecay(skillScores: SkillScore[], now: Date): SkillScore[] {
    // Half-life values (thời gian bán rã) in days
    const halfLives = {
        listening: 420,
        reading: 420,
        speaking: 140,
        writing: 140
    };
    
    return skillScores.map(score => {
        const daysSinceLastPractice = 
            (now.getTime() - new Date(score.lastUpdatedAt).getTime()) / (24 * 60 * 60 * 1000);
        
        const halfLife = halfLives[score.skill];
        // Exponential decay (suy giảm hàm mũ): decayConstant = ln(0.5) / halfLife
        const decayConstant = Math.log(0.5) / halfLife;
        // Exponential decay factor
        const decayFactor = Math.exp(decayConstant * daysSinceLastPractice);
        
        const decayedScore = score.scoreVal * Math.max(decayFactor, 0.3); // Floor at 0.3 (30%)
        
        return {
            ...score,
            scoreVal: decayedScore,
            decayAppliedAt: now.toISOString()
        };
    });
}
```

#### deriveUnitMastery(unitId)

```typescript
function deriveUnitMastery(unitId: UnitId, lessonMastery: LessonMastery[]): UnitScore {
    // 1. Filter lessons in unit
    const unitLessons = await getLessonsInUnit(unitId);
    const unitLessonScores = lessonMastery.filter(
        lm => unitLessons.includes(lm.lessonId)
    );
    
    // 2. Calculate per-skill average
    const skillBreakdown = calculateSkillAverage(unitLessonScores);
    
    // 3. Calculate overallScore (equal weight for all lessons)
    const overallScore = unitLessonScores.reduce(
        (sum, lm) => sum + lm.overallScore, 0
    ) / unitLessonScores.length;
    
    return {
        unitId,
        overallScore,
        skillBreakdown,
        lastUpdatedAt: new Date().toISOString()
    };
}
```

### 7.3 Data Flow (Luồng Dữ liệu)

**Event → MasteryState Update**:
1. Event emitted (e.g., `learning.lesson.completed`)
2. `motivation-progress-service` consumes event
3. Service queries `practice-service` for ActivityScores (if needed)
4. Service queries `assessment-service` for feedback (if speaking/writing)
5. Service calculates LessonScore
6. Service updates MasteryState
7. Service saves MasteryState

**MasteryState → ProgressState Unlock**:
1. `progress-service` consumes `learning.lesson.completed` event
2. Service queries `motivation-progress-service` for MasteryState (read-only)
3. Service queries `curriculum-service` for unlock eligibility (read-only API)
4. If eligible, service updates ProgressState
5. Service emits `curriculum.unit.unlocked` event (informational)

---

## 8. Verification Checklist (Danh sách Kiểm tra)

Before implementing scoring rules, verify:

- [ ] All thresholds defined and documented
- [ ] Weight tables complete for all CEFR levels
- [ ] Feedback scoring rules align with Feedback schema
- [ ] Decay rates defined for all skills
- [ ] Evidence minimums enforced
- [ ] Daily caps implemented
- [ ] Unlock requires mastery (not just completion)
- [ ] Speaking/writing require feedback
- [ ] No contradictions with STEP 5A (Learning State Model)
- [ ] All pseudo-code functions have clear inputs/outputs
- [ ] Service ownership respected (no foreign state mutations)

---

## 9. Glossary (Thuật ngữ)

| English | Vietnamese | Definition |
|---------|------------|------------|
| ActivityScore | Điểm hoạt động | Score for a single activity (quiz item, speaking sample, writing task) |
| LessonScore | Điểm bài học | Aggregated score for a complete lesson |
| UnitScore | Điểm đơn vị | Aggregated score for a complete unit |
| SkillScore | Điểm kỹ năng | Overall proficiency score for a skill (listening, reading, speaking, writing) |
| Mastery | Độ vững | Proficiency level (score >= 0.7) |
| Completion | Hoàn thành | Finishing all activities (regardless of score) |
| Decay | Suy giảm | Score reduction over time without practice |
| SRS | Hệ thống lặp lại ngắt quãng | Spaced Repetition System for review scheduling |
| Evidence | Bằng chứng | Activities/samples that contribute to mastery calculation |
| Rubric | Thang điểm | Scoring criteria for speaking/writing |
| Threshold | Ngưỡng | Minimum score required (e.g., 0.7 for mastery) |
| Weight | Trọng số | Multiplier for importance (e.g., skill weights by CEFR level) |

---

---

## 10. Change Summary (Tóm tắt Thay đổi)

**ISSUE 1 — Decay Model Fixed**:
- Changed from linear decay to exponential decay (suy giảm hàm mũ) with half-life (thời gian bán rã)
- Updated formula to use exponential decay: `decayFactor = exp(decayConstant × daysSinceLastPractice)`
- Removed "linear per 30 days" wording, kept half-life values

**ISSUE 2 — Evidence Minimum Enforcement Clarified**:
- Removed "cap overallScore at 0.6" rule
- Introduced "mastery eligibility (khả năng đạt mastery)" concept (rule-output, not stored)
- Lesson is "mastered" only if: `overallScore >= 0.7` AND evidence minimum met per skill
- If evidence insufficient, calculate score normally but set mastery eligibility to false with explicit blockers

**ISSUE 3 — Feedback Weight & Confidence Separated**:
- Separated score (điểm) from confidence (độ tin cậy) - they are independent
- Score (điểm): `adjustedScore = feedbackScore × authorWeight`
- Confidence (độ tin cậy): `confidence = confidenceCap` (independent of score)
- Added explanation: "Confidence is not the same as score"

**ISSUE 4 — Daily Cap Precisely Defined**:
- Defined daily cap as "delta increase (mức tăng thêm)" of SkillScore per skill per calendar day
- Day boundary uses user timezone (múi giờ người học)
- Added enforcement steps (pseudo-code) with per-skill tracking
- Clarified: no carryover, excess delta ignored

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Scoring rules defined for MVP  
**Related Documents**: 
- `docs/architecture/learning-state-model.md` (STEP 5A)
- `docs/architecture/learning-state-event-mapping.md` (STEP 5A)
- `docs/education/learning-state-scoring-tables.md` (Rule tables)
