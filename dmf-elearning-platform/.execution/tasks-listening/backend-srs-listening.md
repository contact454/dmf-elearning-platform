# Backend Developer (SRS) - Listening Module Phase 1

**Role:** Progress Tracking, SRS Algorithm, Analytics  
**Duration:** Weeks 1-8 (28-36 hours total)  
**Priority:** HIGH (blocks analytics features)

---

## 🎯 Your Mission

Implement listening-specific SRS (Spaced Repetition System) algorithm, progress tracking logic, streak tracking service, and analytics aggregation functions for the Listening Module.

---

## ✅ Task Checklist

### **Week 1-2: Research & Planning**

- [ ] **Task 1.1: Review vocabulary SRS algorithm**
  - **File to read:** `lib/srs/sm2-algorithm.ts` (from vocabulary module)
  - **Understand:**
    - SM-2 algorithm logic (easeFactor, interval, quality rating 0-5)
    - How quality rating maps to performance
    - When to advance difficulty vs repeat
  - **Duration:** 2 hours

- [ ] **Task 1.2: Design listening-specific SRS logic**
  - **Key differences from vocabulary:**
    - Vocabulary: Binary correct/incorrect (flashcard flip)
    - Listening: Partial credit possible (accuracy_score 0-100)
    - Listening: Time spent matters (faster = better mastery)
    - Listening: Multiple attempts per exercise (track attempts)
  - **Algorithm design:**
    ```typescript
    function calculateQualityRating(
      correct: boolean,
      accuracy_score: number,
      time_spent_seconds: number,
      expected_duration: number,
      attempts: number
    ): number {
      // Quality rating: 0-5 (SM-2 standard)
      
      if (!correct) {
        return 0; // Fail: repeat soon
      }
      
      if (accuracy_score === 100 && attempts === 1) {
        return 5; // Perfect: longest interval
      }
      
      if (accuracy_score >= 90 && attempts === 1) {
        return 4; // Excellent: long interval
      }
      
      if (accuracy_score >= 80) {
        return 3; // Good: moderate interval
      }
      
      if (accuracy_score >= 70) {
        return 2; // Passing: short interval
      }
      
      return 1; // Barely passing: very short interval
    }
    ```
  - **Documentation:** Write design doc in `.execution/SRS_ALGORITHM_listening.md`
  - **Duration:** 3 hours

- [ ] **Task 1.3: Plan analytics data structure**
  - **Metrics to track:**
    - Total exercises completed (count)
    - Total listening time (sum of time_spent_seconds)
    - Average accuracy (mean of accuracy_score)
    - Exercises by difficulty (group by difficulty)
    - Exercises by type (group by exercise_type)
    - Weekly/monthly trends (time-series data)
  - **Aggregation strategy:** Use Prisma `groupBy` and `aggregate`
  - **Duration:** 2 hours

- [ ] **Task 1.4: Setup test framework**
  - **Tool:** Vitest (existing in project)
  - **File:** `tests/srs/listening-srs.test.ts`
  - **Initial test structure:**
    ```typescript
    import { describe, it, expect } from 'vitest';
    import { calculateQualityRating, updateProgress } from '@/lib/srs/listening-srs';
    
    describe('Listening SRS Algorithm', () => {
      it('should return quality 5 for perfect score on first attempt', () => {
        const quality = calculateQualityRating(true, 100, 5, 5, 1);
        expect(quality).toBe(5);
      });
      
      it('should return quality 0 for incorrect answer', () => {
        const quality = calculateQualityRating(false, 0, 10, 5, 2);
        expect(quality).toBe(0);
      });
      
      // ... 20+ more test cases
    });
    ```
  - **Duration:** 2 hours

---

### **Week 3-4: Core SRS Implementation**

- [ ] **Task 2.1: Implement SRS algorithm (core logic)**
  - **File:** `lib/srs/listening-srs.ts`
  - **Functions:**
    ```typescript
    import { ListeningExercise, UserListeningProgress } from '@prisma/client';
    
    export function calculateQualityRating(
      correct: boolean,
      accuracy_score: number,
      time_spent_seconds: number,
      expected_duration: number,
      attempts: number
    ): number {
      // Implementation from Task 1.2
    }
    
    export function calculateNextReview(
      currentProgress: UserListeningProgress,
      qualityRating: number
    ): { nextReviewAt: Date; interval: number; easeFactor: number } {
      // SM-2 algorithm (reuse from vocabulary module)
      let { ease_factor, interval_days } = currentProgress;
      
      if (qualityRating >= 3) {
        // Correct: increase interval
        if (interval_days === 0) {
          interval_days = 1;
        } else if (interval_days === 1) {
          interval_days = 6;
        } else {
          interval_days = Math.round(interval_days * ease_factor);
        }
        
        ease_factor = ease_factor + (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
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
    
    export async function updateProgress(
      userId: string,
      exerciseId: string,
      result: {
        correct: boolean;
        accuracy_score: number;
        time_spent_seconds: number;
      }
    ) {
      // Fetch current progress or create new
      const progress = await prisma.userListeningProgress.upsert({
        where: {
          user_id_exercise_id: { user_id: userId, exercise_id: exerciseId },
        },
        create: {
          user_id: userId,
          exercise_id: exerciseId,
          total_attempts: 1,
          correct_attempts: result.correct ? 1 : 0,
          last_attempt_at: new Date(),
          difficulty_rating: 5, // default
          ease_factor: 2.5, // SM-2 default
          interval_days: 0,
        },
        update: {
          total_attempts: { increment: 1 },
          correct_attempts: result.correct ? { increment: 1 } : undefined,
          last_attempt_at: new Date(),
        },
      });
      
      // Calculate quality rating
      const exercise = await prisma.listeningExercise.findUnique({
        where: { id: exerciseId },
      });
      
      const quality = calculateQualityRating(
        result.correct,
        result.accuracy_score,
        result.time_spent_seconds,
        exercise!.duration_seconds,
        progress.total_attempts
      );
      
      // Calculate next review
      const { nextReviewAt, interval, easeFactor } = calculateNextReview(progress, quality);
      
      // Update progress with SRS data
      await prisma.userListeningProgress.update({
        where: { id: progress.id },
        data: {
          next_review_at: nextReviewAt,
          interval_days: interval,
          ease_factor: easeFactor,
        },
      });
      
      return { quality, nextReviewAt };
    }
    ```
  - **Duration:** 5 hours

- [ ] **Task 2.2: Write unit tests for SRS algorithm**
  - **File:** `tests/srs/listening-srs.test.ts`
  - **Test cases (20+ total):**
    ```typescript
    describe('calculateQualityRating', () => {
      it('perfect score, first attempt → quality 5', () => {
        expect(calculateQualityRating(true, 100, 5, 5, 1)).toBe(5);
      });
      
      it('90% score, first attempt → quality 4', () => {
        expect(calculateQualityRating(true, 90, 5, 5, 1)).toBe(4);
      });
      
      it('80% score, multiple attempts → quality 3', () => {
        expect(calculateQualityRating(true, 80, 10, 5, 2)).toBe(3);
      });
      
      it('70% score → quality 2', () => {
        expect(calculateQualityRating(true, 70, 15, 5, 3)).toBe(2);
      });
      
      it('incorrect answer → quality 0', () => {
        expect(calculateQualityRating(false, 30, 20, 5, 5)).toBe(0);
      });
      
      // ... 15 more test cases
    });
    
    describe('calculateNextReview', () => {
      it('first review (quality 5) → interval 1 day', () => {
        const progress = { interval_days: 0, ease_factor: 2.5 };
        const result = calculateNextReview(progress, 5);
        expect(result.interval).toBe(1);
      });
      
      it('second review (quality 5) → interval 6 days', () => {
        const progress = { interval_days: 1, ease_factor: 2.5 };
        const result = calculateNextReview(progress, 5);
        expect(result.interval).toBe(6);
      });
      
      it('third review (quality 5) → interval 15 days (6 * 2.5)', () => {
        const progress = { interval_days: 6, ease_factor: 2.5 };
        const result = calculateNextReview(progress, 5);
        expect(result.interval).toBe(15);
      });
      
      it('incorrect (quality 0) → reset interval to 1', () => {
        const progress = { interval_days: 15, ease_factor: 2.5 };
        const result = calculateNextReview(progress, 0);
        expect(result.interval).toBe(1);
      });
      
      // ... more test cases
    });
    ```
  - **Target:** \> 80% code coverage
  - **Duration:** 4 hours

- [ ] **Task 2.3: Implement difficulty adjustment algorithm**
  - **File:** `lib/srs/difficulty-adjustment.ts`
  - **Logic:**
    ```typescript
    export async function calculateAdaptiveDifficulty(userId: string): Promise<number> {
      // Fetch recent performance (last 10 exercises)
      const recentAttempts = await prisma.listeningAttempt.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 10,
      });
      
      if (recentAttempts.length === 0) {
        return 1; // Start at A1 level
      }
      
      // Calculate average accuracy
      const avgAccuracy = recentAttempts.reduce((sum, a) => sum + (a.accuracy_score || 0), 0) / recentAttempts.length;
      
      // Calculate average attempts per exercise
      const avgAttempts = recentAttempts.length / new Set(recentAttempts.map(a => a.exercise_id)).size;
      
      // Current difficulty (mode of recent exercises)
      const difficulties = await Promise.all(
        recentAttempts.map(async (a) => {
          const ex = await prisma.listeningExercise.findUnique({ where: { id: a.exercise_id } });
          return ex?.difficulty || 1;
        })
      );
      const currentDifficulty = mode(difficulties);
      
      // Adjustment logic
      let difficultyDelta = 0;
      
      if (avgAccuracy > 90 && avgAttempts < 1.5) {
        difficultyDelta = +2; // Increase difficulty
      } else if (avgAccuracy > 80 && avgAttempts < 2) {
        difficultyDelta = +1;
      } else if (avgAccuracy < 50 || avgAttempts > 3) {
        difficultyDelta = -2; // Decrease difficulty
      } else if (avgAccuracy < 70 || avgAttempts > 2.5) {
        difficultyDelta = -1;
      }
      
      // Clamp to 1-10
      return Math.max(1, Math.min(10, currentDifficulty + difficultyDelta));
    }
    
    function mode(arr: number[]): number {
      const counts = new Map<number, number>();
      arr.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    ```
  - **Duration:** 3 hours

---

### **Week 5-6: Streak Tracking & Analytics**

- [ ] **Task 3.1: Integrate streak tracking service**
  - **File:** `lib/streak/listening-streak.ts`
  - **Reuse:** Adapt from vocabulary module's `lib/streak/streak-service.ts`
  - **Logic:**
    ```typescript
    import { updateStreak } from '@/lib/streak/streak-service'; // from vocabulary module
    
    export async function updateListeningStreak(userId: string): Promise<number> {
      // Update streak when user completes at least 1 listening exercise today
      const todayAttempts = await prisma.listeningAttempt.count({
        where: {
          user_id: userId,
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });
      
      if (todayAttempts > 0) {
        return await updateStreak(userId, 'listening'); // module-specific streak
      }
      
      return 0;
    }
    ```
  - **Duration:** 2 hours

- [ ] **Task 3.2: Create analytics aggregation functions**
  - **File:** `lib/analytics/listening-analytics.ts`
  - **Functions:**
    ```typescript
    export async function getUserListeningStats(userId: string) {
      // Total exercises completed (distinct exercise_id)
      const totalExercises = await prisma.listeningAttempt.groupBy({
        by: ['exercise_id'],
        where: { user_id: userId, correct: true },
        _count: { exercise_id: true },
      });
      
      // Total listening time
      const totalTime = await prisma.listeningAttempt.aggregate({
        where: { user_id: userId },
        _sum: { time_spent_seconds: true },
      });
      
      // Average accuracy
      const avgAccuracy = await prisma.listeningAttempt.aggregate({
        where: { user_id: userId },
        _avg: { accuracy_score: true },
      });
      
      // Current streak
      const streak = await getStreak(userId, 'listening');
      
      // Exercises by difficulty
      const byDifficulty = await prisma.$queryRaw`
        SELECT e.difficulty, COUNT(DISTINCT la.exercise_id) as count
        FROM listening_attempts la
        JOIN listening_exercises e ON la.exercise_id = e.id
        WHERE la.user_id = ${userId} AND la.correct = true
        GROUP BY e.difficulty
        ORDER BY e.difficulty
      `;
      
      return {
        total_exercises_completed: totalExercises.length,
        total_listening_time_seconds: totalTime._sum.time_spent_seconds || 0,
        average_accuracy: avgAccuracy._avg.accuracy_score || 0,
        current_streak: streak,
        exercises_by_difficulty: byDifficulty,
      };
    }
    
    export async function getWeeklyStats(userId: string) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyAttempts = await prisma.listeningAttempt.findMany({
        where: {
          user_id: userId,
          created_at: { gte: oneWeekAgo },
        },
      });
      
      return {
        weekly_exercises: new Set(weeklyAttempts.map(a => a.exercise_id)).size,
        weekly_time_seconds: weeklyAttempts.reduce((sum, a) => sum + a.time_spent_seconds, 0),
        weekly_accuracy: weeklyAttempts.reduce((sum, a) => sum + (a.accuracy_score || 0), 0) / weeklyAttempts.length,
      };
    }
    ```
  - **Duration:** 4 hours

- [ ] **Task 3.3: Implement progress update middleware**
  - **File:** `lib/middleware/listening-progress-middleware.ts`
  - **Purpose:** Auto-update progress after answer submission
  - **Logic:**
    ```typescript
    import { updateProgress } from '@/lib/srs/listening-srs';
    import { updateListeningStreak } from '@/lib/streak/listening-streak';
    
    export async function afterSubmitMiddleware(
      userId: string,
      exerciseId: string,
      result: { correct: boolean; accuracy_score: number; time_spent_seconds: number }
    ) {
      // Update SRS progress
      await updateProgress(userId, exerciseId, result);
      
      // Update streak (if applicable)
      if (result.correct) {
        await updateListeningStreak(userId);
      }
      
      // Future: Update achievements, leaderboard, etc.
    }
    ```
  - **Integration:** Call from `POST /api/listening/submit` endpoint
  - **Duration:** 2 hours

- [ ] **Task 3.4: Write tests for analytics functions**
  - **File:** `tests/analytics/listening-analytics.test.ts`
  - **Test cases:**
    - getUserListeningStats returns correct aggregates
    - getWeeklyStats filters by date correctly
    - Streak updates after correct answer
    - Streak doesn't update on incorrect answer
  - **Duration:** 3 hours

---

### **Week 7-8: Edge Cases & Documentation**

- [ ] **Task 4.1: Handle edge cases**
  - **Edge cases to test:**
    - New user (no progress data) → defaults to difficulty 1
    - User with 0 attempts → stats return zeros
    - User completes same exercise multiple times → don't double-count
    - Streak broken (missed day) → reset to 1
    - Accuracy score NULL (old data) → treat as 0
  - **Add error handling in all functions**
  - **Duration:** 3 hours

- [ ] **Task 4.2: Performance testing**
  - **Scenario:** 100 concurrent users submitting answers
  - **Tool:** Use Apache Bench or Artillery
  - **Command:**
    ```bash
    ab -n 100 -c 10 -H "x-user-id: test-user" -H "Content-Type: application/json" -p submit-payload.json http://localhost:3000/api/listening/submit
    ```
  - **Target:** \< 50ms per request (p95)
  - **Optimizations:** Add database indexes, cache frequently accessed data
  - **Duration:** 3 hours

- [ ] **Task 4.3: Algorithm tuning**
  - **Action:** Test SRS algorithm with real data (50+ attempts)
  - **Metrics to monitor:**
    - Are intervals too long? (users forget exercises)
    - Are intervals too short? (users get bored)
    - Is difficulty adjustment too aggressive?
  - **Adjustments:** Tweak constants (ease_factor increments, interval multipliers)
  - **Duration:** 2 hours

- [ ] **Task 4.4: Finalize documentation**
  - **File:** `.execution/SRS_ALGORITHM_listening.md`
  - **Contents:**
    - Algorithm description (quality rating, interval calculation)
    - Difficulty adjustment logic (when to increase/decrease)
    - Code examples (how to use `updateProgress`)
    - Test results (20+ tests passing)
    - Performance benchmarks (response times)
    - Future improvements (ideas for Phase 2)
  - **Duration:** 3 hours

---

## 📊 Deliverables Summary

| Deliverable | File Path | Status |
|-------------|-----------|--------|
| SRS algorithm | `lib/srs/listening-srs.ts` | ⬜ |
| Difficulty adjustment | `lib/srs/difficulty-adjustment.ts` | ⬜ |
| Streak tracking | `lib/streak/listening-streak.ts` | ⬜ |
| Analytics functions | `lib/analytics/listening-analytics.ts` | ⬜ |
| Progress middleware | `lib/middleware/listening-progress-middleware.ts` | ⬜ |
| SRS tests | `tests/srs/listening-srs.test.ts` | ⬜ |
| Analytics tests | `tests/analytics/listening-analytics.test.ts` | ⬜ |
| Algorithm docs | `.execution/SRS_ALGORITHM_listening.md` | ⬜ |

---

## 🎯 Success Criteria

- [ ] SRS algorithm implemented (SM-2 based)
- [ ] Difficulty adjustment working (adaptive learning)
- [ ] Streak tracking integrated (reuses vocabulary service)
- [ ] Analytics functions accurate (tested with sample data)
- [ ] Unit test coverage \> 80%
- [ ] All tests passing (20+ test cases)
- [ ] Performance targets met (\< 50ms per update)
- [ ] Documentation complete

---

## 🚨 Blockers & Dependencies

**Dependencies:**
- DB Specialist must create tables first (Week 1-2)
- Backend Dev (Audio) must implement submit endpoint (Week 3-4)

**Potential Blockers:**
- Vocabulary streak service not compatible → Write listening-specific service
- SRS algorithm too complex → Simplify to binary correct/incorrect

**Escalation:**
- If blocked for \> 4 hours → Report to PM or Tech Lead

---

## 📚 Resources

**Documentation:**
- SM-2 Algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- Prisma Aggregation: https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing
- Vitest Docs: https://vitest.dev/

**Example Code:**
- See `lib/srs/sm2-algorithm.ts` (vocabulary module)
- See `.execution/BACKEND_COMPLETION_vocab_phase1.md` for streak service

**Contact:**
- DB Specialist: For schema questions
- Backend Dev (Audio): For submit endpoint integration
- Frontend Dev: For analytics UI requirements

---

**Task File Version:** 1.0  
**Last Updated:** 2026-02-06  
**Owner:** Backend Developer (SRS)
