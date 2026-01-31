# Learning State Scoring Tables
## Bảng Quy tắc Tính Điểm

This document contains rule tables, matrices, and rubrics for learning state scoring. See `learning-state-scoring-rules.md` for detailed explanations.

---

## 1. Thresholds Table (Bảng Ngưỡng)

| Threshold Name | Value | Unit | Purpose | Notes |
|----------------|-------|------|---------|-------|
| `mastered_lesson_threshold` | 0.7 | score (0.0-1.0) | Lesson is "mastered" if overallScore >= 0.7 | Below 0.7 = completed but not mastered |
| `readiness_skill_floor` | 0.6 | score (0.0-1.0) | Minimum skill score for readiness gate | All 4 skills must be >= 0.6 |
| `unit_mastered_requires_all_lessons_mastered` | true | boolean | Unit is mastered only if all lessons are mastered | Prevents skipping weak lessons |
| `evidence_minimum_listening` | 3 | count | Minimum activities per skill to count mastery | Prevents "1 correct answer = mastery" |
| `evidence_minimum_reading` | 3 | count | Minimum activities per skill to count mastery | Prevents "1 correct answer = mastery" |
| `evidence_minimum_speaking` | 3 | count | Minimum samples per skill to count mastery | Requires multiple attempts |
| `evidence_minimum_writing` | 2 | count | Minimum samples per skill to count mastery | Requires multiple attempts |
| `speaking_writing_feedback_required` | true | boolean | Speaking/writing require feedback to count | Prevents auto-evaluation loophole |
| `decay_floor` | 0.3 | score (0.0-1.0) | Minimum score after decay (30% floor) | Prevents complete score loss |

---

## 2. Skill Weights by CEFR Level (Trọng số Kỹ năng theo CEFR)

| CEFR Level | Listening | Reading | Speaking | Writing | Sum | Notes |
|------------|-----------|---------|----------|---------|-----|-------|
| A1 | 0.35 | 0.25 | 0.30 | 0.10 | 1.00 | Listening + Speaking priority |
| A2 | 0.30 | 0.25 | 0.30 | 0.15 | 1.00 | Balanced listening/speaking |
| B1 | 0.25 | 0.30 | 0.25 | 0.20 | 1.00 | Reading + Writing increase |
| B2 | 0.20 | 0.30 | 0.25 | 0.25 | 1.00 | Balanced all skills |
| C1 | 0.20 | 0.30 | 0.25 | 0.25 | 1.00 | Advanced: all skills equal |
| C2 | 0.20 | 0.30 | 0.25 | 0.25 | 1.00 | Advanced: all skills equal |

**Usage**: When calculating `LessonScore.overallScore`:
```
overallScore = (listeningScore × listeningWeight) + 
               (readingScore × readingWeight) + 
               (speakingScore × speakingWeight) + 
               (writingScore × writingWeight)
```

---

## 3. Feedback Weight Table (Bảng Trọng số Phản hồi)

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
```

**Note**: Confidence (độ tin cậy) is not the same as score (điểm). Score reflects quality after applying author weight. Confidence reflects trust in feedback source, independent of score value.

---

## 4. Decay Rates Table (Bảng Tỷ lệ Suy giảm)

**Model**: Exponential decay (suy giảm hàm mũ) with half-life (thời gian bán rã). Score decreases exponentially over time, not linearly.

| Skill | Half-Life (thời gian bán rã, days) | Notes |
|-------|-----------------------------------|-------|
| Listening | ~420 | Slow decay (passive skill) |
| Reading | ~420 | Slow decay (passive skill) |
| Speaking | ~140 | Fast decay (active skill) |
| Writing | ~140 | Fast decay (active skill) |

**Calculation** (Exponential Decay):
```
daysSinceLastPractice = (now - lastUpdatedAt) / (24 * 60 * 60 * 1000)
halfLife = getHalfLifeForSkill(skill)  // e.g., 420 for listening, 140 for speaking
decayConstant = ln(0.5) / halfLife  // Natural log of 0.5 divided by half-life
decayFactor = exp(decayConstant × daysSinceLastPractice)  // Exponential decay
decayedScore = currentScore × max(decayFactor, 0.3)  // Floor at 0.3 (30%)
```

**Explanation**: Exponential decay (suy giảm hàm mũ) means score decreases faster initially and slower over time, following a natural decay curve. Half-life (thời gian bán rã) is the time for score to reduce to 50% of original value.

---

## 5. Daily Cap Table (Bảng Giới hạn Hàng ngày)

**Definition**: Daily cap applies to "delta increase" (mức tăng thêm) of SkillScore per skill per calendar day. Day boundary uses user timezone (múi giờ người học).

| Activity Type | Daily Cap (delta increase) | Notes |
|--------------|----------------------------|-------|
| Quiz items | +0.1 per skill per day | Micro tasks limited - applies to each skill separately |
| Speaking samples | +0.15 per day (speaking skill only) | Requires feedback - only affects speaking SkillScore |
| Writing samples | +0.15 per day (writing skill only) | Requires feedback - only affects writing SkillScore |
| Full lesson | +0.3 per day (distributed across skills) | Full lesson completion - delta distributed by skill weights |

**Enforcement**: 
- Delta increase (mức tăng thêm) = newSkillScore - oldSkillScore
- Day boundary (ranh giới ngày) = calendar day in user timezone (múi giờ người học)
- Per-skill tracking: Each skill has its own daily cap
- If cap exceeded, excess delta is ignored for that day (not accumulated, not carried over)
- MVP uses simple per-day tracking (no complex rolling windows)

---

## 6. Speaking Rubric (Thang điểm Nói)

| Dimension | Weight | Score Range | Description |
|-----------|--------|-------------|--------------|
| Pronunciation | 0.25 | 0.0 - 1.0 | Accuracy of sounds, stress, intonation |
| Fluency | 0.25 | 0.0 - 1.0 | Pace, pauses, natural flow |
| Grammar Accuracy | 0.25 | 0.0 - 1.0 | Correct grammar structures |
| Task Completion | 0.25 | 0.0 - 1.0 | Addresses prompt requirements |

**Calculation**:
```
speakingScore = (pronunciation × 0.25) + 
                (fluency × 0.25) + 
                (grammarAccuracy × 0.25) + 
                (taskCompletion × 0.25)
```

**Evidence Requirement**: Minimum 3 speaking samples per lesson to count mastery.

---

## 7. Writing Rubric (Thang điểm Viết)

| Dimension | Weight | Score Range | Description |
|-----------|--------|-------------|--------------|
| Coherence | 0.30 | 0.0 - 1.0 | Logical flow, organization |
| Grammar Accuracy | 0.30 | 0.0 - 1.0 | Correct grammar structures |
| Vocab Range | 0.20 | 0.0 - 1.0 | Appropriate vocabulary, variety |
| Task Completion | 0.20 | 0.0 - 1.0 | Addresses prompt requirements |

**Calculation**:
```
writingScore = (coherence × 0.30) + 
               (grammarAccuracy × 0.30) + 
               (vocabRange × 0.20) + 
               (taskCompletion × 0.20)
```

**Evidence Requirement**: Minimum 2 writing samples per lesson to count mastery.

---

## 8. Evidence Minimums Matrix (Ma trận Tối thiểu Bằng chứng)

| Skill | Minimum Evidence | Purpose | Enforcement |
|-------|------------------|---------|-------------|
| Listening | 3 activities | Prevent "1 correct answer = mastery" | Check per skill: if evidenceCount < 3, mastery eligibility = false |
| Reading | 3 activities | Prevent "1 correct answer = mastery" | Check per skill: if evidenceCount < 3, mastery eligibility = false |
| Speaking | 3 samples | Require multiple attempts | Check per skill: if evidenceCount < 3, mastery eligibility = false |
| Writing | 2 samples | Require multiple attempts | Check per skill: if evidenceCount < 2, mastery eligibility = false |

**Enforcement Rule**:
- Lesson can always be "completed" (regardless of evidence count)
- Lesson is "mastered" ONLY if: `overallScore >= 0.7` AND `evidenceCount >= minimum` for each skill
- If evidence insufficient, calculate `overallScore` normally (do NOT cap at 0.6)
- Set mastery eligibility (khả năng đạt mastery) to false and record explicit blockers (e.g., "speaking: insufficient evidence (2/3 samples required)")
- Mastery eligibility is a rule-output (not stored in schema), computed from `skillBreakdown[].evidenceCount` and `overallScore`

---

## 9. Unlock Eligibility Matrix (Ma trận Điều kiện Mở khóa)

| Condition | Required | Notes |
|-----------|----------|-------|
| Lesson mastery eligibility (khả năng đạt mastery) | `overallScore >= 0.7` AND `evidenceCount >= minimum` per skill | Lesson must be mastered (not just completed or high score) |
| Evidence minimum | `skillBreakdown[skill].evidenceCount >= minimum` for each skill | All skills must meet evidence minimum (checked per skill) |
| Prerequisites | All prerequisite lessons mastered | Cannot skip lessons |
| Unit completion | All lessons in unit mastered | Unit requires all lessons mastered |

**Mastery Eligibility (khả năng đạt mastery)**:
- Rule-output (not stored in schema), computed from `overallScore` and `skillBreakdown[].evidenceCount`
- Lesson is "mastered" only if: `overallScore >= 0.7` AND evidence minimum met per skill
- If evidence insufficient, lesson is "completed" but NOT "mastered", with explicit blockers recorded

**Forbidden Unlock Triggers**:
- ❌ Points or badges alone
- ❌ Streak (consecutive days) alone
- ❌ Time spent alone
- ❌ Completion without mastery

---

## 10. Score Calculation Flow Matrix (Ma trận Luồng Tính Điểm)

| Step | Input | Process | Output | Service |
|------|-------|---------|--------|---------|
| 1. Activity completion | Activity result | Calculate ActivityScore | ActivityScore (0.0-1.0) | practice-service |
| 2. Lesson completion | ActivityScores[] | Aggregate by skill, apply weights | LessonScore (overallScore, skillBreakdown) | motivation-progress-service |
| 3. Skill aggregation | LessonScores[] | Aggregate across lessons, apply decay | SkillScore (per skill) | motivation-progress-service |
| 4. Unit derivation | LessonScores[] in unit | Average lesson scores | UnitScore (optional) | motivation-progress-service |
| 5. Unlock check | MasteryState | Query curriculum-service for eligibility | Unlock decision | progress-service |
| 6. Readiness computation | MasteryState + Assessment | Compute readiness | ReadinessState | education/readiness-model |

---

## 11. Anti "Học Ảo" Guardrails Matrix (Ma trận Chống Học Ảo)

| Guardrail | Rule | Enforcement | Notes |
|-----------|------|-------------|-------|
| Evidence minimum | Minimum activities per skill | Mastery eligibility = false if insufficient evidence per required skill | Prevents "1 correct = mastery" |
| Daily cap | Limit score increase per day | Apply cap after aggregating per-skill daily deltas; ignore excess | Prevents spam |
| Feedback requirement | Speaking/writing require feedback | No mastery if no feedback | Prevents auto-evaluation loophole |
| AI feedback cap | AI feedback capped at 0.8 | Cap confidence at 0.8 | Reduces AI hallucination risk |
| Mastery threshold | Unlock requires mastery >= 0.7 | No unlock if < 0.7 | Prevents completion-only progression |
| Unit completion | All lessons must be mastered | No unit unlock if any lesson < 0.7 | Prevents skipping weak lessons |

---

## 12. Time Decay Calculation Matrix (Ma trận Tính Suy giảm)

**Model**: Exponential decay (suy giảm hàm mũ) with half-life (thời gian bán rã). Score decreases exponentially, not linearly.

**Note**: The percentages shown in the table below are illustrative examples derived from the exponential decay formula. They must NOT be hard-coded; the formula is the source of truth.

| Days Since Last Practice | Listening/Reading (half-life ~420 days) | Speaking/Writing (half-life ~140 days) | Notes |
|--------------------------|----------------------------------------|----------------------------------------|-------|
| 0 days | 100% (no decay) | 100% (no decay) | No decay at start |
| 70 days | ~88% | ~71% | Exponential decay |
| 140 days | ~79% | ~50% | Half-life for speaking/writing |
| 210 days | ~71% | ~35% | Continued exponential decay |
| 420 days | ~50% | ~12% | Half-life for listening/reading |
| 840+ days | ~25% (floor at 0.3) | ~3% (floor at 0.3) | Floor at 30% of original score |

**Formula** (Exponential Decay):
```
daysSinceLastPractice = (now - lastUpdatedAt) / (24 * 60 * 60 * 1000)
halfLife = getHalfLifeForSkill(skill)  // 420 for listening/reading, 140 for speaking/writing
decayConstant = ln(0.5) / halfLife  // Natural log of 0.5 divided by half-life
decayFactor = exp(decayConstant × daysSinceLastPractice)  // Exponential decay
decayedScore = currentScore × max(decayFactor, 0.3)  // Floor at 0.3 (30%)
```

---

## 13. SRS Review Scoring Matrix (Ma trận Chấm Ôn tập)

| Review Type | Scoring Rule | Decay Reset | Notes |
|-------------|-------------|-------------|-------|
| Listening review | Same as regular lesson | Yes (if completed) | Passive skill, slow decay |
| Reading review | Same as regular lesson | Yes (if completed) | Passive skill, slow decay |
| Speaking review | Requires feedback | Yes (if completed) | Active skill, fast decay |
| Writing review | Requires feedback | Yes (if completed) | Active skill, fast decay |

**Rule**: SRS review must be completed (not just started) to reset decay. Partial completion does not reset decay.

---

## 14. Event → Score Update Mapping (Ánh xạ Sự kiện → Cập nhật Điểm)

| Event | Score Updated | Calculation Method | Service |
|-------|---------------|-------------------|---------|
| `learning.lesson.completed` | LessonScore, SkillScore | Aggregate ActivityScores, apply weights | motivation-progress-service |
| `assessment.quiz.submitted` | SkillScore | Aggregate quiz scores | motivation-progress-service |
| `mentoring.feedback.published` | SkillScore (speaking/writing) | Apply feedback score with author weight | motivation-progress-service |
| `curriculum.srs_items.due` | None (informational) | SRS review completion triggers `learning.lesson.completed` | practice-service (suggests review) |

---

## 15. Score Validation Rules (Quy tắc Kiểm tra Điểm)

| Validation | Rule | Error Action |
|------------|------|--------------|
| Score range | All scores must be 0.0 to 1.0 | Clamp to [0.0, 1.0] |
| Weight sum | Skill weights must sum to 1.0 | Normalize weights |
| Evidence count | Evidence count must be >= 0 | Set to 0 if negative |
| Timestamp | All timestamps must be ISO 8601 | Reject if invalid format |
| Skill type | Skill must be one of: listening, reading, speaking, writing | Reject if invalid |

---

---

## 16. Change Summary (Tóm tắt Thay đổi)

**ISSUE 1 — Decay Model Fixed**:
- Changed from linear decay to exponential decay (suy giảm hàm mũ) with half-life (thời gian bán rã)
- Updated Decay Rates Table to show only half-life values (removed "per 30 days" rate)
- Updated Time Decay Calculation Matrix to show exponential decay examples
- Updated formula to use exponential decay: `decayFactor = exp(decayConstant × daysSinceLastPractice)`

**ISSUE 2 — Evidence Minimum Enforcement Clarified**:
- Updated Evidence Minimums Matrix: removed "cap overallScore at 0.6", added mastery eligibility check per skill
- Updated Unlock Eligibility Matrix: clarified mastery eligibility requires both `overallScore >= 0.7` AND evidence minimum met per skill
- Added explanation: mastery eligibility is rule-output (not stored), computed from existing fields

**ISSUE 3 — Feedback Weight & Confidence Separated**:
- Updated Feedback Weight Table: separated authorWeight (trọng số) from confidenceCap (trần tin cậy)
- Clarified usage: score (điểm) and confidence (độ tin cậy) are independent
- Added note: "Confidence is not the same as score"

**ISSUE 4 — Daily Cap Precisely Defined**:
- Updated Daily Cap Table: defined as "delta increase (mức tăng thêm)" per skill per calendar day
- Added definition: day boundary uses user timezone (múi giờ người học)
- Clarified enforcement: per-skill tracking, no carryover, excess delta ignored

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - Rule tables defined  
**Related Documents**: 
- `docs/education/learning-state-scoring-rules.md` (Main document)
- `docs/architecture/learning-state-model.md` (STEP 5A)
