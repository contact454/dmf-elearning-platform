# Backend Developer - Reading Module Phase 1

**Role:** API Development, Business Logic, SRS Integration  
**Duration:** Weeks 2-6 (40-48 hours total)  
**Priority:** HIGH (connects DB to Frontend)

---

## 🎯 Your Mission

Build REST API endpoints for reading passages, implement exercise validation logic, integrate SRS algorithm for vocabulary tracking, and ensure performant database queries.

---

## ✅ Task Checklist

### **Week 2-3: Core API Endpoints**

#### **Task 1.1: Setup API route structure**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**File Structure:**
```
app/
├── api/
│   └── reading/
│       ├── passages/
│       │   ├── route.ts            # GET /api/reading/passages (list)
│       │   └── [id]/
│       │       └── route.ts        # GET /api/reading/passages/:id (single)
│       ├── submit/
│       │   └── route.ts            # POST /api/reading/submit (exercise attempt)
│       ├── progress/
│       │   └── route.ts            # GET /api/reading/progress (user stats)
│       └── vocabulary/
│           └── save/
│               └── route.ts        # POST /api/vocabulary/save (from passage)
```

**Setup Prisma Client:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Acceptance Criteria:**
- [x] Folder structure created
- [x] Prisma client initialized
- [x] Test query works (`await prisma.readingPassage.findMany()`)

---

#### **Task 1.2: Implement GET /api/reading/passages**
**Duration:** 4 hours  
**Priority:** P0 (Critical)

**File:** `app/api/reading/passages/route.ts`

**Features:**
- List all passages
- Filter by CEFR level (`?cefr=B1`)
- Filter by topic (`?topic=business`)
- Pagination (`?page=1&limit=10`)
- Sort by difficulty (`?sort=difficulty_asc`)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Your auth implementation

export async function GET(req: NextRequest) {
  try {
    // Authentication (optional: allow public access to A1-B1)
    const session = await auth();
    
    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const cefr = searchParams.get('cefr'); // A1, A2, B1, etc.
    const topic = searchParams.get('topic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'difficulty_asc'; // difficulty_asc, difficulty_desc
    
    // Build where clause
    const where: any = {};
    
    if (cefr) {
      where.cefrLevel = cefr.toUpperCase();
    }
    
    if (topic) {
      where.topic = topic;
    }
    
    // Premium passages require authentication
    if (!session) {
      where.isPremium = false;
    }
    
    // Build orderBy clause
    const orderBy: any = {};
    if (sort === 'difficulty_asc') {
      orderBy.difficultyScore = 'asc';
    } else if (sort === 'difficulty_desc') {
      orderBy.difficultyScore = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    // Query database
    const [passages, total] = await Promise.all([
      prisma.readingPassage.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          cefrLevel: true,
          topic: true,
          wordCount: true,
          estimatedReadingTimeMinutes: true,
          difficultyScore: true,
          isPremium: true,
          createdAt: true,
        },
      }),
      prisma.readingPassage.count({ where }),
    ]);
    
    // Return response
    return NextResponse.json({
      passages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching passages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passages' },
      { status: 500 }
    );
  }
}
```

**Test Cases:**
1. `GET /api/reading/passages` → Returns all passages
2. `GET /api/reading/passages?cefr=B1` → Returns only B1 passages
3. `GET /api/reading/passages?topic=business` → Returns business passages
4. `GET /api/reading/passages?page=2&limit=5` → Returns 2nd page (5 items)
5. `GET /api/reading/passages?sort=difficulty_desc` → Returns hardest first

**Acceptance Criteria:**
- [x] All filters work correctly
- [x] Pagination returns correct results
- [x] Sort orders work
- [x] Premium passages hidden for unauthenticated users
- [x] Response time <500ms (p95)

---

#### **Task 1.3: Implement GET /api/reading/passages/[id]**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**File:** `app/api/reading/passages/[id]/route.ts`

**Features:**
- Fetch single passage by ID
- Include all exercises for the passage
- Include user progress (if authenticated)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    // Fetch passage with exercises
    const passage = await prisma.readingPassage.findUnique({
      where: { id: params.id },
      include: {
        exercises: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    
    if (!passage) {
      return NextResponse.json(
        { error: 'Passage not found' },
        { status: 404 }
      );
    }
    
    // Check premium access
    if (passage.isPremium && !session) {
      return NextResponse.json(
        { error: 'Premium content requires authentication' },
        { status: 403 }
      );
    }
    
    // Fetch user progress (if authenticated)
    let userProgress = null;
    if (userId) {
      userProgress = await prisma.userReadingProgress.findUnique({
        where: {
          userId_passageId: {
            userId,
            passageId: params.id,
          },
        },
      });
    }
    
    // Return response
    return NextResponse.json({
      passage: {
        id: passage.id,
        title: passage.title,
        content: passage.content,
        cefrLevel: passage.cefrLevel,
        topic: passage.topic,
        wordCount: passage.wordCount,
        estimatedReadingTimeMinutes: passage.estimatedReadingTimeMinutes,
        difficultyScore: passage.difficultyScore,
        isPremium: passage.isPremium,
        exercises: passage.exercises,
      },
      userProgress,
    });
  } catch (error) {
    console.error('Error fetching passage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passage' },
      { status: 500 }
    );
  }
}
```

**Test Cases:**
1. `GET /api/reading/passages/valid-id` → Returns passage + exercises
2. `GET /api/reading/passages/invalid-id` → Returns 404
3. Authenticated request → Includes user progress
4. Unauthenticated request for premium passage → Returns 403

**Acceptance Criteria:**
- [x] Valid ID returns passage with exercises
- [x] Invalid ID returns 404
- [x] Premium passages require auth
- [x] User progress included when authenticated
- [x] Response time <300ms (p95)

---

### **Week 3-4: Exercise Validation Logic**

#### **Task 2.1: Implement exercise answer validation**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**File:** `lib/reading/validate-answer.ts`

**Functions:**

**1. Multiple Choice Validation:**
```typescript
interface MultipleChoiceData {
  options: string[];
  correct_index: number;
}

interface MultipleChoiceAnswer {
  selected_index: number;
}

export function validateMultipleChoice(
  exerciseData: MultipleChoiceData,
  userAnswer: MultipleChoiceAnswer
): { isCorrect: boolean; accuracyScore: number } {
  const isCorrect = userAnswer.selected_index === exerciseData.correct_index;
  
  return {
    isCorrect,
    accuracyScore: isCorrect ? 100 : 0,
  };
}
```

**2. True/False Validation:**
```typescript
interface TrueFalseData {
  statement: string;
  is_true: boolean;
}

interface TrueFalseAnswer {
  answer: boolean;
}

export function validateTrueFalse(
  exerciseData: TrueFalseData,
  userAnswer: TrueFalseAnswer
): { isCorrect: boolean; accuracyScore: number } {
  const isCorrect = userAnswer.answer === exerciseData.is_true;
  
  return {
    isCorrect,
    accuracyScore: isCorrect ? 100 : 0,
  };
}
```

**3. Fill-in-the-Blank Validation (Fuzzy Matching):**
```typescript
import Fuse from 'fuse.js';

interface FillBlankData {
  sentence: string;
  correct_answer: string;
  alternatives?: string[];
  word_bank?: string[];
}

interface FillBlankAnswer {
  answer: string;
}

export function validateFillBlank(
  exerciseData: FillBlankData,
  userAnswer: FillBlankAnswer
): { isCorrect: boolean; accuracyScore: number } {
  const userAnswerLower = userAnswer.answer.trim().toLowerCase();
  const correctAnswerLower = exerciseData.correct_answer.toLowerCase();
  
  // Exact match (case-insensitive)
  if (userAnswerLower === correctAnswerLower) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Check alternatives
  const alternatives = exerciseData.alternatives || [];
  if (alternatives.some(alt => alt.toLowerCase() === userAnswerLower)) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Fuzzy match (Levenshtein distance)
  const similarity = stringSimilarity(userAnswerLower, correctAnswerLower);
  
  if (similarity >= 0.85) {
    return { isCorrect: true, accuracyScore: Math.round(similarity * 100) };
  }
  
  return { isCorrect: false, accuracyScore: Math.round(similarity * 100) };
}

// Levenshtein distance (string similarity)
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
```

**4. Sequencing Validation:**
```typescript
interface SequencingData {
  sentences: Array<{ id: string; text: string }>;
  correct_order: string[];
}

interface SequencingAnswer {
  order: string[];
}

export function validateSequencing(
  exerciseData: SequencingData,
  userAnswer: SequencingAnswer
): { isCorrect: boolean; accuracyScore: number } {
  const correctOrder = exerciseData.correct_order;
  const userOrder = userAnswer.order;
  
  // Exact match
  const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
  
  if (isCorrect) {
    return { isCorrect: true, accuracyScore: 100 };
  }
  
  // Partial credit: count correct positions
  let correctPositions = 0;
  for (let i = 0; i < correctOrder.length; i++) {
    if (correctOrder[i] === userOrder[i]) {
      correctPositions++;
    }
  }
  
  const accuracyScore = Math.round((correctPositions / correctOrder.length) * 100);
  
  return {
    isCorrect: false,
    accuracyScore,
  };
}
```

**Master Validation Function:**
```typescript
export function validateExerciseAnswer(
  exerciseType: string,
  exerciseData: any,
  userAnswer: any
): { isCorrect: boolean; accuracyScore: number } {
  switch (exerciseType) {
    case 'multiple_choice':
      return validateMultipleChoice(exerciseData, userAnswer);
    case 'true_false':
      return validateTrueFalse(exerciseData, userAnswer);
    case 'fill_blank':
      return validateFillBlank(exerciseData, userAnswer);
    case 'sequencing':
      return validateSequencing(exerciseData, userAnswer);
    default:
      throw new Error(`Unknown exercise type: ${exerciseType}`);
  }
}
```

**Test Cases:**
1. Multiple choice: correct answer → 100% accuracy
2. Multiple choice: wrong answer → 0% accuracy
3. Fill-in-blank: exact match → 100%
4. Fill-in-blank: 90% similar → 90% accuracy
5. Fill-in-blank: 80% similar → 80% accuracy
6. Sequencing: perfect order → 100%
7. Sequencing: 2/4 correct → 50%

**Acceptance Criteria:**
- [x] All 4 validation functions work
- [x] Fuzzy matching threshold at 85%
- [x] Partial credit awarded for sequencing
- [x] All test cases pass

---

#### **Task 2.2: Implement POST /api/reading/submit**
**Duration:** 5 hours  
**Priority:** P0 (Critical)

**File:** `app/api/reading/submit/route.ts`

**Features:**
- Accept exercise attempt submission
- Validate answer
- Save attempt to database
- Update user progress
- Calculate session accuracy

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateExerciseAnswer } from '@/lib/reading/validate-answer';

interface SubmitRequest {
  passageId: string;
  exerciseId: string;
  userAnswer: any;
  timeSpentSeconds: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body: SubmitRequest = await req.json();
    
    // Fetch exercise
    const exercise = await prisma.readingExercise.findUnique({
      where: { id: body.exerciseId },
    });
    
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Validate answer
    const validation = validateExerciseAnswer(
      exercise.exerciseType,
      exercise.exerciseData,
      body.userAnswer
    );
    
    // Save attempt
    const attempt = await prisma.readingAttempt.create({
      data: {
        userId,
        passageId: body.passageId,
        exerciseId: body.exerciseId,
        userAnswer: body.userAnswer,
        correctAnswer: exercise.exerciseData,
        isCorrect: validation.isCorrect,
        accuracyScore: validation.accuracyScore,
        timeSpentSeconds: body.timeSpentSeconds,
      },
    });
    
    // Update user progress
    await updateUserProgress(userId, body.passageId, body.exerciseId, validation);
    
    // Return response
    return NextResponse.json({
      attemptId: attempt.id,
      isCorrect: validation.isCorrect,
      accuracyScore: validation.accuracyScore,
      correctAnswer: exercise.exerciseData,
      explanation: exercise.explanation,
    });
  } catch (error) {
    console.error('Error submitting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to submit exercise' },
      { status: 500 }
    );
  }
}

async function updateUserProgress(
  userId: string,
  passageId: string,
  exerciseId: string,
  validation: { isCorrect: boolean; accuracyScore: number }
) {
  // Fetch or create progress record
  let progress = await prisma.userReadingProgress.findUnique({
    where: {
      userId_passageId: { userId, passageId },
    },
  });
  
  if (!progress) {
    progress = await prisma.userReadingProgress.create({
      data: {
        userId,
        passageId,
        totalExercises: 0,
        correctExercises: 0,
        accuracyPercentage: 0,
        timeSpentSeconds: 0,
      },
    });
  }
  
  // Update stats
  const totalExercises = progress.totalExercises + 1;
  const correctExercises = progress.correctExercises + (validation.isCorrect ? 1 : 0);
  const accuracyPercentage = (correctExercises / totalExercises) * 100;
  
  await prisma.userReadingProgress.update({
    where: { id: progress.id },
    data: {
      totalExercises,
      correctExercises,
      accuracyPercentage,
    },
  });
}
```

**Test Cases:**
1. Valid submission → Returns correct validation
2. Unauthenticated request → Returns 401
3. Invalid exercise ID → Returns 404
4. Multiple submissions → Accuracy updates correctly

**Acceptance Criteria:**
- [x] Submissions save to database
- [x] User progress updates correctly
- [x] Validation logic works for all types
- [x] Response time <400ms (p95)

---

### **Week 4-5: Progress Tracking & SRS**

#### **Task 3.1: Implement GET /api/reading/progress**
**Duration:** 4 hours  
**Priority:** P1 (Important)

**File:** `app/api/reading/progress/route.ts`

**Features:**
- Total passages completed
- Average accuracy by CEFR level
- Total time spent reading
- Recent activity (last 7 days)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Total passages completed
    const passagesCompleted = await prisma.userReadingProgress.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });
    
    // Average accuracy by CEFR level
    const progressByLevel = await prisma.userReadingProgress.findMany({
      where: { userId },
      include: {
        passage: {
          select: { cefrLevel: true },
        },
      },
    });
    
    const levelStats = progressByLevel.reduce((acc, p) => {
      const level = p.passage.cefrLevel;
      if (!acc[level]) {
        acc[level] = { total: 0, sumAccuracy: 0 };
      }
      acc[level].total++;
      acc[level].sumAccuracy += Number(p.accuracyPercentage);
      return acc;
    }, {} as Record<string, { total: number; sumAccuracy: number }>);
    
    const accuracyByLevel = Object.entries(levelStats).map(([level, stats]) => ({
      level,
      averageAccuracy: stats.sumAccuracy / stats.total,
      attempts: stats.total,
    }));
    
    // Total time spent
    const totalTimeSpent = await prisma.userReadingProgress.aggregate({
      where: { userId },
      _sum: { timeSpentSeconds: true },
    });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttempts = await prisma.readingAttempt.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });
    
    // Return response
    return NextResponse.json({
      passagesCompleted,
      accuracyByLevel,
      totalTimeSpentMinutes: Math.round((totalTimeSpent._sum.timeSpentSeconds || 0) / 60),
      recentAttempts,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [x] Returns accurate stats
- [x] Handles users with no progress
- [x] Response time <600ms (p95)

---

#### **Task 3.2: Implement SRS vocabulary save**
**Duration:** 5 hours  
**Priority:** P1 (Important)

**File:** `app/api/vocabulary/save/route.ts`

**Features:**
- Save word from passage
- Fetch definition from dictionary API (or use pre-loaded data)
- Calculate next_review_at (SuperMemo-2)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateNextReview } from '@/lib/srs/supermemo2';

interface SaveVocabularyRequest {
  word: string;
  passageId: string;
  context?: string; // Sentence where word appears
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body: SaveVocabularyRequest = await req.json();
    
    // Check if word already exists
    const existingWord = await prisma.userVocabulary.findFirst({
      where: {
        userId,
        word: body.word.toLowerCase(),
      },
    });
    
    if (existingWord) {
      return NextResponse.json({
        message: 'Word already in vocabulary',
        vocabulary: existingWord,
      });
    }
    
    // Fetch definition (placeholder: replace with real dictionary API)
    const definition = await fetchDefinition(body.word);
    
    // Calculate next review (initial: 1 day)
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);
    
    // Save to database
    const vocabulary = await prisma.userVocabulary.create({
      data: {
        userId,
        word: body.word.toLowerCase(),
        definition: definition.definition,
        translationVi: definition.translation_vi,
        pronunciation: definition.pronunciation,
        exampleSentence: body.context,
        status: 'new',
        nextReviewAt,
        easeFactor: 2.5,
        intervalDays: 1,
      },
    });
    
    return NextResponse.json({
      message: 'Word saved successfully',
      vocabulary,
    });
  } catch (error) {
    console.error('Error saving vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to save vocabulary' },
      { status: 500 }
    );
  }
}

async function fetchDefinition(word: string) {
  // TODO: Integrate with Free Dictionary API or pre-loaded dictionary
  // Placeholder implementation
  return {
    definition: `Definition of "${word}"`,
    translation_vi: `Nghĩa tiếng Việt của "${word}"`,
    pronunciation: '/wɜːrd/',
  };
}
```

**Acceptance Criteria:**
- [x] Saves word to user_vocabulary
- [x] Prevents duplicates
- [x] Calculates next_review_at
- [x] Returns confirmation

---

### **Week 5-6: Performance Optimization**

#### **Task 4.1: Add database query optimization**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Tasks:**
1. Add indexes (if missing):
   ```sql
   CREATE INDEX idx_reading_attempts_user_created ON reading_attempts(user_id, created_at);
   CREATE INDEX idx_user_reading_progress_user_accuracy ON user_reading_progress(user_id, accuracy_percentage);
   ```

2. Optimize slow queries (use `EXPLAIN ANALYZE`):
   ```sql
   EXPLAIN ANALYZE
   SELECT p.*, COUNT(e.id) as exercise_count
   FROM reading_passages p
   LEFT JOIN reading_exercises e ON p.id = e.passage_id
   GROUP BY p.id;
   ```

3. Add caching for frequently accessed data:
   ```typescript
   import { unstable_cache } from 'next/cache';
   
   export const getCachedPassages = unstable_cache(
     async () => {
       return await prisma.readingPassage.findMany({
         where: { isPremium: false },
         orderBy: { createdAt: 'desc' },
         take: 20,
       });
     },
     ['public-passages'],
     { revalidate: 3600 } // 1 hour
   );
   ```

**Acceptance Criteria:**
- [x] Query times <500ms (p95)
- [x] Indexes improve performance (verify with EXPLAIN)
- [x] Caching reduces database load

---

#### **Task 4.2: Add rate limiting**
**Duration:** 2 hours  
**Priority:** P2 (Nice to have)

**File:** `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});
```

**Usage in API route:**
```typescript
import { ratelimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... rest of handler
}
```

**Acceptance Criteria:**
- [x] Rate limiting works
- [x] Returns 429 when limit exceeded
- [x] Doesn't block legitimate users

---

### **Week 6: Testing & Documentation**

#### **Task 5.1: Write API tests**
**Duration:** 4 hours  
**Priority:** P1 (Important)

**File:** `__tests__/api/reading.test.ts`

**Test Cases:**
1. GET /api/reading/passages
   - Returns passages list
   - Filters by CEFR work
   - Pagination works
2. GET /api/reading/passages/[id]
   - Returns passage with exercises
   - Returns 404 for invalid ID
3. POST /api/reading/submit
   - Validates answers correctly
   - Updates progress
   - Returns 401 without auth

**Acceptance Criteria:**
- [x] All test cases pass
- [x] Coverage >80%

---

#### **Task 5.2: Write API documentation**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**File:** `.execution/tasks-reading/API_DOCS_reading.md`

**Contents:**
- Endpoint descriptions
- Request/response examples
- Error codes
- Authentication requirements

**Acceptance Criteria:**
- [x] All endpoints documented
- [x] Examples provided
- [x] Frontend dev can integrate easily

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Core API Endpoints | 12h |
| Validation Logic | 11h |
| Progress Tracking | 9h |
| Performance Optimization | 5h |
| Testing & Documentation | 6h |
| **Total** | **43h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All API endpoints functional
- [ ] Exercise validation works for all 4 types
- [ ] Progress tracking updates correctly
- [ ] SRS vocabulary save works
- [ ] API tests pass (>80% coverage)
- [ ] Documentation complete
- [ ] Response times meet targets (<500ms p95)

---

## 📞 Coordination Points

**With DB Specialist:**
- Confirm schema matches API needs
- Optimize slow queries together

**With Frontend Developer:**
- Share API endpoint docs early
- Discuss error handling approach

**With Integration Specialist:**
- Help debug API integration issues
- Review API design patterns

---

## 🚀 Next Steps After Completion

1. Notify Frontend Dev: API ready for integration
2. Deploy API to staging (Vercel)
3. Monitor performance (Sentry, Upstash)
4. Iterate based on feedback

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ Ready for Execution
