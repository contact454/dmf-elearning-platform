# Event → Domain Reaction Map
## Bản đồ Phản ứng từ Sự kiện

This document maps all 15 Domain Events to their emitters, consumers, and state changes. It ensures clear boundaries and prevents services from "imagining" automatic reactions.

---

## Overview

**Total Events**: 15  
**Purpose**: Define which services emit events, which services consume them, and what state changes are allowed.  
**Principle**: No service should both emit and consume the same event to mutate its own state (unless explicitly documented).

---

## Event Reaction Table

| Event Name | Emitter Service | Consumer Services | State Affected | Notes |
|-----------|----------------|-------------------|----------------|-------|
| `learning.lesson.started` | `practice` | `analytics` (read-only), `observability` (logging) | Attempt (status: in-progress) | Emitter creates Attempt state. Consumers only read/log. |
| `learning.lesson.completed` | `practice` | `curriculum` (unlock next), `motivation-progress` (update mastery), `analytics` (read-only) | Attempt (status: completed), Progress (unlocks), SkillScore (if applicable) | curriculum-service unlocks next lesson based on mastery. motivation-progress updates mastery scores. |
| `learning.lesson.abandoned` | `practice` | `analytics` (read-only), `observability` (logging) | Attempt (status: abandoned) | No state mutations by consumers. Analytics only. |
| `learning.submission.created` | `practice` | `assessment` (evaluate if needed), `mentoring` (queue feedback), `analytics` (read-only) | Submission (created) | assessment-service may evaluate for skill scoring. mentoring-service queues feedback request. |
| `assessment.quiz.started` | `assessment` | `analytics` (read-only), `observability` (logging) | Assessment (status: in-progress) | Emitter creates Assessment attempt. Consumers only read/log. |
| `assessment.quiz.submitted` | `assessment` | `onboarding` (update readiness if placement), `curriculum` (unlock if level test), `analytics` (read-only) | Assessment (status: graded), ReadinessResult (if placement), Progress (unlocks if level test) | onboarding-service updates readiness for placement tests. curriculum-service unlocks units for level exams. |
| `assessment.level_test.completed` | `assessment` | `onboarding` (set initial level), `curriculum` (unlock initial units), `analytics` (read-only) | ReadinessResult (initial level), Progress (initial unlocks) | onboarding-service sets user's initial CEFR level. curriculum-service unlocks units up to that level. |
| `curriculum.unit.unlocked` | `curriculum` | `analytics` (read-only), `observability` (logging) | Progress (unit unlocked) | Emitter owns Progress state. Consumers only read/log. |
| `curriculum.course.enrolled` | `curriculum` | `onboarding` (link enrollment), `analytics` (read-only) | Enrollment (created) | onboarding-service may link enrollment to user profile. curriculum-service owns Enrollment state. |
| `curriculum.srs_items.due` | `curriculum` | `practice` (suggest review), `analytics` (read-only) | SRSItem (due status) | practice-service may suggest SRS review activities. curriculum-service owns SRS state. |
| `mentoring.feedback.requested` | `mentoring` | `ai/content-tagging` (analyze submission), `analytics` (read-only) | Feedback (status: requested) | ai/content-tagging may analyze submission for feedback. mentoring-service owns Feedback state. |
| `mentoring.feedback.published` | `mentoring` | `practice` (notify user), `analytics` (read-only) | Feedback (status: published) | practice-service may notify user of feedback. mentoring-service owns Feedback state. |
| `system.user.registered` | `onboarding` | `curriculum` (initialize progress), `analytics` (read-only) | User (created), Progress (initialized) | curriculum-service initializes empty progress state. onboarding-service owns User state. |
| `system.user.login` | `onboarding` | `analytics` (read-only), `observability` (audit log) | None (read-only event) | No state mutations. Analytics and audit logging only. |
| `system.profile.updated` | `onboarding` | `curriculum` (recalculate if language changed), `analytics` (read-only) | User (profile fields) | curriculum-service may recalculate recommendations if target language changed. onboarding-service owns User state. |

---

## Detailed Event Reactions

### Learning Domain Events

#### `learning.lesson.started`
- **Emitter**: `practice-service`
- **Consumers**:
  - `analytics-service` → Read-only tracking (session start time, lesson ID)
  - `observability-service` → Logging and metrics
- **State Affected**: 
  - Attempt (created with status: in-progress) - owned by `practice-service`
- **Notes**: 
  - Emitter creates and owns Attempt state
  - Consumers MUST NOT mutate Attempt state
  - Consumers only read for analytics/logging

#### `learning.lesson.completed`
- **Emitter**: `practice-service`
- **Consumers**:
  - `curriculum-service` → Unlock next lesson/unit if mastery threshold met
  - `motivation-progress-service` → Update mastery scores and progress tracking
  - `analytics-service` → Read-only tracking (completion rate, time spent)
- **State Affected**:
  - Attempt (status: completed) - owned by `practice-service`
  - Progress (unlocks) - owned by `curriculum-service`
  - SkillScore (mastery updates) - owned by `motivation-progress-service`
- **Notes**:
  - `curriculum-service` reads event to determine if next unit should unlock
  - `motivation-progress-service` calculates mastery delta from score
  - Emitter MUST NOT unlock units itself (that's curriculum-service's job)

#### `learning.lesson.abandoned`
- **Emitter**: `practice-service`
- **Consumers**:
  - `analytics-service` → Read-only tracking (abandonment rate, time spent)
  - `observability-service` → Logging
- **State Affected**:
  - Attempt (status: abandoned) - owned by `practice-service`
- **Notes**:
  - No state mutations by consumers
  - Analytics only for engagement metrics

#### `learning.submission.created`
- **Emitter**: `practice-service`
- **Consumers**:
  - `assessment-service` → Evaluate submission for skill scoring (if applicable)
  - `mentoring-service` → Queue feedback request (if auto-feedback enabled)
  - `analytics-service` → Read-only tracking (submission types, correctness)
- **State Affected**:
  - Submission (created) - owned by `practice-service`
  - SkillScore (if evaluated) - owned by `assessment-service`
  - Feedback (queued) - owned by `mentoring-service`
- **Notes**:
  - `assessment-service` may evaluate submission for skill scoring
  - `mentoring-service` may auto-queue feedback based on submission type
  - Emitter owns Submission state

---

### Assessment Domain Events

#### `assessment.quiz.started`
- **Emitter**: `assessment-service`
- **Consumers**:
  - `analytics-service` → Read-only tracking (quiz start time)
  - `observability-service` → Logging
- **State Affected**:
  - Assessment (status: in-progress) - owned by `assessment-service`
- **Notes**:
  - Emitter creates and owns Assessment attempt
  - Consumers only read/log

#### `assessment.quiz.submitted`
- **Emitter**: `assessment-service`
- **Consumers**:
  - `onboarding-service` → Update readiness if this is a placement test
  - `curriculum-service` → Unlock units if this is a level exam
  - `analytics-service` → Read-only tracking (quiz scores, completion)
- **State Affected**:
  - Assessment (status: graded, score) - owned by `assessment-service`
  - ReadinessResult (if placement) - owned by `education/readiness-model` (computed)
  - Progress (unlocks if level exam) - owned by `curriculum-service`
- **Notes**:
  - `onboarding-service` reads event to update user's readiness level (placement tests)
  - `curriculum-service` reads event to unlock units (level exams)
  - Emitter owns Assessment state

#### `assessment.level_test.completed`
- **Emitter**: `assessment-service`
- **Consumers**:
  - `onboarding-service` → Set user's initial CEFR level
  - `curriculum-service` → Unlock initial units up to determined level
  - `analytics-service` → Read-only tracking (placement results)
- **State Affected**:
  - ReadinessResult (initial level) - owned by `education/readiness-model` (computed)
  - Progress (initial unlocks) - owned by `curriculum-service`
  - User (cefrLevel) - owned by `onboarding-service`
- **Notes**:
  - `onboarding-service` sets user's initial level in profile
  - `curriculum-service` unlocks units up to that level
  - This is typically the first assessment after registration

---

### Curriculum Domain Events

#### `curriculum.unit.unlocked`
- **Emitter**: `curriculum-service`
- **Consumers**:
  - `analytics-service` → Read-only tracking (unlock patterns, progression)
  - `observability-service` → Logging
- **State Affected**:
  - Progress (unit unlocked) - owned by `curriculum-service`
- **Notes**:
  - Emitter owns Progress state
  - Consumers only read/log
  - This event is emitted AFTER curriculum-service determines unlock (e.g., from mastery or assessment)

#### `curriculum.course.enrolled`
- **Emitter**: `curriculum-service`
- **Consumers**:
  - `onboarding-service` → Link enrollment to user profile
  - `analytics-service` → Read-only tracking (enrollment patterns)
- **State Affected**:
  - Enrollment (created) - owned by `curriculum-service` (per data contracts)
  - User (enrollments linked) - owned by `onboarding-service`
- **Notes**:
  - `onboarding-service` may link enrollment to user profile for display
  - `curriculum-service` owns Enrollment state (per 02-data-contracts.md)

#### `curriculum.srs_items.due`
- **Emitter**: `curriculum-service`
- **Consumers**:
  - `practice-service` → Suggest SRS review activities
  - `analytics-service` → Read-only tracking (SRS engagement)
- **State Affected**:
  - SRSItem (due status) - owned by `curriculum-service`
- **Notes**:
  - `practice-service` may suggest review activities based on due items
  - `curriculum-service` owns SRS state
  - This event is emitted when SRS items become due for review

---

### Mentoring Domain Events

#### `mentoring.feedback.requested`
- **Emitter**: `mentoring-service`
- **Consumers**:
  - `ai/content-tagging` → Analyze submission for feedback generation
  - `analytics-service` → Read-only tracking (feedback request patterns)
- **State Affected**:
  - Feedback (status: requested) - owned by `mentoring-service`
- **Notes**:
  - `ai/content-tagging` may analyze submission to generate feedback
  - `mentoring-service` owns Feedback state
  - AI provides signals, mentoring-service makes final decision

#### `mentoring.feedback.published`
- **Emitter**: `mentoring-service`
- **Consumers**:
  - `practice-service` → Notify user of feedback availability
  - `analytics-service` → Read-only tracking (feedback quality, response time)
- **State Affected**:
  - Feedback (status: published) - owned by `mentoring-service`
- **Notes**:
  - `practice-service` may notify user (UI update, notification)
  - `mentoring-service` owns Feedback state
  - Consumers MUST NOT modify Feedback state

---

### System Domain Events

#### `system.user.registered`
- **Emitter**: `onboarding-service`
- **Consumers**:
  - `curriculum-service` → Initialize empty progress state
  - `analytics-service` → Read-only tracking (registration patterns)
- **State Affected**:
  - User (created) - owned by `onboarding-service`
  - Progress (initialized empty) - owned by `curriculum-service`
- **Notes**:
  - `curriculum-service` initializes empty progress state for new user
  - `onboarding-service` owns User state
  - This is the first event after user registration

#### `system.user.login`
- **Emitter**: `onboarding-service`
- **Consumers**:
  - `analytics-service` → Read-only tracking (login frequency, session patterns)
  - `observability-service` → Audit logging
- **State Affected**:
  - None (read-only event)
- **Notes**:
  - No state mutations
  - Analytics and audit logging only
  - This event is for tracking, not state changes

#### `system.profile.updated`
- **Emitter**: `onboarding-service`
- **Consumers**:
  - `curriculum-service` → Recalculate recommendations if target language changed
  - `analytics-service` → Read-only tracking (profile update patterns)
- **State Affected**:
  - User (profile fields) - owned by `onboarding-service`
  - Progress (recommendations recalculated) - owned by `curriculum-service` (if language changed)
- **Notes**:
  - `curriculum-service` may recalculate recommendations if target language changed
  - `onboarding-service` owns User state
  - Consumers MUST NOT modify User state

---

## Key Principles

### 1. Single State Owner
- Each state entity has ONE owner service
- Only the owner service can WRITE to that state
- Other services can READ or REACT via events

### 2. No Self-Consumption for State Mutation
- A service should NOT emit an event and then consume it to mutate its own state
- Exception: If explicitly documented (e.g., async processing within same service)

### 3. Consumer Responsibilities
- Consumers REACT to events by:
  - Reading event payload
  - Calling domain services (not direct DB access)
  - Mutating ONLY their own state
  - Emitting new events if needed

### 4. Read-Only Consumers
- `analytics-service` and `observability-service` are read-only
- They MUST NOT mutate any state
- They only track, log, and analyze

---

## Verification Checklist

Before implementing event consumers, verify:
- [ ] Consumer service owns the state it wants to mutate
- [ ] Consumer does not mutate foreign state directly
- [ ] Consumer calls domain services (not direct DB access)
- [ ] Consumer emits new events if it creates state changes
- [ ] Analytics/observability services are read-only
- [ ] No circular event dependencies

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Complete - All 15 events mapped
