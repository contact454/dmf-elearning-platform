# Database Specialist - Listening Module Phase 1

**Role:** Database Design & Seed Data Creation  
**Duration:** Weeks 1-8 (24-32 hours total)  
**Priority:** HIGH (blocks backend development)

---

## 🎯 Your Mission

Design and implement the database schema for the Listening Module, create seed data for 70 listening exercises, and ensure optimal performance through proper indexing.

---

## ✅ Task Checklist

### **Week 1-2: Schema Design**

- [ ] **Task 1.1: Design `listening_exercises` table**
  - **Description:** Create table to store exercise metadata
  - **Columns:**
    - `id` (UUID, primary key)
    - `title` (TEXT, not null) - Exercise title
    - `difficulty` (INT, 1-10) - CEFR level (A1=1-2, A2=3-4, B1=5-6, B2=7-8, C1=9, C2=10)
    - `audio_url` (TEXT, not null) - Cloudflare R2 URL
    - `transcript` (TEXT, not null) - Full transcript
    - `translation` (TEXT, nullable) - Vietnamese translation
    - `duration_seconds` (INT, not null) - Audio duration
    - `exercise_type` (TEXT, not null) - dictation | multiple_choice | audio_image | fill_blank
    - `exercise_data` (JSONB, nullable) - Type-specific data (options, images, etc.)
    - `created_at` (TIMESTAMPTZ, default NOW())
  - **Constraints:**
    - CHECK (difficulty BETWEEN 1 AND 10)
    - CHECK (exercise_type IN ('dictation', 'multiple_choice', 'audio_image', 'fill_blank'))
  - **Duration:** 2 hours

- [ ] **Task 1.2: Design `user_listening_progress` table**
  - **Description:** Track user progress per exercise (SRS data)
  - **Columns:**
    - `id` (UUID, primary key)
    - `user_id` (UUID, foreign key to users)
    - `exercise_id` (UUID, foreign key to listening_exercises)
    - `total_attempts` (INT, default 0) - Total times attempted
    - `correct_attempts` (INT, default 0) - Times answered correctly
    - `last_attempt_at` (TIMESTAMPTZ, nullable) - Last attempt timestamp
    - `next_review_at` (TIMESTAMPTZ, nullable) - SRS next review date
    - `difficulty_rating` (INT, default 5) - SRS difficulty (1-10)
    - `ease_factor` (DECIMAL(3,2), default 2.5) - SM-2 easiness factor
    - `interval_days` (INT, default 0) - SM-2 interval
    - `created_at` (TIMESTAMPTZ, default NOW())
  - **Constraints:**
    - UNIQUE (user_id, exercise_id) - One progress record per user-exercise
  - **Duration:** 2 hours

- [ ] **Task 1.3: Design `listening_attempts` table**
  - **Description:** Log every attempt (detailed analytics)
  - **Columns:**
    - `id` (UUID, primary key)
    - `user_id` (UUID, foreign key to users)
    - `exercise_id` (UUID, foreign key to listening_exercises)
    - `user_answer` (JSONB, not null) - User's answer (type-specific)
    - `correct` (BOOLEAN, not null) - Was answer correct?
    - `time_spent_seconds` (INT, default 0) - Time to complete
    - `accuracy_score` (DECIMAL(5,2), nullable) - 0-100 (for partial credit)
    - `quality_rating` (INT, nullable) - SM-2 quality (0-5)
    - `created_at` (TIMESTAMPTZ, default NOW())
  - **Constraints:**
    - CHECK (quality_rating BETWEEN 0 AND 5)
    - CHECK (accuracy_score BETWEEN 0 AND 100)
  - **Duration:** 2 hours

- [ ] **Task 1.4: Create Prisma migration file**
  - **File:** `prisma/migrations/XXX_add_listening_tables.sql`
  - **Action:** Generate migration with `npx prisma migrate dev --name add_listening_tables`
  - **Validation:** Run migration on local database, verify tables created
  - **Duration:** 1 hour

- [ ] **Task 1.5: Add performance indexes**
  - **Indexes to create:**
    ```sql
    CREATE INDEX idx_exercises_difficulty ON listening_exercises(difficulty);
    CREATE INDEX idx_exercises_type ON listening_exercises(exercise_type);
    CREATE INDEX idx_user_progress_user ON user_listening_progress(user_id);
    CREATE INDEX idx_user_progress_next_review ON user_listening_progress(next_review_at);
    CREATE INDEX idx_user_progress_composite ON user_listening_progress(user_id, exercise_id);
    CREATE INDEX idx_attempts_user ON listening_attempts(user_id);
    CREATE INDEX idx_attempts_exercise ON listening_attempts(exercise_id);
    CREATE INDEX idx_attempts_created ON listening_attempts(created_at);
    ```
  - **Rationale:**
    - `idx_exercises_difficulty`: Fast filtering by difficulty level
    - `idx_user_progress_next_review`: Efficient SRS queue queries
    - `idx_user_progress_composite`: Fast lookup of user-exercise progress
    - `idx_attempts_created`: Analytics queries (time-based)
  - **Duration:** 1 hour

- [ ] **Task 1.6: Document schema design**
  - **File:** `.execution/tasks-listening/db-schema-docs.md`
  - **Contents:**
    - Table descriptions
    - Column definitions
    - Index explanations
    - Foreign key relationships (ER diagram)
  - **Duration:** 2 hours

---

### **Week 3-4: Seed Data Creation**

- [ ] **Task 2.1: Design seed data structure**
  - **File:** `data/listening-seed.json`
  - **Structure:**
    ```json
    {
      "exercises": [
        {
          "title": "Basic Greeting (A1)",
          "difficulty": 1,
          "audio_url": "https://r2.dmf.com/audio/a1-greeting-01.mp3",
          "transcript": "Hello, how are you?",
          "translation": "Xin chào, bạn khỏe không?",
          "duration_seconds": 3,
          "exercise_type": "dictation",
          "exercise_data": null
        },
        {
          "title": "Choose Correct Response (A1)",
          "difficulty": 2,
          "audio_url": "https://r2.dmf.com/audio/a1-response-01.mp3",
          "transcript": "How are you?",
          "translation": "Bạn khỏe không?",
          "duration_seconds": 2,
          "exercise_type": "multiple_choice",
          "exercise_data": {
            "question": "What does the speaker say?",
            "options": [
              "How are you?",
              "Where are you?",
              "Who are you?",
              "Why are you here?"
            ],
            "correct_index": 0
          }
        }
      ]
    }
    ```
  - **Duration:** 4 hours

- [ ] **Task 2.2: Populate 70 exercises (by difficulty)**
  - **A1 (difficulty 1-2):** 10 exercises
    - 5 Dictation (simple greetings, numbers, days)
    - 3 Multiple Choice (basic questions)
    - 2 Audio-Image (identify object/action)
  - **A2 (difficulty 3-4):** 10 exercises
    - 4 Dictation (short sentences)
    - 3 Multiple Choice (simple conversations)
    - 2 Fill-in-the-Blank (common phrases)
    - 1 Audio-Image (daily activities)
  - **B1 (difficulty 5-6):** 10 exercises
    - 4 Dictation (longer sentences, basic idioms)
    - 3 Multiple Choice (conversations with context)
    - 2 Fill-in-the-Blank (phrasal verbs)
    - 1 Audio-Image (complex scenes)
  - **B2 (difficulty 7-8):** 10 exercises
    - 4 Dictation (paragraphs, fast speech)
    - 3 Multiple Choice (inference questions)
    - 2 Fill-in-the-Blank (academic vocabulary)
    - 1 Audio-Image (abstract concepts)
  - **C1 (difficulty 9):** 10 exercises
    - 5 Dictation (complex sentences, idioms)
    - 3 Multiple Choice (nuanced meaning)
    - 2 Fill-in-the-Blank (advanced grammar)
  - **C2 (difficulty 10):** 10 exercises
    - 5 Dictation (fast, native speech)
    - 3 Multiple Choice (subtle differences)
    - 2 Fill-in-the-Blank (rare vocabulary)
  - **Mixed (difficulty varies):** 10 exercises
    - Various types, random difficulties
  - **Duration:** 8-12 hours (over 2 weeks)

- [ ] **Task 2.3: Validate audio URLs**
  - **Action:** Ensure all audio_url values point to valid R2 files
  - **Coordination:** Work with Backend Dev (Audio) to get URLs
  - **Tool:** Write validation script to test HTTP HEAD requests
  - **Duration:** 1 hour

- [ ] **Task 2.4: Create seed script**
  - **File:** `scripts/seed-listening.mjs`
  - **Logic:**
    ```javascript
    import { PrismaClient } from '@prisma/client';
    import fs from 'fs/promises';
    
    const prisma = new PrismaClient();
    
    async function main() {
      const seedData = JSON.parse(
        await fs.readFile('./data/listening-seed.json', 'utf-8')
      );
      
      console.log(`Seeding ${seedData.exercises.length} listening exercises...`);
      
      for (const exercise of seedData.exercises) {
        await prisma.listeningExercise.create({
          data: exercise
        });
      }
      
      console.log('✅ Seed complete!');
    }
    
    main()
      .catch(console.error)
      .finally(() => prisma.$disconnect());
    ```
  - **Duration:** 2 hours

---

### **Week 5-6: Seed Execution & Validation**

- [ ] **Task 3.1: Run seed script**
  - **Command:** `node scripts/seed-listening.mjs`
  - **Validation:** Check database has 70 exercises
  - **Query:** `SELECT difficulty, exercise_type, COUNT(*) FROM listening_exercises GROUP BY difficulty, exercise_type;`
  - **Expected Result:**
    - 10 exercises per difficulty level (1-2, 3-4, 5-6, 7-8, 9, 10)
    - Mix of exercise types (dictation, multiple_choice, audio_image, fill_blank)
  - **Duration:** 1 hour

- [ ] **Task 3.2: Data integrity validation**
  - **Checks:**
    - [ ] All audio_url fields are valid URLs
    - [ ] All transcript fields are non-empty
    - [ ] All difficulty values are 1-10
    - [ ] All exercise_type values are valid (dictation, multiple_choice, etc.)
    - [ ] exercise_data is valid JSON for multiple_choice, audio_image, fill_blank
    - [ ] No duplicate exercises (title + transcript)
  - **Tool:** Write validation SQL queries
  - **Duration:** 2 hours

- [ ] **Task 3.3: Performance testing**
  - **Query 1:** Fetch 10 exercises by difficulty
    ```sql
    SELECT * FROM listening_exercises WHERE difficulty = 5 LIMIT 10;
    ```
    - **Target:** \< 10ms
  - **Query 2:** Fetch user progress for review queue
    ```sql
    SELECT * FROM user_listening_progress 
    WHERE user_id = 'test-user' AND next_review_at <= NOW() 
    ORDER BY next_review_at LIMIT 10;
    ```
    - **Target:** \< 20ms
  - **Query 3:** Insert new attempt
    ```sql
    INSERT INTO listening_attempts (user_id, exercise_id, user_answer, correct, time_spent_seconds)
    VALUES ('test-user', 'ex-id', '{"text":"answer"}', true, 10);
    ```
    - **Target:** \< 5ms
  - **Duration:** 2 hours

---

### **Week 7-8: Optimization & Documentation**

- [ ] **Task 4.1: Database performance audit**
  - **Tool:** Use `EXPLAIN ANALYZE` on common queries
  - **Optimize:** Add additional indexes if needed
  - **Example:**
    ```sql
    EXPLAIN ANALYZE
    SELECT e.*, up.total_attempts, up.correct_attempts
    FROM listening_exercises e
    LEFT JOIN user_listening_progress up ON e.id = up.exercise_id AND up.user_id = 'test-user'
    WHERE e.difficulty = 5
    ORDER BY up.next_review_at NULLS FIRST
    LIMIT 10;
    ```
  - **Duration:** 3 hours

- [ ] **Task 4.2: Create backup/restore scripts**
  - **Backup script:** `scripts/backup-listening-data.sh`
    ```bash
    pg_dump -U postgres -t listening_exercises -t user_listening_progress -t listening_attempts > backup-listening-$(date +%Y%m%d).sql
    ```
  - **Restore script:** `scripts/restore-listening-data.sh`
  - **Duration:** 2 hours

- [ ] **Task 4.3: Final data validation**
  - **Checklist:**
    - [ ] 70 exercises in database
    - [ ] All audio URLs valid (tested with curl)
    - [ ] All difficulty levels represented
    - [ ] All exercise types represented
    - [ ] No NULL values in required fields
    - [ ] All foreign keys valid
  - **Duration:** 1 hour

- [ ] **Task 4.4: Update documentation**
  - **File:** `.execution/tasks-listening/db-schema-docs.md`
  - **Add:**
    - Seed data statistics (70 exercises, breakdown by type/difficulty)
    - Performance metrics (query times)
    - Index usage analysis
    - Backup/restore instructions
  - **Duration:** 2 hours

---

## 📊 Deliverables Summary

| Deliverable | File Path | Status |
|-------------|-----------|--------|
| Prisma migration | `prisma/migrations/XXX_add_listening_tables.sql` | ⬜ |
| Seed data file | `data/listening-seed.json` | ⬜ |
| Seed script | `scripts/seed-listening.mjs` | ⬜ |
| Schema docs | `.execution/tasks-listening/db-schema-docs.md` | ⬜ |
| Backup script | `scripts/backup-listening-data.sh` | ⬜ |
| Restore script | `scripts/restore-listening-data.sh` | ⬜ |

---

## 🎯 Success Criteria

- [ ] 70 listening exercises in database
- [ ] All tables created with correct schema
- [ ] 8 performance indexes added
- [ ] All queries \< target time (10ms for reads, 5ms for writes)
- [ ] Seed script runs without errors
- [ ] Data integrity validation passes
- [ ] Documentation complete

---

## 🚨 Blockers & Dependencies

**Dependencies:**
- Backend Dev (Audio) must upload audio files to R2 first (Week 3-4)
- Coordinate on audio URL format (e.g., `https://r2.dmf.com/audio/a1-greeting-01.mp3`)

**Potential Blockers:**
- Audio files not ready → Use placeholder URLs temporarily
- Prisma migration conflicts → Coordinate with other devs on migration order

**Escalation:**
- If blocked for \> 4 hours → Report to PM or Tech Lead
- If audio URLs change format → Re-run validation and update seed data

---

## 📚 Resources

**Documentation:**
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Index Tuning: https://www.postgresql.org/docs/current/indexes.html
- Vocabulary Module Schema (reference): `prisma/schema.prisma`

**Example Queries:**
- See `.execution/BACKEND_COMPLETION_vocab_phase1.md` for SRS query patterns

**Contact:**
- Backend Dev (Audio): For audio URL coordination
- Backend Dev (SRS): For SRS schema requirements
- Frontend Dev: For exercise_data structure requirements

---

**Task File Version:** 1.0  
**Last Updated:** 2026-02-06  
**Owner:** Database Specialist
