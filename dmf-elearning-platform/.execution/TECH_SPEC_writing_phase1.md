# TECH_SPEC - Writing Module Phase 1

**Project:** DMF E-Learning Platform - Writing Module MVP  
**Tech Lead:** Tech Lead Review  
**Version:** 1.0  
**Date:** February 7, 2026  
**Status:** ✅ APPROVED

---

## 🎯 Executive Summary

This technical specification defines the architecture, API contracts, database schema, and implementation details for the Writing Module Phase 1. The module provides German language learners with real-time grammar correction, structured essay prompts, and progress tracking.

**Key Technical Decisions:**
- **Architecture:** Microservice (writing-service) integrated into existing monorepo
- **Database:** PostgreSQL with Prisma ORM (consistent with existing services)
- **Editor:** Lexical (Meta's rich text framework) for extensibility
- **Grammar Engine:** LanguageTool API with Redis caching layer
- **State Management:** React Query (server) + Zustand (client)
- **Deployment:** Vercel (frontend) + Railway (backend + infrastructure)

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Lexical      │  │ React Query  │  │ Zustand      │      │
│  │ Editor       │  │ (API Client) │  │ (UI State)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth         │  │ Rate         │  │ CORS         │      │
│  │ Middleware   │  │ Limiting     │  │ Config       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Writing Service (Node.js)                   │
│  ┌──────────────────────────────────────────────┐           │
│  │  API Routes (Express/Fastify)                │           │
│  │  /auth, /essays, /prompts, /grammar, /analytics          │
│  └──────────────────────────────────────────────┘           │
│                            ↓                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Essay        │  │ Grammar      │  │ Analytics    │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │    │ Redis Cache  │    │ LanguageTool │
│ (Primary DB) │    │ (Grammar)    │    │ API (Extern) │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Service Integration in Monorepo

```
dmf-elearning-platform/
├── services/
│   ├── writing-service/           ← NEW SERVICE
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── onboarding-service/        ← EXISTING
│   ├── learning-service/          ← EXISTING
│   └── ...
├── apps/
│   └── web/                       ← EXISTING (Add Writing UI)
│       └── src/
│           └── features/
│               └── writing/       ← NEW FEATURE MODULE
└── packages/
    └── shared/                    ← SHARED TYPES
```

---

## 📊 Database Schema

### Schema Design (Prisma)

**File:** `services/writing-service/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================
model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  name         String?  @db.VarChar(255)
  tier         String   @default("free") @db.VarChar(20) // free, premium, classroom
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  essays Essay[]

  @@index([email])
  @@map("users")
}

// ============================================
// ESSAY PROMPTS
// ============================================
model Prompt {
  id              String   @id @default(uuid()) @db.Uuid
  title           String   @db.VarChar(255)
  description     String   @db.Text
  cefrLevel       String   @map("cefr_level") @db.VarChar(2) // A1, A2, B1, B2
  category        String?  @db.VarChar(100) // daily_life, opinion, description, formal_letter
  targetWordCount Int      @default(200) @map("target_word_count")
  tips            Json?    // Array of writing tips
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  essays Essay[]

  @@index([cefrLevel], name: "idx_prompts_cefr_level")
  @@index([category], name: "idx_prompts_category")
  @@map("prompts")
}

// ============================================
// USER ESSAYS
// ============================================
model Essay {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  promptId           String?   @map("prompt_id") @db.Uuid
  content            String    @db.Text
  wordCount          Int       @default(0) @map("word_count")
  errorCount         Int       @default(0) @map("error_count")
  writingTimeSeconds Int       @default(0) @map("writing_time_seconds")
  status             String    @default("draft") @db.VarChar(20) // draft, submitted, reviewed

  // Future SRS fields (Phase 2)
  reviewCount  Int       @default(0) @map("review_count")
  nextReviewAt DateTime? @map("next_review_at") @db.Timestamptz(6)
  easeFactor   Decimal   @default(2.5) @map("ease_factor") @db.Decimal(3, 2)

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt        Prompt?        @relation(fields: [promptId], references: [id], onDelete: SetNull)
  grammarErrors GrammarError[]

  @@index([userId], name: "idx_essays_user_id")
  @@index([createdAt(sort: Desc)], name: "idx_essays_created_at")
  @@index([status], name: "idx_essays_status")
  @@index([nextReviewAt], name: "idx_essays_next_review")
  @@index([userId, createdAt(sort: Desc)], name: "idx_essays_user_created")
  @@map("essays")
}

// ============================================
// GRAMMAR ERRORS
// ============================================
model GrammarError {
  id          String   @id @default(uuid()) @db.Uuid
  essayId     String   @map("essay_id") @db.Uuid
  errorType   String   @map("error_type") @db.VarChar(50) // grammar, spelling, style
  message     String   @db.Text
  offset      Int      // Character position in text
  length      Int      // Length of error span
  suggestions Json?    // Array of { value: string }
  ruleId      String?  @map("rule_id") @db.VarChar(100) // LanguageTool rule ID
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  essay Essay @relation(fields: [essayId], references: [id], onDelete: Cascade)

  @@index([essayId], name: "idx_grammar_errors_essay_id")
  @@index([errorType], name: "idx_grammar_errors_type")
  @@index([ruleId], name: "idx_grammar_errors_rule_id")
  @@map("grammar_errors")
}
```

### Sample Data Structure

**Tips JSON Structure:**
```json
{
  "tips": [
    "Use present tense (Präsens): ich gehe, ich esse, ich schlafe",
    "Include time expressions: um 7 Uhr, dann, danach, später",
    "Mention at least 5 daily activities"
  ]
}
```

**Suggestions JSON Structure:**
```json
{
  "suggestions": [
    { "value": "zur" },
    { "value": "in die" }
  ]
}
```

### Database Constraints

```sql
-- User tier validation
ALTER TABLE users ADD CONSTRAINT check_tier 
  CHECK (tier IN ('free', 'premium', 'classroom'));

-- CEFR level validation
ALTER TABLE prompts ADD CONSTRAINT check_cefr_level 
  CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

-- Essay status validation
ALTER TABLE essays ADD CONSTRAINT check_status 
  CHECK (status IN ('draft', 'submitted', 'reviewed'));

-- Error type validation
ALTER TABLE grammar_errors ADD CONSTRAINT check_error_type 
  CHECK (error_type IN ('grammar', 'spelling', 'style'));

-- Word count positive
ALTER TABLE essays ADD CONSTRAINT check_word_count_positive 
  CHECK (word_count >= 0);

-- Content length limit (100k chars)
ALTER TABLE essays ADD CONSTRAINT check_content_length 
  CHECK (LENGTH(content) <= 100000);
```

---

## 🔌 API Contracts

### Authentication

#### POST `/api/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "jwt-token-here"
}
```

**Errors:**
- `400`: Email already exists
- `400`: Password too short (\u003c8 characters)
- `400`: Invalid email format

---

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "jwt-token-here"
}
```

**Errors:**
- `401`: Invalid credentials

---

### Prompts

#### GET `/api/prompts`
**Query Parameters:**
- `level` (optional): CEFR level filter (A1, A2, B1, B2)
- `category` (optional): Category filter (daily_life, opinion, etc.)

**Response (200):**
```json
{
  "prompts": [
    {
      "id": "uuid-here",
      "title": "Mein Tagesablauf",
      "description": "Beschreibe deinen typischen Tagesablauf...",
      "cefrLevel": "A1",
      "category": "daily_life",
      "targetWordCount": 100,
      "tips": {
        "tips": [
          "Use present tense",
          "Include time expressions"
        ]
      },
      "createdAt": "2026-02-07T00:00:00Z"
    }
  ]
}
```

---

### Essays

#### POST `/api/essays`
**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request:**
```json
{
  "promptId": "uuid-here",
  "content": "Ich gehe zur Schule..."
}
```

**Response (201):**
```json
{
  "essay": {
    "id": "uuid-here",
    "userId": "uuid-here",
    "promptId": "uuid-here",
    "content": "Ich gehe zur Schule...",
    "wordCount": 4,
    "errorCount": 0,
    "status": "draft",
    "createdAt": "2026-02-07T00:00:00Z",
    "updatedAt": "2026-02-07T00:00:00Z"
  }
}
```

---

#### GET `/api/essays`
**Headers:**
- `Authorization: Bearer <jwt-token>`

**Query Parameters:**
- `limit` (optional, default: 20): Number of essays per page
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
```json
{
  "essays": [
    {
      "id": "uuid-here",
      "prompt": {
        "title": "Mein Tagesablauf"
      },
      "content": "Ich gehe zur Schule...",
      "wordCount": 4,
      "errorCount": 0,
      "createdAt": "2026-02-07T00:00:00Z"
    }
  ],
  "total": 15
}
```

---

#### PUT `/api/essays/:id`
**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request:**
```json
{
  "content": "Updated content...",
  "errorCount": 2,
  "writingTimeSeconds": 300,
  "status": "submitted"
}
```

**Response (200):**
```json
{
  "essay": {
    "id": "uuid-here",
    "content": "Updated content...",
    "wordCount": 10,
    "errorCount": 2,
    "writingTimeSeconds": 300,
    "status": "submitted",
    "updatedAt": "2026-02-07T00:00:00Z"
  }
}
```

**Errors:**
- `404`: Essay not found or access denied

---

### Grammar Checking

#### POST `/api/grammar/check`
**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request:**
```json
{
  "text": "Ich gehe zu die Bibliothek.",
  "language": "de-DE"
}
```

**Response (200):**
```json
{
  "errors": [
    {
      "type": "grammar",
      "message": "Falsche Präposition nach 'gehen'",
      "shortMessage": "Falsche Präposition",
      "offset": 9,
      "length": 7,
      "context": {
        "text": "Ich gehe zu die Bibliothek.",
        "offset": 9,
        "length": 7
      },
      "suggestions": [
        { "value": "zur" },
        { "value": "in die" }
      ],
      "ruleId": "DE_PREPOSITION_CONTRACTION",
      "category": "GRAMMAR"
    }
  ],
  "language": "de-DE",
  "processingTimeMs": 245
}
```

**Rate Limiting:**
- 60 requests per minute per user
- Returns `429 Too Many Requests` if exceeded

---

### Analytics

#### GET `/api/analytics/:userId`
**Headers:**
- `Authorization: Bearer <jwt-token>`

**Query Parameters:**
- `period` (optional, default: "month"): week | month | all

**Response (200):**
```json
{
  "stats": {
    "totalEssays": 15,
    "totalWords": 3500,
    "averageWords": 233,
    "errorRate": 4.2,
    "errorTrends": [
      {
        "date": "2026-02-06",
        "errorRate": 5.1
      },
      {
        "date": "2026-02-05",
        "errorRate": 3.8
      }
    ],
    "commonErrors": [
      {
        "type": "grammar",
        "count": 25
      },
      {
        "type": "spelling",
        "count": 12
      }
    ]
  }
}
```

**Errors:**
- `403`: User can only access their own analytics

---

## 🔧 Technical Implementation Details

### 1. LanguageTool Integration

**Service Class:** `LanguageToolService`

```typescript
class LanguageToolService {
  private apiUrl: string;
  private redisClient: RedisClient;

  async checkGrammar(text: string, language: string): Promise<{
    errors: GrammarError[];
    processingTimeMs: number;
  }> {
    // 1. Generate cache key (SHA-256 hash of text + language)
    const cacheKey = this.getCacheKey(text, language);

    // 2. Check Redis cache (TTL: 24 hours)
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return { errors: JSON.parse(cached), processingTimeMs: 0 };
    }

    // 3. Call LanguageTool API
    const response = await axios.post(this.apiUrl, {
      text,
      language,
      enabledOnly: false,
    });

    // 4. Parse and categorize errors
    const errors = this.parseErrors(response.data.matches);

    // 5. Cache results
    await this.redisClient.setEx(cacheKey, 86400, JSON.stringify(errors));

    return { errors, processingTimeMs: Date.now() - startTime };
  }

  private categorizeError(categoryId: string): 'spelling' | 'grammar' | 'style' {
    const cat = categoryId.toUpperCase();
    if (cat.includes('TYPO') || cat.includes('SPELL')) return 'spelling';
    if (cat.includes('STYLE') || cat.includes('REDUNDANCY')) return 'style';
    return 'grammar';
  }
}
```

**Caching Strategy:**
- **Key:** SHA-256 hash of `${text}:${language}`
- **TTL:** 24 hours
- **Hit Rate Target:** 60-80% (same text checked multiple times)
- **Invalidation:** None (errors don't change for same text)

---

### 2. Lexical Editor Integration

**Custom Error Highlighting Plugin:**

```typescript
// Custom decorator for error underlines
class ErrorDecorator extends DecoratorNode<ReactNode> {
  __error: GrammarError;

  static getType(): string {
    return 'error-decorator';
  }

  decorate(): ReactNode {
    return (
      <span
        className={`error-underline error-${this.__error.type}`}
        data-error-id={this.__error.id}
        title={this.__error.message}
      />
    );
  }
}

// Plugin to apply decorators
function ErrorHighlightPlugin({ errors }: { errors: GrammarError[] }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        // Apply error decorators at specific offsets
        errors.forEach((error) => {
          const range = { offset: error.offset, length: error.length };
          // Insert decorator node at range
          // (Simplified - actual implementation more complex)
        });
      });
    });
  }, [editor, errors]);

  return null;
}
```

**Alternative (Simpler for MVP):**
Use CSS overlay with absolute-positioned `<span>` elements calculated from text ranges.

---

### 3. Auto-Save Strategy

**Implementation:**

```typescript
// Debounced auto-save hook
function useAutoSave(content: string, essayId: string, delay = 10000) {
  const updateEssay = useUpdateEssay();

  const debouncedSave = useDebouncedCallback(
    async (text: string) => {
      if (essayId && text.length > 0) {
        await updateEssay.mutateAsync({
          id: essayId,
          content: text,
        });
      }
    },
    delay
  );

  useEffect(() => {
    debouncedSave(content);
  }, [content]);
}
```

**Conflict Resolution:**
- **Strategy:** Last-write-wins (simple, acceptable for single-user editing)
- **Future:** Operational Transformation (OT) or CRDTs for real-time collaboration (Phase 3)

---

### 4. State Management

**Zustand Store for Editor State:**

```typescript
interface EditorState {
  content: string;
  wordCount: number;
  writingTime: number;
  isAutoSaving: boolean;
  lastSaved: Date | null;

  setContent: (content: string) => void;
  incrementWritingTime: () => void;
  markSaved: () => void;
}

const useEditorStore = create<EditorState>((set) => ({
  content: '',
  wordCount: 0,
  writingTime: 0,
  isAutoSaving: false,
  lastSaved: null,

  setContent: (content) => set({ content }),
  incrementWritingTime: () => set((state) => ({ 
    writingTime: state.writingTime + 1 
  })),
  markSaved: () => set({ 
    lastSaved: new Date(), 
    isAutoSaving: false 
  }),
}));
```

**React Query for Server State:**
- Cache time: 5 minutes (stale while revalidating)
- Automatic cache invalidation on mutations
- Optimistic updates for essay content

---

## 🚀 Deployment Architecture

### Infrastructure

```
┌──────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                      │
│  - CDN: Global edge network                              │
│  - Auto-deploy on push to main                           │
│  - Environment: VITE_API_URL                             │
└──────────────────────────────────────────────────────────┘
                           ↓ HTTPS
┌──────────────────────────────────────────────────────────┐
│                  Railway (Backend + Infra)                │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │ Writing Service│  │ PostgreSQL     │                  │
│  │ (Node.js)      │  │ (Database)     │                  │
│  └────────────────┘  └────────────────┘                  │
│  ┌────────────────┐                                       │
│  │ Redis Cache    │                                       │
│  │ (Grammar)      │                                       │
│  └────────────────┘                                       │
└──────────────────────────────────────────────────────────┘
                           ↓ External API
┌──────────────────────────────────────────────────────────┐
│              LanguageTool API (External)                  │
│  - Self-hosted backup (Docker on Railway)                │
│  - Automatic failover                                     │
└──────────────────────────────────────────────────────────┘
```

### Environment Variables

**Frontend (Vercel):**
```env
VITE_API_URL=https://dmf-writing-api.up.railway.app
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Backend (Railway):**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dmf_writing
REDIS_URL=redis://default:pass@host:6379
JWT_SECRET=super-secret-64-char-random-string
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
NODE_ENV=production
PORT=3001
```

---

## 📈 Performance Requirements

### Response Time Targets

| Endpoint | Target (p95) | Max (p99) |
|----------|--------------|-----------|
| `/api/auth/login` | \u003c200ms | \u003c500ms |
| `/api/prompts` | \u003c100ms | \u003c300ms |
| `/api/essays` (list) | \u003c200ms | \u003c500ms |
| `/api/essays/:id` | \u003c150ms | \u003c400ms |
| `/api/grammar/check` | \u003c1000ms | \u003c2000ms |
| `/api/analytics/:userId` | \u003c300ms | \u003c800ms |

### Database Query Optimization

**Indexed Queries:**
```sql
-- User's essays (most common query)
SELECT * FROM essays 
WHERE user_id = '...' 
ORDER BY created_at DESC 
LIMIT 10;
-- Uses: idx_essays_user_created (user_id, created_at DESC)
-- Expected: \u003c5ms

-- Prompts by level (common query)
SELECT * FROM prompts 
WHERE cefr_level = 'B1';
-- Uses: idx_prompts_cefr_level
-- Expected: \u003c2ms

-- Essay errors (always fetched with essay)
SELECT * FROM grammar_errors 
WHERE essay_id = '...';
-- Uses: idx_grammar_errors_essay_id
-- Expected: \u003c3ms
```

**Query Complexity:**
- Avoid N+1 queries (use Prisma `include`)
- Limit joins to 2 tables max
- Paginate all lists (default 20 items)

---

## 🔒 Security Considerations

### Authentication

**JWT Token:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiration:** 7 days
- **Refresh:** None in Phase 1 (user re-authenticates)
- **Payload:** `{ userId, email, exp, iat }`

**Password Hashing:**
- **Algorithm:** bcrypt
- **Rounds:** 10 (balance between security and performance)
- **Min Length:** 8 characters

### Input Validation

**Essay Content:**
- Max length: 100,000 characters
- Sanitization: None (Lexical handles XSS)
- Validation: UTF-8 encoding only

**Grammar Check:**
- Max length: 100,000 characters
- Rate limiting: 60 requests/min per user
- Timeout: 10 seconds

### CORS Policy

```typescript
app.use(cors({
  origin: [
    'https://dmf-elearning.vercel.app',
    'http://localhost:5173', // Development
  ],
  credentials: true,
}));
```

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
**Coverage Target:** 80%+

**Test Files:**
- `services/languageToolService.test.ts` (grammar check logic)
- `services/essayService.test.ts` (word counting, validation)
- `utils/wordCount.test.ts` (edge cases)

### Component Tests (Frontend)
**Coverage Target:** 70%+

**Test Files:**
- `ErrorCard.test.tsx` (error display)
- `FeedbackPanel.test.tsx` (error grouping)
- `PromptSelector.test.tsx` (filtering)

### E2E Tests (Playwright)
**Test Count:** 25+ scenarios

**Critical Flows:**
1. User registration → Login → Dashboard
2. Select prompt → Write essay → See errors
3. Apply grammar suggestion → Error disappears
4. Auto-save → Refresh → Content persists
5. Mobile responsive → Bottom drawer works

---

## 📊 Scalability Analysis

### Current Capacity (Phase 1)

**Database:**
- PostgreSQL on Railway Starter: 1GB storage
- Estimated capacity: ~100,000 essays
- Estimated users: ~5,000

**Redis:**
- Railway Starter: 256MB memory
- Estimated cache entries: ~50,000
- Hit rate: 60-80%

**API:**
- Node.js on Railway: 512MB RAM
- Concurrent users: ~500
- Requests/second: ~100 (grammar check bottleneck)

### Scaling Strategy (Phase 2+)

**Horizontal Scaling:**
- Add more Node.js instances (Railway autoscaling)
- Load balancer (Railway built-in)

**Database Scaling:**
- Read replicas for analytics queries
- Partitioning by `user_id` (5M+ users)

**Caching:**
- Increase Redis memory (upgrade plan)
- Add CDN caching for static prompts

---

## 🚨 Risk Assessment

### Critical Risks

**1. LanguageTool API Reliability**
- **Probability:** Medium (15-20%)
- **Impact:** High (grammar checking unavailable)
- **Mitigation:** 
  - Self-hosted LanguageTool backup (Docker on Railway)
  - Aggressive caching (60-80% hit rate)
  - Graceful degradation (show cached results or disable feature)

**2. Lexical Editor Complexity**
- **Probability:** Medium (20-25%)
- **Impact:** Medium (delayed timeline)
- **Mitigation:**
  - Start with basic editor (no advanced formatting)
  - Use existing plugins (RichTextPlugin, HistoryPlugin)
  - CSS overlay fallback for error highlighting (simpler)

**3. Performance at Scale**
- **Probability:** Low (10%)
- **Impact:** Medium (slow response times)
- **Mitigation:**
  - Database query optimization (indexes)
  - Redis caching (grammar check)
  - Lighthouse CI monitoring (fail build if score \u003c85)

---

## 📝 Technical Debt

### Known Shortcuts (Phase 1)

**1. Last-Write-Wins Conflict Resolution**
- **Debt:** No real-time collaboration support
- **Fix (Phase 3):** Implement OT or CRDTs

**2. No JWT Refresh Tokens**
- **Debt:** Users re-authenticate every 7 days
- **Fix (Phase 2):** Add refresh token endpoint

**3. Simplified Error Highlighting**
- **Debt:** CSS overlay instead of Lexical decorators
- **Fix (Phase 2):** Custom Lexical plugin with decorators

**4. No Offline Support**
- **Debt:** Requires internet connection
- **Fix (Phase 4):** PWA with local storage

---

## 🎯 Success Metrics

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | \u003c1s | Sentry performance monitoring |
| Grammar Check Accuracy | \u003e95% | Manual spot-checks + user feedback |
| Cache Hit Rate | \u003e60% | Redis stats |
| Lighthouse Score | \u003e85 | Lighthouse CI |
| Test Coverage (Backend) | \u003e80% | Jest coverage report |
| Test Coverage (Frontend) | \u003e70% | Vitest coverage report |
| Deployment Frequency | \u003e5/week | GitHub Actions logs |
| Mean Time to Recovery | \u003c1 hour | Sentry incident tracking |

---

## 📚 Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend Framework** | React 18 + TypeScript | Industry standard, type safety |
| **Editor** | Lexical | Meta-backed, extensible, modern |
| **Styling** | Tailwind CSS | Rapid prototyping, consistency |
| **State Management** | Zustand + React Query | Lightweight, minimal boilerplate |
| **Backend Framework** | Express/Fastify | Fast, middleware ecosystem |
| **Database** | PostgreSQL 15 | ACID compliance, JSONB support |
| **ORM** | Prisma | Type-safe, migrations, dev experience |
| **Cache** | Redis 7 | High performance, TTL support |
| **Auth** | JWT (jsonwebtoken) | Stateless, scalable |
| **Testing** | Vitest + Playwright | Fast, modern, cross-browser |
| **Deployment** | Vercel + Railway | Easy setup, auto-deploy |
| **Monitoring** | Sentry | Error tracking, performance |

---

## 🔄 Integration Points

### Existing Services (Future)

**Authentication:**
- Phase 2: Integrate with `onboarding-service` SSO
- Phase 1: Standalone auth (JWT)

**Progress Tracking:**
- Phase 2: Sync essay stats to `motivation-progress-service`
- Phase 1: Standalone analytics

**Gamification:**
- Phase 3: Award points for completed essays
- Phase 1: No integration

---

## 📖 API Documentation

**Format:** OpenAPI 3.0 (auto-generated from code)

**Tools:**
- `swagger-jsdoc` for JSDoc comments → OpenAPI spec
- `swagger-ui-express` for interactive API docs

**Endpoint:** `GET /api/docs` (Swagger UI)

---

**Document Status:** ✅ Complete  
**Tech Lead Approval:** Pending Review  
**Last Updated:** February 7, 2026
