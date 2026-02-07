# TEST PLAN: DMF Vocabulary Module Phase 1

**Date:** 2026-02-06  
**Test Lead:** Test Lead Agent (Subagent)  
**Module:** Vocabulary Learning (SRS + Streaks + Flashcards + Audio)  
**Test Environment:** localhost:3000 (Development)  
**Database:** PostgreSQL (87,284 words)

---

## 📋 EXECUTIVE SUMMARY

**Test Scope:** Full vocabulary module testing covering:
- ✅ SRS Algorithm (SM-2) implementation
- ✅ Review queue and submission flow
- ✅ Daily streak tracking system
- ✅ Flashcard UI with animations
- ✅ Audio playback (API + TTS fallback)
- ✅ Error handling and loading states

**Total Test Cases:** 45 tests  
**Testing Duration:** 4-6 hours (parallel execution)  
**Pass Criteria:** 0 critical bugs, <3 high severity bugs, all critical paths working

---

## 🎯 TEST OBJECTIVES

1. **Verify SRS algorithm** correctly calculates review intervals
2. **Validate streak system** tracks daily activity accurately
3. **Ensure UI/UX** is smooth, responsive, and accessible
4. **Test performance** meets targets (<100ms API, <3s page load)
5. **Verify security** prevents unauthorized access and validates inputs

---

## 📚 WHAT WAS BUILT (FROM COMPLETION REPORTS)

### Backend Components:
- ✅ SM-2 SRS algorithm (`src/lib/srs-algorithm.ts`)
- ✅ Review Service (`src/services/reviewService.ts`)
- ✅ Streak Service (`src/services/streakService.ts`)
- ✅ API Endpoints:
  - `GET /api/review/queue` - Get words due for review
  - `POST /api/review/submit` - Submit review result
  - `GET /api/review/stats` - Get progress statistics
  - `GET /api/user/streak` - Get streak data
- ✅ Streak auto-update middleware
- ✅ 73 backend tests passing (95%+ coverage)

### Frontend Components:
- ✅ Flashcard with flip animation (`Flashcard.tsx`)
- ✅ Word Meter status indicator (`WordMeter.tsx`)
- ✅ Review Queue UI (`ReviewQueue.tsx`)
- ✅ Review Session flow (`ReviewSession.tsx`)
- ✅ Streak Widget with milestones (`StreakWidget.tsx`)
- ✅ Audio playback hook (`useAudio.ts`)
- ✅ Error Boundary (`ErrorBoundary.tsx`)
- ✅ Loading states (skeleton loaders)

### Critical Paths Identified:
1. **Review Flow:** Queue → Session → Submit ratings → Completion
2. **Streak Tracking:** Daily activity → Streak increment → Milestone achievements
3. **Audio Playback:** Click audio → API call → Fallback to TTS if needed

---

## 🧪 TEST COVERAGE MATRIX

| Test Category | Test Cases | Assignee | Priority | Duration |
|---------------|------------|----------|----------|----------|
| Integration | 15 | Integration Tester | P0 | 2-3h |
| E2E | 12 | E2E Tester | P0 | 2-3h |
| Performance | 8 | Performance Tester | P1 | 1-2h |
| Security | 10 | Security Tester | P0 | 1-2h |
| **TOTAL** | **45** | **4 Testers** | - | **6-10h** |

---

## 🔗 INTEGRATION TESTS (15 Test Cases)

**Tester:** Integration Tester  
**Focus:** API endpoints + Database integration + SRS algorithm  
**Tools:** Postman/Thunder Client, Prisma Studio, Jest

### Group 1: Review Queue API (3 tests)

#### TC-INT-001: Get Review Queue - Empty State
**Endpoint:** `GET /api/review/queue`  
**Precondition:** User has no words due for review  
**Input:** `x-user-id: test-user-1`  
**Expected:**
```json
{
  "success": true,
  "data": {
    "words": [],
    "count": 0,
    "hasMore": false
  }
}
```
**Validation:**
- ✅ Status code: 200
- ✅ Response time: <100ms
- ✅ Empty array returned

---

#### TC-INT-002: Get Review Queue - With Due Words
**Endpoint:** `GET /api/review/queue`  
**Precondition:** User has 25 words due today  
**Input:** `x-user-id: test-user-2`  
**Expected:**
```json
{
  "success": true,
  "data": {
    "words": [Array of 20 words],
    "count": 20,
    "hasMore": true
  }
}
```
**Validation:**
- ✅ Max 20 words returned (limit enforced)
- ✅ Each word has: id, german, english, level, nextReviewDate
- ✅ Only words with nextReviewDate <= today
- ✅ hasMore = true when total > 20

---

#### TC-INT-003: Get Review Queue - Unauthorized
**Endpoint:** `GET /api/review/queue`  
**Input:** No `x-user-id` header  
**Expected:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
**Validation:**
- ✅ Status code: 401
- ✅ Error message clear

---

### Group 2: Review Submission API (5 tests)

#### TC-INT-004: Submit Review - Quality 5 (Easy)
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "word-123",
  "quality": 5
}
```
**Expected:**
```json
{
  "success": true,
  "data": {
    "nextReviewDate": "2026-02-13T00:00:00.000Z",
    "intervalDays": 7,
    "status": "LEARNING",
    "easeFactor": 2.6
  }
}
```
**Validation:**
- ✅ Status: 200
- ✅ SM-2 algorithm applied correctly (interval increases)
- ✅ Database updated (check user_word_progress table)
- ✅ Response time: <50ms

---

#### TC-INT-005: Submit Review - Quality 0 (Again)
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "word-456",
  "quality": 0
}
```
**Expected:**
- ✅ intervalDays = 1 (reset to 1 day)
- ✅ repetitions = 0 (reset progress)
- ✅ status = "LEARNING" (not back to NEW)
- ✅ nextReviewDate = tomorrow

**Validation:** SM-2 reset logic works

---

#### TC-INT-006: Submit Review - First Time (NEW → LEARNING)
**Endpoint:** `POST /api/review/submit`  
**Precondition:** Word status = NEW, repetitions = 0  
**Input:** `quality: 4`  
**Expected:**
- ✅ status changes to "LEARNING"
- ✅ intervalDays = 1
- ✅ repetitions = 1
- ✅ easeFactor initialized to 2.5

---

#### TC-INT-007: Submit Review - Mastery (21+ days)
**Endpoint:** `POST /api/review/submit`  
**Precondition:** Word at interval 15 days, repetitions = 5  
**Input:** `quality: 5`  
**Expected:**
- ✅ intervalDays >= 21
- ✅ status = "MASTERED"
- ✅ Database reflects MASTERED status

---

#### TC-INT-008: Submit Review - Invalid Quality
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "word-789",
  "quality": 6
}
```
**Expected:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Quality must be 0-5"
- ✅ Zod validation triggered

---

### Group 3: Progress Statistics API (2 tests)

#### TC-INT-009: Get Progress Stats
**Endpoint:** `GET /api/review/stats`  
**Input:** `x-user-id: test-user-3`  
**Expected:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "NEW": 50,
      "LEARNING": 60,
      "REVIEW": 30,
      "MASTERED": 10
    },
    "dueToday": 25,
    "accuracy": 0.85
  }
}
```
**Validation:**
- ✅ Counts accurate (verify with DB query)
- ✅ Accuracy = correctReviews / totalReviews
- ✅ Response time: <200ms

---

#### TC-INT-010: Get Progress Stats - New User
**Endpoint:** `GET /api/review/stats`  
**Precondition:** User has 0 progress entries  
**Expected:**
- ✅ total = 0
- ✅ byStatus all zeros
- ✅ accuracy = 0 (not NaN)

---

### Group 4: Streak API (5 tests)

#### TC-INT-011: Get Streak - Active Streak
**Endpoint:** `GET /api/user/streak`  
**Input:** `x-user-id: test-user-4`  
**Precondition:** User has 5-day streak, reviewed today  
**Expected:**
```json
{
  "success": true,
  "data": {
    "currentStreak": 5,
    "longestStreak": 10,
    "isActiveToday": true,
    "nextMilestone": 7,
    "daysUntilMilestone": 2,
    "lastActivityDate": "2026-02-06T00:00:00.000Z"
  }
}
```
**Validation:**
- ✅ currentStreak accurate
- ✅ nextMilestone = 7 (first milestone)
- ✅ daysUntilMilestone = 7 - 5 = 2

---

#### TC-INT-012: Streak Auto-Update on Review Submit
**Endpoint:** `POST /api/review/submit` (triggers streak middleware)  
**Precondition:** User has 3-day streak, last activity yesterday  
**Action:** Submit a review today  
**Expected:**
- ✅ currentStreak increments to 4
- ✅ lastActivityDate updates to today
- ✅ Middleware runs in background (doesn't block response)

**Validation:**
- Check database after response
- Response time not affected (<50ms)

---

#### TC-INT-013: Streak Reset - Missed Day
**Action:** Simulate user skipping a day  
**Precondition:** User has 7-day streak, last activity = 2 days ago  
**Action:** Submit review today  
**Expected:**
- ✅ currentStreak resets to 1
- ✅ longestStreak preserved at 7
- ✅ lastActivityDate = today

---

#### TC-INT-014: Streak Milestone Detection
**Precondition:** User at 6-day streak  
**Action:** Submit review (triggers day 7)  
**Expected:**
- ✅ currentStreak = 7
- ✅ Milestone detected (console log: "🎉 Milestone: 7 days")
- ✅ nextMilestone updates to 30

---

#### TC-INT-015: Streak Timezone Handling
**Precondition:** User timezone = "Asia/Saigon" (GMT+7)  
**Action:** Submit review at 11:59 PM GMT+7  
**Expected:**
- ✅ Activity counted for correct date (not next day UTC)
- ✅ Streak logic uses user's timezone
- ✅ No off-by-one errors

---

## 🎭 E2E TESTS (12 Test Cases)

**Tester:** E2E Tester  
**Focus:** User flows + UI interactions + Browser testing  
**Tools:** OpenClaw browser tool, Chrome DevTools

### Group 1: Review Flow (5 tests)

#### TC-E2E-001: Complete Review Session (Happy Path)
**Flow:**
1. Navigate to `http://localhost:3000/vocabulary/review`
2. Review Queue loads (skeleton → cards appear)
3. Click "Start Review" button
4. Review 10 cards:
   - Card 1: Click audio → Hear pronunciation → Rate "Good" (4)
   - Card 2: Flip card → See translation → Rate "Easy" (5)
   - Card 3: Rate "Again" (1)
   - ... (repeat for 10 cards)
5. See "Review Complete" screen
6. Check streak updated (+1)
7. Return to dashboard

**Expected:**
- ✅ All 10 cards reviewed
- ✅ Progress bar updates (1/10 → 10/10)
- ✅ Streak increments
- ✅ Completion screen shows stats
- ✅ No UI errors or freezes

**Screenshot:** Take screenshot at completion screen

---

#### TC-E2E-002: Review Queue Empty State
**Flow:**
1. Navigate to `/vocabulary/review` as user with 0 due words
2. See empty state message
3. Click "Go to Dashboard" button

**Expected:**
- ✅ Message: "No words due for review today! 🎉"
- ✅ Button navigates back
- ✅ No broken UI

---

#### TC-E2E-003: Review Session Keyboard Navigation
**Flow:**
1. Start review session
2. Use keyboard only:
   - `Space` to flip card
   - `1` to rate "Again"
   - `2` to rate "Hard"
   - `3` to rate "Good"
   - `4` to rate "Easy"

**Expected:**
- ✅ All keyboard shortcuts work
- ✅ No mouse needed
- ✅ Focus visible on buttons

**Accessibility:** WCAG 2.1 AA compliance

---

#### TC-E2E-004: Review Session Error Boundary
**Flow:**
1. Start review session
2. Simulate API error (disconnect network in DevTools)
3. Try to submit review
4. See error boundary

**Expected:**
- ✅ Error boundary catches error
- ✅ Shows user-friendly message
- ✅ "Retry" button appears
- ✅ "Go to Dashboard" button works
- ✅ No white screen of death

---

#### TC-E2E-005: Review Session Loading States
**Flow:**
1. Navigate to `/vocabulary/review`
2. Observe loading skeleton
3. Wait for data to load
4. Start review
5. Rate card
6. Observe loading spinner during submit

**Expected:**
- ✅ Skeleton loader appears immediately
- ✅ No layout shift when data loads
- ✅ Submit button shows spinner during API call
- ✅ UI responsive throughout

---

### Group 2: Streak Widget (3 tests)

#### TC-E2E-006: Streak Widget Display
**Flow:**
1. Navigate to `/dashboard`
2. See StreakWidget at top

**Expected:**
- ✅ Current streak displayed with flame icon 🔥
- ✅ Longest streak badge shown
- ✅ Progress bar to next milestone
- ✅ Next goal countdown ("2 days to 7-day streak!")
- ✅ Animations smooth (60fps)

**Screenshot:** Capture streak widget

---

#### TC-E2E-007: Streak Milestone Achievement
**Precondition:** User at 6-day streak  
**Flow:**
1. Complete a review (triggers day 7)
2. Return to dashboard
3. See milestone celebration

**Expected:**
- ✅ Milestone badge unlocked (🔥 1 Week)
- ✅ Celebration animation plays
- ✅ Next milestone updates to 30 days

---

#### TC-E2E-008: Streak Widget Skeleton Loading
**Flow:**
1. Navigate to dashboard
2. Observe streak widget loading state

**Expected:**
- ✅ Skeleton loader matches final layout
- ✅ No content jump when data arrives
- ✅ Loads within 1 second

---

### Group 3: Flashcard UI (4 tests)

#### TC-E2E-009: Flashcard Flip Animation
**Flow:**
1. Start review session
2. Click card to flip
3. Observe animation
4. Click again to flip back

**Expected:**
- ✅ Smooth 3D flip animation (framer-motion)
- ✅ 60fps throughout
- ✅ Front shows German word + level
- ✅ Back shows English translation + example sentence
- ✅ No animation jank

**Performance:** Record with DevTools Performance tab

---

#### TC-E2E-010: Audio Playback - API Success
**Flow:**
1. Start review session
2. Click audio button (speaker icon)
3. Wait for audio to play

**Expected:**
- ✅ Loading spinner appears
- ✅ Audio plays (German pronunciation)
- ✅ Button shows "playing" state (animated icon)
- ✅ Card doesn't flip when clicking audio
- ✅ Audio stops before next card

**Validation:** Check Network tab for `GET /api/audio/:wordId`

---

#### TC-E2E-011: Audio Playback - TTS Fallback
**Flow:**
1. Start review session
2. Disconnect API (or use word with no audio file)
3. Click audio button

**Expected:**
- ✅ Fallback to Web Speech API
- ✅ TTS voice (de-DE) plays
- ✅ No error shown to user
- ✅ Graceful degradation

---

#### TC-E2E-012: Word Meter Visualization
**Flow:**
1. Review multiple words at different levels
2. Observe Word Meter on each card

**Expected:**
- ✅ NEW: 0/5 filled (gray)
- ✅ LEARNING: 1-2/5 filled (yellow)
- ✅ REVIEW: 3-4/5 filled (blue)
- ✅ MASTERED: 5/5 filled (green)
- ✅ Visual indicator clear and accurate

---

## ⚡ PERFORMANCE TESTS (8 Test Cases)

**Tester:** Performance Tester  
**Focus:** Page load times + API response + Load testing  
**Tools:** Chrome DevTools Lighthouse, Apache Bench / k6

### Group 1: Page Load Performance (3 tests)

#### TC-PERF-001: Review Page Load Time
**Page:** `http://localhost:3000/vocabulary/review`  
**Target:** <3 seconds (full page load)  
**Metrics:**
- First Contentful Paint (FCP): <1s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Total Blocking Time (TBT): <200ms

**Tool:** Lighthouse (Chrome DevTools)  
**Pass Criteria:** All metrics within targets

---

#### TC-PERF-002: Dashboard Load Time with Streak Widget
**Page:** `http://localhost:3000/dashboard`  
**Target:** <2.5 seconds  
**Metrics:**
- FCP: <0.8s
- LCP: <2s
- Cumulative Layout Shift (CLS): <0.1

**Validation:** No layout shift when StreakWidget loads

---

#### TC-PERF-003: Flashcard Animation Frame Rate
**Action:** Flip flashcard 20 times rapidly  
**Target:** 60fps (16.67ms per frame)  
**Tool:** Chrome DevTools Performance → Frames  
**Pass Criteria:**
- ✅ No dropped frames
- ✅ Average frame time <17ms
- ✅ No jank during animation

---

### Group 2: API Response Time (3 tests)

#### TC-PERF-004: GET /api/review/queue Response Time
**Load:** 100 sequential requests  
**Target:** <100ms average, <200ms p95  
**Tool:** Apache Bench
```bash
ab -n 100 -c 1 -H "x-user-id: test-user" http://localhost:3000/api/review/queue
```
**Pass Criteria:**
- ✅ Average: <100ms
- ✅ 95th percentile: <200ms
- ✅ 0 failed requests

---

#### TC-PERF-005: POST /api/review/submit Response Time
**Load:** 100 submissions (sequential)  
**Target:** <50ms average  
**Tool:** k6 script
```javascript
import http from 'k6/http';
export default function() {
  http.post('http://localhost:3000/api/review/submit', {
    wordId: 'word-123',
    quality: 4
  }, { headers: { 'x-user-id': 'test-user' }});
}
```
**Pass Criteria:**
- ✅ Average: <50ms
- ✅ Database transaction fast
- ✅ SM-2 calculation efficient

---

#### TC-PERF-006: GET /api/user/streak Response Time
**Load:** 100 requests  
**Target:** <100ms average  
**Pass Criteria:** Similar to TC-PERF-004

---

### Group 3: Load Testing (2 tests)

#### TC-PERF-007: Concurrent Users - Review Submission
**Load:** 50 concurrent users submitting reviews  
**Duration:** 60 seconds  
**Tool:** k6
```javascript
import http from 'k6/http';
export let options = {
  vus: 50, // 50 virtual users
  duration: '60s',
};
export default function() {
  http.post('http://localhost:3000/api/review/submit', ...);
}
```
**Target:**
- ✅ 0 failed requests
- ✅ Average latency: <500ms
- ✅ p95 latency: <1s
- ✅ Server CPU: <80%
- ✅ No memory leaks

**Pass Criteria:** System remains stable under load

---

#### TC-PERF-008: Memory Leak Detection
**Action:**
1. Open `/vocabulary/review` page
2. Review 100 cards continuously
3. Monitor memory usage (Chrome DevTools Memory)

**Expected:**
- ✅ Heap size stable (~50-100MB)
- ✅ No continuous growth
- ✅ Garbage collection working

**Tool:** Chrome DevTools Memory Profiler  
**Pass Criteria:** No memory leaks detected

---

## 🔒 SECURITY TESTS (10 Test Cases)

**Tester:** Security Tester  
**Focus:** Auth + Authorization + Input validation + Vulnerabilities  
**Tools:** Postman, Browser DevTools, SQL injection tools

### Group 1: Authentication (2 tests)

#### TC-SEC-001: Unauthenticated Access - Review Queue
**Endpoint:** `GET /api/review/queue`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 401 Unauthorized
- ✅ Response: `{ "success": false, "error": "Unauthorized" }`
- ✅ No data leaked

---

#### TC-SEC-002: Unauthenticated Access - Submit Review
**Endpoint:** `POST /api/review/submit`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 401
- ✅ Review not saved to database

---

### Group 2: Authorization (2 tests)

#### TC-SEC-003: Cross-User Data Access - Review Queue
**Scenario:** User A tries to access User B's review queue  
**Input:** `x-user-id: user-A` but try to fetch user-B's data  
**Expected:**
- ✅ Only User A's words returned
- ✅ No cross-user data leakage
- ✅ Authorization check enforced

---

#### TC-SEC-004: Cross-User Progress Modification
**Scenario:** User A tries to submit review for User B's word  
**Input:**
```json
POST /api/review/submit
x-user-id: user-A
Body: { wordId: "user-B-word-123", quality: 5 }
```
**Expected:**
- ✅ Status: 403 Forbidden OR 404 Not Found
- ✅ User B's progress unchanged
- ✅ Audit log entry (if logging enabled)

---

### Group 3: Input Validation (3 tests)

#### TC-SEC-005: SQL Injection - Word ID
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "'; DROP TABLE user_word_progress; --",
  "quality": 4
}
```
**Expected:**
- ✅ Zod validation fails
- ✅ Status: 400 Bad Request
- ✅ Database unaffected (Prisma parameterized queries)
- ✅ Error: "Invalid wordId format"

---

#### TC-SEC-006: XSS Attack - Review Submission
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "<script>alert('XSS')</script>",
  "quality": 4
}
```
**Expected:**
- ✅ Input sanitized
- ✅ Script not executed
- ✅ Validation error returned

---

#### TC-SEC-007: Quality Score Out of Range
**Endpoint:** `POST /api/review/submit`  
**Input:**
```json
{
  "wordId": "word-123",
  "quality": 999
}
```
**Expected:**
- ✅ Zod validation fails
- ✅ Status: 400
- ✅ Error: "Quality must be between 0 and 5"

---

### Group 4: Data Security (3 tests)

#### TC-SEC-008: Sensitive Data Exposure in Logs
**Action:** Trigger errors and check server logs  
**Validation:**
- ✅ No passwords in logs
- ✅ No user emails in logs
- ✅ Only safe error messages logged
- ✅ Stack traces not exposed to client

---

#### TC-SEC-009: HTTPS Enforcement (Production Check)
**Note:** For production deployment  
**Validation:**
- ✅ All API calls use HTTPS
- ✅ HTTP redirects to HTTPS
- ✅ No mixed content warnings

---

#### TC-SEC-010: Rate Limiting (Optional - Phase 2)
**Endpoint:** `POST /api/review/submit`  
**Action:** Send 1000 requests in 10 seconds  
**Expected (if implemented):**
- ✅ Rate limit triggered
- ✅ Status: 429 Too Many Requests
- ✅ Retry-After header present

**Note:** If not implemented in Phase 1, document as future enhancement

---

## ✅ PASS CRITERIA

### Critical (Must Meet All):
- [ ] **0 critical bugs** (blocking production deployment)
- [ ] **All critical paths working:**
  - [ ] Review queue loads correctly
  - [ ] Review submission updates database
  - [ ] Streak increments on daily activity
  - [ ] Audio playback works (API or fallback)
  - [ ] Flashcard animations smooth
- [ ] **Performance targets met:**
  - [ ] API response: <100ms average
  - [ ] Page load: <3s
  - [ ] 60fps animations
- [ ] **Security validated:**
  - [ ] Auth middleware enforced
  - [ ] No SQL injection vulnerabilities
  - [ ] Input validation working

### High Priority (Must Meet Most):
- [ ] **<3 high severity bugs**
- [ ] **All E2E flows complete successfully**
- [ ] **Cross-browser compatibility** (Chrome, Safari, Firefox)
- [ ] **Mobile responsive** (iPhone, iPad)

### Medium Priority (Nice to Have):
- [ ] **<10 medium/low bugs**
- [ ] **Test coverage ≥90%**
- [ ] **No console errors**
- [ ] **Accessibility WCAG 2.1 AA**

---

## 🚫 FAIL CRITERIA (ANY triggers rejection)

- ❌ **>=1 critical bug** (data loss, crash, security breach)
- ❌ **>=3 high severity bugs** (broken features, poor UX)
- ❌ **Critical path broken** (can't complete review flow)
- ❌ **Performance fails targets** (>5s page load, >200ms API)
- ❌ **Security vulnerability found** (SQL injection, XSS works)

---

## 🛠️ TEST ENVIRONMENT

### Server:
- **URL:** http://localhost:3000
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (test database)
- **Port:** 3000

### Browser:
- **Primary:** Chrome 120+
- **Secondary:** Safari 17+, Firefox 121+
- **Mobile:** iPhone 14 Pro, iPad Air (responsive mode)

### Test Data:
- **Users:** 5 test users with varied progress
  - User 1: 0 words (new user)
  - User 2: 150 words (50 NEW, 60 LEARNING, 30 REVIEW, 10 MASTERED)
  - User 3: 25 words due today
  - User 4: 5-day active streak
  - User 5: 30-day streak (milestone achieved)

### Database:
- **Vocabulary:** 87,284 German words
- **Test data:** Pre-seeded with user_word_progress entries

---

## 📊 TEST EXECUTION PLAN

### Phase 1: Test Planning (CURRENT)
- ✅ Read all documentation
- ✅ Create test plan
- ✅ Define success criteria
- ⏳ **Next:** Spawn 4 testers

### Phase 2: Parallel Testing (4-6 hours)
- **Integration Tester:** Tests 1-15 (TC-INT-001 to TC-INT-015)
- **E2E Tester:** Tests 16-27 (TC-E2E-001 to TC-E2E-012)
- **Performance Tester:** Tests 28-35 (TC-PERF-001 to TC-PERF-008)
- **Security Tester:** Tests 36-45 (TC-SEC-001 to TC-SEC-010)

**All testers work simultaneously**

### Phase 3: Results Collection (30 min)
- Aggregate bug reports
- Calculate pass rates
- Identify patterns

### Phase 4: Bug Fixes (if needed)
- Report to Execution Team
- Re-test after fixes

### Phase 5: Certification (30 min)
- Make PASS/FAIL decision
- Create certification report
- Notify main session

---

## 📄 DELIVERABLES

Each tester will produce:

1. **Integration Tester:**
   - `.testing/integration-results-vocabulary.md`
   - API test results (15 tests)
   - Database validation screenshots

2. **E2E Tester:**
   - `.testing/e2e-results-vocabulary.md`
   - UI flow screenshots
   - Browser compatibility matrix

3. **Performance Tester:**
   - `.testing/performance-results-vocabulary.md`
   - Lighthouse reports
   - Load test graphs

4. **Security Tester:**
   - `.testing/security-results-vocabulary.md`
   - Vulnerability scan results
   - Security score

**Final Deliverables:**
- `.testing/TEST_SUMMARY_vocabulary.md` (aggregated results)
- `.testing/BUG_REPORT_vocabulary.md` (if bugs found)
- `.testing/CERTIFICATION_vocabulary.md` (final decision)

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | ≥95% | (Passed tests / Total tests) × 100 |
| Critical Bugs | 0 | Count of P0 bugs |
| High Bugs | <3 | Count of P1 bugs |
| API Response Time | <100ms avg | From performance tests |
| Page Load Time | <3s | Lighthouse LCP metric |
| Test Coverage | ≥90% | Backend: Jest, Frontend: Manual |
| Security Score | A+ | No vulnerabilities found |

---

## 📋 REPORTING FORMAT

### Progress Reports (Every 1 Hour):
```
🧪 Test Progress Update

Integration: [X/15] tests complete, [Y] bugs found
E2E: [X/12] tests complete, [Y] bugs found
Performance: [X/8] tests complete, [Y] issues
Security: [X/10] tests complete, [Y] vulnerabilities

Total Progress: [X/45] tests (Y% complete)
Overall Status: [ON_TRACK | DELAYED | BLOCKED]
```

### Final Report:
```
🎉 Testing Complete!

Total Tests: 45/45 (100%)
Pass Rate: X%
Bugs Found: Critical (X), High (X), Medium (X), Low (X)
Performance: [PASS/FAIL]
Security: [PASS/FAIL]

Decision: [✅ CERTIFIED | ❌ REJECTED]
```

---

## 🔗 REFERENCES

**Read by Testers:**
- `.testing/TEST_PLAN_vocabulary.md` (this file)
- `.execution/COMPLETION_REPORT_frontend_vocab_phase1.md` (what was built - frontend)
- `.execution/BACKEND_COMPLETION_vocab_phase1.md` (what was built - backend)
- `.research/RESEARCH_REPORT_vocabulary.md` (requirements)
- `DMF_VOCABULARY_ACTION_PLAN.md` (expected features)

**Testing Standards:**
- `.claude/rules/testing.md` (if exists)
- WCAG 2.1 AA (accessibility)
- OWASP Top 10 (security)

---

**Test Plan Status:** ✅ READY FOR EXECUTION  
**Created by:** Test Lead Agent  
**Date:** 2026-02-06  
**Next Step:** Spawn 4 testers in parallel

---

**Total Estimated Duration:** 6-10 hours (parallel execution)  
**Expected Completion:** 2026-02-06 EOD  
**Risk:** LOW (all dependencies ready, clear test cases)
