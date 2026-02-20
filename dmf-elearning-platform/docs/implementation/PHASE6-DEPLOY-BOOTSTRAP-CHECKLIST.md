# Phase 6 Deploy Bootstrap Checklist

**Date:** 2026-02-20  
**Scope:** MVP-ready deploy baseline for `learning-service` + `web-learner`

**Latest rehearsal report:** `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`

## 1) Preflight (Local CI Gate)

- [ ] `pnpm --filter learning-service build`
- [ ] `pnpm --filter learning-service test`
- [ ] `pnpm --filter web-learner build`
- [ ] `pnpm phase3:smoke:all` (with local DB + service running)

## 2) Backend Runtime Configuration (`learning-service`)

- [ ] Set production env:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_JWT_SECRET` (preferred)
  - [ ] `SUPABASE_URL` + `SUPABASE_ANON_KEY` (fallback path)
- [ ] Enable auth hardening:
  - [ ] `AUTH_ENFORCE_SUBJECT_MATCH=true`
  - [ ] `AUTH_ALLOW_UNVERIFIED_JWT=false`
- [ ] Enable baseline API rate limiting:
  - [ ] `RATE_LIMIT_ENABLED=true`
  - [ ] `RATE_LIMIT_WINDOW_MS=60000`
  - [ ] `RATE_LIMIT_MAX_REQUESTS=240`
  - [ ] `RATE_LIMIT_REVIEW_WINDOW_MS=60000`
  - [ ] `RATE_LIMIT_REVIEW_MAX_REQUESTS=120`
  - [ ] `RATE_LIMIT_AUDIO_WINDOW_MS=60000`
  - [ ] `RATE_LIMIT_AUDIO_MAX_REQUESTS=60`

## 3) Frontend Runtime Configuration (`web-learner`)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_LEARNING_SERVICE_URL` (or API gateway URL)
- [ ] Confirm locale routing + middleware auth redirects in production mode

## 4) Health + Smoke (Post-Deploy)

- [ ] Backend health: `GET /api/health` returns `200`
- [ ] Route protection map: `GET /api/route-protection` returns `200`
- [ ] Auth smoke: `pnpm s1:auth-smoke` passes against deployed backend
- [ ] Core loop smoke: review queue + submit + reading vocabulary save pass

## 5) Basic Ops Observability

- [ ] Centralize backend logs (provider logs or external sink)
- [ ] Set monitoring env baseline:
  - [ ] `REQUEST_LOGGING_ENABLED=true`
  - [ ] `REQUEST_LOG_INCLUDE_QUERY=false`
  - [ ] `REQUEST_LOG_SERVICE_NAME=learning-service`
  - [ ] `MONITORING_ALERTS_ENABLED=true`
  - [ ] `MONITORING_WINDOW_MS=60000`
  - [ ] `MONITORING_5XX_ALERT_THRESHOLD=5`
  - [ ] `MONITORING_429_ALERT_THRESHOLD=10`
  - [ ] `MONITORING_AUTH_ALERT_THRESHOLD=25`
  - [ ] `MONITORING_SLOW_REQUEST_MS=1500`
- [ ] Alert on:
  - [ ] sustained `5xx` rate
  - [ ] frequent `429` spikes
  - [ ] auth failures (`401`/`403`) anomalies
- [ ] Capture deployment metadata: commit SHA + deploy timestamp

## 6) Rollback Readiness

- [ ] Rollback runbook updated and accessible:
  - [ ] `docs/implementation/PHASE6-ROLLBACK-RUNBOOK.md`
- [ ] Keep previous deployment artifact/version available
- [ ] DB migration compatibility verified (forward/backward safety)
- [ ] Rollback command documented for hosting platform
