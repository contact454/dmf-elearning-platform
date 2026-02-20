# Phase 6 Deploy Rehearsal Report

**Date:** 2026-02-20  
**Scope:** Local rehearsal against `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`  
**Commit context:** post hardening + rate-limit bootstrap

## 1) Preflight (Local CI Gate)

- `pnpm --filter learning-service build` -> **PASS**
- `pnpm --filter learning-service test` -> **PASS** (`163 passed`, `4 skipped`)
- `pnpm --filter web-learner build` -> **PASS**
- `pnpm phase3:smoke:all` -> **PASS**

## 2) Backend Runtime Config Check (`services/learning-service/.env`)

- `NODE_ENV` -> **PRESENT** (value exists; production value not enforced in this local rehearsal)
- `DATABASE_URL` -> **PRESENT**
- `SUPABASE_JWT_SECRET` -> **MISSING** (currently fallback verification path in use)
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` -> **PRESENT**
- `AUTH_ENFORCE_SUBJECT_MATCH` -> **PRESENT**
- `AUTH_ALLOW_UNVERIFIED_JWT` -> **PRESENT**
- `RATE_LIMIT_*` vars -> **MISSING** in local `.env` (service uses built-in defaults from code)

## 3) Frontend Runtime Config Check (`apps/web-learner/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` -> **PRESENT**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> **PRESENT**
- `NEXT_PUBLIC_LEARNING_SERVICE_URL` -> **MISSING**

## 4) Health + Smoke

- `GET /api/health` -> **PASS** (`200`)
- `GET /api/route-protection` -> **PASS** (`200`)
- `pnpm s1:auth-smoke` (service started locally in rehearsal command) -> **PASS** (`protectedStatus=200`)
- Core loop smoke (`pnpm phase3:smoke:all`) -> **PASS**

## 5) Observability / Rollback Sections

- Centralized logs/alerts (`5xx`, `429`, auth anomaly) -> **NOT VERIFIED** (infra-level)
- Deployment metadata capture -> **NOT VERIFIED** (pipeline-level)
- Rollback artifact/migration compatibility/runbook -> **NOT VERIFIED** (platform-level)

## 6) Rehearsal Verdict

**Result:** **PASS with production-prep gaps**  

Remaining gaps before production cut:
1. Set explicit `RATE_LIMIT_*` values in production env (do not rely on defaults).
2. Prefer setting `SUPABASE_JWT_SECRET` in backend runtime for local signature verification.
3. Set `NEXT_PUBLIC_LEARNING_SERVICE_URL` in frontend runtime.
4. Complete infra-level observability + rollback checklist items.

