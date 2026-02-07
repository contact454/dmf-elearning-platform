# TEST PLAN: DMF Listening Module Phase 1

**Date:** 2026-02-06  
**Test Lead:** Test Lead Agent (Subagent)  
**Module:** Listening Comprehension (Audio + 4 Exercise Types + SRS)  
**Test Environment:** localhost:3000 (Development)  
**Database:** PostgreSQL (70 listening exercises)

---

## 📋 EXECUTIVE SUMMARY

**Test Scope:** Full listening module testing covering:
- ✅ Audio playback infrastructure (Howler.js + Cloudflare R2)
- ✅ 4 exercise types (Dictation, Multiple Choice, Audio-Image, Fill-in-the-Blank)
- ✅ SRS algorithm (SM-2 for listening progress)
- ✅ Progress tracking and streak integration
- ✅ Feedback system with XP calculation
- ✅ Performance (API response, audio loading, rendering)
- ✅ Security (auth, input validation, R2 access)

**Total Test Cases:** 52 tests  
**Testing Duration:** 6-8 hours (parallel execution)  
**Pass Criteria:** 0 critical bugs, <3 high severity bugs, all 4 exercise types working

---

## 🎯 TEST OBJECTIVES

1. **Verify audio playback** works cross-browser with proper controls
2. **Validate 4 exercise types** deliver correct learning experience
3. **Ensure SRS algorithm** calculates listening progress accurately
4. **Test feedback system** provides clear correct/incorrect visual cues
5. **Verify performance** meets targets (<100ms API, <2s audio load)
6. **Validate security** prevents unauthorized access and validates inputs

---

## 📚 WHAT WAS BUILT (FROM SPEC DOCUMENTS)

### Backend Components:
- ✅ Database schema (listening_exercises, user_listening_progress, listening_attempts)
- ✅ Cloudflare R2 audio storage (70 MP3 files, 96kbps mono)
- ✅ API Endpoints:
  - `GET /api/listening/exercises` - Fetch exercises by difficulty/type
  - `POST /api/listening/submit` - Submit answer and get feedback
  - `GET /api/listening/stats` - User listening statistics
  - `GET /api/listening/metadata/:exerciseId` - Exercise metadata
- ✅ SRS algorithm for listening (quality rating 0-5, SM-2 based)
- ✅ Answer checking logic (fuzzy matching for dictation)
- ✅ Streak integration (reuse from vocabulary module)

### Frontend Components:
- ✅ AudioPlayer component (Howler.js, playback controls, speed: 0.75x/1x/1.25x)
- ✅ 4 Exercise type components:
  - DictationExercise (type what you hear)
  - MultipleChoiceExercise (select correct answer)
  - AudioImageMatchingExercise (match audio to images)
  - FillInTheBlankExercise (complete transcript gaps)
- ✅ FeedbackCard component (correct/incorrect states, XP display)
- ✅ SessionProgress component (X/Y exercises tracker)
- ✅ OverallProgress component (dashboard widget)
- ✅ Keyboard shortcuts (Space = play/pause, R = replay, 1-4 = rate)

### Critical Paths Identified:
1. **Exercise Flow:** Fetch exercises → Audio playback → Answer submission → Feedback → Next exercise
2. **Audio Playback:** Click play → Load from R2 → Howler.js playback → Speed controls
3. **Progress Tracking:** Submit answer → Calculate quality rating → Update SRS → Increment streak
4. **Feedback System:** Check answer → Calculate accuracy → Award XP → Show feedback card

---

## 🧪 TEST COVERAGE MATRIX

| Test Category | Test Cases | Assignee | Priority | Duration |
|---------------|------------|----------|----------|----------|
| Integration | 18 | Integration Tester | P0 | 2-3h |
| E2E | 16 | E2E Tester | P0 | 3-4h |
| Performance | 10 | Performance Tester | P1 | 1-2h |
| Security | 8 | Security Tester | P0 | 1-2h |
| **TOTAL** | **52** | **4 Testers** | - | **7-11h** |

---

## 🔗 INTEGRATION TESTS (18 Test Cases)

**Tester:** Integration Tester  
**Focus:** API endpoints + Database integration + SRS algorithm + Answer checking  
**Tools:** Postman/Thunder Client, Prisma Studio, Jest

### Group 1: Exercise Fetch API (4 tests)

#### TC-INT-001: Get Exercises - By Difficulty
**Endpoint:** `GET /api/listening/exercises?difficulty=3&limit=10`  
**Precondition:** Database has 70 seeded exercises  
**Expected:**
```json
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
  "total": 10
}
```
**Validation:**
- ✅ Status code: 200
- ✅ Response time: <100ms
- ✅ Only exercises with difficulty=3 returned
- ✅ Max 10 exercises (limit enforced)
- ✅ No transcript or answers exposed (security)

---

#### TC-INT-002: Get Exercises - By Type
**Endpoint:** `GET /api/listening/exercises?type=multiple_choice&limit=5`  
**Expected:**
- ✅ Only multiple_choice exercises returned
- ✅ exercise_data contains question and options
- ✅ correct_index NOT included in response
- ✅ Total count accurate

---

#### TC-INT-003: Get Exercises - Invalid Type
**Endpoint:** `GET /api/listening/exercises?type=invalid_type`  
**Expected:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Invalid exercise type"
- ✅ Zod validation triggered

---

#### TC-INT-004: Get Exercises - Unauthorized
**Endpoint:** `GET /api/listening/exercises`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 401 Unauthorized
- ✅ Error: "Unauthorized"

---

### Group 2: Answer Submission API (8 tests)

#### TC-INT-005: Submit Dictation - Perfect Match
**Endpoint:** `POST /api/listening/submit`  
**Input:**
```json
{
  "exercise_id": "dictation-ex-001",
  "user_answer": { "text": "Hello, how are you?" },
  "time_spent_seconds": 10
}
```
**Precondition:** Exercise transcript = "Hello, how are you?"  
**Expected:**
```json
{
  "correct": true,
  "accuracy_score": 100,
  "feedback": "Perfect! You got it right on the first try!",
  "xp_earned": 10,
  "next_review_at": "2026-02-07T00:00:00.000Z",
  "quality_rating": 5
}
```
**Validation:**
- ✅ correct = true
- ✅ accuracy_score = 100
- ✅ XP = 10 (first attempt perfect)
- ✅ Database updated (listening_attempts + user_listening_progress)
- ✅ Response time: <50ms

---

#### TC-INT-006: Submit Dictation - Fuzzy Match (Typo)
**Input:**
```json
{
  "exercise_id": "dictation-ex-001",
  "user_answer": { "text": "Hello, how are yu?" }
}
```
**Expected (fuzzy matching logic):**
- ✅ correct = true (90% similarity, above 30% threshold)
- ✅ accuracy_score = 90
- ✅ XP = 8 (partial credit)
- ✅ Feedback mentions minor typo

---

#### TC-INT-007: Submit Dictation - Completely Wrong
**Input:**
```json
{
  "exercise_id": "dictation-ex-001",
  "user_answer": { "text": "Goodbye, see you later" }
}
```
**Expected:**
- ✅ correct = false
- ✅ accuracy_score = 0
- ✅ XP = 0
- ✅ expected_answer included in response
- ✅ quality_rating = 0 (SM-2 fail)

---

#### TC-INT-008: Submit Multiple Choice - Correct Answer
**Input:**
```json
{
  "exercise_id": "mc-ex-001",
  "user_answer": { "selected_index": 2 },
  "time_spent_seconds": 5
}
```
**Precondition:** Exercise correct_index = 2  
**Expected:**
- ✅ correct = true
- ✅ accuracy_score = 100
- ✅ XP = 10
- ✅ Feedback: "Excellent!"

---

#### TC-INT-009: Submit Multiple Choice - Wrong Answer
**Input:**
```json
{
  "exercise_id": "mc-ex-001",
  "user_answer": { "selected_index": 1 }
}
```
**Expected:**
- ✅ correct = false
- ✅ accuracy_score = 0
- ✅ expected_answer shows correct option
- ✅ quality_rating = 0

---

#### TC-INT-010: Submit Audio-Image Matching - Correct
**Input:**
```json
{
  "exercise_id": "audio-img-ex-001",
  "user_answer": { "selected_image_id": "img-003" }
}
```
**Precondition:** Image img-003 has is_correct = true  
**Expected:**
- ✅ correct = true
- ✅ accuracy_score = 100
- ✅ XP = 10

---

#### TC-INT-011: Submit Fill-in-the-Blank - All Correct
**Input:**
```json
{
  "exercise_id": "fill-blank-ex-001",
  "user_answer": {
    "answers": { "blank-1": "how", "blank-2": "are" }
  }
}
```
**Precondition:** Correct answers: blank-1="how", blank-2="are"  
**Expected:**
- ✅ correct = true
- ✅ accuracy_score = 100
- ✅ XP = 10

---

#### TC-INT-012: Submit Fill-in-the-Blank - Partial Correct
**Input:**
```json
{
  "exercise_id": "fill-blank-ex-001",
  "user_answer": {
    "answers": { "blank-1": "how", "blank-2": "is" }
  }
}
```
**Expected:**
- ✅ correct = false
- ✅ accuracy_score = 50 (1 out of 2 correct)
- ✅ XP = 5 (partial credit)
- ✅ Feedback shows which blanks were wrong

---

### Group 3: SRS Algorithm Validation (3 tests)

#### TC-INT-013: Quality Rating Calculation - Perfect (First Attempt)
**Scenario:** User answers dictation perfectly on first try  
**Input:**
- correct = true
- accuracy_score = 100
- total_attempts = 1
**Expected:**
- ✅ quality_rating = 5 (SM-2 "Perfect")
- ✅ interval_days = 1 (first review)
- ✅ ease_factor = 2.5 (initial)
- ✅ next_review_at = tomorrow

**Code Check:** Verify `calculateQualityRating()` function logic

---

#### TC-INT-014: Quality Rating - Good (Second Attempt)
**Scenario:** User answers correctly on second try  
**Input:**
- correct = true
- accuracy_score = 100
- total_attempts = 2
**Expected:**
- ✅ quality_rating = 4 (SM-2 "Excellent")
- ✅ XP = 7 (second attempt penalty)

---

#### TC-INT-015: SRS Interval Progression
**Scenario:** User reviews same exercise multiple times  
**Test Steps:**
1. First review (quality=5): interval = 1 day
2. Second review (quality=5): interval = 6 days
3. Third review (quality=5): interval = 6 × 2.5 = 15 days

**Expected:**
- ✅ Intervals increase following SM-2 formula
- ✅ ease_factor updates correctly
- ✅ Database records all attempts in listening_attempts table

---

### Group 4: Statistics API (3 tests)

#### TC-INT-016: Get User Stats - Active User
**Endpoint:** `GET /api/listening/stats`  
**Headers:** `x-user-id: test-user-1`  
**Precondition:** User has completed 25 exercises  
**Expected:**
```json
{
  "total_exercises_completed": 25,
  "total_listening_time_seconds": 450,
  "average_accuracy": 87.5,
  "current_streak": 3,
  "longest_streak": 7,
  "exercises_by_difficulty": [
    { "difficulty": 1, "count": 5 },
    { "difficulty": 2, "count": 8 },
    { "difficulty": 3, "count": 12 }
  ],
  "weekly_stats": {
    "exercises": 10,
    "time_seconds": 180,
    "accuracy": 89.2
  }
}
```
**Validation:**
- ✅ Counts accurate (verify with DB query)
- ✅ Accuracy = total_accuracy / total_exercises
- ✅ Streak integrated from vocabulary module
- ✅ Response time: <200ms

---

#### TC-INT-017: Get User Stats - New User
**Endpoint:** `GET /api/listening/stats`  
**Precondition:** User has 0 completed exercises  
**Expected:**
- ✅ total_exercises_completed = 0
- ✅ average_accuracy = 0 (not NaN)
- ✅ current_streak = 0
- ✅ exercises_by_difficulty = empty array

---

#### TC-INT-018: Get Exercise Metadata
**Endpoint:** `GET /api/listening/metadata/exercise-123`  
**Expected:**
```json
{
  "id": "exercise-123",
  "title": "Basic Greeting",
  "difficulty": 3,
  "duration_seconds": 5,
  "exercise_type": "dictation"
}
```
**Validation:**
- ✅ No transcript or answers exposed
- ✅ Status: 200
- ✅ 404 if exercise not found

---

## 🎭 E2E TESTS (16 Test Cases)

**Tester:** E2E Tester  
**Focus:** User flows + UI interactions + Audio playback + 4 exercise types  
**Tools:** OpenClaw browser tool, Chrome DevTools

### Group 1: Audio Player (4 tests)

#### TC-E2E-001: Audio Playback - Basic Controls
**Flow:**
1. Navigate to `http://localhost:3000/listening/practice`
2. Start exercise with audio
3. Click **Play** button
4. Observe audio plays (waveform/progress bar moves)
5. Click **Pause** button
6. Audio stops
7. Click **Replay** button
8. Audio restarts from beginning

**Expected:**
- ✅ Play/Pause/Replay buttons work
- ✅ Audio loads from R2 URL (check Network tab)
- ✅ Progress bar updates in real-time
- ✅ Time display shows current/total time (e.g., "00:03 / 00:08")
- ✅ No console errors

**Screenshot:** Capture audio player UI

---

#### TC-E2E-002: Audio Speed Controls
**Flow:**
1. Start audio playback
2. Click **0.75x** speed button
3. Verify audio plays slower
4. Click **1.25x** speed button
5. Verify audio plays faster
6. Click **1x** button (default)

**Expected:**
- ✅ Speed changes audibly
- ✅ Active speed button highlighted
- ✅ Progress bar still accurate
- ✅ Playback smooth at all speeds

---

#### TC-E2E-003: Audio Keyboard Shortcuts
**Flow:**
1. Start exercise
2. Press **Space** key → Audio plays/pauses
3. Press **R** key → Audio replays
4. Press **1** → Speed 0.75x
5. Press **2** → Speed 1x
6. Press **3** → Speed 1.25x

**Expected:**
- ✅ All keyboard shortcuts work
- ✅ No mouse needed
- ✅ Focus visible on controls
- ✅ Accessibility WCAG 2.1 AA compliant

---

#### TC-E2E-004: Audio Loading States
**Flow:**
1. Start exercise
2. Observe loading spinner while audio loads
3. Audio plays after load complete

**Expected:**
- ✅ Loading spinner appears immediately
- ✅ Play button disabled while loading
- ✅ No layout shift when audio ready
- ✅ Load time <2s (on 4G network simulation)

**Performance:** Measure with Chrome DevTools Network throttling

---

### Group 2: Dictation Exercise (3 tests)

#### TC-E2E-005: Dictation - Correct Answer Flow
**Flow:**
1. Navigate to dictation exercise
2. Click Play → Listen to audio
3. Type correct answer in text input
4. Click Submit
5. See success feedback card
6. Observe XP animation (+10)
7. Click Continue → Next exercise

**Expected:**
- ✅ Green feedback card appears
- ✅ Checkmark icon shown
- ✅ XP earned displayed with animation
- ✅ "Perfect!" message
- ✅ Continue button enabled

**Screenshot:** Capture success feedback card

---

#### TC-E2E-006: Dictation - Incorrect Answer Flow
**Flow:**
1. Start dictation exercise
2. Type wrong answer
3. Submit
4. See error feedback card
5. Observe "Try again" message
6. See expected vs actual answer comparison

**Expected:**
- ✅ Red feedback card appears
- ✅ X icon shown
- ✅ XP = 0
- ✅ Expected answer displayed
- ✅ User answer shown for comparison
- ✅ Retry button available

---

#### TC-E2E-007: Dictation - Character Count & Validation
**Flow:**
1. Start dictation exercise
2. Observe character count (0/100)
3. Type answer → Count updates
4. Try to submit empty input

**Expected:**
- ✅ Submit button disabled when empty
- ✅ Character count accurate
- ✅ Enter key to submit (if not empty)
- ✅ Autofocus on text input

---

### Group 3: Multiple Choice Exercise (2 tests)

#### TC-E2E-008: Multiple Choice - Selection & Submit
**Flow:**
1. Start multiple choice exercise
2. Listen to audio
3. Read 4 options (A, B, C, D)
4. Click option C
5. Observe selection highlight
6. Click Submit
7. See feedback (correct/incorrect)

**Expected:**
- ✅ Selected option highlighted (border/background)
- ✅ Only one option selectable
- ✅ Submit button enabled after selection
- ✅ Feedback shows correct answer if wrong

---

#### TC-E2E-009: Multiple Choice - Keyboard Shortcuts
**Flow:**
1. Start exercise
2. Press **1** key → Option A selected
3. Press **2** key → Option B selected
4. Press **3** key → Option C selected
5. Press **4** key → Option D selected
6. Press **Enter** → Submit

**Expected:**
- ✅ Number keys select options
- ✅ Visual feedback on selection
- ✅ Enter key submits answer

---

### Group 4: Audio-Image Matching (2 tests)

#### TC-E2E-010: Audio-Image - Image Selection
**Flow:**
1. Start audio-image exercise
2. Listen to audio
3. See 4 images in grid layout
4. Click image 2
5. Observe selection (border highlight)
6. Submit answer
7. See feedback

**Expected:**
- ✅ Images load properly (Next.js Image component)
- ✅ Grid responsive (2 columns mobile, 3-4 desktop)
- ✅ Selected image has visual highlight
- ✅ Alt text provided (accessibility)
- ✅ Images optimized (not huge file sizes)

**Screenshot:** Capture image grid layout

---

#### TC-E2E-011: Audio-Image - Correct Answer Feedback
**Precondition:** Select correct image  
**Expected:**
- ✅ Green border around correct image
- ✅ Success feedback card
- ✅ XP earned displayed
- ✅ "Great job!" message

---

### Group 5: Fill-in-the-Blank Exercise (2 tests)

#### TC-E2E-012: Fill-in-the-Blank - Dropdown Selection
**Flow:**
1. Start fill-blank exercise
2. See transcript with blanks: "Hello, _____ are you?"
3. Click first blank dropdown
4. Select "how" from options
5. Click second blank (if multiple)
6. Select answer
7. Submit

**Expected:**
- ✅ Dropdowns inline with transcript
- ✅ Options clearly visible
- ✅ Submit disabled until all blanks filled
- ✅ Selected values persist

---

#### TC-E2E-013: Fill-in-the-Blank - Partial Credit Feedback
**Flow:**
1. Start exercise with 2 blanks
2. Fill blank-1 correctly, blank-2 incorrectly
3. Submit
4. See partial credit feedback

**Expected:**
- ✅ Feedback shows which blanks correct (✅) and wrong (❌)
- ✅ Partial XP awarded (e.g., 5 XP for 1/2 correct)
- ✅ Expected answers shown for incorrect blanks
- ✅ accuracy_score = 50%

---

### Group 6: Progress Tracking (3 tests)

#### TC-E2E-014: Session Progress Bar
**Flow:**
1. Start practice session with 10 exercises
2. Complete exercise 1 → Progress bar shows 1/10
3. Complete exercise 2 → Progress bar shows 2/10
4. Continue until 10/10
5. See completion screen

**Expected:**
- ✅ Progress bar updates after each submission
- ✅ Text displays current/total (e.g., "3/10 exercises")
- ✅ Animated width transition
- ✅ Completion screen shows summary stats

---

#### TC-E2E-015: Overall Progress Dashboard Widget
**Flow:**
1. Complete 5 exercises
2. Navigate to `/dashboard`
3. See OverallProgress widget

**Expected:**
```
Listening Progress:
- Total Exercises: 5
- Average Accuracy: 85%
- Listening Time: 2m 30s
- Current Streak: 1 🔥
```
**Validation:**
- ✅ Stats accurate
- ✅ Icons displayed (Target, TrendingUp, Clock, Flame)
- ✅ Responsive layout (2x2 mobile, 1x4 desktop)

---

#### TC-E2E-016: Streak Integration (Listening Activity)
**Flow:**
1. Complete at least 1 listening exercise today
2. Navigate to dashboard
3. Check streak widget
4. Verify listening activity counts toward daily streak

**Expected:**
- ✅ Streak increments if not active today
- ✅ lastActivityDate updates to today
- ✅ Streak service reused from vocabulary module
- ✅ Both vocabulary + listening count as daily activity

---

## ⚡ PERFORMANCE TESTS (10 Test Cases)

**Tester:** Performance Tester  
**Focus:** Page load + API response + Audio loading + Rendering  
**Tools:** Chrome DevTools Lighthouse, Apache Bench / k6

### Group 1: Page Load Performance (3 tests)

#### TC-PERF-001: Listening Practice Page Load Time
**Page:** `http://localhost:3000/listening/practice`  
**Target:** <3 seconds (full page load)  
**Metrics:**
- First Contentful Paint (FCP): <1s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.1

**Tool:** Lighthouse (Chrome DevTools)  
**Pass Criteria:** All metrics within targets

---

#### TC-PERF-002: Exercise Component Render Time
**Action:** Measure time to render each exercise type  
**Target:** <100ms render time  
**Tool:** Chrome DevTools Performance profiler  
**Pass Criteria:**
- ✅ DictationExercise: <50ms
- ✅ MultipleChoiceExercise: <50ms
- ✅ AudioImageMatchingExercise: <100ms (image loading)
- ✅ FillInTheBlankExercise: <50ms

---

#### TC-PERF-003: Audio Player Component Animation Frame Rate
**Action:** Play/pause/replay 20 times rapidly  
**Target:** 60fps (16.67ms per frame)  
**Tool:** Chrome DevTools Performance → Frames  
**Pass Criteria:**
- ✅ No dropped frames
- ✅ Average frame time <17ms
- ✅ Progress bar animation smooth

---

### Group 2: API Response Time (4 tests)

#### TC-PERF-004: GET /api/listening/exercises Response Time
**Load:** 100 sequential requests  
**Target:** <100ms average, <200ms p95  
**Tool:** Apache Bench
```bash
ab -n 100 -c 1 -H "x-user-id: test-user" \
  "http://localhost:3000/api/listening/exercises?difficulty=3&limit=10"
```
**Pass Criteria:**
- ✅ Average: <100ms
- ✅ 95th percentile: <200ms
- ✅ 0 failed requests
- ✅ Database query optimized (indexes used)

---

#### TC-PERF-005: POST /api/listening/submit Response Time
**Load:** 100 submissions (sequential)  
**Target:** <50ms average  
**Tool:** k6 script
```javascript
import http from 'k6/http';
export default function() {
  http.post('http://localhost:3000/api/listening/submit', {
    exercise_id: 'ex-123',
    user_answer: { text: 'Hello' },
    time_spent_seconds: 10
  }, { headers: { 'x-user-id': 'test-user' }});
}
```
**Pass Criteria:**
- ✅ Average: <50ms
- ✅ SRS calculation efficient
- ✅ Answer checking fast (fuzzy matching <10ms)

---

#### TC-PERF-006: GET /api/listening/stats Response Time
**Load:** 100 requests  
**Target:** <200ms average  
**Validation:**
- ✅ Aggregation queries optimized
- ✅ No N+1 query problems
- ✅ Database indexes used

---

#### TC-PERF-007: Concurrent Users - Exercise Submission
**Load:** 50 concurrent users submitting answers  
**Duration:** 60 seconds  
**Tool:** k6
```javascript
import http from 'k6/http';
export let options = {
  vus: 50,
  duration: '60s',
};
export default function() {
  http.post('http://localhost:3000/api/listening/submit', ...);
}
```
**Target:**
- ✅ 0 failed requests
- ✅ Average latency: <500ms
- ✅ p95 latency: <1s
- ✅ Server CPU: <80%

---

### Group 3: Audio Loading Performance (3 tests)

#### TC-PERF-008: Audio Load Time (4G Network)
**Action:** Load 10 different audio files (MP3, 96kbps)  
**Network:** Chrome DevTools → Fast 4G throttling  
**Target:** <2s per audio file  
**Pass Criteria:**
- ✅ Average load time: <2s
- ✅ No timeouts
- ✅ Progress bar shows loading state

**Validation:** Check Network tab for:
- Audio file size: <500KB (30 seconds × 96kbps)
- Response time from R2 CDN

---

#### TC-PERF-009: Audio Caching
**Flow:**
1. Load exercise 1 with audio
2. Complete exercise
3. Go back to exercise 1
4. Observe audio load time

**Expected:**
- ✅ Second load uses browser cache
- ✅ Load time <100ms (cached)
- ✅ No duplicate R2 request (check Network tab)

---

#### TC-PERF-010: Memory Leak Detection - Audio Player
**Action:**
1. Open listening practice page
2. Complete 50 exercises continuously
3. Monitor memory usage (Chrome DevTools Memory)

**Expected:**
- ✅ Heap size stable (~50-100MB)
- ✅ No continuous memory growth
- ✅ Audio instances properly destroyed
- ✅ Howler.js cleanup working

**Tool:** Chrome DevTools Memory Profiler  
**Pass Criteria:** No memory leaks detected

---

## 🔒 SECURITY TESTS (8 Test Cases)

**Tester:** Security Tester  
**Focus:** Auth + Authorization + Input validation + R2 security  
**Tools:** Postman, Browser DevTools, Security scanners

### Group 1: Authentication (2 tests)

#### TC-SEC-001: Unauthenticated Access - Exercise Fetch
**Endpoint:** `GET /api/listening/exercises`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 401 Unauthorized
- ✅ Response: `{ "success": false, "error": "Unauthorized" }`
- ✅ No exercise data leaked

---

#### TC-SEC-002: Unauthenticated Access - Submit Answer
**Endpoint:** `POST /api/listening/submit`  
**Input:** No `x-user-id` header  
**Expected:**
- ✅ Status: 401
- ✅ Answer not saved to database
- ✅ No progress updated

---

### Group 2: Authorization (1 test)

#### TC-SEC-003: Cross-User Progress Modification
**Scenario:** User A tries to submit answer for User B's progress  
**Input:**
```json
POST /api/listening/submit
x-user-id: user-A
Body: { exercise_id: "ex-123", user_answer: {...} }
```
**Expected:**
- ✅ Only User A's progress updated
- ✅ No cross-user data leakage
- ✅ Authorization check enforced in middleware

---

### Group 3: Input Validation (3 tests)

#### TC-SEC-004: SQL Injection - Exercise ID
**Endpoint:** `POST /api/listening/submit`  
**Input:**
```json
{
  "exercise_id": "'; DROP TABLE listening_exercises; --",
  "user_answer": { "text": "test" }
}
```
**Expected:**
- ✅ Zod validation fails
- ✅ Status: 400 Bad Request
- ✅ Database unaffected (Prisma parameterized queries)
- ✅ Error: "Invalid exercise_id format"

---

#### TC-SEC-005: XSS Attack - Answer Input
**Endpoint:** `POST /api/listening/submit`  
**Input:**
```json
{
  "exercise_id": "ex-123",
  "user_answer": { "text": "<script>alert('XSS')</script>" }
}
```
**Expected:**
- ✅ Input sanitized
- ✅ Script not executed
- ✅ Answer stored safely
- ✅ Feedback card escapes HTML (no script execution)

---

#### TC-SEC-006: Answer Validation - Invalid Structure
**Endpoint:** `POST /api/listening/submit`  
**Input:**
```json
{
  "exercise_id": "dictation-ex-001",
  "user_answer": { "selected_index": 2 }
}
```
**Note:** Dictation expects `{ text: string }`, not `{ selected_index }`  
**Expected:**
- ✅ Zod validation fails
- ✅ Status: 400
- ✅ Error: "Invalid answer format for dictation exercise"

---

### Group 4: R2 Storage Security (2 tests)

#### TC-SEC-007: Direct R2 URL Access
**Action:** Access audio URL directly without authentication  
**URL:** `https://pub-XXXXX.r2.dev/a2-greeting-01.mp3`  
**Expected:**
- ✅ Audio file accessible (public read enabled)
- ✅ No authentication required for audio playback
- ✅ CORS headers correct (allow dmf-elearning.com + localhost)

**Note:** Audio files are intentionally public (read-only)

---

#### TC-SEC-008: R2 Write Protection
**Action:** Attempt to upload file to R2 bucket via public URL  
**Expected:**
- ✅ Upload rejected (write requires auth)
- ✅ Only backend with API keys can upload
- ✅ Bucket permissions configured correctly

**Validation:** Test with curl:
```bash
curl -X PUT https://pub-XXXXX.r2.dev/malicious.mp3 \
  --data-binary @malicious.mp3
# Expected: 403 Forbidden
```

---

## ✅ PASS CRITERIA

### Critical (Must Meet All):
- [ ] **0 critical bugs** (blocking production deployment)
- [ ] **All 4 exercise types working:**
  - [ ] Dictation (type input + submit)
  - [ ] Multiple Choice (select option + submit)
  - [ ] Audio-Image Matching (click image + submit)
  - [ ] Fill-in-the-Blank (fill dropdowns + submit)
- [ ] **Audio playback functional:**
  - [ ] Play/Pause/Replay controls work
  - [ ] Speed controls (0.75x, 1x, 1.25x)
  - [ ] Audio loads from R2 within 2s
- [ ] **Performance targets met:**
  - [ ] API response: <100ms average
  - [ ] Page load: <3s
  - [ ] Audio load: <2s
- [ ] **Security validated:**
  - [ ] Auth middleware enforced
  - [ ] No SQL injection vulnerabilities
  - [ ] Input validation working

### High Priority (Must Meet Most):
- [ ] **<3 high severity bugs**
- [ ] **SRS algorithm calculates correctly:**
  - [ ] Quality rating (0-5) accurate
  - [ ] Interval progression follows SM-2
  - [ ] Database updates persist
- [ ] **Feedback system clear:**
  - [ ] Correct/incorrect visual states
  - [ ] XP calculation accurate (+10, +7, +5)
  - [ ] Expected answer shown when wrong
- [ ] **Cross-browser compatibility** (Chrome, Safari, Firefox)
- [ ] **Mobile responsive** (iPhone, iPad)

### Medium Priority (Nice to Have):
- [ ] **<10 medium/low bugs**
- [ ] **Keyboard shortcuts functional** (Space, R, 1-4)
- [ ] **Accessibility WCAG 2.1 AA**
- [ ] **No console errors**
- [ ] **Streak integration working**

---

## 🚫 FAIL CRITERIA (ANY triggers rejection)

- ❌ **>=1 critical bug** (data loss, crash, security breach)
- ❌ **>=2 exercise types broken** (cannot complete flow)
- ❌ **Audio playback fails** (cannot load/play audio)
- ❌ **Performance fails targets** (>5s page load, >3s audio load)
- ❌ **Security vulnerability found** (SQL injection, XSS works)
- ❌ **SRS algorithm broken** (progress not tracked)

---

## 🛠️ TEST ENVIRONMENT

### Server:
- **URL:** http://localhost:3000
- **Backend:** Node.js + Next.js API routes
- **Database:** PostgreSQL (Supabase)
- **Storage:** Cloudflare R2 (dmf-listening-audio bucket)
- **Port:** 3000

### Browser:
- **Primary:** Chrome 120+
- **Secondary:** Safari 17+, Firefox 121+
- **Mobile:** iPhone 14 Pro, iPad Air (responsive mode)

### Test Data:
- **Exercises:** 70 seeded exercises
  - A1 (difficulty 1-2): 10 exercises
  - A2 (difficulty 3-4): 10 exercises
  - B1 (difficulty 5-6): 10 exercises
  - B2 (difficulty 7-8): 10 exercises
  - C1 (difficulty 9): 10 exercises
  - C2 (difficulty 10): 10 exercises
  - Mixed: 10 exercises
- **Exercise Types:** 
  - Dictation: 20 exercises
  - Multiple Choice: 20 exercises
  - Audio-Image: 15 exercises
  - Fill-in-the-Blank: 15 exercises
- **Audio Files:** 70 MP3s (96kbps mono, 3-30 seconds)
- **Test Users:**
  - User 1: 0 exercises completed (new user)
  - User 2: 15 exercises completed (active user)
  - User 3: 50 exercises completed (power user)
  - User 4: All exercise types tested

### Database:
- **Tables:** listening_exercises, user_listening_progress, listening_attempts
- **Seed Data:** Pre-populated with 70 exercises
- **Indexes:** Optimized for performance

---

## 📊 TEST EXECUTION PLAN

### Phase 1: Test Planning (COMPLETE)
- ✅ Read all documentation
- ✅ Create test plan (this document)
- ✅ Define success criteria
- ⏳ **Next:** Spawn 4 testers

### Phase 2: Parallel Testing (6-8 hours)
- **Integration Tester:** Tests 1-18 (TC-INT-001 to TC-INT-018)
- **E2E Tester:** Tests 19-34 (TC-E2E-001 to TC-E2E-016)
- **Performance Tester:** Tests 35-44 (TC-PERF-001 to TC-PERF-010)
- **Security Tester:** Tests 45-52 (TC-SEC-001 to TC-SEC-008)

**All testers work simultaneously**

### Phase 3: Results Collection (30 min)
- Aggregate bug reports
- Calculate pass rates
- Identify patterns

### Phase 4: Bug Fixes (if needed)
- Report to Development Team
- Re-test after fixes

### Phase 5: Certification (30 min)
- Make PASS/FAIL decision
- Create certification report
- Notify main session

---

## 📄 DELIVERABLES

Each tester will produce:

1. **Integration Tester:**
   - `.testing/integration-results-listening.md`
   - API test results (18 tests)
   - Database validation screenshots

2. **E2E Tester:**
   - `.testing/e2e-results-listening.md`
   - UI flow screenshots (4 exercise types)
   - Browser compatibility matrix

3. **Performance Tester:**
   - `.testing/performance-results-listening.md`
   - Lighthouse reports
   - Load test graphs
   - Audio loading metrics

4. **Security Tester:**
   - `.testing/security-results-listening.md`
   - Vulnerability scan results
   - R2 security validation

**Final Deliverables:**
- `.testing/TEST_SUMMARY_listening.md` (aggregated results)
- `.testing/BUG_REPORT_listening.md` (if bugs found)
- `.testing/CERTIFICATION_listening.md` (final decision)

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | ≥95% | (Passed tests / Total tests) × 100 |
| Critical Bugs | 0 | Count of P0 bugs |
| High Bugs | <3 | Count of P1 bugs |
| API Response Time | <100ms avg | From performance tests |
| Audio Load Time | <2s | From performance tests |
| Page Load Time | <3s | Lighthouse LCP metric |
| Animation Frame Rate | 60fps | Chrome DevTools Performance |
| Security Score | A+ | No vulnerabilities found |

---

## 📋 REPORTING FORMAT

### Progress Reports (Every 1 Hour):
```
🧪 Listening Module Test Progress

Integration: [X/18] tests complete, [Y] bugs found
E2E: [X/16] tests complete, [Y] bugs found
Performance: [X/10] tests complete, [Y] issues
Security: [X/8] tests complete, [Y] vulnerabilities

Total Progress: [X/52] tests (Y% complete)
Overall Status: [ON_TRACK | DELAYED | BLOCKED]
```

### Final Report:
```
🎉 Listening Module Testing Complete!

Total Tests: 52/52 (100%)
Pass Rate: X%
Bugs Found: Critical (X), High (X), Medium (X), Low (X)

Exercise Types Status:
- Dictation: [✅ PASS | ❌ FAIL]
- Multiple Choice: [✅ PASS | ❌ FAIL]
- Audio-Image: [✅ PASS | ❌ FAIL]
- Fill-in-the-Blank: [✅ PASS | ❌ FAIL]

Audio Playback: [✅ PASS | ❌ FAIL]
Performance: [✅ PASS | ❌ FAIL]
Security: [✅ PASS | ❌ FAIL]

Decision: [✅ CERTIFIED FOR PRODUCTION | ❌ REJECTED - NEEDS FIXES]
```

---

## 🔗 REFERENCES

**Read by Testers:**
- `.testing/TEST_PLAN_listening.md` (this file)
- `.execution/DEVELOPMENT_PLAN_listening_phase1.md` (feature scope)
- `.execution/TECH_SPEC_listening_phase1.md` (technical details)
- `.testing/TEST_PLAN_vocabulary.md` (reference format)

**Testing Standards:**
- WCAG 2.1 AA (accessibility)
- OWASP Top 10 (security)
- Web Performance Best Practices

---

## 📌 SPECIAL TESTING NOTES

### Audio Testing Considerations:
1. **Browser Audio Codec Support:**
   - Test MP3 playback in all browsers
   - Verify Howler.js fallback mechanisms
   - Check for audio format compatibility

2. **Network Conditions:**
   - Test with 4G throttling (audio load time)
   - Test with offline mode (error handling)
   - Test with slow 3G (loading states)

3. **Audio Quality:**
   - Verify 96kbps quality acceptable
   - Check mono vs stereo (should be mono)
   - Ensure no audio distortion at 1.25x speed

### Exercise Type Specific Notes:

**Dictation:**
- Test fuzzy matching algorithm (30% threshold)
- Verify case insensitivity (hello vs Hello)
- Test punctuation handling (hello! vs hello)

**Multiple Choice:**
- Test option randomization (if implemented)
- Verify keyboard shortcuts (1-4 keys)
- Check visual feedback on selection

**Audio-Image:**
- Test image loading performance
- Verify responsive grid layout
- Check alt text for accessibility

**Fill-in-the-Blank:**
- Test multiple blanks (2-4 blanks per exercise)
- Verify dropdown accessibility
- Check partial credit calculation

---

**Test Plan Status:** ✅ READY FOR EXECUTION  
**Created by:** Test Lead Agent (Subagent)  
**Date:** 2026-02-06  
**Next Step:** Report completion to agent:main:main

---

**Total Estimated Duration:** 7-11 hours (parallel execution)  
**Expected Completion:** 2026-02-07 EOD  
**Risk:** LOW (dependencies clear, test cases comprehensive)

**Test Coverage:** 52 test cases across:
- ✅ 18 Integration tests (API + Database + SRS)
- ✅ 16 E2E tests (UI flows + 4 exercise types)
- ✅ 10 Performance tests (Page load + API + Audio)
- ✅ 8 Security tests (Auth + Validation + R2)
