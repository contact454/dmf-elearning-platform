# DMF E-Learning Platform - Development Plan
**Created:** 2026-02-06 09:22 GMT+7  
**Status:** Ready for Execution  
**Budget:** $200/5h quota (~$40/h)

---

## 📊 Current Status Assessment

### ✅ Completed (100%)
- **6 Learning Modules:** Vocabulary, Reading, Listening, Speaking, Writing, Hub
- **Frontend-Backend Integration:** React Query hooks (50+), UserProvider, QueryProvider
- **UI/UX Enhancement:** Dark mode, Micro-interactions, Responsive, Animations
- **Backend APIs:** All endpoints working (200 OK)
- **Content:** 50 vocab, 5 reading, 5 listening, 5 speaking, 5 writing

### 📈 Technical Metrics
- **Frontend Files:** 140 TypeScript/TSX files
- **Git Commits (Feb 2026):** 10 major features
- **Latest:** `315a033 feat(integration): React Query + UserProvider`
- **Test Coverage:** Manual testing ✅ (Backend + Frontend endpoints)

---

## 🎯 Development Phases (Priority Order)

### **PHASE 1: Content Expansion** 🚀 (High ROI, $60-80 budget)
**Duration:** 3-4 hours | **Priority:** CRITICAL  
**Rationale:** More content = more value, scales user engagement

#### Tasks:
1. **Vocabulary Expansion** ($20-25)
   - Scrape 500+ German words (A1-B2) from Deutsche Welle, Goethe Institut
   - Use Apify MCP + AI categorization
   - Generate example sentences with Sonnet
   - **Model:** Sonnet (bulk processing)
   - **Output:** 500 words with sentences, topics, difficulty levels

2. **Reading Content Generation** ($25-30)
   - AI-generate 20 graded reading passages (A1-B2)
   - Use sequential-thinking MCP for i+1 difficulty calibration
   - Generate comprehension questions
   - **Model:** Opus 4.5 (complex reasoning for difficulty grading)
   - **Output:** 20 passages, 5 per level (A1, A2, B1, B2)

3. **Audio Content (TTS)** ($10-15)
   - Generate audio for all vocabulary + reading passages
   - Use ElevenLabs API or Google TTS
   - Annotate with phonetic transcriptions
   - **Model:** Sonnet (script generation)
   - **Output:** 520+ audio files

4. **Speaking Prompts** ($5-10)
   - Generate 30 conversation scenarios
   - Rubrics for pronunciation scoring
   - **Model:** Sonnet
   - **Output:** 30 speaking exercises

---

### **PHASE 2: User Authentication & Persistence** 💾 ($40-50 budget)
**Duration:** 2-3 hours | **Priority:** HIGH  
**Rationale:** User data persistence enables retention & gamification

#### Tasks:
1. **Supabase Auth Integration** ($15-20)
   - Email/password + OAuth (Google, GitHub)
   - Protected routes, session management
   - **Model:** Opus 4.5 (security-critical)
   - **Output:** Full auth flow

2. **User Profile System** ($10-15)
   - Profile creation, edit, avatar upload
   - Learning preferences (topics, difficulty)
   - **Model:** Sonnet
   - **Output:** Profile CRUD

3. **Progress Persistence** ($15-20)
   - Save SRS reviews, reading history, scores
   - Sync progress across devices
   - **Model:** Opus 4.5 (database schema design)
   - **Output:** Supabase tables + APIs

---

### **PHASE 3: Gamification System** 🎮 ($40-50 budget)
**Duration:** 2-3 hours | **Priority:** MEDIUM  
**Rationale:** Increases user engagement, retention, virality

#### Tasks:
1. **XP & Leveling** ($10-15)
   - XP formula: vocab reviews, reading completion, streaks
   - Level progression (1-50)
   - **Model:** Sonnet
   - **Output:** XP system, level-up animations

2. **Achievement Badges** ($10-15)
   - 30 badges: "First Word", "7-Day Streak", "B1 Master"
   - Badge unlock logic
   - **Model:** Sonnet
   - **Output:** Badge system + UI

3. **Leaderboards** ($10-15)
   - Global + friends leaderboards
   - Weekly/monthly resets
   - **Model:** Sonnet
   - **Output:** Leaderboard API + UI

4. **Daily Goals & Streaks** ($10-15)
   - Customizable daily goals (e.g., "10 vocab reviews")
   - Streak tracking, freeze mechanics
   - **Model:** Sonnet
   - **Output:** Goals system

---

### **PHASE 4: UI/UX Polish** ✨ ($30-40 budget)
**Duration:** 1.5-2 hours | **Priority:** LOW  
**Rationale:** Nice-to-have, improves polish but not core value

#### Tasks:
1. **Figma Design Import** ($10-15)
   - Use Figma MCP to read design specs
   - Implement pixel-perfect components
   - **Model:** Sonnet
   - **Output:** UI matching Figma

2. **Advanced Animations** ($10-15)
   - Page transitions, loading skeletons
   - Confetti on achievements
   - **Model:** Sonnet
   - **Output:** Framer Motion animations

3. **Mobile Optimization** ($10-15)
   - PWA setup, offline mode
   - Touch gestures for flashcards
   - **Model:** Sonnet
   - **Output:** Mobile-first experience

---

## 💰 Budget Allocation Strategy ($200/5h)

### Model Selection:
- **Sonnet 4:** Bulk work, UI, simple logic (80% tasks) — $3 input, $15 output
- **Opus 4.5:** Architecture, security, complex reasoning (20% tasks) — $15 input, $75 output

### Parallel Execution:
- **Max concurrent:** 4 Claude processes
- **Time window:** 5 hours
- **Auto-monitor:** Prevent stuck prompts (SIGKILL prevention)

### Cost Calculation (Estimated):
| Phase | Model Split | Est. Tokens | Cost | Time |
|-------|-------------|-------------|------|------|
| Phase 1 (Content) | 70% Sonnet, 30% Opus | 8M in, 4M out | $60-80 | 3-4h |
| Phase 2 (Auth) | 60% Opus, 40% Sonnet | 5M in, 2M out | $40-50 | 2-3h |
| Phase 3 (Gamify) | 90% Sonnet, 10% Opus | 6M in, 3M out | $40-50 | 2-3h |
| Phase 4 (UI) | 95% Sonnet, 5% Opus | 4M in, 2M out | $30-40 | 1.5-2h |
| **TOTAL** | | **23M in, 11M out** | **$170-220** | **9-12h** |

### ⚠️ Risk Mitigation:
- **Cooldown handling:** Rotate between models if quota hit
- **Checkpoint commits:** Git commit after each task
- **Manual testing:** Quick smoke tests between phases

---

## 🚀 Execution Plan (5-Hour Window)

### **Session 1: Content Expansion Sprint** (3-4h, ~$70)
```bash
# Parallel execution (4 concurrent)
1. Terminal 1: Vocabulary scraping + AI enrichment (Sonnet)
2. Terminal 2: Reading generation (Opus 4.5)
3. Terminal 3: TTS audio generation (Sonnet)
4. Terminal 4: Speaking prompts (Sonnet)
```

**Monitoring:**
- Auto-monitor script running
- Wake notifications on completion
- Git commit checkpoints

**Deliverable:**
- 500 vocab words
- 20 reading passages
- 520+ audio files
- 30 speaking prompts

---

### **Session 2: Auth + Gamification** (2-3h, ~$90)
```bash
# Sequential execution (complex dependencies)
1. Supabase schema design (Opus 4.5)
2. Auth flow implementation (Opus 4.5)
3. Progress persistence (Sonnet)
4. XP system + badges (Sonnet)
5. Leaderboards (Sonnet)
```

**Deliverable:**
- Working auth system
- User profiles
- XP, badges, leaderboards functional

---

## 📋 Next Steps (Immediate Action)

1. **Anh confirm priority phases** (1+2? or 1+3?)
2. **Em sẽ:**
   - Tạo branches cho từng phase
   - Setup parallel Claude sessions
   - Start monitoring scripts
   - Execute theo plan

3. **Expected Output (5h):**
   - Phase 1 complete: 500+ vocab, 20 readings, 520 audios
   - Phase 2 50% complete: Auth working, profiles setup
   - Git commits: 10-15 new commits
   - **Total spend:** ~$150-170 (within budget)

---

## 🎯 Success Metrics

- [ ] Vocabulary database: 50 → 550 words
- [ ] Reading content: 5 → 25 passages
- [ ] Audio files: 0 → 520+ files
- [ ] User authentication: ✅ Working
- [ ] Progress persistence: ✅ Saved to DB
- [ ] Gamification: XP, badges, leaderboards live
- [ ] Git history: 10-15 clean commits
- [ ] Budget: ≤ $200 in 5h window

---

**Ready to execute. Awaiting confirmation từ anh! 🦊**
