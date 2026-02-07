# 🎨 DMF Vocabulary Phase 1 - Visual Component Map

## 📱 User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       DASHBOARD                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           StreakWidget (NEW!)                         │  │
│  │  🔥 15 ngày  │  Dài nhất: 20  │  Progress: ▓▓▓░░ 60% │  │
│  │  Milestones: 🔥 💪 🔒 🔒                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           ReviewQueue Widget                          │  │
│  │  📚 Ôn tập hôm nay: 12 từ                            │  │
│  │  Preview: [Hallo] [Danke] [Bitte]...                 │  │
│  │  [Bắt đầu ôn tập] ────────────────────────────────►  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 /vocabulary/review                           │
│  Progress: [▓▓▓▓▓▓░░░░] 6/12 (50%)                          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Flashcard                            │  │
│  │                                                       │  │
│  │         Level: A1  │  Noun                           │  │
│  │                                                       │  │
│  │              🇩🇪 Hallo                                │  │
│  │                                                       │  │
│  │         [🔊 Phát âm]  ◄─── Audio Integration        │  │
│  │                                                       │  │
│  │  💡 Click hoặc nhấn Space để xem nghĩa              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [After flip...]                                             │
│                                                              │
│  Rating Buttons (appear when flipped):                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │1 Quên│ │2 Khó │ │3 Tốt │ │4 Dễ  │ ◄─── Keyboard: 1-4   │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│                                                              │
│  Lật thẻ để đánh giá độ khó                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            /vocabulary/review/complete                       │
│                                                              │
│                    ✅ Hoàn thành!                           │
│              🎉 Bạn đã ôn xong 12 từ!                       │
│                                                              │
│         [Về Dashboard]    [Xem từ cần ôn]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

```
📦 apps/web-learner/src/
│
├── 📂 app/
│   ├── [locale]/dashboard/page.tsx
│   │   └── Uses: <StreakWidget />
│   │
│   └── vocabulary/review/
│       ├── page.tsx
│       │   └── Uses: <ReviewSession />
│       │            └── Wrapped in <ErrorBoundary />
│       │
│       └── complete/page.tsx
│           └── Completion screen
│
├── 📂 components/
│   ├── vocabulary/
│   │   ├── Flashcard.tsx ──────┐
│   │   ├── FlashcardFront.tsx  │ PRE-DONE
│   │   ├── FlashcardBack.tsx   │ (Session 1)
│   │   ├── WordMeter.tsx ──────┘
│   │   │
│   │   ├── ReviewQueue.tsx ────┐
│   │   └── ReviewSession.tsx   │ NEW
│   │                            │ (Session 2)
│   ├── gamification/           │
│   │   └── StreakWidget.tsx ───┤
│   │                            │
│   ├── ErrorBoundary.tsx ───────┤
│   └── LoadingStates.tsx ───────┘
│
└── 📂 hooks/
    ├── useReviewQueue.ts ──────┐
    ├── useStreak.ts            │ NEW
    └── useAudio.ts ────────────┘ (Session 2)
```

---

## 🎨 UI Components Built

### 1. StreakWidget
```
┌─────────────────────────────────────────────┐
│ 🔥 15 ngày  Streak hiện tại   Dài nhất: 20 │
│ Progress: ▓▓▓▓░░░░░░ → 30 ngày (next goal) │
│                                             │
│ Milestones:                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │🔥 7  │ │💪 30 │ │🔒 100│ │🔒 365│       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│ 💡 15 ngày nữa để đạt mốc 30 ngày! 🎯     │
└─────────────────────────────────────────────┘
```

### 2. ReviewQueue
```
┌─────────────────────────────────────────────┐
│ 📚 Ôn tập hôm nay                           │
│ 12 từ cần ôn tập                            │
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Hallo    │ │ Danke    │ │ Bitte    │    │
│ │ Xin chào │ │ Cảm ơn   │ │ Làm ơn   │    │
│ └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│ ...và 9 từ khác                             │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │     Bắt đầu ôn tập                      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 3. Flashcard with Audio
```
┌─────────────────────────────────────────────┐
│  [A1] [Noun]                                │
│                                             │
│         🇩🇪 Hallo                           │
│                                             │
│     [🔊 Phát âm] ◄── Click to play         │
│                     (API or TTS fallback)   │
│                                             │
│  💡 Click hoặc nhấn Space để xem nghĩa     │
└─────────────────────────────────────────────┘
         │ (after flip)
         ▼
┌─────────────────────────────────────────────┐
│                                             │
│         🇻🇳 Xin chào                        │
│                                             │
│  "Hallo, wie geht es dir?"                  │
│  Xin chào, bạn khỏe không?                  │
│                                             │
│  Click để trở về                            │
└─────────────────────────────────────────────┘
```

### 4. Rating Buttons
```
┌──────────────────────────────────────────────┐
│ [1 Quên]  [2 Khó]  [3 Tốt]  [4 Dễ]         │
│  (Red)    (Orange) (Green)  (Blue)          │
│                                             │
│ Keyboard shortcuts: Press 1, 2, 3, or 4    │
└──────────────────────────────────────────────┘
```

---

## 🎬 Animations

### Flame Animation (Streak Widget)
```
🔥  →  🔥  →  🔥  →  🔥
    ↗      ↘      ↗
   Scale + Rotate animation
   (only when active today)
```

### Flashcard Flip
```
Front                Flipping               Back
┌────┐              ┌──┐                  ┌────┐
│ DE │   →   →   →  │  │   →   →   →     │ VN │
└────┘              └──┘                  └────┘
         rotateY: 0° → 90° → 180°
         (framer-motion, 0.6s ease)
```

### Progress Bar
```
Empty:  [░░░░░░░░░░] 0%
→ →     [▓▓░░░░░░░░] 20%
→ →     [▓▓▓▓░░░░░░] 40%
→ →     [▓▓▓▓▓▓░░░░] 60%
→ →     [▓▓▓▓▓▓▓▓░░] 80%
Full:   [▓▓▓▓▓▓▓▓▓▓] 100%
        (animated transition, 0.8s)
```

---

## 🔌 API Integrations

```
Frontend                          Backend

useReviewQueue ─────────────────► GET /api/review/queue
    │                                  │
    └─ Returns: ReviewWord[]          │
                                       │
ReviewSession ──────────────────────► POST /api/review/submit
    │                                  │
    └─ Sends: { wordId, quality }     │
                                       │
useStreak ───────────────────────────► GET /api/user/streak
    │                                  │
    └─ Returns: StreakData            │
                                       │
useAudio ────────────────────────────► GET /api/audio/:wordId
    │                                  │
    ├─ Success: Play audio blob       │
    └─ Fallback: Web Speech API (TTS) │
```

---

## 🧪 Loading States

### Skeleton Loaders
```
SkeletonCard:
┌─────────────────────────────┐
│ ░░░░░░░░░░░                 │ (animated pulse)
│ ░░░░░░░                     │
│ ░░░░░░░░░░░░                │
└─────────────────────────────┘

SkeletonFlashcard:
┌─────────────────────────────┐
│ ░░ ░░░                      │ (badges)
│                             │
│     ░░░░░░░░                │ (word)
│                             │
│   ░░░░░░░                   │ (button)
└─────────────────────────────┘

SkeletonStreakWidget:
┌─────────────────────────────┐
│ ⚪ ░░░░░░░░   ░░            │
│                             │
│ ░░ ░░ ░░ ░░                │ (milestones)
└─────────────────────────────┘
```

---

## 🛡️ Error Handling

```
ErrorBoundary catches errors:

┌─────────────────────────────────────┐
│  ⚠️  Đã xảy ra lỗi                  │
│                                     │
│  Xin lỗi, có gì đó không đúng.     │
│  Vui lòng thử lại.                  │
│                                     │
│  📋 Chi tiết lỗi (expandable)      │
│                                     │
│  [Thử lại]  [Về trang chủ]         │
└─────────────────────────────────────┘
```

---

## 📊 Component Stats

| Component | Lines | Features |
|-----------|-------|----------|
| StreakWidget | 143 | Flame animation, milestones, progress |
| ReviewSession | 165 | Flashcard, rating, keyboard nav |
| ReviewQueue | 85 | Word preview, loading/error states |
| LoadingStates | 183 | 8 reusable loading components |
| ErrorBoundary | 89 | Error catching, retry logic |
| useAudio | 78 | API + TTS fallback |
| useStreak | 26 | React Query integration |
| useReviewQueue | 31 | React Query integration |

**Total:** ~800 lines of production-ready TypeScript/React code!

---

✅ **ALL COMPONENTS READY FOR TESTING!**
