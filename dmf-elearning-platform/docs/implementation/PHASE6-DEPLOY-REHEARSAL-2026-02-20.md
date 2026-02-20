# Phase 6 Deploy Rehearsal Report (2026-02-20)

**Date (UTC):** 2026-02-20  
**Scope:** `learning-service` + `web-learner` MVP deploy bootstrap rehearsal  
**Commit SHA:** `c47b9c48d5588e1cc3baaf74f2a7aaa678d147a7`

## 1) Preflight (Local CI Gate)

| Check | Command | Result |
|---|---|---|
| learning-service build | `pnpm --filter learning-service build` | PASS |
| learning-service test | `pnpm --filter learning-service test` | PASS (183 tests) |
| web-learner build | `pnpm --filter web-learner build` | PASS |
| Phase 3 smoke | `pnpm phase3:smoke:all` | PASS |

## 2) Backend Runtime Configuration (`learning-service`)

Validated key presence in `services/learning-service/.env`:

- `NODE_ENV`: set
- `DATABASE_URL`: set
- `SUPABASE_JWT_SECRET`: missing
- `SUPABASE_URL`: set
- `SUPABASE_ANON_KEY`: set
- `AUTH_ENFORCE_SUBJECT_MATCH`: set
- `AUTH_ALLOW_UNVERIFIED_JWT`: set
- `RATE_LIMIT_ENABLED`: set
- `RATE_LIMIT_WINDOW_MS`: set
- `RATE_LIMIT_MAX_REQUESTS`: set
- `RATE_LIMIT_REVIEW_WINDOW_MS`: set
- `RATE_LIMIT_REVIEW_MAX_REQUESTS`: set
- `RATE_LIMIT_AUDIO_WINDOW_MS`: set
- `RATE_LIMIT_AUDIO_MAX_REQUESTS`: set

Status: **PASS with note** (`SUPABASE_JWT_SECRET` should be added for production-preferred verification path).

## 3) Frontend Runtime Configuration (`web-learner`)

Validated key presence in `apps/web-learner/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: set
- `NEXT_PUBLIC_LEARNING_SERVICE_URL`: set
- `NEXT_PUBLIC_LEARNING_API_URL`: set

Status: **PASS**

## 4) Health + Smoke (Post-Deploy style checks)

| Check | Command | Result |
|---|---|---|
| Backend health | `curl http://127.0.0.1:3003/api/health` | PASS (`200`) |
| Route protection map | `curl http://127.0.0.1:3003/api/route-protection` | PASS (`200`) |
| Auth smoke | `S1_SMOKE_USE_ADMIN=true S1_SMOKE_EMAIL_DOMAIN=gmail.com pnpm s1:auth-smoke` | PASS (`protectedStatus=200`) |
| Core loop smoke | `pnpm phase3:smoke:all` | PASS |

Observed payload snapshots:

- `/api/health`: `{"success":true,"message":"Learning Service is running",...}`
- `/api/route-protection`: `{"success":true,"data":[...]}`

## 5) Basic Ops Observability

Current baseline evidence:

- `requestLogging` middleware tests pass (`services/learning-service/src/middlewares/__tests__/requestLogging.test.ts`), including:
  - requestId/correlationId propagation via headers
  - status-level logging (`2xx` -> info, `4xx` -> warn, `5xx` -> error)
- `requestMonitoring` middleware tests pass (`services/learning-service/src/middlewares/__tests__/requestMonitoring.test.ts`), including:
  - `5xx` spike detection
  - `429` spike detection
  - `401/403` auth anomaly detection
- `rateLimit` middleware tests pass (`services/learning-service/src/middlewares/__tests__/rateLimit.test.ts`).
- Monitoring env baselines documented in:
  - `services/learning-service/.env.example`
  - `services/learning-service/.env.production.example`
  - `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`

Status: **PASS (baseline hooks + tests)**  
Remaining outside repo scope: provider-side alert routing/integration.

## 6) Rollback Readiness

Rehearsal artifacts captured:

- Commit SHA captured: `c47b9c48d5588e1cc3baaf74f2a7aaa678d147a7`
- Rehearsal timestamp captured: `2026-02-20T13:34:18Z`
- Rollback runbook updated: `docs/implementation/PHASE6-ROLLBACK-RUNBOOK.md`
- Local rollback drill verified:
  - pre-rollback: `HEALTH=200`, `ROUTE=200`
  - post-rollback restart: `HEALTH=200`, `ROUTE=200`
  - env backup artifact: `/tmp/learning-service.env.20260220T142318Z`

Status: **PASS (runbook + tested local rollback commands + env expectations)**  
Remaining outside repo scope: hosting-platform specific rollback invocation.

## Rehearsal Verdict

- **S6-01 exit condition met**: checklist run completed and outcomes recorded with concrete pass/blocked results.
- No code-level blocker found in deploy bootstrap rehearsal scope.
