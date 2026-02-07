# Database Specialist - Writing Module Phase 1

**Role:** Database Design & Seed Data Creation  
**Duration:** Weeks 1-3 (20-24 hours total)  
**Priority:** HIGH (blocks backend development)

---

## 🎯 Your Mission

Design and implement the database schema for the Writing Module, create seed data for 20 essay prompts across CEFR levels A1-B2, and ensure optimal performance through proper indexing.

---

## ✅ Task Checklist

### **Week 1: Schema Design**

#### **Task 1.1: Design `users` table**
**Duration:** 1.5 hours  
**Priority:** P0 (Critical)

**Description:** Create table to store user authentication and profile data

**Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'free', -- free, premium, classroom
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Constraints:**
```sql
ALTER TABLE users
  ADD CONSTRAINT check_tier 
    CHECK (tier IN ('free', 'premium', 'classroom')),
  ADD CONSTRAINT check_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Index on email for fast login lookups
CREATE INDEX idx_users_email ON users(email);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] Email unique constraint enforced
- [x] Tier enum validated
- [x] Test insert passes validation

---

#### **Task 1.2: Design `prompts` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Store structured essay prompts with CEFR metadata and writing tips

**Schema:**
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cefr_level VARCHAR(2) NOT NULL, -- A1, A2, B1, B2, C1, C2
  category VARCHAR(100), -- daily_life, opinion, description, formal_letter
  target_word_count INT DEFAULT 200,
  tips JSONB, -- Array of writing tips
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tips JSONB Structure:**
```json
{
  "tips": [
    "Use present tense (Präsens)",
    "Include time expressions (um 7 Uhr, dann, später)",
    "Mention at least 5 daily activities"
  ]
}
```

**Constraints:**
```sql
ALTER TABLE prompts
  ADD CONSTRAINT check_cefr_level 
    CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  ADD CONSTRAINT check_target_word_count 
    CHECK (target_word_count > 0 AND target_word_count <= 1000);

-- Indexes for filtering prompts by level and category
CREATE INDEX idx_prompts_cefr_level ON prompts(cefr_level);
CREATE INDEX idx_prompts_category ON prompts(category);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] CEFR level constraint enforced
- [x] JSONB tips structure validated
- [x] Indexes created
- [x] Test query: `SELECT * FROM prompts WHERE cefr_level = 'B1'` → fast

---

#### **Task 1.3: Design `essays` table**
**Duration:** 2.5 hours  
**Priority:** P0 (Critical)

**Description:** Store user essays with content, metadata, and SRS tracking fields

**Schema:**
```sql
CREATE TABLE essays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  word_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  writing_time_seconds INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, reviewed
  
  -- Future SRS fields (Phase 2)
  review_count INT DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Constraints:**
```sql
ALTER TABLE essays
  ADD CONSTRAINT check_status 
    CHECK (status IN ('draft', 'submitted', 'reviewed')),
  ADD CONSTRAINT check_word_count_positive 
    CHECK (word_count >= 0),
  ADD CONSTRAINT check_error_count_positive 
    CHECK (error_count >= 0),
  ADD CONSTRAINT check_content_length 
    CHECK (LENGTH(content) <= 100000); -- Max 100k characters

-- Indexes for common queries
CREATE INDEX idx_essays_user_id ON essays(user_id);
CREATE INDEX idx_essays_created_at ON essays(created_at DESC);
CREATE INDEX idx_essays_status ON essays(status);
CREATE INDEX idx_essays_next_review ON essays(next_review_at) WHERE next_review_at IS NOT NULL;

-- Composite index for user's recent essays
CREATE INDEX idx_essays_user_created ON essays(user_id, created_at DESC);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] Foreign keys cascade correctly (delete user → delete essays)
- [x] Status enum validated
- [x] Indexes improve query performance
- [x] Test: Insert essay → Update content → Verify updated_at changes

---

#### **Task 1.4: Design `grammar_errors` table**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Log grammar errors detected by LanguageTool for analytics

**Schema:**
```sql
CREATE TABLE grammar_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  essay_id UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  error_type VARCHAR(50) NOT NULL, -- grammar, spelling, style
  message TEXT NOT NULL,
  offset INT NOT NULL, -- Character position in text
  length INT NOT NULL, -- Length of error span
  suggestions JSONB, -- Array of suggested replacements
  rule_id VARCHAR(100), -- LanguageTool rule ID (e.g., DE_PREPOSITION_CONTRACTION)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Suggestions JSONB Structure:**
```json
{
  "suggestions": [
    { "value": "zur" },
    { "value": "in die" }
  ]
}
```

**Constraints:**
```sql
ALTER TABLE grammar_errors
  ADD CONSTRAINT check_error_type 
    CHECK (error_type IN ('grammar', 'spelling', 'style')),
  ADD CONSTRAINT check_offset_positive 
    CHECK (offset >= 0),
  ADD CONSTRAINT check_length_positive 
    CHECK (length > 0);

-- Index on essay_id for fast error lookups
CREATE INDEX idx_grammar_errors_essay_id ON grammar_errors(essay_id);
CREATE INDEX idx_grammar_errors_type ON grammar_errors(error_type);
CREATE INDEX idx_grammar_errors_rule_id ON grammar_errors(rule_id);
```

**Acceptance Criteria:**
- [x] Table created with all columns
- [x] Foreign key cascades on essay delete
- [x] Error type validated
- [x] JSONB suggestions structure correct
- [x] Test: Insert error → Verify offset and length stored correctly

---

#### **Task 1.5: Create Prisma migration file (if using Prisma)**
**Duration:** 1 hour  
**Priority:** P0 (Critical)

**Steps:**
1. Update `prisma/schema.prisma`:
   ```prisma
   model User {
     id           String   @id @default(uuid()) @db.Uuid
     email        String   @unique @db.VarChar(255)
     passwordHash String   @map("password_hash") @db.VarChar(255)
     name         String?  @db.VarChar(255)
     tier         String   @default("free") @db.VarChar(20)
     createdAt    DateTime @map("created_at") @default(now()) @db.Timestamptz(6)
     updatedAt    DateTime @map("updated_at") @default(now()) @updatedAt @db.Timestamptz(6)

     essays       Essay[]

     @@index([email])
     @@map("users")
   }

   model Prompt {
     id               String   @id @default(uuid()) @db.Uuid
     title            String   @db.VarChar(255)
     description      String   @db.Text
     cefrLevel        String   @map("cefr_level") @db.VarChar(2)
     category         String?  @db.VarChar(100)
     targetWordCount  Int      @map("target_word_count") @default(200)
     tips             Json?
     createdAt        DateTime @map("created_at") @default(now()) @db.Timestamptz(6)

     essays           Essay[]

     @@index([cefrLevel])
     @@index([category])
     @@map("prompts")
   }

   model Essay {
     id                  String    @id @default(uuid()) @db.Uuid
     userId              String    @map("user_id") @db.Uuid
     promptId            String?   @map("prompt_id") @db.Uuid
     content             String    @db.Text
     wordCount           Int       @map("word_count") @default(0)
     errorCount          Int       @map("error_count") @default(0)
     writingTimeSeconds  Int       @map("writing_time_seconds") @default(0)
     status              String    @default("draft") @db.VarChar(20)
     reviewCount         Int       @map("review_count") @default(0)
     nextReviewAt        DateTime? @map("next_review_at") @db.Timestamptz(6)
     easeFactor          Decimal   @map("ease_factor") @default(2.5) @db.Decimal(3, 2)
     createdAt           DateTime  @map("created_at") @default(now()) @db.Timestamptz(6)
     updatedAt           DateTime  @map("updated_at") @default(now()) @updatedAt @db.Timestamptz(6)

     user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
     prompt              Prompt?           @relation(fields: [promptId], references: [id], onDelete: SetNull)
     grammarErrors       GrammarError[]

     @@index([userId])
     @@index([createdAt(sort: Desc)])
     @@index([status])
     @@index([nextReviewAt])
     @@index([userId, createdAt(sort: Desc)])
     @@map("essays")
   }

   model GrammarError {
     id          String   @id @default(uuid()) @db.Uuid
     essayId     String   @map("essay_id") @db.Uuid
     errorType   String   @map("error_type") @db.VarChar(50)
     message     String   @db.Text
     offset      Int
     length      Int
     suggestions Json?
     ruleId      String?  @map("rule_id") @db.VarChar(100)
     createdAt   DateTime @map("created_at") @default(now()) @db.Timestamptz(6)

     essay       Essay    @relation(fields: [essayId], references: [id], onDelete: Cascade)

     @@index([essayId])
     @@index([errorType])
     @@index([ruleId])
     @@map("grammar_errors")
   }
   ```

2. Generate migration:
   ```bash
   npx prisma migrate dev --name add_writing_module
   ```

3. Apply migration:
   ```bash
   npx prisma migrate deploy
   ```

**Acceptance Criteria:**
- [x] Prisma schema updated
- [x] Migration generated
- [x] Migration applied to database
- [x] Test query: `npx prisma studio` → view tables

**Alternative (SQL only):**
If not using Prisma, create `.sql` migration files manually and apply with:
```bash
psql -h localhost -U postgres -d dmf_elearning -f migrations/001_create_writing_tables.sql
```

---

### **Week 2-3: Seed Data Creation**

#### **Task 2.1: Create 20 essay prompts (JSON structure)**
**Duration:** 10-12 hours  
**Priority:** P0 (Critical)

**File:** `data/writing-prompts-seed.json`

**Structure:**
```json
{
  "prompts": [
    {
      "title": "Mein Tagesablauf",
      "description": "Beschreibe deinen typischen Tagesablauf von morgens bis abends. Was machst du normalerweise? Wann stehst du auf? Was isst du zum Frühstück?",
      "cefr_level": "A1",
      "category": "daily_life",
      "target_word_count": 100,
      "tips": {
        "tips": [
          "Use present tense (Präsens): ich gehe, ich esse, ich schlafe",
          "Include time expressions: um 7 Uhr, dann, danach, später",
          "Mention at least 5 daily activities",
          "Use simple sentences (Subject + Verb + Object)"
        ]
      }
    },
    {
      "title": "Mein Lieblingsessen",
      "description": "Schreibe über dein Lieblingsessen. Was ist es? Warum magst du es? Wie schmeckt es?",
      "cefr_level": "A1",
      "category": "daily_life",
      "target_word_count": 80,
      "tips": {
        "tips": [
          "Use adjectives: lecker, gut, süß, salzig",
          "Describe taste and appearance",
          "Explain why you like it (weil...)"
        ]
      }
    },
    {
      "title": "Eine Reise nach Berlin",
      "description": "Du hast Berlin besucht. Schreibe über deine Erfahrungen. Was hast du gesehen? Wo bist du gewesen?",
      "cefr_level": "A2",
      "category": "travel",
      "target_word_count": 150,
      "tips": {
        "tips": [
          "Use past tense (Perfekt): ich bin gegangen, ich habe gesehen",
          "Mention 3+ places you visited",
          "Include your feelings (es war interessant, schön, toll)",
          "Use time connectors: zuerst, dann, danach, schließlich"
        ]
      }
    },
    {
      "title": "Meine Meinung zu sozialen Medien",
      "description": "Was denkst du über soziale Medien? Sind sie gut oder schlecht? Erkläre deine Meinung mit Beispielen.",
      "cefr_level": "B1",
      "category": "opinion",
      "target_word_count": 200,
      "tips": {
        "tips": [
          "State your opinion clearly: Meiner Meinung nach..., Ich denke, dass...",
          "Give 2-3 arguments (pros or cons)",
          "Use connectors: einerseits...andererseits, außerdem, jedoch",
          "Provide examples from your experience",
          "Conclude with a summary (Zusammenfassend...)"
        ]
      }
    },
    {
      "title": "Bewerbungsschreiben für ein Praktikum",
      "description": "Schreibe ein formelles Bewerbungsschreiben für ein Praktikum in einer deutschen Firma. Erkläre, warum du geeignet bist.",
      "cefr_level": "B2",
      "category": "formal_letter",
      "target_word_count": 250,
      "tips": {
        "tips": [
          "Use formal greeting: Sehr geehrte Damen und Herren",
          "State the position you're applying for",
          "Highlight your skills and experience",
          "Use formal language (no contractions, no slang)",
          "End with: Mit freundlichen Grüßen",
          "Use subjunctive for polite requests: Ich würde mich freuen..."
        ]
      }
    }
    // ... 15 more prompts (see distribution below)
  ]
}
```

**Distribution by CEFR Level:**
- **A1:** 5 prompts (80-100 words, simple present tense, daily life topics)
  - Mein Tagesablauf
  - Mein Lieblingsessen
  - Meine Familie
  - Mein Hobby
  - Mein Zimmer

- **A2:** 5 prompts (120-150 words, past tense, personal experiences)
  - Eine Reise nach Berlin
  - Mein letztes Wochenende
  - Ein besonderer Tag
  - Meine Schulzeit
  - Ein Fest in meinem Land

- **B1:** 5 prompts (180-200 words, opinion/argumentation, complex sentences)
  - Meine Meinung zu sozialen Medien
  - Sollte man vegetarisch essen?
  - Die Vor- und Nachteile von Hausarbeit
  - Mein Traumberuf
  - Lernen online vs. im Klassenzimmer

- **B2:** 5 prompts (220-250 words, formal writing, abstract topics)
  - Bewerbungsschreiben für ein Praktikum
  - Leserbrief: Umweltschutz in der Stadt
  - Ein formeller Beschwerdebrief
  - Die Bedeutung von Bildung
  - Digitalisierung in der Arbeitswelt

**Acceptance Criteria:**
- [x] All 20 prompts created with complete metadata
- [x] Tips tailored to each CEFR level
- [x] Descriptions clear and instructive
- [x] Word count targets appropriate for level
- [x] Native German speaker review complete (or use GPT-4 with German pedagogy prompts)

---

#### **Task 2.2: Create seed script**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**File:** `scripts/seed-writing-module.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import promptsSeed from '../data/writing-prompts-seed.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding writing module...');

  // Clear existing data (optional, for development)
  await prisma.grammarError.deleteMany();
  await prisma.essay.deleteMany();
  await prisma.prompt.deleteMany();

  // Seed prompts
  for (const promptData of promptsSeed.prompts) {
    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        description: promptData.description,
        cefrLevel: promptData.cefr_level,
        category: promptData.category,
        targetWordCount: promptData.target_word_count,
        tips: promptData.tips,
      },
    });
    
    console.log(`✅ Created prompt: ${promptData.title} (${promptData.cefr_level})`);
  }

  console.log(`🎉 Seeding complete! ${promptsSeed.prompts.length} prompts created.`);
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
npx tsx scripts/seed-writing-module.ts
```

**Acceptance Criteria:**
- [x] Script runs without errors
- [x] All 20 prompts inserted
- [x] Verify with query: `SELECT COUNT(*) FROM prompts;` → 20
- [x] Verify distribution: `SELECT cefr_level, COUNT(*) FROM prompts GROUP BY cefr_level;` → 5 per level

---

#### **Task 2.3: Validate data quality**
**Duration:** 1.5 hours  
**Priority:** P1 (Important)

**Validation Checks:**

1. **No duplicate titles:**
   ```sql
   SELECT title, COUNT(*) 
   FROM prompts 
   GROUP BY title 
   HAVING COUNT(*) > 1;
   ```
   **Expected:** 0 rows

2. **CEFR distribution:**
   ```sql
   SELECT cefr_level, COUNT(*) 
   FROM prompts 
   GROUP BY cefr_level 
   ORDER BY cefr_level;
   ```
   **Expected:**
   ```
   cefr_level | count
   -----------+-------
   A1         | 5
   A2         | 5
   B1         | 5
   B2         | 5
   ```

3. **Category distribution:**
   ```sql
   SELECT category, COUNT(*) 
   FROM prompts 
   GROUP BY category;
   ```

4. **All prompts have tips:**
   ```sql
   SELECT title 
   FROM prompts 
   WHERE tips IS NULL OR tips::text = '{}';
   ```
   **Expected:** 0 rows

5. **Word count targets are reasonable:**
   ```sql
   SELECT cefr_level, 
          MIN(target_word_count) as min_words,
          MAX(target_word_count) as max_words,
          AVG(target_word_count)::INT as avg_words
   FROM prompts 
   GROUP BY cefr_level
   ORDER BY cefr_level;
   ```
   **Expected:** A1 < A2 < B1 < B2

**Acceptance Criteria:**
- [x] No duplicate titles found
- [x] CEFR distribution: 5 per level (A1-B2)
- [x] All prompts have non-empty tips
- [x] Word count targets increase with CEFR level

---

### **Week 3: Documentation & Optimization**

#### **Task 3.1: Document database schema**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**File:** `.execution/tasks-writing/db-schema-docs.md`

**Contents:**
1. **ER Diagram (Mermaid syntax)**
   ```mermaid
   erDiagram
       USERS ||--o{ ESSAYS : writes
       PROMPTS ||--o{ ESSAYS : guides
       ESSAYS ||--o{ GRAMMAR_ERRORS : contains
       
       USERS {
           uuid id PK
           varchar email UK
           varchar password_hash
           varchar name
           varchar tier
           timestamptz created_at
           timestamptz updated_at
       }
       
       PROMPTS {
           uuid id PK
           varchar title
           text description
           varchar cefr_level
           varchar category
           int target_word_count
           jsonb tips
           timestamptz created_at
       }
       
       ESSAYS {
           uuid id PK
           uuid user_id FK
           uuid prompt_id FK
           text content
           int word_count
           int error_count
           int writing_time_seconds
           varchar status
           timestamptz created_at
           timestamptz updated_at
       }
       
       GRAMMAR_ERRORS {
           uuid id PK
           uuid essay_id FK
           varchar error_type
           text message
           int offset
           int length
           jsonb suggestions
           varchar rule_id
           timestamptz created_at
       }
   ```

2. **Table Descriptions**
3. **Column Definitions**
4. **Index Explanations**
5. **Sample Queries**

**Sample Queries to Document:**
```sql
-- Get all prompts for a CEFR level
SELECT * FROM prompts WHERE cefr_level = 'B1' ORDER BY title;

-- Get user's recent essays with prompts
SELECT e.id, e.content, e.word_count, e.error_count, 
       p.title as prompt_title, e.created_at
FROM essays e
LEFT JOIN prompts p ON e.prompt_id = p.id
WHERE e.user_id = '...'
ORDER BY e.created_at DESC
LIMIT 10;

-- Get all errors for an essay
SELECT error_type, message, suggestions 
FROM grammar_errors 
WHERE essay_id = '...'
ORDER BY offset;

-- Calculate user's error rate over time
SELECT DATE(created_at) as date,
       AVG(error_count::decimal / NULLIF(word_count, 0) * 100) as error_rate
FROM essays
WHERE user_id = '...' AND word_count > 0
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Acceptance Criteria:**
- [x] Documentation complete
- [x] ER diagram renders correctly
- [x] All tables documented
- [x] Sample queries tested and working

---

#### **Task 3.2: Performance testing**
**Duration:** 1.5 hours  
**Priority:** P1 (Important)

**Tests:**

1. **Index effectiveness:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM essays 
   WHERE user_id = '...' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   **Expected:** Uses `idx_essays_user_created` index, execution time <5ms

2. **Prompt filtering:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM prompts WHERE cefr_level = 'B1';
   ```
   **Expected:** Uses `idx_prompts_cefr_level` index, execution time <2ms

3. **Error lookup:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM grammar_errors WHERE essay_id = '...';
   ```
   **Expected:** Uses `idx_grammar_errors_essay_id` index, execution time <3ms

**Acceptance Criteria:**
- [x] All indexed queries use indexes (confirmed via EXPLAIN ANALYZE)
- [x] Query execution times <10ms for common queries
- [x] No full table scans on large tables

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Schema Design | 9h |
| Seed Data Creation | 12-14h |
| Validation & Testing | 3h |
| Documentation | 3.5h |
| **Total** | **27.5-29.5h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All 4 database tables created (users, prompts, essays, grammar_errors)
- [ ] Prisma schema updated (if using Prisma)
- [ ] Migrations applied successfully
- [ ] 20 essay prompts seeded (5 per CEFR level A1-B2)
- [ ] All validation queries pass
- [ ] Indexes improve query performance (verified with EXPLAIN ANALYZE)
- [ ] Documentation complete
- [ ] Shared schema with Backend Dev (Week 1)

---

## 📞 Coordination Points

**With Backend Developer:**
- **Week 1:** Share database schema (DDL SQL or Prisma schema file)
- **Week 2:** Validate API query requirements (discuss missing indexes)
- **Week 3:** Provide sample data for API testing

**With Frontend Developer:**
- **Week 2:** Share prompt data structure (JSONB tips format)
- **Week 3:** Provide sample prompts for UI development

**With Integration Specialist:**
- **Week 3:** Provide seed data access (how to run seed script)
- **Ongoing:** Help debug query issues

---

## 🚀 Next Steps After Completion

1. **Notify Backend Dev:** Schema ready for API development
2. **Provide sample queries:** Common patterns for API endpoints
3. **Create database backup:** Export seed data as `.sql` dump
4. **Monitor performance:** Set up slow query logging (if production)

---

## 📚 Resources

**Tools:**
- PostgreSQL client: `psql`, pgAdmin, or DBeaver
- Prisma (if used): `npx prisma studio`
- Database diagramming: dbdiagram.io or Mermaid Live Editor

**References:**
- LanguageTool API docs: https://languagetool.org/http-api/swagger-ui/
- CEFR levels explained: https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions
- German grammar resources: https://www.germanveryeasy.com/

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** ✅ Ready for Execution
