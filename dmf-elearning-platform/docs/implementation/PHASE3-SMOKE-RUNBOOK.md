# Phase 3 Smoke Runbook

Date: 2026-02-20  
Scope: Core learning loop verification (review queue, feedback loop, hub stats/goals)

## 1) Preconditions

- Local DB is running and `services/learning-service/.env` points to correct `DATABASE_URL`.
- Dependencies are installed (`pnpm install`).

## 2) Commands

Run all Phase 3 smoke checks from repo root:

```bash
pnpm phase3:smoke:all
```

Run individually:

```bash
pnpm phase3:smoke
pnpm phase3:smoke:feedback
```

## 3) What each smoke covers

### `phase3:smoke`

- Seeds a smoke user and vocabulary fixtures.
- Seeds due + future `user_word_progress`.
- Verifies `getReviewQueue(userId)`:
  - returns only due items
  - sorts by `nextReview` ascending
- Verifies `submitReview(...)` updates SM-2 fields and inserts `vocabulary_review_attempts`.

Script: `services/learning-service/scripts/phase3-core-loop-smoke.ts`

### `phase3:smoke:feedback`

- Verifies reading unknown-word save path resets SRS:
  - `status=NEW`, interval/repetition/review counters reset
- Verifies listening dictation mistake path resets SRS:
  - `status=LEARNING`, `intervalDays=1`, `repetitions=0`
- Seeds progress domains and verifies `HubService.getHubData(userId)` summary is DB-backed.
- Verifies `HubService.updateDailyGoals(userId, ...)` persists and returns updated targets.

Script: `services/learning-service/scripts/phase3-feedback-hub-smoke.ts`

## 4) Expected success signal

Each script prints `PASS` and a JSON summary.  
If any assertion fails, process exits non-zero and prints `FAIL` with error details.

## 5) CI/local follow-up checks

```bash
pnpm --filter learning-service build
pnpm --filter learning-service test
pnpm --filter web-learner build
```
