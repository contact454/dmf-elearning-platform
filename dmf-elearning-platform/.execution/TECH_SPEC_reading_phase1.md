# Technical Specification - Reading Module Phase 1

**Project:** DMF E-Learning Platform - Reading Module MVP  
**Tech Lead:** [Tech Lead Name]  
**Date:** February 6, 2026  
**Status:** ✅ APPROVED WITH MINOR CONCERNS  
**Version:** 1.0

---

## 🎯 Executive Summary

This technical specification provides the architecture, API contracts, database schema, and implementation guidelines for the Reading Module Phase 1. The module will support 70 reading passages across CEFR levels A1-C2 with 4 exercise types, interactive vocabulary, progress tracking, and SRS integration.

**Key Technical Decisions:**
- **Architecture:** Event-sourced microservices with CQRS pattern (existing DMF architecture)
- **Database:** PostgreSQL with Prisma ORM (consistent with other services)
- **API Style:** REST + Event-driven (command service + read service)
- **Frontend:** React 18 + TypeScript, Shadcn UI, React Query, Zustand
- **Scalability Target:** 10k+ concurrent users, <500ms p95 latency

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Web)                          │
│  - PassageDisplay, InteractiveText, Exercise Components         │
│  - React Query (API state), Zustand (UI state)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ REST API (HTTPS)
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      API Gateway (Future)                       │
│  - Rate limiting, Auth validation, Request routing              │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
   ┌─────────▼──────────┐            ┌─────────▼──────────┐
   │  Reading Command   │            │  Reading Read      │
   │     Service        │            │    Service         │
   │                    │            │                    │
   │ - Submit exercises │            │ - Get passages     │
   │ - Save vocabulary  │            │ - Get progress     │
   │ - Emit events      │            │ - Query attempts   │
   └─────────┬──────────┘            └──────────┬─────────┘
             │                                  │
             │ Events (PostgreSQL NOTIFY)       │
             │                                  │
   ┌─────────▼──────────────────────────────────▼─────────┐
   │              PostgreSQL Database                     │
   │  - reading_passages, reading_exercises               │
   │  - user_reading_progress, reading_attempts           │
   │  - user_vocabulary (shared with SRS)                 │
   └──────────────────────────────────────────────────────┘
```

### Service Responsibilities

#### **Reading Command Service** (New)
- **Port:** 3007
- **Responsibilities:**
  - Accept exercise submissions
  - Validate answers (4 types)
  - Emit `ReadingExerciseCompleted` events
  - Save vocabulary to SRS system
  - Update user progress (via events)
- **Technology:** Fastify, Prisma, @dmf/shared

#### **Reading Read Service** (Existing: read-service)
- **Port:** 3005
- **Responsibilities:**
  - Serve reading passages (list, filter, get by ID)
  - Serve user progress (aggregated stats)
  - Query exercise attempts (analytics)
  - Maintain read models (projections from events)
- **Technology:** Fastify, Prisma, @dmf/read-models

---

## 📊 Database Schema

### 1. `reading_passages` Table

```sql
CREATE TABLE reading_passages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topic VARCHAR(100), -- daily_life, business, academic, culture, science, etc.
  word_count INT NOT NULL CHECK (word_count > 0),
  estimated_reading_time_minutes INT DEFAULT 0,
  difficulty_score DECIMAL(3,2) CHECK (difficulty_score BETWEEN 1.0 AND 10.0),
  source VARCHAR(200),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reading_passages_cefr ON reading_passages(cefr_level);
CREATE INDEX idx_reading_passages_topic ON reading_passages(topic);
CREATE INDEX idx_reading_passages_premium ON reading_passages(is_premium);
CREATE INDEX idx_reading_passages_difficulty ON reading_passages(difficulty_score);
```

**Rationale:**
- `cefr_level` constraint ensures data integrity (only valid CEFR levels)
- `word_count` validation prevents empty passages
- Indexes on `cefr_level`, `topic` optimize common filter queries
- `is_premium` enables tiered access control (free vs paid users)

**Capacity Estimate:**
- 70 passages × ~500 bytes/passage = ~35KB (negligible)
- Index overhead: ~10KB
- **Total:** <50KB for Phase 1

---

### 2. `reading_exercises` Table

```sql
CREATE TABLE reading_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  exercise_type VARCHAR(50) NOT NULL CHECK (exercise_type IN ('multiple_choice', 'true_false', 'fill_blank', 'sequencing')),
  question TEXT NOT NULL,
  exercise_data JSONB NOT NULL, -- Type-specific data structure
  explanation TEXT,
  difficulty_level INT DEFAULT 5 CHECK (difficulty_level BETWEEN 1 AND 10),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reading_exercises_passage_id ON reading_exercises(passage_id);
CREATE INDEX idx_reading_exercises_type ON reading_exercises(exercise_type);
CREATE INDEX idx_reading_exercises_display_order ON reading_exercises(passage_id, display_order);
```

**JSONB Schema by Exercise Type:**

**Multiple Choice:**
```json
{
  "options": ["Option A", "Option B", "Option C", "Option D"],
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
  "alternatives": ["Fox", "FOX"],
  "word_bank": ["fox", "cat", "dog", "bird"]
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

**Rationale:**
- JSONB allows flexible, type-specific data without schema migration overhead
- `exercise_type` constraint prevents invalid types
- Composite index `(passage_id, display_order)` optimizes ordered exercise retrieval
- `ON DELETE CASCADE` ensures referential integrity (delete passage → delete exercises)

**Capacity Estimate:**
- 350 exercises × ~300 bytes/exercise = ~105KB
- Index overhead: ~30KB
- **Total:** ~135KB for Phase 1

---

### 3. `user_reading_progress` Table

```sql
CREATE TABLE user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References auth.users (Supabase Auth)
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  
  -- Progress metrics
  completed_at TIMESTAMPTZ,
  total_exercises INT DEFAULT 0,
  correct_exercises INT DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0 CHECK (accuracy_percentage BETWEEN 0 AND 100),
  time_spent_seconds INT DEFAULT 0,
  
  -- SRS (Spaced Repetition System) fields
  review_count INT DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, passage_id)
);

-- Indexes
CREATE INDEX idx_user_reading_progress_user_id ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_next_review ON user_reading_progress(next_review_at);
CREATE INDEX idx_user_reading_progress_completed ON user_reading_progress(completed_at);
CREATE INDEX idx_user_reading_progress_accuracy ON user_reading_progress(user_id, accuracy_percentage);
```

**Rationale:**
- `UNIQUE(user_id, passage_id)` prevents duplicate progress records
- `accuracy_percentage` constraint ensures valid percentages
- `next_review_at` index enables efficient SRS queue queries (upcoming reviews)
- `completed_at` index supports "completed passages" queries
- Composite index `(user_id, accuracy_percentage)` optimizes performance analytics

**Capacity Estimate (10k users):**
- 10k users × 70 passages × 150 bytes/record = ~105MB
- Index overhead: ~50MB
- **Total:** ~155MB for 10k users

**Scalability:** At 100k users → ~1.5GB (manageable with PostgreSQL partitioning if needed)

---

### 4. `reading_attempts` Table

```sql
CREATE TABLE reading_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  passage_id UUID NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES reading_exercises(id) ON DELETE CASCADE,
  
  -- Attempt data
  user_answer JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  accuracy_score DECIMAL(5,2) DEFAULT 0 CHECK (accuracy_score BETWEEN 0 AND 100),
  time_spent_seconds INT DEFAULT 0,
  
  -- Optional: SRS quality rating (0-5, SuperMemo-2)
  quality_rating INT CHECK (quality_rating BETWEEN 0 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reading_attempts_user_id ON reading_attempts(user_id);
CREATE INDEX idx_reading_attempts_exercise_id ON reading_attempts(exercise_id);
CREATE INDEX idx_reading_attempts_passage_id ON reading_attempts(passage_id);
CREATE INDEX idx_reading_attempts_created_at ON reading_attempts(created_at DESC);
CREATE INDEX idx_reading_attempts_user_created ON reading_attempts(user_id, created_at DESC);
```

**User Answer JSONB Schema:**

**Multiple Choice:**
```json
{ "selected_index": 2 }
```

**True/False:**
```json
{ "answer": false }
```

**Fill-in-the-Blank:**
```json
{ "answer": "fox" }
```

**Sequencing:**
```json
{ "order": ["s1", "s3", "s2", "s4"] }
```

**Rationale:**
- High-write table (every exercise submission)
- `(user_id, created_at DESC)` index optimizes recent activity queries
- `accuracy_score` supports partial credit (fuzzy matching in fill-blank)
- Stores both `user_answer` and `correct_answer` for audit/analytics
- `created_at DESC` index enables time-series analytics

**Capacity Estimate (10k users):**
- 10k users × 70 passages × 5 exercises × 2 attempts × 200 bytes = ~140MB
- Index overhead: ~80MB
- **Total:** ~220MB for 10k users

**Data Retention:**
- **Recommendation:** Archive attempts >6 months to separate table (cold storage)
- **Partitioning:** Partition by `created_at` (monthly) for performance

---

## 🔌 API Contracts

### REST API Endpoints

#### **1. GET /api/reading/passages**

**Description:** List reading passages with filtering and pagination

**Query Parameters:**
- `cefr` (optional): Filter by CEFR level (`A1`, `A2`, ..., `C2`)
- `topic` (optional): Filter by topic (`business`, `culture`, etc.)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 50): Items per page
- `sort` (optional, default: `difficulty_asc`): Sort order
  - `difficulty_asc`, `difficulty_desc`, `created_desc`

**Response (200 OK):**
```json
{
  "passages": [
    {
      "id": "uuid",
      "title": "Greetings Around the World",
      "cefrLevel": "A1",
      "topic": "culture",
      "wordCount": 61,
      "estimatedReadingTimeMinutes": 1,
      "difficultyScore": 1.5,
      "isPremium": false,
      "createdAt": "2026-02-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 70,
    "totalPages": 7
  }
}
```

**Performance Target:** <300ms p95

**Caching Strategy:**
- Public passages (non-premium): 1 hour cache (CDN)
- Premium passages: 5 minutes cache (user-specific)

---

#### **2. GET /api/reading/passages/:id**

**Description:** Get single passage with exercises and user progress

**Path Parameters:**
- `id` (required): Passage UUID

**Response (200 OK):**
```json
{
  "passage": {
    "id": "uuid",
    "title": "Greetings Around the World",
    "content": "Hello is a common greeting...",
    "cefrLevel": "A1",
    "topic": "culture",
    "wordCount": 61,
    "estimatedReadingTimeMinutes": 1,
    "difficultyScore": 1.5,
    "isPremium": false,
    "exercises": [
      {
        "id": "uuid",
        "exerciseType": "multiple_choice",
        "question": "What do people say in Spanish?",
        "exerciseData": {
          "options": ["Hola", "Bonjour", "Konnichiwa", "Hello"],
          "correct_index": 0
        },
        "explanation": "The passage states...",
        "difficultyLevel": 2,
        "displayOrder": 1
      }
    ]
  },
  "userProgress": {
    "completedAt": null,
    "totalExercises": 0,
    "correctExercises": 0,
    "accuracyPercentage": 0,
    "timeSpentSeconds": 0
  }
}
```

**Error Responses:**
- `404 Not Found`: Passage does not exist
- `403 Forbidden`: Premium passage requires authentication

**Performance Target:** <250ms p95

---

#### **3. POST /api/reading/submit**

**Description:** Submit exercise attempt and receive validation

**Request Body:**
```json
{
  "passageId": "uuid",
  "exerciseId": "uuid",
  "userAnswer": {
    "selected_index": 0
  },
  "timeSpentSeconds": 45
}
```

**Response (200 OK):**
```json
{
  "attemptId": "uuid",
  "isCorrect": true,
  "accuracyScore": 100,
  "correctAnswer": {
    "options": ["Hola", "Bonjour", "Konnichiwa", "Hello"],
    "correct_index": 0
  },
  "explanation": "The passage states that in Spanish, people say 'Hola'.",
  "xpEarned": 10
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Exercise does not exist
- `429 Too Many Requests`: Rate limit exceeded (10 req/10s)

**Performance Target:** <400ms p95

**Side Effects:**
- Emits `ReadingExerciseCompleted` event
- Updates `user_reading_progress` (via event handler)
- Saves `reading_attempts` record

---

#### **4. GET /api/reading/progress**

**Description:** Get user's reading progress statistics

**Response (200 OK):**
```json
{
  "passagesCompleted": 12,
  "accuracyByLevel": [
    { "level": "A1", "averageAccuracy": 92.5, "attempts": 50 },
    { "level": "A2", "averageAccuracy": 85.3, "attempts": 30 }
  ],
  "totalTimeSpentMinutes": 180,
  "recentAttempts": 25,
  "streak": {
    "current": 7,
    "longest": 15
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated

**Performance Target:** <600ms p95 (aggregation-heavy)

**Optimization:**
- Pre-compute aggregates in read model (updated via events)
- Cache per user (5 minutes TTL)

---

#### **5. POST /api/vocabulary/save**

**Description:** Save word from passage to user's vocabulary (SRS integration)

**Request Body:**
```json
{
  "word": "greet",
  "passageId": "uuid",
  "context": "Learning how to greet people in different languages..."
}
```

**Response (200 OK):**
```json
{
  "message": "Word saved successfully",
  "vocabulary": {
    "id": "uuid",
    "word": "greet",
    "definition": "To address with expressions of goodwill",
    "translationVi": "Chào hỏi",
    "pronunciation": "/ɡriːt/",
    "exampleSentence": "Learning how to greet people...",
    "status": "new",
    "nextReviewAt": "2026-02-07T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `409 Conflict`: Word already in vocabulary

**Performance Target:** <500ms p95 (dictionary lookup involved)

**Side Effects:**
- Emits `VocabularySaved` event
- Calculates `next_review_at` (SuperMemo-2 algorithm, initial: +1 day)

---

## 🧮 Validation Logic

### Answer Validation Algorithms

#### **1. Multiple Choice**
```typescript
function validateMultipleChoice(
  exerciseData: { correct_index: number },
  userAnswer: { selected_index: number }
): ValidationResult {
  return {
    isCorrect: userAnswer.selected_index === exerciseData.correct_index,
    accuracyScore: userAnswer.selected_index === exerciseData.correct_index ? 100 : 0
  };
}
```

**Complexity:** O(1)  
**Performance:** <1ms

---

#### **2. True/False**
```typescript
function validateTrueFalse(
  exerciseData: { is_true: boolean },
  userAnswer: { answer: boolean }
): ValidationResult {
  return {
    isCorrect: userAnswer.answer === exerciseData.is_true,
    accuracyScore: userAnswer.answer === exerciseData.is_true ? 100 : 0
  };
}
```

**Complexity:** O(1)  
**Performance:** <1ms

---

#### **3. Fill-in-the-Blank (Fuzzy Matching)**

**Algorithm:** Levenshtein distance with 85% similarity threshold

```typescript
function validateFillBlank(
  exerciseData: { correct_answer: string; alternatives?: string[] },
  userAnswer: { answer: string }
): ValidationResult {
  const userAnswerLower = userAnswer.answer.trim().toLowerCase();
  const correctAnswerLower = exerciseData.correct_answer.toLowerCase();
  
  // Exact match
  if (userAnswerLower === correctAnswerLower) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Check alternatives
  if (exerciseData.alternatives?.some(alt => alt.toLowerCase() === userAnswerLower)) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Fuzzy match (Levenshtein distance)
  const similarity = levenshteinSimilarity(userAnswerLower, correctAnswerLower);
  
  return {
    isCorrect: similarity >= 0.85,
    accuracyScore: Math.round(similarity * 100)
  };
}
```

**Levenshtein Distance Implementation:**
```typescript
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  return (maxLen - distance) / maxLen;
}
```

**Complexity:** O(n × m) where n, m = string lengths  
**Performance:** <5ms for typical word lengths (<20 chars)

**Examples:**
- `"fox"` vs `"fox"` → 100% (exact match)
- `"fox"` vs `"Fox"` → 100% (case-insensitive)
- `"fox"` vs `"foxs"` → 87.5% (1 char edit, 4 chars total)
- `"fox"` vs `"fax"` → 66.7% (1 substitution, 3 chars total) → REJECTED

---

#### **4. Sequencing (Partial Credit)**

```typescript
function validateSequencing(
  exerciseData: { correct_order: string[] },
  userAnswer: { order: string[] }
): ValidationResult {
  // Exact match
  if (JSON.stringify(exerciseData.correct_order) === JSON.stringify(userAnswer.order)) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Partial credit: count correct positions
  let correctPositions = 0;
  const length = Math.min(exerciseData.correct_order.length, userAnswer.order.length);
  
  for (let i = 0; i < length; i++) {
    if (exerciseData.correct_order[i] === userAnswer.order[i]) {
      correctPositions++;
    }
  }
  
  const accuracyScore = Math.round((correctPositions / exerciseData.correct_order.length) * 100);
  
  return {
    isCorrect: accuracyScore === 100,
    accuracyScore
  };
}
```

**Complexity:** O(n) where n = number of sentences  
**Performance:** <1ms (typically 4-6 sentences)

**Examples:**
- `["s1", "s2", "s3", "s4"]` vs `["s1", "s2", "s3", "s4"]` → 100% (perfect)
- `["s1", "s2", "s3", "s4"]` vs `["s1", "s3", "s2", "s4"]` → 50% (2/4 correct positions)
- `["s1", "s2", "s3", "s4"]` vs `["s4", "s3", "s2", "s1"]` → 0% (reversed)

---

## 🔁 SRS (Spaced Repetition System) Integration

### SuperMemo-2 Algorithm

**Variables:**
- `ease_factor` (EF): Initial 2.5, range [1.3, ∞)
- `interval_days` (I): Days until next review
- `review_count` (n): Number of reviews completed

**Formula:**
```
If quality >= 3 (correct answer):
  I(1) = 1 day
  I(2) = 6 days
  I(n) = I(n-1) × EF

  EF_new = EF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
  EF_new = max(1.3, EF_new)

If quality < 3 (incorrect answer):
  I(n) = 1 day (reset to beginning)
  EF unchanged
```

**Implementation:**
```typescript
interface SRSState {
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
}

function calculateNextReview(
  currentState: SRSState,
  quality: number // 0-5 (0=total blackout, 5=perfect recall)
): SRSState {
  if (quality < 3) {
    // Incorrect answer: reset interval
    return {
      easeFactor: currentState.easeFactor,
      intervalDays: 1,
      reviewCount: currentState.reviewCount + 1
    };
  }
  
  // Correct answer: increase interval
  let newEaseFactor = currentState.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  let newInterval: number;
  if (currentState.reviewCount === 0) {
    newInterval = 1;
  } else if (currentState.reviewCount === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(currentState.intervalDays * newEaseFactor);
  }
  
  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    reviewCount: currentState.reviewCount + 1
  };
}
```

**Phase 1 Simplification:**
- Map `is_correct` → quality:
  - `is_correct = true` → quality = 4 (good recall)
  - `is_correct = false` → quality = 2 (incorrect)
- Future phases can add user-reported difficulty (0-5 scale)

---

## 🚀 Performance Benchmarks

### Target Metrics (p95 latency)

| Endpoint | Target | Rationale |
|----------|--------|-----------|
| GET /passages | <300ms | List query, cacheable |
| GET /passages/:id | <250ms | Single query + join (exercises) |
| POST /submit | <400ms | Validation + 2 writes (attempt, progress) |
| GET /progress | <600ms | Aggregation-heavy query |
| POST /vocabulary/save | <500ms | Dictionary lookup + write |

### Database Query Optimization

**1. Passage List Query (with filters):**
```sql
-- Before optimization (no indexes): ~800ms
SELECT * FROM reading_passages 
WHERE cefr_level = 'B1' AND is_premium = false
ORDER BY difficulty_score ASC
LIMIT 10 OFFSET 0;

-- After indexes: <50ms
-- Uses: idx_reading_passages_cefr, idx_reading_passages_premium, idx_reading_passages_difficulty
```

**2. Passage with Exercises (N+1 problem avoided):**
```sql
-- Optimized query (single join): ~80ms
SELECT 
  p.*,
  json_agg(json_build_object(
    'id', e.id,
    'exerciseType', e.exercise_type,
    'question', e.question,
    'exerciseData', e.exercise_data,
    'explanation', e.explanation,
    'difficultyLevel', e.difficulty_level,
    'displayOrder', e.display_order
  ) ORDER BY e.display_order) AS exercises
FROM reading_passages p
LEFT JOIN reading_exercises e ON p.id = e.passage_id
WHERE p.id = $1
GROUP BY p.id;

-- Uses: idx_reading_exercises_display_order
```

**3. User Progress Aggregation:**
```sql
-- Optimized with read model (pre-aggregated): <100ms
SELECT 
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS passages_completed,
  json_agg(json_build_object(
    'level', cefr_level,
    'averageAccuracy', AVG(accuracy_percentage),
    'attempts', COUNT(*)
  )) AS accuracy_by_level,
  SUM(time_spent_seconds) AS total_time_spent
FROM user_reading_progress urp
JOIN reading_passages p ON urp.passage_id = p.id
WHERE urp.user_id = $1
GROUP BY p.cefr_level;

-- Uses: idx_user_reading_progress_user_id, idx_user_reading_progress_completed
```

### Load Testing Targets

**Phase 1 (MVP):**
- **Concurrent users:** 100
- **Requests/second:** 50 (mixed read/write)
- **Database connections:** 20 (pooled)

**Production (10k users):**
- **Concurrent users:** 1,000
- **Requests/second:** 500
- **Database connections:** 100 (pooled)
- **Cache hit rate:** >80% (public passages)

**Scaling Strategy:**
- Horizontal scaling: Add read replicas (read service)
- Vertical scaling: Upgrade database instance (16GB RAM → 32GB)
- CDN caching: CloudFlare for static content + passage list

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

**Authentication:**
- **Mechanism:** Supabase Auth (JWT tokens)
- **Endpoints:**
  - Public (no auth): GET /passages (non-premium only)
  - Private (auth required): POST /submit, GET /progress, POST /vocabulary/save

**Authorization:**
- **Premium content access:**
  ```typescript
  if (passage.isPremium && !user.hasPremiumSubscription) {
    throw new ForbiddenError('Premium subscription required');
  }
  ```
- **User data isolation:** All queries filter by `user_id` (from JWT)

**Token Validation:**
```typescript
import { verify } from 'jsonwebtoken';

async function validateJWT(token: string): Promise<User> {
  const payload = verify(token, process.env.SUPABASE_JWT_SECRET!);
  return { id: payload.sub, email: payload.email };
}
```

---

### 2. Input Validation

**Request Body Validation (Zod):**
```typescript
import { z } from 'zod';

const SubmitExerciseSchema = z.object({
  passageId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  userAnswer: z.union([
    z.object({ selected_index: z.number().int().min(0).max(3) }), // Multiple choice
    z.object({ answer: z.boolean() }), // True/False
    z.object({ answer: z.string().min(1).max(100) }), // Fill blank
    z.object({ order: z.array(z.string()).min(2).max(10) }) // Sequencing
  ]),
  timeSpentSeconds: z.number().int().min(0).max(3600) // Max 1 hour
});
```

**SQL Injection Prevention:**
- **Prisma ORM:** Parameterized queries (built-in protection)
- **Never concatenate user input into raw SQL**

**XSS Prevention:**
- **Frontend:** React auto-escapes JSX
- **Backend:** Sanitize user-generated content (future: comments, notes)

---

### 3. Rate Limiting

**Per-User Rate Limits (Upstash Redis):**
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true
});

// Apply to POST /submit (prevent spam)
const { success } = await ratelimit.limit(userId);
if (!success) {
  throw new RateLimitError('Too many requests');
}
```

**Why:** Prevents abuse (automated answer guessing, DDoS)

---

### 4. Data Privacy

**GDPR Compliance:**
- **Right to erasure:** ON DELETE CASCADE ensures user data removal propagates
- **Data retention:** Archive `reading_attempts` >6 months (optional user consent)
- **Anonymization:** Aggregate analytics use hashed user IDs

**Sensitive Data:**
- **Passwords:** Handled by Supabase Auth (bcrypt)
- **Vocabulary context:** May contain sensitive notes (encrypt at rest if needed)

---

## 📦 Deployment Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                           │
│  - Cache public passages (1 hour TTL)                       │
│  - DDoS protection, WAF                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                 Vercel (Frontend)                           │
│  - Next.js SSR/SSG (reading passage pages)                  │
│  - Edge functions (future: A/B testing)                     │
└─────────────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│            Backend Services (Docker/Kubernetes)             │
│  - Reading Command Service (Port 3007)                      │
│  - Reading Read Service (Port 3005)                         │
│  - Gamification Service (XP, Achievements)                  │
└────────┬────────────────────────────────┬───────────────────┘
         │                                │
┌────────▼────────┐              ┌────────▼────────┐
│  PostgreSQL     │              │  Upstash Redis  │
│  (Supabase)     │              │  (Rate limiting,│
│  - Primary DB   │              │   Caching)      │
│  - Read replica │              └─────────────────┘
└─────────────────┘
```

### Deployment Pipeline (CI/CD)

**GitHub Actions Workflow:**
```yaml
name: Deploy Reading Module

on:
  push:
    branches: [main]
    paths:
      - 'services/reading-command-service/**'
      - 'services/read-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Run tests
        run: pnpm test
      - name: Run E2E tests
        run: pnpm e2e:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel (Frontend)
        run: vercel --prod
      - name: Deploy to Kubernetes (Backend)
        run: kubectl apply -f k8s/reading-service.yaml
```

**Environments:**
- **Development:** Local (Docker Compose)
- **Staging:** Kubernetes cluster (shared with other services)
- **Production:** Kubernetes cluster (isolated namespace)

---

## ✅ Acceptance Criteria (Technical)

Before approving for production deployment, verify:

### Database
- [ ] All 4 tables created with correct schema
- [ ] Indexes improve query performance (EXPLAIN ANALYZE verified)
- [ ] Foreign key constraints enforce referential integrity
- [ ] Seed data (70 passages, 350+ exercises) loaded successfully

### Backend API
- [ ] All 5 endpoints functional (manual + automated tests)
- [ ] Answer validation works for all 4 exercise types
- [ ] SRS algorithm calculates correct `next_review_at`
- [ ] Rate limiting prevents abuse (429 returned after 10 req/10s)
- [ ] Response times meet targets (p95 latency <500ms)

### Frontend
- [ ] PassageDisplay renders correctly (desktop + mobile)
- [ ] InteractiveText handles word clicks (popup appears)
- [ ] All 4 exercise components functional
- [ ] Feedback system shows correct/incorrect states
- [ ] Progress dashboard displays accurate stats
- [ ] Keyboard accessible (Tab navigation works)
- [ ] WCAG 2.1 AA compliance (0 axe violations)

### Performance
- [ ] Lighthouse score >85 (all categories)
- [ ] Bundle size <150KB (gzipped)
- [ ] API latency <500ms p95 (load test with 100 concurrent users)
- [ ] Database query times <100ms (monitored via Prisma logs)

### Security
- [ ] Authentication enforced (401 for protected endpoints)
- [ ] Input validation rejects invalid data (400 errors)
- [ ] SQL injection tests pass (OWASP ZAP scan)
- [ ] Rate limiting works (429 after threshold)

---

## 🚨 Known Risks & Mitigations

### Risk 1: Fuzzy Matching False Positives
**Risk:** 85% similarity threshold may accept incorrect answers (e.g., "cat" vs "bat" = 66% → rejected, but "running" vs "runing" = 85% → accepted)

**Mitigation:**
- Start with 85% threshold, monitor false positive rate
- Adjust threshold per CEFR level (A1: strict 95%, C2: lenient 80%)
- Add manual review queue for borderline cases (85-90% similarity)

**Status:** ⚠️ Monitor in production

---

### Risk 2: Database Write Contention
**Risk:** High-write table (`reading_attempts`) may cause lock contention at scale (1000+ concurrent users)

**Mitigation:**
- Partition `reading_attempts` by `created_at` (monthly partitions)
- Use write-optimized database instance (SSD, high IOPS)
- Batch inserts (future: buffer in Redis, flush every 5 seconds)

**Status:** ⚠️ Acceptable for Phase 1 (<1000 users), revisit in Phase 2

---

### Risk 3: SRS Algorithm Complexity
**Risk:** SuperMemo-2 algorithm may be too aggressive (long intervals scare users)

**Mitigation:**
- Phase 1: Use simplified SRS (1 day, 3 days, 7 days, 30 days)
- Add "Review Now" button (user override)
- Monitor review completion rate (target >70%)

**Status:** ✅ Accepted (can adjust algorithm post-launch)

---

### Risk 4: Seed Data Quality
**Risk:** 70 passages + 350 exercises is time-consuming to create (12-16 hours estimated)

**Mitigation:**
- Use AI-generated drafts (Claude/GPT-4), human review
- Hire freelance ESL expert for validation ($500 budget)
- Phase 1: Launch with 30 passages (5 per level), expand post-launch

**Status:** ⚠️ Consider reduced scope (30 passages) if timeline tight

---

## 📚 References

- **SuperMemo-2 Algorithm:** [https://www.supermemo.com/en/archives1990-2015/english/ol/sm2](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- **Levenshtein Distance:** [https://en.wikipedia.org/wiki/Levenshtein_distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- **WCAG 2.1 Guidelines:** [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **PostgreSQL Partitioning:** [https://www.postgresql.org/docs/current/ddl-partitioning.html](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ APPROVED WITH MINOR CONCERNS  
**Next Review:** After Phase 1 completion (Week 10)
