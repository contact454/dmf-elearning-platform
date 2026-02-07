# BACKEND DEVELOPER TASKS - Vocabulary Phase 1

**Owner:** Backend Developer Agent  
**Duration:** 26 hours total  
**Priority:** P0  
**Tech Lead:** Tech Lead Agent

---

## ⏳ WAIT FOR DATABASE SPECIALIST

**BLOCKER:** Tasks 1.2-1.4 require Task 1.1 (schema) complete.  
**BLOCKER:** Tasks 2.2-2.4 require Task 2.1 (schema) complete.  
**You can start:** Task 3.3 (parallel, no schema dependency)

---

## YOUR TASKS

### **Task 1.2: SM-2 Algorithm Implementation**
**Effort:** 4 hours  
**Dependencies:** ⏳ Task 1.1 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Implement pure SM-2 spaced repetition algorithm.

#### **Deliverables:**

**File:** `services/learning-service/src/lib/srs-algorithm.ts`

Full implementation provided in `.execution/TECHNICAL_REVIEW_vocabulary_phase1.md` (Task 1.2 section).

**Copy the exact code from technical review.**

**Tests:** `services/learning-service/src/lib/__tests__/srs-algorithm.test.ts`

Implement ALL test cases from technical review (7 tests minimum).

**Acceptance Criteria:**
- [x] Function `calculateNextReview(state, quality)` works
- [x] All quality scores 0-5 handled
- [x] Ease factor clamped to 1.3
- [x] Test coverage >95%
- [x] All tests pass (`pnpm test srs-algorithm`)

---

### **Task 1.3: Review Queue Service**
**Effort:** 5 hours  
**Dependencies:** ⏳ Task 1.2 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Create service layer for review queue logic.

#### **Deliverables:**

**File:** `services/learning-service/src/services/reviewService.ts`

Implement 3 functions:
1. `getReviewQueue(userId)` - Fetch words due for review
2. `submitReview(userId, wordId, quality)` - Submit review result
3. `getProgressStats(userId)` - Get user stats

**Full code in technical review (Task 1.3).**

**Tests:** `services/learning-service/src/services/__tests__/reviewService.test.ts`

Test cases:
- getReviewQueue: returns max 20 words, sorted by nextReview ASC
- submitReview: updates progress correctly, calls SM-2 algorithm
- getProgressStats: aggregates counts by status

**Performance Targets:**
- getReviewQueue: <100ms
- submitReview: <50ms
- getProgressStats: <200ms

**Acceptance Criteria:**
- [x] All 3 functions implemented
- [x] Zod validation on all inputs
- [x] Error handling with try-catch
- [x] Tests pass, >80% coverage

---

### **Task 1.4: API Endpoints for SRS**
**Effort:** 3 hours  
**Dependencies:** ⏳ Task 1.3 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Create RESTful API endpoints for review flow.

#### **Deliverables:**

**File:** `services/learning-service/src/api/review.routes.ts` (new file)

Endpoints:
```typescript
import express from 'express'
import { z } from 'zod'
import * as reviewService from '../services/reviewService'
import { authMiddleware } from '../middlewares/auth' // Assume exists

const router = express.Router()

// GET /api/review/queue - Get review queue
router.get('/queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id // From authMiddleware
    const result = await reviewService.getReviewQueue(userId)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('[API] /review/queue failed:', error.message)
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch queue' }
    })
  }
})

// POST /api/review/submit - Submit review
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      wordId: z.string().cuid(),
      quality: z.number().int().min(0).max(5)
    })
    
    const { wordId, quality } = schema.parse(req.body)
    const userId = req.user.id
    
    const result = await reviewService.submitReview(userId, wordId, quality)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: error.errors }
      })
    }
    
    console.error('[API] /review/submit failed:', error.message)
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit review' }
    })
  }
})

// GET /api/review/stats - Get stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const result = await reviewService.getProgressStats(userId)
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('[API] /review/stats failed:', error.message)
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' }
    })
  }
})

export default router
```

**Register routes** in main app:
```typescript
// services/learning-service/src/app.ts
import reviewRoutes from './api/review.routes'
app.use('/api/review', reviewRoutes)
```

**Integration Tests:** `src/api/__tests__/review.routes.test.ts`

Test all endpoints with supertest.

**Acceptance Criteria:**
- [x] All 3 endpoints work
- [x] Auth middleware applied
- [x] Zod validation on POST
- [x] Error responses follow format
- [x] Integration tests pass

---

### **Task 2.2: Streak Calculation Service**
**Effort:** 4 hours  
**Dependencies:** ⏳ Task 2.1 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Implement streak update logic with timezone handling.

#### **Deliverables:**

**File:** `services/learning-service/src/services/streakService.ts`

Full implementation in technical review (Task 2.2).

**CRITICAL:** Implement timezone-aware date calculations.

**Tests:** Cover edge cases:
- First activity (null lastActivityDate)
- Same day activity (no change)
- Next day activity (+1 streak)
- Missed days (reset to 1)
- Midnight boundary (23:59 vs 00:01)
- Different timezones

**Acceptance Criteria:**
- [x] `updateStreak(userId)` works correctly
- [x] `checkStreakMilestone(streak)` returns 7, 30, 100, 365
- [x] Timezone handling tested
- [x] Test coverage >90%

---

### **Task 2.3: API Endpoint for Streaks**
**Effort:** 2 hours  
**Dependencies:** ⏳ Task 2.2 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Create GET endpoint for streak data.

#### **Deliverables:**

**File:** `services/learning-service/src/api/user.routes.ts` (add endpoint)

```typescript
// GET /api/user/streak
router.get('/streak', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    
    // Check if active today
    const now = new Date()
    const isActiveToday = user.lastActivityDate && 
      isSameDay(user.lastActivityDate, now, user.timezone)
    
    // Calculate next milestone
    const milestones = [7, 30, 100, 365]
    const nextMilestone = milestones.find(m => m > user.currentStreak) || null
    
    res.json({
      success: true,
      data: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        isActiveToday,
        nextMilestone,
        daysUntilMilestone: nextMilestone ? nextMilestone - user.currentStreak : null
      }
    })
  } catch (error) {
    // ...
  }
})
```

**Acceptance Criteria:**
- [x] Endpoint returns correct data
- [x] Auth required
- [x] Integration test passes

---

### **Task 2.4: Middleware to Auto-Update Streaks**
**Effort:** 2 hours  
**Dependencies:** ⏳ Task 2.2 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Create middleware to auto-update streaks on review submit.

#### **Deliverables:**

**File:** `services/learning-service/src/middlewares/streakMiddleware.ts`

```typescript
import { streakService } from '../services/streakService'

export async function updateStreakOnActivity(req, res, next) {
  // Run AFTER successful response
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const userId = req.user?.id
        if (userId) {
          // Update streak in background (don't block response)
          const result = await streakService.updateStreak(userId)
          
          if (result.milestoneReached) {
            // TODO: Emit event for achievements (Phase 2)
            console.log(`[Streak] User ${userId} reached ${result.milestoneReached} days!`)
          }
        }
      } catch (error) {
        // Log error but don't fail request
        console.error('[Streak Middleware] Failed to update streak:', error.message)
      }
    }
  })
  
  next()
}
```

**Apply to review submit route:**
```typescript
router.post('/submit', authMiddleware, updateStreakOnActivity, async (req, res) => {
  // ... existing code
})
```

**Acceptance Criteria:**
- [x] Middleware updates streak after successful submit
- [x] Doesn't block response
- [x] Errors logged but don't fail request
- [x] Integration test verifies streak incremented

---

### **Task 3.3: Audio Player Integration (Backend)**
**Effort:** 3 hours (backend part)  
**Dependencies:** None ✅ CAN START NOW  
**Status:** 🟢 READY TO START

#### **Your Mission:**
Integrate Google Cloud TTS API for audio generation.

#### **Deliverables:**

**File:** `services/learning-service/src/services/ttsService.ts`

Full implementation in technical review (Task 3.3).

**Environment Variable Required:**
```bash
GOOGLE_TTS_API_KEY=your_key_here
```

**If key not available:** Return `null` (frontend will use Web Speech fallback).

**File:** `services/learning-service/src/api/audio.routes.ts`

```typescript
import express from 'express'
import * as ttsService from '../services/ttsService'

const router = express.Router()

router.get('/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params
    
    // Get word from database
    const word = await prisma.vocabularyItem.findUnique({
      where: { id: wordId }
    })
    
    if (!word) {
      return res.status(404).json({ success: false, error: 'Word not found' })
    }
    
    // Generate/fetch audio URL
    const audioUrl = await ttsService.generateAudioUrl(
      wordId,
      word.word,
      'de-DE'
    )
    
    res.json({
      success: true,
      data: { audioUrl }
    })
  } catch (error) {
    console.error('[API] /audio failed:', error.message)
    res.status(500).json({ success: false, error: 'Failed to generate audio' })
  }
})

export default router
```

**Register route:**
```typescript
app.use('/api/audio', audioRoutes)
```

**Acceptance Criteria:**
- [x] TTS service works (if API key present)
- [x] Returns `null` gracefully if no API key
- [x] Caches audio URL in database
- [x] GET /api/audio/:wordId endpoint works

---

## 📝 SUBMISSION CHECKLIST

Before marking complete:

- [ ] All functions implemented
- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage >80%
- [ ] No TypeScript errors (`pnpm tsc`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Code follows `.claude/rules/api-backend.md`

**Report format:**
```
✅ Backend tasks complete!

Task 1.2: SM-2 algorithm ✅ (95% coverage)
Task 1.3: Review service ✅ (85% coverage)
Task 1.4: API endpoints ✅ (integration tests pass)
Task 2.2: Streak service ✅ (92% coverage)
Task 2.3: Streak API ✅
Task 2.4: Streak middleware ✅
Task 3.3: Audio integration ✅ (fallback ready)

Files:
- src/lib/srs-algorithm.ts
- src/services/reviewService.ts
- src/services/streakService.ts
- src/services/ttsService.ts
- src/api/review.routes.ts
- src/api/audio.routes.ts
- src/middlewares/streakMiddleware.ts

Ready for frontend integration!
```

---

**READ THESE RULES:**
- `.claude/rules/api-backend.md`
- `.execution/TECHNICAL_REVIEW_vocabulary_phase1.md`

**START with Task 3.3** (no dependencies), then wait for DB specialist before starting others.
