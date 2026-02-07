# Reading Module Phase 1 - Quick Start Guide

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ Ready for Development

---

## 🎯 What is This?

The **Reading Module** is a comprehensive reading comprehension system for Vietnamese English learners. It features:

- 70 reading passages across CEFR levels A1-C2
- 4 exercise types: Multiple Choice, True/False, Fill-in-the-Blank, Sequencing
- Interactive vocabulary system (click word → definition → save to SRS)
- Progress tracking and analytics
- Mobile-first responsive design

---

## 👥 Team Roles

### Database Specialist
**Effort:** 24-32 hours (Weeks 1-4)

**Responsibilities:**
- Design 4 database tables (passages, exercises, progress, attempts)
- Create seed data (70 passages + 350 exercises)
- Implement indexes for performance
- Write migration scripts

**Deliverables:**
- `.execution/tasks-reading/db-specialist-reading.md` ✅

---

### Backend Developer
**Effort:** 40-48 hours (Weeks 2-6)

**Responsibilities:**
- Build REST API endpoints (list passages, get passage, submit exercise, track progress)
- Implement exercise validation logic (fuzzy matching for fill-in-the-blank)
- Integrate SRS algorithm (SuperMemo-2)
- Performance optimization (caching, indexes)

**Deliverables:**
- `.execution/tasks-reading/backend-reading.md` ✅

---

### Frontend Developer
**Effort:** 50-60 hours (Weeks 3-8)

**Responsibilities:**
- Build passage display UI (typography, reading mode, font controls)
- Create interactive vocabulary system (clickable words, popup definitions)
- Implement 4 exercise type components
- Build feedback system (success/error states)
- Create progress dashboard

**Deliverables:**
- `.execution/tasks-reading/frontend-reading.md` ✅

---

### Integration Specialist
**Effort:** 30-36 hours (Weeks 5-10)

**Responsibilities:**
- Connect frontend to backend APIs (React Query)
- State management (Zustand)
- E2E testing (Playwright)
- Deployment (Vercel + Supabase)

**Deliverables:**
- Integration hooks (`useReadingPassages`, `useSubmitExercise`)
- E2E test suite (30+ test cases)
- CI/CD pipeline (GitHub Actions)

---

## 📅 Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1-2 | Foundation Setup | Database schema, API structure, base components |
| 3-4 | Content + Core UI | 70 passages seeded, passage display working |
| 5-6 | Exercise Types | All 4 exercise types functional |
| 7-8 | Progress + SRS | Analytics dashboard, vocabulary save working |
| 9-10 | Polish + Launch | Accessibility, testing, production deployment |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Supabase account)
- Git

### Setup (Local Development)

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-org/dmf-elearning-platform.git
   cd dmf-elearning-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dmf_reading"
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed database:**
   ```bash
   npx tsx scripts/seed-reading-module.ts
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

7. **Open browser:**
   ```
   http://localhost:3000/reading
   ```

---

## 📂 Project Structure

```
dmf-elearning-platform/
├── app/
│   └── api/
│       └── reading/
│           ├── passages/
│           │   ├── route.ts           # GET /api/reading/passages
│           │   └── [id]/route.ts      # GET /api/reading/passages/:id
│           ├── submit/route.ts        # POST /api/reading/submit
│           ├── progress/route.ts      # GET /api/reading/progress
│           └── vocabulary/
│               └── save/route.ts      # POST /api/vocabulary/save
│
├── components/
│   └── reading/
│       ├── PassageDisplay.tsx         # Main passage view
│       ├── InteractiveText.tsx        # Clickable words
│       ├── VocabularyPopup.tsx        # Definition modal
│       ├── exercises/
│       │   ├── MultipleChoiceExercise.tsx
│       │   ├── TrueFalseExercise.tsx
│       │   ├── FillBlankExercise.tsx
│       │   ├── SequencingExercise.tsx
│       │   └── FeedbackCard.tsx
│       └── ReadingDashboard.tsx       # Progress stats
│
├── lib/
│   ├── prisma.ts                      # Prisma client
│   └── reading/
│       └── validate-answer.ts         # Exercise validation logic
│
├── hooks/
│   └── useVocabulary.ts               # Vocabulary API hooks
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Migration files
│
├── data/
│   ├── reading-passages-seed.json     # 70 passages
│   └── reading-exercises-seed.json    # 350+ exercises
│
├── scripts/
│   └── seed-reading-module.ts         # Seed script
│
└── .execution/
    ├── DEVELOPMENT_PLAN_reading_phase1.md
    └── tasks-reading/
        ├── db-specialist-reading.md
        ├── backend-reading.md
        ├── frontend-reading.md
        └── README_reading_phase1.md  (this file)
```

---

## 🛠️ Key Technologies

**Frontend:**
- React 18 + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn UI (component library)
- React Query (server state)
- Zustand (client state)
- Framer Motion (animations)
- @dnd-kit (drag & drop for sequencing)

**Backend:**
- Supabase (PostgreSQL + Auth)
- Prisma (ORM)
- Node.js serverless functions

**Infrastructure:**
- Vercel (frontend hosting)
- Supabase Cloud (database)
- GitHub Actions (CI/CD)

---

## 📊 Database Schema

### `reading_passages`
Stores 70 reading passages with metadata.

**Columns:**
- `id` (UUID, primary key)
- `title` (VARCHAR, passage title)
- `content` (TEXT, full passage text)
- `cefr_level` (VARCHAR, A1-C2)
- `topic` (VARCHAR, e.g., "business", "culture")
- `word_count` (INT)
- `estimated_reading_time_minutes` (INT)
- `difficulty_score` (DECIMAL, 1.0-10.0)
- `is_premium` (BOOLEAN)

---

### `reading_exercises`
Stores 350+ exercises (4 types).

**Columns:**
- `id` (UUID, primary key)
- `passage_id` (UUID, foreign key)
- `exercise_type` (VARCHAR, "multiple_choice" | "true_false" | "fill_blank" | "sequencing")
- `question` (TEXT)
- `exercise_data` (JSONB, type-specific data)
- `explanation` (TEXT, why answer is correct)
- `difficulty_level` (INT, 1-10)
- `display_order` (INT)

---

### `user_reading_progress`
Tracks user progress per passage (SRS integration).

**Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `passage_id` (UUID, foreign key)
- `completed_at` (TIMESTAMPTZ, NULL if incomplete)
- `total_exercises` (INT)
- `correct_exercises` (INT)
- `accuracy_percentage` (DECIMAL, 0-100)
- `time_spent_seconds` (INT)
- `next_review_at` (TIMESTAMPTZ, SRS scheduling)
- `ease_factor` (DECIMAL, SuperMemo-2)

---

### `reading_attempts`
Logs every exercise attempt (analytics).

**Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `passage_id` (UUID, foreign key)
- `exercise_id` (UUID, foreign key)
- `user_answer` (JSONB, type-specific answer)
- `correct_answer` (JSONB)
- `is_correct` (BOOLEAN)
- `accuracy_score` (DECIMAL, 0-100, for partial credit)
- `time_spent_seconds` (INT)

---

## 🔗 API Endpoints

### GET `/api/reading/passages`
List all passages with filtering and pagination.

**Query Params:**
- `cefr` (optional): Filter by CEFR level (A1, A2, B1, etc.)
- `topic` (optional): Filter by topic
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page
- `sort` (default: "difficulty_asc"): Sort order

**Response:**
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
      "isPremium": false
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

---

### GET `/api/reading/passages/:id`
Fetch single passage with exercises and user progress.

**Response:**
```json
{
  "passage": {
    "id": "uuid",
    "title": "Greetings Around the World",
    "content": "Hello is a common greeting...",
    "cefrLevel": "A1",
    "exercises": [
      {
        "id": "uuid",
        "exerciseType": "multiple_choice",
        "question": "What do people say in Spanish?",
        "exerciseData": {
          "options": ["Hola", "Bonjour", "Konnichiwa", "Hello"],
          "correct_index": 0
        },
        "explanation": "The passage states..."
      }
    ]
  },
  "userProgress": {
    "totalExercises": 5,
    "correctExercises": 4,
    "accuracyPercentage": 80.0
  }
}
```

---

### POST `/api/reading/submit`
Submit exercise attempt and get validation.

**Request Body:**
```json
{
  "passageId": "uuid",
  "exerciseId": "uuid",
  "userAnswer": {
    "selected_index": 0  // Type-specific answer structure
  },
  "timeSpentSeconds": 15
}
```

**Response:**
```json
{
  "attemptId": "uuid",
  "isCorrect": true,
  "accuracyScore": 100,
  "correctAnswer": {
    "options": [...],
    "correct_index": 0
  },
  "explanation": "The passage states that..."
}
```

---

### GET `/api/reading/progress`
Get user's overall reading progress.

**Response:**
```json
{
  "passagesCompleted": 12,
  "accuracyByLevel": [
    { "level": "A1", "averageAccuracy": 92.5, "attempts": 3 },
    { "level": "B1", "averageAccuracy": 78.3, "attempts": 5 }
  ],
  "totalTimeSpentMinutes": 145,
  "recentAttempts": 23
}
```

---

### POST `/api/vocabulary/save`
Save word from passage to vocabulary.

**Request Body:**
```json
{
  "word": "hello",
  "passageId": "uuid",
  "context": "Hello is a common greeting in English."
}
```

**Response:**
```json
{
  "message": "Word saved successfully",
  "vocabulary": {
    "id": "uuid",
    "word": "hello",
    "definition": "A greeting...",
    "translationVi": "Xin chào",
    "nextReviewAt": "2026-02-07T10:00:00Z"
  }
}
```

---

## ✅ Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

**Target:** >80% coverage

---

## 🚀 Deployment

### Staging
```bash
git push origin develop
```
→ Auto-deploys to `staging.dmf-reading.com`

### Production
```bash
git push origin main
```
→ Auto-deploys to `dmf-reading.com`

---

## 📞 Support

**Questions?**
- Tech Lead: [TBD]
- Product Manager: [TBD]
- Slack Channel: `#reading-module`
- Email: dev@dmf-elearning.com

---

## 📚 Additional Documentation

- **Development Plan:** `.execution/DEVELOPMENT_PLAN_reading_phase1.md`
- **DB Specialist Tasks:** `.execution/tasks-reading/db-specialist-reading.md`
- **Backend Tasks:** `.execution/tasks-reading/backend-reading.md`
- **Frontend Tasks:** `.execution/tasks-reading/frontend-reading.md`
- **Research:** `.research/reading-research/READING_ACTION_PLAN.md`

---

## 🎯 Success Criteria

Phase 1 is **COMPLETE** when:

- [x] All 70 passages display correctly
- [x] Interactive vocabulary works (click word → popup → save)
- [x] All 4 exercise types functional
- [x] Progress tracking shows accurate stats
- [x] Mobile responsive (tested on real devices)
- [x] Accessibility compliant (WCAG 2.1 AA)
- [x] Lighthouse score >85 (all categories)
- [x] E2E tests pass (30+ test cases)
- [x] Production deployed successfully

---

**Happy coding! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Prepared by:** PM Team
