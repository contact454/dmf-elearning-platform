# DMF E-Learning Platform - Task Tracker

## NEXT
<!-- Tasks to be executed next. Only work on items listed here. -->

### Sprint S1 — Auth & User Persistence Foundation (2026-02-23 -> 2026-03-06)
**Source**: `docs/NEXT_SPRINT_ACTION_PLAN.md`  
**Objective**: Ship usable authentication so real users can sign in and keep learning progress across sessions.

**Scope (Must Ship)**:
- Supabase auth flow: email/password + Google OAuth.
- JWT verification middleware for protected API routes.
- User profile CRUD + learning preferences.
- Real `userId` persistence for progress (remove mock-user dependency).
- Session lifecycle baseline (refresh + logout handling).
- Minimum test coverage for critical auth/persistence flows.

**Out of Scope**:
- CQRS/event bus rollout.
- New microservices.
- Large content generation and gamification backend expansion.

**Execution Checklist**:
1. Backend/Auth API:
   - Finish auth middleware in `services/learning-service`.
   - Classify public vs protected routes.
   - Standardize auth error responses (`401`, `403`).
   - Add profile endpoints (`GET/PATCH`).
2. Frontend/Auth UX:
   - Integrate Supabase auth provider in app shell.
   - Add route guards for protected pages.
   - Implement login/register + Google OAuth entry.
   - Ensure session restore after refresh and proper logout cleanup.
3. Data Persistence:
   - Audit progress flows and remove mock user assumptions.
   - Bind progress writes/reads to authenticated `userId`.
   - Add migrations only if strictly required.
4. Testing & Verification:
   - Backend integration tests: protected routes, invalid/expired token, profile update, progress save/load.
   - Frontend tests: login success, protected redirect, session restore.

**Issue-Level Checklist (S1)**:
- [x] `S1-01` Auth middleware baseline in `services/learning-service`
  Deliverable: JWT verification middleware wired and reusable.
  Done when: invalid token -> `401`, missing token on protected route -> `401`.
- [x] `S1-02` Route protection matrix (public/protected)
  Deliverable: explicit route list and middleware application map.
  Done when: all protected progress/profile routes require auth.
- [x] `S1-03` Standard auth error format
  Deliverable: unified error payload for `401` and `403`.
  Done when: controllers return consistent structure across modules.
- [x] `S1-04` Profile API (`GET /profile`, `PATCH /profile`)
  Deliverable: read/update profile + learning preferences by authenticated user.
  Done when: profile reads/writes are tied to JWT user identity.
- [x] `S1-05` Frontend auth provider integration (`apps/web-learner`)
  Deliverable: Supabase auth provider in app shell.
  Done when: app bootstraps session and exposes auth state globally.
- [x] `S1-06` Login/Register + Google OAuth screens
  Deliverable: functional auth entry flows in UI.
  Done when: user can sign up, sign in, and OAuth callback completes.
- [x] `S1-07` Protected route guards in frontend
  Deliverable: redirect unauthenticated users from protected pages.
  Done when: guarded pages are inaccessible without active session.
- [x] `S1-08` Session lifecycle handling
  Deliverable: restore on refresh + logout cleanup.
  Done when: refresh keeps session; logout clears state and tokens.
- [x] `S1-09` Replace mock-user dependency in vocabulary progress
  Deliverable: vocabulary writes/reads use authenticated `userId`.
  Done when: progress persists per real account, not shared mock id.
- [x] `S1-10` Replace mock-user dependency in reading progress
  Deliverable: reading writes/reads use authenticated `userId`.
  Done when: reading state is isolated per user.
- [x] `S1-11` Replace mock-user dependency in listening progress
  Deliverable: listening writes/reads use authenticated `userId`.
  Done when: listening state survives refresh/re-login for same user.
- [x] `S1-12` Replace mock-user dependency in speaking/writing progress
  Deliverable: speaking and/or writing writes/reads use authenticated `userId`.
  Done when: at least one of speaking/writing domains is fully persistent.
- [x] `S1-13` Backend integration tests for auth + persistence
  Deliverable: tests for protected routes, token failure cases, profile update, progress save/load.
  Done when: `pnpm --filter @dmf/learning-service test` passes.
- [x] `S1-14` Frontend tests for auth flows
  Deliverable: tests for login success, protected redirect, session restore.
  Done when: `pnpm --filter @dmf/web-learner test` passes.
- [x] `S1-15` Sprint release verification
  Deliverable: final runbook and pass report.
  Done when: `pnpm lint`, `pnpm build`, `pnpm test` pass for touched modules and manual smoke checks are logged.

**Sprint Exit Criteria**:
- Users can register/login/logout in `apps/web-learner`.
- Protected endpoints reject missing/invalid auth consistently.
- Progress persists for at least 4 domains: vocabulary, reading, listening, speaking/writing.
- Progress remains correct after browser refresh/new session.
- `pnpm lint`, `pnpm build`, `pnpm test` pass for touched modules.

**Verification Commands**:
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm --filter @dmf/learning-service test`
- `pnpm --filter @dmf/web-learner test`

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

### MVP Finish Plan — Execution Backlog (S2-S6)
**Source**: `docs/PROJECT_ASSESSMENT_AND_ROADMAP.md` + `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`  
**Objective**: Close remaining MVP gaps in Phase 4/5/6 with small, verifiable increments.
**Execution Order**: S2 -> S3 -> S4 -> S5 -> S6 (no parallel sprint execution).

**Scope (Must Ship)**:
- Finish Phase 4 hardening (validation/error format/test coverage on remaining endpoints).
- Ship real TTS provider path with safe fallback behavior.
- Integrate gamification backend into active learner flows.
- Complete deploy rehearsal + monitoring hooks + rollback readiness.
- Reduce medium technical debt that blocks maintainability.

**Out of Scope**:
- New microservices or CQRS/event-bus expansion.
- Authentication redesign or RBAC redesign.
- Payment/monetization and non-MVP platform refactors.

**Issue-Level Checklist (MVP Finish)**:
- [x] `S2-01` M1-lite verification pass
  Deliverable: event bus + onboarding smoke + idempotency evidence re-validated against current branch.
  Done when: `pnpm m1:smoke` and targeted tests pass. (PASS: 2026-02-20)
- [x] `S2-02` M3 verification pass
  Deliverable: progress/mastery smoke + known blocker boundaries documented.
  Done when: `pnpm m3:smoke` passes and `BLOCKED` notes remain accurate. (PASS: 2026-02-20)
- [x] `S3-01` Standardize error envelope on non-core `learning-service` routes
  Deliverable: remaining routes return unified `error.code` + `error.message`.
  Done when: route tests assert consistent 4xx/5xx payload shapes. (DONE: 2026-02-20)
- [x] `S3-02` Apply Zod validation on remaining non-core/admin endpoints
  Deliverable: request bodies/params/queries validated before handlers execute.
  Done when: invalid payload tests return `VALIDATION_ERROR` consistently. (DONE: 2026-02-20)
- [x] `S3-03` Expand backend integration coverage
  Deliverable: route tests for remaining hardening surface.
  Done when: `pnpm --filter learning-service test` passes with new test cases. (PASS: 2026-02-20, 181 tests)
- [x] `S4-01` Production TTS provider path completion
  Deliverable: real provider flow with env-gated behavior and explicit fallback semantics.
  Done when: TTS service tests cover provider success/fallback/error branches. (DONE: 2026-02-20)
- [x] `S4-02` Audio API contract hardening
  Deliverable: audio routes return stable response contract across success/failure modes.
  Done when: route tests validate TTS + fallback payload consistency. (DONE: 2026-02-20)
- [x] `S5-01` Gamification backend integration in learner flow
  Deliverable: XP/streak/leaderboard data wired to active learner workflows.
  Done when: end-to-end learner actions update/read gamification state. (DONE: 2026-02-20)
- [x] `S5-02` Gamification API contract and tests
  Deliverable: stable API responses + integration tests for XP/streak/leaderboard.
  Done when: targeted backend tests and frontend flow tests pass. (DONE: 2026-02-20)
- [x] `S5-03` Frontend hook cleanup (`useApiQueries.ts` split)
  Deliverable: module-specific hooks replacing monolithic hook file.
  Done when: legacy hook size reduced and imports migrated without regression. (DONE: 2026-02-20)
- [x] `S5-04` API client consolidation (`lib/` vs `services/`)
  Deliverable: single source for HTTP client primitives in `web-learner`.
  Done when: duplicated client logic removed and tests/build pass. (DONE: 2026-02-20)
- [x] `S6-01` Deploy rehearsal end-to-end
  Deliverable: full run of Phase 6 checklist with recorded outcomes.
  Done when: rehearsal report updated with command outputs and results. (DONE: 2026-02-20)
- [x] `S6-02` Monitoring hooks baseline
  Deliverable: alert-ready signal for sustained `5xx`, `429`, and auth anomaly spikes.
  Done when: monitoring middleware emits expected signals in tests/smoke. (DONE: 2026-02-20)
- [x] `S6-03` Rollback readiness artifacts
  Deliverable: rollback steps + deployment metadata capture updated and verified.
  Done when: docs contain tested rollback commands and environment expectations. (DONE: 2026-02-20)
- [x] `S6-04` Request logging middleware baseline
  Deliverable: request-level structured logs with requestId/correlationId propagation + env-gated control.
  Done when: middleware tests and `learning-service` build pass with logging enabled defaults. (DONE: 2026-02-20)

**Verification Commands (per touched scope)**:
- `pnpm --filter learning-service build`
- `pnpm --filter learning-service test`
- `pnpm --filter @dmf/web-learner build`
- `pnpm --filter @dmf/web-learner test`
- `pnpm m1:smoke`
- `pnpm m3:smoke`
- `pnpm phase3:smoke:all`
- `pnpm lint`
- `pnpm build`

**Release Gate (MVP Finish)**:
- Remaining Phase 4 items no longer marked PARTIAL in roadmap docs.
- TTS path validated with explicit fallback and deterministic test coverage.
- Gamification integration verified in backend + learner-facing flows.
- Phase 6 rehearsal evidence documented with rollback and monitoring baseline.

---

## APPROVED
<!-- Tasks approved but not yet in NEXT. -->

---

## IN PROGRESS
<!-- Current work being executed. -->

- `2026-02-20` Sprint S3 hardening started:
  - Standardized `learning-service` app-level `404/500` error envelope.
  - Standardized `ReadingPassageController` error responses + added Zod validation for `/api/reading/passages` and `/api/reading/passages/:id`.
  - Standardized `ListeningController` error responses + added Zod validation for list/content/exercise lookup and content create/generate flows.
  - Standardized `ReadingController` error responses + added Zod validation for list/featured/topics/content lookup and admin create/generate/delete inputs.
  - Standardized `SpeakingController` + `WritingController` error responses and input validation (list/detail/history/admin write endpoints).
  - Added route regression tests in `learningLoopRoutes.supertest` for reading/listening/speaking/writing validation paths.
  - Verification:
    - `CODEX_SANDBOX_NETWORK_DISABLED=0 pnpm --filter learning-service test -- src/routes/__tests__/learningLoopRoutes.supertest.test.ts` (14 tests) PASS
    - `pnpm --filter learning-service build` PASS
    - `CODEX_SANDBOX_NETWORK_DISABLED=0 pnpm --filter learning-service test` (182 tests) PASS

- `2026-02-20` Sprint S4 TTS + audio hardening completed:
  - Refactored `ttsService` to provider-aware runtime with explicit fallback reasons and env-gated control.
  - Added runtime status contract (`getTtsRuntimeStatus`) and stabilized test reset hook (`__resetTtsServiceForTests`).
  - Hardened `/api/audio/:wordId` response contract with `source`, `provider`, `fallbackReason`, `fallbackRequired`, and `cached`.
  - Added `/api/audio/status` endpoint for provider readiness inspection.
  - Updated `learning-service` env templates with TTS production configuration (`TTS_*`, `GOOGLE_TTS_*`).
  - Verification:
    - `pnpm --filter learning-service test -- src/services/__tests__/ttsService.test.ts src/routes/__tests__/audioRoutes.test.ts` PASS (33 tests)
    - `pnpm --filter learning-service build` PASS
    - `CODEX_SANDBOX_NETWORK_DISABLED=0 pnpm --filter learning-service test` PASS (182 tests)

- `2026-02-20` Sprint S5 gamification + frontend debt cleanup completed:
  - Replaced temporary `501` locale gamification endpoints with real backend proxy routes and added root `/api/gamification/*` routes for hook compatibility.
  - Implemented XP/streak/leaderboard contract mapping in `web-learner` API layer with authenticated user binding.
  - Added streak check-in support in `gamification-service` (`GET /api/gamification/streak/:userId`, `POST /api/gamification/streak/check-in`).
  - Wired active learner flow to gamification by awarding XP after successful `POST /api/review/submit` (best-effort, non-blocking).
  - Added gamification route tests in `gamification-service` and frontend hook contract tests for points/streak/leaderboard.
  - Split monolithic `useApiQueries.ts` into module-specific hook files; reduced legacy file size from ~28KB (852 lines) to ~1.5KB (80 lines) via compatibility re-export.
  - Consolidated auth client primitives into shared `apps/web-learner/src/lib/api/auth-client.ts` and migrated duplicated token/401 handling in `services/api.ts`, `services/speakingApi.ts`, and `services/german-api.ts`.
  - Verification:
    - `pnpm --filter @dmf/gamification-service test` PASS (4 tests)
    - `pnpm --filter @dmf/gamification-service build` PASS
    - `pnpm --filter web-learner test -- src/hooks/__tests__/useGamification.test.tsx` PASS (3 tests)
    - `pnpm --filter web-learner build` PASS
    - `pnpm --filter web-learner test` FAIL (pre-existing unrelated failures in `Flashcard` and `useSpeakingQueries` test suites)

- `2026-02-20` Sprint S5 test stabilization + S6 deploy rehearsal completed:
  - Fixed failing `web-learner` suites by aligning tests with current component/hook contracts:
    - `apps/web-learner/src/components/vocabulary/__tests__/Flashcard.test.tsx`
    - `apps/web-learner/src/hooks/__tests__/useSpeakingQueries.test.tsx`
  - Verified full frontend test suite:
    - `pnpm --filter web-learner test` PASS (63 tests, 2 skipped)
  - Executed Phase 6 deploy rehearsal checklist and recorded evidence:
    - report: `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`
    - checklist linked to latest report in `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`
  - Rehearsal verification:
    - `pnpm --filter learning-service build` PASS
    - `pnpm --filter learning-service test` PASS (182 tests)
    - `pnpm --filter web-learner build` PASS
    - `pnpm phase3:smoke:all` PASS
    - `S1_SMOKE_USE_ADMIN=true S1_SMOKE_EMAIL_DOMAIN=gmail.com pnpm s1:auth-smoke` PASS (`protectedStatus=200`)
    - `curl http://127.0.0.1:3003/api/health` PASS (`200`)
    - `curl http://127.0.0.1:3003/api/route-protection` PASS (`200`)

- `2026-02-20` Sprint S6 monitoring + rollback readiness completed:
  - Added auth anomaly monitoring baseline in `learning-service` middleware:
    - `services/learning-service/src/middlewares/requestMonitoring.ts`
    - new windowed spike alert for combined `401/403` responses (`MONITORING_AUTH_ALERT_THRESHOLD`).
  - Expanded monitoring middleware tests:
    - `services/learning-service/src/middlewares/__tests__/requestMonitoring.test.ts`
    - includes `5xx`, `429`, and auth anomaly alert assertions.
  - Updated monitoring env templates:
    - `services/learning-service/.env.example`
    - `services/learning-service/.env.production.example`
    - added `MONITORING_AUTH_ALERT_THRESHOLD`.
  - Added rollback runbook with tested command flow + env expectations:
    - `docs/implementation/PHASE6-ROLLBACK-RUNBOOK.md`
  - Updated Phase 6 checklist/report with latest rehearsal + rollback drill evidence:
    - `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`
    - `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`
  - Verification:
    - `pnpm --filter learning-service test -- src/middlewares/__tests__/requestMonitoring.test.ts` PASS (5 tests)
    - `pnpm --filter learning-service test` PASS (183 tests)
    - `pnpm --filter learning-service build` PASS
    - rollback drill (outside sandbox):
      - `PRE_ROLLBACK HEALTH=200 ROUTE=200`
      - `POST_ROLLBACK HEALTH=200 ROUTE=200`
      - env backup captured: `/tmp/learning-service.env.20260220T142318Z`

- `2026-02-20` Sprint S6 observability closeout (`S6-04`) completed:
  - Added `requestLogging` middleware in `learning-service` bootstrap:
    - `services/learning-service/src/middlewares/requestLogging.ts`
    - `services/learning-service/src/index.ts`
  - Added request logging middleware tests:
    - `services/learning-service/src/middlewares/__tests__/requestLogging.test.ts`
    - covers generated/inbound request IDs, correlation propagation, and `2xx/4xx/5xx` log levels.
  - Updated env templates with request logging controls:
    - `services/learning-service/.env.example`
    - `services/learning-service/.env.production.example`
    - added `REQUEST_LOGGING_ENABLED`, `REQUEST_LOG_INCLUDE_QUERY`, `REQUEST_LOG_SERVICE_NAME`.
  - Updated deploy docs:
    - `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`
    - `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`
    - `docs/implementation/S6-CLOSEOUT-PR-SUMMARY-2026-02-20.md`
  - Verification:
    - `pnpm --filter learning-service test -- src/middlewares/__tests__/requestLogging.test.ts src/middlewares/__tests__/requestMonitoring.test.ts` PASS (9 tests)
    - `pnpm --filter learning-service build` PASS

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
