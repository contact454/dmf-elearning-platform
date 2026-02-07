# DEVELOPMENT PLAN - Reading Module Phase 1

**Project:** DMF E-Learning Platform - Reading Module MVP  
**Duration:** 10 weeks (Feb 6 - Apr 17, 2026)  
**Team Size:** 4 developers  
**Priority:** HIGH (Core Learning Module)  
**Status:** ✅ READY FOR EXECUTION

---

## 🎯 Executive Summary

**Mission:** Build a comprehensive reading comprehension system for Vietnamese English learners with 70 passages across CEFR levels A1-C2, featuring interactive vocabulary, 4 exercise types, progress tracking, and SRS integration.

**Business Value:**
- **Target Users:** 100M Vietnamese English learners
- **Competitive Edge:** Vietnamese-specialized features (phonetic guidance, cultural context)
- **Revenue Impact:** 15-20% free-to-paid conversion (vs 10% industry avg)
- **Strategic Importance:** Core content module alongside Listening/Vocabulary

**Success Criteria:**
- ✅ 70 reading passages (10 per CEFR level A1-C2) with complete metadata
- ✅ 4 exercise types fully functional: Multiple Choice, True/False, Fill-in-the-Blank, Sequencing
- ✅ Interactive vocabulary system (click word → definition, save to SRS)
- ✅ Progress tracking (session stats, overall analytics)
- ✅ Responsive design (mobile-first, works on 3G)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Lighthouse score >85 all categories

---

## 📋 Scope Overview

### Phase 1 Features (MVP)

**✅ In Scope:**
1. **Reading Passage Display**
   - Clean typography (18px font, 1.7 line height)
   - Adjustable font size (14-24px)
   - Reading mode (distraction-free fullscreen)
   - Mobile-responsive (single column, max-width 800px)

2. **Interactive Vocabulary**
   - Click word → popup definition
   - Desktop: popover, Mobile: bottom sheet
   - Save word to vocabulary list
   - Color-coded status (new/learning/known)
   - Vietnamese translations + IPA pronunciation

3. **4 Exercise Types**
   - **Multiple Choice:** 4 options, instant feedback
   - **True/False:** Binary choice, explanation on submit
   - **Fill-in-the-Blank:** Text input with fuzzy matching (85% similarity threshold)
   - **Sequencing:** Drag & drop sentences to correct order

4. **Progress Tracking**
   - Session stats (accuracy, time spent, exercises completed)
   - Overall stats (total passages, avg accuracy, vocabulary count)
   - Performance by CEFR level (charts)

5. **SRS Integration**
   - Vocabulary saved from reading passages syncs to SRS queue
   - Basic review scheduling (SuperMemo-2 algorithm)
   - Next review date calculated on save

**❌ Out of Scope (Future Phases):**
- Text-to-Speech (Phase 2)
- Teacher/Parent dashboards (Phase 3)
- IELTS/TOEIC exam prep passages (Phase 4)
- Advanced analytics (weak area detection) (Phase 3)
- Offline mode (Phase 2)
- Native mobile apps (Phase 5)

---

## 👥 Team Structure

### Database Specialist
**Name:** [TBD]  
**Time Commitment:** 24-32 hours (Weeks 1-4)  
**Responsibilities:**
- Design database schema (passages, exercises, progress, attempts)
- Create seed data (70 passages + 350 exercises)
- Implement indexes for performance
- Write migration scripts

**Deliverables:**
- `reading_passages` table (70 records)
- `reading_exercises` table (350+ records)
- `user_reading_progress` table (SRS tracking)
- `reading_attempts` table (analytics)
- Seed data JSON files

---

### Backend Developer
**Name:** [TBD]  
**Time Commitment:** 40-48 hours (Weeks 2-6)  
**Responsibilities:**
- REST API routes (GET passages, submit answers, track progress)
- Business logic (answer validation, accuracy calculation)
- SRS algorithm implementation (SuperMemo-2)
- Vocabulary integration (save words from passages)

**Deliverables:**
- `/api/reading/passages` (list, filter by CEFR)
- `/api/reading/passages/:id` (get passage + exercises)
- `/api/reading/submit` (submit exercise attempt)
- `/api/reading/progress` (user stats)
- `/api/vocabulary/save` (save word from passage)

---

### Frontend Developer
**Name:** [TBD]  
**Time Commitment:** 50-60 hours (Weeks 3-8)  
**Responsibilities:**
- Passage display component (typography, reading mode)
- Interactive text component (word highlighting, popups)
- 4 exercise type components
- Feedback system (success/error states)
- Progress dashboard UI

**Deliverables:**
- `PassageDisplay.tsx` (main reading view)
- `InteractiveText.tsx` (clickable words)
- `VocabularyPopup.tsx` (definition modal)
- `MultipleChoiceExercise.tsx`
- `TrueFalseExercise.tsx`
- `FillBlankExercise.tsx`
- `SequencingExercise.tsx`
- `FeedbackCard.tsx`
- `ReadingDashboard.tsx`

---

### Integration Specialist
**Name:** [TBD]  
**Time Commitment:** 30-36 hours (Weeks 5-10)  
**Responsibilities:**
- Connect frontend components to backend APIs
- State management (React Query, Zustand)
- Error handling (toast notifications, retry logic)
- Testing (E2E with Playwright)
- Deployment (Vercel)

**Deliverables:**
- API integration hooks (`useReadingPassages`, `useSubmitExercise`)
- State management setup (Zustand stores)
- E2E test suite (30+ test cases)
- Staging deployment (CI/CD)
- Production deployment

---

## 📅 Timeline Breakdown

### **Week 1-2: Foundation Setup**
**Focus:** Database schema, project scaffolding, initial components

**DB Specialist Tasks (16h):**
- Design 4 database tables
- Create Prisma schema
- Generate migrations
- Add indexes

**Backend Developer Tasks (12h):**
- Setup API routes structure
- Configure Supabase client
- Write utility functions (fuzzy matching, time formatting)

**Frontend Developer Tasks (16h):**
- Setup component library (Shadcn UI)
- Create base layout (header, sidebar, main content)
- Build PassageDisplay component (skeleton)
- Build AudioPlayer component (reuse from Listening)

**Integration Specialist Tasks (8h):**
- Configure React Query
- Setup Zustand stores
- Configure environment variables

**Milestone:** ✅ Project structure complete, database ready

---

### **Week 3-4: Content Creation + Core Reading UI**
**Focus:** Seed data, passage display, interactive text

**DB Specialist Tasks (16h):**
- Create 70 reading passages (JSON format)
- Create 350 exercises (50 per type)
- Validate data structure
- Run seed script

**Backend Developer Tasks (12h):**
- Implement GET /api/reading/passages
- Implement GET /api/reading/passages/:id
- Add CEFR level filtering
- Add pagination

**Frontend Developer Tasks (20h):**
- Complete PassageDisplay component
  - Typography styles
  - Font size controls
  - Reading mode toggle
- Build InteractiveText component
  - Word tokenization
  - Click handlers
- Build VocabularyPopup component
  - Definition display
  - Save to vocabulary button

**Integration Specialist Tasks (8h):**
- Create useReadingPassages hook
- Create usePassageById hook
- Handle loading states
- Handle errors (404, 500)

**Milestone:** ✅ Can view passages with interactive text

---

### **Week 5-6: Exercise Types**
**Focus:** Build all 4 exercise components

**Backend Developer Tasks (16h):**
- Implement POST /api/reading/submit
  - Multiple choice validation
  - True/False validation
  - Fill-blank validation (fuzzy matching)
  - Sequencing validation
- Calculate accuracy scores
- Save attempt to database

**Frontend Developer Tasks (24h):**
- Build MultipleChoiceExercise.tsx (8h)
  - 4 option buttons
  - Selection state
  - Correct/incorrect highlighting
- Build TrueFalseExercise.tsx (4h)
  - True/False buttons
  - Immediate feedback
- Build FillBlankExercise.tsx (8h)
  - Text input with validation
  - Word bank (optional)
  - Fuzzy match feedback
- Build SequencingExercise.tsx (10h)
  - @dnd-kit integration
  - Drag & drop UI
  - Correct order validation
- Build FeedbackCard.tsx (4h)
  - Success state (confetti, XP)
  - Error state (show correct answer)

**Integration Specialist Tasks (8h):**
- Create useSubmitExercise hook
- Handle submission states (loading, success, error)
- Optimistic updates (show feedback before API response)

**Milestone:** ✅ All 4 exercise types functional

---

### **Week 7-8: Progress Tracking + SRS**
**Focus:** User progress, analytics, vocabulary SRS integration

**Backend Developer Tasks (12h):**
- Implement GET /api/reading/progress
  - Total passages completed
  - Average accuracy by CEFR level
  - Time spent reading
- Implement POST /api/vocabulary/save
  - Save word from passage
  - Calculate next_review_at (SRS)
  - Update vocabulary status

**Frontend Developer Tasks (16h):**
- Build ReadingDashboard.tsx
  - Stats cards (passages, accuracy, time)
  - Performance by level chart (Recharts)
  - Vocabulary count
- Enhance VocabularyPopup
  - Show save confirmation
  - Color-code status (new/learning/known)

**Integration Specialist Tasks (12h):**
- Create useReadingProgress hook
- Create useSaveVocabulary hook
- Sync vocabulary status across components
- Cache progress data (React Query)

**Milestone:** ✅ Progress tracking fully functional

---

### **Week 9-10: Polish, Testing, Deployment**
**Focus:** Performance optimization, accessibility, E2E tests, production launch

**Backend Developer Tasks (8h):**
- Performance audit (query optimization)
- Add database indexes (if missing)
- Rate limiting (prevent spam submissions)
- API documentation (Swagger/OpenAPI)

**Frontend Developer Tasks (12h):**
- Accessibility audit (keyboard nav, ARIA labels)
- Responsive design fixes (mobile, tablet)
- Performance optimization (code splitting, lazy loading)
- Dark mode support

**Integration Specialist Tasks (16h):**
- Write E2E tests (Playwright)
  - Test: View passage
  - Test: Complete multiple choice exercise
  - Test: Save vocabulary
  - Test: View progress dashboard
- Setup CI/CD (GitHub Actions)
  - Run tests on push
  - Deploy to Vercel on merge to main
- Load testing (simulate 1000 users)
- Production deployment
  - Deploy backend (Supabase)
  - Deploy frontend (Vercel)
  - Smoke tests

**Milestone:** ✅ Production launch complete

---

## 🗂️ Deliverables Checklist

### Database
- [ ] `reading_passages` table (Prisma schema)
- [ ] `reading_exercises` table (Prisma schema)
- [ ] `user_reading_progress` table (Prisma schema)
- [ ] `reading_attempts` table (Prisma schema)
- [ ] Seed data: 70 passages (JSON)
- [ ] Seed data: 350+ exercises (JSON)
- [ ] Migration scripts (Prisma)
- [ ] Database indexes (performance)

### Backend API
- [ ] GET `/api/reading/passages` (list, filter, paginate)
- [ ] GET `/api/reading/passages/:id` (get single passage + exercises)
- [ ] POST `/api/reading/submit` (submit exercise attempt)
- [ ] GET `/api/reading/progress` (user stats)
- [ ] POST `/api/vocabulary/save` (save word from passage)
- [ ] API documentation (Swagger)

### Frontend Components
- [ ] `PassageDisplay.tsx` (main reading view)
- [ ] `InteractiveText.tsx` (clickable words)
- [ ] `VocabularyPopup.tsx` (definition modal)
- [ ] `MultipleChoiceExercise.tsx`
- [ ] `TrueFalseExercise.tsx`
- [ ] `FillBlankExercise.tsx`
- [ ] `SequencingExercise.tsx`
- [ ] `FeedbackCard.tsx`
- [ ] `ReadingDashboard.tsx`

### Integration
- [ ] React Query hooks (useReadingPassages, useSubmitExercise, etc.)
- [ ] Zustand stores (vocabulary status, UI preferences)
- [ ] E2E test suite (30+ test cases)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging deployment
- [ ] Production deployment

---

## 🎯 Success Metrics

### Development Quality
- **Code Coverage:** >80% (Jest + Playwright)
- **Lighthouse Score:** >85 (all categories)
- **WCAG Compliance:** 2.1 AA (0 violations)
- **Bundle Size:** <150KB initial JS (gzipped)
- **API Latency (p95):** <500ms

### User Experience
- **Page Load (p95):** <2 seconds
- **Exercise Completion Rate:** >70%
- **Vocabulary Save Rate:** >40% (users who click words save them)
- **Session Duration:** >10 minutes average

### Content Quality
- **Passage Quality:** All 70 passages reviewed by native speaker
- **Exercise Variety:** Min 5 exercises per passage, 4 types distributed evenly
- **Difficulty Calibration:** CEFR levels validated by ESL expert

---

## 🚀 Post-Launch Roadmap (Future Phases)

### Phase 2: Enhanced Features (Weeks 11-14)
- Text-to-Speech (Google Cloud TTS)
- Offline mode (Service Worker)
- Adaptive difficulty (adjust based on performance)
- Dark mode

### Phase 3: Gamification (Weeks 15-18)
- XP system (10 XP per correct answer)
- Daily streak tracking
- Achievement badges
- Leaderboards (optional)

### Phase 4: Exam Prep (Weeks 19-22)
- IELTS reading passages (20+)
- TOEIC reading passages (20+)
- Score prediction algorithm
- Exam-style timer

### Phase 5: Teacher Tools (Weeks 23-26)
- Teacher dashboard (assign homework)
- Parent dashboard (view child's progress)
- Classroom analytics
- School licenses

---

## 🛠️ Technical Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Shadcn UI (component library)
- React Query (server state)
- Zustand (client state)
- Framer Motion (animations)
- @dnd-kit (drag & drop)
- Recharts (charts)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Prisma (ORM)
- Node.js 20+ (serverless functions)

**Infrastructure:**
- Vercel (frontend hosting)
- Supabase Cloud (database)
- Cloudflare R2 (future: TTS audio files)
- Upstash Redis (caching)

**DevOps:**
- GitHub Actions (CI/CD)
- Playwright (E2E testing)
- Jest + Testing Library (unit tests)
- Sentry (error tracking)

---

## 💵 Cost Estimate

### Development Labor
| Role | Hours | Rate | Total |
|------|-------|------|-------|
| DB Specialist | 32h | $80/h | $2,560 |
| Backend Dev | 48h | $80/h | $3,840 |
| Frontend Dev | 60h | $80/h | $4,800 |
| Integration Specialist | 36h | $80/h | $2,880 |
| **Total Labor** | **176h** | | **$14,080** |

### Infrastructure (Monthly)
| Service | Cost |
|---------|------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Upstash Redis | $10 |
| Cloudflare R2 | $1 |
| Sentry | $26 |
| **Total Monthly** | **$82** |

### **Total Phase 1 Cost: ~$14,500**

---

## 📞 Communication Plan

### Daily Standup (15 min)
**Time:** 9:00 AM GMT+7  
**Format:** Slack or Zoom  
**Agenda:**
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

### Weekly Review (30 min)
**Time:** Friday 4:00 PM GMT+7  
**Format:** Zoom  
**Agenda:**
- Demo completed features
- Review progress vs timeline
- Adjust priorities if needed
- Plan next week

### Tools
- **Code:** GitHub (pull requests, code reviews)
- **Docs:** Notion (technical specs, meeting notes)
- **Chat:** Slack (daily communication)
- **Project Management:** Linear (task tracking)

---

## 🎓 Acceptance Criteria

Before marking Phase 1 as **COMPLETE**, verify:

- [ ] All 70 passages display correctly on desktop + mobile
- [ ] Interactive text works (click word → popup)
- [ ] All 4 exercise types functional (tested on 10+ passages each)
- [ ] Feedback system shows correct/incorrect states
- [ ] Progress dashboard shows accurate stats
- [ ] Vocabulary save integrates with SRS system
- [ ] Lighthouse score >85 (Performance, Accessibility, Best Practices, SEO)
- [ ] WCAG 2.1 AA compliance (0 violations via axe DevTools)
- [ ] E2E tests pass (30+ test cases)
- [ ] Production deployment successful
- [ ] Smoke tests pass (can view passage, complete exercise, see progress)

---

## 📚 Documentation

### Developer Docs
- [ ] README_reading_phase1.md (quick start guide)
- [ ] TECH_SPEC_reading_phase1.md (technical details)
- [ ] API_DOCS_reading.md (API endpoints)
- [ ] DB_SCHEMA_reading.md (database structure)

### User Docs
- [ ] User guide (how to use reading module)
- [ ] Teacher guide (if applicable)
- [ ] FAQ (common questions)

---

## ✅ Sign-Off

**Prepared by:** PM (Product Manager)  
**Date:** February 6, 2026  
**Status:** ✅ Ready for Tech Lead Review

**Approvals Required:**
- [ ] Tech Lead (architecture review)
- [ ] Product Manager (scope approval)
- [ ] CTO (budget approval)

**Next Steps:**
1. Tech Lead reviews plan (1-2 days)
2. Assemble team (DB Specialist, Backend Dev, Frontend Dev, Integration Specialist)
3. Kick off Week 1 (database design + scaffolding)
4. Daily standups begin

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Contact:** PM Team (pm@dmf-elearning.com)
