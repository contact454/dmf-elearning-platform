# S6 Closeout PR Summary (2026-02-20)

## 1) Proposed PR Title

`feat(learning-service): complete S6 observability/rollback baseline + add request logging middleware`

## 2) Scope

- Close out Phase 6 deploy readiness:
  - deploy rehearsal evidence
  - rollback runbook + drill evidence
  - monitoring baseline for `5xx`, `429`, and auth anomaly spikes
- Start next backlog ticket (`S6-04`) by adding request logging middleware to `learning-service`.

## 3) Code/Docs Included

Backend runtime:
- `services/learning-service/src/middlewares/requestMonitoring.ts`
- `services/learning-service/src/middlewares/requestLogging.ts`
- `services/learning-service/src/index.ts`

Tests:
- `services/learning-service/src/middlewares/__tests__/requestMonitoring.test.ts`
- `services/learning-service/src/middlewares/__tests__/requestLogging.test.ts`

Environment templates:
- `services/learning-service/.env.example`
- `services/learning-service/.env.production.example`

Deploy/rollback docs:
- `docs/implementation/PHASE6-DEPLOY-BOOTSTRAP-CHECKLIST.md`
- `docs/implementation/PHASE6-DEPLOY-REHEARSAL-2026-02-20.md`
- `docs/implementation/PHASE6-ROLLBACK-RUNBOOK.md`

Tracking:
- `task.md`

## 4) Verification Evidence

Executed and passing:

```bash
pnpm --filter web-learner test
pnpm --filter learning-service test -- src/middlewares/__tests__/requestMonitoring.test.ts
pnpm --filter learning-service test -- src/middlewares/__tests__/requestLogging.test.ts src/middlewares/__tests__/requestMonitoring.test.ts
pnpm --filter learning-service test
pnpm --filter learning-service build
pnpm --filter web-learner build
pnpm phase3:smoke:all
S1_SMOKE_USE_ADMIN=true S1_SMOKE_EMAIL_DOMAIN=gmail.com pnpm s1:auth-smoke
```

Rehearsal/rollback evidence:
- `curl http://127.0.0.1:3003/api/health` -> `200`
- `curl http://127.0.0.1:3003/api/route-protection` -> `200`
- rollback drill pre/post checks -> `HEALTH=200`, `ROUTE=200`

## 5) Merge Checklist

- [ ] Diff only contains intended S6/S6-04 files.
- [ ] `pnpm --filter learning-service test` passes.
- [ ] `pnpm --filter learning-service build` passes.
- [ ] `pnpm --filter web-learner test` passes.
- [ ] `pnpm --filter web-learner build` passes.
- [ ] `pnpm phase3:smoke:all` passes.
- [ ] `pnpm s1:auth-smoke` passes (outside sandbox).
- [ ] Rehearsal report and rollback runbook paths are correct.

## 6) Deploy Checklist (Prod)

- [ ] Apply env baseline:
  - `REQUEST_LOGGING_ENABLED=true`
  - `REQUEST_LOG_INCLUDE_QUERY=false`
  - `REQUEST_LOG_SERVICE_NAME=learning-service`
  - `MONITORING_ALERTS_ENABLED=true`
  - `MONITORING_5XX_ALERT_THRESHOLD=5`
  - `MONITORING_429_ALERT_THRESHOLD=10`
  - `MONITORING_AUTH_ALERT_THRESHOLD=25`
- [ ] Confirm `AUTH_ALLOW_UNVERIFIED_JWT=false`.
- [ ] Confirm rate limit baseline remains enabled.
- [ ] Post-deploy: health + route-protection return `200`.
- [ ] Run `pnpm s1:auth-smoke` against deployed target.
- [ ] Capture deploy metadata (commit SHA + UTC timestamp).
- [ ] Keep rollback command + env backup path available per runbook.
