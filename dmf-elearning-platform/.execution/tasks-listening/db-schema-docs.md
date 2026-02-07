# Database Schema Documentation - Listening Module Phase 1

**Created:** 2026-02-06  
**Author:** DB Specialist (AI Agent)  
**Status:** ✅ Complete

---

## 📋 Overview

The Listening Module Phase 1 database schema consists of **3 main tables** designed to support:
- Exercise metadata storage (70 exercises across A1-C2 levels)
- SRS (Spaced Repetition System) progress tracking
- Detailed attempt analytics

All tables use **UUID** primary keys and include proper **indexes** for optimal query performance.

---

## 🗄️ Table Specifications

### 1. `listening_exercises`

**Purpose:** Store metadata for all listening exercises

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique exercise identifier |
| `title` | TEXT | NOT NULL | Exercise title (e.g., "Basic Greeting - Hallo (A1)") |
| `difficulty` | INTEGER | NOT NULL, 1-10 | CEFR difficulty (A1=1-2, A2=3-4, B1=5-6, B2=7-8, C1=9, C2=10) |
| `audio_url` | TEXT | NOT NULL | Cloudflare R2 URL to audio file |
| `transcript` | TEXT | NOT NULL | Full German transcript |
| `translation` | TEXT | NULLABLE | Vietnamese translation |
| `duration_seconds` | INTEGER | NOT NULL | Audio duration in seconds |
| `exercise_type` | ENUM | NOT NULL | One of: dictation, multiple_choice, audio_image, fill_blank |
| `exercise_data` | JSONB | NULLABLE | Type-specific data (options, images, blanks) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | AUTO UPDATE | Last update timestamp |

**Indexes:**
- `idx_exercises_difficulty` on `difficulty` - Fast filtering by level
- `idx_exercises_type` on `exercise_type` - Fast filtering by type

**Rationale:**
- JSONB for `exercise_data` allows flexible structure per exercise type
- Indexes on `difficulty` and `exercise_type` enable efficient filtering for exercise selection
- `audio_url` stored as text (Cloudflare R2 public URLs)

---

### 2. `user_listening_exercise_progress`

**Purpose:** Track user progress per exercise (SRS data)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique progress record ID |
| `user_id` | UUID | NOT NULL | Reference to user (no FK - cross-service) |
| `exercise_id` | UUID | NOT NULL, FK | Reference to listening_exercises.id |
| `total_attempts` | INTEGER | DEFAULT 0 | Total times attempted |
| `correct_attempts` | INTEGER | DEFAULT 0 | Times answered correctly |
| `last_attempt_at` | TIMESTAMPTZ | NULLABLE | Last attempt timestamp |
| `next_review_at` | TIMESTAMPTZ | NULLABLE | SRS next review date |
| `difficulty_rating` | INTEGER | DEFAULT 5, 1-10 | User's perceived difficulty |
| `ease_factor` | DECIMAL(3,2) | DEFAULT 2.5 | SM-2 easiness factor |
| `interval_days` | INTEGER | DEFAULT 0 | SM-2 interval (days until next review) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | AUTO UPDATE | Last update timestamp |

**Constraints:**
- `UNIQUE(user_id, exercise_id)` - One progress record per user-exercise pair

**Indexes:**
- `idx_user_progress_user` on `user_id` - Fast lookup of user's progress
- `idx_user_progress_next_review` on `next_review_at` - Efficient SRS queue queries
- `idx_user_progress_composite` on `(user_id, exercise_id)` - Fast user-exercise lookups

**Foreign Keys:**
- `exercise_id` → `listening_exercises(id)` ON DELETE CASCADE

**Rationale:**
- SM-2 algorithm fields (`ease_factor`, `interval_days`) enable sophisticated spaced repetition
- `next_review_at` index allows fast "due exercises" queries
- Composite index optimizes the most common query pattern (user + exercise lookup)

---

### 3. `listening_exercise_attempts`

**Purpose:** Log every attempt (detailed analytics)

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique attempt ID |
| `user_id` | UUID | NOT NULL | Reference to user (no FK - cross-service) |
| `exercise_id` | UUID | NOT NULL, FK | Reference to listening_exercises.id |
| `user_answer` | JSONB | NOT NULL | User's answer (type-specific structure) |
| `correct` | BOOLEAN | NOT NULL | Was answer correct? |
| `time_spent_seconds` | INTEGER | DEFAULT 0 | Time to complete (seconds) |
| `accuracy_score` | DECIMAL(5,2) | NULLABLE, 0-100 | Partial credit score (for dictation) |
| `quality_rating` | INTEGER | NULLABLE, 0-5 | SM-2 quality rating |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Attempt timestamp |

**Indexes:**
- `idx_attempts_user` on `user_id` - User analytics queries
- `idx_attempts_exercise` on `exercise_id` - Exercise analytics queries
- `idx_attempts_created` on `created_at` - Time-based analytics

**Foreign Keys:**
- `exercise_id` → `listening_exercises(id)` ON DELETE CASCADE

**Rationale:**
- JSONB `user_answer` allows flexible answer structures per exercise type
- `accuracy_score` enables partial credit for dictation exercises
- `quality_rating` (0-5) used for SM-2 algorithm calculations
- Indexes on all query dimensions (user, exercise, time) for fast analytics

---

## 🔗 Entity-Relationship Diagram

```
┌─────────────────────────┐
│  listening_exercises    │
│─────────────────────────│
│ id (PK)                 │
│ title                   │
│ difficulty              │
│ audio_url               │
│ transcript              │
│ translation             │
│ duration_seconds        │
│ exercise_type (ENUM)    │
│ exercise_data (JSONB)   │
│ created_at              │
│ updated_at              │
└───────┬─────────────────┘
        │
        │ 1:N
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────────────────┐  ┌──────────────────────────────┐
│ user_listening_exercise_      │  │ listening_exercise_attempts  │
│ progress                      │  │──────────────────────────────│
│───────────────────────────────│  │ id (PK)                      │
│ id (PK)                       │  │ user_id                      │
│ user_id                       │  │ exercise_id (FK)             │
│ exercise_id (FK)              │  │ user_answer (JSONB)          │
│ total_attempts                │  │ correct                      │
│ correct_attempts              │  │ time_spent_seconds           │
│ last_attempt_at               │  │ accuracy_score               │
│ next_review_at                │  │ quality_rating (0-5)         │
│ difficulty_rating             │  │ created_at                   │
│ ease_factor (SM-2)            │  └──────────────────────────────┘
│ interval_days (SM-2)          │
│ created_at                    │
│ updated_at                    │
└───────────────────────────────┘

UNIQUE(user_id, exercise_id)
```

---

## 📊 Exercise Type Structures

### JSONB Schema for `exercise_data`

#### 1. Dictation (`exercise_type = 'dictation'`)
```json
null
```
No additional data needed - user types what they hear.

---

#### 2. Multiple Choice (`exercise_type = 'multiple_choice'`)
```json
{
  "question": "Was sagt die Person?",
  "options": [
    "Guten Morgen!",
    "Guten Abend!",
    "Gute Nacht!",
    "Auf Wiedersehen!"
  ],
  "correct_index": 0
}
```

---

#### 3. Audio-Image Matching (`exercise_type = 'audio_image'`)
```json
{
  "images": [
    {
      "id": "img-apple",
      "url": "https://r2.dmf.com/images/apple.jpg",
      "alt": "Ein Apfel",
      "is_correct": true
    },
    {
      "id": "img-banana",
      "url": "https://r2.dmf.com/images/banana.jpg",
      "alt": "Eine Banane",
      "is_correct": false
    }
  ]
}
```

---

#### 4. Fill-in-the-Blank (`exercise_type = 'fill_blank'`)
```json
{
  "blanks": [
    {
      "id": "blank-1",
      "position": 8,
      "options": ["nach", "zu", "in", "auf"],
      "correct_answer": "nach"
    }
  ]
}
```

---

## 📊 Seed Data Statistics

**Total Exercises:** 70

### By Difficulty (CEFR Level)

| Level | Difficulty Range | Count | Exercise Types |
|-------|------------------|-------|----------------|
| **A1** | 1-2 | 10 | 5 Dictation, 3 Multiple Choice, 2 Audio-Image |
| **A2** | 3-4 | 10 | 4 Dictation, 3 Multiple Choice, 2 Fill-Blank, 1 Audio-Image |
| **B1** | 5-6 | 10 | 4 Dictation, 3 Multiple Choice, 2 Fill-Blank, 1 Audio-Image |
| **B2** | 7-8 | 10 | 4 Dictation, 3 Multiple Choice, 2 Fill-Blank, 1 Audio-Image |
| **C1** | 9 | 10 | 5 Dictation, 3 Multiple Choice, 2 Fill-Blank |
| **C2** | 10 | 10 | 5 Dictation, 3 Multiple Choice, 2 Fill-Blank |
| **Mixed** | 2-10 | 10 | Various (thematic exercises across levels) |

### By Exercise Type

| Type | Count | Description |
|------|-------|-------------|
| **dictation** | 31 | Type what you hear |
| **multiple_choice** | 21 | Choose correct answer |
| **fill_blank** | 12 | Fill in missing words |
| **audio_image** | 6 | Match audio to image |

---

## 🎯 Performance Indexes

### Summary of All Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| `listening_exercises` | `idx_exercises_difficulty` | `difficulty` | Filter by level (A1-C2) |
| `listening_exercises` | `idx_exercises_type` | `exercise_type` | Filter by type |
| `user_listening_exercise_progress` | `idx_user_progress_user` | `user_id` | User dashboard queries |
| `user_listening_exercise_progress` | `idx_user_progress_next_review` | `next_review_at` | SRS queue (due exercises) |
| `user_listening_exercise_progress` | `idx_user_progress_composite` | `(user_id, exercise_id)` | Fast user-exercise lookup |
| `listening_exercise_attempts` | `idx_attempts_user` | `user_id` | User analytics |
| `listening_exercise_attempts` | `idx_attempts_exercise` | `exercise_id` | Exercise analytics |
| `listening_exercise_attempts` | `idx_attempts_created` | `created_at` | Time-based reports |

**Total Indexes:** 8 (as required)

### Expected Query Performance

| Query Type | Target | Index Used |
|------------|--------|------------|
| Fetch exercises by difficulty | <10ms | `idx_exercises_difficulty` |
| Fetch user's due exercises | <20ms | `idx_user_progress_next_review` |
| Fetch user-exercise progress | <5ms | `idx_user_progress_composite` |
| Insert new attempt | <5ms | Primary key only |
| User analytics (last 7 days) | <20ms | `idx_attempts_created` |

---

## 🔧 Common Queries

### 1. Fetch 10 Exercises by Difficulty
```sql
SELECT * FROM listening_exercises 
WHERE difficulty = 5 
LIMIT 10;
```
**Uses:** `idx_exercises_difficulty`

---

### 2. Fetch User's Due Exercises (SRS Queue)
```sql
SELECT e.*, up.total_attempts, up.correct_attempts, up.next_review_at
FROM listening_exercises e
INNER JOIN user_listening_exercise_progress up 
  ON e.id = up.exercise_id
WHERE up.user_id = 'user-uuid' 
  AND up.next_review_at <= NOW()
ORDER BY up.next_review_at ASC
LIMIT 10;
```
**Uses:** `idx_user_progress_user`, `idx_user_progress_next_review`

---

### 3. Insert New Attempt
```sql
INSERT INTO listening_exercise_attempts 
  (user_id, exercise_id, user_answer, correct, time_spent_seconds, accuracy_score, quality_rating)
VALUES 
  ('user-uuid', 'exercise-uuid', '{"text": "answer"}', true, 10, 95.5, 5);
```
**Performance:** <5ms (no index needed for insert)

---

### 4. User Analytics (Last 7 Days)
```sql
SELECT 
  COUNT(*) as total_attempts,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  AVG(accuracy_score) as avg_accuracy,
  SUM(time_spent_seconds) as total_time
FROM listening_exercise_attempts
WHERE user_id = 'user-uuid'
  AND created_at >= NOW() - INTERVAL '7 days';
```
**Uses:** `idx_attempts_user`, `idx_attempts_created`

---

## 🔒 Data Integrity

### Constraints Applied

1. **Difficulty Range:** `1 <= difficulty <= 10`
2. **Exercise Type:** Must be one of: `dictation`, `multiple_choice`, `audio_image`, `fill_blank`
3. **Quality Rating:** `0 <= quality_rating <= 5` (SM-2 standard)
4. **Accuracy Score:** `0 <= accuracy_score <= 100`
5. **Unique Progress:** One progress record per `(user_id, exercise_id)` pair

### Foreign Keys

- `user_listening_exercise_progress.exercise_id` → `listening_exercises.id` (ON DELETE CASCADE)
- `listening_exercise_attempts.exercise_id` → `listening_exercises.id` (ON DELETE CASCADE)

**Note:** `user_id` has NO foreign key (cross-service reference to onboarding-service)

---

## 📦 Migration Details

**Migration File:** `20260206112550_add_listening_exercises`

**Created:** 2026-02-06 11:25:50 UTC

**Changes:**
- Created ENUM `ExerciseType` (dictation, multiple_choice, audio_image, fill_blank)
- Created table `listening_exercises` (11 columns)
- Created table `user_listening_exercise_progress` (12 columns)
- Created table `listening_exercise_attempts` (9 columns)
- Created 8 performance indexes
- Added 2 foreign key constraints

**Safe to run:** ✅ Yes (no destructive operations)

---

## 🧪 Validation

### Data Integrity Checks

```sql
-- Check: All exercises have valid difficulty (1-10)
SELECT COUNT(*) FROM listening_exercises 
WHERE difficulty < 1 OR difficulty > 10;
-- Expected: 0

-- Check: All audio URLs are non-empty
SELECT COUNT(*) FROM listening_exercises 
WHERE audio_url IS NULL OR audio_url = '';
-- Expected: 0

-- Check: All transcripts are non-empty
SELECT COUNT(*) FROM listening_exercises 
WHERE transcript IS NULL OR transcript = '';
-- Expected: 0

-- Check: Total exercise count
SELECT COUNT(*) FROM listening_exercises;
-- Expected: 70

-- Check: Exercise type distribution
SELECT exercise_type, COUNT(*) 
FROM listening_exercises 
GROUP BY exercise_type;
-- Expected: dictation (31), multiple_choice (21), fill_blank (12), audio_image (6)

-- Check: Difficulty distribution
SELECT difficulty, COUNT(*) 
FROM listening_exercises 
GROUP BY difficulty 
ORDER BY difficulty;
-- Expected: 10-12 exercises per difficulty level
```

---

## 🚀 Next Steps

1. **Run Migration:**
   ```bash
   cd services/learning-service
   npx prisma migrate deploy
   ```

2. **Run Seed Script:**
   ```bash
   node scripts/seed-listening.mjs
   ```

3. **Verify Data:**
   ```bash
   npx prisma studio
   # Or use SQL queries above
   ```

4. **Test Queries:**
   ```bash
   # Run EXPLAIN ANALYZE on common queries
   psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM listening_exercises WHERE difficulty = 5 LIMIT 10;"
   ```

---

## 📚 References

- **Prisma Docs:** https://www.prisma.io/docs
- **SM-2 Algorithm:** https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- **PostgreSQL Indexes:** https://www.postgresql.org/docs/current/indexes.html
- **Vocabulary Module (Reference):** `services/learning-service/prisma/schema.prisma` (existing tables)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-06  
**Status:** ✅ Complete - Ready for Migration
