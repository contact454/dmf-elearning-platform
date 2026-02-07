# Listening Module Phase 1 - README

**Project:** DMF E-Learning Platform  
**Module:** Listening (Audio Comprehension)  
**Phase:** 1 (Foundation + Core Exercises)  
**Status:** 🟡 Planning Complete, Development Pending

---

## 📋 Overview

This directory contains the comprehensive development plan for the **Listening Module Phase 1**. The plan translates 145 KB of research findings into actionable tasks for a 4-person team over 8 weeks.

**Goal:** Build a robust, engaging listening comprehension system with 70 exercises, 4 exercise types, intelligent progress tracking, and responsive UI.

---

## 📂 File Structure

```
.execution/
├── DEVELOPMENT_PLAN_listening_phase1.md  ← Master plan (read this first!)
├── README_listening_phase1.md            ← This file
└── tasks-listening/
    ├── db-specialist-listening.md        ← Database tasks (schema, seed, indexes)
    ├── backend-audio-listening.md        ← Audio storage, API endpoints
    ├── backend-srs-listening.md          ← SRS algorithm, progress tracking
    └── frontend-listening.md             ← UI components, audio player
```

---

## 👥 Team Roles & Task Files

### **1. Database Specialist**
- **File:** `tasks-listening/db-specialist-listening.md`
- **Responsibilities:**
  - Design database schema (3 tables: exercises, progress, attempts)
  - Create Prisma migrations
  - Add performance indexes (8 indexes)
  - Seed 70 exercises (10 per difficulty A1-B2)
- **Estimated Effort:** 24-32 hours over 8 weeks
- **Key Deliverables:**
  - `prisma/migrations/XXX_add_listening_tables.sql`
  - `data/listening-seed.json` (70 exercises)
  - `scripts/seed-listening.mjs`

### **2. Backend Developer (Audio)**
- **File:** `tasks-listening/backend-audio-listening.md`
- **Responsibilities:**
  - Setup Cloudflare R2 bucket (audio storage)
  - Upload 70 audio files (MP3, 96kbps, mono)
  - Implement 4 API endpoints (exercises, submit, stats, metadata)
  - Implement answer checking logic (fuzzy matching for dictation)
- **Estimated Effort:** 32-40 hours over 8 weeks
- **Key Deliverables:**
  - R2 bucket configured with 70 audio files
  - `pages/api/listening/exercises.ts`
  - `pages/api/listening/submit.ts`
  - `lib/listening-utils.ts` (answer checking)

### **3. Backend Developer (SRS)**
- **File:** `tasks-listening/backend-srs-listening.md`
- **Responsibilities:**
  - Implement SRS algorithm (SM-2 based, listening-specific)
  - Create difficulty adjustment algorithm (adaptive learning)
  - Integrate streak tracking service
  - Build analytics aggregation functions
- **Estimated Effort:** 28-36 hours over 8 weeks
- **Key Deliverables:**
  - `lib/srs/listening-srs.ts` (SRS algorithm)
  - `lib/analytics/listening-analytics.ts`
  - `.execution/SRS_ALGORITHM_listening.md` (tech spec)
  - 20+ unit tests passing

### **4. Frontend Developer**
- **File:** `tasks-listening/frontend-listening.md`
- **Responsibilities:**
  - Build audio player component (Howler.js)
  - Create 4 exercise type components (dictation, multiple choice, audio-image, fill-blank)
  - Implement feedback system (correct/incorrect/partial)
  - Build progress tracking UI (session + overall)
- **Estimated Effort:** 40-48 hours over 8 weeks
- **Key Deliverables:**
  - `components/listening/AudioPlayer.tsx`
  - 4 exercise components
  - `components/listening/FeedbackCard.tsx`
  - Responsive design (mobile + desktop)

---

## 🚀 How to Get Started

### **Step 1: Read the Master Plan**
- **File:** `DEVELOPMENT_PLAN_listening_phase1.md`
- **Contents:** Overview, scope, timeline, success criteria
- **Duration:** 15-20 minutes

### **Step 2: Read Your Team's Task File**
- **DB Specialist:** `tasks-listening/db-specialist-listening.md`
- **Backend Dev (Audio):** `tasks-listening/backend-audio-listening.md`
- **Backend Dev (SRS):** `tasks-listening/backend-srs-listening.md`
- **Frontend Dev:** `tasks-listening/frontend-listening.md`
- **Duration:** 30-45 minutes per file

### **Step 3: Setup Your Environment**
- **All Team Members:**
  - Clone repository: `git clone <repo-url>`
  - Install dependencies: `npm install`
  - Copy `.env.example` to `.env.local`
  - Run database migrations: `npx prisma migrate dev`

- **Backend Dev (Audio):**
  - Create Cloudflare R2 account
  - Add R2 credentials to `.env.local`

- **Backend Dev (SRS):**
  - Install test framework: `npm install -D vitest`

- **Frontend Dev:**
  - Install Howler.js: `npm install howler @types/howler`

### **Step 4: Follow Weekly Timeline**
- **Weeks 1-2:** Foundation setup (schema, R2, audio player)
- **Weeks 3-4:** Core implementation (APIs, SRS, exercise types)
- **Weeks 5-6:** Complete features (seed data, analytics, progress UI)
- **Weeks 7-8:** Integration, testing, polish

### **Step 5: Coordinate with Team**
- **Daily standups:** 15-minute sync (recommended)
- **Weekly reviews:** Check progress, unblock issues
- **Slack/Discord:** Ask questions, share updates

---

## 🎯 Success Criteria (Phase 1)

### Functional Requirements
- ✅ 70 listening exercises available
- ✅ 4 exercise types working (dictation, multiple choice, audio-image, fill-blank)
- ✅ Audio player functional (Play, Pause, Replay, Speed: 0.75x/1x/1.25x)
- ✅ Progress tracking accurate (session + overall)
- ✅ Feedback system clear (correct/incorrect/partial credit)
- ✅ Streak tracking working (consecutive days)

### Performance Requirements
- ✅ API response time \< 100ms (p95)
- ✅ Page load time \< 3s
- ✅ Audio load time \< 2s (on 4G)
- ✅ Animation frame rate \u003e= 60fps
- ✅ Lighthouse score \u003e 85

### Quality Requirements
- ✅ 0 critical bugs
- ✅ \< 3 high severity bugs
- ✅ \< 10 medium/low severity bugs
- ✅ Unit test coverage \u003e 80% (backend)
- ✅ Accessibility audit passed (WCAG 2.1 AA)

---

## 📊 Timeline Summary

### Week 1-2: Foundation
- **DB:** Schema design, migrations
- **Backend (Audio):** R2 setup, sample audio upload
- **Backend (SRS):** Algorithm design, test setup
- **Frontend:** Audio player component

### Week 3-4: Core Implementation
- **DB:** Seed 50% of data (35 exercises)
- **Backend (Audio):** All 70 audio files uploaded, 2 API endpoints
- **Backend (SRS):** SRS algorithm implemented, 20+ tests
- **Frontend:** 2 exercise types (dictation, multiple choice)

### Week 5-6: Complete Features
- **DB:** Seed 100% of data (70 exercises), performance testing
- **Backend (Audio):** Remaining 2 API endpoints, docs
- **Backend (SRS):** Analytics, streak tracking
- **Frontend:** Remaining 2 exercise types, progress UI

### Week 7-8: Integration & Polish
- **DB:** Final validation, backup scripts
- **Backend (Audio):** Integration testing, security audit
- **Backend (SRS):** Algorithm tuning, docs finalization
- **Frontend:** Loading states, error boundaries, responsive design, accessibility

---

## 🚧 Dependencies

### External Services
- **Cloudflare R2:** Audio file storage (required)
  - Account: Existing DMF Cloudflare account
  - Bucket: `dmf-listening-audio`
- **Supabase:** Database (existing, add new tables)

### Internal Dependencies
- **Authentication:** Existing auth system (`x-user-id` header)
- **Design System:** Shadcn UI components (existing)
- **Vocabulary Module:** Reuse SRS concepts, streak service

### Content Dependencies
- **Audio Files:** 70 MP3 files (3-30 seconds each)
- **Transcripts:** Plain text for all 70 exercises
- **Answer Keys:** Correct answers for all exercise types

---

## ⚠️ Common Issues & Solutions

### Issue: Audio files not loading
- **Cause:** CORS error from R2 bucket
- **Solution:** Check R2 bucket CORS config, add `localhost:3000` origin
- **Contact:** Backend Dev (Audio)

### Issue: Database migration fails
- **Cause:** Conflict with existing migrations
- **Solution:** Reset database or manually resolve conflicts
- **Contact:** Database Specialist

### Issue: SRS algorithm tests failing
- **Cause:** Edge cases not handled
- **Solution:** Review test cases, add error handling
- **Contact:** Backend Dev (SRS)

### Issue: Audio player not working in Safari
- **Cause:** Howler.js compatibility issue
- **Solution:** Add HTML5 audio fallback
- **Contact:** Frontend Dev

---

## 📞 Contact & Escalation

### Team Leads
- **Technical Lead:** [TBD]
- **Product Manager:** PM Agent (completed planning)
- **Project Manager:** [TBD]

### Escalation Process
1. **Blocked for \< 1 hour:** Try debugging yourself
2. **Blocked for 1-4 hours:** Ask team member in same role
3. **Blocked for \u003e 4 hours:** Escalate to Tech Lead or PM
4. **Critical blocker:** Immediately notify Tech Lead

### Communication Channels
- **Slack/Discord:** Daily updates, quick questions
- **GitHub Issues:** Bug reports, feature requests
- **Weekly Meetings:** Progress reviews, planning

---

## 🎉 Next Steps After Phase 1

### Phase 2: Visualization (Weeks 9-12)
- Waveform visualization (WaveSurfer.js)
- Interactive timeline
- Word-level highlighting

### Phase 3: Polish (Weeks 13-16)
- Session summary screen
- Animations polish
- Performance optimization

### Phase 4: Speech Recognition (Weeks 17-20)
- Web Speech API integration
- Pronunciation exercises
- Speech scoring algorithm

### Phase 5: Gamification (Weeks 21-24)
- Achievement badges
- Leaderboard
- Offline mode (Service Worker)

### Phase 6: Advanced Features (Weeks 25+)
- Real-world content library
- Interactive transcripts with word definitions
- Advanced analytics dashboard

---

## 📝 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-06 | PM Agent | Initial planning complete |

---

## ✅ Checklist for PM/Tech Lead

Before development starts:
- [ ] All 4 task files reviewed and approved
- [ ] Team members assigned to roles
- [ ] Cloudflare R2 account created
- [ ] Audio files sourced (70 MP3s)
- [ ] Development environment setup (all devs)
- [ ] GitHub project board created
- [ ] Kickoff meeting scheduled
- [ ] Weekly standup schedule set

---

**Questions? Issues? Feedback?**  
Contact the PM or Tech Lead. Good luck, team! 🚀
