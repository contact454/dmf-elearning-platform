# IMPLEMENTATION_NOTES - Writing Module Phase 1

**Project:** DMF E-Learning Platform - Writing Module MVP  
**Audience:** Development Team  
**Version:** 1.0  
**Date:** February 7, 2026  

---

## 🎯 Purpose

This document provides practical implementation guidance, common gotchas, best practices, and code examples for building the Writing Module. Read this BEFORE starting development to avoid known pitfalls.

---

## 🏗️ Monorepo Integration

### Adding the Writing Service

**Directory Structure:**
```bash
cd /path/to/dmf-elearning-platform
mkdir -p services/writing-service
cd services/writing-service
pnpm init
```

**package.json Configuration:**
```json
{
  "name": "@dmf/writing-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

**Add to pnpm-workspace.yaml:**
```yaml
packages:
  - 'services/*'
  - 'apps/*'
  - 'packages/*'
```

**⚠️ GOTCHA:** Don't forget to update `turbo.json` to include writing-service in build pipeline!

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 🗄️ Database Setup

### Prisma Schema Best Practices

**1. Always Use Explicit Column Names:**

❌ **BAD:**
```prisma
model User {
  id String @id @default(uuid())
  createdAt DateTime @default(now())
}
```

✅ **GOOD:**
```prisma
model User {
  id String @id @default(uuid()) @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  @@map("users")
}
```

**Why:** Explicit column names prevent Prisma from auto-generating snake_case, which can conflict with existing conventions.

---

**2. Index Composite Queries:**

❌ **BAD:**
```prisma
@@index([userId])
@@index([createdAt])
```

✅ **GOOD:**
```prisma
@@index([userId, createdAt(sort: Desc)], name: "idx_essays_user_created")
```

**Why:** Composite index covers common query pattern `WHERE user_id = ? ORDER BY created_at DESC`.

**Query Test:**
```sql
EXPLAIN ANALYZE
SELECT * FROM essays 
WHERE user_id = 'some-uuid' 
ORDER BY created_at DESC 
LIMIT 10;

-- Should show "Index Scan using idx_essays_user_created"
-- Cost: ~0.50 (vs. ~500 for full table scan)
```

---

**3. JSONB Field Validation:**

✅ **BEST PRACTICE:**
```typescript
// Validate JSONB structure at application layer
const tipsSchema = z.object({
  tips: z.array(z.string()).min(1).max(10),
});

// Before saving:
const validated = tipsSchema.parse(prompt.tips);
```

**Why:** PostgreSQL doesn't enforce JSONB structure - you must validate in code.

---

### Migration Strategy

**Creating Migrations:**
```bash
cd services/writing-service
pnpm prisma migrate dev --name add_writing_tables
```

**⚠️ GOTCHA:** Prisma migration files are auto-generated - NEVER edit them manually!

**If Migration Fails:**
```bash
# Reset database (DEV ONLY - DELETES DATA!)
pnpm prisma migrate reset

# In production, create corrective migration
pnpm prisma migrate dev --name fix_constraint_error
```

---

### Seeding Prompts

**File:** `services/writing-service/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import promptsData from './data/prompts.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding prompts...');

  // Delete existing prompts (DEV ONLY)
  await prisma.grammarError.deleteMany();
  await prisma.essay.deleteMany();
  await prisma.prompt.deleteMany();

  // Seed prompts
  for (const promptData of promptsData.prompts) {
    await prisma.prompt.create({
      data: {
        title: promptData.title,
        description: promptData.description,
        cefrLevel: promptData.cefr_level,
        category: promptData.category,
        targetWordCount: promptData.target_word_count,
        tips: promptData.tips,
      },
    });
  }

  console.log(`✅ Seeded ${promptsData.prompts.length} prompts`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run Seed:**
```bash
pnpm db:seed
```

**⚠️ GOTCHA:** Seed script runs in transaction - if one insert fails, ALL rollback!

---

## 🔧 Backend Implementation

### Express vs. Fastify

**Recommendation:** Use **Fastify** for better performance.

**Fastify Setup:**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Plugins
await fastify.register(cors, {
  origin: ['https://dmf-elearning.vercel.app', 'http://localhost:5173'],
  credentials: true,
});

await fastify.register(helmet);
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(essayRoutes, { prefix: '/api/essays' });

await fastify.listen({ port: 3001, host: '0.0.0.0' });
```

**⚠️ GOTCHA:** Fastify requires `await` for plugin registration - Express doesn't!

---

### JWT Authentication Middleware

**File:** `src/middleware/authMiddleware.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        error: 'Missing or invalid Authorization header' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
    };

    // Attach user info to request
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ 
      error: 'Invalid or expired token' 
    });
  }
}

// Extend FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}
```

**Usage in Route:**
```typescript
fastify.get('/api/essays', {
  preHandler: authMiddleware,
}, async (request, reply) => {
  const userId = request.user!.userId;
  // ... fetch essays
});
```

**⚠️ GOTCHA:** Fastify preHandlers run BEFORE route handler - Express middleware runs during!

---

### LanguageTool Integration

**Service Class:** `src/services/languageToolService.ts`

```typescript
import axios from 'axios';
import crypto from 'crypto';
import { createClient } from 'redis';

const redisClient = createClient({ 
  url: process.env.REDIS_URL 
});
await redisClient.connect();

export class LanguageToolService {
  private apiUrl = process.env.LANGUAGETOOL_API_URL || 
    'https://api.languagetool.org/v2/check';

  async checkGrammar(text: string, language = 'de-DE') {
    const startTime = Date.now();

    // 1. Generate cache key
    const cacheKey = this.getCacheKey(text, language);

    // 2. Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT for grammar check');
      return {
        errors: JSON.parse(cached),
        processingTimeMs: Date.now() - startTime,
      };
    }

    console.log('❌ Cache MISS - calling LanguageTool API');

    // 3. Call API
    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({
          text,
          language,
          enabledOnly: 'false',
        }),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          },
          timeout: 10000, // 10 seconds
        }
      );

      const errors = this.parseErrors(response.data.matches);

      // 4. Cache for 24 hours
      await redisClient.setEx(
        cacheKey, 
        86400, 
        JSON.stringify(errors)
      );

      return {
        errors,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('❌ LanguageTool API error:', error.message);
      
      // FALLBACK: Return empty errors (graceful degradation)
      return {
        errors: [],
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  private getCacheKey(text: string, language: string): string {
    return crypto
      .createHash('sha256')
      .update(`${text}:${language}`)
      .digest('hex');
  }

  private parseErrors(matches: any[]) {
    return matches.map((match) => ({
      type: this.categorizeError(match.rule.category.id),
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      context: match.context,
      suggestions: match.replacements
        .slice(0, 3)
        .map((r: any) => ({ value: r.value })),
      ruleId: match.rule.id,
      category: match.rule.category.id,
    }));
  }

  private categorizeError(categoryId: string): 
    'spelling' | 'grammar' | 'style' {
    const cat = categoryId.toUpperCase();
    if (cat.includes('TYPO') || cat.includes('SPELL')) {
      return 'spelling';
    }
    if (cat.includes('STYLE') || cat.includes('REDUNDANCY')) {
      return 'style';
    }
    return 'grammar';
  }
}
```

**⚠️ GOTCHA:** LanguageTool API expects `application/x-www-form-urlencoded`, NOT JSON!

**Testing Cache:**
```bash
# First call: Cache miss (~1000ms)
curl -X POST http://localhost:3001/api/grammar/check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ich gehe zu die Bibliothek"}'

# Second call: Cache hit (~5ms)
curl -X POST http://localhost:3001/api/grammar/check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ich gehe zu die Bibliothek"}'
```

---

### Word Count Utility

**File:** `src/utils/wordCount.ts`

```typescript
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .length;
}
```

**⚠️ GOTCHA:** Edge cases to test:

```typescript
// Test cases
expect(countWords('Ich gehe zur Schule')).toBe(4);
expect(countWords('  Extra   spaces  ')).toBe(2);
expect(countWords('')).toBe(0);
expect(countWords('   ')).toBe(0);
expect(countWords('One-word-with-hyphens')).toBe(1);
expect(countWords('Emoji 😀 test')).toBe(3);
```

---

## 🎨 Frontend Implementation

### Lexical Editor Setup

**Install Dependencies:**
```bash
cd apps/web
pnpm add lexical @lexical/react @lexical/rich-text @lexical/history
```

**Basic Editor Component:**

**File:** `src/features/writing/components/WritingEditor.tsx`

```typescript
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistory';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';

const editorConfig = {
  namespace: 'WritingEditor',
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

export function WritingEditor() {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      // Extract text content
      const root = editorState.toJSON().root;
      const text = root.children
        .map((node: any) => 
          node.children?.map((child: any) => child.text).join('') || ''
        )
        .join('\n');
      
      console.log('Text:', text);
    });
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border rounded-lg bg-white">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[500px] p-4 focus:outline-none" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
              Start writing...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
```

**⚠️ GOTCHA:** Lexical uses immutable state - NEVER mutate EditorState directly!

---

### Error Highlighting (CSS Overlay Approach)

**Simpler alternative to Lexical decorators for MVP:**

**File:** `src/features/writing/components/ErrorOverlay.tsx`

```typescript
import { useEffect, useState, useRef } from 'react';

interface ErrorOverlayProps {
  errors: Array<{
    id: string;
    type: 'grammar' | 'spelling' | 'style';
    offset: number;
    length: number;
    message: string;
  }>;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function ErrorOverlay({ errors, contentRef }: ErrorOverlayProps) {
  const [highlights, setHighlights] = useState<Array<{
    error: any;
    rect: DOMRect;
  }>>([]);

  useEffect(() => {
    if (!contentRef.current) return;

    const contentEl = contentRef.current;
    const text = contentEl.innerText;
    
    const newHighlights = errors.map((error) => {
      // Find text node at offset
      const range = document.createRange();
      const walker = document.createTreeWalker(
        contentEl,
        NodeFilter.SHOW_TEXT
      );

      let currentOffset = 0;
      let textNode: Text | null = null;

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const nodeLength = node.textContent?.length || 0;

        if (currentOffset + nodeLength >= error.offset) {
          textNode = node;
          const localOffset = error.offset - currentOffset;
          range.setStart(node, localOffset);
          range.setEnd(node, localOffset + error.length);
          break;
        }

        currentOffset += nodeLength;
      }

      if (textNode) {
        const rect = range.getBoundingClientRect();
        const containerRect = contentEl.getBoundingClientRect();

        return {
          error,
          rect: new DOMRect(
            rect.left - containerRect.left,
            rect.top - containerRect.top,
            rect.width,
            rect.height
          ),
        };
      }
      return null;
    }).filter(Boolean);

    setHighlights(newHighlights as any);
  }, [errors, contentRef]);

  const getUnderlineColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'border-red-500';
      case 'spelling': return 'border-blue-500';
      case 'style': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map(({ error, rect }, idx) => (
        <div
          key={idx}
          className={`absolute border-b-2 ${getUnderlineColor(error.type)}`}
          style={{
            left: rect.left,
            top: rect.top + rect.height - 2,
            width: rect.width,
            height: 2,
          }}
        />
      ))}
    </div>
  );
}
```

**⚠️ GOTCHA:** Recalculate positions on window resize!

```typescript
useEffect(() => {
  const handleResize = () => {
    // Trigger recalculation
    setHighlights([]);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

### React Query Setup

**File:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        // Show toast notification
      },
    },
  },
});
```

**Custom Hook Example:**

**File:** `src/features/writing/hooks/useEssay.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useEssay(id: string) {
  return useQuery({
    queryKey: ['essays', id],
    queryFn: async () => {
      const response = await api.get(`/api/essays/${id}`);
      return response.data.essay;
    },
    enabled: !!id,
  });
}

export function useUpdateEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/api/essays/${id}`, data);
      return response.data.essay;
    },
    onSuccess: (data) => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['essays', data.id] });
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
  });
}
```

**⚠️ GOTCHA:** Always invalidate cache after mutations to prevent stale data!

---

### Debounced Auto-Save

**File:** `src/features/writing/hooks/useAutoSave.ts`

```typescript
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function useAutoSave(
  content: string,
  essayId: string | null,
  onSave: (content: string) => Promise<void>,
  delay = 10000
) {
  const debouncedSave = useDebouncedCallback(
    async (text: string) => {
      if (essayId && text.length > 0) {
        try {
          await onSave(text);
          console.log('✅ Auto-saved at', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }
    },
    delay
  );

  useEffect(() => {
    debouncedSave(content);
  }, [content, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush(); // Save immediately on unmount
    };
  }, [debouncedSave]);
}
```

**⚠️ GOTCHA:** Flush debounced save on component unmount to prevent data loss!

---

## 🧪 Testing

### Backend Unit Tests

**File:** `src/services/__tests__/essayService.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { EssayService } from '../essayService';

const prisma = new PrismaClient();
const essayService = new EssayService(prisma);

describe('EssayService', () => {
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'fake-hash',
        name: 'Test User',
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.essay.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create essay and calculate word count', async () => {
    const essay = await essayService.createEssay(
      userId,
      null,
      'Ich gehe zur Schule. Das ist toll!'
    );

    expect(essay.wordCount).toBe(6);
    expect(essay.status).toBe('draft');
  });

  it('should update essay content', async () => {
    const essay = await essayService.createEssay(userId, null, 'Initial content');

    const updated = await essayService.updateEssay(essay.id, userId, {
      content: 'Updated content with more words',
    });

    expect(updated.wordCount).toBe(5);
    expect(updated.content).toBe('Updated content with more words');
  });
});
```

**⚠️ GOTCHA:** Always clean up test data in `afterEach` to prevent test pollution!

---

### E2E Tests (Playwright)

**File:** `e2e/writing.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Writing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can write essay and see grammar errors', async ({ page }) => {
    // Select prompt
    await page.click('text=New Essay');
    await page.click('text=Mein Tagesablauf');

    // Type text with error
    const editor = page.locator('.editor-content');
    await editor.fill('Ich gehe zu die Bibliothek.');

    // Wait for grammar check (1 second debounce + API)
    await page.waitForTimeout(2000);

    // Error should appear
    const errorUnderline = page.locator('.error-underline');
    await expect(errorUnderline).toBeVisible();

    // Click suggestion
    await page.click('button:has-text("zur")');

    // Text should be corrected
    await expect(editor).toContainText('zur Bibliothek');
  });
});
```

**⚠️ GOTCHA:** Add generous wait times for debounced operations in E2E tests!

---

## 🚀 Deployment

### Environment Variables

**Frontend (Vercel):**
```env
VITE_API_URL=https://dmf-writing-api.up.railway.app
```

**Backend (Railway):**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dmf_writing
REDIS_URL=redis://default:pass@host:6379
JWT_SECRET=<generate-with-openssl-rand-hex-64>
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
NODE_ENV=production
PORT=3001
```

**Generate JWT Secret:**
```bash
openssl rand -hex 64
```

---

### Railway Deployment

**1. Create railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**2. Deploy via CLI:**
```bash
railway login
railway link
railway up
```

**⚠️ GOTCHA:** Railway automatically detects `package.json` and runs `pnpm install`. Make sure `build` and `start` scripts are correct!

---

## 🔍 Monitoring

### Sentry Setup

**Frontend:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

**Backend:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**⚠️ GOTCHA:** Set `tracesSampleRate` to 0.1 (10%) in production to avoid quota limits!

---

## 📝 Common Pitfalls

### 1. Prisma Client Regeneration

**Problem:** After schema changes, TypeScript shows type errors.

**Solution:** Always regenerate Prisma client:
```bash
pnpm prisma generate
```

---

### 2. CORS Errors

**Problem:** Frontend can't call backend API.

**Solution:** Add frontend URL to CORS whitelist:
```typescript
app.use(cors({
  origin: [
    'https://dmf-elearning.vercel.app',
    'http://localhost:5173', // DEV
  ],
  credentials: true,
}));
```

---

### 3. JWT Token Expiration

**Problem:** Users logged out unexpectedly.

**Solution:** Increase token expiration OR implement refresh tokens:
```typescript
const token = jwt.sign(
  { userId, email },
  JWT_SECRET,
  { expiresIn: '7d' } // 7 days
);
```

---

### 4. Redis Connection Errors

**Problem:** App crashes on startup if Redis unavailable.

**Solution:** Graceful fallback:
```typescript
try {
  await redisClient.connect();
} catch (error) {
  console.error('❌ Redis connection failed - caching disabled');
  // Continue without caching
}
```

---

## 🎯 Performance Tips

### 1. Database Query Optimization

**Use `include` instead of multiple queries:**

❌ **BAD (N+1 query):**
```typescript
const essays = await prisma.essay.findMany({ where: { userId } });

for (const essay of essays) {
  const prompt = await prisma.prompt.findUnique({ where: { id: essay.promptId } });
  // ...
}
```

✅ **GOOD:**
```typescript
const essays = await prisma.essay.findMany({
  where: { userId },
  include: { prompt: true },
});
```

---

### 2. React Query Cache Tuning

**Adjust stale time based on data freshness:**

```typescript
// Prompts rarely change - cache for 1 hour
useQuery({
  queryKey: ['prompts'],
  queryFn: fetchPrompts,
  staleTime: 60 * 60 * 1000, // 1 hour
});

// User's essays change frequently - cache for 1 minute
useQuery({
  queryKey: ['essays'],
  queryFn: fetchEssays,
  staleTime: 60 * 1000, // 1 minute
});
```

---

## 📚 Resources

**Official Docs:**
- Lexical: https://lexical.dev/docs/intro
- Prisma: https://www.prisma.io/docs
- React Query: https://tanstack.com/query/latest/docs
- LanguageTool API: https://languagetool.org/http-api/

**Helpful Guides:**
- Fastify TypeScript setup: https://www.fastify.io/docs/latest/TypeScript/
- Railway deployment: https://docs.railway.app/

---

**Document Status:** ✅ Complete  
**Last Updated:** February 7, 2026
