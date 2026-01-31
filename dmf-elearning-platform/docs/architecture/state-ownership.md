# State Ownership Rules
## Luật Sở Hữu Dữ Liệu

This document defines which service owns which state entities and who can read/write them. This prevents unauthorized state mutations and ensures clear boundaries.

---

## Overview

**Principle**: Each state entity has ONE owner service that has exclusive WRITE access. Other services can READ or REACT via events, but cannot directly mutate foreign state.

**Source of Truth**: See `docs/architecture/02-data-contracts.md` for entity ownership definitions.

---

## Core State Entities

### Attempt
- **Owner Service**: `practice-service`
- **Who can READ**: 
  - `analytics-service` (read-only tracking)
  - `mentoring-service` (read feedback context)
  - `curriculum-service` (check completion for unlocks)
- **Who can WRITE**: 
  - `practice-service` ONLY
- **Triggered by events**:
  - `learning.lesson.started` → Creates Attempt (status: in-progress)
  - `learning.lesson.completed` → Updates Attempt (status: completed)
  - `learning.lesson.abandoned` → Updates Attempt (status: abandoned)
- **Notes**: 
  - Attempt represents a single lesson session
  - Other services can read Attempt to make decisions (e.g., curriculum unlocks)
  - Only practice-service can create/update Attempt state

---

### Submission
- **Owner Service**: `practice-service`
- **Who can READ**: 
  - `assessment-service` (evaluate for scoring)
  - `mentoring-service` (generate feedback)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `practice-service` ONLY
- **Triggered by events**:
  - `learning.submission.created` → Creates Submission
- **Notes**: 
  - Submission represents a single answer to an activity
  - Other services can read Submission to evaluate or provide feedback
  - Only practice-service can create Submission state

---

### Progress (Unlocks)
- **Owner Service**: `curriculum-service`
- **Who can READ**: 
  - `practice-service` (check if lesson is unlocked)
  - `analytics-service` (read-only tracking)
  - `onboarding-service` (display user progress)
- **Who can WRITE**: 
  - `curriculum-service` ONLY
- **Triggered by events**:
  - `learning.lesson.completed` → May unlock next lesson/unit (if mastery threshold met)
  - `assessment.level_test.completed` → Unlocks initial units up to determined level
  - `assessment.quiz.submitted` → May unlock units (if level exam)
  - `system.user.registered` → Initializes empty progress state
- **Notes**: 
  - Progress tracks which units/lessons are unlocked for a user
  - Other services can read Progress to check unlock status
  - Only curriculum-service can unlock units (based on mastery, assessment, or manual)

---

### SRSItem (Spaced Repetition)
- **Owner Service**: `curriculum-service`
- **Who can READ**: 
  - `practice-service` (suggest review activities)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `curriculum-service` ONLY
- **Triggered by events**:
  - `curriculum.srs_items.due` → Updates SRSItem (due status)
  - Practice activities may update SRS intervals (via curriculum-service API)
- **Notes**: 
  - SRSItem tracks spaced repetition state (intervals, ease factor, next review)
  - practice-service can suggest review activities based on due items
  - Only curriculum-service can update SRS intervals and state

---

### Assessment
- **Owner Service**: `assessment-service`
- **Who can READ**: 
  - `onboarding-service` (read placement test results)
  - `curriculum-service` (read level exam results for unlocks)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `assessment-service` ONLY
- **Triggered by events**:
  - `assessment.quiz.started` → Creates Assessment (status: in-progress)
  - `assessment.quiz.submitted` → Updates Assessment (status: graded, score)
  - `assessment.level_test.completed` → Updates Assessment (status: graded, finalGrade)
- **Notes**: 
  - Assessment represents a formal test (quiz, placement, level exam)
  - Other services can read Assessment results to make decisions
  - Only assessment-service can create/update Assessment state

---

### SkillScore
- **Owner Service**: `motivation-progress-service` (or `assessment-service` if separate)
- **Who can READ**: 
  - `curriculum-service` (check mastery for unlocks)
  - `onboarding-service` (display skill levels)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `motivation-progress-service` ONLY (or `assessment-service` if separate)
- **Triggered by events**:
  - `learning.lesson.completed` → May update SkillScore (if mastery calculated)
  - `assessment.quiz.submitted` → May update SkillScore (if skill-specific quiz)
- **Notes**: 
  - SkillScore tracks granular proficiency (grammar, vocab, speaking, etc.)
  - Other services can read SkillScore to make decisions (e.g., unlocks)
  - Only motivation-progress-service can update SkillScore

---

### ReadinessResult
- **Owner Service**: `education/readiness-model` (computed, stateless)
- **Who can READ**: 
  - `onboarding-service` (display readiness status)
  - `curriculum-service` (check if ready for next level)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `education/readiness-model` ONLY (computed, not persisted directly)
- **Triggered by events**:
  - `assessment.level_test.completed` → Computes initial readiness
  - `assessment.quiz.submitted` → May recompute readiness (if placement test)
- **Notes**: 
  - ReadinessResult is computed by education layer (stateless logic)
  - Results may be cached by onboarding-service or curriculum-service
  - Education layer does NOT own persistent storage (per 02-data-contracts.md)

---

### Feedback
- **Owner Service**: `mentoring-service`
- **Who can READ**: 
  - `practice-service` (display feedback to user)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `mentoring-service` ONLY
- **Triggered by events**:
  - `mentoring.feedback.requested` → Creates Feedback (status: requested)
  - `mentoring.feedback.published` → Updates Feedback (status: published)
- **Notes**: 
  - Feedback represents AI/teacher/mentor feedback on a submission
  - Other services can read Feedback to display to users
  - Only mentoring-service can create/update Feedback state

---

### User
- **Owner Service**: `onboarding-service`
- **Who can READ**: 
  - All services (for user context)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `onboarding-service` ONLY
- **Triggered by events**:
  - `system.user.registered` → Creates User
  - `system.profile.updated` → Updates User (profile fields)
- **Notes**: 
  - User represents identity and profile
  - All services can read User for context
  - Only onboarding-service can create/update User state

---

### Enrollment
- **Owner Service**: `curriculum-service` (per 02-data-contracts.md)
- **Who can READ**: 
  - `onboarding-service` (link to user profile)
  - `analytics-service` (read-only tracking)
- **Who can WRITE**: 
  - `curriculum-service` ONLY
- **Triggered by events**:
  - `curriculum.course.enrolled` → Creates Enrollment
- **Notes**: 
  - Enrollment represents association between User and Course
  - onboarding-service may link enrollment to user profile for display
  - Only curriculum-service can create Enrollment state

---

## State Access Patterns

### Read Pattern
```typescript
// ✅ Allowed: Service reads foreign state
const attempt = await practiceService.getAttempt(attemptId);
if (attempt.status === 'completed') {
  // curriculum-service can read to make unlock decision
  await curriculumService.checkUnlock(userId, lessonId);
}
```

### Write Pattern
```typescript
// ✅ Allowed: Service writes its own state
await practiceService.updateAttempt(attemptId, { status: 'completed' });

// ❌ Forbidden: Service writes foreign state directly
await curriculumService.updateAttempt(attemptId, { status: 'completed' }); // NO!
```

### Event Reaction Pattern
```typescript
// ✅ Allowed: Service reacts to event and writes its own state
async function handleLessonCompleted(event: LearningEvent) {
  if (event.event_name === 'learning.lesson.completed') {
    // curriculum-service reads event and writes its own Progress state
    await curriculumService.unlockNextUnit(event.user_id, event.payload.lessonId);
  }
}
```

---

## Verification Checklist

Before implementing state access, verify:
- [ ] Service only WRITEs to state it owns
- [ ] Service REACTs to events to mutate its own state (not foreign state)
- [ ] Service calls domain services (not direct DB access to foreign state)
- [ ] Read access is documented and necessary
- [ ] Analytics/observability services are read-only

---

## Summary Table

| State Entity | Owner Service | Read Access | Write Access | Key Events |
|--------------|---------------|-------------|--------------|------------|
| Attempt | `practice` | analytics, mentoring, curriculum | practice ONLY | lesson.started, lesson.completed, lesson.abandoned |
| Submission | `practice` | assessment, mentoring, analytics | practice ONLY | submission.created |
| Progress | `curriculum` | practice, analytics, onboarding | curriculum ONLY | lesson.completed, level_test.completed, user.registered |
| SRSItem | `curriculum` | practice, analytics | curriculum ONLY | srs_items.due |
| Assessment | `assessment` | onboarding, curriculum, analytics | assessment ONLY | quiz.started, quiz.submitted, level_test.completed |
| SkillScore | `motivation-progress` | curriculum, onboarding, analytics | motivation-progress ONLY | lesson.completed, quiz.submitted |
| ReadinessResult | `education/readiness` | onboarding, curriculum, analytics | education/readiness ONLY (computed) | level_test.completed, quiz.submitted |
| Feedback | `mentoring` | practice, analytics | mentoring ONLY | feedback.requested, feedback.published |
| User | `onboarding` | all services | onboarding ONLY | user.registered, profile.updated |
| Enrollment | `curriculum` | onboarding, analytics | curriculum ONLY | course.enrolled |

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - All core states defined
