# DMF VOCABULARY MODULE - ACTION PLAN

**Date:** 2026-02-06  
**Status:** Phase 1 - Quick Wins  
**Based on:** MASTER-PLAN.md Section 2.1 + Phase 1 Roadmap

---

## 🎯 **PHASE 1: QUICK WINS (3 Features - 2 Weeks)**

### **Feature 1: SRS Algorithm Implementation** ⚡

**Mô tả (Description):**  
Triển khai thuật toán SM-2 để lên lịch ôn tập từ vựng tự động dựa trên hiệu suất học tập.

**Business Value:**  
- Tăng retention rate từ 40% lên 70% (research từ Anki)
- Giảm time-to-mastery 30%
- Core differentiator so với competitors

**Technical Scope:**
- Backend API endpoints cho SRS scheduling
- Database schema cho `user_word_progress` với SM-2 fields
- Frontend review queue UI component
- Algorithm implementation theo SM-2 standard

**Success Criteria:**
- [ ] User có thể thấy "Due for Review" queue
- [ ] Mỗi review update interval/ease_factor đúng
- [ ] Next review date được tính toán chính xác
- [ ] Test coverage ≥85%

**Effort:** 5 days (40 hours)  
**Priority:** P0 (Must Have)

---

### **Feature 2: Daily Streaks Tracking** 🔥

**Mô tả:**  
Theo dõi chuỗi ngày học liên tiếp của user, gamification element để tăng engagement.

**Business Value:**
- Tăng DAU (Daily Active Users) 40% (Duolingo case study)
- Habit formation - học đều đặn hơn
- Social proof - chia sẻ streaks

**Technical Scope:**
- Backend service tracking user activity daily
- Database fields: `current_streak`, `longest_streak`, `last_activity_date`
- Frontend streak display component (flame icon + number)
- Push notification (optional) "Don't break your streak!"

**Success Criteria:**
- [ ] Streak counter hiển thị chính xác
- [ ] Reset về 0 nếu bỏ lỡ 1 ngày
- [ ] Achievements unlock ở milestones (7, 30, 100 days)
- [ ] Test coverage ≥80%

**Effort:** 2 days (16 hours)  
**Priority:** P1 (Should Have)

---

### **Feature 3: Flashcard UI Components** 🎴

**Mô tả:**  
Enhanced flashcard giao diện với flip animation, word meter, audio button.

**Business Value:**
- Better UX → tăng session duration
- Visual appeal → tăng conversion rate
- Industry standard (Quizlet, Anki pattern)

**Technical Scope:**
- React components: `<FlashcardFront>`, `<FlashcardBack>`, `<WordMeter>`
- Flip animation CSS/Framer Motion
- Audio player integration (TTS API)
- Responsive design (mobile-first)

**Success Criteria:**
- [ ] Flip animation mượt mà (60fps)
- [ ] Word Meter hiển thị 5 stages (New → Mastered)
- [ ] Audio button phát âm chuẩn (Google TTS)
- [ ] Works trên mobile + desktop

**Effort:** 3 days (24 hours)  
**Priority:** P0 (Must Have)

---

## 📊 **TIMELINE SUMMARY**

| Week | Features | Deliverables |
|------|----------|--------------|
| **Week 1** | SRS Algorithm + Flashcard UI | Backend API + Frontend components |
| **Week 2** | Daily Streaks + Integration | Full feature integration + QA |

**Total Effort:** 10 days (80 hours)  
**Team:** 3 developers (Backend, Frontend, DB Specialist)  
**Buffer:** 2 days for bugs/blockers

---

## 🔧 **TECHNICAL DEPENDENCIES**

### **External APIs:**
- ✅ Claude API (already integrated)
- 📋 Google Cloud Text-to-Speech (need API key)
- 📋 Push notification service (optional - Firebase)

### **Database Migrations:**
- ✅ `vocabulary_items` table exists (10,004 words)
- 📋 Need to create: `user_word_progress` table
- 📋 Need to add: `users.current_streak`, `users.longest_streak`, `users.last_activity_date`

### **Frontend Libraries:**
- ✅ Next.js 14 + React Query
- ✅ TailwindCSS + shadcn/ui
- 📋 Need: Framer Motion (for animations)
- 📋 Need: Howler.js (for audio playback)

---

## 🚀 **PHASE 2 PREVIEW (Not in Scope Now)**

*Sau khi Phase 1 hoàn thành:*

- Family Words linking
- Spelling Test mode
- Advanced statistics dashboard
- Social features (share progress)

---

## 📝 **NOTES FOR IMPLEMENTATION**

### **SM-2 Algorithm Reference:**

```javascript
// Quality: 0-5 (user feedback)
// 0-2: Again (fail)
// 3: Hard
// 4: Good  
// 5: Easy

function calculateNextReview(quality, currentInterval, easeFactor, repetitions) {
  if (quality < 3) {
    // Reset on failure
    return { interval: 1, easeFactor, repetitions: 0 };
  }
  
  // Update ease factor
  const newEF = Math.max(1.3, 
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate new interval
  let newInterval;
  if (repetitions === 0) {
    newInterval = 1; // 1 day
  } else if (repetitions === 1) {
    newInterval = 6; // 6 days
  } else {
    newInterval = Math.round(currentInterval * newEF);
  }
  
  return {
    interval: newInterval,
    easeFactor: newEF,
    repetitions: repetitions + 1,
    nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
  };
}
```

### **Streak Logic:**

```javascript
function updateStreak(user) {
  const today = new Date().setHours(0,0,0,0);
  const lastActivity = new Date(user.last_activity_date).setHours(0,0,0,0);
  const daysDiff = (today - lastActivity) / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) {
    // Same day - no change
    return user.current_streak;
  } else if (daysDiff === 1) {
    // Next day - increment
    return user.current_streak + 1;
  } else {
    // Missed days - reset
    return 1;
  }
}
```

---

**Approved by:** Fuchs PM Agent  
**Next Step:** Create EXECUTION_PLAN_vocabulary_phase1.md
