# DMF E-Learning Platform - Task Tracker

## NEXT
<!-- Tasks to be executed next. Only work on items listed here. -->

### M1-lite — System Foundations (no auth tokens per hard ban)
**Objective**: Wire real EventBus infrastructure and make onboarding handlers emit/consume events with idempotency; implement register/profile update flows without authentication logic.
**Scope**:
- Replace NoOpEventBus with minimal in-memory bus (at-least-once semantics, correlationId/idempotency key support).
- Update onboarding handlers (register-user, submit-placement-test, update-user-profile) to use bus, validate inputs via existing JSON schemas.
- Add contract-first E2E smoke path covering register → profile update using the bus (no login/auth).
- Document verification steps.
**Out of Scope**: Login/auth tokens, persistence layer, external brokers.
**Verification**: `pnpm -r lint && pnpm -r test` (targeted packages) + new E2E smoke script runs.

### M3 — Progress & Mastery (scope, verify)
**Objective**: Consume learning events to update ProgressState (progress-service) and MasteryState (motivation-progress-service); expose read models and dashboard.
**Scope**:
- progress-service: in-memory ProgressState + processed-events dedupe; consumers for `system.user.registered`, `curriculum.course.enrolled`, `learning.lesson.started`, `learning.lesson.completed`; `GET /api/learner/courses/:courseId/progress`, `GET /api/learner/dashboard` (progress part).
- motivation-progress-service: in-memory MasteryState + SkillScore; sharedEventBus; consumers for `system.user.registered`, `curriculum.course.enrolled`, `learning.lesson.completed`, `learning.submission.created`, `assessment.quiz.submitted`, `mentoring.feedback.published`, `system.profile.updated`; scoring rules (0.7 threshold, 0.6 floor, weight/decay per docs); `GET /api/read/mastery/:userId`, `GET /api/learner/mastery`.
- EventBus/idempotency: dedupe by eventId; log duplicates gently, no panic.
- Smoke: `pnpm m3:smoke` (in-process event chain + assert progress/mastery); E2E step 7 (query progress + mastery); allow mastery 404 when cross-process.
**Verify**:
- `pnpm --filter @dmf/progress-service build && pnpm --filter @dmf/motivation-progress-service build`
- `pnpm m3:smoke` (run in real terminal; tsx EPERM in sandbox possible)
- `pnpm --filter @dmf/e2e e2e:local` (includes step 7; motivation 404 tolerated)
**BLOCKER**:
- Cross-process event delivery: E2E runs services in separate processes; sharedEventBus is per-process. Progress/motivation do not receive events from practice/onboarding. Use `pnpm m3:smoke` for in-process verification.
- Unit unlock + `curriculum.unit.unlocked`: requires curriculum-service read-only API (unit/lesson structure, prerequisites). Without it, only `completedLessons` updated; unlock and emit skipped.
- `learning.submission.created` / `mentoring.feedback.published`: payload `userId` often omitted; consumers assume it when available. External emitters must include `userId` for mastery updates.

---

## APPROVED
<!-- Tasks approved but not yet in NEXT. -->

---

## IN PROGRESS
<!-- Current work being executed. -->

---

## COMPLETED
<!-- Finished tasks. -->

### Initialize @dmf/shared core TypeScript types
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Initialized `@dmf/shared` package with complete TypeScript type definitions aligned to `contracts/schemas/`. All required IDs, enums, entities, and contract DTOs are implemented. Package structure is valid and ready for import as `@dmf/shared`.

**Changes**:
- Added missing IDs: `ReadinessResultId`, `SRSItemId`
- Aligned enums with schema values (AttemptStatus, ActivityType, FeedbackAuthor)
- Updated entities to match schema properties exactly (Activity, SRSItem, ReadinessResult, Feedback)
- Added `MentoringReport` entity from mentoring.schema.json
- Added `SubmitWritingInput` contract DTO
- All types properly exported from `src/index.ts`

**Files Modified**:
- `packages/shared/src/ids/index.ts`
- `packages/shared/src/enums/index.ts`
- `packages/shared/src/entities/index.ts`
- `packages/shared/src/contracts/index.ts`

---

### Freeze Shared Types (Step 1)
**Status**: ✅ DONE & FROZEN  
**Date**: 2024-12-19  
**Summary**: Validated and aligned all `@dmf/shared` types against `contracts/schemas/`. Fixed optional/required field mismatches. Created comprehensive guidelines document. Types are now frozen and stable.

**Validation Results**:
- ✅ Compared all entities with schemas - found and fixed 8 mismatches
- ✅ All optional/required fields now match schema `required` arrays
- ✅ All field names and types aligned with schemas
- ✅ No invented fields - all fields exist in schemas

**Fixes Applied**:
- `LearnerProfile.goals`: Made optional (not in schema required)
- `Course.unitIds`: Made optional (not in schema required)
- `Unit.courseId`: Made optional (not in schema required)
- `Unit.lessonIds`: Made optional (not in schema required)
- `Lesson.unitId`: Made optional (not in schema required)
- `Lesson.contentReference`: Made optional (not in schema required)
- `Activity.lessonId`: Made optional (not in schema required)
- `Submission.timestamp`: Made optional (not in schema required)

**Deliverables**:
- ✅ Created `docs/architecture/shared-types-guidelines.md` with:
  - Purpose and import rules
  - Entity vs DTO guidelines
  - Naming conventions
  - Optional/required field rules
  - Change policy (freeze status)
  - Bilingual glossary
  - Verification checklist

**Files Modified**:
- `packages/shared/src/entities/index.ts` (8 field optionality fixes)
- `docs/architecture/shared-types-guidelines.md` (created)
- `task.md` (updated)

**Status**: 🧊 **FROZEN** - Shared types are stable and should not change without explicit approval and schema updates.

---

### Domain Events Types (Step 2)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Created typed Domain Events in `@dmf/shared/src/events/` based on `contracts/events/events.catalog.md`. All 15 events are now strongly typed with payloads. Created comprehensive guidelines document.

**Implementation**:
- ✅ Created `DomainEvent<TName, TPayload>` envelope aligned with `events.schema.json`
- ✅ Created `EventName` union type from catalog (15 events total)
- ✅ Created typed payloads for all 5 domains:
  - Learning: 4 events (lesson.started, lesson.completed, lesson.abandoned, submission.created)
  - Assessment: 3 events (quiz.started, quiz.submitted, level_test.completed)
  - Curriculum: 3 events (unit.unlocked, course.enrolled, srs_items.due)
  - Mentoring: 2 events (feedback.requested, feedback.published)
  - System: 3 events (user.registered, user.login, profile.updated)
- ✅ All payloads use types from `@dmf/shared` (IDs, enums)
- ✅ Exported all events from `packages/shared/src/index.ts`

**Files Created**:
- `packages/shared/src/events/envelope.ts` - DomainEvent envelope
- `packages/shared/src/events/catalog.ts` - EventName union types
- `packages/shared/src/events/learning.ts` - Learning domain events
- `packages/shared/src/events/assessment.ts` - Assessment domain events
- `packages/shared/src/events/curriculum.ts` - Curriculum domain events
- `packages/shared/src/events/mentoring.ts` - Mentoring domain events
- `packages/shared/src/events/system.ts` - System domain events
- `packages/shared/src/events/index.ts` - Public exports
- `docs/architecture/domain-events-guidelines.md` - Guidelines document

**Files Modified**:
- `packages/shared/src/index.ts` - Added events export

**Deliverables**:
- ✅ All 15 events typed with payloads
- ✅ Generic `DomainEvent` envelope with optional versioning
- ✅ Guidelines document with:
  - Why events exist (anti-hallucination)
  - Event naming convention
  - Payload principles (minimal, stable, schema-aligned)
  - Versioning rules
  - When to emit events (services only, not apps)
  - Bilingual glossary
  - Usage examples

**Event Structure**:
```typescript
DomainEvent<TName, TPayload> {
    event_name: TName;
    timestamp: string; // ISO 8601
    user_id: UserId;
    session_id?: string | AttemptId;
    payload: TPayload;
    context?: EventContext;
    version?: string;
}
```

---

### Event Payload Review & Semantics Freeze (Step 2B)
**Status**: ✅ DONE & SEMANTICS FROZEN  
**Date**: 2024-12-19  
**Summary**: Audited all 15 event payloads for anti "học ảo" measurement support. Applied minimal fixes to ensure payloads are "vừa đủ" (sufficient but minimal). Created comprehensive payload specification document. Event payload semantics are now frozen.

**Audit Results**:
- ✅ Reviewed all 15 events against anti "học ảo" criteria
- ✅ Verified outcome signals (completion, scores, mastery)
- ✅ Verified action traceability (lessonId, attemptId, submissionId)
- ✅ Ensured minimal but sufficient payloads (no marketing-style tracking bloat)
- ✅ Confirmed privacy-safe payloads (no large text blobs, no PII)

**Minimal Payload Adjustments** (4 fixes):
1. **`learning.submission.created`**: Added `type: SubmissionType` (required) - distinguishes speaking vs writing for skill measurement
2. **`assessment.quiz.submitted`**: Added `score: number` (required) - required for anti "học ảo" measurement
3. **`curriculum.unit.unlocked`**: Added `reason: 'mastery' | 'assessment' | 'manual' | 'srs'` (required) - distinguishes achievement-based unlocks from manual/admin unlocks
4. **`mentoring.feedback.published`**: Added `author: FeedbackAuthor` (required) - distinguishes AI vs human feedback (quality signal)

**Files Modified**:
- `packages/shared/src/events/learning.ts` - Added `type` to `SubmissionCreatedPayload`
- `packages/shared/src/events/assessment.ts` - Added `score` and `levelHint?` to `QuizSubmittedPayload`
- `packages/shared/src/events/curriculum.ts` - Added `reason` to `UnitUnlockedPayload`
- `packages/shared/src/events/mentoring.ts` - Added `author` and `targetAttemptId?` to `FeedbackPublishedPayload`
- `docs/architecture/domain-events-guidelines.md` - Added reference to payload spec

**Files Created**:
- `docs/architecture/domain-events-payload-spec.md` - Comprehensive payload specification with:
  - Overview and semantics freeze policy
  - Field conventions (camelCase, types, privacy)
  - Detailed spec table for all 15 events (required/optional fields, anti "học ảo" signals)
  - Anti "học ảo" measurement matrix
  - Change workflow and versioning policy
  - Verification checklist

**Deliverables**:
- ✅ All 15 events audited and validated
- ✅ 4 minimal payload adjustments applied (all required for anti "học ảo")
- ✅ Comprehensive payload spec document with tables per event
- ✅ Semantics freeze policy documented
- ✅ Anti "học ảo" measurement matrix created

**Anti "Học Ảo" Signals Verified**:
- ✅ `learning.lesson.completed`: Outcome (`status`), Mastery (`score?`)
- ✅ `learning.submission.created`: Action trace, Type signal (`type`)
- ✅ `assessment.quiz.submitted`: Outcome (`score`), Level hint (`levelHint?`)
- ✅ `curriculum.unit.unlocked`: Outcome (`reason`), Quality signal (`reason`)
- ✅ `mentoring.feedback.published`: Quality signal (`author`)

**Status**: 🧊 **SEMANTICS FROZEN** - Event payload semantics are locked. Any breaking changes require: schema update → shared types → documentation → coordinated release.

---

### OpenAPI MVP Paths Map (Step 3A)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Created comprehensive OpenAPI spec for API Gateway MVP with 12 endpoints. Mapped all endpoints to service ownership and domain events. Created API documentation. This is a schema-first blueprint with no runtime implementation.

**Implementation**:
- ✅ Created/updated `contracts/openapi/api-gateway.openapi.yaml` with 12 MVP endpoints
- ✅ All endpoints reference `@dmf/shared` DTOs where available
- ✅ Created new schemas in OpenAPI for missing DTOs (marked with TODO for migration)
- ✅ Mapped endpoints to service ownership (onboarding, curriculum, practice, assessment, mentoring, system)
- ✅ Documented event emission for each endpoint
- ✅ Included standard error response schema
- ✅ Added tags per module/domain
- ✅ All endpoints have operationId

**Endpoints Defined** (12 total):
1. `POST /onboarding/placement` - Placement test submission
2. `POST /curriculum/enroll` - Course enrollment
3. `GET /curriculum/next` - Next lesson/unit recommendation
4. `POST /practice/lesson/start` - Start lesson attempt
5. `POST /practice/lesson/complete` - Complete/abandon lesson
6. `POST /practice/submission` - Submit activity answer
7. `POST /assessment/quiz/start` - Start quiz attempt
8. `POST /assessment/quiz/submit` - Submit quiz answers
9. `POST /mentoring/feedback/request` - Request feedback
10. `POST /mentoring/feedback/publish` - Publish feedback
11. `POST /system/user/register` - User registration
12. `POST /system/user/login` - User login
13. `PATCH /system/user/profile` - Update profile

**Service Ownership**:
- **Onboarding**: 4 endpoints (placement, register, login, profile)
- **Curriculum**: 2 endpoints (enroll, next)
- **Practice**: 3 endpoints (start, complete, submission)
- **Assessment**: 2 endpoints (start, submit)
- **Mentoring**: 2 endpoints (request, publish)

**DTOs Referenced from @dmf/shared**:
- `CreateAttemptInput` - Used by `/practice/lesson/start`
- `SubmitSpeakingInput` - Used by `/practice/submission`
- `SubmitWritingInput` - Used by `/practice/submission`
- `RecordFeedbackInput` - Used by `/mentoring/feedback/publish`

**New Schemas Created** (TODO: Move to @dmf/shared):
- `SubmitPlacementInput`, `PlacementTestResponse`
- `EnrollCourseInput`, `EnrollmentResponse`
- `NextCurriculumResponse`
- `CompleteLessonInput`, `LessonCompletionResponse`
- `AttemptResponse`, `SubmissionResponse`
- `StartQuizInput`, `QuizAttemptResponse`, `SubmitQuizInput`, `QuizSubmissionResponse`
- `RequestFeedbackInput`, `FeedbackRequestResponse`, `FeedbackResponse`
- `RegisterUserInput`, `UserResponse`, `LoginUserInput`, `LoginResponse`, `UpdateProfileInput`
- `ErrorResponse` (standard error schema)

**Files Created**:
- `contracts/openapi/api-gateway.openapi.yaml` - Complete OpenAPI 3.0.3 spec
- `docs/architecture/api-map.md` - Endpoint table with ownership, purpose, request/response
- `docs/architecture/api-to-events-mapping.md` - Detailed mapping of endpoints to events (success/failure paths, data linkage)

**Event Mappings**:
- All endpoints document which domain events they emit on success
- Failure paths emit no events (error responses only)
- Data linkage documented (IDs from request/response → event payloads)
- Session correlation documented (`attemptId` as `session_id`)

**Verification**:
- ✅ OpenAPI spec is well-formed YAML
- ✅ All endpoints have operationId
- ✅ All endpoints have tags
- ✅ Standard ErrorResponse schema included
- ✅ All endpoints reference DTOs or have new schemas
- ✅ Event emissions documented per endpoint

**Status**: ✅ **BLUEPRINT COMPLETE** - Ready for scaffolding. No runtime implementation yet.

---

### Implement Contracts (Schemas + Shared Types) (Step 4B)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Created JSON schemas for all command contracts and corresponding TypeScript DTOs in `@dmf/shared`. All schemas align with existing contracts and use shared types. Bilingual comments added to TypeScript files.

**Implementation**:
- ✅ Created JSON schemas under `contracts/commands/<service>/*.schema.json` for all 12 commands
- ✅ Created TypeScript DTOs in `packages/shared/src/contracts/` with bilingual comments
- ✅ All DTOs use existing ID types and enums from `@dmf/shared`
- ✅ Updated exports in `packages/shared/src/contracts/index.ts`
- ✅ No breaking changes to existing contracts

**Command Schemas Created** (24 files - input + output for each):
- **Onboarding** (6 files):
  - `registerUser.input.schema.json`, `registerUser.output.schema.json`
  - `submitPlacementTest.input.schema.json`, `submitPlacementTest.output.schema.json`
  - `updateUserProfile.input.schema.json`, `updateUserProfile.output.schema.json`
- **Curriculum** (4 files):
  - `enrollInCourse.input.schema.json`, `enrollInCourse.output.schema.json`
  - `unlockUnit.input.schema.json`, `unlockUnit.output.schema.json`
- **Practice** (2 files):
  - `completeLessonAttempt.input.schema.json`, `completeLessonAttempt.output.schema.json`
- **Assessment** (4 files):
  - `startQuiz.input.schema.json`, `startQuiz.output.schema.json`
  - `submitQuiz.input.schema.json`, `submitQuiz.output.schema.json`
- **Mentoring** (2 files):
  - `requestFeedback.input.schema.json`, `requestFeedback.output.schema.json`
- **Motivation-Progress** (2 files):
  - `updateSkillScore.input.schema.json`, `updateSkillScore.output.schema.json`

**TypeScript DTOs Created** (5 files):
- `packages/shared/src/contracts/enroll.ts` - EnrollInCourseInput, EnrollInCourseOutput
- `packages/shared/src/contracts/complete.ts` - CompleteLessonAttemptInput, CompleteLessonAttemptOutput
- `packages/shared/src/contracts/quiz.ts` - StartQuizInput, StartQuizOutput, SubmitQuizInput, SubmitQuizOutput
- `packages/shared/src/contracts/feedback.ts` - RequestFeedbackInput, RequestFeedbackOutput
- `packages/shared/src/contracts/skill.ts` - UpdateSkillScoreInput, UpdateSkillScoreOutput

**Files Modified**:
- `packages/shared/src/contracts/index.ts` - Added bilingual comments to existing DTOs, exported new DTOs

**Alignment Verified**:
- ✅ All schemas use existing enum values from contracts/schemas
- ✅ All DTOs use existing ID types (UserId, CourseId, AttemptId, etc.)
- ✅ All DTOs use existing enums (UserRole, CEFRLevel, SkillType, etc.)
- ✅ Required/optional fields match schema `required` arrays
- ✅ No duplicate type definitions
- ✅ Bilingual comments in TypeScript (English + Vietnamese)

**Verification**:
- ✅ No linter errors
- ✅ All imports resolve correctly
- ✅ All exports properly structured
- ✅ Types align with JSON schemas

**Status**: ✅ **COMPLETE** - All command contracts implemented. Ready for Step 4C.

---

### Service Boundary Stubs (Step 4C)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Created service boundary stubs (handlers) for all command contracts. All handlers validate input, return output DTOs, and emit typed domain events. EventBus interface created with no-op implementation. No business logic implemented yet - only stubs.

**Implementation**:
- ✅ Created EventBus interface and NoOpEventBus implementation (no dependencies)
- ✅ Created command handlers for all 6 service domains
- ✅ All handlers use typed DomainEvent from @dmf/shared
- ✅ All handlers emit events from existing catalog (15 events)
- ✅ Input validation placeholders added (TODO for JSON schema validation)
- ✅ Bilingual comments added (English + Vietnamese)

**Handlers Created** (12 handlers total):

**Onboarding Service** (3 handlers):
- `register-user.handler.ts` - RegisterUserHandler → emits `system.user.registered`
- `submit-placement-test.handler.ts` - SubmitPlacementTestHandler → emits `assessment.level_test.completed`
- `update-user-profile.handler.ts` - UpdateUserProfileHandler → emits `system.profile.updated`

**Curriculum Service** (2 handlers):
- `enroll-in-course.handler.ts` - EnrollInCourseHandler → emits `curriculum.course.enrolled`
- `unlock-unit.handler.ts` - UnlockUnitHandler → emits `curriculum.unit.unlocked`

**Practice Service** (3 handlers):
- `start-lesson-attempt.handler.ts` - StartLessonAttemptHandler → emits `learning.lesson.started`
- `complete-lesson-attempt.handler.ts` - CompleteLessonAttemptHandler → emits `learning.lesson.completed` OR `learning.lesson.abandoned`
- `submit-activity.handler.ts` - SubmitActivityHandler → emits `learning.submission.created`

**Assessment Service** (2 handlers):
- `start-quiz.handler.ts` - StartQuizHandler → emits `assessment.quiz.started`
- `submit-quiz.handler.ts` - SubmitQuizHandler → emits `assessment.quiz.submitted`

**Mentoring Service** (2 handlers):
- `request-feedback.handler.ts` - RequestFeedbackHandler → emits `mentoring.feedback.requested`
- `publish-feedback.handler.ts` - PublishFeedbackHandler → emits `mentoring.feedback.published`

**Motivation-Progress Service** (1 handler):
- `update-skill-score.handler.ts` - UpdateSkillScoreHandler → no events (internal state update)

**Files Created**:
- `services/shared/event-bus.ts` - EventBus interface and NoOpEventBus implementation
- `services/onboarding/handlers/` - 3 handler files
- `services/curriculum/handlers/` - 2 handler files
- `services/practice/handlers/` - 3 handler files
- `services/assessment/handlers/` - 2 handler files
- `services/mentoring/handlers/` - 2 handler files
- `services/motivation-progress/handlers/` - 1 handler file

**Key Features**:
- ✅ All handlers use @dmf/shared types (IDs, enums, DTOs)
- ✅ All handlers emit typed DomainEvent from @dmf/shared
- ✅ EventBus interface allows swapping implementations (no-op for now)
- ✅ Input validation TODOs added (no dependencies added)
- ✅ Bilingual comments throughout (English + Vietnamese)
- ✅ No business logic - only stubs with TODOs

**Event Emission**:
- All handlers emit events from `contracts/events/events.catalog.md` (15 events)
- Events use typed payloads from `packages/shared/src/events/`
- Events include proper envelope (event_name, timestamp, user_id, session_id, payload)
- No events invented - all from existing catalog

**Verification**:
- ✅ No linter errors
- ✅ All imports resolve correctly
- ✅ All handlers use typed events
- ✅ No new dependencies added
- ✅ EventBus is interface-based (no-op implementation)

**Status**: ✅ **STUBS COMPLETE** - Ready for business logic implementation. Handlers are wired to emit events correctly.

---

### Learning State Model (Step 5A)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Designed canonical learning state model (ProgressState, MasteryState, ReadinessState) for DMF Hybrid language learning. Mapped all 15 domain events to state updates. Defined ownership rules and anti "học ảo" requirements. Created minimal JSON schemas.

**Implementation**:
- ✅ Designed 3 state objects with ownership rules
- ✅ Mapped all 15 domain events to state updates
- ✅ Defined single writer per state principle
- ✅ Documented anti "học ảo" requirements
- ✅ Created minimal JSON schemas for progress and mastery (readiness schema already exists)

**State Objects Defined**:
1. **ProgressState** (owned by `curriculum-service`):
   - Tracks unlocked/completed units/lessons
   - Current position in learning path
   - Unlock rules require mastery >= 0.7

2. **MasteryState** (owned by `motivation-progress-service`):
   - Per-skill proficiency (listening, reading, speaking, writing)
   - Per-lesson/unit mastery scores
   - Critical for anti "học ảo" (completion without mastery should not pass readiness)

3. **ReadinessState** (owned by `education/readiness-model`, computed):
   - Current CEFR level
   - Readiness for next level
   - Blockers preventing progress
   - Confidence score

**Event Mapping**:
- ✅ All 15 events mapped to state updates
- ✅ State update order defined (MasteryState before ProgressState, etc.)
- ✅ Anti "học ảo" measurement matrix created
- ✅ Consumer services identified for each event

**Files Created**:
- `docs/architecture/learning-state-model.md` - Complete state model documentation
- `docs/architecture/learning-state-event-mapping.md` - Event → state update mapping
- `contracts/schemas/progress.schema.json` - ProgressState JSON schema
- `contracts/schemas/mastery.schema.json` - MasteryState JSON schema

**Key Principles**:
- Single writer per state (one service owns writes)
- MasteryState must be updated before ProgressState unlock check
- ReadinessState computed from MasteryState + Assessment results
- Anti "học ảo": completion without mastery should not pass readiness gates

**MVP Boundaries**:
- ✅ Rule-based scoring (no ML)
- ✅ Per-skill mastery tracking
- ✅ Readiness gate basics
- ❌ No ML personalization
- ❌ No adaptive difficulty
- ❌ No long-term prediction

**Status**: ✅ **COMPLETE** - Learning state model defined. Ready for Step 5B (Progress Calculation Rules).

---

### Learning State Model — Architectural Fixes (Step 5A Fixes)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Fixed exactly 4 architectural inconsistencies identified during STEP 5A review. Corrected ownership, clarified computation vs persistence, added MVP boundaries, and narrowed event conditions.

**Fixes Applied**:

1. **ProgressState Ownership Correction**:
   - Changed owner from `curriculum-service` to `progress-service`
   - curriculum-service is now read-only and emits unlock intent via events
   - Separation prevents mixing curriculum rules (luật học) with learner state (trạng thái người học)

2. **ReadinessState Computation vs Persistence Clarification**:
   - Clarified that ReadinessState is computed by `education/readiness-model` (pure, stateless) AND cached by `assessment-service` (with version field)
   - Added lifecycle section: Compute → Cache → Invalidate → Recompute
   - Resolved contradiction: computation logic is stateless, cached results have version field

3. **MasteryState Data Weight Reduction (MVP Boundary)**:
   - Added explicit MVP note: `unitMastery` is DERIVED and OPTIONAL in MVP
   - `skillScores` and `lessonMastery` are core (required)
   - `unitMastery` can be computed on-demand from `lessonMastery` to reduce storage and improve scalability

4. **Safe Handling of system.profile.updated Event**:
   - Narrowed condition: only reset/recompute states if `learningLanguage` changed
   - Do NOT reset on UI language, avatar, notification, or other profile changes
   - Added anti-pattern warning: "Không được reset state khi chỉ đổi UI/ngôn ngữ hiển thị"

**Files Modified**:
- `docs/architecture/learning-state-model.md` - Updated ownership, added MVP notes, clarified ReadinessState lifecycle
- `docs/architecture/learning-state-event-mapping.md` - Updated all ownership references, narrowed system.profile.updated condition

**Key Changes**:
- ProgressState owner: `curriculum-service` → `progress-service`
- ReadinessState: clarified computation (pure) vs caching (with version)
- MasteryState: `unitMastery` marked as optional/derived in MVP
- system.profile.updated: only triggers reset if `learningLanguage` changed

**Status**: ✅ **FIXES APPLIED** - All 4 architectural issues resolved. Ready for Step 5B (Progress Calculation Rules).

---

### Progress & Mastery Calculation Rules (Step 5B)
**Status**: ✅ DONE  
**Date**: 2024-12-19  
**Summary**: Created comprehensive rule-based scoring documentation for MVP. Defined ActivityScore, LessonScore, UnitScore, and SkillScore calculation rules. Established thresholds, weighting, feedback scoring, decay, and anti "học ảo" guardrails. All rules align with STEP 5A (Learning State Model).

**Implementation**:
- ✅ Defined 4 score objects (ActivityScore, LessonScore, UnitScore, SkillScore)
- ✅ Established MVP thresholds (mastered_lesson_threshold = 0.7, readiness_skill_floor = 0.6)
- ✅ Created skill weights by CEFR level (A1-C2)
- ✅ Defined feedback weights (Teacher > Mentor > AI)
- ✅ Created speaking/writing rubrics (4 dimensions each)
- ✅ Defined decay rates per skill (listening/reading: 5% per 30 days, speaking/writing: 15% per 30 days)
- ✅ Established anti-gaming guardrails (evidence minimums, daily caps, unlock requirements)
- ✅ Provided pseudo-code for key functions (updateMasteryFromLessonCompleted, applyDecay, etc.)

**Deliverables**:
1. **`docs/education/learning-state-scoring-rules.md`** (Main document):
   - Score objects definitions
   - Thresholds and "completed" vs "mastered" distinction
   - Weighting rules (skill weights by CEFR, feedback weights)
   - Feedback scoring (speaking/writing rubrics)
   - Decay & SRS rules
   - Anti-gaming guardrails
   - Implementation notes with pseudo-code
   - Bilingual glossary (EN-VI)

2. **`docs/education/learning-state-scoring-tables.md`** (Rule tables):
   - Thresholds table
   - Skill weights by CEFR level matrix
   - Feedback weight table
   - Decay rates table
   - Daily cap table
   - Speaking rubric table
   - Writing rubric table
   - Evidence minimums matrix
   - Unlock eligibility matrix
   - Score calculation flow matrix
   - Anti "học ảo" guardrails matrix
   - Time decay calculation matrix
   - SRS review scoring matrix
   - Event → score update mapping
   - Score validation rules

**Key Rules Defined**:
- **Mastery Threshold**: `overallScore >= 0.7` for lesson to be "mastered"
- **Readiness Floor**: All 4 skills must be >= 0.6 for readiness gate
- **Evidence Minimums**: 3 activities per skill (listening/reading/speaking), 2 for writing
- **Feedback Requirement**: Speaking/writing require feedback to count mastery
- **AI Feedback Cap**: AI feedback contribution capped at 0.8 (80%)
- **Decay Rates**: Listening/reading decay 5% per 30 days, speaking/writing decay 15% per 30 days
- **Daily Cap**: Limit score increase per day to prevent spam

**Alignment with STEP 5A**:
- ✅ Thresholds match (0.7 for mastery, 0.6 for readiness)
- ✅ Service ownership respected (motivation-progress-service owns MasteryState, progress-service owns ProgressState)
- ✅ Event-driven updates align (learning.lesson.completed → MasteryState update)
- ✅ Unlock requires mastery (not just completion)
- ✅ No contradictions with Learning State Model

**Anti "Học Ảo" Guardrails**:
1. Evidence minimums (prevent "1 correct = mastery")
2. Daily caps (prevent spam)
3. Feedback requirement (speaking/writing require evaluation)
4. AI feedback cap (reduce AI hallucination risk)
5. Mastery threshold (unlock requires mastery >= 0.7)
6. Unit completion (all lessons must be mastered)

**Verification**:
- ✅ No linter errors
- ✅ All thresholds align with STEP 5A
- ✅ All service ownership respected
- ✅ No new events created
- ✅ Pseudo-code functions have clear inputs/outputs
- ✅ Bilingual glossary complete

**Status**: ✅ **COMPLETE** - Scoring rules defined for MVP. Ready for implementation.

---

## BLOCKED
<!-- Tasks that cannot proceed due to missing information or dependencies. -->

- **M3 cross-process events**: Progress/motivation consume events only in same process. E2E uses separate processes; mastery 404 in step 7 is accepted. Run `pnpm m3:smoke` for in-process check.
- **M3 unit unlock**: `curriculum.unit.unlocked` emission and unlock logic need curriculum-service read-only API.

---

## NOTES
- Follow `.rules/ANTIGRAVITY.md` strictly
- Types must align with `contracts/schemas/` and `packages/shared/`
- No new dependencies without approval
- No auth, database, or framework scaffolding unless explicitly approved
