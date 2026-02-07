# DATABASE SPECIALIST TASKS - Vocabulary Phase 1

**Owner:** Database Specialist Agent  
**Duration:** 6 hours total  
**Priority:** P0 (BLOCKING)  
**Tech Lead:** Tech Lead Agent

---

## YOUR TASKS

### **Task 1.1: SRS Algorithm Database Schema**
**Effort:** 4 hours  
**Dependencies:** None  
**Status:** 🟡 READY TO START

#### **Your Mission:**
Create `user_word_progress` table with SM-2 algorithm fields.

#### **Deliverables:**

**1. Update Prisma Schema:**
File: `services/learning-service/prisma/schema.prisma`

Add this model:

```prisma
model UserWordProgress {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  wordId          String   @map("word_id")
  
  // SM-2 Algorithm Fields
  easeFactor      Float    @default(2.5) @map("ease_factor")
  intervalDays    Int      @default(1)   @map("interval_days")
  repetitions     Int      @default(0)
  nextReview      DateTime @map("next_review")
  
  // Status Tracking
  status          ReviewStatus @default(NEW)
  lastResult      Boolean?  @map("last_result")
  
  // Statistics
  totalReviews    Int      @default(0) @map("total_reviews")
  correctReviews  Int      @default(0) @map("correct_reviews")
  
  // Timestamps
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt      @map("updated_at")
  
  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  word            VocabularyItem   @relation(fields: [wordId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@unique([userId, wordId], name: "user_word_unique")
  @@index([userId, nextReview], name: "user_next_review_idx")
  @@index([userId, status], name: "user_status_idx")
  @@index([wordId], name: "word_idx")
  @@map("user_word_progress")
}

enum ReviewStatus {
  NEW
  LEARNING
  REVIEW
  MASTERED
}
```

**2. Create Migration:**

```bash
cd services/learning-service
pnpm prisma migrate dev --name add_user_word_progress
```

**3. Test Migration:**
- [x] Run migration on local DB
- [x] Verify all indexes created: `\d+ user_word_progress` in psql
- [x] Test foreign key constraints (try deleting user)
- [x] Test unique constraint (try duplicate insert)

**Acceptance Criteria:**
- [x] Migration file created
- [x] All 4 indexes present
- [x] Cascade delete works
- [x] Migration time <5 seconds

---

### **Task 2.1: Daily Streaks Database Schema**
**Effort:** 2 hours  
**Dependencies:** None (parallel with 1.1)  
**Status:** 🟡 READY TO START

#### **Your Mission:**
Add streak tracking fields to `User` model.

#### **Deliverables:**

**1. Update User Model:**
File: `services/learning-service/prisma/schema.prisma`

Add these fields to existing `User` model:

```prisma
model User {
  // ... existing fields
  
  // Streak tracking
  currentStreak    Int       @default(0) @map("current_streak")
  longestStreak    Int       @default(0) @map("longest_streak")
  lastActivityDate DateTime? @map("last_activity_date")
  timezone         String    @default("UTC") // IANA timezone
  
  // ... existing relations
}
```

**2. Create Migration:**

```bash
pnpm prisma migrate dev --name add_user_streaks
```

**3. Update Seed Data:**
File: `services/learning-service/prisma/seed.ts`

Add sample streak data:

```typescript
await prisma.user.update({
  where: { email: 'test@example.com' },
  data: {
    currentStreak: 5,
    longestStreak: 15,
    lastActivityDate: new Date(),
    timezone: 'Asia/Ho_Chi_Minh'
  }
})
```

**Acceptance Criteria:**
- [x] 4 new fields added to User
- [x] Migration successful
- [x] Seed script updated
- [x] Default values work

---

## 📝 SUBMISSION CHECKLIST

Before marking complete, verify:

- [ ] All migrations run successfully locally
- [ ] No Prisma errors (`pnpm prisma validate`)
- [ ] Seed script works (`pnpm prisma db seed`)
- [ ] No lint errors (`pnpm lint`)
- [ ] Migration files committed to git

**Report back when done:**
```
✅ Database tasks complete!

Task 1.1: user_word_progress table created
- Migration: 20260206_add_user_word_progress
- Indexes: 4 (verified)
- Test: Passed

Task 2.1: User streak fields added
- Migration: 20260206_add_user_streaks
- Seed: Updated
- Test: Passed

Ready for backend developer!
```

---

**READ THESE RULES:**
- `.claude/rules/database-prisma.md`
- `.execution/TECHNICAL_REVIEW_vocabulary_phase1.md`

**START NOW!** You're blocking backend developer.
