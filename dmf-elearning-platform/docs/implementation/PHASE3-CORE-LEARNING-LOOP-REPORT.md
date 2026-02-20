# Phase 3 Core Learning Loop Report

**Date:** 2026-02-20  
**Scope:** SRS review flow, feedback loop, hub/dashboard, daily goals

## 1) SRS Review Queue

- Verified `GET /api/review/queue` queries due cards (`nextReview <= now`) and orders by `nextReview ASC`.
- Verified `POST /api/review/submit` updates:
  - `easeFactor`
  - `intervalDays`
  - `repetitions`
  - `nextReview`
  - `status`
  - `totalReviews` / `correctReviews`
- Frontend wired to real review API:
  - `apps/web-learner/src/hooks/useReviewQueue.ts`
  - `apps/web-learner/src/components/vocabulary/ReviewSession.tsx`
- Real DB smoke (seed user + progress) passed:
  - `queueCount=2`
  - `sortedAsc=true`
  - `dueOnly=true`
  - submit updated SRS fields as expected.

## 2) Feedback Loop

- Reading unknown word -> SRS queue:
  - `POST /api/reading/vocabulary/save`
  - `ReadingPassageService.saveVocabulary` now upserts `UserWordProgress` with:
    - `status=NEW`
    - `easeFactor=2.5`
    - `intervalDays=1`
    - `repetitions=0`
    - `nextReview=now`
- Listening dictation wrong -> SRS queue:
  - `ListeningService.submitAttempt` now extracts mistake words and upserts matching vocabulary progress with:
    - `status=LEARNING`
    - `intervalDays=1`
    - `repetitions=0`
    - reset next review window
- Popup dictionary now calls real save endpoint from reading page:
  - `apps/web-learner/src/components/reading/PopupDictionary.tsx`
  - `apps/web-learner/src/app/[locale]/learn/reading/[id]/page.tsx`
  - API proxy routes replaced from mock to backend forwarders.

## 3) Progress Dashboard

- `GET /api/hub/:userId` now returns real DB summary:
  - `totalWordsLearned` (`status=MASTERED`)
  - `wordsInReview` (`status=REVIEW`)
  - `currentStreak`
  - completion counts for reading/listening/speaking/writing
- Frontend dashboard now fetches real hub data (`useHubData`) instead of mock service ports:
  - `apps/web-learner/src/app/[locale]/dashboard/page.tsx`
- Skill progress bars render actual percentages from `skillProgress`.

## 4) Daily Goals

- `GET /api/hub/:userId/daily-goals` now returns goals for today from DB activity counts:
  - vocabulary reviews today
  - reading completions today
  - listening completions today
- Per-user goal config defaults applied/stored in service:
  - vocabulary: `10`
  - reading: `1`
  - listening: `1`
- Goal completion status exposed per goal (`isCompleted`).

## 5) Verification Commands

Executed successfully:

```bash
pnpm --filter learning-service build
pnpm --filter learning-service test
pnpm --filter web-learner build
```

Test suite status:
- `learning-service`: **154 passed**
- Includes new tests:
  - `HubService.test.ts`
  - `ReadingPassageService.test.ts`
  - `ListeningService.test.ts`
  - upgraded `reviewService.test.ts`

