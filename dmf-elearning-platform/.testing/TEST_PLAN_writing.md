# TEST PLAN: DMF Writing Module Phase 1

**Date:** 2026-02-07  
**Test Lead:** Test Lead Agent (Subagent)  
**Module:** Writing Practice (Essay Editor + Grammar Checking + Auto-Save + Prompts)  
**Test Environment:** localhost:3001 (Backend) + localhost:3000 (Frontend)  
**Database:** PostgreSQL (writing_prompts, essays, grammar_errors)

---

## 📋 EXECUTIVE SUMMARY

**Test Scope:** Full writing module testing covering:
- ✅ Lexical rich text editor with word counting
- ✅ LanguageTool grammar checking API with Redis caching
- ✅ Essay CRUD operations (create, read, update, delete)
- ✅ Writing prompts with CEFR filtering
- ✅ Auto-save functionality (10s debounced)
- ✅ Real-time error highlighting and feedback
- ✅ Analytics and progress tracking
- ✅ Mobile responsive layout (bottom drawer)

**Total Test Cases:** 62 tests  
**Testing Duration:** 8-10 hours (parallel execution)  
**Pass Criteria:** 0 critical bugs, <3 high severity bugs, all critical paths working

---

## 🎯 TEST OBJECTIVES

1. **Verify LanguageTool integration** detects errors accurately across languages
2. **Validate essay management** ensures data integrity and ownership
3. **Ensure auto-save reliability** prevents data loss during editing
4. **Test performance** meets targets (<1s grammar check with cache, <200ms API calls)
5. **Verify security** prevents unauthorized access, XSS attacks, and SQL injection
6. **Validate UI/UX** across devices (desktop, tablet, mobile)

---

## 📚 WHAT WAS BUILT (FROM COMPLETION REPORTS)

### Backend Components (Backend Developer):
- ✅ **Express service** with TypeScript (port 3001)
- ✅ **Authentication:**
  - JWT-based auth (7-day expiration, HS256)
  - bcrypt password hashing (10 salt rounds)
  - Registration/Login endpoints
- ✅ **Grammar Checking:**
  - LanguageTool API integration
  - Redis caching (24h TTL, SHA-256 keys)
  - Rate limiting (60 req/min per user)
  - Error categorization (grammar, spelling, style)
- ✅ **Essay Management:**
  - CRUD operations with ownership verification
  - Word counting algorithm
  - Status tracking (draft, submitted, reviewed)
  - Pagination (default 20, max 100)
- ✅ **Analytics:**
  - Aggregated statistics (total essays, avg words, error rate)
  - Error trends over time
  - Common error types analysis
- ✅ **API Endpoints:**
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/grammar/check` - Grammar validation
  - `GET /api/prompts` - List writing prompts
  - `GET /api/prompts/:id` - Get single prompt
  - `POST /api/essays` - Create essay
  - `GET /api/essays` - List user essays
  - `GET /api/essays/:id` - Get essay with errors
  - `PUT /api/essays/:id` - Update essay
  - `DELETE /api/essays/:id` - Delete essay
  - `GET /api/analytics/:userId` - Get writing stats

### Frontend Components (Frontend Developer):
- ✅ **WritingEditor.tsx** - Lexical rich text editor
- ✅ **FeedbackPanel.tsx** - Error display grouped by type
- ✅ **ErrorCard.tsx** - Individual error with suggestions
- ✅ **ErrorOverlay.tsx** - CSS-based error highlighting
- ✅ **StatsDisplay.tsx** - Word count, error rate, writing time
- ✅ **PromptSelector.tsx** - Prompt browser with filters
- ✅ **PromptCard.tsx** - Single prompt display
- ✅ **EssayDashboard.tsx** - Essay list view
- ✅ **MobileLayout.tsx** - Responsive layout wrapper
- ✅ **useAutoSave.ts** - Debounced auto-save hook (10s delay)

### Integration Layer (Integration Specialist):
- ✅ **React Query hooks** (`useWriting.ts`):
  - `usePrompts()`, `usePrompt(id)`
  - `useEssays()`, `useEssay(id)`
  - `useCreateEssay()`, `useUpdateEssay()`, `useDeleteEssay()`
  - `useGrammarCheck()`
  - `useWritingAnalytics(userId, period)`
- ✅ **Zustand stores:**
  - `editorStore.ts` - Content, word count, auto-save state
  - `errorStore.ts` - Grammar errors, ignored errors
- ✅ **Advanced hooks:**
  - `useDebouncedGrammarCheck.ts` - 1s debounce
  - `useAutoSave.ts` - 10s debounced saves
- ✅ **API client** (`api.ts`): Axios with JWT interceptors
- ✅ **15 integration tests** passing

### Critical Paths Identified:
1. **Essay Creation Flow:** Browse prompts → Select prompt → Start writing → Auto-save triggers → Submit essay
2. **Grammar Check Flow:** Type content → Debounced check → Display errors → Apply suggestion → Re-check
3. **Error Management:** See error → Click suggestion → Replace text → Mark as ignored
4. **Analytics Tracking:** View dashboard → See writing stats → Filter by period

---

## 🧪 TEST COVERAGE MATRIX

| Test Category | Test Cases | Assignee | Priority | Duration |
|---------------|------------|----------|----------|----------|
| Integration | 20 | Integration Tester | P0 | 3-4h |
| E2E | 20 | E2E Tester | P0 | 3-4h |
| Performance | 12 | Performance Tester | P1 | 2-3h |
| Security | 10 | Security Tester | P0 | 2-3h |
| **TOTAL** | **62** | **4 Testers** | - | **10-14h** |

---

## 🔗 INTEGRATION TESTS (20 Test Cases)

**Tester:** Integration Tester  
**Focus:** API endpoints + Database integration + LanguageTool API  
**Tools:** Postman/Thunder Client, Prisma Studio, Vitest

### Group 1: Authentication (3 tests)

#### TC-INT-001: User Registration - Happy Path
**Endpoint:** `POST /api/auth/register`  
**Precondition:** Email not already registered  
**Input:**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}
```
**Expected Output:**
```json
{
  "user": {
    "id": "<uuid>",
    "email": "test@example.com",
    "name": "Test User",
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

#### TC-INT-002: User Registration - Duplicate Email
**Endpoint:** `POST /api/auth/register`  
**Precondition:** Email already exists in database  
**Input:**
```json
{
  "email": "existing@example.com",
  "password": "password123",
  "name": "Duplicate User"
}
```
**Expected Output:**
```json
{
  "error": "Email already registered"
}
```
**Assertions:**
- ✅ Status code: 409 Conflict
- ✅ No new user created in database
- ✅ Error message is user-friendly
**Priority:** P0

---

#### TC-INT-003: User Login - Correct Credentials
**Endpoint:** `POST /api/auth/login`  
**Precondition:** User exists with password "password123"  
**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
**Expected Output:**
```json
{
  "user": {
    "id": "<uuid>",
    "email": "test@example.com",
    "name": "Test User",
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

### Group 2: Grammar Checking (5 tests)

#### TC-INT-004: Grammar Check - German Text with Errors
**Endpoint:** `POST /api/grammar/check`  
**Precondition:** User authenticated, LanguageTool API available  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "text": "Ich gehe zu die Bibliothek.",
  "language": "de-DE"
}
```
**Expected Output:**
```json
{
  "errors": [
    {
      "type": "grammar",
      "message": "Falsche Präposition nach 'gehen'",
      "shortMessage": "Falsche Präposition",
      "offset": 9,
      "length": 7,
      "suggestions": [
        { "value": "zur" },
        { "value": "in die" }
      ],
      "ruleId": "DE_PREPOSITION_CONTRACTION",
      "category": "GRAMMAR"
    }
  ],
  "language": "de-DE",
  "processingTimeMs": "<number>"
}
```
**Assertions:**
- ✅ Status code: 200 OK
- ✅ At least 1 error detected (incorrect preposition)
- ✅ Error offset/length point to "zu die"
- ✅ Suggestions include "zur"
- ✅ Processing time <3000ms (uncached)
**Priority:** P0

---

#### TC-INT-005: Grammar Check - Redis Cache Hit
**Endpoint:** `POST /api/grammar/check`  
**Precondition:** Same text was checked <24h ago  
**Input:**
```json
{
  "text": "Ich gehe zu die Bibliothek.",
  "language": "de-DE"
}
```
**Expected:**
- ✅ Same response as TC-INT-004
- ✅ Processing time <100ms (cached)
- ✅ No external API call to LanguageTool (check Redis logs)
- ✅ Cache key format: `grammar:sha256(<text:language>)`
**Priority:** P1

---

#### TC-INT-006: Grammar Check - Rate Limiting
**Endpoint:** `POST /api/grammar/check`  
**Precondition:** User has made 60 requests in last 60 seconds  
**Input:** Any valid grammar check request  
**Expected Output:**
```json
{
  "error": "Rate limit exceeded. Try again in 30 seconds."
}
```
**Assertions:**
- ✅ Status code: 429 Too Many Requests
- ✅ No grammar check performed
- ✅ Rate limit counter resets after 60 seconds
**Priority:** P1

---

#### TC-INT-007: Grammar Check - Max Text Length Exceeded
**Endpoint:** `POST /api/grammar/check`  
**Input:**
```json
{
  "text": "<string with 100,001 characters>",
  "language": "de-DE"
}
```
**Expected Output:**
```json
{
  "error": "Text exceeds maximum length of 100,000 characters"
}
```
**Assertions:**
- ✅ Status code: 400 Bad Request
- ✅ No API call to LanguageTool
**Priority:** P2

---

#### TC-INT-008: Grammar Check - Unsupported Language
**Endpoint:** `POST /api/grammar/check`  
**Input:**
```json
{
  "text": "Hello world",
  "language": "xx-XX"
}
```
**Expected:**
- ✅ Status code: 400 Bad Request OR 200 with error from LanguageTool
- ✅ Clear error message about unsupported language
**Priority:** P2

---

### Group 3: Essay Management (6 tests)

#### TC-INT-009: Create Essay - Happy Path
**Endpoint:** `POST /api/essays`  
**Precondition:** User authenticated, prompt exists  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "promptId": "<uuid-of-prompt>",
  "content": "Ich gehe zur Schule. Dann esse ich."
}
```
**Expected Output:**
```json
{
  "id": "<uuid>",
  "userId": "<user-uuid>",
  "promptId": "<prompt-uuid>",
  "content": "Ich gehe zur Schule. Dann esse ich.",
  "wordCount": 7,
  "errorCount": 0,
  "writingTimeSeconds": 0,
  "status": "draft",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```
**Assertions:**
- ✅ Status code: 201 Created
- ✅ Word count calculated correctly (7 words)
- ✅ Essay ID is UUID v4
- ✅ createdAt equals updatedAt on creation
**Priority:** P0

---

#### TC-INT-010: Update Essay - Auto-Save Simulation
**Endpoint:** `PUT /api/essays/:id`  
**Precondition:** Essay exists with ID, user is owner  
**Input:**
```json
{
  "content": "Updated content with more words here.",
  "errorCount": 2,
  "writingTimeSeconds": 300
}
```
**Expected:**
- ✅ Status code: 200 OK
- ✅ Word count recalculated (7 words)
- ✅ updatedAt timestamp changed
- ✅ writingTimeSeconds updated to 300
**Priority:** P0

---

#### TC-INT-011: Update Essay - Ownership Verification
**Endpoint:** `PUT /api/essays/:id`  
**Precondition:** Essay exists but belongs to different user  
**Expected:**
- ✅ Status code: 403 Forbidden
- ✅ Error: "Not authorized to update this essay"
- ✅ No changes in database
**Priority:** P0

---

#### TC-INT-012: Get Essay - With Grammar Errors
**Endpoint:** `GET /api/essays/:id`  
**Precondition:** Essay exists with stored grammar errors  
**Expected Output:**
```json
{
  "id": "<uuid>",
  "content": "...",
  "wordCount": 50,
  "grammarErrors": [
    {
      "type": "grammar",
      "message": "...",
      "offset": 10,
      "length": 5,
      "suggestions": ["..."]
    }
  ]
}
```
**Assertions:**
- ✅ Grammar errors included in response
- ✅ Errors sorted by offset (ascending)
**Priority:** P1

---

#### TC-INT-013: List Essays - Pagination
**Endpoint:** `GET /api/essays?limit=10&offset=0`  
**Precondition:** User has 25 essays  
**Expected:**
- ✅ Returns 10 essays (first page)
- ✅ Sorted by createdAt DESC (newest first)
- ✅ Total count metadata included
**Test Again:** `offset=10` returns next 10 essays
**Priority:** P1

---

#### TC-INT-014: Delete Essay - Cascade Deletion
**Endpoint:** `DELETE /api/essays/:id`  
**Precondition:** Essay exists with related grammar_errors  
**Expected:**
- ✅ Status code: 204 No Content
- ✅ Essay deleted from database
- ✅ Related grammar_errors also deleted (cascade)
**Priority:** P1

---

### Group 4: Writing Prompts (3 tests)

#### TC-INT-015: List Prompts - All Levels
**Endpoint:** `GET /api/prompts`  
**Expected:**
- ✅ Returns all prompts (no filter)
- ✅ Each prompt has: id, title, description, cefrLevel, category, targetWordCount
- ✅ Sorted by cefrLevel ASC
**Priority:** P1

---

#### TC-INT-016: List Prompts - CEFR Filter
**Endpoint:** `GET /api/prompts?level=B1`  
**Expected:**
- ✅ Only B1 prompts returned
- ✅ No A1, A2, B2, C1, C2 prompts
**Priority:** P1

---

#### TC-INT-017: Get Single Prompt
**Endpoint:** `GET /api/prompts/:id`  
**Expected:**
```json
{
  "id": "<uuid>",
  "title": "Mein Tagesablauf",
  "description": "Beschreibe deinen typischen Tagesablauf...",
  "cefrLevel": "A1",
  "category": "daily_life",
  "targetWordCount": 100,
  "tips": ["Use present tense", "..."],
  "createdAt": "<timestamp>"
}
```
**Assertions:**
- ✅ All fields present
- ✅ Tips array included if available
**Priority:** P2

---

### Group 5: Analytics (3 tests)

#### TC-INT-018: Analytics - Weekly Period
**Endpoint:** `GET /api/analytics/:userId?period=week`  
**Precondition:** User has 5 essays in last 7 days  
**Expected Output:**
```json
{
  "stats": {
    "totalEssays": 5,
    "totalWords": 1250,
    "averageWords": 250,
    "errorRate": 3.2,
    "errorTrends": [
      { "date": "2026-02-06", "errorRate": 4.1 },
      { "date": "2026-02-07", "errorRate": 2.3 }
    ],
    "commonErrors": [
      { "type": "grammar", "count": 15 },
      { "type": "spelling", "count": 5 }
    ]
  }
}
```
**Assertions:**
- ✅ totalEssays = 5
- ✅ averageWords = totalWords / totalEssays
- ✅ errorTrends covers last 7 days
**Priority:** P1

---

#### TC-INT-019: Analytics - Monthly Period
**Endpoint:** `GET /api/analytics/:userId?period=month`  
**Expected:**
- ✅ Error trends cover last 30 days
- ✅ Calculations accurate for larger dataset
**Priority:** P2

---

#### TC-INT-020: Analytics - All Time
**Endpoint:** `GET /api/analytics/:userId?period=all`  
**Expected:**
- ✅ All user essays included
- ✅ No date filtering applied
**Priority:** P2

---

## 🎭 E2E TESTS (20 Test Cases)

**Tester:** E2E Tester  
**Focus:** User workflows from UI → Backend → Database  
**Tools:** Playwright, Chrome DevTools

### Group 1: Essay Creation Workflow (5 tests)

#### TC-E2E-001: Browse Prompts and Start Essay
**User Story:** As a learner, I want to browse prompts and start writing  
**Steps:**
1. Navigate to `/writing/prompts`
2. See grid of prompt cards
3. Filter by CEFR level "A1"
4. Click prompt "Mein Tagesablauf"
5. Click "Start Writing" button
6. Redirect to `/writing/essays/new?promptId=<id>`

**Expected:**
- ✅ Prompt selector shows only A1 prompts after filter
- ✅ Prompt card displays title, description, word count
- ✅ New essay page loads with empty editor
- ✅ Prompt title displayed above editor

**Assertions (Playwright):**
```typescript
await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(10);
await page.click('button:has-text("A1")');
await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(3);
await page.click('text=Mein Tagesablauf');
await expect(page).toHaveURL(/essays\/new\?promptId=/);
```
**Priority:** P0

---

#### TC-E2E-002: Write Content and See Word Count
**Steps:**
1. In editor, type: "Ich gehe zur Schule. Dann esse ich."
2. Observe word count display

**Expected:**
- ✅ Word count updates in real-time
- ✅ Displays "7 words"
- ✅ Word counter visible above editor

**Assertions:**
```typescript
await page.fill('[contenteditable]', 'Ich gehe zur Schule. Dann esse ich.');
await expect(page.locator('[data-testid="word-count"]')).toContainText('7 words');
```
**Priority:** P0

---

#### TC-E2E-003: Auto-Save Triggers After 10 Seconds
**Steps:**
1. Type content in editor
2. Stop typing
3. Wait 10 seconds
4. Check auto-save indicator

**Expected:**
- ✅ "Saving..." indicator appears after 10s
- ✅ Changes to "Saved at HH:MM:SS"
- ✅ Network request to `PUT /api/essays/:id` captured

**Assertions:**
```typescript
await page.waitForTimeout(10000);
await expect(page.locator('text=Saving...')).toBeVisible();
await page.waitForResponse(response => 
  response.url().includes('/api/essays/') && response.request().method() === 'PUT'
);
await expect(page.locator('text=/Saved at/')).toBeVisible();
```
**Priority:** P0

---

#### TC-E2E-004: Check Grammar Button Triggers API Call
**Steps:**
1. Type: "Ich gehe zu die Bibliothek."
2. Click "Check Grammar" button
3. Wait for response

**Expected:**
- ✅ Loading spinner appears
- ✅ Errors displayed in feedback panel (right side)
- ✅ Error underlines appear in editor (red wavy lines)

**Assertions:**
```typescript
await page.click('button:has-text("Check Grammar")');
await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
await page.waitForResponse('/api/grammar/check');
await expect(page.locator('[data-testid="error-card"]')).toHaveCount(1);
await expect(page.locator('.error-underline')).toBeVisible();
```
**Priority:** P0

---

#### TC-E2E-005: Apply Suggestion Replaces Text
**Steps:**
1. See error "zu die" with suggestion "zur"
2. Click suggestion button "zur"
3. Observe editor content

**Expected:**
- ✅ Editor content changes to "Ich gehe zur Bibliothek."
- ✅ Error disappears from feedback panel
- ✅ Word count recalculates

**Assertions:**
```typescript
await page.click('button:has-text("zur")');
await expect(page.locator('[contenteditable]')).toContainText('Ich gehe zur Bibliothek.');
await expect(page.locator('[data-testid="error-card"]')).toHaveCount(0);
```
**Priority:** P0

---

### Group 2: Error Highlighting (4 tests)

#### TC-E2E-006: Multiple Errors - Different Colors
**Steps:**
1. Type text with grammar, spelling, and style errors
2. Check grammar
3. Observe error highlighting

**Expected:**
- ✅ Grammar errors: red underline
- ✅ Spelling errors: blue underline
- ✅ Style errors: orange underline
- ✅ All errors visible simultaneously

**Priority:** P1

---

#### TC-E2E-007: Ignore Error Hides It
**Steps:**
1. See grammar error
2. Click "X" (ignore button)

**Expected:**
- ✅ Error removed from feedback panel
- ✅ Underline disappears from editor
- ✅ Error count decrements

**Priority:** P1

---

#### TC-E2E-008: Error Context Display
**Steps:**
1. Hover over error in feedback panel

**Expected:**
- ✅ Tooltip shows surrounding text context
- ✅ Error position highlighted

**Priority:** P2

---

#### TC-E2E-009: Error Re-Check After Applying All Suggestions
**Steps:**
1. Check grammar (3 errors found)
2. Apply all 3 suggestions
3. Click "Re-check Grammar"

**Expected:**
- ✅ New check performed
- ✅ Error count = 0
- ✅ Success message: "No errors found! 🎉"

**Priority:** P1

---

### Group 3: Mobile Responsive (4 tests)

#### TC-E2E-010: Mobile Layout - Bottom Drawer
**Steps:**
1. Open in mobile viewport (390x844)
2. Start writing
3. Click "Feedback" button at bottom

**Expected:**
- ✅ Editor takes full width
- ✅ Feedback drawer slides up from bottom
- ✅ Drawer height: 60% of viewport
- ✅ Backdrop overlay visible

**Assertions:**
```typescript
await page.setViewportSize({ width: 390, height: 844 });
await page.click('[data-testid="feedback-toggle"]');
await expect(page.locator('[data-testid="feedback-drawer"]')).toHaveClass(/translate-y-0/);
```
**Priority:** P1

---

#### TC-E2E-011: Mobile - Drawer Close on Backdrop Click
**Steps:**
1. Open feedback drawer
2. Click backdrop (dark overlay)

**Expected:**
- ✅ Drawer slides down
- ✅ Backdrop disappears

**Priority:** P2

---

#### TC-E2E-012: Mobile - Touch-Friendly Buttons
**Steps:**
1. Tap suggestion button
2. Tap ignore button

**Expected:**
- ✅ Buttons are ≥44px tall (iOS guidelines)
- ✅ No accidental double-taps
- ✅ Haptic feedback (if supported)

**Priority:** P2

---

#### TC-E2E-013: Tablet Layout - Side-by-Side
**Steps:**
1. Open in tablet viewport (1024x768)

**Expected:**
- ✅ Desktop layout (side-by-side)
- ✅ Editor on left (flex-1)
- ✅ Feedback panel on right (w-96)

**Priority:** P2

---

### Group 4: Essay Dashboard (4 tests)

#### TC-E2E-014: View Essay List
**Steps:**
1. Navigate to `/writing/essays`
2. See list of user's essays

**Expected:**
- ✅ Essays sorted by date (newest first)
- ✅ Each card shows: prompt title, preview, word count, error count, status
- ✅ "New Essay" button at top

**Priority:** P1

---

#### TC-E2E-015: Filter Essays by Status
**Steps:**
1. Click "Drafts" filter button

**Expected:**
- ✅ Only draft essays visible
- ✅ Submitted/reviewed hidden

**Priority:** P2

---

#### TC-E2E-016: Delete Essay Confirmation
**Steps:**
1. Click delete icon on essay card
2. See confirmation modal
3. Click "Delete"

**Expected:**
- ✅ Confirmation modal: "Are you sure?"
- ✅ Essay removed from list
- ✅ Toast: "Essay deleted successfully"

**Priority:** P1

---

#### TC-E2E-017: Empty State - No Essays
**Steps:**
1. New user with 0 essays visits dashboard

**Expected:**
- ✅ Empty state illustration
- ✅ Message: "You haven't written any essays yet"
- ✅ "Start Writing" CTA button

**Priority:** P2

---

### Group 5: Analytics Dashboard (3 tests)

#### TC-E2E-018: View Writing Stats
**Steps:**
1. Navigate to `/writing/analytics`
2. See statistics dashboard

**Expected:**
- ✅ Total essays count
- ✅ Average word count
- ✅ Error rate chart (Recharts line chart)
- ✅ Common errors pie chart

**Priority:** P1

---

#### TC-E2E-019: Filter Analytics by Period
**Steps:**
1. Click "This Week" filter
2. Observe chart updates

**Expected:**
- ✅ Chart shows last 7 days data
- ✅ Stats recalculated for period

**Priority:** P2

---

#### TC-E2E-020: No Data State
**Steps:**
1. New user views analytics

**Expected:**
- ✅ Empty state: "No data yet. Start writing!"
- ✅ CTA to browse prompts

**Priority:** P2

---

## ⚡ PERFORMANCE TESTS (12 Test Cases)

**Tester:** Performance Tester  
**Focus:** Response times, caching, database query optimization  
**Tools:** k6, Apache JMeter, Chrome DevTools Performance tab

### Group 1: API Response Times (6 tests)

#### TC-PERF-001: Grammar Check - Cached Response
**Endpoint:** `POST /api/grammar/check`  
**Test:** Send same text twice within 24h  
**Target:** <100ms (p95)  
**Method:**
```javascript
// k6 script
export default function() {
  http.post('http://localhost:3001/api/grammar/check', {
    text: 'Ich gehe zu die Bibliothek.',
    language: 'de-DE'
  });
}
```
**Assertions:**
- ✅ First request: <3000ms (LanguageTool API call)
- ✅ Second request: <100ms (Redis cache hit)
- ✅ Cache hit rate >90% for repeated texts
**Priority:** P0

---

#### TC-PERF-002: Grammar Check - Uncached (LanguageTool API)
**Target:** <3000ms (p95)  
**Test:** Send 10 unique texts  
**Expected:**
- ✅ All responses <3s
- ✅ No timeouts
**Priority:** P1

---

#### TC-PERF-003: Essay List - Pagination Performance
**Endpoint:** `GET /api/essays?limit=20&offset=0`  
**Target:** <200ms  
**Precondition:** User has 1000 essays  
**Expected:**
- ✅ First page: <200ms
- ✅ Offset=500: <200ms (index optimized)
**Priority:** P1

---

#### TC-PERF-004: Analytics Calculation - Large Dataset
**Endpoint:** `GET /api/analytics/:userId?period=all`  
**Target:** <500ms  
**Precondition:** User has 100 essays  
**Expected:**
- ✅ Aggregation queries optimized
- ✅ Response time <500ms
**Priority:** P1

---

#### TC-PERF-005: Auto-Save Update
**Endpoint:** `PUT /api/essays/:id`  
**Target:** <150ms  
**Test:** Update essay with 500-word content  
**Expected:**
- ✅ Word count calculation <10ms
- ✅ Database update <100ms
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

#### TC-PERF-007: Editor Initial Render
**Test:** Measure time from page load to editor interactive  
**Target:** <1500ms  
**Method:** Lighthouse audit  
**Expected:**
- ✅ First Contentful Paint: <1s
- ✅ Time to Interactive: <1.5s
- ✅ Lexical bundle size <150KB gzipped
**Priority:** P1

---

#### TC-PERF-008: Word Count Calculation - Large Essay
**Test:** Type 1000-word essay, measure word count update time  
**Target:** <50ms per update  
**Expected:**
- ✅ Real-time updates (no lag)
- ✅ Algorithm: O(n) complexity acceptable
**Priority:** P2

---

#### TC-PERF-009: Error Highlighting - 50 Errors
**Test:** Display essay with 50 grammar errors  
**Target:** <200ms to render all highlights  
**Expected:**
- ✅ CSS overlay approach performant
- ✅ No janky scrolling
**Priority:** P2

---

#### TC-PERF-010: Auto-Save Debouncing
**Test:** Type continuously for 30 seconds  
**Expected:**
- ✅ Only 1 save triggered (10s after last keystroke)
- ✅ No network spam
**Priority:** P1

---

### Group 3: Load Testing (2 tests)

#### TC-PERF-011: Concurrent Grammar Checks
**Test:** 100 users checking grammar simultaneously  
**Target:** No failures, avg response <5s  
**Method:** k6 load test  
**Expected:**
- ✅ Rate limiting enforced (60 req/min per user)
- ✅ Redis caching reduces LanguageTool load
- ✅ No 5xx errors
**Priority:** P1

---

#### TC-PERF-012: Database Connection Pool
**Test:** 200 concurrent API requests (mixed endpoints)  
**Expected:**
- ✅ No connection pool exhaustion
- ✅ Prisma connection pooling configured
- ✅ Max connections: 10 (configurable)
**Priority:** P1

---

## 🔒 SECURITY TESTS (10 Test Cases)

**Tester:** Security Tester  
**Focus:** Authentication, authorization, input validation, XSS, SQL injection  
**Tools:** OWASP ZAP, Burp Suite, manual testing

### Group 1: Authentication & Authorization (4 tests)

#### TC-SEC-001: JWT Token Validation
**Test:** Send request with expired JWT  
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

#### TC-SEC-002: Essay Ownership Enforcement
**Test:** User A tries to update User B's essay  
**Method:** Modify userId in JWT or essay ID in URL  
**Expected:**
- ✅ Status code: 403 Forbidden
- ✅ No data leaked about essay existence
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
**Test:** Send 100 requests from same user with different IPs  
**Expected:**
- ✅ Rate limit still enforced (user-based, not IP-based)
- ✅ Status 429 after 60 req/min
**Priority:** P1

---

### Group 2: Input Validation (3 tests)

#### TC-SEC-005: SQL Injection - Essay Content
**Test:** Create essay with content:
```sql
'; DROP TABLE essays; --
```
**Expected:**
- ✅ Content stored as-is (Prisma parameterization prevents injection)
- ✅ No SQL executed
- ✅ Essays table still exists
**Priority:** P0

---

#### TC-SEC-006: XSS Attack - Essay Content
**Test:** Create essay with content:
```html
<script>alert('XSS')</script>
```
**Expected (Backend):**
- ✅ Content stored as-is (no sanitization needed at storage)

**Expected (Frontend):**
- ✅ React escapes by default (no script execution)
- ✅ If using `dangerouslySetInnerHTML`, DOMPurify must be used
**Priority:** P0

---

#### TC-SEC-007: Input Length Validation
**Test Scenarios:**
- Essay content: 200,000 characters (exceeds limit)
- Email: 500 characters
- Password: 5 characters (too short)

**Expected:**
- ✅ All return 400 Bad Request with validation error
- ✅ Zod schema validation messages clear
**Priority:** P1

---

### Group 3: CORS & Headers (3 tests)

#### TC-SEC-008: CORS - Unauthorized Origin
**Test:** Send API request from `http://malicious-site.com`  
**Expected:**
- ✅ CORS error in browser console
- ✅ No response data returned
- ✅ Allowed origins: `localhost:3000` (dev) or production domain
**Priority:** P1

---

#### TC-SEC-009: Security Headers Present
**Test:** Inspect response headers  
**Expected Headers (Helmet middleware):**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security: max-age=31536000`
**Priority:** P1

---

#### TC-SEC-010: Sensitive Data in Logs
**Test:** Trigger error with password in request  
**Check:** Server logs  
**Expected:**
- ✅ Passwords NOT logged (even in error messages)
- ✅ JWT tokens NOT logged
- ✅ Only sanitized error messages logged
**Priority:** P1

---

## 📊 TEST DATA REQUIREMENTS

### Users (Authentication)
```javascript
// Test users to create
[
  { email: 'test1@example.com', password: 'password123', name: 'Test User 1', tier: 'free' },
  { email: 'test2@example.com', password: 'password123', name: 'Test User 2', tier: 'premium' },
  { email: 'admin@example.com', password: 'adminpass', name: 'Admin', tier: 'admin' }
]
```

### Writing Prompts (Seed Data)
```javascript
// Expected in database (from backend seed)
[
  { cefrLevel: 'A1', category: 'daily_life', targetWordCount: 100 },  // 5 prompts
  { cefrLevel: 'A2', category: 'personal', targetWordCount: 150 },   // 5 prompts
  { cefrLevel: 'B1', category: 'opinion', targetWordCount: 200 },    // 5 prompts
  { cefrLevel: 'B2', category: 'academic', targetWordCount: 300 }    // 5 prompts
]
// Total: 20 prompts minimum
```

### Essays (Test Data)
```javascript
// Create via API for each test user
[
  { promptId: '<uuid>', content: 'Short draft', status: 'draft', wordCount: 50 },
  { promptId: '<uuid>', content: 'Medium essay...', status: 'submitted', wordCount: 200 },
  { promptId: '<uuid>', content: 'Long essay...', status: 'reviewed', wordCount: 500 }
]
// Per user: 10 essays (3 draft, 4 submitted, 3 reviewed)
```

### Grammar Errors (Sample Texts)
```javascript
// German texts for testing
const germanSamples = [
  'Ich gehe zu die Bibliothek.',                    // Grammar error (preposition)
  'Er hat ein Hund.',                               // Grammar error (article)
  'Das ist ein gutte Idee.',                        // Spelling error
  'Wir sind gestern zur Schule gegangen und haben Sport gespielt.'  // No errors
];

// English texts (for multi-language testing)
const englishSamples = [
  'I goes to school.',                              // Grammar error (verb)
  'She dont like apples.',                          // Grammar error (apostrophe)
  'This is a good idea and I agree with it.'       // No errors
];
```

---

## 🎯 TEST EXECUTION PLAN

### Phase 1: Setup (Day 1 - 2h)
- ✅ Install dependencies (Playwright, k6, Postman)
- ✅ Seed database with test data (20 prompts, 3 users, 30 essays)
- ✅ Start backend service (port 3001)
- ✅ Start frontend dev server (port 3000)
- ✅ Configure environment variables (.env.test)

### Phase 2: Integration Testing (Day 1-2 - 4h)
- ✅ Run TC-INT-001 to TC-INT-020 sequentially
- ✅ Document failures in bug tracker
- ✅ Re-test after fixes

### Phase 3: E2E Testing (Day 2-3 - 4h)
- ✅ Run TC-E2E-001 to TC-E2E-020 with Playwright
- ✅ Record video of critical paths
- ✅ Generate coverage report

### Phase 4: Performance Testing (Day 3 - 3h)
- ✅ Run k6 load tests (TC-PERF-001 to TC-PERF-012)
- ✅ Analyze Lighthouse reports
- ✅ Optimize if response times exceed targets

### Phase 5: Security Testing (Day 3-4 - 3h)
- ✅ Run OWASP ZAP scan
- ✅ Manual security tests (TC-SEC-001 to TC-SEC-010)
- ✅ Fix critical vulnerabilities immediately

### Phase 6: Regression Testing (Day 4 - 2h)
- ✅ Re-run all P0 tests after fixes
- ✅ Smoke test critical paths
- ✅ Sign-off on test completion

---

## 📝 BUG SEVERITY CLASSIFICATION

### Critical (P0) - Blockers
- ✅ **Cannot create essay** (API returns 500)
- ✅ **Auto-save fails silently** (data loss)
- ✅ **Authentication broken** (all requests 401)
- ✅ **SQL injection possible**
- ✅ **XSS attack successful**

### High (P1) - Major Issues
- ✅ Grammar check never returns (timeout)
- ✅ Rate limiting not enforced (API abuse)
- ✅ Error highlighting incorrect positions
- ✅ Ownership bypass (can edit other's essays)
- ✅ Performance >2x targets (e.g., 6s grammar check)

### Medium (P2) - Minor Issues
- ✅ Word count off by 1-2 words
- ✅ UI layout breaks on specific viewport (but usable)
- ✅ Error message typo
- ✅ Loading spinner doesn't show

### Low (P3) - Cosmetic
- ✅ Button color mismatch
- ✅ Tooltip positioning slightly off
- ✅ Console warning (not affecting functionality)

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass (100%):
- ✅ All P0 integration tests (TC-INT-001, 003, 004, 009, 010, 011)
- ✅ All P0 E2E tests (TC-E2E-001, 002, 003, 004, 005)
- ✅ All P0 security tests (TC-SEC-001, 002, 003, 005, 006)
- ✅ Grammar check cache hit <100ms
- ✅ Auto-save triggers correctly

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
**File:** `.testing/TEST_RESULTS_writing.md`  
**Contents:**
- Test cases run vs passed/failed/skipped
- Bug list with severity
- Screenshots/videos of failures
- Performance metrics

### 2. Bug Report
**File:** `.testing/BUGS_writing.md`  
**Format:**
```markdown
## BUG-001: Auto-save triggers on every keystroke
**Severity:** P1 (High)  
**Steps to Reproduce:**
1. Open editor
2. Type one character
3. Observe network tab

**Expected:** Debounced save after 10s  
**Actual:** Save triggers on every keystroke  
**Root Cause:** useAutoSave delay not configured  
**Fix:** Set `delay: 10000` in hook  
**Status:** FIXED
```

### 3. Coverage Report
**File:** `.testing/COVERAGE_writing.md`  
**Metrics:**
- Integration test coverage: X/20 passed
- E2E test coverage: X/20 passed
- Performance test coverage: X/12 passed
- Security test coverage: X/10 passed
- **Total:** X/62 passed (Y%)

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
**Backend Developer:** backend-writing-v2 session  
**Frontend Developer:** frontend-writing-v2 session  
**Integration Specialist:** integration-specialist-writing session  

**Documentation:**
- Technical Spec: `.execution/TECH_SPEC_writing_phase1.md`
- Backend Completion: `.execution/BACKEND_COMPLETION_writing.md`
- Frontend Completion: `.execution/FRONTEND_COMPLETION_writing.md`
- Integration Completion: `.execution/INTEGRATION_COMPLETE_writing.md`

---

**Test Plan Version:** 1.0  
**Last Updated:** February 7, 2026  
**Total Test Cases:** 62  
**Estimated Effort:** 10-14 hours (4 testers in parallel)  
**Status:** ✅ READY FOR EXECUTION
