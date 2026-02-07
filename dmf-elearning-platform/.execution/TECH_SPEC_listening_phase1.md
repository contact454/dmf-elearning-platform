# Technical Specification - Listening Module Phase 1

**Project:** DMF E-Learning Platform  
**Module:** Listening Comprehension  
**Phase:** 1 (Foundation + Core Exercises)  
**Tech Lead:** AI Tech Lead  
**Date:** 2026-02-06  
**Status:** APPROVED ✅

---

## 📋 Executive Summary

This technical specification provides implementation details for the Listening Module Phase 1, translating PM requirements into actionable technical architecture, API contracts, database schema, and component specifications.

**Key Technical Decisions:**
- **Audio Stack:** Howler.js (proven cross-browser compatibility)
- **Storage:** Cloudflare R2 (zero egress fees, S3-compatible API)
- **SRS Algorithm:** SM-2 with listening-specific quality rating
- **State Management:** React Query (server state) + Zustand (UI state)
- **Validation:** Zod (consistent with existing modules)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ AudioPlayer  │  │  Exercise     │  │  Progress/Feedback    │ │
│  │ (Howler.js)  │  │  Components   │  │  Components           │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────────────┘ │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │  React Query     │                            │
│                  │  (Cache Layer)   │                            │
│                  └────────┬─────────┘                            │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP/JSON
┌───────────────────────────▼──────────────────────────────────────┐
│                     API LAYER (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ GET /exercises  │  │ POST /submit │  │ GET /stats       │  │
│  └────────┬────────┘  └──────┬───────┘  └──────┬───────────┘  │
│           │                  │                  │               │
│           └──────────────────┴──────────────────┘               │
│                              │                                  │
│                   ┌──────────▼──────────┐                       │
│                   │  Business Logic     │                       │
│                   │  - Answer Checking  │                       │
│                   │  - SRS Algorithm    │                       │
│                   │  - Streak Tracking  │                       │
│                   └──────────┬──────────┘                       │
└──────────────────────────────┼───────────────────────────────────┘
                               │ Prisma ORM
┌──────────────────────────────▼───────────────────────────────────┐
│                      DATABASE (Supabase)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────┐ │
│  │ listening_       │  │ user_listening_   │  │ listening_  │ │
│  │ exercises        │  │ progress          │  │ attempts    │ │
│  └──────────────────┘  └───────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE (Cloudflare R2)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Audio Files: 70 MP3s (96kbps mono, 3-30 seconds)       │  │
│  │  Bucket: dmf-listening-audio (public read)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tables Overview

```sql
-- Main exercise metadata table
CREATE TABLE listening_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL,
  translation TEXT,
  duration_seconds INT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('dictation', 'multiple_choice', 'audio_image', 'fill_blank')),
  exercise_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking (SRS data)
CREATE TABLE user_listening_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES listening_exercises(id) ON DELETE CASCADE,
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  difficulty_rating INT DEFAULT 5 CHECK (difficulty_rating BETWEEN 1 AND 10),
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, exercise_id)
);

-- Detailed attempt logs (analytics)
CREATE TABLE listening_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES listening_exercises(id) ON DELETE CASCADE,
  user_answer JSONB NOT NULL,
  correct BOOLEAN NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  accuracy_score DECIMAL(5,2) CHECK (accuracy_score BETWEEN 0 AND 100),
  quality_rating INT CHECK (quality_rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_exercises_difficulty ON listening_exercises(difficulty);
CREATE INDEX idx_exercises_type ON listening_exercises(exercise_type);
CREATE INDEX idx_user_progress_user ON user_listening_progress(user_id);
CREATE INDEX idx_user_progress_next_review ON user_listening_progress(next_review_at);
CREATE INDEX idx_user_progress_composite ON user_listening_progress(user_id, exercise_id);
CREATE INDEX idx_attempts_user ON listening_attempts(user_id);
CREATE INDEX idx_attempts_exercise ON listening_attempts(exercise_id);
CREATE INDEX idx_attempts_created ON listening_attempts(created_at DESC);
```

### Exercise Data Schema (JSONB)

#### Multiple Choice
```typescript
{
  question: string;        // "What does the speaker say?"
  options: string[];       // ["How are you?", "Where are you?", ...]
  correct_index: number;   // 0
}
```

#### Audio-Image Matching
```typescript
{
  images: Array<{
    id: string;            // "img-001"
    url: string;           // "https://..."
    alt: string;           // "A person running"
    is_correct: boolean;   // true
  }>;
}
```

#### Fill-in-the-Blank
```typescript
{
  blanks: Array<{
    id: string;            // "blank-1"
    position: number;      // 0 (index in transcript)
    options: string[];     // ["how", "who", "what"]
    correct_answer: string; // "how"
  }>;
}
```

---

## 🔌 API Endpoints

### 1. GET /api/listening/exercises

**Purpose:** Fetch exercises by difficulty/type

**Query Parameters:**
```typescript
{
  difficulty?: number;     // 1-10 (optional)
  type?: string;          // dictation | multiple_choice | audio_image | fill_blank
  limit?: number;         // Max results (default: 10, max: 50)
}
```

**Response (200):**
```typescript
{
  exercises: Array<{
    id: string;
    title: string;
    difficulty: number;
    audio_url: string;
    duration_seconds: number;
    exercise_type: string;
    exercise_data: object | null;
    // NO transcript or answers (prevent cheating)
  }>;
  total: number;
}
```

**Error Responses:**
- `400`: Invalid query parameters
- `500`: Internal server error

**Example:**
```bash
GET /api/listening/exercises?difficulty=3&limit=5

# Response
{
  "exercises": [
    {
      "id": "uuid-1",
      "title": "Basic Greeting (A2)",
      "difficulty": 3,
      "audio_url": "https://pub-XXX.r2.dev/a2-greeting-01.mp3",
      "duration_seconds": 5,
      "exercise_type": "dictation",
      "exercise_data": null
    }
  ],
  "total": 5
}
```

---

### 2. POST /api/listening/submit

**Purpose:** Submit answer and get feedback

**Request Body:**
```typescript
{
  exercise_id: string;           // UUID
  user_answer: object;           // Type-specific
  time_spent_seconds: number;    // 0-600
}
```

**User Answer Formats:**
```typescript
// Dictation
{ text: string }

// Multiple Choice
{ selected_index: number }

// Audio-Image
{ selected_image_id: string }

// Fill-in-the-Blank
{ answers: Record<string, string> } // { "blank-1": "how", "blank-2": "are" }
```

**Response (200):**
```typescript
{
  correct: boolean;
  accuracy_score: number;      // 0-100
  feedback: string;            // "Perfect!" or "Not quite..."
  xp_earned: number;           // 0-10
  expected_answer?: object;    // Only if incorrect
  next_review_at: string;      // ISO date (SRS)
  quality_rating: number;      // 0-5 (SM-2)
}
```

**Error Responses:**
- `400`: Invalid request body
- `401`: Unauthorized (no x-user-id header)
- `404`: Exercise not found
- `500`: Internal server error

**Example:**
```bash
POST /api/listening/submit
Headers: { "x-user-id": "user-123" }
Body: {
  "exercise_id": "uuid-1",
  "user_answer": { "text": "Hello, how are you?" },
  "time_spent_seconds": 12
}

# Response (Correct)
{
  "correct": true,
  "accuracy_score": 100,
  "feedback": "Perfect! You got it right on the first try!",
  "xp_earned": 10,
  "next_review_at": "2026-02-07T10:00:00Z",
  "quality_rating": 5
}

# Response (Incorrect)
{
  "correct": false,
  "accuracy_score": 0,
  "feedback": "Not quite. Try listening again.",
  "xp_earned": 0,
  "expected_answer": { "text": "Hello, how are you?" },
  "next_review_at": "2026-02-06T12:00:00Z",
  "quality_rating": 0
}
```

---

### 3. GET /api/listening/stats

**Purpose:** Get user listening statistics

**Headers:**
- `x-user-id`: User UUID (required)

**Response (200):**
```typescript
{
  total_exercises_completed: number;
  total_listening_time_seconds: number;
  average_accuracy: number;           // 0-100
  current_streak: number;             // Days
  longest_streak: number;             // Days
  exercises_by_difficulty: Array<{
    difficulty: number;
    count: number;
  }>;
  weekly_stats: {
    exercises: number;
    time_seconds: number;
    accuracy: number;
  };
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Example:**
```bash
GET /api/listening/stats
Headers: { "x-user-id": "user-123" }

# Response
{
  "total_exercises_completed": 42,
  "total_listening_time_seconds": 1800,
  "average_accuracy": 87.5,
  "current_streak": 7,
  "longest_streak": 12,
  "exercises_by_difficulty": [
    { "difficulty": 1, "count": 10 },
    { "difficulty": 2, "count": 8 },
    { "difficulty": 3, "count": 12 }
  ],
  "weekly_stats": {
    "exercises": 15,
    "time_seconds": 420,
    "accuracy": 89.2
  }
}
```

---

### 4. GET /api/listening/metadata/:exerciseId

**Purpose:** Get exercise metadata (no answers)

**Response (200):**
```typescript
{
  id: string;
  title: string;
  difficulty: number;
  duration_seconds: number;
  exercise_type: string;
}
```

**Error Responses:**
- `404`: Exercise not found
- `500`: Internal server error

---

## 🎨 Component Architecture

### Component Tree

```
ListeningPage
├── SessionProgress
├── ErrorBoundary
│   └── ExerciseContainer
│       ├── AudioPlayer
│       └── [Exercise Type]
│           ├── DictationExercise
│           ├── MultipleChoiceExercise
│           ├── AudioImageMatchingExercise
│           └── FillInTheBlankExercise
└── FeedbackCard (conditional)
└── OverallProgress (dashboard)
```

### Component Specifications

#### 1. AudioPlayer

**Props:**
```typescript
interface AudioPlayerProps {
  audioUrl: string;
  onPlayComplete?: () => void;
}
```

**State:**
- `isPlaying`: boolean
- `currentTime`: number
- `duration`: number
- `playbackRate`: 0.75 | 1 | 1.25
- `isLoading`: boolean

**Key Features:**
- Howler.js integration
- Play/Pause/Replay controls
- Progress bar (visual + time display)
- Speed controls (3 buttons: 0.75x, 1x, 1.25x)
- Keyboard shortcuts (Space, R, 1-3)

**Dependencies:**
- `howler` (v2.2+)
- `lucide-react` (icons)

---

#### 2. DictationExercise

**Props:**
```typescript
interface DictationExerciseProps {
  exerciseId: string;
  audioUrl: string;
  onSubmit: (answer: string) => void;
}
```

**Features:**
- Text input (autofocus)
- Character count
- Submit button (disabled if empty)
- Enter key to submit

---

#### 3. MultipleChoiceExercise

**Props:**
```typescript
interface MultipleChoiceExerciseProps {
  exerciseId: string;
  audioUrl: string;
  question: string;
  options: string[];
  onSubmit: (selectedIndex: number) => void;
}
```

**Features:**
- 4 option buttons (A, B, C, D)
- Selected state (visual highlight)
- Keyboard shortcuts (1-4 to select)

---

#### 4. AudioImageMatchingExercise

**Props:**
```typescript
interface AudioImageMatchingExerciseProps {
  exerciseId: string;
  audioUrl: string;
  images: Array<{ id: string; url: string; alt: string }>;
  onSubmit: (selectedImageId: string) => void;
}
```

**Features:**
- Grid layout (2 columns mobile, 3 desktop)
- Image selection (border highlight)
- Next.js Image component (optimization)

---

#### 5. FillInTheBlankExercise

**Props:**
```typescript
interface FillInTheBlankExerciseProps {
  exerciseId: string;
  audioUrl: string;
  transcript: string;          // "Hello, _____ are you?"
  blanks: Array<{
    id: string;
    options: string[];
    correctAnswer: string;
  }>;
  onSubmit: (answers: Record<string, string>) => void;
}
```

**Features:**
- Inline dropdowns in transcript
- Multiple blanks support
- Submit disabled until all filled

---

#### 6. FeedbackCard

**Props:**
```typescript
interface FeedbackCardProps {
  correct: boolean;
  accuracyScore: number;
  feedback: string;
  xpEarned: number;
  expectedAnswer?: string;
  userAnswer?: string;
  onContinue: () => void;
}
```

**States:**
- **Perfect (100%):** Green, checkmark, celebration
- **Incorrect:** Red, X, show comparison
- **Partial credit:** Yellow, star, show accuracy

**Animation:**
- Framer Motion scale + opacity entrance
- XP earned number animation

---

#### 7. SessionProgress

**Props:**
```typescript
interface SessionProgressProps {
  current: number;
  total: number;
}
```

**Visual:**
- Progress bar (animated width transition)
- Text: "8 / 15 exercises"

---

#### 8. OverallProgress

**Props:**
```typescript
interface OverallProgressProps {
  totalExercises: number;
  averageAccuracy: number;
  listeningTimeSeconds: number;
  currentStreak: number;
}
```

**Layout:**
- 4-card grid (responsive: 2x2 mobile, 1x4 desktop)
- Icons: Target, TrendingUp, Clock, Flame

---

## 📁 File Structure

```
dmf-elearning-platform/
├── pages/
│   ├── api/
│   │   └── listening/
│   │       ├── exercises.ts          # GET /exercises
│   │       ├── submit.ts             # POST /submit
│   │       ├── stats.ts              # GET /stats
│   │       └── metadata/
│   │           └── [exerciseId].ts   # GET /metadata/:id
│   └── listening/
│       ├── index.tsx                 # Main listening page
│       └── practice.tsx              # Practice session page
│
├── components/
│   └── listening/
│       ├── AudioPlayer.tsx
│       ├── FeedbackCard.tsx
│       ├── SessionProgress.tsx
│       ├── OverallProgress.tsx
│       └── exercises/
│           ├── DictationExercise.tsx
│           ├── MultipleChoiceExercise.tsx
│           ├── AudioImageMatchingExercise.tsx
│           └── FillInTheBlankExercise.tsx
│
├── lib/
│   ├── r2-client.ts                  # Cloudflare R2 SDK setup
│   ├── r2-utils.ts                   # Audio URL helpers
│   ├── listening-utils.ts            # Answer checking logic
│   ├── srs/
│   │   ├── listening-srs.ts          # SRS algorithm
│   │   └── difficulty-adjustment.ts  # Adaptive difficulty
│   ├── analytics/
│   │   └── listening-analytics.ts    # Stats aggregation
│   └── streak/
│       └── listening-streak.ts       # Streak tracking
│
├── prisma/
│   ├── schema.prisma                 # Updated with listening tables
│   └── migrations/
│       └── XXX_add_listening_tables/ # Migration files
│
├── scripts/
│   ├── seed-listening.mjs            # Seed 70 exercises
│   ├── backup-listening-data.sh      # Database backup
│   └── restore-listening-data.sh     # Database restore
│
├── data/
│   └── listening-seed.json           # 70 exercise definitions
│
└── tests/
    ├── api/
    │   └── listening.test.ts         # API endpoint tests
    ├── srs/
    │   └── listening-srs.test.ts     # SRS algorithm tests
    └── analytics/
        └── listening-analytics.test.ts # Analytics tests
```

---

## 📦 Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "howler": "^2.2.4",
    "@aws-sdk/client-s3": "^3.474.0",
    "@aws-sdk/s3-request-presigner": "^3.474.0",
    "fuse.js": "^7.0.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.11"
  }
}
```

### Existing Dependencies (Reused)
- `@prisma/client` (database ORM)
- `@tanstack/react-query` (v5, server state)
- `zustand` (v4, UI state)
- `zod` (validation)
- `framer-motion` (animations)
- `lucide-react` (icons)
- `next` (framework)
- `react` (v18+)
- `typescript` (v5+)

---

## 🔐 Environment Variables

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=dmf-listening-audio
R2_PUBLIC_URL=https://pub-XXXXX.r2.dev

# Supabase (existing)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Next.js (existing)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🧮 SRS Algorithm Specification

### Quality Rating Calculation

```typescript
function calculateQualityRating(
  correct: boolean,
  accuracyScore: number,
  timeSpentSeconds: number,
  expectedDuration: number,
  totalAttempts: number
): number {
  // Quality: 0-5 (SM-2 standard)
  
  if (!correct) return 0;  // Fail
  
  if (accuracyScore === 100 && totalAttempts === 1) return 5;  // Perfect
  if (accuracyScore >= 90 && totalAttempts === 1) return 4;    // Excellent
  if (accuracyScore >= 80) return 3;                           // Good
  if (accuracyScore >= 70) return 2;                           // Passing
  
  return 1;  // Barely passing
}
```

### Interval Calculation (SM-2 Based)

```typescript
function calculateNextReview(
  currentProgress: UserListeningProgress,
  qualityRating: number
): { nextReviewAt: Date; interval: number; easeFactor: number } {
  let { ease_factor, interval_days } = currentProgress;
  
  if (qualityRating >= 3) {
    // Correct: increase interval
    if (interval_days === 0) {
      interval_days = 1;           // First review: 1 day
    } else if (interval_days === 1) {
      interval_days = 6;           // Second review: 6 days
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    
    // Adjust ease factor
    ease_factor += (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
  } else {
    // Incorrect: reset interval
    interval_days = 1;
  }
  
  // Clamp ease factor
  ease_factor = Math.max(1.3, ease_factor);
  
  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval_days);
  
  return { nextReviewAt, interval: interval_days, easeFactor: ease_factor };
}
```

---

## ✅ Performance Targets

### API Performance
- **GET /api/listening/exercises:** < 100ms (p95)
- **POST /api/listening/submit:** < 50ms (p95)
- **GET /api/listening/stats:** < 200ms (p95)

### Frontend Performance
- **Time to Interactive:** < 3s (3G network)
- **Audio load time:** < 2s (4G network)
- **Animation frame rate:** 60fps (no dropped frames)
- **Lighthouse score:** > 85 (Performance, Accessibility, Best Practices)

### Database Performance
- **Exercise query:** < 10ms (with indexes)
- **Progress update:** < 5ms (upsert operation)
- **Analytics aggregation:** < 20ms (complex queries)

---

## 🔒 Security Considerations

### Authentication
- All API endpoints require `x-user-id` header
- Validate user exists in database
- Prevent cross-user data access

### Input Validation
- Zod schema validation on all endpoints
- Sanitize JSONB inputs (exercise_data, user_answer)
- Prevent SQL injection (Prisma parameterized queries)
- XSS prevention (no raw HTML rendering)

### CORS Configuration
- R2 bucket: Allow GET from dmf-elearning.com + localhost:3000
- API routes: CORS headers configured for frontend domain

### Data Privacy
- Never expose transcript/answers in exercise fetch
- Only show correct answers after submission
- User progress isolated by user_id

---

## 🧪 Testing Strategy

### Unit Tests (80% coverage target)
- SRS algorithm (20+ test cases)
- Answer checking logic (dictation fuzzy matching, multiple choice)
- Analytics functions (aggregation correctness)

### Integration Tests
- API endpoint request/response validation
- Database operations (CRUD + SRS updates)
- Streak tracking integration

### E2E Tests (Manual for Phase 1)
- Complete exercise flow (all 4 types)
- Audio playback (Play, Pause, Replay, Speed)
- Feedback display (correct, incorrect, partial)
- Progress tracking (session + overall)

### Performance Tests
- Load testing (100 concurrent users)
- Database query optimization (EXPLAIN ANALYZE)
- Audio loading (network throttling)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All migrations run on staging
- [ ] 70 audio files uploaded to R2
- [ ] Seed data populated
- [ ] Environment variables configured
- [ ] API tests passing (100%)
- [ ] Unit tests passing (>80% coverage)

### Deployment Steps
1. Run Prisma migrations: `npx prisma migrate deploy`
2. Seed database: `node scripts/seed-listening.mjs`
3. Deploy Next.js app: `vercel deploy --prod`
4. Smoke test: Verify /api/listening/exercises returns data
5. Monitor: Check error logs for 24 hours

### Post-Deployment
- [ ] Monitor API response times (Vercel Analytics)
- [ ] Check error rates (Sentry)
- [ ] Verify audio files accessible (curl test)
- [ ] User feedback collection (beta testers)

---

## 📊 Monitoring & Observability

### Metrics to Track
- API request count (by endpoint)
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Audio load failures (R2 unavailable)
- Database connection pool usage

### Logging
- All API errors (console.error with context)
- SRS algorithm decisions (quality rating, next review)
- User progress updates (for debugging)

### Alerts
- Error rate > 5% (Slack notification)
- API response time p95 > 500ms (email)
- R2 bucket unavailable (critical alert)

---

## 🔄 Migration Path (Future Phases)

### Phase 2 Additions
- Real-time waveform (WaveSurfer.js)
- Audio speed range slider (0.5x - 2x)
- Transcript display with word highlighting

### Phase 3 Additions
- Speech recognition (Web Speech API)
- Pronunciation scoring
- Interactive transcripts (click words for definitions)

### Phase 4 Additions
- Offline mode (Service Worker + IndexedDB)
- Audio caching (reduce R2 bandwidth)
- Progressive Web App (PWA)

---

## 📚 References

### External Documentation
- Howler.js Docs: https://howlerjs.com/
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- SM-2 Algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- Prisma Docs: https://www.prisma.io/docs
- React Query: https://tanstack.com/query/latest

### Internal Documentation
- Vocabulary Module (reference): `.execution/COMPLETION_REPORT_vocabulary_phase1.md`
- Design System: `components/ui/` (Shadcn UI)
- Authentication: `lib/auth/` (existing patterns)

---

**Document Version:** 1.0  
**Status:** APPROVED ✅  
**Prepared by:** Tech Lead (AI Agent)  
**Review Date:** 2026-02-06  
**Next Review:** End of Week 4 (mid-project check-in)
