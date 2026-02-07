# TEST PLAN: DMF Reading Module Phase 1

**Date:** 2026-02-06  
**Test Lead:** Test Lead Agent (Subagent)  
**Module:** Reading Comprehension (Passages + Exercises + SRS Vocabulary)  
**Test Environment:** localhost:3000 (Development)  
**Database:** PostgreSQL (70 passages, 420 exercises)

---

## 📋 EXECUTIVE SUMMARY

**Test Scope:** Full reading module testing covering:
- ✅ 70 reading passages (A1-C2 CEFR levels)
- ✅ 420 exercises (4 types: Multiple Choice, True/False, Fill Blank, Sequencing)
- ✅ 5 API endpoints (passages, submit, progress, vocabulary)
- ✅ 9 React components (PassageDisplay, 4 exercise types, ProgressDashboard)
- ✅ Interactive vocabulary with popup definitions
- ✅ SRS (SuperMemo-2) integration for vocabulary tracking

**Total Test Cases:** 58 tests  
**Testing Duration:** 6-8 hours (parallel execution)  
**Pass Criteria:** 0 critical bugs, <3 high severity bugs, all critical paths working

---

## 🎯 TEST OBJECTIVES

1. **Verify reading flow** from passage selection → comprehension exercises → vocabulary saving
2. **Validate exercise validation** for all 4 exercise types (including fuzzy matching)
3. **Ensure UI/UX** is smooth, responsive, and accessible across devices
4. **Test performance** meets targets (<500ms API, <3s page load)
5. **Verify security** prevents unauthorized access and validates inputs
6. **Test SRS integration** for vocabulary tracking and review scheduling

---

## 📚 WHAT WAS BUILT (FROM COMPLETION REPORTS)

### Database Components (DB Specialist):
- ✅ 4 database tables: `reading_passages`, `reading_exercises`, `user_reading_progress`, `reading_attempts`
- ✅ 70 reading passages seeded (A1: 10, A2-C2: 12 each)
- ✅ 420 exercises seeded (140 multiple choice, 140 true/false, 70 fill blank, 70 sequencing)
- ✅ 20+ performance indexes
- ✅ CHECK constraints and foreign keys
- ✅ Verified query performance: <100ms

### Backend Components (Backend Developer):
- ✅ 5 API endpoints:
  - `GET /api/reading/passages` - List with filters (CEFR, topic, pagination)
  - `GET /api/reading/passages/:id` - Single passage with exercises
  - `POST /api/reading/submit` - Exercise validation + answer submission
  - `GET /api/reading/progress` - User progress statistics
  - `POST /api/reading/vocabulary/save` - Save vocabulary word for SRS
- ✅ Exercise validation logic (all 4 types implemented):
  - Multiple Choice: exact match
  - True/False: boolean comparison
  - Fill Blank: Levenshtein distance (85% fuzzy threshold)
  - Sequencing: partial credit scoring
- ✅ SuperMemo-2 SRS algorithm for vocabulary

### Frontend Components (Frontend Developer):
- ✅ **PassageDisplay.tsx** - Responsive passage viewer with font controls, reading mode
- ✅ **InteractiveText.tsx** - Clickable word tokenizer for vocabulary lookup
- ✅ **VocabularyPopup.tsx** - Modal with definition, translation, pronunciation, "Add to SRS" button
- ✅ **Exercise Components** (4 types):
  - MultipleChoiceExercise.tsx
  - TrueFalseExercise.tsx
  - FillBlankExercise.tsx (includes fuzzy matching, word bank)
  - SequencingExercise.tsx (drag & drop with @dnd-kit)
- ✅ **FeedbackCard.tsx** - Unified feedback UI (success/error states, XP display)
- ✅ **ProgressDashboard.tsx** - Charts (Recharts), stats, achievement badges
- ✅ **ReadingModuleDemo.tsx** - Interactive demo page

### Integration Layer (Integration Specialist):
- ✅ React Query hooks (`useReadingQueries.ts`): 7 query hooks, 2 mutation hooks
- ✅ API client (`reading-api.ts`): Type-safe, error handling, retry logic
- ✅ Mock API routes for development (7 endpoints)
- ✅ 15 integration tests passing

### Critical Paths Identified:
1. **Passage Reading Flow:** Browse passages → Select passage → Read content → Click vocabulary words → Save to SRS
2. **Exercise Flow:** Start exercise → Submit answer → See feedback → Next exercise → Complete passage
3. **Progress Tracking:** View dashboard → See stats → Filter by CEFR level
4. **Vocabulary SRS:** Click word in passage → See definition → Add to SRS → Schedule review

---

## 🧪 TEST COVERAGE MATRIX

| Test Category | Test Cases | Assignee | Priority | Duration |
|---------------|------------|----------|----------|----------|
| Integration | 18 | Integration Tester | P0 | 2-3h |
| E2E | 18 | E2E Tester | P0 | 3-4h |
| Performance | 12 | Performance Tester | P1 | 2-3h |
| Security | 10 | Security Tester | P0 | 1-2h |
| **TOTAL** | **58** | **4 Testers** | - | **8-12h** |

---

## 🔗 INTEGRATION TESTS (18 Test Cases)

**Tester:** Integration Tester  
**Focus:** API endpoints + Database integration + Exercise validation logic  
**Tools:** Postman/Thunder Client, Prisma Studio, Jest

### Group 1: Passage API (5 tests)

#### TC-INT-001: Get Passages - Default List
**Endpoint:** `GET /api/reading/passages`  
**Precondition:** Database has 70 passages seeded  
**Input:** No query parameters  
**Expected:**
```json
{
  "passages": [Array of 10 passages],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 70,
    "totalPages": 7
  }
}
```
**Validation:**
- ✅ Status code: 200
- ✅ Response time: <500ms
- ✅ Default limit: 10 passages
- ✅ Each passage has: id, title, cefrLevel, topic, wordCount, estimatedReadingTimeMinutes

---

#### TC-INT-002: Get Passages - Filter by CEFR Level
**Endpoint:** `GET /api/reading/passages?cefr=B1`  
**Expected:**
- ✅ Only B1 passages returned (12 passages)
- ✅ All passages have cefrLevel = "B1"
- ✅ Pagination correct

---

#### TC-INT-003: Get Passages - Filter by Topic
**Endpoint:** `GET /api/reading/passages?topic=business`  
**Expected:**
- ✅ Only business topic passages returned
- ✅ All passages have topic = "business"

---

#### TC-INT-004: Get Passages - Pagination
**Endpoint:** `GET /api/reading/passages?page=2&limit=5`  
**Expected:**
- ✅ Returns passages 6-10
- ✅ Pagination metadata correct (page=2, limit=5, total=70, totalPages=14)
- ✅ No duplicate passages

---

#### TC-INT-005: Get Passages - Sort by Difficulty
**Endpoint:** `GET /api/reading/passages?sort=difficulty_desc`  
**Expected:**
- ✅ Passages sorted by difficulty (highest first)
- ✅ First passage has highest difficultyScore (C2 level)

---

### Group 2: Single Passage API (3 tests)

#### TC-INT-006: Get Passage by ID - With Exercises
**Endpoint:** `GET /api/reading/passages/{valid-passage-id}`  
**Expected:**
```json
{
  "passage": {
    "id": "...",
    "title": "...",
    "content": "...",
    "cefrLevel": "B1",
    "topic": "business",
    "exercises": [Array of 6 exercises]
  },
  "userProgress": null
}
```
**Validation:**
- ✅ Status: 200
- ✅ Passage content returned
- ✅ Exercises ordered by displayOrder
- ✅ Each exercise has: id, exerciseType, question, exerciseData
- ✅ Response time: <300ms

---

#### TC-INT-007: Get Passage - Invalid ID
**Endpoint:** `GET /api/reading/passages/invalid-id-12345`  
**Expected:**
- ✅ Status: 404 Not Found
- ✅ Error message: "Passage not found"

---

#### TC-INT-008: Get Passage - Premium Without Auth
**Endpoint:** `GET /api/reading/passages/{premium-passage-id}`  
**Input:** No authentication header  
**Expected:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Premium content requires authentication"

---

### Group 3: Exercise Submission (6 tests)

#### TC-INT-009: Submit Multiple Choice - Correct Answer
**Endpoint:** `POST /api/reading/submit`  
**Input:**
```json
{
  "passageId": "passage-123",
  "exerciseId": "exercise-mc-1",
  "userAnswer": { "selected_index": 2 },
  "timeSpentSeconds": 15
}
```
**Expected:**
```json
{
  "attemptId": "...",
  "isCorrect": true,
  "accuracyScore": 100,
  "correctAnswer": { "options": [...], "correct_index": 2 },
  "explanation": "..."
}
```
**Validation:**
- ✅ Status: 200
- ✅ isCorrect = true
- ✅ accuracyScore = 100
- ✅ Attempt saved to reading_attempts table
- ✅ user_reading_progress updated

---

#### TC-INT-010: Submit Multiple Choice - Wrong Answer
**Endpoint:** `POST /api/reading/submit`  
**Input:** `selected_index: 0` (wrong)  
**Expected:**
- ✅ isCorrect = false
- ✅ accuracyScore = 0
- ✅ correctAnswer revealed

---

#### TC-INT-011: Submit True/False - Correct
**Endpoint:** `POST /api/reading/submit`  
**Input:**
```json
{
  "exerciseId": "exercise-tf-1",
  "userAnswer": { "answer": true }
}
```
**Expected:**
- ✅ isCorrect = true (if statement is_true = true)
- ✅ accuracyScore = 100

---

#### TC-INT-012: Submit Fill Blank - Exact Match
**Endpoint:** `POST /api/reading/submit`  
**Input:**
```json
{
  "exerciseId": "exercise-fb-1",
  "userAnswer": { "answer": "fox" }
}
```
**Precondition:** correct_answer = "fox"  
**Expected:**
- ✅ isCorrect = true
- ✅ accuracyScore = 100

---

#### TC-INT-013: Submit Fill Blank - Fuzzy Match (85% Threshold)
**Endpoint:** `POST /api/reading/submit`  
**Input:** `{ "answer": "foxs" }` (typo)  
**Precondition:** correct_answer = "fox"  
**Expected:**
- ✅ Levenshtein distance calculated: similarity = 87.5%
- ✅ isCorrect = true (≥85% threshold)
- ✅ accuracyScore = 87-88

**Validation:** Test Levenshtein algorithm:
- "fox" vs "foxs" → 87.5% ✅
- "fox" vs "box" → 66.7% ❌ (below threshold)
- "fox" vs "fax" → 66.7% ❌

---

#### TC-INT-014: Submit Sequencing - Partial Credit
**Endpoint:** `POST /api/reading/submit`  
**Input:**
```json
{
  "exerciseId": "exercise-seq-1",
  "userAnswer": { "order": ["s1", "s3", "s2", "s4"] }
}
```
**Precondition:** correct_order = ["s1", "s2", "s3", "s4"]  
**Expected:**
- ✅ isCorrect = false (not perfect)
- ✅ accuracyScore = 50 (2/4 correct positions: s1 and s4)

**Validation:** Partial credit algorithm works

---

### Group 4: Progress API (2 tests)

#### TC-INT-015: Get User Progress
**Endpoint:** `GET /api/reading/progress`  
**Input:** `x-user-id: test-user-1` (header)  
**Precondition:** User has completed 5 passages  
**Expected:**
```json
{
  "passagesCompleted": 5,
  "accuracyByLevel": [
    { "level": "A1", "averageAccuracy": 85.5, "attempts": 2 },
    { "level": "B1", "averageAccuracy": 72.3, "attempts": 3 }
  ],
  "totalTimeSpentMinutes": 45,
  "recentAttempts": 12
}
```
**Validation:**
- ✅ Stats accurate (verify with DB queries)
- ✅ Accuracy calculations correct
- ✅ Time spent summed correctly

---

#### TC-INT-016: Get Progress - New User
**Endpoint:** `GET /api/reading/progress`  
**Precondition:** User has 0 progress entries  
**Expected:**
- ✅ passagesCompleted = 0
- ✅ accuracyByLevel = []
- ✅ totalTimeSpentMinutes = 0
- ✅ No errors, graceful handling

---

### Group 5: Vocabulary SRS API (2 tests)

#### TC-INT-017: Save Vocabulary Word
**Endpoint:** `POST /api/reading/vocabulary/save`  
**Input:**
```json
{
  "word": "comprehension",
  "passageId": "passage-123",
  "context": "Reading comprehension is important."
}
```
**Expected:**
```json
{
  "message": "Word saved successfully",
  "vocabulary": {
    "id": "...",
    "word": "comprehension",
    "nextReviewAt": "2026-02-07T...",
    "intervalDays": 1,
    "easeFactor": 2.5,
    "status": "new"
  }
}
```
**Validation:**
- ✅ Word saved to user_vocabulary table
- ✅ nextReviewAt = today + 1 day (SRS initial interval)
- ✅ easeFactor initialized to 2.5 (SM-2 default)

---

#### TC-INT-018: Save Vocabulary - Duplicate Word
**Endpoint:** `POST /api/reading/vocabulary/save`  
**Precondition:** Word "comprehension" already saved  
**Input:** Same word  
**Expected:**
- ✅ Status: 200 (not error)
- ✅ Message: "Word already in vocabulary"
- ✅ No duplicate entry created

---

## 🎭 E2E TESTS (18 Test Cases)

**Tester:** E2E Tester  
**Focus:** User flows + UI interactions + Browser testing  
**Tools:** OpenClaw browser tool, Chrome DevTools

### Group 1: Passage Reading Flow (5 tests)

#### TC-E2E-001: Browse and Select Passage (Happy Path)
**Flow:**
1. Navigate to `/reading/passages`
2. See list of passages (10 shown)
3. Filter by CEFR level: B1
4. See only B1 passages
5. Click on first passage
6. Navigate to `/reading/passages/{id}`
7. See passage content loaded

**Expected:**
- ✅ Passage list loads with skeleton → cards appear
- ✅ Filter works (B1 only)
- ✅ Click navigates to passage detail
- ✅ Passage content rendered with proper formatting
- ✅ Font size controls visible (14-24px)
- ✅ No layout shift

**Screenshot:** Capture passage detail page

---

#### TC-E2E-002: Passage Display - Font Size Controls
**Flow:**
1. Open passage detail page
2. Click "Increase font size" button (3 times)
3. Click "Decrease font size" button (2 times)
4. Toggle reading mode (fullscreen)

**Expected:**
- ✅ Font size increases: 16px → 18px → 20px → 22px
- ✅ Font size decreases: 22px → 20px → 18px
- ✅ Reading mode toggles fullscreen (exit button visible)
- ✅ Content remains readable at all sizes

---

#### TC-E2E-003: Interactive Vocabulary - Click Word
**Flow:**
1. Open passage detail page
2. Click on a word in the passage (e.g., "comprehension")
3. See VocabularyPopup open
4. Read definition, translation, pronunciation
5. Click "Add to Vocabulary" button
6. See confirmation message

**Expected:**
- ✅ Word clickable (yellow highlight on hover)
- ✅ Popup opens near clicked word (desktop) or bottom sheet (mobile)
- ✅ Definition, translation, pronunciation shown
- ✅ "Add to Vocabulary" button works
- ✅ Popup closes after save
- ✅ No duplicate saves (button disabled if already saved)

**Validation:** Check database - word added to user_vocabulary

---

#### TC-E2E-004: Vocabulary Popup - Close Behavior
**Flow:**
1. Click word to open popup
2. Click outside popup (overlay)
3. Popup closes
4. Click another word
5. New popup opens
6. Press `Escape` key
7. Popup closes

**Expected:**
- ✅ Click outside closes popup
- ✅ Escape key closes popup
- ✅ Only one popup open at a time

---

#### TC-E2E-005: Passage Loading States
**Flow:**
1. Navigate to passage detail (slow network simulation)
2. Observe loading skeleton
3. Wait for content to load

**Expected:**
- ✅ Skeleton loader appears immediately
- ✅ No layout shift when content loads
- ✅ Smooth transition

---

### Group 2: Exercise Flows (8 tests)

#### TC-E2E-006: Multiple Choice Exercise - Correct Answer
**Flow:**
1. Open passage with exercises
2. Scroll to first exercise (multiple choice)
3. Read question
4. Select option C (correct answer)
5. Click "Submit" button
6. See FeedbackCard with success state

**Expected:**
- ✅ Radio button selection works
- ✅ Submit button enabled after selection
- ✅ FeedbackCard shows:
  - ✅ Green checkmark icon
  - ✅ "Correct!" message
  - ✅ XP earned (e.g., +10 XP)
  - ✅ Explanation text
- ✅ Confetti animation plays 🎉
- ✅ "Continue" button visible

---

#### TC-E2E-007: Multiple Choice Exercise - Wrong Answer
**Flow:**
1. Select wrong option (e.g., A)
2. Submit
3. See FeedbackCard with error state

**Expected:**
- ✅ FeedbackCard shows:
  - ✅ Red X icon
  - ✅ "Incorrect" message
  - ✅ Correct answer revealed (e.g., "The correct answer is C")
  - ✅ Explanation text
- ✅ No confetti
- ✅ "Continue" button visible

---

#### TC-E2E-008: True/False Exercise
**Flow:**
1. Read statement: "Berlin is the capital of Germany."
2. Click "True" button
3. Submit
4. See feedback

**Expected:**
- ✅ True/False buttons styled clearly
- ✅ Selected button highlighted
- ✅ Correct feedback shown
- ✅ Statement highlighted (visual emphasis)

---

#### TC-E2E-009: Fill Blank Exercise - Text Input
**Flow:**
1. Read sentence: "The quick brown _____ jumped over the lazy dog."
2. Type "fox" in input field
3. Submit
4. See correct feedback

**Expected:**
- ✅ Input field accepts text
- ✅ Submit button enabled when text entered
- ✅ Fuzzy matching works (try "foxs" → still correct)
- ✅ Feedback shows accuracy score (100% or 87%)

---

#### TC-E2E-010: Fill Blank Exercise - Word Bank
**Flow:**
1. See word bank: ["fox", "cat", "dog", "bird"]
2. Click "fox" in word bank
3. Input field auto-filled with "fox"
4. Submit
5. See correct feedback

**Expected:**
- ✅ Word bank chips clickable
- ✅ Click fills input field
- ✅ Can override by typing
- ✅ Submit works

---

#### TC-E2E-011: Sequencing Exercise - Drag & Drop
**Flow:**
1. See 4 scrambled sentences
2. Drag sentence 3 to position 1
3. Drag sentence 1 to position 2
4. Submit
5. See partial credit feedback (50%)

**Expected:**
- ✅ Drag handle (grip icon) visible
- ✅ Drag & drop works (mouse)
- ✅ Touch drag works (mobile)
- ✅ Feedback shows correct order
- ✅ Partial credit displayed (e.g., "2/4 correct positions")

---

#### TC-E2E-012: Sequencing Exercise - Keyboard Navigation
**Flow:**
1. Focus on first sentence (Tab)
2. Press `Space` to select
3. Press `Arrow Down` to move
4. Press `Space` to drop
5. Submit

**Expected:**
- ✅ Keyboard navigation works
- ✅ Focus visible
- ✅ No mouse needed
- ✅ ARIA live regions announce changes

**Accessibility:** WCAG 2.1 AA compliance

---

#### TC-E2E-013: Complete All Exercises in Passage
**Flow:**
1. Complete exercise 1 (multiple choice) → Click "Continue"
2. Complete exercise 2 (true/false) → Click "Continue"
3. Complete exercise 3 (fill blank) → Click "Continue"
4. Complete exercise 4 (sequencing) → Click "Continue"
5. See passage completion screen

**Expected:**
- ✅ Progress bar updates (1/4 → 2/4 → 3/4 → 4/4)
- ✅ All exercises completed
- ✅ Completion screen shows:
  - ✅ Total accuracy (e.g., 85%)
  - ✅ Total XP earned (e.g., +40 XP)
  - ✅ Time spent (e.g., 5 minutes)
- ✅ "Back to Passages" button works

---

### Group 3: Progress Dashboard (3 tests)

#### TC-E2E-014: View Progress Dashboard
**Flow:**
1. Navigate to `/reading/dashboard`
2. See stats cards
3. See charts (bar chart, pie chart)
4. See achievement badges

**Expected:**
- ✅ 4 stat cards visible:
  - ✅ Passages completed (e.g., 5)
  - ✅ Average accuracy (e.g., 82%)
  - ✅ Total time spent (e.g., 45 min)
  - ✅ Current streak (e.g., 3 days)
- ✅ Bar chart (accuracy by CEFR level) renders
- ✅ Pie chart (attempts distribution) renders
- ✅ Charts responsive (mobile, tablet, desktop)

**Screenshot:** Capture dashboard

---

#### TC-E2E-015: Progress Dashboard - No Data
**Flow:**
1. Login as new user (0 progress)
2. Navigate to dashboard

**Expected:**
- ✅ Empty state message: "Start reading to see your progress!"
- ✅ Charts show empty state
- ✅ No errors

---

#### TC-E2E-016: Achievement Badges
**Flow:**
1. Complete 5 passages
2. Return to dashboard
3. See "First Reader" badge unlocked

**Expected:**
- ✅ Badges display correctly
- ✅ Unlocked badges highlighted (color)
- ✅ Locked badges grayed out

---

### Group 4: Error Handling (2 tests)

#### TC-E2E-017: Exercise Submission Error
**Flow:**
1. Start exercise
2. Simulate network error (DevTools → Offline)
3. Submit exercise
4. See error boundary

**Expected:**
- ✅ Error boundary catches error
- ✅ User-friendly message: "Submission failed. Please try again."
- ✅ "Retry" button appears
- ✅ Retry works when network restored
- ✅ No white screen of death

---

#### TC-E2E-018: Passage Load Error
**Flow:**
1. Navigate to invalid passage ID
2. See 404 page

**Expected:**
- ✅ 404 error page shown
- ✅ Message: "Passage not found"
- ✅ "Back to Passages" button works

---

## ⚡ PERFORMANCE TESTS (12 Test Cases)

**Tester:** Performance Tester  
**Focus:** Page load times + API response + Database queries  
**Tools:** Chrome DevTools Lighthouse, Apache Bench

### Group 1: Page Load Performance (4 tests)

#### TC-PERF-001: Passage List Page Load Time
**Page:** `/reading/passages`  
**Target:** <3 seconds (full page load)  
**Metrics:**
- First Contentful Paint (FCP): <1s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Cumulative Layout Shift (CLS): <0.1

**Tool:** Lighthouse (Chrome DevTools)  
**Pass Criteria:** All metrics within targets

---

#### TC-PERF-002: Passage Detail Page Load Time
**Page:** `/reading/passages/{id}`  
**Target:** <3 seconds  
**Metrics:** Same as TC-PERF-001

**Validation:** Passage content + exercises load quickly

---

#### TC-PERF-003: Progress Dashboard Load Time
**Page:** `/reading/dashboard`  
**Target:** <2.5 seconds  
**Metrics:**
- FCP: <0.8s
- LCP: <2s
- Charts render: <1s

**Validation:** Recharts render without blocking

---

#### TC-PERF-004: Exercise Animations Frame Rate
**Action:** Submit 10 exercises rapidly  
**Target:** 60fps (16.67ms per frame)  
**Tool:** Chrome DevTools Performance → Frames  
**Pass Criteria:**
- ✅ No dropped frames during confetti animation
- ✅ Average frame time <17ms
- ✅ FeedbackCard entrance animation smooth

---

### Group 2: API Response Time (5 tests)

#### TC-PERF-005: GET /api/reading/passages Response Time
**Load:** 100 sequential requests  
**Target:** <500ms average, <800ms p95  
**Tool:** Apache Bench
```bash
ab -n 100 -c 1 http://localhost:3000/api/reading/passages
```
**Pass Criteria:**
- ✅ Average: <500ms
- ✅ 95th percentile: <800ms
- ✅ 0 failed requests

---

#### TC-PERF-006: GET /api/reading/passages/:id Response Time
**Load:** 100 requests (single passage)  
**Target:** <300ms average  
**Pass Criteria:**
- ✅ Average: <300ms
- ✅ Includes passage + exercises (6 exercises)
- ✅ Database query optimized (uses indexes)

---

#### TC-PERF-007: POST /api/reading/submit Response Time
**Load:** 100 submissions (multiple choice)  
**Target:** <400ms average  
**Validation:**
- ✅ Validation logic fast
- ✅ Database write fast
- ✅ Progress update non-blocking

---

#### TC-PERF-008: GET /api/reading/progress Response Time
**Load:** 50 requests  
**Target:** <600ms average  
**Validation:**
- ✅ Aggregation queries optimized
- ✅ Indexes used (user_id, created_at)

---

#### TC-PERF-009: POST /api/reading/vocabulary/save Response Time
**Load:** 50 requests  
**Target:** <500ms average  
**Validation:**
- ✅ Dictionary lookup fast (or cached)
- ✅ Duplicate check fast

---

### Group 3: Load Testing (3 tests)

#### TC-PERF-010: Concurrent Users - Exercise Submission
**Load:** 50 concurrent users submitting exercises  
**Duration:** 60 seconds  
**Tool:** k6
```javascript
import http from 'k6/http';
export let options = {
  vus: 50,
  duration: '60s',
};
export default function() {
  http.post('http://localhost:3000/api/reading/submit', JSON.stringify({
    passageId: 'passage-123',
    exerciseId: 'exercise-1',
    userAnswer: { selected_index: 2 },
    timeSpentSeconds: 15
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```
**Target:**
- ✅ 0 failed requests
- ✅ Average latency: <800ms
- ✅ p95 latency: <1.5s
- ✅ Server CPU: <80%

---

#### TC-PERF-011: Database Query Performance
**Action:** Run slow query detection  
**Tool:** PostgreSQL EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE
SELECT p.*, COUNT(e.id) as exercise_count
FROM reading_passages p
LEFT JOIN reading_exercises e ON p.id = e.passage_id
WHERE p.cefr_level = 'B1'
GROUP BY p.id
LIMIT 10;
```
**Target:** <100ms execution time  
**Pass Criteria:**
- ✅ Indexes used (verify in EXPLAIN output)
- ✅ No sequential scans on large tables

---

#### TC-PERF-012: Memory Leak Detection
**Action:**
1. Open passage detail page
2. Complete 50 exercises continuously
3. Monitor memory usage (Chrome DevTools Memory)

**Expected:**
- ✅ Heap size stable (~50-100MB)
- ✅ No continuous growth
- ✅ Garbage collection working

**Tool:** Chrome DevTools Memory Profiler

---

## 🔒 SECURITY TESTS (10 Test Cases)

**Tester:** Security Tester  
**Focus:** Auth + Authorization + Input validation + Vulnerabilities  
**Tools:** Postman, Browser DevTools

### Group 1: Authentication (2 tests)

#### TC-SEC-001: Unauthenticated Access - Premium Passage
**Endpoint:** `GET /api/reading/passages/{premium-id}`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Premium content requires authentication"
- ✅ No data leaked

---

#### TC-SEC-002: Unauthenticated Access - Submit Exercise
**Endpoint:** `POST /api/reading/submit`  
**Input:** No authentication  
**Expected:**
- ✅ Status: 401 Unauthorized
- ✅ Exercise not saved to database

---

### Group 2: Authorization (2 tests)

#### TC-SEC-003: Cross-User Data Access - Progress
**Scenario:** User A tries to access User B's progress  
**Endpoint:** `GET /api/reading/progress`  
**Input:** `x-user-id: user-A` (but query for user-B)  
**Expected:**
- ✅ Only User A's progress returned
- ✅ No cross-user data leakage

---

#### TC-SEC-004: Cross-User Exercise Submission
**Scenario:** User A tries to submit exercise for User B  
**Expected:**
- ✅ Status: 403 or 404
- ✅ User B's progress unchanged

---

### Group 3: Input Validation (3 tests)

#### TC-SEC-005: SQL Injection - Passage ID
**Endpoint:** `GET /api/reading/passages/:id`  
**Input:** `id = "'; DROP TABLE reading_passages; --"`  
**Expected:**
- ✅ Validation fails
- ✅ Status: 400 Bad Request
- ✅ Database unaffected (Prisma parameterized queries)

---

#### TC-SEC-006: XSS Attack - Exercise Submission
**Endpoint:** `POST /api/reading/submit`  
**Input:**
```json
{
  "userAnswer": { "answer": "<script>alert('XSS')</script>" }
}
```
**Expected:**
- ✅ Input sanitized
- ✅ Script not executed
- ✅ Stored safely in database

---

#### TC-SEC-007: Invalid Exercise Type
**Endpoint:** `POST /api/reading/submit`  
**Input:** exerciseId for non-existent exercise  
**Expected:**
- ✅ Status: 404 Not Found
- ✅ Error: "Exercise not found"

---

### Group 4: Data Security (3 tests)

#### TC-SEC-008: Sensitive Data Exposure in Logs
**Action:** Trigger errors and check server logs  
**Validation:**
- ✅ No user emails in logs
- ✅ No API keys in logs
- ✅ Stack traces not exposed to client

---

#### TC-SEC-009: HTTPS Enforcement (Production Check)
**Note:** For production deployment  
**Validation:**
- ✅ All API calls use HTTPS
- ✅ HTTP redirects to HTTPS

---

#### TC-SEC-010: Rate Limiting (Optional - Phase 2)
**Endpoint:** `POST /api/reading/submit`  
**Action:** Send 1000 requests in 10 seconds  
**Expected (if implemented):**
- ✅ Rate limit triggered
- ✅ Status: 429 Too Many Requests

---

## ✅ PASS CRITERIA

### Critical (Must Meet All):
- [ ] **0 critical bugs** (blocking production deployment)
- [ ] **All critical paths working:**
  - [ ] Passage list loads correctly
  - [ ] Passage detail displays with exercises
  - [ ] All 4 exercise types work (multiple choice, true/false, fill blank, sequencing)
  - [ ] Exercise validation correct (including fuzzy matching)
  - [ ] Interactive vocabulary popup works
  - [ ] Vocabulary save to SRS works
  - [ ] Progress dashboard displays stats
- [ ] **Performance targets met:**
  - [ ] API response: <500ms average
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
- [ ] **Fuzzy matching works** (85% threshold)
- [ ] **Partial credit scoring works** (sequencing exercise)

### Medium Priority (Nice to Have):
- [ ] **<10 medium/low bugs**
- [ ] **Test coverage ≥90%**
- [ ] **No console errors**
- [ ] **Accessibility WCAG 2.1 AA**
- [ ] **Drag & drop keyboard accessible**

---

## 🚫 FAIL CRITERIA (ANY triggers rejection)

- ❌ **>=1 critical bug** (data loss, crash, security breach)
- ❌ **>=3 high severity bugs** (broken features, poor UX)
- ❌ **Critical path broken** (can't complete exercise flow)
- ❌ **Performance fails targets** (>5s page load, >1s API)
- ❌ **Security vulnerability found** (SQL injection, XSS works)
- ❌ **Fuzzy matching broken** (Levenshtein algorithm fails)
- ❌ **Exercise validation incorrect** (wrong answers marked correct)

---

## 🛠️ TEST ENVIRONMENT

### Server:
- **URL:** http://localhost:3000
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (dmf_learning_db)
- **Port:** 3000

### Browser:
- **Primary:** Chrome 120+
- **Secondary:** Safari 17+, Firefox 121+
- **Mobile:** iPhone 14 Pro, iPad Air (responsive mode)

### Test Data:
- **Passages:** 70 passages (A1: 10, A2-C2: 12 each)
- **Exercises:** 420 exercises (6 per passage average)
- **Users:** 5 test users with varied progress
  - User 1: 0 progress (new user)
  - User 2: 5 passages completed (B1 level)
  - User 3: 15 passages completed (mixed levels)
  - User 4: 3-day streak
  - User 5: Premium user (access to all passages)

---

## 📊 TEST EXECUTION PLAN

### Phase 1: Test Planning (CURRENT)
- ✅ Read all documentation
- ✅ Create test plan
- ✅ Define success criteria
- ⏳ **Next:** Spawn 4 testers

### Phase 2: Parallel Testing (6-8 hours)
- **Integration Tester:** Tests 1-18 (TC-INT-001 to TC-INT-018)
- **E2E Tester:** Tests 19-36 (TC-E2E-001 to TC-E2E-018)
- **Performance Tester:** Tests 37-48 (TC-PERF-001 to TC-PERF-012)
- **Security Tester:** Tests 49-58 (TC-SEC-001 to TC-SEC-010)

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
   - `.testing/integration-results-reading.md`
   - API test results (18 tests)
   - Database validation screenshots

2. **E2E Tester:**
   - `.testing/e2e-results-reading.md`
   - UI flow screenshots
   - Browser compatibility matrix

3. **Performance Tester:**
   - `.testing/performance-results-reading.md`
   - Lighthouse reports
   - Load test graphs

4. **Security Tester:**
   - `.testing/security-results-reading.md`
   - Vulnerability scan results
   - Security score

**Final Deliverables:**
- `.testing/TEST_SUMMARY_reading.md` (aggregated results)
- `.testing/BUG_REPORT_reading.md` (if bugs found)
- `.testing/CERTIFICATION_reading.md` (final decision)

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | ≥95% | (Passed tests / Total tests) × 100 |
| Critical Bugs | 0 | Count of P0 bugs |
| High Bugs | <3 | Count of P1 bugs |
| API Response Time | <500ms avg | From performance tests |
| Page Load Time | <3s | Lighthouse LCP metric |
| Fuzzy Match Accuracy | 100% | Levenshtein algorithm test cases |
| Partial Credit Accuracy | 100% | Sequencing test cases |
| Security Score | A+ | No vulnerabilities found |

---

## 📋 REPORTING FORMAT

### Progress Reports (Every 1 Hour):
```
🧪 Test Progress Update

Integration: [X/18] tests complete, [Y] bugs found
E2E: [X/18] tests complete, [Y] bugs found
Performance: [X/12] tests complete, [Y] issues
Security: [X/10] tests complete, [Y] vulnerabilities

Total Progress: [X/58] tests (Y% complete)
Overall Status: [ON_TRACK | DELAYED | BLOCKED]
```

### Final Report:
```
🎉 Testing Complete!

Total Tests: 58/58 (100%)
Pass Rate: X%
Bugs Found: Critical (X), High (X), Medium (X), Low (X)
Performance: [PASS/FAIL]
Security: [PASS/FAIL]

Decision: [✅ CERTIFIED | ❌ REJECTED]
```

---

## 🔗 REFERENCES

**Read by Testers:**
- `.testing/TEST_PLAN_reading.md` (this file)
- `.execution/tasks-reading/COMPLETION_REPORT_frontend-reading.md` (frontend components)
- `.execution/tasks-reading/DB-SPECIALIST-COMPLETE.md` (database schema + seed data)
- `.execution/tasks-reading/backend-reading.md` (API endpoints + validation logic)
- `.execution/tasks-reading/integration-complete.md` (React Query hooks + API client)

**Testing Standards:**
- WCAG 2.1 AA (accessibility)
- OWASP Top 10 (security)

---

**Test Plan Status:** ✅ READY FOR EXECUTION  
**Created by:** Test Lead Agent  
**Date:** 2026-02-06  
**Next Step:** Report to agent:main:main with test count

---

**Total Test Cases:** 58 tests  
**Total Estimated Duration:** 8-12 hours (parallel execution)  
**Expected Completion:** 2026-02-07 EOD  
**Risk:** LOW (all dependencies ready, clear test cases)
