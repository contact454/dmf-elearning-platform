# DMF E-Learning - Next Sprint Action Plan

**Date:** 2026-02-20  
**Sprint window (proposed):** 2026-02-23 to 2026-03-06 (2 weeks)  
**Source:** `docs/PROJECT_ASSESSMENT_AND_ROADMAP.md`

## 0) Status Update (2026-02-20)

1. `pnpm s1:auth-smoke` passed on real Supabase (`protectedStatus=200`).
2. Core loop DB smoke scripts are in place and passing:
   - `pnpm phase3:smoke`
   - `pnpm phase3:smoke:feedback`
   - `pnpm phase3:smoke:all`
3. Phase 4 hardening expanded:
   - core protected controllers now read userId from JWT context
   - Zod validation + standardized `VALIDATION_ERROR`/`INTERNAL_ERROR` applied on core learning loop writes
   - `learningLoopRoutes.supertest` passing outside sandbox
4. Phase 6 deploy bootstrap started:
   - baseline API rate limiting active in `learning-service` (`/api`, `/api/review`, `/api/audio`)
   - deployment checklist added: `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`
5. Next priority shifted from core implementation to stabilization:
   - manual auth UX verification (email-confirm + refresh/auto-logout)
   - validation/error-format hardening across remaining non-core endpoints
   - staging deploy rehearsal + basic monitoring alerts

## 1) Sprint Goal

Ship a usable authentication foundation so real users can sign in and keep progress across sessions.

## 2) Sprint Scope

### In Scope (Must Ship)

1. Complete auth flow (email/password + Google OAuth via Supabase).
2. JWT verification middleware for protected API routes.
3. User profile CRUD + learning preferences.
4. Persist learning progress by real `userId` (remove mock-user dependency).
5. Session management baseline (refresh + logout handling).
6. Minimum auth test coverage for critical flows.

### Out of Scope (Do Not Start This Sprint)

1. CQRS/event bus rollout.
2. New microservices.
3. Large content generation campaign (Phase 2).
4. Full gamification backend logic.
5. Broad refactor of architecture docs.

## 3) Success Criteria (Sprint Exit)

1. Users can register/login/logout from `apps/web-learner`.
2. Protected backend routes reject invalid or missing tokens with consistent error format.
3. At least 4 progress domains persist by real user identity:
   - vocabulary review progress
   - reading progress
   - listening progress
   - speaking or writing progress
4. Page refresh and new session still show correct user progress.
5. CI-level checks pass for touched modules (`build`, `lint`, `test`).

## 4) Work Breakdown

### Track A - Backend/Auth API

1. Add/finish auth middleware in `services/learning-service`.
2. Define protected route policy:
   - public: health, docs (if any), login callbacks
   - protected: all progress, submission, personalized dashboard endpoints
3. Standardize auth error response:
   - `401` invalid/expired token
   - `403` forbidden role/scope
4. Add profile endpoints (get/update profile, preferences).

### Track B - Frontend/Auth UX

1. Integrate Supabase auth provider in app shell.
2. Add guard for protected routes/pages.
3. Implement login/register screens and Google OAuth entry.
4. Ensure session rehydration on reload and proper logout cleanup.

### Track C - Data Persistence

1. Audit progress tables and remove mock user assumptions.
2. Bind writes/reads to authenticated `userId`.
3. Add migration(s) only if schema gaps exist.
4. Backfill strategy for existing local test data (simple script or reset note).

### Track D - Testing and Verification

1. Backend integration tests for:
   - auth required routes
   - token expired/invalid paths
   - profile update
   - progress save/load by user
2. Frontend tests for:
   - login success path
   - protected page redirect
   - session restore after refresh

## 5) Week-by-Week Plan

### Week 1 (Foundation)

1. Finalize auth middleware and route protection.
2. Implement profile APIs and frontend auth shell integration.
3. Complete user-bound persistence for 2 core domains (vocabulary + reading).

### Week 2 (Completion + Hardening)

1. Complete remaining persistence domains (listening + speaking/writing).
2. Finish login/register UX and session lifecycle.
3. Add integration tests and fix regressions.
4. Stabilize and prepare release notes.

## 6) Risks and Mitigations

1. **Risk:** Supabase token handling mismatch between frontend and backend.  
   **Mitigation:** lock one JWT verification approach and document it in `services/learning-service`.
2. **Risk:** Existing endpoints rely on implicit mock user.  
   **Mitigation:** add temporary compatibility mapping only for local dev; remove before sprint close.
3. **Risk:** Low existing test coverage causes regression.  
   **Mitigation:** enforce test checklist for every auth/persistence endpoint touched.

## 7) Definition of Done

1. Scope items in Section 2 (In Scope) are complete.
2. No mock user dependency in protected progress flows.
3. Tests added for critical auth and persistence scenarios.
4. Documentation updated:
   - endpoint protection map
   - auth environment variables
   - local setup/run steps

## 8) Verification Checklist

Run from repository root:

```bash
pnpm lint
pnpm build
pnpm test
```

Optional targeted verification during development:

```bash
pnpm --filter @dmf/learning-service test
pnpm --filter @dmf/web-learner test
```

Manual smoke checks:

1. Register new user -> login -> visit protected pages.
2. Complete one activity in each implemented module.
3. Refresh browser and re-open session.
4. Confirm progress remains correct for the same user.

## 9) Expected Sprint Artifacts

1. Auth-ready frontend flow in `apps/web-learner`.
2. Protected API + profile endpoints in `services/learning-service`.
3. Persisted user progress without mock user coupling.
4. Test suite updates for core auth/persistence paths.
