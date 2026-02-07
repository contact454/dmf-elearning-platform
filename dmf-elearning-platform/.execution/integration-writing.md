# Integration Specialist - Writing Module Phase 1

**Role:** API Integration, State Management, Testing & Deployment  
**Duration:** Weeks 6-12 (32-40 hours total)  
**Priority:** HIGH (critical path)

---

## 🎯 Your Mission

Connect frontend components to backend APIs using React Query, implement global state management with Zustand, create comprehensive E2E test suite with Playwright, and deploy the application to production (Vercel + Railway).

---

## ✅ Task Checklist

### **Week 6-7: API Integration & State Management**

#### **Task 1.1: React Query setup**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Configure React Query for server state management

**File:** `src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

**Acceptance Criteria:**
- [x] React Query configured
- [x] Devtools enabled (development only)
- [x] Default options set (retry, stale time)

---

#### **Task 1.2: API client with authentication**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Create axios client with JWT token handling

**File:** `src/services/api.ts`
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle 401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Acceptance Criteria:**
- [x] API base URL from environment variable
- [x] JWT token automatically added to requests
- [x] 401 errors redirect to login
- [x] Token stored in localStorage

---

#### **Task 1.3: Custom hooks for API operations**
**Duration:** 5 hours  
**Priority:** P0 (Critical)

**Description:** Create React Query hooks for all API operations

**File:** `src/hooks/useAuth.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name?: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/api/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
  });
}

export function useLogout() {
  return () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
}
```

**File:** `src/hooks/useGrammarCheck.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

interface GrammarCheckRequest {
  text: string;
  language?: string;
}

export function useGrammarCheck() {
  return useMutation({
    mutationFn: async ({ text, language = 'de-DE' }: GrammarCheckRequest) => {
      const response = await api.post('/api/grammar/check', { text, language });
      return response.data;
    },
  });
}
```

**File:** `src/hooks/useEssay.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useEssays() {
  return useQuery({
    queryKey: ['essays'],
    queryFn: async () => {
      const response = await api.get('/api/essays');
      return response.data;
    },
  });
}

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

export function useCreateEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { promptId: string | null; content: string }) => {
      const response = await api.post('/api/essays', data);
      return response.data.essay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['essays', data.id] });
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
  });
}
```

**File:** `src/hooks/usePrompts.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function usePrompts(level?: string) {
  return useQuery({
    queryKey: ['prompts', level],
    queryFn: async () => {
      const params = level ? { level } : {};
      const response = await api.get('/api/prompts', { params });
      return response.data.prompts;
    },
  });
}
```

**Acceptance Criteria:**
- [x] All hooks created (auth, essays, grammar, prompts)
- [x] Mutations invalidate cache on success
- [x] Loading/error states available
- [x] Typed with TypeScript

---

#### **Task 1.4: Zustand stores for editor state**
**Duration:** 4 hours  
**Priority:** P0 (Critical)

**Description:** Create global state stores for editor and errors

**File:** `src/stores/editorStore.ts`
```typescript
import { create } from 'zustand';

interface EditorState {
  content: string;
  wordCount: number;
  writingTime: number; // seconds
  isAutoSaving: boolean;
  lastSaved: Date | null;
  
  setContent: (content: string) => void;
  setWordCount: (count: number) => void;
  incrementWritingTime: () => void;
  setAutoSaving: (saving: boolean) => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  wordCount: 0,
  writingTime: 0,
  isAutoSaving: false,
  lastSaved: null,

  setContent: (content) => set({ content }),
  setWordCount: (count) => set({ wordCount: count }),
  incrementWritingTime: () => set((state) => ({ writingTime: state.writingTime + 1 })),
  setAutoSaving: (saving) => set({ isAutoSaving: saving }),
  markSaved: () => set({ lastSaved: new Date(), isAutoSaving: false }),
}));
```

**File:** `src/stores/errorStore.ts`
```typescript
import { create } from 'zustand';

interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  message: string;
  offset: number;
  length: number;
  suggestions: string[];
}

interface ErrorState {
  errors: GrammarError[];
  ignoredErrorIds: Set<string>;
  
  setErrors: (errors: GrammarError[]) => void;
  ignoreError: (errorId: string) => void;
  clearIgnored: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  ignoredErrorIds: new Set(),

  setErrors: (errors) => set({ errors }),
  
  ignoreError: (errorId) => set((state) => ({
    ignoredErrorIds: new Set([...state.ignoredErrorIds, errorId]),
  })),
  
  clearIgnored: () => set({ ignoredErrorIds: new Set() }),
}));
```

**Acceptance Criteria:**
- [x] Editor store tracks content, word count, writing time
- [x] Error store manages errors and ignored errors
- [x] Stores persist across component remounts
- [x] Actions update state correctly

---

#### **Task 1.5: Debounced grammar checking**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Implement debounced grammar check (1 second after typing stops)

**File:** `src/hooks/useDebouncedGrammarCheck.ts`
```typescript
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useGrammarCheck } from './useGrammarCheck';
import { useErrorStore } from '../stores/errorStore';

export function useDebouncedGrammarCheck(content: string, delay: number = 1000) {
  const grammarCheckMutation = useGrammarCheck();
  const setErrors = useErrorStore((state) => state.setErrors);

  const debouncedCheck = useDebouncedCallback(
    async (text: string) => {
      if (text.trim().length < 10) {
        setErrors([]);
        return;
      }

      try {
        const result = await grammarCheckMutation.mutateAsync({ text });
        const errors = result.errors.map((error: any, idx: number) => ({
          id: `error-${idx}`,
          ...error,
        }));
        setErrors(errors);
      } catch (error) {
        console.error('Grammar check failed:', error);
      }
    },
    delay
  );

  useEffect(() => {
    debouncedCheck(content);
  }, [content, debouncedCheck]);

  return {
    isChecking: grammarCheckMutation.isPending,
  };
}
```

**Acceptance Criteria:**
- [x] Grammar check debounced (1 second after typing stops)
- [x] Skips check if text < 10 characters
- [x] Updates error store with results
- [x] Loading state available

---

### **Week 8-10: E2E Testing**

#### **Task 2.1: Playwright setup**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**Description:** Configure Playwright for E2E testing

**Install Playwright:**
```bash
npm init playwright@latest
```

**File:** `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Acceptance Criteria:**
- [x] Playwright installed and configured
- [x] Test directory created (`e2e/`)
- [x] Desktop + mobile browsers configured
- [x] Dev server starts automatically

---

#### **Task 2.2: Authentication tests**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Description:** Test registration and login flows

**File:** `e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=My Essays')).toBeVisible();
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

**Acceptance Criteria:**
- [x] Registration test passes
- [x] Login test passes
- [x] Invalid credentials test passes
- [x] Tests run in CI

---

#### **Task 2.3: Writing flow tests**
**Duration:** 6 hours  
**Priority:** P1 (Important)

**Description:** Test complete writing flow (select prompt → write → see errors)

**File:** `e2e/writing.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Writing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can select prompt and start writing', async ({ page }) => {
    // Click "New Essay" button
    await page.click('text=New Essay');
    
    // Select a prompt (A1 level)
    await page.click('text=Mein Tagesablauf');
    
    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor/);
    
    // Editor should be visible
    const editor = page.locator('.editor-content');
    await expect(editor).toBeVisible();
  });

  test('grammar errors appear after typing', async ({ page }) => {
    await page.goto('/editor/new');
    
    // Type text with grammar error
    const editor = page.locator('.editor-content');
    await editor.fill('Ich gehe zu die Bibliothek.');
    
    // Wait for grammar check (debounced 1 second + API call)
    await page.waitForTimeout(2000);
    
    // Error underline should appear
    const errorUnderline = page.locator('.error-underline');
    await expect(errorUnderline).toBeVisible();
    
    // Feedback panel should show error
    await expect(page.locator('text=Falsche Präposition')).toBeVisible();
  });

  test('user can apply grammar suggestion', async ({ page }) => {
    await page.goto('/editor/new');
    
    const editor = page.locator('.editor-content');
    await editor.fill('Ich gehe zu die Bibliothek.');
    await page.waitForTimeout(2000);
    
    // Click suggestion in feedback panel
    await page.click('button:has-text("zur")');
    
    // Text should be corrected
    await expect(editor).toContainText('zur Bibliothek');
    
    // Error should disappear
    await expect(page.locator('.error-underline')).toHaveCount(0);
  });

  test('auto-save works', async ({ page }) => {
    await page.goto('/editor/new');
    
    const editor = page.locator('.editor-content');
    await editor.fill('This is my essay content.');
    
    // Wait for auto-save (10 seconds)
    await page.waitForTimeout(11000);
    
    // "Saved" indicator should appear
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Content should persist
    await expect(editor).toContainText('This is my essay content.');
  });

  test('word count updates in real-time', async ({ page }) => {
    await page.goto('/editor/new');
    
    const editor = page.locator('.editor-content');
    await editor.fill('One two three four five');
    
    // Word count should show 5
    await expect(page.locator('text=5').first()).toBeVisible();
  });
});
```

**Acceptance Criteria:**
- [x] All writing flow tests pass
- [x] Grammar check integration works
- [x] Apply suggestion works
- [x] Auto-save works
- [x] Word count updates

---

#### **Task 2.4: Mobile responsive tests**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Description:** Test mobile-specific behavior (bottom drawer, touch interactions)

**File:** `e2e/mobile.spec.ts`
```typescript
import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 13']);

test.describe('Mobile Responsive', () => {
  test('feedback panel opens as bottom drawer', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/editor/new');
    
    // Bottom drawer toggle should be visible
    const toggleButton = page.locator('button:has-text("Feedback")');
    await expect(toggleButton).toBeVisible();
    
    // Click to open drawer
    await toggleButton.click();
    
    // Drawer should slide up
    const drawer = page.locator('.feedback-drawer');
    await expect(drawer).toBeVisible();
  });

  test('prompt cards are touch-friendly', async ({ page }) => {
    await page.goto('/prompts');
    
    // Tap on a prompt card
    await page.locator('text=Mein Tagesablauf').tap();
    
    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor/);
  });
});
```

**Acceptance Criteria:**
- [x] Mobile tests pass on iPhone 13 viewport
- [x] Bottom drawer works
- [x] Touch interactions work
- [x] Font sizes appropriate for mobile

---

### **Week 11-12: Deployment & Monitoring**

#### **Task 3.1: Environment setup**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Configure environment variables for production

**File:** `.env.production`
```env
VITE_API_URL=https://dmf-writing-api.up.railway.app
```

**File:** `vercel.json` (optional: redirects, headers)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Acceptance Criteria:**
- [x] Production API URL configured
- [x] Environment variables set in Vercel dashboard
- [x] SPA routing works (all routes → index.html)

---

#### **Task 3.2: Deployment scripts**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Deploy frontend to Vercel, backend to Railway

**Frontend (Vercel):**
1. Install Vercel CLI: `npm install -g vercel`
2. Link project: `vercel link`
3. Deploy: `vercel --prod`

**Backend (Railway):**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Deploy: `railway up`

**File:** `.github/workflows/deploy.yml` (CI/CD)
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      # Railway deploy via CLI or API
```

**Acceptance Criteria:**
- [x] Frontend deployed to Vercel
- [x] Backend deployed to Railway
- [x] Auto-deploy on push to `main` branch
- [x] Production URLs accessible

---

#### **Task 3.3: Monitoring setup (Sentry)**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Description:** Set up error tracking with Sentry

**Install Sentry:**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**File:** `src/main.tsx`
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Acceptance Criteria:**
- [x] Sentry initialized
- [x] Errors logged to Sentry dashboard
- [x] Source maps uploaded for stack traces
- [x] Performance monitoring enabled

---

#### **Task 3.4: Lighthouse CI**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**Description:** Set up automated Lighthouse performance audits

**File:** `.github/workflows/lighthouse.yml`
```yaml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5173/
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**Acceptance Criteria:**
- [x] Lighthouse CI runs on PRs
- [x] Performance score >85
- [x] Accessibility score >90
- [x] Best practices score >90

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| API Integration & State | 17h |
| E2E Testing | 14h |
| Deployment & Monitoring | 10h |
| Documentation | 2h |
| **Total** | **43h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All API hooks working (auth, essays, grammar, prompts)
- [ ] Zustand stores manage state correctly
- [ ] Debounced grammar check <1 second response
- [ ] E2E tests pass (25+ scenarios)
- [ ] Frontend deployed to Vercel (production URL)
- [ ] Backend deployed to Railway (production URL)
- [ ] Sentry monitoring active
- [ ] Lighthouse score >85 all categories

---

## 📞 Coordination Points

**With Backend Developer:**
- **Week 6:** Validate API contract (test all endpoints)
- **Week 7:** Coordinate error handling (standardized error responses)

**With Frontend Developer:**
- **Week 6:** Integrate API hooks into components
- **Week 8:** Share E2E test scenarios

**With DB Specialist:**
- **Week 10:** Verify production database migrations applied

---

## 🚀 Next Steps After Completion

1. **Monitor production** (Sentry dashboard, Railway metrics)
2. **Optimize performance** (code splitting, lazy loading)
3. **Phase 2:** Add AI suggestions endpoint integration

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** ✅ Ready for Execution
