# Writing Module Phase 1 - Quick Start Guide

**Project:** DMF E-Learning Platform - Writing Module MVP  
**Duration:** 12 weeks (Feb 7 - May 2, 2026)  
**Team:** 4 developers (DB Specialist, Backend Dev, Frontend Dev, Integration Specialist)

---

## 📋 Overview

This guide helps developers get started with the Writing Module Phase 1 development. Read this first, then refer to your role-specific task file.

---

## 🎯 Project Goals

Build a comprehensive German writing practice system featuring:
- ✅ Lexical rich text editor with real-time grammar checking
- ✅ LanguageTool API integration for German corrections
- ✅ 20 structured essay prompts (CEFR levels A1-B2)
- ✅ Inline error highlighting with detailed feedback panel
- ✅ Progress tracking and analytics
- ✅ Mobile-responsive design

**Success Metrics:**
- Grammar check response time <1 second
- Auto-save every 10 seconds
- Lighthouse score >85 all categories
- 100 beta users writing ≥3 essays in first month

---

## 👥 Team Roles & Responsibilities

### 1. Database Specialist
**Task File:** `.execution/db-specialist-writing.md`  
**Duration:** 20-24 hours (Weeks 1-3)

**Key Deliverables:**
- `users`, `essays`, `prompts`, `grammar_errors` tables
- 20 essay prompts seeded (5 per CEFR level A1-B2)
- Database indexes for performance
- Prisma migrations (or SQL migration scripts)

**Critical Path:** Must complete by Week 3 (blocks backend development)

---

### 2. Backend Developer
**Task File:** `.execution/backend-writing.md`  
**Duration:** 45-55 hours (Weeks 2-7)

**Key Deliverables:**
- REST API endpoints (auth, essays, prompts, grammar, analytics)
- LanguageTool API integration with Redis caching
- JWT authentication (register, login)
- Essay CRUD operations
- Unit tests (Jest, 80%+ coverage)

**Critical Path:** Grammar endpoint must be done by Week 5 (blocks frontend error highlighting)

---

### 3. Frontend Developer
**Task File:** `.execution/frontend-writing.md`  
**Duration:** 55-65 hours (Weeks 3-9)

**Key Deliverables:**
- Lexical editor with auto-save
- Inline error highlighting (custom Lexical plugin)
- Feedback panel (error list, stats, tips)
- Prompt selector + essay dashboard
- Mobile-responsive design
- Component tests (Vitest, 70%+ coverage)

**Critical Path:** Editor + error highlighting must be done by Week 6 (blocks integration testing)

---

### 4. Integration Specialist
**Task File:** `.execution/integration-writing.md`  
**Duration:** 32-40 hours (Weeks 6-12)

**Key Deliverables:**
- React Query hooks (API integration)
- Zustand stores (state management)
- Debounced grammar checking (1 second delay)
- E2E test suite (Playwright, 25+ scenarios)
- Deployment (Vercel + Railway)
- Monitoring (Sentry + Lighthouse CI)

**Critical Path:** E2E tests must pass by Week 11 (required for production launch)

---

## 📅 High-Level Timeline

| Week | Milestone | Responsible Team |
|------|-----------|------------------|
| **1-2** | Foundation & Setup | DB + Backend |
| **3-4** | Core Editor & Grammar | Backend + Frontend |
| **5-6** | Error Highlighting & Feedback | Frontend + Integration |
| **7-8** | Prompts & Analytics | Backend + Frontend |
| **9-10** | Mobile Optimization | Frontend + Integration |
| **11-12** | Testing & Deployment | Integration |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Editor:** Lexical (Meta's rich text framework)
- **Styling:** Tailwind CSS + Headless UI
- **State:** Zustand (editor state) + React Query (server state)
- **Routing:** React Router v6
- **Testing:** Vitest + Testing Library + Playwright

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL 15 (via Prisma ORM)
- **Cache:** Redis 7
- **Auth:** JWT (jsonwebtoken)
- **API:** LanguageTool REST API
- **Testing:** Jest + Supertest

### DevOps
- **Hosting:** Vercel (frontend) + Railway (backend + DB + Redis)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors) + Plausible (analytics)
- **Uptime:** Better Uptime

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15
- Redis 7
- Git
- Text editor (VS Code recommended)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repo-url>
cd dmf-elearning-platform
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your local database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/dmf_writing
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key-here

# Run migrations
npx prisma migrate dev

# Seed prompts
npx tsx scripts/seed-writing-module.ts

# Start dev server
npm run dev
# Backend runs on http://localhost:3001
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL
# VITE_API_URL=http://localhost:3001

# Start dev server
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Verify Setup
- Visit http://localhost:5173
- Register a new account
- Select a prompt
- Start writing and see grammar check work

---

## 📂 Project Structure

```
dmf-elearning-platform/
├── .execution/
│   ├── DEVELOPMENT_PLAN_writing_phase1.md (this is the overview)
│   ├── db-specialist-writing.md (DB tasks)
│   ├── backend-writing.md (backend tasks)
│   ├── frontend-writing.md (frontend tasks)
│   ├── integration-writing.md (integration tasks)
│   └── README_writing_phase1.md (you are here!)
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── languageToolService.ts
│   │   │   ├── essayService.ts
│   │   │   └── analyticsService.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── essays.ts
│   │   │   ├── grammar.ts
│   │   │   └── prompts.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   └── errorHandler.ts
│   │   └── server.ts
│   ├── data/
│   │   └── writing-prompts-seed.json
│   ├── scripts/
│   │   └── seed-writing-module.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/
│   │   │   │   ├── WritingEditor.tsx
│   │   │   │   ├── ErrorHighlightPlugin.tsx
│   │   │   │   └── ErrorTooltip.tsx
│   │   │   ├── Feedback/
│   │   │   │   ├── FeedbackPanel.tsx
│   │   │   │   ├── ErrorCard.tsx
│   │   │   │   └── StatsDisplay.tsx
│   │   │   └── Prompts/
│   │   │       ├── PromptSelector.tsx
│   │   │       └── PromptCard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useGrammarCheck.ts
│   │   │   ├── useEssay.ts
│   │   │   └── useAutoSave.ts
│   │   ├── stores/
│   │   │   ├── editorStore.ts
│   │   │   └── errorStore.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── writing.spec.ts
│   │   └── mobile.spec.ts
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Prompts
- `GET /api/prompts` - List prompts (query: `?level=B1`)

### Essays
- `POST /api/essays` - Create essay
- `GET /api/essays` - List user's essays
- `GET /api/essays/:id` - Get essay with errors
- `PUT /api/essays/:id` - Update essay

### Grammar
- `POST /api/grammar/check` - Check grammar (body: `{ text, language }`)

### Analytics
- `GET /api/analytics/:userId` - Get stats (query: `?period=month`)

**Full API documentation:** See `backend/README.md` (to be created by Backend Dev)

---

## 🧪 Testing

### Unit Tests (Backend)
```bash
cd backend
npm test
# Run specific test: npm test -- authService.test.ts
# Coverage report: npm test -- --coverage
```

### Component Tests (Frontend)
```bash
cd frontend
npm test
# Run specific test: npm test -- ErrorCard.test.tsx
```

### E2E Tests (Integration)
```bash
cd frontend
npx playwright test
# Run specific test: npx playwright test writing.spec.ts
# UI mode: npx playwright test --ui
# Debug mode: npx playwright test --debug
```

---

## 📞 Communication & Coordination

### Daily Standups (Async)
Post in team Slack channel:
- What did you work on yesterday?
- What are you working on today?
- Any blockers?

### Weekly Sync (Wednesdays, 2pm)
- Demo progress
- Discuss blockers
- Plan next week

### Critical Handoffs
1. **Week 2:** DB Specialist → Backend Dev (share schema)
2. **Week 3:** Backend Dev → Frontend Dev (share API contract)
3. **Week 6:** Frontend Dev → Integration Specialist (share component API)
4. **Week 10:** All → Integration Specialist (production deployment)

---

## 🚨 Common Issues & Solutions

### Issue: Database connection fails
**Solution:** Check `DATABASE_URL` in `.env` is correct. Ensure PostgreSQL is running.
```bash
# Test connection
psql $DATABASE_URL
```

### Issue: Redis connection fails
**Solution:** Start Redis locally:
```bash
redis-server
```

### Issue: CORS errors in frontend
**Solution:** Check backend CORS configuration allows frontend URL:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

### Issue: LanguageTool API rate limiting
**Solution:** Use Redis caching (should already be implemented). Check cache hit rate:
```bash
redis-cli
> KEYS grammar:*
```

### Issue: Lexical editor not rendering
**Solution:** Check React version (must be 18+). Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Progress Tracking

Use this checklist to track overall progress:

### Week 1-2: Foundation ✅
- [ ] Database schema created
- [ ] 20 prompts seeded
- [ ] Backend server running
- [ ] JWT authentication working
- [ ] Frontend boilerplate setup

### Week 3-4: Core Features ✅
- [ ] LanguageTool API integrated
- [ ] Lexical editor working
- [ ] Auto-save implemented
- [ ] Word count real-time

### Week 5-6: Error Highlighting ✅
- [ ] Error underlines appear
- [ ] Feedback panel shows errors
- [ ] Apply suggestion works
- [ ] Error tooltips on hover

### Week 7-8: Prompts & Analytics ✅
- [ ] Prompt selector loads prompts
- [ ] Essay dashboard lists essays
- [ ] Analytics endpoint returns stats

### Week 9-10: Mobile & Polish ✅
- [ ] Mobile responsive (feedback drawer)
- [ ] Loading/error states
- [ ] Performance optimized

### Week 11-12: Launch ✅
- [ ] E2E tests pass (25+ scenarios)
- [ ] Deployed to production (Vercel + Railway)
- [ ] Monitoring active (Sentry)
- [ ] 10+ beta users recruited

---

## 🎉 Beta Launch Checklist

Before launching to beta users:

**Technical:**
- [ ] All tests passing (unit, component, E2E)
- [ ] Production deployment successful
- [ ] Monitoring configured (Sentry, Plausible)
- [ ] Lighthouse score >85
- [ ] Security audit (OWASP top 10)

**Content:**
- [ ] All 20 prompts reviewed by native German speaker
- [ ] Grammar check accuracy >95% (tested on sample essays)
- [ ] User guide written

**Marketing:**
- [ ] Landing page live
- [ ] Beta signup form (Google Form or Typeform)
- [ ] Reddit post prepared (r/German)
- [ ] Email templates for beta invites

**Support:**
- [ ] Feedback channel created (Discord or email)
- [ ] Bug tracking system (GitHub Issues)
- [ ] Support email monitored

---

## 📚 Resources

### Documentation
- **Lexical Editor:** https://lexical.dev/docs/intro
- **React Query:** https://tanstack.com/query/latest/docs/react/overview
- **Zustand:** https://docs.pmnd.rs/zustand/getting-started/introduction
- **Playwright:** https://playwright.dev/docs/intro
- **LanguageTool API:** https://languagetool.org/http-api/swagger-ui/

### Design Assets
- **Figma Mockups:** [Link TBD]
- **Color Palette:** Tailwind default colors
- **Typography:** Inter font (Google Fonts)

### External Services
- **LanguageTool API:** https://languagetool.org/
- **Vercel:** https://vercel.com/
- **Railway:** https://railway.app/
- **Sentry:** https://sentry.io/

---

## ❓ FAQs

**Q: Can I use a different database (MySQL, MongoDB)?**  
A: Stick to PostgreSQL for Phase 1. We chose it for JSONB support and complex queries.

**Q: Can I use a different editor (Draft.js, Slate)?**  
A: Lexical is recommended (better performance, Meta-backed). If you have issues, discuss with team first.

**Q: What if LanguageTool API is down?**  
A: Implement fallback: show cached results or graceful error message. Don't block user from writing.

**Q: Do I need to implement all CEFR levels (A1-C2)?**  
A: Phase 1 only requires A1-B2 (20 prompts). C1-C2 are Phase 2.

**Q: Can I add features not in the spec?**  
A: Focus on MVP first. Document additional ideas in `FUTURE_FEATURES.md` for Phase 2.

---

## 🤝 Getting Help

**Slack Channels:**
- `#writing-module-dev` - General discussion
- `#writing-module-bugs` - Bug reports
- `#writing-module-questions` - Ask questions

**Team Leads:**
- **DB Specialist:** [Name]
- **Backend Dev:** [Name]
- **Frontend Dev:** [Name]
- **Integration Specialist:** [Name]

**Tech Lead:** [Name] - Final decisions on architecture

---

## 🎓 Learning Resources

**New to Lexical?**
- Tutorial: https://lexical.dev/docs/getting-started/quick-start
- Video: "Building a Rich Text Editor with Lexical" (YouTube)

**New to React Query?**
- Tutorial: https://tanstack.com/query/latest/docs/react/quick-start
- Video: "React Query in 100 Seconds" (Fireship)

**New to Playwright?**
- Tutorial: https://playwright.dev/docs/intro
- Video: "Playwright Tutorial for Beginners" (freeCodeCamp)

---

## 🔄 Version History

- **v1.0** (2026-02-07) - Initial release
- **v1.1** (TBD) - Post-Week 4 review updates
- **v2.0** (TBD) - Post-Phase 1 retrospective

---

**Document Status:** ✅ Complete  
**Last Updated:** February 7, 2026  
**Next Review:** Week 4 (March 7, 2026)

---

**Questions?** Ask in `#writing-module-questions` on Slack!

**Good luck, team! Let's build something amazing! 🚀**
