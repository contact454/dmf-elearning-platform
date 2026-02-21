# Phase 6 Deploy Rehearsal Report

> Superseded by: `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`

**Date:** 2026-02-20  
**Scope:** Local rehearsal against `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`  
**Commit context:** post Phase 4 non-core alignment + Phase 6 monitoring hooks

## 1) Preflight (Local CI Gate)

- `pnpm --filter learning-service build` -> **PASS**
- `pnpm --filter learning-service test` -> **PASS** (`167 passed`, `4 skipped`)
- `pnpm --filter web-learner build` -> **PASS**
- `pnpm phase3:smoke:all` -> **PASS**

## 2) Backend Runtime Config Check (`services/learning-service/.env`)

- `NODE_ENV` -> **PRESENT** (`development` in local rehearsal)
- `DATABASE_URL` -> **PRESENT**
- `SUPABASE_JWT_SECRET` -> **MISSING** (fallback verification path is being used)
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` -> **PRESENT**
- `AUTH_ENFORCE_SUBJECT_MATCH` -> **PRESENT** (`true`)
- `AUTH_ALLOW_UNVERIFIED_JWT` -> **PRESENT** (`false`)
- `RATE_LIMIT_*` vars -> **PRESENT**
- `MONITORING_*` vars -> **MISSING in local `.env`** (defaults from code still apply)

## 3) Frontend Runtime Config Check (`apps/web-learner/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` -> **PRESENT**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> **PRESENT**
- `NEXT_PUBLIC_LEARNING_SERVICE_URL` -> **PRESENT** (`http://localhost:3003`)

## 4) Health + Smoke

- `GET /api/health` on local rehearsal service -> **PASS** (`200`)
- `GET /api/route-protection` on local rehearsal service -> **PASS** (`200`)
- `pnpm s1:auth-smoke` with `LEARNING_SERVICE_URL=http://127.0.0.1:3003` -> **PASS** (`protectedStatus=200`)
- Core loop smoke (`pnpm phase3:smoke:all`) -> **PASS**

## 5) Manual Auth UX Coverage

- Email confirmation UX (real browser flow) -> **NOT VERIFIED in CLI**
- Refresh token lifecycle/auto-logout timing in browser -> **NOT VERIFIED in CLI**

## 6) Observability / Rollback Sections

- Centralized backend log sink -> **NOT VERIFIED** (infra-level)
- Alert routing for sustained `5xx` / `429` / auth anomaly -> **PARTIAL**  
  Runtime hooks in service are now present; provider alert integration is pending.
- Deployment metadata capture (SHA + deploy timestamp) -> **NOT VERIFIED** (pipeline-level)
- Rollback artifact/migration compatibility/runbook -> **NOT VERIFIED** (platform-level)

## 7) Rehearsal Verdict

**Result:** **PASS with production-prep gaps**

Remaining gaps before production cut:
1. Set `SUPABASE_JWT_SECRET` in production backend runtime (preferred verification path).
2. Set explicit `MONITORING_*` env values in production (do not rely only on defaults).
3. Run manual browser auth UX pass (email confirm + refresh + auto-logout).
4. Finish infra-level alert routing and rollback checks in hosting platform.
