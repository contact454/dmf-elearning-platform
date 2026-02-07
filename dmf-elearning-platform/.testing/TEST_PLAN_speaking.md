# TEST PLAN: DMF Speaking Module Phase 1

**Date:** 2026-02-07  
**Test Lead:** Test Lead Agent (Subagent)  
**Module:** Speaking Practice (Audio Recording + AI Analysis + OpenAI Whisper STT + GPT-4 Feedback)  
**Test Environment:** localhost:3002 (Backend) + localhost:3000 (Frontend)  
**Database:** PostgreSQL (speaking_prompts, speaking_submissions, pronunciation_feedback)

---

## 📋 EXECUTIVE SUMMARY

**Test Scope:** Full speaking module testing covering:
- ✅ Audio recording with browser MediaRecorder API
- ✅ OpenAI Whisper STT (Speech-to-Text) for German
- ✅ GPT-4 powered speech analysis (4 dimensions)
- ✅ Pronunciation feedback with IPA notation
- ✅ Submission CRUD operations (create, read, delete)
- ✅ Speaking prompts with CEFR filtering (A1-B2)
- ✅ Progress analytics and trend tracking
- ✅ Mobile responsive layout (bottom drawer)
- ✅ Real-time waveform visualization
- ✅ Rate limiting (protect against API cost spikes)

**Total Test Cases:** 64 tests  
**Testing Duration:** 10-14 hours (parallel execution)  
**Pass Criteria:** 0 critical bugs, <3 high severity bugs, all critical paths working

---

## 🎯 TEST OBJECTIVES

1. **Verify audio recording** works across browsers (Chrome, Safari, Firefox)
2. **Validate OpenAI Whisper integration** transcribes German accurately
3. **Ensure GPT-4 analysis** provides comprehensive feedback across 4 dimensions
4. **Test submission management** ensures data integrity and ownership
5. **Verify performance** meets targets (<10s STT, <15s GPT analysis, <5s upload)
6. **Validate security** prevents unauthorized access, rate limit abuse, file upload attacks
7. **Test UI/UX** across devices (desktop, tablet, mobile)

---

## 📚 WHAT WAS BUILT (FROM COMPLETION REPORTS)

### Backend Components (Backend Developer):
- ✅ **Express service** with TypeScript (port 3002)
- ✅ **Authentication:**
  - JWT-based auth (7-day expiration, HS256)
  - bcrypt password hashing (10 salt rounds)
  - Registration/Login endpoints
- ✅ **OpenAI Integration:**
  - Whisper STT (German, verbose JSON format)
  - GPT-4 speech analysis (4 dimensions: pronunciation, fluency, vocabulary, grammar)
  - Pronunciation analysis with IPA notation
  - Rate limiting (10 req/15min per user)
- ✅ **Submission Management:**
  - CRUD operations with ownership verification
  - Status tracking (pending, analyzing, analyzed, reviewed)
  - Pagination (default 10, max 100)
- ✅ **Analytics:**
  - Aggregated statistics (total submissions, avg scores)
  - Score trends over time (30-day)
  - CEFR level distribution
  - Pronunciation weaknesses tracking
- ✅ **API Endpoints:**
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/prompts` - List speaking prompts
  - `GET /api/prompts/random?cefr=A1` - Get random prompt
  - `GET /api/prompts/:id` - Get single prompt
  - `POST /api/submissions` - Create submission
  - `GET /api/submissions` - List user submissions
  - `GET /api/submissions/:id` - Get submission with feedback
  - `DELETE /api/submissions/:id` - Delete submission
  - `POST /api/analyze/transcript` - Transcribe audio (Whisper)
  - `POST /api/analyze/speech` - Analyze speech (GPT-4)
  - `GET /api/analytics/progress` - User progress stats
  - `GET /api/analytics/weaknesses` - Pronunciation weaknesses

### Frontend Components (Frontend Developer):
- ✅ **AudioRecorder.tsx** - MediaRecorder API with waveform visualization
- ✅ **PromptDisplay.tsx** - CEFR-aligned prompt display with timers
- ✅ **FeedbackPanel.tsx** - AI feedback display (4 dimensions + strengths/weaknesses)
- ✅ **PronunciationCard.tsx** - Word-level pronunciation feedback
- ✅ **PromptSelector.tsx** - Prompt browser with CEFR/topic filters
- ✅ **SubmissionHistory.tsx** - Past submissions with playback
- ✅ **ProgressDashboard.tsx** - Analytics visualization (charts, trends)
- ✅ **MobileLayout.tsx** - Responsive layout wrapper (drawer on mobile)
- ✅ **useAudioRecorder.ts** - Custom hook for audio recording

### Critical Paths Identified:
1. **Recording Flow:** Select prompt → Prepare (timer) → Record audio → Submit → Analyze
2. **Analysis Flow:** Upload audio → Whisper STT → GPT-4 analysis → Display feedback
3. **Playback Flow:** View history → Play recording → Review feedback
4. **Progress Flow:** View dashboard → See trends → Identify weaknesses

---

## 🧪 TEST COVERAGE MATRIX

| Test Category | Test Cases | Assignee | Priority | Duration |
|---------------|------------|----------|----------|----------|
| Integration | 20 | Integration Tester | P0 | 3-4h |
| E2E | 22 | E2E Tester | P0 | 4-5h |
| Performance | 12 | Performance Tester | P1 | 2-3h |
| Security | 10 | Security Tester | P0 | 2-3h |
| **TOTAL** | **64** | **4 Testers** | - | **11-15h** |

---

## 🔗 INTEGRATION TESTS (20 Test Cases)

**Tester:** Integration Tester  
**Focus:** API endpoints + Database integration + OpenAI API  
**Tools:** Postman/Thunder Client, Prisma Studio, Vitest

### Group 1: Authentication (3 tests)

#### TC-INT-001: User Registration - Happy Path
**Endpoint:** `POST /api/auth/register`  
**Precondition:** Email not already registered  
**Input:**
```json
{
  "email": "speaker@example.com",
  "password": "SecurePass123!",
  "name": "Test Speaker"
}
```
**Expected Output:**
```json
{
  "user": {
    "id": "<uuid>",
    "email": "speaker@example.com",
    "name": "Test Speaker",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Assertions:**
- ✅ Status code: 201 Created
- ✅ JWT token is valid (can decode userId)
- ✅ Password is hashed in database (bcrypt)
- ✅ User ID is UUID v4 format
**Priority:** P0

---

#### TC-INT-002: User Login - Correct Credentials
**Endpoint:** `POST /api/auth/login`  
**Precondition:** User exists with password "password123"  
**Input:**
```json
{
  "email": "speaker@example.com",
  "password": "password123"
}
```
**Expected Output:**
```json
{
  "user": {
    "id": "<uuid>",
    "email": "speaker@example.com",
    "name": "Test Speaker",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Assertions:**
- ✅ Status code: 200 OK
- ✅ JWT token contains userId claim
- ✅ Token expires in 7 days
**Priority:** P0

---

#### TC-INT-003: Invalid Credentials - Login Failure
**Endpoint:** `POST /api/auth/login`  
**Input:**
```json
{
  "email": "speaker@example.com",
  "password": "wrongpassword"
}
```
**Expected Output:**
```json
{
  "error": "Invalid credentials"
}
```
**Assertions:**
- ✅ Status code: 401 Unauthorized
- ✅ No token returned
**Priority:** P0

---

### Group 2: Speaking Prompts (4 tests)

#### TC-INT-004: List Prompts - All Levels
**Endpoint:** `GET /api/prompts`  
**Expected:**
- ✅ Returns all prompts (no filter)
- ✅ Each prompt has: id, cefrLevel, topic, title, description, questionText, preparationTimeSeconds, speakingTimeSeconds
- ✅ Sorted by cefrLevel ASC
- ✅ Pagination metadata included
**Priority:** P1

---

#### TC-INT-005: List Prompts - CEFR Filter
**Endpoint:** `GET /api/prompts?cefr=A1`  
**Expected:**
- ✅ Only A1 prompts returned
- ✅ No A2, B1, B2 prompts
- ✅ Filter case-insensitive
**Priority:** P1

---

#### TC-INT-006: Get Random Prompt by Level
**Endpoint:** `GET /api/prompts/random?cefr=B1`  
**Expected:**
```json
{
  "id": "<uuid>",
  "cefrLevel": "B1",
  "topic": "storytelling",
  "title": "Memorable Experience",
  "questionText": "Describe a memorable experience from your past...",
  "preparationTimeSeconds": 60,
  "speakingTimeSeconds": 120,
  "difficultyLevel": 3,
  "evaluationCriteria": { ... }
}
```
**Assertions:**
- ✅ Status code: 200 OK
- ✅ cefrLevel matches filter (B1)
- ✅ Random selection (test 5 times, should vary)
**Priority:** P1

---

#### TC-INT-007: Get Single Prompt
**Endpoint:** `GET /api/prompts/:id`  
**Expected:**
- ✅ All fields present (id, cefrLevel, topic, title, description, questionText, timers, evaluationCriteria)
- ✅ evaluationCriteria is valid JSONB
- ✅ Status code: 200 OK
**Priority:** P2

---

### Group 3: Submission Management (6 tests)

#### TC-INT-008: Create Submission - Happy Path
**Endpoint:** `POST /api/submissions`  
**Precondition:** User authenticated, prompt exists  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "promptId": "<uuid-of-prompt>",
  "audioUrl": "https://example.com/audio/recording.mp3",
  "durationSeconds": 45.5
}
```
**Expected Output:**
```json
{
  "id": "<uuid>",
  "userId": "<user-uuid>",
  "promptId": "<prompt-uuid>",
  "audioUrl": "https://example.com/audio/recording.mp3",
  "durationSeconds": 45.5,
  "status": "pending",
  "submittedAt": "<timestamp>",
  "prompt": {
    "title": "Introduce Yourself",
    "cefrLevel": "A1",
    "questionText": "..."
  }
}
```
**Assertions:**
- ✅ Status code: 201 Created
- ✅ Submission ID is UUID v4
- ✅ status is "pending"
- ✅ submittedAt timestamp is present
- ✅ Prompt details included
**Priority:** P0

---

#### TC-INT-009: Create Submission - Invalid Prompt ID
**Endpoint:** `POST /api/submissions`  
**Input:**
```json
{
  "promptId": "00000000-0000-0000-0000-000000000000",
  "audioUrl": "https://example.com/audio.mp3",
  "durationSeconds": 30
}
```
**Expected:**
- ✅ Status code: 404 Not Found OR 400 Bad Request
- ✅ Error message: "Prompt not found"
**Priority:** P1

---

#### TC-INT-010: List User Submissions - Pagination
**Endpoint:** `GET /api/submissions?page=1&limit=5`  
**Precondition:** User has 12 submissions  
**Expected:**
- ✅ Returns 5 submissions (first page)
- ✅ Sorted by submittedAt DESC (newest first)
- ✅ Pagination metadata: { page: 1, limit: 5, total: 12, totalPages: 3 }
**Test Again:** `page=2` returns next 5 submissions
**Priority:** P1

---

#### TC-INT-011: Get Submission - With Feedback
**Endpoint:** `GET /api/submissions/:id`  
**Precondition:** Submission exists with status "analyzed"  
**Expected Output:**
```json
{
  "id": "<uuid>",
  "transcriptText": "Mein Name ist John...",
  "overallScore": 75.5,
  "pronunciationScore": 80,
  "fluencyScore": 70,
  "vocabularyScore": 75,
  "grammarScore": 77,
  "aiFeedback": {
    "strengths": ["Clear pronunciation", "Good vocabulary range"],
    "weaknesses": ["Some hesitation", "Grammar errors"],
    "suggestions": ["Practice past tense", "Reduce filler words"],
    "detailedFeedback": "Overall good performance..."
  },
  "pronunciationFeedback": [
    {
      "word": "spreche",
      "expectedPronunciation": "ˈʃpʁɛçə",
      "accuracyScore": 85,
      "feedbackText": "Good pronunciation of 'ch' sound"
    }
  ],
  "status": "analyzed"
}
```
**Assertions:**
- ✅ All 4 dimension scores present (0-100)
- ✅ aiFeedback is valid JSONB
- ✅ pronunciationFeedback array present
- ✅ Transcript text included
**Priority:** P0

---

#### TC-INT-012: Get Submission - Ownership Verification
**Endpoint:** `GET /api/submissions/:id`  
**Precondition:** Submission belongs to different user  
**Expected:**
- ✅ Status code: 403 Forbidden
- ✅ Error: "Not authorized to access this submission"
- ✅ No data leaked
**Priority:** P0

---

#### TC-INT-013: Delete Submission - With Cascade
**Endpoint:** `DELETE /api/submissions/:id`  
**Precondition:** Submission exists with pronunciation_feedback records  
**Expected:**
- ✅ Status code: 200 OK OR 204 No Content
- ✅ Submission deleted from database
- ✅ Related pronunciation_feedback also deleted (cascade)
- ✅ Response: { "message": "Submission deleted successfully" }
**Priority:** P1

---

### Group 4: OpenAI Integration (4 tests)

#### TC-INT-014: Whisper STT - German Audio Transcription
**Endpoint:** `POST /api/analyze/transcript`  
**Precondition:** User authenticated, valid audio file  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `Content-Type: multipart/form-data`
```
audio: <test-german-audio.mp3>
```
**Expected Output:**
```json
{
  "text": "Mein Name ist John. Ich komme aus Deutschland und ich bin dreißig Jahre alt.",
  "confidence": 0.95,
  "duration": 8.5,
  "language": "de"
}
```
**Assertions:**
- ✅ Status code: 200 OK
- ✅ Transcript text is in German
- ✅ Confidence score 0.0-1.0
- ✅ Duration matches audio file
- ✅ Processing time <10s (p95)
**Priority:** P0

---

#### TC-INT-015: Whisper STT - File Size Limit
**Endpoint:** `POST /api/analyze/transcript`  
**Input:** Audio file >10MB  
**Expected:**
- ✅ Status code: 400 Bad Request OR 413 Payload Too Large
- ✅ Error: "File size exceeds maximum of 10MB"
- ✅ No upload to OpenAI
**Priority:** P1

---

#### TC-INT-016: GPT-4 Speech Analysis - Full Feedback
**Endpoint:** `POST /api/analyze/speech`  
**Precondition:** Submission exists with transcriptText  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "submissionId": "<uuid>"
}
```
**Expected Output:**
```json
{
  "id": "<uuid>",
  "transcriptText": "...",
  "overallScore": 75.5,
  "pronunciationScore": 80,
  "fluencyScore": 70,
  "vocabularyScore": 75,
  "grammarScore": 77,
  "aiFeedback": {
    "strengths": ["Point 1", "Point 2", "Point 3"],
    "weaknesses": ["Area 1", "Area 2", "Area 3"],
    "suggestions": ["Tip 1", "Tip 2", "Tip 3"],
    "detailedFeedback": "Comprehensive feedback..."
  },
  "status": "analyzed"
}
```
**Assertions:**
- ✅ Status code: 200 OK
- ✅ All 4 scores are 0-100
- ✅ overallScore = average of 4 dimensions
- ✅ aiFeedback has all 4 fields
- ✅ strengths/weaknesses/suggestions are arrays
- ✅ Processing time <15s (p95)
**Priority:** P0

---

#### TC-INT-017: Analysis Rate Limiting
**Endpoint:** `POST /api/analyze/transcript` OR `POST /api/analyze/speech`  
**Precondition:** User has made 10 analysis requests in last 15 minutes  
**Expected:**
- ✅ Status code: 429 Too Many Requests
- ✅ Error: "Rate limit exceeded. Try again in X minutes."
- ✅ No OpenAI API call made
- ✅ Rate limit resets after 15 minutes
**Priority:** P0

---

### Group 5: Analytics (3 tests)

#### TC-INT-018: User Progress - Overall Stats
**Endpoint:** `GET /api/analytics/progress`  
**Precondition:** User has 10 submissions (5 analyzed, 5 pending)  
**Headers:** `Authorization: Bearer <token>`  
**Expected Output:**
```json
{
  "overview": {
    "totalSubmissions": 10,
    "analyzedSubmissions": 5,
    "pendingSubmissions": 5,
    "totalPracticeTimeSeconds": 450
  },
  "averageScores": {
    "overall": 72.5,
    "pronunciation": 75,
    "fluency": 68,
    "vocabulary": 73,
    "grammar": 74
  },
  "cefrDistribution": {
    "A1": 4,
    "A2": 3,
    "B1": 2,
    "B2": 1
  },
  "recentSubmissions": [ ... ],
  "scoreTrends": [
    {
      "date": "2026-02-06T00:00:00Z",
      "overallScore": 70,
      "pronunciationScore": 72,
      "fluencyScore": 65,
      "vocabularyScore": 71,
      "grammarScore": 72
    }
  ]
}
```
**Assertions:**
- ✅ totalSubmissions = 10
- ✅ averageScores calculated correctly (only from analyzed submissions)
- ✅ cefrDistribution sums to 10
- ✅ scoreTrends covers last 30 days
**Priority:** P1

---

#### TC-INT-019: Pronunciation Weaknesses
**Endpoint:** `GET /api/analytics/weaknesses?limit=20`  
**Headers:** `Authorization: Bearer <token>`  
**Expected:**
```json
[
  {
    "word": "spreche",
    "expectedPronunciation": "ˈʃpʁɛçə",
    "accuracyScore": 65,
    "feedbackText": "Practice the 'ch' sound"
  },
  {
    "word": "Bibliothek",
    "expectedPronunciation": "biblioteːk",
    "accuracyScore": 70,
    "feedbackText": "Stress the second syllable"
  }
]
```
**Assertions:**
- ✅ Returns up to 20 items
- ✅ Sorted by accuracyScore ASC (worst first)
- ✅ Only user's own pronunciation feedback
**Priority:** P1

---

#### TC-INT-020: Analytics - New User (Empty State)
**Endpoint:** `GET /api/analytics/progress`  
**Precondition:** User has 0 submissions  
**Expected:**
```json
{
  "overview": {
    "totalSubmissions": 0,
    "analyzedSubmissions": 0,
    "pendingSubmissions": 0,
    "totalPracticeTimeSeconds": 0
  },
  "averageScores": {
    "overall": 0,
    "pronunciation": 0,
    "fluency": 0,
    "vocabulary": 0,
    "grammar": 0
  },
  "cefrDistribution": {},
  "recentSubmissions": [],
  "scoreTrends": []
}
```
**Assertions:**
- ✅ No errors (graceful empty state)
- ✅ All counts are 0
**Priority:** P2

---

## 🎭 E2E TESTS (22 Test Cases)

**Tester:** E2E Tester  
**Focus:** User workflows from UI → Backend → OpenAI  
**Tools:** Playwright, Chrome DevTools

### Group 1: Recording Workflow (6 tests)

#### TC-E2E-001: Browse Prompts and Select
**User Story:** As a learner, I want to browse prompts and start practicing  
**Steps:**
1. Navigate to `/speaking/prompts`
2. See grid of prompt cards
3. Filter by CEFR level "A1"
4. Click prompt "Introduce Yourself"
5. Click "Start Practice" button
6. Redirect to `/speaking/practice?promptId=<id>`

**Expected:**
- ✅ Prompt selector shows only A1 prompts after filter
- ✅ Prompt card displays: title, description, CEFR badge, topic badge, time limits
- ✅ Practice page loads with PromptDisplay component
- ✅ Preparation timer starts automatically (30s countdown)

**Assertions (Playwright):**
```typescript
await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(10);
await page.click('button:has-text("A1")');
await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(2);
await page.click('text=Introduce Yourself');
await expect(page).toHaveURL(/practice\?promptId=/);
await expect(page.locator('[data-testid="preparation-timer"]')).toContainText('00:30');
```
**Priority:** P0

---

#### TC-E2E-002: Preparation Timer Countdown
**Steps:**
1. On practice page with preparation timer
2. Observe countdown from 30s → 0s
3. Timer completes

**Expected:**
- ✅ Timer decrements every second (30, 29, 28...)
- ✅ At 00:00, callback triggers
- ✅ Visual indicator changes (e.g., "Ready to Record!" message)
- ✅ Record button becomes enabled

**Assertions:**
```typescript
await expect(page.locator('[data-testid="preparation-timer"]')).toContainText('00:30');
await page.waitForTimeout(5000);
await expect(page.locator('[data-testid="preparation-timer"]')).toContainText('00:25');
```
**Priority:** P1

---

#### TC-E2E-003: Start Audio Recording
**Steps:**
1. Preparation timer complete
2. Click "Start Recording" button (microphone icon)
3. Grant microphone permission (if first time)

**Expected:**
- ✅ Browser prompts for microphone permission
- ✅ Recording indicator appears (red dot pulsing)
- ✅ Duration timer starts (00:00, 00:01, 00:02...)
- ✅ Waveform visualization shows audio input
- ✅ Volume meter displays real-time levels

**Assertions:**
```typescript
await page.click('[data-testid="start-recording"]');
await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
await expect(page.locator('[data-testid="recording-timer"]')).toContainText('00:00');
await page.waitForTimeout(3000);
await expect(page.locator('[data-testid="recording-timer"]')).toContainText('00:03');
await expect(page.locator('canvas[data-testid="waveform"]')).toBeVisible();
```
**Priority:** P0

---

#### TC-E2E-004: Stop Recording and Preview
**Steps:**
1. Record for 10 seconds
2. Click "Stop Recording" button (square icon)
3. Observe audio preview controls

**Expected:**
- ✅ Recording stops
- ✅ Duration timer freezes (00:10)
- ✅ Audio preview player appears
- ✅ Play button visible
- ✅ Playback controls: play, pause, speed (1x, 1.5x, 2x)

**Assertions:**
```typescript
await page.click('[data-testid="stop-recording"]');
await expect(page.locator('[data-testid="recording-indicator"]')).not.toBeVisible();
await expect(page.locator('[data-testid="audio-preview"]')).toBeVisible();
await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
```
**Priority:** P0

---

#### TC-E2E-005: Submit Recording
**Steps:**
1. After recording stopped
2. Click "Submit" button
3. Wait for upload

**Expected:**
- ✅ Loading spinner appears
- ✅ Network request to `POST /api/submissions` captured
- ✅ Audio blob uploaded (multipart/form-data)
- ✅ Success message: "Submission uploaded! Analyzing..."
- ✅ Redirect to `/speaking/submissions/:id` OR stay with feedback panel

**Assertions:**
```typescript
await page.click('button:has-text("Submit")');
await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
const response = await page.waitForResponse(response => 
  response.url().includes('/api/submissions') && response.request().method() === 'POST'
);
expect(response.status()).toBe(201);
await expect(page.locator('text=/Analyzing/i')).toBeVisible();
```
**Priority:** P0

---

#### TC-E2E-006: Pause and Resume Recording
**Steps:**
1. Start recording
2. Record for 5 seconds
3. Click "Pause" button
4. Wait 3 seconds (no recording)
5. Click "Resume" button
6. Record for 5 more seconds

**Expected:**
- ✅ Pause button available during recording
- ✅ Timer pauses when paused
- ✅ Waveform stops animating
- ✅ Resume button appears
- ✅ Timer resumes from paused time
- ✅ Total duration = 10s (not 13s)

**Assertions:**
```typescript
await page.click('[data-testid="pause-recording"]');
const pausedTime = await page.locator('[data-testid="recording-timer"]').textContent();
await page.waitForTimeout(3000);
const stillPausedTime = await page.locator('[data-testid="recording-timer"]').textContent();
expect(pausedTime).toBe(stillPausedTime); // No change
await page.click('[data-testid="resume-recording"]');
```
**Priority:** P1

---

### Group 2: Feedback Display (5 tests)

#### TC-E2E-007: View Analysis Feedback
**Steps:**
1. Navigate to analyzed submission
2. See FeedbackPanel component

**Expected:**
- ✅ Overall score displayed (circular progress, 0-100)
- ✅ 4 dimension scores visible (Pronunciation, Fluency, Vocabulary, Grammar)
- ✅ Transcript text displayed
- ✅ Strengths list (3+ items with icons)
- ✅ Weaknesses list (3+ items)
- ✅ Suggestions list (3+ items)
- ✅ Detailed feedback text

**Assertions:**
```typescript
await expect(page.locator('[data-testid="overall-score"]')).toContainText(/\d+/);
await expect(page.locator('[data-testid="pronunciation-score"]')).toBeVisible();
await expect(page.locator('[data-testid="fluency-score"]')).toBeVisible();
await expect(page.locator('[data-testid="vocabulary-score"]')).toBeVisible();
await expect(page.locator('[data-testid="grammar-score"]')).toBeVisible();
await expect(page.locator('[data-testid="transcript"]')).not.toBeEmpty();
await expect(page.locator('[data-testid="strengths"] li')).toHaveCount(3);
```
**Priority:** P0

---

#### TC-E2E-008: Pronunciation Feedback Cards
**Steps:**
1. In FeedbackPanel, scroll to pronunciation section
2. See list of PronunciationCard components

**Expected:**
- ✅ Each card shows: word, expected IPA, actual IPA (if different), accuracy score, feedback
- ✅ Cards color-coded by score (green ≥80%, yellow 60-79%, red <60%)
- ✅ Play button for audio snippet (if available)
- ✅ Sorted by accuracy (worst first)

**Assertions:**
```typescript
await expect(page.locator('[data-testid="pronunciation-card"]')).toHaveCount(5);
const firstCard = page.locator('[data-testid="pronunciation-card"]').first();
await expect(firstCard.locator('[data-testid="word"]')).not.toBeEmpty();
await expect(firstCard.locator('[data-testid="expected-ipa"]')).toContainText(/[ˈˌəɛɪʊʃçɐ]/); // IPA chars
await expect(firstCard.locator('[data-testid="accuracy-score"]')).toContainText(/\d+%/);
```
**Priority:** P1

---

#### TC-E2E-009: Score Color Coding
**Steps:**
1. View feedback with varying scores
2. Observe visual indicators

**Expected:**
- ✅ Overall score ≥80: Green circle
- ✅ Overall score 60-79: Yellow circle
- ✅ Overall score <60: Red circle
- ✅ Dimension scores follow same color system
- ✅ Text/borders match score level

**Priority:** P1

---

#### TC-E2E-010: Transcript Display
**Steps:**
1. View analyzed submission
2. See transcript section

**Expected:**
- ✅ Full German transcript visible
- ✅ Text is readable (font size ≥14px)
- ✅ Word count displayed
- ✅ No truncation (or "Show More" if long)

**Priority:** P2

---

#### TC-E2E-011: No Feedback Yet - Pending State
**Steps:**
1. View submission with status "pending" or "analyzing"

**Expected:**
- ✅ Loading indicator displayed
- ✅ Message: "Analyzing your recording... This may take up to 30 seconds."
- ✅ No scores shown yet
- ✅ Auto-refresh or polling to check status

**Priority:** P1

---

### Group 3: Submission History (4 tests)

#### TC-E2E-012: View History List
**Steps:**
1. Navigate to `/speaking/history`
2. See SubmissionHistory component

**Expected:**
- ✅ List of past submissions (chronological, newest first)
- ✅ Each item shows: date, prompt title, CEFR level, overall score, duration
- ✅ Status indicator (pending/analyzed/reviewed)
- ✅ Play button for each recording
- ✅ View feedback button
- ✅ Delete button

**Assertions:**
```typescript
await expect(page.locator('[data-testid="submission-item"]')).toHaveCount(10);
await expect(page.locator('[data-testid="submission-item"]').first()).toContainText(/\d{4}-\d{2}-\d{2}/); // Date
await expect(page.locator('[data-testid="play-button"]').first()).toBeVisible();
```
**Priority:** P1

---

#### TC-E2E-013: Filter History by CEFR Level
**Steps:**
1. On history page
2. Click "A1" filter button
3. Observe filtered results

**Expected:**
- ✅ Only A1 submissions visible
- ✅ Count updates (e.g., "Showing 3 of 10")
- ✅ Clear filter button appears

**Assertions:**
```typescript
await page.click('button:has-text("A1")');
await expect(page.locator('[data-testid="submission-item"]')).toHaveCount(3);
await expect(page.locator('[data-testid="cefr-badge"]')).toContainText('A1');
```
**Priority:** P2

---

#### TC-E2E-014: Play Recording from History
**Steps:**
1. Click play button on submission item
2. Audio playback starts

**Expected:**
- ✅ Audio element appears/loads
- ✅ Play/pause controls functional
- ✅ Playback progress bar shows position
- ✅ Speed controls (1x, 1.5x, 2x) functional
- ✅ Volume control (if implemented)

**Assertions:**
```typescript
await page.click('[data-testid="play-button"]');
await expect(page.locator('audio')).toHaveAttribute('src', /https?:\/\/.+\.(mp3|webm|ogg)/);
await page.waitForTimeout(2000);
// Check audio is playing (duration > 0)
```
**Priority:** P1

---

#### TC-E2E-015: Delete Submission with Confirmation
**Steps:**
1. Click delete button on submission
2. See confirmation modal
3. Click "Confirm Delete"

**Expected:**
- ✅ Confirmation modal: "Are you sure you want to delete this recording?"
- ✅ Two buttons: "Cancel" and "Delete"
- ✅ After delete: submission removed from list
- ✅ Toast notification: "Recording deleted successfully"
- ✅ Network request to `DELETE /api/submissions/:id` captured

**Assertions:**
```typescript
await page.click('[data-testid="delete-button"]');
await expect(page.locator('[data-testid="confirmation-modal"]')).toBeVisible();
await page.click('button:has-text("Delete")');
await page.waitForResponse(response => 
  response.url().includes('/api/submissions/') && response.request().method() === 'DELETE'
);
await expect(page.locator('text=/deleted successfully/i')).toBeVisible();
```
**Priority:** P1

---

### Group 4: Progress Dashboard (3 tests)

#### TC-E2E-016: View Analytics Dashboard
**Steps:**
1. Navigate to `/speaking/analytics`
2. See ProgressDashboard component

**Expected:**
- ✅ Total submissions count
- ✅ Average overall score (gauge or number)
- ✅ 4 dimension score bars (horizontal bars with percentages)
- ✅ Score trends chart (line chart, last 10-30 submissions)
- ✅ CEFR distribution (bar chart or pie chart)
- ✅ Common issues list (pronunciation weaknesses)
- ✅ AI recommendations section

**Assertions:**
```typescript
await expect(page.locator('[data-testid="total-submissions"]')).toContainText(/\d+/);
await expect(page.locator('[data-testid="avg-overall-score"]')).toContainText(/\d+(\.\d+)?/);
await expect(page.locator('[data-testid="dimension-bar"]')).toHaveCount(4);
await expect(page.locator('[data-testid="score-trend-chart"]')).toBeVisible();
```
**Priority:** P1

---

#### TC-E2E-017: Trend Chart Shows Progress
**Steps:**
1. View trend chart with 10+ submissions

**Expected:**
- ✅ X-axis: dates or submission number
- ✅ Y-axis: scores (0-100)
- ✅ Line shows overall score over time
- ✅ Optional: separate lines for 4 dimensions
- ✅ Tooltips on hover (date + score)

**Priority:** P2

---

#### TC-E2E-018: Empty Analytics State
**Steps:**
1. New user with 0 submissions views analytics

**Expected:**
- ✅ Empty state message: "No data yet. Start practicing to see your progress!"
- ✅ CTA button: "Browse Prompts"
- ✅ No errors or broken charts

**Assertions:**
```typescript
await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
await expect(page.locator('text=/No data yet/i')).toBeVisible();
await expect(page.locator('button:has-text("Browse Prompts")')).toBeVisible();
```
**Priority:** P2

---

### Group 5: Mobile Responsive (4 tests)

#### TC-E2E-019: Mobile Layout - Bottom Drawer
**Steps:**
1. Open practice page in mobile viewport (390x844)
2. Start recording workflow
3. Complete recording
4. See feedback

**Expected:**
- ✅ Desktop: side-by-side (recorder left, feedback right)
- ✅ Mobile: recorder full-width, feedback in bottom drawer
- ✅ Drawer toggle button visible at bottom
- ✅ Click toggle → drawer slides up from bottom
- ✅ Drawer height: 60% of viewport
- ✅ Backdrop overlay visible behind drawer

**Assertions:**
```typescript
await page.setViewportSize({ width: 390, height: 844 });
await expect(page.locator('[data-testid="feedback-drawer"]')).toHaveClass(/translate-y-full/); // Hidden
await page.click('[data-testid="toggle-feedback"]');
await expect(page.locator('[data-testid="feedback-drawer"]')).toHaveClass(/translate-y-0/); // Visible
await expect(page.locator('[data-testid="drawer-backdrop"]')).toBeVisible();
```
**Priority:** P1

---

#### TC-E2E-020: Mobile - Close Drawer on Backdrop Click
**Steps:**
1. Open feedback drawer on mobile
2. Click backdrop (outside drawer)

**Expected:**
- ✅ Drawer slides down (closes)
- ✅ Backdrop disappears
- ✅ Can reopen with toggle button

**Assertions:**
```typescript
await page.click('[data-testid="drawer-backdrop"]');
await expect(page.locator('[data-testid="feedback-drawer"]')).toHaveClass(/translate-y-full/);
await expect(page.locator('[data-testid="drawer-backdrop"]')).not.toBeVisible();
```
**Priority:** P2

---

#### TC-E2E-021: Tablet Layout - Side-by-Side
**Steps:**
1. Open in tablet viewport (1024x768)

**Expected:**
- ✅ Desktop layout activated (no drawer)
- ✅ Recorder on left (flex-1)
- ✅ Feedback panel on right (fixed width ~384px)
- ✅ Both visible simultaneously

**Assertions:**
```typescript
await page.setViewportSize({ width: 1024, height: 768 });
await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
await expect(page.locator('[data-testid="feedback-drawer"]')).not.toBeVisible();
```
**Priority:** P2

---

#### TC-E2E-022: Touch Controls - Button Size
**Steps:**
1. On mobile viewport
2. Inspect button sizes

**Expected:**
- ✅ All tap targets ≥44px height (iOS guidelines)
- ✅ Record/Stop/Pause buttons ≥48px
- ✅ Spacing between buttons ≥8px
- ✅ No accidental taps

**Priority:** P2

---

## ⚡ PERFORMANCE TESTS (12 Test Cases)

**Tester:** Performance Tester  
**Focus:** Response times, OpenAI API latency, upload speed  
**Tools:** k6, Apache JMeter, Chrome DevTools Performance tab

### Group 1: API Response Times (6 tests)

#### TC-PERF-001: Whisper STT - Short Audio (30s)
**Test:** Upload 30-second German audio file  
**Target:** <5s (p95)  
**Method:**
```javascript
// k6 script
export default function() {
  const audioFile = open('test-audio-30s.mp3', 'b');
  http.post('http://localhost:3002/api/analyze/transcript', {
    audio: http.file(audioFile, 'audio.mp3')
  }, {
    headers: { 'Authorization': 'Bearer <token>' }
  });
}
```
**Assertions:**
- ✅ Response time <5s (Whisper processing)
- ✅ Transcript returned
- ✅ No timeouts
**Priority:** P0

---

#### TC-PERF-002: Whisper STT - Long Audio (2min)
**Target:** <10s (p95)  
**Test:** Upload 2-minute audio  
**Expected:**
- ✅ Processing time <10s
- ✅ Transcript accuracy maintained
**Priority:** P1

---

#### TC-PERF-003: GPT-4 Speech Analysis
**Target:** <15s (p95)  
**Precondition:** Submission has transcript (500-word)  
**Test:** Request full analysis  
**Expected:**
- ✅ Analysis completes <15s
- ✅ All 4 dimension scores returned
- ✅ Feedback structured correctly
**Priority:** P0

---

#### TC-PERF-004: Submission List - Pagination
**Endpoint:** `GET /api/submissions?page=1&limit=10`  
**Target:** <150ms  
**Precondition:** User has 100 submissions  
**Expected:**
- ✅ First page: <150ms
- ✅ Page 5: <150ms (index optimized)
- ✅ Includes prompt details (JOIN query optimized)
**Priority:** P1

---

#### TC-PERF-005: Analytics Calculation
**Endpoint:** `GET /api/analytics/progress`  
**Target:** <500ms  
**Precondition:** User has 50 submissions  
**Expected:**
- ✅ Aggregation queries optimized
- ✅ Response time <500ms
- ✅ All stats calculated correctly
**Priority:** P1

---

#### TC-PERF-006: Prompts List
**Endpoint:** `GET /api/prompts`  
**Target:** <100ms  
**Expected:**
- ✅ Indexed query on cefrLevel
- ✅ Response time <100ms
**Priority:** P2

---

### Group 2: Frontend Performance (4 tests)

#### TC-PERF-007: AudioRecorder Component - Initial Render
**Test:** Measure time from mount to interactive  
**Target:** <1000ms  
**Method:** Lighthouse audit  
**Expected:**
- ✅ Component renders <1s
- ✅ MediaRecorder initializes
- ✅ Canvas ready for waveform
**Priority:** P1

---

#### TC-PERF-008: Waveform Visualization - Real-time
**Test:** Record for 60 seconds, measure canvas FPS  
**Target:** ≥30 FPS (smooth animation)  
**Expected:**
- ✅ No frame drops
- ✅ CPU usage <50%
- ✅ Canvas updates at 60fps
**Priority:** P2

---

#### TC-PERF-009: Audio Upload - 2min Recording
**Test:** Upload 2-minute audio (approx 2MB MP3)  
**Target:** <5s upload time  
**Expected:**
- ✅ Upload progress indicator
- ✅ No browser freeze
- ✅ Network request completes <5s
**Priority:** P1

---

#### TC-PERF-010: FeedbackPanel Render - Large Dataset
**Test:** Display feedback with 50 pronunciation cards  
**Target:** <1500ms render time  
**Expected:**
- ✅ Component renders smoothly
- ✅ Scroll performance (60fps)
- ✅ No layout shift
**Priority:** P2

---

### Group 3: Load Testing (2 tests)

#### TC-PERF-011: Concurrent Analysis Requests
**Test:** 10 users submitting recordings simultaneously  
**Target:** No failures, avg response <20s  
**Method:** k6 load test  
**Expected:**
- ✅ Rate limiting enforced (10 req/15min per user)
- ✅ OpenAI API calls queued properly
- ✅ No 5xx errors
- ✅ All analyses complete within 30s
**Priority:** P1

---

#### TC-PERF-012: Database Connection Pool
**Test:** 100 concurrent API requests (mixed endpoints)  
**Expected:**
- ✅ No connection pool exhaustion
- ✅ Prisma connection pooling configured
- ✅ Max connections: 10 (configurable)
**Priority:** P1

---

## 🔒 SECURITY TESTS (10 Test Cases)

**Tester:** Security Tester  
**Focus:** Authentication, authorization, file upload, rate limiting  
**Tools:** OWASP ZAP, Burp Suite, manual testing

### Group 1: Authentication & Authorization (4 tests)

#### TC-SEC-001: JWT Token Validation
**Test 1:** Send request with expired JWT  
**Expected:**
- ✅ Status code: 401 Unauthorized
- ✅ Error: "Token expired"
- ✅ No data returned

**Test 2:** Send request with invalid signature  
**Expected:**
- ✅ Status code: 401 Unauthorized
- ✅ Token rejected
**Priority:** P0

---

#### TC-SEC-002: Submission Ownership Enforcement
**Test:** User A tries to access User B's submission  
**Method:** Modify userId in JWT or submissionId in URL  
**Expected:**
- ✅ Status code: 403 Forbidden
- ✅ Error: "Not authorized to access this submission"
- ✅ No data leaked about submission existence
**Priority:** P0

---

#### TC-SEC-003: Password Storage Security
**Test:** Inspect database after user registration  
**Expected:**
- ✅ Password stored as bcrypt hash (starts with $2b$)
- ✅ Hash includes salt (not reversible)
- ✅ Original password NOT in logs
**Priority:** P0

---

#### TC-SEC-004: Rate Limiting Bypass Attempt
**Test:** Send 20 analysis requests from same user with different IPs  
**Expected:**
- ✅ Rate limit still enforced (user-based, not IP-based)
- ✅ Status 429 after 10 req/15min
- ✅ Rate limit counter per userId
**Priority:** P0

---

### Group 2: File Upload Security (3 tests)

#### TC-SEC-005: File Type Validation
**Test:** Upload non-audio file (e.g., .exe, .php, .jpg)  
**Expected:**
- ✅ Status code: 400 Bad Request
- ✅ Error: "Invalid file type. Only audio files allowed (MP3, WAV, OGG, WebM, MP4)"
- ✅ File rejected before storage
**Priority:** P0

---

#### TC-SEC-006: File Size Limit Enforcement
**Test:** Upload 15MB audio file (exceeds 10MB limit)  
**Expected:**
- ✅ Status code: 413 Payload Too Large OR 400 Bad Request
- ✅ Error: "File size exceeds maximum of 10MB"
- ✅ No upload to server/OpenAI
**Priority:** P0

---

#### TC-SEC-007: Malicious File Upload - Audio with Embedded Code
**Test:** Upload crafted audio file with embedded script/payload  
**Expected:**
- ✅ File uploaded (audio is valid)
- ✅ No code execution on server
- ✅ File served with correct Content-Type (audio/*)
- ✅ No XSS when displaying filename/metadata
**Priority:** P1

---

### Group 3: Input Validation & CORS (3 tests)

#### TC-SEC-008: Input Length Validation
**Test Scenarios:**
- audioUrl: 2000 characters (exceeds limit)
- durationSeconds: -10 (negative value)
- durationSeconds: 10000 (exceeds max speaking time)

**Expected:**
- ✅ All return 400 Bad Request with validation error
- ✅ Zod schema validation messages clear
**Priority:** P1

---

#### TC-SEC-009: CORS - Unauthorized Origin
**Test:** Send API request from `http://malicious-site.com`  
**Expected:**
- ✅ CORS error in browser console
- ✅ No response data returned
- ✅ Allowed origins: `localhost:3000` (dev) or production domain
**Priority:** P1

---

#### TC-SEC-010: Security Headers Present
**Test:** Inspect response headers  
**Expected Headers (Helmet middleware):**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security: max-age=31536000` (production)
**Priority:** P1

---

## 📊 TEST DATA REQUIREMENTS

### Users (Authentication)
```javascript
// Test users to create
[
  { email: 'speaker1@example.com', password: 'password123', name: 'Test Speaker 1', tier: 'free' },
  { email: 'speaker2@example.com', password: 'password123', name: 'Test Speaker 2', tier: 'premium' },
  { email: 'admin@example.com', password: 'adminpass', name: 'Admin', tier: 'admin' }
]
```

### Speaking Prompts (Seed Data)
```javascript
// Expected in database (from backend seed)
[
  { cefrLevel: 'A1', topic: 'daily_conversation', preparationTimeSeconds: 30, speakingTimeSeconds: 60 },  // 2 prompts
  { cefrLevel: 'A2', topic: 'personal', preparationTimeSeconds: 45, speakingTimeSeconds: 90 },   // 2 prompts
  { cefrLevel: 'B1', topic: 'storytelling', preparationTimeSeconds: 60, speakingTimeSeconds: 120 },    // 2 prompts
  { cefrLevel: 'B2', topic: 'opinions', preparationTimeSeconds: 60, speakingTimeSeconds: 150 }    // 2 prompts
]
// Total: 8 prompts minimum
```

### Audio Files (Test Data)
```javascript
// Prepare test audio files for upload testing
const testAudioFiles = [
  'test-german-30s.mp3',      // 30-second A1 level intro
  'test-german-1min.mp3',     // 1-minute A2 level description
  'test-german-2min.mp3',     // 2-minute B1 level storytelling
  'test-german-silent.mp3',   // Silent audio (edge case)
  'test-german-noisy.mp3',    // Low quality/noisy audio
  'test-english-30s.mp3',     // English (wrong language test)
  'test-large-15mb.mp3',      // Exceeds size limit
  'test-invalid.exe',         // Invalid file type
]
```

### Submissions (Test Data)
```javascript
// Create via API for each test user
[
  { promptId: '<uuid>', audioUrl: 'https://example.com/audio1.mp3', durationSeconds: 45, status: 'pending' },
  { promptId: '<uuid>', audioUrl: 'https://example.com/audio2.mp3', durationSeconds: 60, status: 'analyzing' },
  { 
    promptId: '<uuid>', 
    audioUrl: 'https://example.com/audio3.mp3', 
    durationSeconds: 90, 
    status: 'analyzed',
    transcriptText: 'Mein Name ist John...',
    overallScore: 75,
    pronunciationScore: 80,
    fluencyScore: 70,
    vocabularyScore: 75,
    grammarScore: 77,
    aiFeedback: { strengths: [...], weaknesses: [...], suggestions: [...] }
  }
]
// Per user: 10 submissions (3 pending, 2 analyzing, 5 analyzed)
```

---

## 🎯 TEST EXECUTION PLAN

### Day 1: Setup & Integration Testing (6h)
**Morning (3h):**
- ✅ Install dependencies (Playwright, k6, Postman)
- ✅ Seed database (8 prompts, 3 users, 30 submissions)
- ✅ Start backend service (port 3002)
- ✅ Start frontend dev server (port 3000)
- ✅ Configure environment variables (.env.test)
- ✅ Prepare test audio files (8 files)

**Afternoon (3h):**
- ✅ Run TC-INT-001 to TC-INT-010 (Auth + Prompts + Submissions)
- ✅ Document failures in bug tracker
- ✅ Re-test after fixes

### Day 2: Integration + E2E (8h)
**Morning (4h):**
- ✅ Run TC-INT-011 to TC-INT-020 (Submissions + OpenAI + Analytics)
- ✅ Verify OpenAI API integration (Whisper + GPT-4)
- ✅ Check rate limiting enforcement

**Afternoon (4h):**
- ✅ Run TC-E2E-001 to TC-E2E-011 (Recording Workflow + Feedback)
- ✅ Test across browsers (Chrome, Safari, Firefox)
- ✅ Record video of critical paths

### Day 3: E2E + Performance (8h)
**Morning (4h):**
- ✅ Run TC-E2E-012 to TC-E2E-022 (History + Dashboard + Mobile)
- ✅ Test mobile responsive behavior (iOS/Android)
- ✅ Generate coverage report

**Afternoon (4h):**
- ✅ Run TC-PERF-001 to TC-PERF-012 (Performance tests)
- ✅ Analyze Lighthouse reports
- ✅ Load testing with k6
- ✅ Optimize if response times exceed targets

### Day 4: Security + Regression (6h)
**Morning (3h):**
- ✅ Run TC-SEC-001 to TC-SEC-010 (Security tests)
- ✅ OWASP ZAP scan
- ✅ Manual security tests
- ✅ Fix critical vulnerabilities immediately

**Afternoon (3h):**
- ✅ Re-run all P0 tests after fixes
- ✅ Smoke test critical paths
- ✅ Final report generation
- ✅ Sign-off on test completion

---

## 📝 BUG SEVERITY CLASSIFICATION

### Critical (P0) - Blockers
- ✅ **Cannot record audio** (MediaRecorder fails)
- ✅ **Whisper STT fails** (no transcription returned)
- ✅ **GPT-4 analysis never completes** (timeout)
- ✅ **Authentication broken** (all requests 401)
- ✅ **File upload allows malicious files** (RCE vulnerability)
- ✅ **Rate limiting not enforced** (API cost spikes)

### High (P1) - Major Issues
- ✅ Audio recording stops randomly (data loss)
- ✅ Waveform visualization crashes browser
- ✅ Ownership bypass (can access other's submissions)
- ✅ Performance >2x targets (e.g., 30s STT)
- ✅ Mobile layout completely broken

### Medium (P2) - Minor Issues
- ✅ Waveform animation janky (but functional)
- ✅ Score color coding incorrect
- ✅ UI layout breaks on specific viewport (but usable)
- ✅ Error message typo

### Low (P3) - Cosmetic
- ✅ Button color mismatch
- ✅ Tooltip positioning slightly off
- ✅ Console warning (not affecting functionality)

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass (100%):
- ✅ All P0 integration tests (TC-INT-001, 002, 008, 011, 012, 014, 016, 017)
- ✅ All P0 E2E tests (TC-E2E-001, 003, 004, 005, 007)
- ✅ All P0 security tests (TC-SEC-001, 002, 003, 004, 005, 006)
- ✅ All P0 performance tests (TC-PERF-001, 003)
- ✅ Whisper STT <10s (2-minute audio)
- ✅ GPT-4 analysis <15s
- ✅ Audio recording functional

### Should Pass (≥90%):
- ✅ All P1 tests across all categories
- ✅ Performance targets met (p95)
- ✅ Mobile responsive on iOS/Android

### Nice to Pass (≥80%):
- ✅ All P2 tests
- ✅ Lighthouse score >90

---

## 🚀 DELIVERABLES

### 1. Test Execution Report
**File:** `.testing/TEST_RESULTS_speaking.md`  
**Contents:**
- Test cases run vs passed/failed/skipped
- Bug list with severity
- Screenshots/videos of failures
- Performance metrics
- OpenAI API cost summary

### 2. Bug Report
**File:** `.testing/BUGS_speaking.md`  
**Format:**
```markdown
## BUG-001: Audio recording stops after 30 seconds
**Severity:** P1 (High)  
**Steps to Reproduce:**
1. Start recording
2. Wait 30 seconds
3. Recording auto-stops (expected: continues until manual stop)

**Expected:** Recording continues until user clicks stop or max duration reached  
**Actual:** Recording stops at 30s automatically  
**Root Cause:** MediaRecorder timeslice not configured properly  
**Fix:** Set timeslice to undefined (continuous recording)  
**Status:** FIXED
```

### 3. Coverage Report
**File:** `.testing/COVERAGE_speaking.md`  
**Metrics:**
- Integration test coverage: X/20 passed
- E2E test coverage: X/22 passed
- Performance test coverage: X/12 passed
- Security test coverage: X/10 passed
- **Total:** X/64 passed (Y%)

### 4. OpenAI API Cost Report
**File:** `.testing/OPENAI_COST_speaking.md`  
**Metrics:**
- Whisper STT calls: X requests × $0.006/min = $Y
- GPT-4 analysis calls: X requests × ~$0.10/request = $Y
- Total testing cost: $Z
- Projected monthly cost (100 users, 10 submissions/user): $W

---

## 💰 COST CONSIDERATIONS

### OpenAI API Costs During Testing
**Whisper (STT):**
- $0.006 per minute of audio
- Testing: 50 uploads × 1.5 min avg = 75 minutes = **$0.45**

**GPT-4 (Analysis):**
- Model: `gpt-4o-mini` ($0.15 per 1M input tokens, $0.60 per 1M output tokens)
- Testing: 50 analyses × ~$0.05/analysis = **$2.50**

**Total Testing Cost:** ~$3.00

**Rate Limiting Protection:**
- 10 analysis requests per 15 minutes per user
- Prevents cost spikes from abuse

---

## 🎓 LESSONS LEARNED (To Document After Testing)

### What Worked Well:
- (To be filled by tester)

### What Needs Improvement:
- (To be filled by tester)

### Recommendations for Phase 2:
- (To be filled by tester)

---

## 📞 CONTACT & SUPPORT

**Test Lead:** Test Lead Agent (Subagent)  
**Backend Developer:** backend-speaking session  
**Frontend Developer:** frontend-speaking session  
**Integration Specialist:** integration-specialist-speaking session (TBD)

**Documentation:**
- Backend Completion: `services/speaking-service/BACKEND_COMPLETION_speaking.md`
- Frontend Completion: `apps/web-learner/FRONTEND_COMPLETION_speaking.md`
- API Documentation: `services/speaking-service/README.md`

---

**Test Plan Version:** 1.0  
**Last Updated:** February 7, 2026  
**Total Test Cases:** 64  
**Estimated Effort:** 11-15 hours (4 testers in parallel)  
**Status:** ✅ READY FOR EXECUTION
