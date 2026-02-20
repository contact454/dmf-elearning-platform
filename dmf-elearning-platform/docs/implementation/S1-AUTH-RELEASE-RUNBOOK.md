# Sprint S1 Auth Release Runbook

**Date:** 2026-02-20  
**Scope:** `S1-01` -> `S1-15` (Auth & User Persistence Foundation)

## 1) Release Summary

- Completed JWT auth middleware and standardized auth error payload (`401`, `403`) in learning-service.
- Added explicit public/protected route matrix and exposed `GET /api/route-protection`.
- Added authenticated profile API: `GET /api/profile`, `PATCH /api/profile`.
- Removed mock-user dependency for protected vocabulary/reading/listening/speaking/writing/hub/review/streak flows.
- Completed frontend auth shell updates (Supabase provider, Google OAuth entry, callback route, protected route guard/session restore).
- Added targeted backend/frontend tests for auth and session lifecycle.

## 2) Environment Setup

### Backend (`services/learning-service`)

Use one of:

1. Preferred:
- `SUPABASE_JWT_SECRET`

2. Fallback:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Required hardening flags:
- `AUTH_ENFORCE_SUBJECT_MATCH=true`
- `AUTH_ALLOW_UNVERIFIED_JWT=false`

Templates:
- `services/learning-service/.env.example`
- `services/learning-service/.env.production.example`

### Frontend (`apps/web-learner`)

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Template:
- `apps/web-learner/.env.example`

## 3) Route Protection Map

- Source of truth:
  - `services/learning-service/src/routes/routeProtectionMatrix.ts`
- Runtime inspection endpoint:
  - `GET /api/route-protection`

Public examples:
- `GET /api/health`
- vocabulary/resource discovery endpoints

Protected examples:
- `GET /api/review/queue`
- `POST /api/review/submit`
- `GET /api/user/streak`
- `GET/PATCH /api/profile`
- user-bound progress endpoints under reading/listening/speaking/writing/hub

## 4) Verification Commands

Executed on 2026-02-20:

```bash
pnpm --filter learning-service test
```
- Result: PASS (8 test files, 152 tests)

```bash
pnpm --filter learning-service test -- src/routes/__tests__/audioRoutes.test.ts
```
- Result: PASS (17 tests, handler-level route tests to avoid sandbox listen restrictions)

```bash
pnpm --filter learning-service test -- src/routes/__tests__/auth-profile-routes.test.ts
```
- Result: PASS (5 tests)

```bash
pnpm --filter web-learner test -- \
  src/__tests__/auth-provider.test.tsx \
  src/__tests__/auth-login-page.test.tsx \
  src/__tests__/auth-middleware.test.ts
```
- Result: PASS (4 tests)
- Notes:
  - `auth-provider.test.tsx` now covers both session restore and `TOKEN_REFRESHED` lifecycle.

```bash
pnpm --filter web-learner exec eslint <touched S1 files>
```
- Result: 0 errors, 1 warning (`react-hooks/incompatible-library` on `watch()` in register page; non-blocking)

```bash
pnpm --filter web-learner build
```
- Result: PASS (outside sandbox network)

## 5) Manual Smoke Log (S1)

Checklist target:
1. Register new user -> login -> visit protected pages.
2. Complete one activity per module.
3. Refresh browser and re-open session.
4. Confirm per-user progress remains correct.

Current CLI run status (2026-02-20):

```bash
pnpm s1:auth-smoke
```

- Result: FAIL
- Reason: Supabase project requires email confirmation before password sign-in (`email_not_confirmed`)
- Notes:
  - Required env vars are now configured in local `.env` files.
  - Smoke run reaches sign-up and then fails at sign-in due auth policy.
- Script location: `scripts/s1-auth-smoke.mjs`

## 6) Local Execution Steps

1. Fill env files:
- `apps/web-learner/.env.local`
- `services/learning-service/.env`

2. Start services:
```bash
pnpm --filter learning-service dev
pnpm --filter web-learner dev
```

3. Run smoke:
```bash
pnpm s1:auth-smoke
```

4. Run targeted tests:
```bash
pnpm --filter learning-service test -- src/routes/__tests__/auth-profile-routes.test.ts
pnpm --filter web-learner test -- \
  src/__tests__/auth-provider.test.tsx \
  src/__tests__/auth-login-page.test.tsx \
  src/__tests__/auth-middleware.test.ts
```
