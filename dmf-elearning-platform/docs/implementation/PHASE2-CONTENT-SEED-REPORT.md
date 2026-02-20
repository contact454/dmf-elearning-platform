# Phase 2 Content Seed Report

**Date:** 2026-02-20
**Scope:** Vocabulary B2-C2 + Reading/Speaking/Writing/Listening seed expansion

## 1) Commands Executed

```bash
VOCAB_SEED_LEVELS=B2,C1,C2 VOCAB_SEED_COUNT=20000 \
pnpm --filter learning-service run seed:vocabulary:a1b1
```

```bash
pnpm --filter learning-service run seed:content:phase2
```

```bash
pnpm --filter learning-service build
pnpm --filter learning-service test
```

## 2) Seed Results

### Vocabulary (`phase2/final-vocabulary-v2`, B2-C2)

- B2: 2068
- C1: 1319
- C2: 173
- Total: 3560
- Seeder output: created=3111, updated=449

### Phase 2 content seed (`phase2/seed-2026-02`)

- ReadingContent: 20 total (A1/A2/B1/B2 = 5 each)
- ReadingPassage: 20 total (A1/A2/B1/B2 = 5 each)
- ReadingExercise: 60 total (3 per passage)
- SpeakingPrompt: 30 total (A1/A2/B1 = 10 each)
- WritingPrompt: 20 total (A1/A2/B1/B2 = 5 each)
- ListeningContent: 20 total (A1/A2/B1/B2 = 5 each)
- DictationExercise: 20 total (A1/A2/B1/B2 = 5 each)

## 3) Verification Snapshot (DB)

Counts scoped to the Phase 2 seed tags:

- `reading_content.source = 'phase2/seed-2026-02'`
- `reading_passages.source = 'phase2/seed-2026-02'`
- `speaking_prompt.tags HAS 'phase2/seed-2026-02'`
- `writing_prompt.tags HAS 'phase2/seed-2026-02'`
- `listening_content.source = 'phase2/seed-2026-02'`
- `dictation_exercise` joined with `listening_content.source = 'phase2/seed-2026-02'`

All scoped module counts match required targets per level.
