# PLAN ÁP DỤNG RESEARCH VÀO DMF E-LEARNING

*Dựa trên nghiên cứu AI Research Team - 6/2/2026*

---

## 🎯 BỐI CẢNH (CONTEXT)

### DMF đã có gì:
- ✅ **87,284 German vocabulary words** (từ vựng tiếng Đức) imported vào PostgreSQL
- ✅ **Next.js 14 + React 18** frontend
- ✅ **Express.js + Prisma** backend  
- ✅ **React Query hooks** cho 50+ endpoints
- ✅ **6 modules** hoàn thành (Vocabulary, Reading, Listening, Speaking, Writing, Hub)

### Research phát hiện gì:
- 📊 **Market (Thị trường):** 10 platforms analyzed (Duolingo 500M users dẫn đầu)
- 🎨 **UX patterns (Mẫu trải nghiệm):** Streaks drive 30%+ retention (chuỗi tăng giữ chân 30%+)
- 💻 **Tech stacks (Công nghệ):** React + TypeScript + PostgreSQL = industry standard (tiêu chuẩn ngành)
- 🚀 **Roadmap (Lộ trình):** 3 phases, 36 weeks, $430K total

---

## ✅ GIAI ĐOẠN 1: QUICK WINS (THẮNG NHANH) - 1-2 TUẦN

*Những gì có thể làm NGAY với codebase (mã nguồn) hiện tại*

### 1.1 Thêm Spaced Repetition Algorithm (Thuật toán Lặp Lại Cách Quãng)

**Vấn đề (Problem):**
DMF đã có 87K words (từ) nhưng chưa có system (hệ thống) giúp user nhớ lâu.

**Giải pháp (Solution):**
Implement (Triển khai) **SM-2 algorithm** (thuật toán SM-2) - đơn giản, proven (đã chứng minh).

**Cách làm:**

```typescript
// File: services/learning-service/src/algorithms/srs.ts

interface ReviewResult {
  vocabularyId: string
  quality: number // 0-5 (0 = quên hoàn toàn, 5 = nhớ rõ)
}

interface CardSchedule {
  nextReviewDate: Date      // Ngày ôn tập tiếp theo
  interval: number           // Khoảng thời gian (days - ngày)
  easeFactor: number        // Hệ số dễ (2.5 mặc định)
  repetitions: number       // Số lần lặp
}

function calculateNextReview(
  currentSchedule: CardSchedule,
  quality: number  // 0-5 rating từ user
): CardSchedule {
  // SM-2 algorithm logic
  // Quality >= 3: correct (đúng)
  // Quality < 3: forgot (quên) → reset interval
  
  let { interval, easeFactor, repetitions } = currentSchedule
  
  // Điều chỉnh ease factor (hệ số dễ)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3
  
  // Tính interval tiếp theo
  if (quality < 3) {
    // Forgot (Quên) - reset
    interval = 1
    repetitions = 0
  } else {
    // Remember (Nhớ) - tăng interval
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions++
  }
  
  return {
    nextReviewDate: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
    interval,
    easeFactor,
    repetitions
  }
}
```

**Database changes (Thay đổi database):**

```prisma
// File: prisma/schema.prisma

model UserVocabularyProgress {
  id              String   @id @default(cuid())
  userId          String
  vocabularyId    String
  
  // SRS fields (Trường SRS)
  nextReviewDate  DateTime @default(now())
  interval        Int      @default(1)        // days (ngày)
  easeFactor      Float    @default(2.5)      // 1.3-2.5
  repetitions     Int      @default(0)
  
  // Stats (Thống kê)
  totalReviews    Int      @default(0)
  correctCount    Int      @default(0)
  lastReviewDate  DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User         @relation(fields: [userId], references: [id])
  vocabulary      Vocabulary   @relation(fields: [vocabularyId], references: [id])
  
  @@unique([userId, vocabularyId])
  @@index([userId, nextReviewDate])  // Query reviews due (Truy vấn ôn tập đến hạn)
}
```

**API endpoint:**

```typescript
// File: services/learning-service/src/api/vocabulary/review.ts

// POST /api/vocabulary/review
export async function submitReview(req, res) {
  const { vocabularyId, quality } = req.body  // quality: 0-5
  const userId = req.user.id
  
  // 1. Lấy progress hiện tại
  const progress = await prisma.userVocabularyProgress.findUnique({
    where: { userId_vocabularyId: { userId, vocabularyId } }
  })
  
  // 2. Tính next review (ôn tập tiếp theo)
  const nextSchedule = calculateNextReview(progress, quality)
  
  // 3. Update database
  await prisma.userVocabularyProgress.update({
    where: { id: progress.id },
    data: {
      nextReviewDate: nextSchedule.nextReviewDate,
      interval: nextSchedule.interval,
      easeFactor: nextSchedule.easeFactor,
      repetitions: nextSchedule.repetitions,
      totalReviews: progress.totalReviews + 1,
      correctCount: quality >= 3 ? progress.correctCount + 1 : progress.correctCount,
      lastReviewDate: new Date()
    }
  })
  
  res.json({
    success: true,
    nextReview: nextSchedule.nextReviewDate,
    message: quality >= 3 ? 'Correct! (Đúng!)' : 'Review again tomorrow (Ôn lại ngày mai)'
  })
}

// GET /api/vocabulary/due - Lấy cards cần ôn hôm nay
export async function getDueCards(req, res) {
  const userId = req.user.id
  
  const dueCards = await prisma.userVocabularyProgress.findMany({
    where: {
      userId,
      nextReviewDate: { lte: new Date() }  // <= today (hôm nay)
    },
    include: {
      vocabulary: true  // Lấy thông tin từ
    },
    orderBy: {
      nextReviewDate: 'asc'  // Ưu tiên cards overdue (quá hạn)
    },
    take: 20  // Limit 20 cards/session
  })
  
  res.json({
    success: true,
    dueCount: dueCards.length,
    cards: dueCards
  })
}
```

**Effort (Nỗ lực):** 2-3 days với Sonnet 4  
**Impact (Tác động):** HIGH - Core feature (tính năng cốt lõi) của mọi vocab app

---

### 1.2 Add Daily Streaks (Thêm Chuỗi Hàng Ngày)

**Research insight (Thông tin nghiên cứu):**
Duolingo: Streaks tăng retention 30%+

**Database schema:**

```prisma
model User {
  // ... existing fields
  
  // Streak fields (Trường chuỗi)
  currentStreak   Int      @default(0)      // Chuỗi hiện tại
  longestStreak   Int      @default(0)      // Chuỗi dài nhất
  lastActiveDate  DateTime?                 // Ngày active cuối
  streakFreezes   Int      @default(0)      // Số lần đóng băng có (earn được)
}
```

**Logic:**

```typescript
// File: services/learning-service/src/services/streakService.ts

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  
  const today = new Date().setHours(0, 0, 0, 0)
  const lastActive = user.lastActiveDate 
    ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0)
    : null
  
  if (!lastActive || lastActive < today - 86400000) {
    // Quá 1 ngày → streak broken (chuỗi bị phá)
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,  // Reset về 1
        lastActiveDate: new Date()
      }
    })
  } else if (lastActive === today - 86400000) {
    // Hôm qua active → tăng streak
    const newStreak = user.currentStreak + 1
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastActiveDate: new Date()
      }
    })
  }
  // else: hôm nay đã active rồi → không làm gì
}

// Call sau mỗi lesson complete (hoàn thành bài học)
```

**UI component (React):**

```tsx
// File: apps/web-learner/src/components/StreakCounter.tsx

export function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg">
      <span className="text-4xl">🔥</span>
      <div>
        <div className="text-2xl font-bold text-orange-600">
          {streak} ngày
        </div>
        <div className="text-sm text-gray-600">
          Chuỗi học liên tục (Current streak)
        </div>
      </div>
    </div>
  )
}
```

**Push notification (Thông báo đẩy):**

```typescript
// Cron job: 23:00 mỗi ngày
// Check users chưa active hôm nay → gửi reminder

import admin from 'firebase-admin'

async function sendStreakReminders() {
  const today = new Date().setHours(0, 0, 0, 0)
  
  // Users có streak > 0 nhưng chưa active hôm nay
  const usersAtRisk = await prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastActiveDate: { lt: new Date(today) }
    }
  })
  
  for (const user of usersAtRisk) {
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: `Đừng mất chuỗi ${user.currentStreak} ngày! 🔥`,
        body: `Học 5 phút để giữ chuỗi của bạn`
      }
    })
  }
}
```

**Effort:** 1 day với Sonnet  
**Impact:** HIGH - Proven retention booster (tăng giữ chân đã chứng minh)

---

### 1.3 Flashcard UI (Giao diện Thẻ Ghi Nhớ)

**Research insight:**
100% platforms dùng flashcard interaction (tương tác thẻ ghi nhớ).

**Component:**

```tsx
// File: apps/web-learner/src/components/VocabularyFlashcard.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'  // Animation (Hoạt ảnh)

interface FlashcardProps {
  word: string          // Từ tiếng Đức
  translation: string   // Nghĩa tiếng Việt
  example: string       // Câu ví dụ
  audioUrl: string      // Link file audio
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void  // Callback đánh giá
}

export function VocabularyFlashcard({
  word, translation, example, audioUrl, onRate
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [audio] = useState(() => new Audio(audioUrl))
  
  const playAudio = () => audio.play()
  
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Flashcard (Thẻ ghi nhớ) */}
      <motion.div
        className="w-full max-w-md aspect-[3/2] bg-white rounded-2xl shadow-lg cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front (Mặt trước) - Word */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${isFlipped ? 'hidden' : ''}`}>
          <h2 className="text-4xl font-bold text-gray-800">
            {word}
          </h2>
          <button 
            onClick={(e) => { e.stopPropagation(); playAudio() }}
            className="mt-4 text-blue-600"
          >
            🔊 Phát âm (Pronunciation)
          </button>
        </div>
        
        {/* Back (Mặt sau) - Translation */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${!isFlipped ? 'hidden' : ''}`}
             style={{ transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-3xl font-bold text-green-600">
            {translation}
          </h3>
          <p className="mt-4 text-gray-600 text-center italic">
            "{example}"
          </p>
        </div>
      </motion.div>
      
      {/* Rating buttons (Nút đánh giá) - Hiện khi đã flip */}
      {isFlipped && (
        <div className="flex gap-3">
          <button 
            onClick={() => onRate(0)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold"
          >
            ❌ Quên hoàn toàn (Again)
          </button>
          <button 
            onClick={() => onRate(3)}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold"
          >
            🤔 Khó (Hard)
          </button>
          <button 
            onClick={() => onRate(4)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold"
          >
            ✅ Được (Good)
          </button>
          <button 
            onClick={() => onRate(5)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold"
          >
            😊 Dễ (Easy)
          </button>
        </div>
      )}
      
      {/* Instructions (Hướng dẫn) */}
      <p className="text-sm text-gray-500">
        {!isFlipped 
          ? "👆 Tap card to see meaning (Chạm thẻ để xem nghĩa)"
          : "📊 Rate how well you remembered (Đánh giá mức độ nhớ)"
        }
      </p>
    </div>
  )
}
```

**Effort:** 1 day  
**Impact:** MEDIUM - Core UX (trải nghiệm cốt lõi)

---

## 🚀 GIAI ĐOẠN 2: MVP FEATURES - 3-4 TUẦN

*Tính năng cần thiết để competitive (cạnh tranh) với Duolingo*

### 2.1 Home Screen với Review Queue (Hàng Đợi Ôn Tập)

**Design (Thiết kế):**

```tsx
// File: apps/web-learner/src/app/(authenticated)/vocabulary/page.tsx

export default async function VocabularyHomePage() {
  const session = await getServerSession()
  
  // Fetch data (Lấy dữ liệu)
  const dueCards = await fetch('/api/vocabulary/due')
  const stats = await fetch('/api/vocabulary/stats')
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Streak display (Hiển thị chuỗi) */}
      <StreakCounter streak={stats.currentStreak} />
      
      {/* Cards due today (Thẻ cần ôn hôm nay) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          📚 Ôn tập hôm nay (Review today)
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-5xl font-bold text-blue-600">
              {dueCards.length}
            </span>
            <span className="text-gray-600 ml-2">thẻ (cards)</span>
          </div>
          <Link 
            href="/vocabulary/review"
            className="px-8 py-4 bg-green-500 text-white rounded-lg text-lg font-semibold hover:bg-green-600"
          >
            Bắt đầu học (Start learning) →
          </Link>
        </div>
      </div>
      
      {/* Progress stats (Thống kê tiến độ) */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          icon="📖"
          label="Từ đã học (Words learned)"
          value={stats.totalWords}
        />
        <StatCard 
          icon="✅"
          label="Độ chính xác (Accuracy)"
          value={`${stats.accuracy}%`}
        />
        <StatCard 
          icon="🔥"
          label="Chuỗi dài nhất (Longest streak)"
          value={`${stats.longestStreak} ngày`}
        />
      </div>
      
      {/* Heatmap calendar (Lịch nhiệt độ) */}
      <ReviewHeatmap data={stats.reviewHistory} />
    </div>
  )
}
```

---

### 2.2 Audio Generation (Tạo Audio)

**Research insight:**
80% platforms có audio → Must-have

**Solution (Giải pháp):**

```typescript
// File: services/learning-service/src/services/audioService.ts

import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const ttsClient = new TextToSpeechClient()

export async function generateAudio(
  text: string, 
  languageCode: string  // 'de-DE' cho tiếng Đức
): Promise<string> {
  
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: 'de-DE-Wavenet-F',  // Female voice (Giọng nữ)
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9,  // Chậm hơn 10% (dễ nghe)
      pitch: 0
    }
  })
  
  // Upload to S3 (Tải lên S3)
  const fileName = `audio/de/${text.toLowerCase()}.mp3`
  await uploadToS3(response.audioContent, fileName)
  
  return `https://cdn.dmf-elearning.com/${fileName}`
}

// Batch generation (Tạo hàng loạt) cho 87K words
export async function generateAllAudio() {
  const words = await prisma.vocabulary.findMany({
    where: { audioUrl: null },  // Chưa có audio
    take: 1000  // Batch 1000/lần
  })
  
  for (const word of words) {
    const audioUrl = await generateAudio(word.word, 'de-DE')
    await prisma.vocabulary.update({
      where: { id: word.id },
      data: { audioUrl }
    })
  }
}
```

**Cost estimate (Ước tính chi phí):**
- Google TTS: $16/million characters (ký tự)
- 87K words × average 8 chars (ký tự TB) = ~700K chars
- **Total: ~$11** (one-time - một lần)

**Effort:** 1 day  
**Impact:** HIGH - Essential feature (tính năng thiết yếu)

---

### 2.3 Mobile Responsive (Tương thích Mobile)

**Research insight:**
90%+ users on mobile → Mobile-first là bắt buộc

**Tailwind classes (Lớp Tailwind):**

```tsx
// Existing code đã OK vì DMF dùng TailwindCSS
// Chỉ cần đảm bảo:

<div className="
  w-full              // Full width mobile
  md:w-1/2            // Half width tablet
  lg:w-1/3            // Third width desktop
  p-4                 // Padding 16px
  md:p-6              // Padding 24px tablet+
">
  {/* Content */}
</div>

// Touch targets (Vùng chạm) >= 44pt
<button className="
  min-h-[44px]        // iOS minimum (Tối thiểu iOS)
  min-w-[44px]
  px-4 py-2
  text-base           // 16px - prevents zoom (ngăn zoom) on iOS
">
```

**Effort:** Already done (Đã làm) - DMF dùng Tailwind responsive  
**Impact:** CRITICAL (Quan trọng tuyệt đối)

---

## 💎 GIAI ĐOẠN 3: COMPETITIVE EDGE - 2-3 THÁNG

*Features làm DMF khác biệt với đối thủ*

### 3.1 AI Conversation Partner (Đối tác Trò chuyện AI)

**Tech stack:**
- OpenAI GPT-4 API
- Google Cloud Speech-to-Text

**Implementation:**

```typescript
// File: services/learning-service/src/services/aiChatService.ts

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function chatWithAI(
  userId: string,
  message: string,
  scenario: 'restaurant' | 'job-interview' | 'travel'
) {
  // Lấy vocabulary user đang học
  const userWords = await getUserVocabulary(userId)
  
  const systemPrompt = `
You are a language learning partner helping user practice German vocabulary.
Current scenario: ${scenario}
User's vocabulary level: ${userWords.map(w => w.word).join(', ')}

Guidelines (Hướng dẫn):
- Use simple sentences (Dùng câu đơn giản)
- Incorporate user's vocabulary words (Kết hợp từ user đang học)
- Be encouraging (Động viên), never judgmental (không phán xét)
- Correct mistakes gently (Sửa lỗi nhẹ nhàng)
- Ask follow-up questions (Hỏi câu tiếp theo)
  `
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 150
  })
  
  return response.choices[0].message.content
}
```

**UI:**

```tsx
// Giao diện chat như Messenger
<div className="flex flex-col h-screen">
  {/* Messages (Tin nhắn) */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map(msg => (
      <div className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
        <div className={`max-w-[70%] rounded-lg p-3 ${
          msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}>
          {msg.content}
        </div>
      </div>
    ))}
  </div>
  
  {/* Input */}
  <div className="border-t p-4 flex gap-2">
    <input 
      type="text"
      placeholder="Type your message (Gõ tin nhắn)..."
      className="flex-1 px-4 py-2 border rounded-lg"
    />
    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg">
      Gửi (Send)
    </button>
  </div>
</div>
```

**Cost:**
- GPT-4 Turbo: $10/million tokens (mã)
- Average conversation: ~500 tokens
- **$0.005/conversation** → cheap! (rẻ!)

**Effort:** 2 weeks với Opus 4.5  
**Impact:** HIGH - Differentiator (yếu tố khác biệt)

---

### 3.2 Community Corrections (Sửa Lỗi Cộng Đồng)

**Inspired by Busuu:**
Users submit sentences → Native speakers correct (Người bản xứ sửa)

**Schema:**

```prisma
model UserSentence {
  id              String   @id @default(cuid())
  userId          String
  sentence        String   // User's sentence (Câu của user)
  targetLanguage  String   // 'de' or 'vi'
  
  corrections     Correction[]
  
  createdAt       DateTime @default(now())
}

model Correction {
  id              String   @id @default(cuid())
  sentenceId      String
  correctorId     String   // Native speaker ID
  
  correctedText   String   // Câu đã sửa
  explanation     String?  // Giải thích (optional - tùy chọn)
  
  upvotes         Int      @default(0)  // Community voting (Bình chọn cộng đồng)
  
  sentence        UserSentence @relation(fields: [sentenceId], references: [id])
  corrector       User         @relation(fields: [correctorId], references: [id])
}
```

**Gamification:**
- Native speakers earn XP for corrections (Người bản xứ kiếm XP khi sửa)
- Best corrections get upvoted (Sửa tốt nhất được vote lên)

**Effort:** 3 weeks  
**Impact:** MEDIUM - Nice differentiator (khác biệt tốt)

---

## 📊 PRIORITIZATION SUMMARY (TÓM TẮT ƯU TIÊN)

### ✅ LÀM NGAY (This Week - Tuần Này):

| Feature | Effort | Impact | Model |
|---------|--------|--------|-------|
| 1. SRS Algorithm (Thuật toán SRS) | 2-3 days | HIGH | Sonnet 4 |
| 2. Daily Streaks (Chuỗi hàng ngày) | 1 day | HIGH | Sonnet 4 |
| 3. Flashcard UI (Giao diện thẻ) | 1 day | HIGH | Sonnet 4 |

**Total:** 4-5 days, ~$30-40

---

### 🚀 LÀM SAU (Next 2-3 Weeks):

| Feature | Effort | Impact | Model |
|---------|--------|--------|-------|
| 4. Home Screen + Stats (Trang chủ + thống kê) | 3 days | MEDIUM | Sonnet 4 |
| 5. Audio Generation (Tạo audio) | 1 day | HIGH | Sonnet 4 |
| 6. Review Heatmap (Lịch nhiệt độ ôn tập) | 2 days | LOW | Sonnet 4 |
| 7. Push Notifications (Thông báo đẩy) | 2 days | MEDIUM | Sonnet 4 |

**Total:** 8 days, ~$50-70

---

### 💎 LÀM SAU CÙng (2-3 Months Later):

| Feature | Effort | Impact | Model |
|---------|--------|--------|-------|
| 8. AI Chat (Trò chuyện AI) | 2 weeks | HIGH | Opus 4.5 |
| 9. Video Lessons (Bài học video) | 3 weeks | MEDIUM | Sonnet + Content team |
| 10. Community Corrections (Sửa cộng đồng) | 3 weeks | MEDIUM | Sonnet 4 |

**Total:** 8 weeks, ~$150-200

---

## 💰 TOTAL INVESTMENT (TỔNG ĐẦU TƯ)

**Phase 1 (Quick Wins - 1 week):** $30-40  
**Phase 2 (MVP - 3 weeks):** $50-70  
**Phase 3 (Competitive - 8 weeks):** $150-200  

**GRAND TOTAL:** **~$230-310** for AI development  
**+ Content costs (Chi phí nội dung):** $100-200 (audio, videos)  
**= $330-510 total**

Rất rẻ so với research estimate $430K vì:
- ✅ DMF đã có infrastructure (hạ tầng)
- ✅ Already have 87K words (đã có 87K từ)
- ✅ Team đã familiar với tech stack (quen với công nghệ)

---

## 📋 CHECKLIST HÀNH ĐỘNG (ACTION CHECKLIST)

### Week 1:
- [ ] Implement SM-2 algorithm (Triển khai thuật toán SM-2)
- [ ] Add UserVocabularyProgress table (Thêm bảng)
- [ ] Create /api/vocabulary/review endpoint
- [ ] Create /api/vocabulary/due endpoint
- [ ] Add streak tracking (Thêm theo dõi chuỗi)
- [ ] Build VocabularyFlashcard component (Xây dựng component)
- [ ] Test with 10 users (Kiểm thử với 10 user)

### Week 2-3:
- [ ] Build home screen (Xây trang chủ)
- [ ] Add statistics dashboard (Thêm bảng thống kê)
- [ ] Generate audio for top 1000 words (Tạo audio cho 1000 từ hàng đầu)
- [ ] Implement review heatmap (Triển khai lịch nhiệt độ)
- [ ] Setup Firebase push notifications (Cài thông báo)
- [ ] Beta test với 50 users

### Month 2-3:
- [ ] Build AI chat feature (Xây tính năng chat AI)
- [ ] Record/license 10 video lessons (Ghi/cấp phép 10 video)
- [ ] Implement community corrections (Triển khai sửa cộng đồng)
- [ ] Full launch 🚀

---

Dạ đó là plan áp dụng research vào DMF ạ anh! Tất cả thuật ngữ em đã dịch rồi. 

Anh muốn em bắt đầu implement feature nào trước không ạ? 🦊
