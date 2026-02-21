# Phase 6 Rollback Runbook

**Date:** 2026-02-20  
**Scope:** `learning-service` MVP rollback readiness  
**Related:** `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`

## 1) Environment Expectations

Required before rollback:

- Previous deploy artifact/version is available (image tag or release package).
- `DATABASE_URL` points to the same environment as the target rollback release.
- Auth settings remain consistent:
  - `AUTH_ENFORCE_SUBJECT_MATCH=true`
  - `AUTH_ALLOW_UNVERIFIED_JWT=false`
- Rate-limit/monitoring baselines are explicitly set:
  - `RATE_LIMIT_*`
  - `MONITORING_*`
- One verified credential path exists for JWT verification:
  - Preferred: `SUPABASE_JWT_SECRET`
  - Fallback: `SUPABASE_URL` + `SUPABASE_ANON_KEY`

## 2) Deployment Metadata Capture

Capture metadata before rollback:

```bash
git rev-parse HEAD
date -u +"%Y-%m-%dT%H:%M:%SZ"
cp services/learning-service/.env /tmp/learning-service.env.$(date -u +"%Y%m%dT%H%M%SZ")
```

## 3) Rollback Commands (Local Drill, Tested)

Tested drill sequence (start -> verify -> restart/rollback -> verify):

```bash
pkill -f 'ts-node --transpile-only src/index.ts' || true
cd services/learning-service
nohup pnpm exec ts-node --transpile-only src/index.ts >/tmp/dmf-learning-service.log 2>&1 &
curl -sS -m 5 -o /tmp/dmf-health-pre.json -w '%{http_code}' http://127.0.0.1:3003/api/health
curl -sS -m 5 -o /tmp/dmf-route-pre.json -w '%{http_code}' http://127.0.0.1:3003/api/route-protection

# Simulated rollback restart
pkill -f 'ts-node --transpile-only src/index.ts' || true
nohup pnpm exec ts-node --transpile-only src/index.ts >/tmp/dmf-learning-service.log 2>&1 &
curl -sS -m 5 -o /tmp/dmf-health-post.json -w '%{http_code}' http://127.0.0.1:3003/api/health
curl -sS -m 5 -o /tmp/dmf-route-post.json -w '%{http_code}' http://127.0.0.1:3003/api/route-protection
pkill -f 'ts-node --transpile-only src/index.ts' || true
```

## 4) Verified Results (2026-02-20)

- `METADATA_SHA`: `c47b9c48d5588e1cc3baaf74f2a7aaa678d147a7`
- `METADATA_TS`: `20260220T142318Z`
- `ENV_BACKUP`: `/tmp/learning-service.env.20260220T142318Z`
- `PRE_ROLLBACK`: `HEALTH=200`, `ROUTE=200`
- `POST_ROLLBACK`: `HEALTH=200`, `ROUTE=200`

## 5) Post-Rollback Validation

Minimum checks:

```bash
pnpm --filter learning-service build
pnpm --filter learning-service test
S1_SMOKE_USE_ADMIN=true S1_SMOKE_EMAIL_DOMAIN=gmail.com pnpm s1:auth-smoke
pnpm phase3:smoke:all
```
