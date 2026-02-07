# Backend Developer - Writing Module Phase 1

**Role:** API Development & LanguageTool Integration  
**Duration:** Weeks 2-7 (45-55 hours total)  
**Priority:** HIGH (core functionality)

---

## 🎯 Your Mission

Build REST API endpoints for the Writing Module, integrate LanguageTool API for German grammar correction with Redis caching, implement authentication, and create analytics endpoints for progress tracking.

---

## ✅ Task Checklist

### **Week 2-3: Foundation & Authentication**

#### **Task 1.1: Project setup**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Set up Express server with TypeScript, environment variables, and database connection

**Steps:**
1. Initialize Node.js project:
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express typescript @types/express @types/node
   npm install dotenv cors helmet express-rate-limit
   npm install prisma @prisma/client  # If using Prisma
   npm install --save-dev ts-node nodemon
   ```

2. Configure TypeScript (`tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

3. Create `.env.example`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dmf_writing
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
   PORT=3001
   NODE_ENV=development
   ```

4. Create `src/server.ts`:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import dotenv from 'dotenv';

   dotenv.config();

   const app = express();

   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json({ limit: '10mb' }));

   // Health check
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
     console.log(`✅ Server running on port ${PORT}`);
   });
   ```

**Acceptance Criteria:**
- [x] Server starts without errors
- [x] `GET /health` returns 200 OK
- [x] TypeScript compiles without errors
- [x] Environment variables loaded correctly

---

#### **Task 1.2: JWT authentication**
**Duration:** 4 hours  
**Priority:** P0 (Critical)

**Description:** Implement user registration, login, and JWT token generation

**Install dependencies:**
```bash
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

**File:** `src/services/authService.ts`
```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/connection'; // Or your DB client

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

export class AuthService {
  async register(email: string, password: string, name?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        tier: 'free',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier },
      token,
    };
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
```

**File:** `src/middleware/authMiddleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7);
    const { userId, email } = authService.verifyToken(token);

    req.userId = userId;
    req.userEmail = email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

**File:** `src/routes/auth.ts`
```typescript
import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await authService.register(email, password, name);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

export default router;
```

**Update `src/server.ts`:**
```typescript
import authRoutes from './routes/auth';

app.use('/api/auth', authRoutes);
```

**Acceptance Criteria:**
- [x] `POST /api/auth/register` creates user and returns JWT
- [x] `POST /api/auth/login` validates credentials and returns JWT
- [x] Password is hashed (bcrypt)
- [x] JWT token is valid for 7 days
- [x] Auth middleware verifies JWT correctly

---

### **Week 3-4: LanguageTool Integration**

#### **Task 2.1: LanguageTool service class**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**Description:** Create service to call LanguageTool API, parse errors, and cache results in Redis

**Install dependencies:**
```bash
npm install axios redis
npm install --save-dev @types/redis
```

**File:** `src/services/languageToolService.ts`
```typescript
import axios from 'axios';
import crypto from 'crypto';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect();

interface GrammarError {
  type: 'grammar' | 'spelling' | 'style';
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  suggestions: Array<{ value: string }>;
  ruleId: string;
  category: string;
}

export class LanguageToolService {
  private apiUrl = process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/check';

  async checkGrammar(text: string, language: string = 'de-DE'): Promise<{
    errors: GrammarError[];
    processingTimeMs: number;
  }> {
    const startTime = Date.now();

    // Generate cache key
    const cacheKey = this.getCacheKey(text, language);

    // Check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit for grammar check');
      return {
        errors: JSON.parse(cached),
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Call LanguageTool API
    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({
          text,
          language,
          enabledOnly: 'false',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000, // 10 seconds
        }
      );

      const errors = this.parseErrors(response.data.matches);

      // Cache for 24 hours
      await redisClient.setEx(cacheKey, 86400, JSON.stringify(errors));

      return {
        errors,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('❌ LanguageTool API error:', error.message);
      throw new Error('Grammar check failed');
    }
  }

  private getCacheKey(text: string, language: string): string {
    return crypto
      .createHash('sha256')
      .update(`${text}:${language}`)
      .digest('hex');
  }

  private parseErrors(matches: any[]): GrammarError[] {
    return matches.map((match) => ({
      type: this.categorizeError(match.rule.category.id),
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      context: match.context,
      suggestions: match.replacements.slice(0, 3).map((r: any) => ({ value: r.value })),
      ruleId: match.rule.id,
      category: match.rule.category.id,
    }));
  }

  private categorizeError(categoryId: string): 'spelling' | 'grammar' | 'style' {
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

**Acceptance Criteria:**
- [x] API call to LanguageTool succeeds
- [x] Errors parsed correctly (type, message, offset, suggestions)
- [x] Redis caching works (second call is cached)
- [x] Cache key is SHA-256 hash of text + language
- [x] Error handling for API failures

---

#### **Task 2.2: Grammar check endpoint**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Create API endpoint to check grammar

**Install rate limiting:**
```bash
npm install express-rate-limit
```

**File:** `src/routes/grammar.ts`
```typescript
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LanguageToolService } from '../services/languageToolService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const languageToolService = new LanguageToolService();

// Rate limiting: max 60 requests per minute per user
const grammarCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many grammar check requests. Please try again later.' },
});

// POST /api/grammar/check
router.post('/check', authMiddleware, grammarCheckLimiter, async (req: AuthRequest, res) => {
  try {
    const { text, language = 'de-DE' } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 100000) {
      return res.status(400).json({ error: 'Text too long (max 100,000 characters)' });
    }

    // Check grammar
    const result = await languageToolService.checkGrammar(text, language);

    return res.status(200).json({
      errors: result.errors,
      language,
      processingTimeMs: result.processingTimeMs,
    });
  } catch (error: any) {
    console.error('Grammar check error:', error);
    return res.status(500).json({ error: 'Grammar check failed' });
  }
});

export default router;
```

**Update `src/server.ts`:**
```typescript
import grammarRoutes from './routes/grammar';

app.use('/api/grammar', grammarRoutes);
```

**Acceptance Criteria:**
- [x] `POST /api/grammar/check` returns grammar errors
- [x] Rate limiting works (max 60/min per user)
- [x] Requires authentication (JWT token)
- [x] Validates text input (max 100k characters)
- [x] Returns processing time in response

---

### **Week 5-6: Essay Management**

#### **Task 3.1: Essay CRUD service**
**Duration:** 5 hours  
**Priority:** P0 (Critical)

**Description:** Create service for essay operations (create, read, update, list)

**File:** `src/services/essayService.ts`
```typescript
import { prisma } from '../database/connection';

export class EssayService {
  async createEssay(userId: string, promptId: string | null, content: string) {
    const wordCount = this.countWords(content);

    const essay = await prisma.essay.create({
      data: {
        userId,
        promptId,
        content,
        wordCount,
        status: 'draft',
      },
    });

    return essay;
  }

  async updateEssay(
    essayId: string,
    userId: string,
    data: {
      content?: string;
      errorCount?: number;
      writingTimeSeconds?: number;
      status?: string;
    }
  ) {
    // Verify ownership
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    const wordCount = data.content ? this.countWords(data.content) : undefined;

    const updated = await prisma.essay.update({
      where: { id: essayId },
      data: {
        content: data.content,
        wordCount,
        errorCount: data.errorCount,
        writingTimeSeconds: data.writingTimeSeconds,
        status: data.status,
      },
    });

    return updated;
  }

  async getEssay(essayId: string, userId: string) {
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
      include: {
        prompt: true,
        grammarErrors: {
          orderBy: { offset: 'asc' },
        },
      },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    return essay;
  }

  async listEssays(userId: string, limit: number = 20, offset: number = 0) {
    const [essays, total] = await Promise.all([
      prisma.essay.findMany({
        where: { userId },
        include: { prompt: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.essay.count({ where: { userId } }),
    ]);

    return { essays, total };
  }

  async deleteEssay(essayId: string, userId: string) {
    // Verify ownership
    const essay = await prisma.essay.findFirst({
      where: { id: essayId, userId },
    });

    if (!essay) {
      throw new Error('Essay not found or access denied');
    }

    await prisma.essay.delete({ where: { id: essayId } });
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
```

**Acceptance Criteria:**
- [x] Create essay works
- [x] Update essay calculates word count
- [x] Get essay includes prompt and errors
- [x] List essays paginated (default 20 per page)
- [x] Delete essay requires ownership
- [x] Word count calculation accurate

---

#### **Task 3.2: Essay endpoints**
**Duration:** 4 hours  
**Priority:** P0 (Critical)

**Description:** Create REST API endpoints for essays

**File:** `src/routes/essays.ts`
```typescript
import { Router } from 'express';
import { EssayService } from '../services/essayService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const essayService = new EssayService();

// All routes require authentication
router.use(authMiddleware);

// POST /api/essays - Create new essay
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { promptId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const essay = await essayService.createEssay(req.userId!, promptId || null, content);
    return res.status(201).json({ essay });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/essays - List user's essays
router.get('/', async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await essayService.listEssays(req.userId!, limit, offset);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/essays/:id - Get essay with errors
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const essay = await essayService.getEssay(req.params.id, req.userId!);
    return res.status(200).json({ essay });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// PUT /api/essays/:id - Update essay
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { content, errorCount, writingTimeSeconds, status } = req.body;

    const essay = await essayService.updateEssay(req.params.id, req.userId!, {
      content,
      errorCount,
      writingTimeSeconds,
      status,
    });

    return res.status(200).json({ essay });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// DELETE /api/essays/:id - Delete essay
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await essayService.deleteEssay(req.params.id, req.userId!);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

export default router;
```

**Update `src/server.ts`:**
```typescript
import essayRoutes from './routes/essays';

app.use('/api/essays', essayRoutes);
```

**Acceptance Criteria:**
- [x] All CRUD operations work
- [x] Authentication required for all endpoints
- [x] Pagination works for list endpoint
- [x] Update only affects user's own essays
- [x] Delete cascades to grammar_errors

---

### **Week 6-7: Prompts & Analytics**

#### **Task 4.1: Prompts endpoint**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Create endpoint to list prompts with filtering

**File:** `src/routes/prompts.ts`
```typescript
import { Router } from 'express';
import { prisma } from '../database/connection';

const router = Router();

// GET /api/prompts - List prompts (no auth required for browsing)
router.get('/', async (req, res) => {
  try {
    const level = req.query.level as string | undefined;
    const category = req.query.category as string | undefined;

    const prompts = await prisma.prompt.findMany({
      where: {
        ...(level && { cefrLevel: level }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ prompts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/prompts/:id - Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: req.params.id },
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    return res.status(200).json({ prompt });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Update `src/server.ts`:**
```typescript
import promptRoutes from './routes/prompts';

app.use('/api/prompts', promptRoutes);
```

**Acceptance Criteria:**
- [x] List all prompts works
- [x] Filter by CEFR level works (`?level=B1`)
- [x] Filter by category works (`?category=opinion`)
- [x] No authentication required

---

#### **Task 4.2: Analytics endpoint**
**Duration:** 6 hours  
**Priority:** P1 (Important)

**Description:** Create endpoint for user progress analytics

**File:** `src/services/analyticsService.ts`
```typescript
import { prisma } from '../database/connection';

export class AnalyticsService {
  async getUserStats(userId: string, period: 'week' | 'month' | 'all' = 'month') {
    const cutoffDate = this.getCutoffDate(period);

    // Total essays
    const totalEssays = await prisma.essay.count({
      where: {
        userId,
        ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
      },
    });

    // Total words written
    const wordsResult = await prisma.essay.aggregate({
      where: {
        userId,
        ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
      },
      _sum: { wordCount: true },
    });
    const totalWords = wordsResult._sum.wordCount || 0;

    // Average words per essay
    const averageWords = totalEssays > 0 ? Math.round(totalWords / totalEssays) : 0;

    // Error rate (errors per 100 words)
    const errorRateResult = await prisma.$queryRaw<Array<{ error_rate: number }>>`
      SELECT 
        COALESCE(SUM(error_count)::decimal / NULLIF(SUM(word_count), 0) * 100, 0) as error_rate
      FROM essays
      WHERE user_id = ${userId}::uuid
        ${cutoffDate ? `AND created_at >= ${cutoffDate}::timestamptz` : ''}
        AND word_count > 0
    `;
    const errorRate = errorRateResult[0]?.error_rate || 0;

    // Error trends (by day)
    const errorTrends = await prisma.$queryRaw<Array<{
      date: Date;
      error_rate: number;
    }>>`
      SELECT 
        DATE(created_at) as date,
        COALESCE(AVG(error_count::decimal / NULLIF(word_count, 0) * 100), 0) as error_rate
      FROM essays
      WHERE user_id = ${userId}::uuid
        ${cutoffDate ? `AND created_at >= ${cutoffDate}::timestamptz` : ''}
        AND word_count > 0
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `;

    // Most common errors
    const commonErrors = await prisma.grammarError.groupBy({
      by: ['errorType'],
      where: {
        essay: {
          userId,
          ...(cutoffDate && { createdAt: { gte: cutoffDate } }),
        },
      },
      _count: { errorType: true },
      orderBy: { _count: { errorType: 'desc' } },
    });

    return {
      totalEssays,
      totalWords,
      averageWords,
      errorRate: Number(errorRate.toFixed(2)),
      errorTrends,
      commonErrors: commonErrors.map((e) => ({
        type: e.errorType,
        count: e._count.errorType,
      })),
    };
  }

  private getCutoffDate(period: 'week' | 'month' | 'all'): Date | null {
    if (period === 'all') return null;

    const now = new Date();
    if (period === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === 'month') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }
}
```

**File:** `src/routes/analytics.ts`
```typescript
import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authMiddleware);

// GET /api/analytics/:userId
router.get('/:userId', async (req: AuthRequest, res) => {
  try {
    // Verify user can only access their own analytics
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const period = (req.query.period as 'week' | 'month' | 'all') || 'month';
    const stats = await analyticsService.getUserStats(req.userId!, period);

    return res.status(200).json({ stats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Update `src/server.ts`:**
```typescript
import analyticsRoutes from './routes/analytics';

app.use('/api/analytics', analyticsRoutes);
```

**Acceptance Criteria:**
- [x] Returns total essays, words written, average words
- [x] Calculates error rate correctly
- [x] Error trends show last 30 days
- [x] Common errors grouped by type
- [x] Period filtering works (week/month/all)
- [x] User can only access their own analytics

---

### **Week 7: Testing & Polish**

#### **Task 5.1: Unit tests**
**Duration:** 6 hours  
**Priority:** P1 (Important)

**Description:** Write unit tests for services

**Install Jest:**
```bash
npm install --save-dev jest ts-jest @types/jest
npx ts-jest config:init
```

**File:** `src/services/__tests__/essayService.test.ts`
```typescript
import { EssayService } from '../essayService';

describe('EssayService', () => {
  describe('countWords', () => {
    it('should count words correctly', () => {
      const service = new EssayService();
      expect(service['countWords']('Ich gehe zur Schule')).toBe(4);
      expect(service['countWords']('  Extra   spaces  ')).toBe(2);
      expect(service['countWords']('')).toBe(0);
    });
  });
});
```

**File:** `src/services/__tests__/languageToolService.test.ts`
```typescript
import { LanguageToolService } from '../languageToolService';

describe('LanguageToolService', () => {
  it('should categorize errors correctly', () => {
    const service = new LanguageToolService();
    expect(service['categorizeError']('TYPOS')).toBe('spelling');
    expect(service['categorizeError']('GRAMMAR')).toBe('grammar');
    expect(service['categorizeError']('STYLE')).toBe('style');
  });
});
```

**Run tests:**
```bash
npm test
```

**Acceptance Criteria:**
- [x] Unit tests pass
- [x] Coverage >80% for services
- [x] Test word counting edge cases
- [x] Test error categorization

---

#### **Task 5.2: Error handling & logging**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Description:** Add global error handler and logging

**File:** `src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', error);

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};
```

**Update `src/server.ts`:**
```typescript
import { errorHandler } from './middleware/errorHandler';

// Routes...

// Error handler (must be last)
app.use(errorHandler);
```

**Acceptance Criteria:**
- [x] Global error handler catches unhandled errors
- [x] Errors logged to console
- [x] Production hides error details
- [x] Development shows full error messages

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Project Setup & Auth | 7h |
| LanguageTool Integration | 9h |
| Essay Management | 9h |
| Prompts & Analytics | 8h |
| Testing & Polish | 9h |
| Documentation | 3h |
| **Total** | **45h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All API endpoints working (auth, essays, prompts, grammar, analytics)
- [ ] LanguageTool integration functional with Redis caching
- [ ] JWT authentication secure (bcrypt + JWT)
- [ ] Rate limiting enabled (60 grammar checks/min)
- [ ] Unit tests pass (80%+ coverage)
- [ ] Error handling robust
- [ ] Database queries optimized
- [ ] API documentation complete (Swagger or Postman collection)

---

## 📞 Coordination Points

**With DB Specialist:**
- **Week 2:** Receive database schema (Prisma schema or SQL)
- **Week 3:** Validate queries perform well with indexes

**With Frontend Developer:**
- **Week 3:** Define API contract (request/response formats)
- **Week 5:** Share grammar error data structure
- **Week 6:** Coordinate essay auto-save (debouncing)

**With Integration Specialist:**
- **Week 5:** API integration testing
- **Week 6:** Deployment environment variables

---

## 🚀 Next Steps After Completion

1. **Deploy backend to Railway** (Integration Specialist will handle)
2. **Monitor API performance** (Sentry setup)
3. **Optimize slow queries** (if any)
4. **Phase 2:** Add GPT-4 suggestions endpoint

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** ✅ Ready for Execution
