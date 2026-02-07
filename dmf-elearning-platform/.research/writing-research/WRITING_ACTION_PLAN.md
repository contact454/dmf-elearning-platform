# DMF Writing Module - Developer Action Plan

**Version**: 1.0  
**Date**: February 7, 2026  
**Target**: Developer-ready implementation guide for Phase 1 (MVP)  
**Timeline**: 12 weeks (3 months)  
**Team Size**: 2-3 developers + 1 part-time German linguist

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [API Specifications](#api-specifications)
5. [Component Breakdown](#component-breakdown)
6. [Development Phases](#development-phases)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Plan](#deployment-plan)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Cost Estimates](#cost-estimates)

---

## Executive Summary

**Goal**: Build MVP of German writing practice module in 12 weeks

**Core Features** (Phase 1):
- Rich text editor with real-time grammar checking
- LanguageTool API integration for German corrections
- 20 structured essay prompts (B1-B2 level)
- Basic analytics (word count, error count, writing time)
- User authentication and essay storage
- Responsive design (desktop + mobile)

**Tech Stack**:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Lexical Editor
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **APIs**: LanguageTool API, OpenAI GPT-4 (Phase 2)
- **Hosting**: Vercel (frontend) + Railway (backend + DB)

**Success Criteria**:
- ✅ 100 beta users write ≥3 essays in first month
- ✅ Grammar check response time <1 second
- ✅ 95%+ uptime
- ✅ Mobile-responsive (works on phones/tablets)

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React App (Vercel)                                 │   │
│  │   - Lexical Editor                                   │   │
│  │   - Real-time error highlighting                     │   │
│  │   - React Query for state management                 │   │
│  └─────────────────┬────────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ HTTPS (REST API)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Backend API (Railway)                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Express Server (Node.js + TypeScript)                │   │
│  │ Routes:                                              │   │
│  │   POST /api/auth/register                            │   │
│  │   POST /api/auth/login                               │   │
│  │   GET  /api/prompts                                  │   │
│  │   POST /api/essays                                   │   │
│  │   POST /api/grammar/check                            │   │
│  │   GET  /api/analytics/:userId                        │   │
│  └───┬──────────┬──────────┬──────────┬─────────────────┘   │
│      │          │          │          │                      │
│      ▼          ▼          ▼          ▼                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐             │
│  │ Auth   │ │PromptService│Essay   │ Grammar  │             │
│  │Service │ │         │ │Service │ │Service   │             │
│  └────────┘ └────────┘ └────────┘ └──────────┘             │
└──────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────────────┐ ┌──────────┐
│PostgreSQL│ │PostgreSQL│ │ LanguageTool API │ │  Redis   │
│ (Users)  │ │ (Essays) │ │  (External)      │ │ (Cache)  │
└──────────┘ └──────────┘ └──────────────────┘ └──────────┘
```

### Directory Structure

```
dmf-writing-module/
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/
│   │   │   │   ├── WritingEditor.tsx
│   │   │   │   ├── ErrorHighlight.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── Feedback/
│   │   │   │   ├── FeedbackPanel.tsx
│   │   │   │   ├── ErrorCard.tsx
│   │   │   │   └── StatsDisplay.tsx
│   │   │   ├── Prompts/
│   │   │   │   ├── PromptSelector.tsx
│   │   │   │   └── PromptCard.tsx
│   │   │   └── Auth/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   ├── useGrammarCheck.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useEssay.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   ├── Essay.ts
│   │   │   ├── GrammarError.ts
│   │   │   └── User.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/                    # Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── essayController.ts
│   │   │   ├── grammarController.ts
│   │   │   └── promptController.ts
│   │   ├── services/
│   │   │   ├── languageToolService.ts
│   │   │   ├── essayService.ts
│   │   │   └── analyticsService.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Essay.ts
│   │   │   └── Prompt.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── essays.ts
│   │   │   ├── grammar.ts
│   │   │   └── prompts.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── migrations/
│   │   ├── server.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/                     # Shared types (optional)
│   └── types/
│       └── index.ts
├── docker-compose.yml          # Local dev environment
├── .env.example
└── README.md
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────┐
│ Users                   │
├─────────────────────────┤
│ id (PK)                 │
│ email (UNIQUE)          │
│ password_hash           │
│ name                    │
│ tier (enum)             │ → free, premium, classroom
│ created_at              │
│ updated_at              │
└────────┬────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│ Essays                  │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │ → Users.id
│ prompt_id (FK)          │ → Prompts.id
│ content (TEXT)          │
│ word_count (INT)        │
│ error_count (INT)       │
│ writing_time_seconds    │
│ status (enum)           │ → draft, submitted, reviewed
│ created_at              │
│ updated_at              │
└────────┬────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│ GrammarErrors           │
├─────────────────────────┤
│ id (PK)                 │
│ essay_id (FK)           │ → Essays.id
│ error_type (VARCHAR)    │ → spelling, grammar, style
│ message (TEXT)          │
│ offset (INT)            │
│ length (INT)            │
│ suggestions (JSONB)     │ → Array of replacements
│ rule_id (VARCHAR)       │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│ Prompts                 │
├─────────────────────────┤
│ id (PK)                 │
│ title (VARCHAR)         │
│ description (TEXT)      │
│ cefr_level (enum)       │ → A1, A2, B1, B2, C1, C2
│ category (VARCHAR)      │ → daily_life, opinion, description
│ target_word_count (INT) │
│ tips (JSONB)            │ → Array of writing tips
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│ WritingSessions         │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │ → Users.id
│ essay_id (FK)           │ → Essays.id
│ session_date (DATE)     │
│ duration_seconds (INT)  │
│ words_written (INT)     │
│ created_at              │
└─────────────────────────┘
```

### SQL Migration Scripts

**Migration 001: Create Users Table**

```sql
-- migrations/001_create_users.sql
CREATE TYPE user_tier AS ENUM ('free', 'premium', 'classroom');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  tier user_tier DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**Migration 002: Create Prompts Table**

```sql
-- migrations/002_create_prompts.sql
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cefr_level cefr_level NOT NULL,
  category VARCHAR(100),
  target_word_count INT DEFAULT 200,
  tips JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompts_cefr ON prompts(cefr_level);
```

**Migration 003: Create Essays Table**

```sql
-- migrations/003_create_essays.sql
CREATE TYPE essay_status AS ENUM ('draft', 'submitted', 'reviewed');

CREATE TABLE essays (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id INT REFERENCES prompts(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  word_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  writing_time_seconds INT DEFAULT 0,
  status essay_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_essays_user_id ON essays(user_id);
CREATE INDEX idx_essays_created_at ON essays(created_at DESC);
```

**Migration 004: Create GrammarErrors Table**

```sql
-- migrations/004_create_grammar_errors.sql
CREATE TABLE grammar_errors (
  id SERIAL PRIMARY KEY,
  essay_id INT NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  error_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  offset INT NOT NULL,
  length INT NOT NULL,
  suggestions JSONB,
  rule_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grammar_errors_essay_id ON grammar_errors(essay_id);
```

**Migration 005: Create WritingSessions Table**

```sql
-- migrations/005_create_writing_sessions.sql
CREATE TABLE writing_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  essay_id INT REFERENCES essays(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  duration_seconds INT NOT NULL,
  words_written INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_date ON writing_sessions(user_id, session_date DESC);
```

---

## API Specifications

### Authentication Endpoints

#### POST `/api/auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 400: Email already exists
- 400: Invalid email or weak password

---

#### POST `/api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 401: Invalid credentials

---

### Prompt Endpoints

#### GET `/api/prompts`

**Query Parameters**:
- `level` (optional): Filter by CEFR level (A1, A2, B1, B2, C1, C2)
- `category` (optional): Filter by category

**Response** (200 OK):
```json
{
  "prompts": [
    {
      "id": 1,
      "title": "Mein Tagesablauf",
      "description": "Beschreibe deinen typischen Tagesablauf von morgens bis abends.",
      "cefr_level": "B1",
      "category": "daily_life",
      "target_word_count": 150,
      "tips": [
        "Use present tense (Präsens)",
        "Include time expressions (um 7 Uhr, dann, später)",
        "Mention at least 5 daily activities"
      ]
    },
    {
      "id": 2,
      "title": "Mein Lieblingsessen",
      "description": "Schreibe über dein Lieblingsessen. Warum magst du es?",
      "cefr_level": "A2",
      "category": "description",
      "target_word_count": 100,
      "tips": [
        "Describe taste, ingredients, preparation",
        "Use adjectives (lecker, würzig, süß)",
        "Explain why it's your favorite"
      ]
    }
  ]
}
```

---

### Essay Endpoints

#### POST `/api/essays`

**Headers**:
- `Authorization: Bearer <token>`

**Request**:
```json
{
  "prompt_id": 1,
  "content": "Ich stehe jeden Tag um 7 Uhr auf...",
  "status": "draft"
}
```

**Response** (201 Created):
```json
{
  "essay": {
    "id": 123,
    "user_id": 1,
    "prompt_id": 1,
    "content": "Ich stehe jeden Tag um 7 Uhr auf...",
    "word_count": 0,
    "error_count": 0,
    "status": "draft",
    "created_at": "2026-02-07T10:30:00Z"
  }
}
```

---

#### PUT `/api/essays/:id`

**Headers**:
- `Authorization: Bearer <token>`

**Request**:
```json
{
  "content": "Ich stehe jeden Tag um 7 Uhr auf. Dann frühstücke ich...",
  "word_count": 45,
  "error_count": 2,
  "writing_time_seconds": 180
}
```

**Response** (200 OK):
```json
{
  "essay": {
    "id": 123,
    "content": "Ich stehe jeden Tag um 7 Uhr auf. Dann frühstücke ich...",
    "word_count": 45,
    "error_count": 2,
    "updated_at": "2026-02-07T10:33:00Z"
  }
}
```

---

#### GET `/api/essays/:id`

**Headers**:
- `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "essay": {
    "id": 123,
    "prompt": {
      "id": 1,
      "title": "Mein Tagesablauf"
    },
    "content": "Ich stehe jeden Tag um 7 Uhr auf...",
    "word_count": 45,
    "error_count": 2,
    "errors": [
      {
        "id": 1,
        "type": "grammar",
        "message": "Falsche Präposition",
        "offset": 30,
        "length": 5,
        "suggestions": ["zu", "in"]
      }
    ],
    "created_at": "2026-02-07T10:30:00Z"
  }
}
```

---

### Grammar Endpoints

#### POST `/api/grammar/check`

**Headers**:
- `Authorization: Bearer <token>`

**Request**:
```json
{
  "text": "Ich gehe zu die Bibliothek.",
  "language": "de-DE"
}
```

**Response** (200 OK):
```json
{
  "errors": [
    {
      "type": "grammar",
      "message": "Falsche Präposition. Verwenden Sie 'zur' statt 'zu die'.",
      "short_message": "Präpositionskontraktion",
      "offset": 9,
      "length": 7,
      "context": {
        "text": "Ich gehe zu die Bibliothek.",
        "offset": 9,
        "length": 7
      },
      "suggestions": [
        { "value": "zur" }
      ],
      "rule": {
        "id": "DE_PREPOSITION_CONTRACTION",
        "category": "grammar"
      }
    }
  ],
  "language": "de-DE",
  "processing_time_ms": 320
}
```

**Caching**: Cache responses by text hash (SHA-256) for 24 hours

---

### Analytics Endpoints

#### GET `/api/analytics/:userId`

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (optional): `week`, `month`, `all` (default: `month`)

**Response** (200 OK):
```json
{
  "stats": {
    "total_essays": 23,
    "total_words": 4567,
    "average_words_per_essay": 198,
    "total_errors": 89,
    "error_rate": 1.95,
    "improvement_rate": 12.5,
    "streak_days": 7,
    "vocabulary_diversity": 0.68,
    "unique_words": 1247
  },
  "error_trends": [
    { "date": "2026-02-01", "error_rate": 2.8 },
    { "date": "2026-02-08", "error_rate": 2.1 },
    { "date": "2026-02-15", "error_rate": 1.9 }
  ],
  "common_errors": [
    { "type": "grammar", "count": 12, "description": "Dativ vs. Akkusativ" },
    { "type": "spelling", "count": 8, "description": "dass/das confusion" }
  ]
}
```

---

## Component Breakdown

### Frontend Components

#### 1. WritingEditor (Main Editor)

**File**: `frontend/src/components/Editor/WritingEditor.tsx`

**Responsibilities**:
- Render Lexical rich text editor
- Handle text input and changes
- Debounce grammar checks (1 second delay)
- Display error underlines
- Manage editor state (content, cursor position)

**Key Code**:
```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { useDebouncedCallback } from 'use-debounce';
import { useGrammarCheck } from '../../hooks/useGrammarCheck';

export function WritingEditor({ essayId }: { essayId: number }) {
  const { checkGrammar, errors, loading } = useGrammarCheck();
  
  const handleTextChange = useDebouncedCallback((text: string) => {
    if (text.length > 10) {
      checkGrammar(text, 'de-DE');
    }
  }, 1000);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-content" />}
        placeholder={<div>Start typing your essay...</div>}
      />
      {/* Error highlighting plugin */}
      <ErrorHighlightPlugin errors={errors} />
    </LexicalComposer>
  );
}
```

---

#### 2. FeedbackPanel (Error List)

**File**: `frontend/src/components/Feedback/FeedbackPanel.tsx`

**Responsibilities**:
- Display list of grammar errors
- Group errors by type (grammar, spelling, style)
- Handle "Apply" and "Ignore" actions
- Show writing statistics

**Props**:
```tsx
interface FeedbackPanelProps {
  errors: GrammarError[];
  onApply: (errorId: number, suggestion: string) => void;
  onIgnore: (errorId: number) => void;
  stats: {
    wordCount: number;
    errorCount: number;
    writingTime: number;
  };
}
```

---

#### 3. PromptSelector (Essay Topics)

**File**: `frontend/src/components/Prompts/PromptSelector.tsx`

**Responsibilities**:
- Fetch and display available prompts
- Filter by CEFR level
- Show prompt details (description, tips, word count target)
- Handle prompt selection

**Key Code**:
```tsx
export function PromptSelector() {
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const response = await api.get('/api/prompts');
      return response.data.prompts;
    }
  });

  return (
    <div className="prompt-grid">
      {prompts?.map(prompt => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
```

---

### Backend Services

#### 1. LanguageToolService

**File**: `backend/src/services/languageToolService.ts`

**Responsibilities**:
- Make API calls to LanguageTool
- Parse and normalize responses
- Cache results in Redis
- Handle errors and retries

**Key Code**:
```typescript
import axios from 'axios';
import crypto from 'crypto';
import { redisClient } from '../database/redis';

export class LanguageToolService {
  private apiUrl = 'https://api.languagetool.org/v2/check';

  async checkGrammar(text: string, language: string = 'de-DE') {
    // Generate cache key
    const cacheKey = this.getCacheKey(text, language);
    
    // Check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Call LanguageTool API
    const response = await axios.post(this.apiUrl, {
      text,
      language,
      enabledOnly: false
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const errors = this.parseErrors(response.data.matches);

    // Cache for 24 hours
    await redisClient.setex(cacheKey, 86400, JSON.stringify(errors));

    return errors;
  }

  private getCacheKey(text: string, language: string): string {
    return crypto
      .createHash('sha256')
      .update(`${text}:${language}`)
      .digest('hex');
  }

  private parseErrors(matches: any[]): GrammarError[] {
    return matches.map(match => ({
      type: this.categorizeError(match.rule.category.id),
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      context: match.context,
      suggestions: match.replacements.map((r: any) => ({ value: r.value })),
      ruleId: match.rule.id
    }));
  }

  private categorizeError(categoryId: string): 'spelling' | 'grammar' | 'style' {
    if (categoryId.includes('TYPO') || categoryId.includes('SPELL')) {
      return 'spelling';
    }
    if (categoryId.includes('STYLE') || categoryId.includes('REDUNDANCY')) {
      return 'style';
    }
    return 'grammar';
  }
}
```

---

#### 2. EssayService

**File**: `backend/src/services/essayService.ts`

**Responsibilities**:
- CRUD operations for essays
- Calculate word count and statistics
- Update essay metadata (error count, writing time)

**Key Code**:
```typescript
import { db } from '../database/connection';

export class EssayService {
  async createEssay(userId: number, promptId: number, content: string) {
    const wordCount = this.countWords(content);

    const result = await db.query(
      `INSERT INTO essays (user_id, prompt_id, content, word_count, status)
       VALUES ($1, $2, $3, $4, 'draft')
       RETURNING *`,
      [userId, promptId, content, wordCount]
    );

    return result.rows[0];
  }

  async updateEssay(id: number, userId: number, data: Partial<Essay>) {
    const { content, errorCount, writingTimeSeconds } = data;
    const wordCount = content ? this.countWords(content) : undefined;

    const result = await db.query(
      `UPDATE essays
       SET content = COALESCE($1, content),
           word_count = COALESCE($2, word_count),
           error_count = COALESCE($3, error_count),
           writing_time_seconds = COALESCE($4, writing_time_seconds),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [content, wordCount, errorCount, writingTimeSeconds, id, userId]
    );

    return result.rows[0];
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }
}
```

---

## Development Phases

### Week 1-2: Project Setup & Foundation

**Tasks**:
1. **Repository setup**:
   - Initialize Git repository
   - Set up monorepo structure (frontend + backend)
   - Configure ESLint, Prettier, TypeScript

2. **Backend foundation**:
   - Express server with TypeScript
   - PostgreSQL connection setup
   - Database migrations (users, essays, prompts tables)
   - JWT authentication (register, login)

3. **Frontend foundation**:
   - React + TypeScript + Vite setup
   - Tailwind CSS configuration
   - React Query setup
   - Basic routing (React Router)

**Deliverables**:
- ✅ Repository with CI/CD (GitHub Actions)
- ✅ Backend running locally (port 3001)
- ✅ Frontend running locally (port 3000)
- ✅ Database migrations applied
- ✅ Auth endpoints working (register, login)

**Testing**:
- Manual: Register user, login, receive JWT token
- Automated: Unit tests for auth service (Jest)

---

### Week 3-4: Core Editor & Grammar Integration

**Tasks**:
1. **Lexical editor integration**:
   - Basic rich text editing
   - Text change detection
   - Debounced updates (1 second)

2. **LanguageTool API integration**:
   - Service class for API calls
   - Error parsing and normalization
   - Redis caching setup

3. **Error highlighting**:
   - Custom Lexical plugin for underlines
   - Color-coded error types (red, orange, blue)
   - Tooltip on hover (desktop) and tap (mobile)

**Deliverables**:
- ✅ Editor can type and save text
- ✅ Grammar check API returns errors
- ✅ Errors displayed as underlines in editor
- ✅ Tooltip shows suggestions on hover

**Testing**:
- Manual: Type "Ich gehe zu die Bibliothek" → see underline on "zu die"
- Automated: Integration test for LanguageTool API

---

### Week 5-6: Prompts & Essay Management

**Tasks**:
1. **Prompt system**:
   - Seed database with 20 prompts (B1-B2)
   - Prompt selector UI (grid layout)
   - Prompt detail view (description, tips)

2. **Essay CRUD**:
   - Create essay (POST /api/essays)
   - Update essay (PUT /api/essays/:id)
   - Fetch essay (GET /api/essays/:id)
   - List user essays (GET /api/essays)

3. **Auto-save**:
   - Debounced auto-save every 10 seconds
   - "Saved" indicator in UI

**Deliverables**:
- ✅ User can select a prompt
- ✅ User can start writing an essay
- ✅ Essay auto-saves every 10 seconds
- ✅ User can view past essays

**Testing**:
- Manual: Select prompt, write essay, refresh page → essay persists
- Automated: E2E test (Playwright) for full writing flow

---

### Week 7-8: Feedback Panel & Analytics

**Tasks**:
1. **Feedback panel**:
   - Side panel UI (collapsible sections)
   - Error cards (message, suggestions, actions)
   - Apply/Ignore functionality

2. **Basic analytics**:
   - Word count (real-time)
   - Error count (from grammar check)
   - Writing time (track session duration)
   - Display in UI

3. **Error storage**:
   - Save errors to `grammar_errors` table
   - Link errors to essays
   - Fetch errors with essay

**Deliverables**:
- ✅ Feedback panel shows all errors
- ✅ User can apply suggestions (text updates)
- ✅ Stats displayed (word count, errors, time)
- ✅ Errors persisted to database

**Testing**:
- Manual: Click "Apply" on error → text corrects
- Automated: Unit tests for error application logic

---

### Week 9-10: Mobile Optimization & Polish

**Tasks**:
1. **Responsive design**:
   - Mobile layout (bottom drawer for feedback)
   - Touch-friendly interactions
   - Font sizes and spacing adjustments

2. **UI polish**:
   - Loading states (spinners for API calls)
   - Error states (API failures, network errors)
   - Success animations (checkmarks on save)

3. **Performance optimization**:
   - Code splitting (React.lazy)
   - Image optimization
   - Bundle size reduction

**Deliverables**:
- ✅ App works on mobile (iPhone, Android)
- ✅ Loading/error states implemented
- ✅ Performance score >90 (Lighthouse)

**Testing**:
- Manual: Test on iPhone Safari, Android Chrome
- Automated: Lighthouse CI integration

---

### Week 11-12: Testing, Deployment & Beta Launch

**Tasks**:
1. **Comprehensive testing**:
   - Unit tests (Jest, 80%+ coverage)
   - Integration tests (API endpoints)
   - E2E tests (Playwright, critical flows)

2. **Deployment**:
   - Frontend: Deploy to Vercel
   - Backend: Deploy to Railway
   - Database: Railway PostgreSQL
   - Redis: Railway Redis

3. **Beta launch prep**:
   - Landing page with waitlist
   - Onboarding flow (tutorial)
   - User feedback form (Google Forms or Typeform)

4. **Monitoring setup**:
   - Sentry for error tracking
   - Analytics (Plausible or PostHog)
   - Uptime monitoring (Better Uptime)

**Deliverables**:
- ✅ App deployed to production URLs
- ✅ 100 beta users invited
- ✅ Monitoring dashboards configured

**Testing**:
- Smoke tests in production (verify critical paths)
- Load testing (100 concurrent users)

---

## Testing Strategy

### Unit Tests (80%+ Coverage)

**Tools**: Jest + Testing Library

**What to test**:
- Services (LanguageToolService, EssayService, AuthService)
- Utility functions (word counting, error parsing)
- React hooks (useGrammarCheck, useAuth, useEssay)

**Example**:
```typescript
// backend/src/services/__tests__/essayService.test.ts
import { EssayService } from '../essayService';

describe('EssayService', () => {
  it('should count words correctly', () => {
    const service = new EssayService();
    expect(service.countWords('Ich gehe zur Schule')).toBe(4);
    expect(service.countWords('  Extra   spaces  ')).toBe(2);
  });
});
```

---

### Integration Tests

**Tools**: Supertest (API testing)

**What to test**:
- API endpoints (auth, essays, grammar)
- Database operations (CRUD)
- Authentication flows (JWT validation)

**Example**:
```typescript
// backend/src/__tests__/essays.integration.test.ts
import request from 'supertest';
import { app } from '../server';

describe('POST /api/essays', () => {
  it('should create essay when authenticated', async () => {
    const token = await getAuthToken(); // Helper function
    const response = await request(app)
      .post('/api/essays')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt_id: 1, content: 'Test essay' });

    expect(response.status).toBe(201);
    expect(response.body.essay).toHaveProperty('id');
  });
});
```

---

### End-to-End Tests

**Tools**: Playwright

**What to test**:
- Complete user flows (signup → write essay → submit)
- Error handling (network failures, invalid inputs)
- Mobile vs. desktop experiences

**Example**:
```typescript
// e2e/writing-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can write and submit essay', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Select prompt
  await page.click('text=Mein Tagesablauf');

  // Write essay
  await page.fill('.editor-content', 'Ich gehe zu die Bibliothek.');

  // Wait for grammar check
  await page.waitForSelector('.error-underline');

  // Verify error appears
  const error = await page.$('.error-underline');
  expect(error).toBeTruthy();

  // Submit essay
  await page.click('text=Submit');
  await expect(page.locator('text=Essay submitted!')).toBeVisible();
});
```

---

## Deployment Plan

### Infrastructure

**Frontend** (Vercel):
- Repository: GitHub (auto-deploy on push to `main`)
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Environment variables: `VITE_API_URL`

**Backend** (Railway):
- Repository: GitHub (auto-deploy on push to `main`)
- Start command: `cd backend && npm start`
- Environment variables:
  - `DATABASE_URL` (Railway PostgreSQL)
  - `REDIS_URL` (Railway Redis)
  - `JWT_SECRET`
  - `LANGUAGETOOL_API_KEY` (if using premium)
  - `NODE_ENV=production`

**Database** (Railway PostgreSQL):
- Plan: Starter ($5/month, 1GB storage)
- Backups: Daily automatic backups

**Cache** (Railway Redis):
- Plan: Starter ($5/month, 256MB memory)

---

### Environment Variables

**Frontend** (`.env.production`):
```bash
VITE_API_URL=https://dmf-writing-api.up.railway.app
```

**Backend** (`.env.production`):
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dmf_writing
REDIS_URL=redis://user:pass@host:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
NODE_ENV=production
PORT=3001
```

---

### Deployment Checklist

**Pre-deployment**:
- ✅ All tests passing (unit, integration, E2E)
- ✅ Environment variables configured
- ✅ Database migrations run
- ✅ Seed data loaded (20 prompts)
- ✅ Error monitoring (Sentry) configured

**Deployment**:
- ✅ Push to `main` branch (triggers auto-deploy)
- ✅ Verify build success (Vercel + Railway dashboards)
- ✅ Run smoke tests on production URLs
- ✅ Check logs for errors

**Post-deployment**:
- ✅ Invite first 10 beta users
- ✅ Monitor error rates (Sentry)
- ✅ Set up uptime monitoring (Better Uptime)
- ✅ Create feedback channel (Discord or Slack)

---

## Monitoring & Analytics

### Error Tracking (Sentry)

**Setup**:
```bash
npm install @sentry/react @sentry/node
```

**Frontend** (`frontend/src/index.tsx`):
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://your-sentry-dsn.ingest.sentry.io',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1
});
```

**Backend** (`backend/src/server.ts`):
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

---

### User Analytics (Plausible)

**Why Plausible**: Privacy-friendly, GDPR-compliant, no cookies

**Setup**:
- Add script to `frontend/index.html`
- Track custom events (essay_created, essay_submitted, error_applied)

**Events to track**:
- `essay_started` (user selects prompt)
- `essay_submitted` (user finishes essay)
- `error_applied` (user accepts suggestion)
- `error_ignored` (user rejects suggestion)
- `premium_upgrade` (user subscribes)

---

### Performance Monitoring

**Tools**:
- Lighthouse CI (automated performance audits)
- Railway metrics (CPU, memory, response times)
- PostgreSQL slow query log

**Targets**:
- Frontend: Lighthouse score >90
- Backend: P95 response time <500ms
- Database: Query time <100ms (95th percentile)

---

## Cost Estimates

### Infrastructure (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** (Frontend) | Hobby | $0 (free tier) |
| **Railway** (Backend + DB + Redis) | Starter | $15 |
| **LanguageTool API** | Premium | €19 (~$20) |
| **Sentry** | Developer | $0 (free tier) |
| **Plausible** | Starter | $9 |
| **Domain** (.com) | Annual | ~$1/month |
| **Total** | | **~$45/month** |

### Development Costs (One-time)

| Role | Hourly Rate | Hours | Total |
|------|-------------|-------|-------|
| **Full-stack Developer** (Lead) | $75 | 240 hours (12 weeks × 20h/week) | $18,000 |
| **Frontend Developer** | $60 | 160 hours (12 weeks × 13h/week) | $9,600 |
| **German Linguist** (Part-time) | $40 | 60 hours (prompts + QA) | $2,400 |
| **Total** | | | **$30,000** |

### Scaling Costs (1,000 Users)

| Service | Usage | Cost |
|---------|-------|------|
| **Railway** (upgraded) | Pro plan | $50/month |
| **LanguageTool API** | 10,000 checks/month | €19/month |
| **GPT-4 API** (Phase 2) | 5,000 checks @ $0.03 | $150/month |
| **Total** | | **~$230/month** |

**Per-user cost**: $0.23/month (very profitable with $14.99 Premium tier)

---

## Next Steps

### Immediate (Week 1)

1. **Kickoff meeting** with dev team
2. **Repository setup** (GitHub, monorepo structure)
3. **Infrastructure provisioning** (Railway, Vercel accounts)
4. **Design mockups** (Figma wireframes for editor, feedback panel)

### Short-term (Weeks 2-4)

5. **Backend foundation** (auth, database, LanguageTool integration)
6. **Frontend foundation** (editor, basic UI)
7. **First working prototype** (type text → see grammar errors)

### Medium-term (Weeks 5-8)

8. **Prompts and essay management**
9. **Feedback panel and analytics**
10. **Internal testing** (team members write 10 essays each)

### Launch (Weeks 9-12)

11. **Mobile optimization and polish**
12. **Beta user recruitment** (Reddit, language forums)
13. **Production deployment**
14. **Monitor and iterate** based on feedback

---

## Conclusion

This action plan provides a **complete roadmap** for building the DMF Writing Module MVP in 12 weeks with 2-3 developers.

**Key Success Factors**:
1. **Focus on MVP** (resist feature creep)
2. **User feedback early** (beta users in week 9)
3. **Quality over speed** (80%+ test coverage)
4. **Mobile-first design** (most learners use phones)
5. **Reliable grammar checking** (LanguageTool + caching)

**Expected Outcome**:
- ✅ Working writing module with real-time feedback
- ✅ 100 beta users writing 5+ essays/month
- ✅ Foundation for Phase 2 (AI enhancements, progress dashboard)

**Next Document**: Review `strategy-synthesis.md` for go-to-market plan after MVP launch.

---

**Document Status**: ✅ Complete  
**Reviewed By**: Research Lead  
**Ready for Development**: Yes  
**Last Updated**: 2026-02-07
