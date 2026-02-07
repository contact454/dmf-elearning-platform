# Database Specialist - Reading Module Phase 1

**Role:** Database Design & Seed Data Creation  
**Duration:** Weeks 1-4 (24-32 hours total)  
**Priority:** HIGH (blocks backend development)

---

## 🎯 Your Mission

Design and implement the database schema for the Reading Module, create seed data for 70 reading passages with 350+ exercises, and ensure optimal performance through proper indexing.

---

## ✅ Task Checklist

### **Week 1-2: Schema Design**

#### **Task 1.1: Design `reading_passages` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Create table to store reading passage content and metadata

**Schema:**
```sql
CREATE TABLE reading_passages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  cefr_level VARCHAR(2) NOT NULL, -- A1, A2, B1, B2, C1, C2
  topic VARCHAR(100), -- daily_life, business, academic, culture, science, etc.
  word_count INT NOT NULL,
  estimated_reading_time_minutes INT DEFAULT 0, -- Based on 200 words/min
  difficulty_score DECIMAL(3,2), -- 1.0-10.0 (optional: Flesch-Kincaid)
  source VARCHAR(200), -- Original source (if adapted from news, etc.)
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Constraints:**
```sql
ALTER TABLE reading_passages
  ADD CONSTRAINT check_cefr_level 
    CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  ADD CONSTRAINT check_difficulty_score 
    CHECK (difficulty_score BETWEEN 1.0 AND 10.0),
  ADD CONSTRAINT check_word_count 
    CHECK (word_count > 0);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] Constraints enforced
- [x] Test insert passes validation

---

#### **Task 1.2: Design `reading_exercises` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Store exercise questions for each passage (4 types: multiple_choice, true_false, fill_blank, sequencing)

**Schema:**
```sql
CREATE TABLE reading_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  exercise_type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL, -- For MC/TF: "What is the main idea?", For Fill: "Complete the sentence"
  exercise_data JSONB NOT NULL, -- Type-specific data (see below)
  explanation TEXT, -- Why the answer is correct
  difficulty_level INT DEFAULT 5, -- 1-10 (can differ from passage difficulty)
  display_order INT DEFAULT 0, -- Order to show exercises
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exercise Data Structure (JSONB):**

**Multiple Choice:**
```json
{
  "options": [
    "The main character is happy",
    "The main character is sad",
    "The main character is angry",
    "The main character is confused"
  ],
  "correct_index": 0
}
```

**True/False:**
```json
{
  "statement": "The main character lives in Paris.",
  "is_true": false
}
```

**Fill-in-the-Blank:**
```json
{
  "sentence": "The quick brown _____ jumped over the lazy dog.",
  "correct_answer": "fox",
  "alternatives": ["Fox", "FOX"], // Case-insensitive alternatives
  "word_bank": ["fox", "cat", "dog", "bird"] // Optional: word bank to choose from
}
```

**Sequencing:**
```json
{
  "sentences": [
    { "id": "s1", "text": "First, he woke up early." },
    { "id": "s2", "text": "Then, he brushed his teeth." },
    { "id": "s3", "text": "After that, he ate breakfast." },
    { "id": "s4", "text": "Finally, he went to work." }
  ],
  "correct_order": ["s1", "s2", "s3", "s4"]
}
```

**Constraints:**
```sql
ALTER TABLE reading_exercises
  ADD CONSTRAINT check_exercise_type 
    CHECK (exercise_type IN ('multiple_choice', 'true_false', 'fill_blank', 'sequencing')),
  ADD CONSTRAINT check_difficulty_level 
    CHECK (difficulty_level BETWEEN 1 AND 10);

-- Index on passage_id for fast lookups
CREATE INDEX idx_reading_exercises_passage_id ON reading_exercises(passage_id);
CREATE INDEX idx_reading_exercises_type ON reading_exercises(exercise_type);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] JSONB validation works for all 4 types
- [x] Foreign key cascades on passage delete
- [x] Indexes created

---

#### **Task 1.3: Design `user_reading_progress` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Track user progress per passage (SRS integration)

**Schema:**
```sql
CREATE TABLE user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  
  -- Progress tracking
  completed_at TIMESTAMPTZ, -- NULL if not completed
  total_exercises INT DEFAULT 0,
  correct_exercises INT DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100
  time_spent_seconds INT DEFAULT 0,
  
  -- SRS data
  review_count INT DEFAULT 0,
  next_review_at TIMESTAMPTZ, -- When to show passage again
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SuperMemo-2
  interval_days INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, passage_id) -- One progress record per user-passage
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_reading_progress_user_id ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_next_review ON user_reading_progress(next_review_at);
CREATE INDEX idx_user_reading_progress_completed ON user_reading_progress(completed_at);
CREATE INDEX idx_user_reading_progress_composite ON user_reading_progress(user_id, passage_id);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] UNIQUE constraint prevents duplicate progress records
- [x] Indexes improve query performance
- [x] SRS fields ready for algorithm integration

---

#### **Task 1.4: Design `reading_attempts` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Log every exercise attempt (detailed analytics)

**Schema:**
```sql
CREATE TABLE reading_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES reading_exercises(id) ON DELETE CASCADE,
  
  -- Attempt data
  user_answer JSONB NOT NULL, -- Type-specific answer (see below)
  correct_answer JSONB NOT NULL, -- Expected answer
  is_correct BOOLEAN NOT NULL,
  accuracy_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (for partial credit in fill_blank)
  time_spent_seconds INT DEFAULT 0,
  
  -- SRS rating (optional: user feedback on difficulty)
  quality_rating INT, -- 0-5 (SuperMemo-2)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**User Answer Structure (JSONB):**

**Multiple Choice:**
```json
{
  "selected_index": 2
}
```

**True/False:**
```json
{
  "answer": false
}
```

**Fill-in-the-Blank:**
```json
{
  "answer": "fox"
}
```

**Sequencing:**
```json
{
  "order": ["s1", "s3", "s2", "s4"]
}
```

**Indexes:**
```sql
CREATE INDEX idx_reading_attempts_user_id ON reading_attempts(user_id);
CREATE INDEX idx_reading_attempts_exercise_id ON reading_attempts(exercise_id);
CREATE INDEX idx_reading_attempts_passage_id ON reading_attempts(passage_id);
CREATE INDEX idx_reading_attempts_created_at ON reading_attempts(created_at);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] JSONB stores attempt data correctly
- [x] Indexes support analytics queries

---

#### **Task 1.5: Create Prisma migration file**
**Duration:** 1 hour  
**Priority:** P0 (Critical)

**Steps:**
1. Update `prisma/schema.prisma`:
   ```prisma
   model ReadingPassage {
     id                        String   @id @default(uuid()) @db.Uuid
     title                     String   @db.VarChar(200)
     content                   String   @db.Text
     cefrLevel                 String   @map("cefr_level") @db.VarChar(2)
     topic                     String?  @db.VarChar(100)
     wordCount                 Int      @map("word_count")
     estimatedReadingTimeMinutes Int?   @map("estimated_reading_time_minutes") @default(0)
     difficultyScore           Decimal? @map("difficulty_score") @db.Decimal(3, 2)
     source                    String?  @db.VarChar(200)
     isPremium                 Boolean  @map("is_premium") @default(false)
     createdAt                 DateTime @map("created_at") @default(now()) @db.Timestamptz(6)
     updatedAt                 DateTime @map("updated_at") @default(now()) @updatedAt @db.Timestamptz(6)

     exercises                 ReadingExercise[]
     userProgress              UserReadingProgress[]
     attempts                  ReadingAttempt[]

     @@map("reading_passages")
   }

   model ReadingExercise {
     id            String   @id @default(uuid()) @db.Uuid
     passageId     String   @map("passage_id") @db.Uuid
     exerciseType  String   @map("exercise_type") @db.VarChar(50)
     question      String   @db.Text
     exerciseData  Json     @map("exercise_data")
     explanation   String?  @db.Text
     difficultyLevel Int?   @map("difficulty_level") @default(5)
     displayOrder  Int      @map("display_order") @default(0)
     createdAt     DateTime @map("created_at") @default(now()) @db.Timestamptz(6)

     passage       ReadingPassage @relation(fields: [passageId], references: [id], onDelete: Cascade)
     attempts      ReadingAttempt[]

     @@index([passageId])
     @@index([exerciseType])
     @@map("reading_exercises")
   }

   model UserReadingProgress {
     id                  String    @id @default(uuid()) @db.Uuid
     userId              String    @map("user_id") @db.Uuid
     passageId           String    @map("passage_id") @db.Uuid
     completedAt         DateTime? @map("completed_at") @db.Timestamptz(6)
     totalExercises      Int       @map("total_exercises") @default(0)
     correctExercises    Int       @map("correct_exercises") @default(0)
     accuracyPercentage  Decimal   @map("accuracy_percentage") @default(0) @db.Decimal(5, 2)
     timeSpentSeconds    Int       @map("time_spent_seconds") @default(0)
     reviewCount         Int       @map("review_count") @default(0)
     nextReviewAt        DateTime? @map("next_review_at") @db.Timestamptz(6)
     easeFactor          Decimal   @map("ease_factor") @default(2.5) @db.Decimal(3, 2)
     intervalDays        Int       @map("interval_days") @default(0)
     createdAt           DateTime  @map("created_at") @default(now()) @db.Timestamptz(6)
     updatedAt           DateTime  @map("updated_at") @default(now()) @updatedAt @db.Timestamptz(6)

     passage             ReadingPassage @relation(fields: [passageId], references: [id], onDelete: Cascade)

     @@unique([userId, passageId])
     @@index([userId])
     @@index([nextReviewAt])
     @@index([completedAt])
     @@map("user_reading_progress")
   }

   model ReadingAttempt {
     id               String   @id @default(uuid()) @db.Uuid
     userId           String   @map("user_id") @db.Uuid
     passageId        String   @map("passage_id") @db.Uuid
     exerciseId       String   @map("exercise_id") @db.Uuid
     userAnswer       Json     @map("user_answer")
     correctAnswer    Json     @map("correct_answer")
     isCorrect        Boolean  @map("is_correct")
     accuracyScore    Decimal  @map("accuracy_score") @default(0) @db.Decimal(5, 2)
     timeSpentSeconds Int      @map("time_spent_seconds") @default(0)
     qualityRating    Int?     @map("quality_rating")
     createdAt        DateTime @map("created_at") @default(now()) @db.Timestamptz(6)

     passage          ReadingPassage  @relation(fields: [passageId], references: [id], onDelete: Cascade)
     exercise         ReadingExercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

     @@index([userId])
     @@index([exerciseId])
     @@index([passageId])
     @@index([createdAt])
     @@map("reading_attempts")
   }
   ```

2. Generate migration:
   ```bash
   npx prisma migrate dev --name add_reading_module
   ```

3. Apply migration:
   ```bash
   npx prisma migrate deploy
   ```

**Acceptance Criteria:**
- [x] Prisma schema updated
- [x] Migration generated
- [x] Migration applied to database
- [x] Test query works

---

### **Week 3-4: Seed Data Creation**

#### **Task 2.1: Create 70 reading passages (JSON structure)**
**Duration:** 12-16 hours  
**Priority:** P0 (Critical)

**File:** `data/reading-passages-seed.json`

**Structure:**
```json
{
  "passages": [
    {
      "title": "Greetings Around the World",
      "content": "Hello is a common greeting in English. In Spanish, people say 'Hola'. In French, they say 'Bonjour'. In Japanese, people say 'Konnichiwa'. Every language has its own way of saying hello. Some cultures bow when they greet. Others shake hands. Learning how to greet people in different languages is fun and respectful.",
      "cefr_level": "A1",
      "topic": "culture",
      "word_count": 61,
      "estimated_reading_time_minutes": 1,
      "difficulty_score": 1.5,
      "source": "Original content for DMF",
      "is_premium": false
    },
    {
      "title": "The Benefits of Reading",
      "content": "Reading is one of the most beneficial activities you can engage in. It improves vocabulary, enhances critical thinking skills, and expands your knowledge base. Research has shown that regular reading can reduce stress levels by up to 68%. Moreover, reading before bed can improve sleep quality. Fiction reading, in particular, has been linked to increased empathy and emotional intelligence. Whether you prefer novels, non-fiction, or poetry, dedicating time to reading each day can have profound effects on your cognitive abilities and overall well-being.",
      "cefr_level": "B2",
      "topic": "academic",
      "word_count": 88,
      "estimated_reading_time_minutes": 1,
      "difficulty_score": 7.2,
      "source": "Adapted from educational research",
      "is_premium": false
    }
    // ... 68 more passages
  ]
}
```

**Distribution by CEFR Level:**
- **A1:** 10 passages (100-150 words, simple vocabulary, present tense)
- **A2:** 10 passages (150-200 words, past tense, common phrasal verbs)
- **B1:** 10 passages (200-300 words, complex sentences, idioms)
- **B2:** 10 passages (300-400 words, academic vocabulary, inference required)
- **C1:** 10 passages (400-500 words, abstract concepts, nuanced meanings)
- **C2:** 10 passages (500+ words, advanced rhetoric, cultural references)
- **Mixed:** 10 passages (various topics for variety)

**Topics to Cover (10 each):**
- Daily life (shopping, cooking, hobbies)
- Business (meetings, emails, presentations)
- Academic (research, essays, lectures)
- Culture (traditions, festivals, customs)
- Science (health, technology, environment)
- Travel (hotels, airports, sightseeing)
- Social (friendships, relationships, communication)

**Acceptance Criteria:**
- [x] All 70 passages created with complete metadata
- [x] Word counts accurate
- [x] CEFR levels appropriate for content difficulty
- [x] No duplicate content
- [x] Native English speaker review complete

---

#### **Task 2.2: Create 350+ exercises (JSON structure)**
**Duration:** 8-12 hours  
**Priority:** P0 (Critical)

**File:** `data/reading-exercises-seed.json`

**Structure:**
```json
{
  "exercises": [
    {
      "passage_ref": "greetings-around-the-world", // Reference to passage title
      "exercise_type": "multiple_choice",
      "question": "What do people say in Spanish to greet someone?",
      "exercise_data": {
        "options": [
          "Hola",
          "Bonjour",
          "Konnichiwa",
          "Hello"
        ],
        "correct_index": 0
      },
      "explanation": "The passage states that in Spanish, people say 'Hola'.",
      "difficulty_level": 2,
      "display_order": 1
    },
    {
      "passage_ref": "greetings-around-the-world",
      "exercise_type": "true_false",
      "question": "All cultures greet by shaking hands.",
      "exercise_data": {
        "statement": "All cultures greet by shaking hands.",
        "is_true": false
      },
      "explanation": "The passage mentions that some cultures bow, not all shake hands.",
      "difficulty_level": 3,
      "display_order": 2
    },
    {
      "passage_ref": "greetings-around-the-world",
      "exercise_type": "fill_blank",
      "question": "Complete the sentence from the passage:",
      "exercise_data": {
        "sentence": "Learning how to greet people in different languages is _____ and respectful.",
        "correct_answer": "fun",
        "alternatives": ["Fun", "FUN"],
        "word_bank": ["fun", "boring", "difficult", "easy"]
      },
      "explanation": "The passage says 'fun and respectful'.",
      "difficulty_level": 2,
      "display_order": 3
    },
    {
      "passage_ref": "greetings-around-the-world",
      "exercise_type": "sequencing",
      "question": "Put these greetings in the order they appear in the passage:",
      "exercise_data": {
        "sentences": [
          { "id": "s1", "text": "Hello (English)" },
          { "id": "s2", "text": "Hola (Spanish)" },
          { "id": "s3", "text": "Bonjour (French)" },
          { "id": "s4", "text": "Konnichiwa (Japanese)" }
        ],
        "correct_order": ["s1", "s2", "s3", "s4"]
      },
      "explanation": "The passage introduces greetings in this order.",
      "difficulty_level": 3,
      "display_order": 4
    }
    // ... 346 more exercises
  ]
}
```

**Exercise Distribution (per passage):**
- **Minimum 5 exercises per passage** = 350 total
- **Distribution by type:**
  - Multiple Choice: 40% (140 exercises)
  - True/False: 30% (105 exercises)
  - Fill-in-the-Blank: 20% (70 exercises)
  - Sequencing: 10% (35 exercises)

**Acceptance Criteria:**
- [x] All 350+ exercises created
- [x] Each passage has min 5 exercises (at least 3 different types)
- [x] Exercise difficulty calibrated to passage CEFR level
- [x] All correct answers verified
- [x] Explanations provided for all questions

---

#### **Task 2.3: Create seed script**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**File:** `scripts/seed-reading-module.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import passagesSeed from '../data/reading-passages-seed.json';
import exercisesSeed from '../data/reading-exercises-seed.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding reading module...');

  // Clear existing data (optional, for development)
  await prisma.readingAttempt.deleteMany();
  await prisma.readingExercise.deleteMany();
  await prisma.readingPassage.deleteMany();

  // Seed passages
  const passageMap = new Map<string, string>(); // title -> id
  
  for (const passageData of passagesSeed.passages) {
    const passage = await prisma.readingPassage.create({
      data: {
        title: passageData.title,
        content: passageData.content,
        cefrLevel: passageData.cefr_level,
        topic: passageData.topic,
        wordCount: passageData.word_count,
        estimatedReadingTimeMinutes: passageData.estimated_reading_time_minutes,
        difficultyScore: passageData.difficulty_score,
        source: passageData.source,
        isPremium: passageData.is_premium,
      },
    });
    
    passageMap.set(passageData.title, passage.id);
    console.log(`✅ Created passage: ${passageData.title}`);
  }

  // Seed exercises
  for (const exerciseData of exercisesSeed.exercises) {
    const passageId = passageMap.get(exerciseData.passage_ref);
    
    if (!passageId) {
      console.error(`❌ Passage not found for exercise: ${exerciseData.passage_ref}`);
      continue;
    }

    await prisma.readingExercise.create({
      data: {
        passageId,
        exerciseType: exerciseData.exercise_type,
        question: exerciseData.question,
        exerciseData: exerciseData.exercise_data,
        explanation: exerciseData.explanation,
        difficultyLevel: exerciseData.difficulty_level,
        displayOrder: exerciseData.display_order,
      },
    });
  }

  console.log(`✅ Created ${exercisesSeed.exercises.length} exercises`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run command:**
```bash
npx tsx scripts/seed-reading-module.ts
```

**Acceptance Criteria:**
- [x] Script runs without errors
- [x] All 70 passages inserted
- [x] All 350+ exercises inserted
- [x] Foreign keys correctly link exercises to passages
- [x] Verify with query: `SELECT COUNT(*) FROM reading_passages;` → 70

---

#### **Task 2.4: Validate data quality**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**Validation Checks:**

1. **No duplicate titles:**
   ```sql
   SELECT title, COUNT(*) 
   FROM reading_passages 
   GROUP BY title 
   HAVING COUNT(*) > 1;
   ```

2. **All passages have exercises:**
   ```sql
   SELECT p.title, COUNT(e.id) as exercise_count
   FROM reading_passages p
   LEFT JOIN reading_exercises e ON p.id = e.passage_id
   GROUP BY p.id, p.title
   HAVING COUNT(e.id) < 5;
   ```

3. **Word count matches content:**
   ```sql
   SELECT title, word_count, 
          LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1 as actual_word_count
   FROM reading_passages
   WHERE word_count != LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1;
   ```

4. **CEFR distribution:**
   ```sql
   SELECT cefr_level, COUNT(*) 
   FROM reading_passages 
   GROUP BY cefr_level 
   ORDER BY cefr_level;
   ```
   **Expected:** 10 per level (A1-C2) + 10 mixed = 70 total

5. **Exercise type distribution:**
   ```sql
   SELECT exercise_type, COUNT(*) 
   FROM reading_exercises 
   GROUP BY exercise_type;
   ```

**Acceptance Criteria:**
- [x] No duplicate titles found
- [x] All passages have ≥5 exercises
- [x] Word counts accurate (±5% variance allowed)
- [x] CEFR distribution: 10 per level
- [x] Exercise types distributed correctly

---

### **Week 4: Documentation**

#### **Task 3.1: Document database schema**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**File:** `.execution/tasks-reading/db-schema-docs.md`

**Contents:**
1. ER diagram (Mermaid syntax)
2. Table descriptions
3. Column definitions
4. Index explanations
5. Foreign key relationships
6. Sample queries

**Acceptance Criteria:**
- [x] Documentation complete
- [x] ER diagram renders correctly
- [x] All tables documented
- [x] Sample queries tested

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Schema Design | 10h |
| Seed Data Creation | 20-28h |
| Validation & Testing | 4h |
| Documentation | 2h |
| **Total** | **36-44h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All 4 database tables created
- [ ] Prisma schema updated
- [ ] Migrations applied successfully
- [ ] 70 reading passages seeded
- [ ] 350+ exercises seeded
- [ ] All validation queries pass
- [ ] Indexes improve query performance (test with EXPLAIN ANALYZE)
- [ ] Documentation complete

---

## 📞 Coordination Points

**With Backend Developer:**
- Share database schema early (Week 1)
- Validate API query performance (Week 3)
- Discuss SRS algorithm fields (Week 2)

**With Frontend Developer:**
- Confirm exercise data structure (Week 2)
- Share sample passages for UI development (Week 3)

**With Integration Specialist:**
- Provide seed data access (Week 4)
- Help debug query issues (Week 3-4)

---

## 🚀 Next Steps After Completion

1. Notify Backend Dev: Schema ready for API development
2. Provide sample data for Frontend Dev to build UI
3. Create backup of seed data (`.sql` dump file)
4. Monitor database performance (slow query log)

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ Ready for Execution
