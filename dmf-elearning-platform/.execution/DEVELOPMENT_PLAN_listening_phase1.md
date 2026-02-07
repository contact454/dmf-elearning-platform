# Listening Module Phase 1 - Development Plan

**Date:** 2026-02-06  
**Module:** Listening (Audio Comprehension)  
**Phase:** 1 (Foundation + Core Exercises)  
**Duration:** 8 weeks  
**Team:** DB Specialist, Backend Dev (Audio), Backend Dev (SRS), Frontend Dev

---

## 📋 Executive Summary

This development plan translates 145 KB of research findings into actionable tasks for the DMF Listening Module Phase 1. The plan prioritizes foundation (audio infrastructure, database) and core exercises (4 types, 70 exercises) while deferring advanced features to future phases.

**Core Goal:** Build a robust, engaging listening comprehension system that helps Vietnamese learners master English audio skills through diverse exercises, intelligent feedback, and motivating progression.

**Key Differentiators:**
- Vietnamese learner focus (th, r, v phonetic challenges)
- Hybrid audio stack (Howler.js + WaveSurfer.js)
- Intelligent SRS for listening progress
- Interactive transcripts with word definitions
- Real-world audio scenarios

---

## 🎯 Phase 1 Scope

### ✅ In Scope (Must-Have)

**1. Audio Playback Infrastructure**
- Howler.js integration for cross-browser audio
- Playback controls (Play, Pause, Replay, Speed: 0.75x/1x/1.25x)
- Progress bar with time display
- Keyboard shortcuts (Space = play/pause, R = replay)

**2. Database Schema**
- `listening_exercises` table (exercise metadata)
- `user_listening_progress` table (user performance)
- `listening_attempts` table (detailed attempt logs)
- Indexes for performance optimization
- Seed 70 exercises (10 per difficulty level A1-B2)

**3. Core Exercise Types (4 Types)**
- **Dictation:** Type what you hear
- **Multiple Choice:** Select correct answer
- **Audio-Image Matching:** Match audio to images
- **Fill-in-the-Blank:** Complete transcript gaps

**4. Feedback System**
- Correct/incorrect visual feedback
- Answer comparison (expected vs. user input)
- XP calculation and display (+10 perfect, +7 2nd try, +5 3rd try)
- Fuzzy matching for typos (30% threshold)

**5. Progress Tracking**
- Session progress (8/15 exercises)
- Overall progress (total completed, accuracy %, listening time)
- Streak tracking (consecutive days practicing)
- Analytics endpoints (weekly stats, skill breakdown)

**6. Backend APIs**
- `GET /api/listening/exercises` - Fetch exercises by difficulty
- `POST /api/listening/submit` - Submit answer and get feedback
- `GET /api/listening/stats` - User listening statistics
- `GET /api/listening/metadata/:exerciseId` - Exercise metadata
- Audio file streaming via Cloudflare R2

---

### ❌ Out of Scope (Future Phases)

**Deferred to Phase 2-6:**
- ❌ Waveform visualization (WaveSurfer.js) - Phase 3
- ❌ Speech recognition (Web Speech API + Cloud) - Phase 4
- ❌ Pronunciation exercises - Phase 4
- ❌ Gamification (badges, leaderboards) - Phase 5
- ❌ Advanced analytics dashboard - Phase 6
- ❌ Real-world content library (podcasts, news) - Phase 5
- ❌ Interactive transcripts with word definitions - Phase 6
- ❌ Offline mode (Service Worker) - Phase 5

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework:** React 18+ with TypeScript
- **Audio Library:** Howler.js v2.2+ (cross-browser playback)
- **State Management:** React Query v5 (server state), Zustand v4 (UI state)
- **UI Components:** Shadcn UI (existing design system)
- **Animation:** Framer Motion (feedback animations)
- **Forms:** React Hook Form + Zod validation

### Backend Stack
- **Runtime:** Node.js 20+
- **Framework:** Next.js API routes (existing)
- **Database:** Supabase PostgreSQL (existing)
- **Storage:** Cloudflare R2 (audio files)
- **Caching:** Redis (Upstash) - optional for Phase 1
- **Validation:** Zod (consistent with vocabulary module)

### Audio Specifications
- **Format:** MP3 (best browser compatibility)
- **Bitrate:** 96kbps (sufficient for speech)
- **Sample Rate:** 44.1kHz
- **Channels:** Mono (smaller file size)
- **Max Duration:** 30 seconds per exercise (Phase 1)

---

## 👥 Team Responsibilities

### 1. Database Specialist

**Owner:** Database design, schema creation, seed data  
**Estimated Effort:** 24-32 hours over 8 weeks

**Tasks:**
1. Design database schema (listening_exercises, user_listening_progress, listening_attempts)
2. Create Prisma migration files
3. Add indexes for performance (user_id, exercise_id, difficulty)
4. Design seed data structure (70 exercises)
5. Create seed script (Node.js + Prisma)
6. Populate seed data (10 exercises per difficulty A1-B2)
7. Validate data integrity (foreign keys, constraints)
8. Document schema in README

**Deliverables:**
- `prisma/migrations/XXX_add_listening_tables.sql`
- `scripts/seed-listening.mjs`
- `data/listening-seed.json` (70 exercises)
- `.execution/tasks-listening/db-schema-docs.md`

---

### 2. Backend Developer (Audio)

**Owner:** Audio storage, streaming, API endpoints  
**Estimated Effort:** 32-40 hours over 8 weeks

**Tasks:**
1. Setup Cloudflare R2 bucket (audio file storage)
2. Upload 70 audio files to R2
3. Implement `GET /api/listening/exercises` (fetch by difficulty)
4. Implement `POST /api/listening/submit` (validate answer, calculate score)
5. Implement `GET /api/listening/stats` (user statistics)
6. Implement `GET /api/listening/metadata/:exerciseId` (exercise details)
7. Implement audio streaming endpoint (R2 presigned URLs)
8. Add Zod validation schemas for all endpoints
9. Write API documentation (request/response examples)

**Deliverables:**
- Cloudflare R2 bucket configured
- 70 audio files uploaded
- 4 API endpoints fully functional
- API docs: `.execution/API_DOCS_listening.md`

---

### 3. Backend Developer (SRS)

**Owner:** Progress tracking, SRS algorithm, analytics  
**Estimated Effort:** 28-36 hours over 8 weeks

**Tasks:**
1. Design listening progress tracking logic
2. Implement SRS algorithm for listening (based on accuracy, attempts, time)
3. Create difficulty adjustment algorithm (adaptive learning)
4. Implement streak tracking service (reuse from vocabulary module)
5. Create analytics aggregation functions (accuracy %, time spent, exercises completed)
6. Add progress update middleware (auto-update after submit)
7. Write unit tests for SRS algorithm (20+ test cases)
8. Document algorithm in technical spec

**Deliverables:**
- SRS algorithm implemented (with tests)
- Streak service integrated
- Analytics functions working
- Tech spec: `.execution/SRS_ALGORITHM_listening.md`

---

### 4. Frontend Developer

**Owner:** UI components, audio player, exercise flows  
**Estimated Effort:** 40-48 hours over 8 weeks

**Tasks:**
1. Create AudioPlayer component (Howler.js integration)
2. Build playback controls (Play, Pause, Replay, Speed)
3. Implement progress bar component
4. Create 4 exercise type components:
   - DictationExercise
   - MultipleChoiceExercise
   - AudioImageMatchingExercise
   - FillInTheBlankExercise
5. Build FeedbackCard component (correct/incorrect states)
6. Create SessionProgress component (X/Y exercises)
7. Build OverallProgress component (dashboard widget)
8. Implement keyboard shortcuts (Space, R, 1-4)
9. Add loading states (skeletons)
10. Implement error boundaries
11. Responsive design (mobile + desktop)
12. Write component documentation (Storybook optional)

**Deliverables:**
- 9+ React components (fully functional)
- Audio player working (3 speed options)
- 4 exercise types implemented
- UI responsive (mobile-first)
- Component docs: `.execution/COMPONENT_DOCS_listening.md`

---

## 📊 Task Breakdown by Week

### **Week 1-2: Foundation Setup**

**DB Specialist:**
- [ ] Design database schema (listening tables)
- [ ] Create Prisma migrations
- [ ] Add indexes for performance
- [ ] Document schema design

**Backend Dev (Audio):**
- [ ] Setup Cloudflare R2 bucket
- [ ] Configure bucket permissions (public read)
- [ ] Upload 20 sample audio files (testing)
- [ ] Test R2 presigned URL generation

**Backend Dev (SRS):**
- [ ] Review vocabulary SRS algorithm
- [ ] Design listening-specific SRS logic
- [ ] Plan analytics data structure
- [ ] Setup test framework (Vitest)

**Frontend Dev:**
- [ ] Setup audio dependencies (Howler.js)
- [ ] Create basic AudioPlayer component
- [ ] Test audio playback (local files)
- [ ] Design exercise component structure

**Milestone:** Audio player working locally, database schema designed

---

### **Week 3-4: Core Implementation**

**DB Specialist:**
- [ ] Create seed data structure (70 exercises)
- [ ] Write seed script (Node.js + Prisma)
- [ ] Populate 50% of seed data (35 exercises)
- [ ] Test data integrity

**Backend Dev (Audio):**
- [ ] Upload all 70 audio files to R2
- [ ] Implement `GET /api/listening/exercises`
- [ ] Implement `POST /api/listening/submit`
- [ ] Add Zod validation schemas
- [ ] Write API tests (20+ cases)

**Backend Dev (SRS):**
- [ ] Implement SRS algorithm (core logic)
- [ ] Add difficulty adjustment algorithm
- [ ] Write unit tests (20+ cases)
- [ ] Integrate streak tracking service

**Frontend Dev:**
- [ ] Build DictationExercise component
- [ ] Build MultipleChoiceExercise component
- [ ] Implement FeedbackCard component
- [ ] Add XP display animation

**Milestone:** 2 exercise types working, API endpoints functional

---

### **Week 5-6: Complete Features**

**DB Specialist:**
- [ ] Complete seed data (70 exercises total)
- [ ] Run seed script (populate database)
- [ ] Validate all exercises (audio URLs valid)
- [ ] Performance testing (query optimization)

**Backend Dev (Audio):**
- [ ] Implement `GET /api/listening/stats`
- [ ] Implement `GET /api/listening/metadata/:exerciseId`
- [ ] Optimize audio streaming (compression)
- [ ] Write API documentation

**Backend Dev (SRS):**
- [ ] Create analytics aggregation functions
- [ ] Implement progress update middleware
- [ ] Add error handling (edge cases)
- [ ] Performance testing (100 concurrent users)

**Frontend Dev:**
- [ ] Build AudioImageMatchingExercise component
- [ ] Build FillInTheBlankExercise component
- [ ] Create SessionProgress component
- [ ] Create OverallProgress component (dashboard)
- [ ] Add keyboard shortcuts (Space, R, 1-4)

**Milestone:** All 4 exercise types working, 70 exercises available

---

### **Week 7-8: Integration & Polish**

**DB Specialist:**
- [ ] Database performance audit
- [ ] Add additional indexes if needed
- [ ] Create backup/restore scripts
- [ ] Final data validation

**Backend Dev (Audio):**
- [ ] Integration testing (API + Database)
- [ ] Error handling improvements
- [ ] Security audit (auth, validation)
- [ ] API performance optimization

**Backend Dev (SRS):**
- [ ] Integration testing (SRS + API)
- [ ] Edge case testing (new users, high accuracy, low accuracy)
- [ ] Algorithm tuning (based on test data)
- [ ] Documentation finalization

**Frontend Dev:**
- [ ] Loading states (skeletons)
- [ ] Error boundaries (graceful failures)
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] Animation polish (60fps)
- [ ] Bug fixes (critical priority)

**Milestone:** Phase 1 complete, ready for QA testing

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] 70 listening exercises available
- [ ] 4 exercise types fully functional
- [ ] Audio player working (Play, Pause, Replay, Speed)
- [ ] Progress tracking accurate (session + overall)
- [ ] Streak tracking working (increments daily)
- [ ] Feedback system clear (correct/incorrect)
- [ ] Keyboard shortcuts working (Space, R, 1-4)
- [ ] Mobile responsive (tested on iOS + Android)

### Performance Requirements
- [ ] API response time \< 100ms (p95)
- [ ] Page load time \< 3s (Time to Interactive)
- [ ] Audio load time \< 2s (on 4G network)
- [ ] Animation frame rate = 60fps (no dropped frames)
- [ ] Lighthouse score \> 85 (Performance, Accessibility, Best Practices)

### Quality Requirements
- [ ] 0 critical bugs (blocking production)
- [ ] \< 3 high severity bugs
- [ ] \< 10 medium/low severity bugs
- [ ] Unit test coverage \> 80% (backend)
- [ ] Component tests passing (frontend)
- [ ] API tests passing (integration)

### Documentation Requirements
- [ ] Database schema documented
- [ ] API endpoints documented (request/response examples)
- [ ] SRS algorithm documented (technical spec)
- [ ] Component documentation (props, usage)
- [ ] User guide (how to use listening module)

---

## 🚧 Dependencies

### External Services
- **Cloudflare R2:** Audio file storage (required)
  - Account: Existing DMF Cloudflare account
  - Bucket name: `dmf-listening-audio`
  - Access: Public read, authenticated write
  
- **Supabase:** Database (existing)
  - Already configured for vocabulary module
  - Add new tables via Prisma migration

### Internal Dependencies
- **Authentication:** Existing auth system (x-user-id header)
- **Design System:** Existing Shadcn UI components
- **Vocabulary Module:** Reuse SRS concepts, streak tracking service

### Content Dependencies
- **Audio Files:** 70 MP3 files (recorded or sourced)
  - A1 level: 10 exercises (3-5 second clips)
  - A2 level: 10 exercises (5-10 second clips)
  - B1 level: 10 exercises (10-15 second clips)
  - B2 level: 10 exercises (15-20 second clips)
  - C1 level: 10 exercises (20-25 second clips)
  - C2 level: 10 exercises (25-30 second clips)
  - Mixed: 10 exercises (various difficulties)

- **Transcripts:** Plain text transcripts for all 70 exercises
- **Answer Keys:** Correct answers for all exercise types

---

## ⚠️ Risk Mitigation

### Technical Risks

**Risk 1: Audio delivery costs exceed budget**
- **Mitigation:** Use Cloudflare R2 ($0.015/GB storage, $0.00 egress)
- **Monitoring:** Weekly cost reports from Cloudflare dashboard
- **Contingency:** Reduce audio quality to 64kbps if needed

**Risk 2: Browser compatibility issues**
- **Mitigation:** Use Howler.js (proven cross-browser support)
- **Testing:** Test on Chrome, Firefox, Safari, Edge
- **Fallback:** HTML5 audio element if Howler.js fails

**Risk 3: Database performance degradation**
- **Mitigation:** Add indexes on user_id, exercise_id, difficulty
- **Monitoring:** Track query performance (Prisma logging)
- **Optimization:** Use database views for complex aggregations

### Product Risks

**Risk 1: Users find exercises boring**
- **Mitigation:** 4 exercise types (variety), real-world scenarios
- **Feedback:** User testing in Week 6-7
- **Iteration:** Adjust exercise types based on feedback

**Risk 2: Difficulty curve too steep/shallow**
- **Mitigation:** Adaptive difficulty algorithm (SRS-based)
- **Testing:** Test with 10 beta users (different levels)
- **Adjustment:** Manual difficulty override available

**Risk 3: Not enough content at launch**
- **Mitigation:** Start with 70 exercises (sufficient for Phase 1)
- **Expansion:** Plan Phase 2 content (100 more exercises)
- **User-generated:** Consider user-generated content in future

---

## 📈 Metrics to Track

### User Engagement
- Daily Active Users (DAU)
- Average session duration (target: \> 8 minutes)
- Exercises completed per session (target: \> 5)
- 7-day return rate (target: \> 40%)

### Learning Outcomes
- Average accuracy (baseline + improvement over time)
- Exercises completed (total count)
- Listening time (weekly minutes)
- Streak length (current + longest)

### Technical Performance
- API response time (p50, p95, p99)
- Page load time (Time to Interactive)
- Audio load time (median, p95)
- Error rate (target: \< 1%)

### Business Metrics (If Applicable)
- Cost per user (infrastructure)
- Cost per exercise (audio storage + bandwidth)
- Conversion rate (free to premium - future)

---

## 🎉 Handoff to QA

### When Development Complete

**QA Team Receives:**
1. This development plan (completed tasks checked)
2. All deliverables (code, docs, seed data)
3. Test environment access (localhost:3000 or staging URL)
4. Admin credentials (for database inspection)
5. Sample test user accounts (x-user-id: test-user-001, test-user-002, etc.)

**QA Testing Scope:**
1. **Integration Testing:** All API endpoints (request/response validation)
2. **E2E Testing:** Complete exercise flows (4 types)
3. **Performance Testing:** Load testing (100 concurrent users)
4. **Security Testing:** Auth, input validation, XSS/SQL injection
5. **Accessibility Testing:** Keyboard navigation, screen reader

**QA Success Criteria:**
- Pass criteria: 0 critical bugs, \< 3 high, \< 10 medium/low
- Fail criteria: ≥ 1 critical bug (after fix attempts)
- Performance: API \< 100ms, Page load \< 3s, 60fps animations
- Security: No vulnerabilities found

**QA Deliverables:**
- Test results report (`.testing/TEST_RESULTS_listening_phase1.md`)
- Bug reports (`.testing/bugs-listening/`)
- Certification decision (PASS/FAIL)

---

## 📝 Appendix

### Database Schema (Preview)

```sql
-- Listening exercises
CREATE TABLE listening_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  difficulty INT CHECK (difficulty BETWEEN 1 AND 10),
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL,
  translation TEXT,
  duration_seconds INT NOT NULL,
  exercise_type TEXT NOT NULL, -- dictation, multiple_choice, audio_image, fill_blank
  exercise_data JSONB, -- type-specific data (options, images, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress
CREATE TABLE user_listening_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES listening_exercises(id),
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  difficulty_rating INT DEFAULT 5, -- SRS difficulty (1-10)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listening attempts (detailed logs)
CREATE TABLE listening_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES listening_exercises(id),
  user_answer JSONB NOT NULL, -- type-specific answer
  correct BOOLEAN NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  accuracy_score DECIMAL(5,2), -- 0-100
  quality_rating INT CHECK (quality_rating BETWEEN 0 AND 5), -- SM-2 quality
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercises_difficulty ON listening_exercises(difficulty);
CREATE INDEX idx_user_progress_user ON user_listening_progress(user_id);
CREATE INDEX idx_user_progress_next_review ON user_listening_progress(next_review_at);
CREATE INDEX idx_attempts_user ON listening_attempts(user_id);
CREATE INDEX idx_attempts_exercise ON listening_attempts(exercise_id);
```

### API Endpoints (Preview)

**GET /api/listening/exercises**
```typescript
// Query params: ?difficulty=3&limit=10
// Response:
{
  exercises: [
    {
      id: "uuid",
      title: "Basic Greeting",
      difficulty: 3,
      audio_url: "https://r2.dmf.com/audio/ex-001.mp3",
      duration_seconds: 8,
      exercise_type: "dictation",
      exercise_data: null
    }
  ]
}
```

**POST /api/listening/submit**
```typescript
// Request:
{
  exercise_id: "uuid",
  user_answer: { text: "Hello, how are you?" }, // type-specific
  time_spent_seconds: 15
}

// Response:
{
  correct: true,
  accuracy_score: 100,
  feedback: "Perfect! You got it right on the first try!",
  xp_earned: 10,
  next_exercise_id: "uuid"
}
```

---

**Document Version:** 1.0  
**Status:** Ready for Development  
**Prepared by:** PM Agent (Subagent)  
**Date:** 2026-02-06  
**Next Steps:** Create task files for each team member
