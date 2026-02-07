# FRONTEND DEVELOPER TASKS - Vocabulary Phase 1

**Owner:** Frontend Developer Agent  
**Duration:** 28 hours total  
**Priority:** P0  
**Tech Lead:** Tech Lead Agent

---

## ⏳ DEPENDENCIES

**Can start immediately:**
- Task 3.1 (Flashcard component - no API dependency)
- Task 3.2 (Word Meter - no API dependency)

**Wait for backend:**
- Task 1.5, 1.6 (need review API)
- Task 2.5, 2.6 (need streak API)
- Task 3.3 (need audio API)
- Task 3.4 (integration - needs everything)

---

## YOUR TASKS

### **Task 3.1: Flashcard Base Component**
**Effort:** 4 hours  
**Dependencies:** None ✅  
**Status:** 🟢 READY TO START

#### **Your Mission:**
Create reusable flashcard component with flip animation.

#### **Deliverables:**

**Files:**
- `apps/web-learner/src/components/vocabulary/Flashcard.tsx`
- `apps/web-learner/src/components/vocabulary/FlashcardFront.tsx`
- `apps/web-learner/src/components/vocabulary/FlashcardBack.tsx`

**Implementation:**

```typescript
// Flashcard.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlashcardFront } from './FlashcardFront'
import { FlashcardBack } from './FlashcardBack'

interface FlashcardProps {
  word: {
    id: string
    word: string
    translation: string
    level: 'A1' | 'A2' | 'B1' | 'B2'
    wordType: string
    exampleSentence?: string
    exampleTranslation?: string
  }
  isFlipped?: boolean
  onFlip?: () => void
}

export function Flashcard({ word, isFlipped = false, onFlip }: FlashcardProps) {
  const [flipped, setFlipped] = useState(isFlipped)
  
  const handleFlip = () => {
    setFlipped(!flipped)
    onFlip?.()
  }
  
  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    }
  }
  
  return (
    <div 
      className="relative w-full max-w-xl h-96 perspective-1000"
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${word.word}. Press space to flip.`}
    >
      <motion.div
        className="w-full h-full"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <FlashcardFront
            word={word.word}
            level={word.level}
            wordType={word.wordType}
            wordId={word.id}
          />
        </div>
        
        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <FlashcardBack
            translation={word.translation}
            exampleSentence={word.exampleSentence}
            exampleTranslation={word.exampleTranslation}
          />
        </div>
      </motion.div>
    </div>
  )
}
```

```typescript
// FlashcardFront.tsx
'use client'

import { Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FlashcardFrontProps {
  word: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  wordType: string
  wordId: string
}

export function FlashcardFront({ word, level, wordType, wordId }: FlashcardFrontProps) {
  // Audio will be integrated in Task 3.3
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't flip card
    console.log('Play audio:', wordId)
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
      {/* Badges */}
      <div className="flex gap-2 mb-8">
        <Badge variant="secondary" className="text-sm">
          {level}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {wordType}
        </Badge>
      </div>
      
      {/* German Word */}
      <h2 className="text-6xl font-bold text-gray-900 mb-8 text-center">
        {word}
      </h2>
      
      {/* Audio Button */}
      <button
        onClick={handleAudioClick}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        aria-label={`Play pronunciation of ${word}`}
      >
        <Volume2 className="w-5 h-5" />
        <span>Phát âm</span>
      </button>
      
      {/* Hint */}
      <p className="mt-8 text-gray-500 text-sm">
        Click hoặc nhấn Space để xem nghĩa
      </p>
    </div>
  )
}
```

```typescript
// FlashcardBack.tsx
export function FlashcardBack({ 
  translation, 
  exampleSentence, 
  exampleTranslation 
}: {
  translation: string
  exampleSentence?: string
  exampleTranslation?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200">
      {/* Vietnamese Translation */}
      <h2 className="text-5xl font-bold text-blue-900 mb-6 text-center">
        {translation}
      </h2>
      
      {/* Example Sentence */}
      {exampleSentence && (
        <div className="mt-8 max-w-md text-center">
          <p className="text-gray-700 italic mb-2">
            "{exampleSentence}"
          </p>
          {exampleTranslation && (
            <p className="text-gray-600 text-sm">
              {exampleTranslation}
            </p>
          )}
        </div>
      )}
      
      <p className="mt-8 text-gray-500 text-sm">
        Click để trở về
      </p>
    </div>
  )
}
```

**Styles (if needed):**
```css
/* Add to global CSS or Tailwind config */
.perspective-1000 {
  perspective: 1000px;
}

.backface-hidden {
  backface-visibility: hidden;
}
```

**Tests:** `apps/web-learner/src/components/vocabulary/__tests__/Flashcard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Flashcard } from '../Flashcard'

describe('Flashcard', () => {
  const mockWord = {
    id: '1',
    word: 'Hallo',
    translation: 'Xin chào',
    level: 'A1' as const,
    wordType: 'Interjection',
    exampleSentence: 'Hallo, wie geht es dir?',
    exampleTranslation: 'Xin chào, bạn khỏe không?'
  }
  
  it('should render front side initially', () => {
    render(<Flashcard word={mockWord} />)
    expect(screen.getByText('Hallo')).toBeInTheDocument()
    expect(screen.queryByText('Xin chào')).not.toBeInTheDocument()
  })
  
  it('should flip on click', () => {
    render(<Flashcard word={mockWord} />)
    
    const card = screen.getByRole('button')
    fireEvent.click(card)
    
    // After flip, should show translation
    expect(screen.getByText('Xin chào')).toBeInTheDocument()
  })
  
  it('should flip on Space key', () => {
    render(<Flashcard word={mockWord} />)
    
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })
    
    expect(screen.getByText('Xin chào')).toBeInTheDocument()
  })
})
```

**Acceptance Criteria:**
- [x] Flashcard flips smoothly (60fps animation)
- [x] Front shows German word + audio button
- [x] Back shows Vietnamese + example
- [x] Keyboard navigation works (Space/Enter)
- [x] Responsive (mobile + desktop)
- [x] Accessible (screen reader, focus visible)
- [x] Tests pass

---

### **Task 3.2: Word Meter Component**
**Effort:** 3 hours  
**Dependencies:** None ✅  
**Status:** 🟢 READY TO START

#### **Your Mission:**
Create visual progress meter for word mastery.

#### **Deliverables:**

**File:** `apps/web-learner/src/components/vocabulary/WordMeter.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'

type Status = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'

interface WordMeterProps {
  status: Status
  accuracy: number // 0-1
  totalReviews?: number
  className?: string
}

const statusConfig = {
  NEW: {
    label: 'Mới',
    color: 'bg-gray-400',
    progress: 0
  },
  LEARNING: {
    label: 'Đang học',
    color: 'bg-yellow-500',
    progress: 25
  },
  REVIEW: {
    label: 'Ôn tập',
    color: 'bg-orange-500',
    progress: 50
  },
  MASTERED: {
    label: 'Thuộc lòng',
    color: 'bg-green-600',
    progress: 100
  }
}

export function WordMeter({ status, accuracy, totalReviews = 0, className }: WordMeterProps) {
  const config = statusConfig[status]
  const accuracyPercent = Math.round(accuracy * 100)
  
  return (
    <div className={cn('w-full', className)}>
      {/* Status Label */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {config.label}
        </span>
        <span className="text-xs text-gray-500">
          {totalReviews} lần ôn • {accuracyPercent}% đúng
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            config.color
          )}
          style={{ width: `${config.progress}%` }}
          role="progressbar"
          aria-valuenow={config.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${config.label}`}
        />
      </div>
      
      {/* Stages */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Mới</span>
        <span>Đang học</span>
        <span>Ôn tập</span>
        <span>Thuộc lòng</span>
      </div>
    </div>
  )
}
```

**Tests:**
```typescript
import { render, screen } from '@testing-library/react'
import { WordMeter } from '../WordMeter'

describe('WordMeter', () => {
  it('should render NEW status', () => {
    render(<WordMeter status="NEW" accuracy={0} />)
    expect(screen.getByText('Mới')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '0%' })
  })
  
  it('should render MASTERED status', () => {
    render(<WordMeter status="MASTERED" accuracy={0.95} totalReviews={20} />)
    expect(screen.getByText('Thuộc lòng')).toBeInTheDocument()
    expect(screen.getByText('20 lần ôn • 95% đúng')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '100%' })
  })
})
```

**Acceptance Criteria:**
- [x] Shows 4 status levels correctly
- [x] Animated progress bar
- [x] Displays accuracy percentage
- [x] Responsive design
- [x] Accessible (aria labels)

---

### **Task 1.5: Review Queue UI**
**Effort:** 5 hours  
**Dependencies:** ⏳ Task 1.4 (API) complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Create review queue component that fetches words due for review.

#### **Deliverables:**

**File:** `apps/web-learner/src/hooks/useReviewQueue.ts`

```typescript
import { useQuery } from '@tanstack/react-query'

interface ReviewWord {
  id: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReview: string
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
  word: {
    id: string
    word: string
    translation: string
    level: 'A1' | 'A2' | 'B1' | 'B2'
    wordType: string
    exampleSentence?: string
    exampleTranslation?: string
    audioUrl?: string
  }
}

export function useReviewQueue() {
  return useQuery({
    queryKey: ['reviewQueue'],
    queryFn: async (): Promise<ReviewWord[]> => {
      const response = await fetch('/api/review/queue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch review queue')
      }
      
      const json = await response.json()
      return json.data.words
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  })
}
```

**File:** `apps/web-learner/src/components/vocabulary/ReviewQueue.tsx`

```typescript
'use client'

import { useReviewQueue } from '@/hooks/useReviewQueue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function ReviewQueue() {
  const { data: words, isLoading, error } = useReviewQueue()
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2">Đang tải...</span>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Không thể tải danh sách ôn tập</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  if (!words || words.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-gray-700 mb-4">Không có từ nào cần ôn hôm nay!</p>
          <p className="text-gray-500 text-sm">Quay lại vào ngày mai nhé.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ôn tập hôm nay</CardTitle>
        <p className="text-gray-600">{words.length} từ cần ôn tập</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Word Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {words.slice(0, 6).map((word) => (
              <div
                key={word.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <p className="font-bold text-lg">{word.word.word}</p>
                <p className="text-gray-600 text-sm">{word.word.translation}</p>
              </div>
            ))}
          </div>
          
          {words.length > 6 && (
            <p className="text-center text-gray-500 text-sm">
              ...và {words.length - 6} từ khác
            </p>
          )}
          
          {/* Start Button */}
          <Link href="/vocabulary/review">
            <Button className="w-full" size="lg">
              Bắt đầu ôn tập
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Acceptance Criteria:**
- [x] Fetches from GET /api/review/queue
- [x] Shows loading skeleton
- [x] Shows error state with retry
- [x] Shows empty state
- [x] Shows word preview (first 6)
- [x] "Start Review" button links to /vocabulary/review
- [x] Responsive design

---

### **Task 1.6: Review Session Flow**
**Effort:** 6 hours  
**Dependencies:** ⏳ Task 1.5 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Full review session: show cards, rate difficulty, track progress.

#### **Deliverables:**

**File:** `apps/web-learner/src/app/vocabulary/review/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { ReviewSession } from '@/components/vocabulary/ReviewSession'

export default function ReviewPage() {
  return (
    <div className="container mx-auto py-8">
      <ReviewSession />
    </div>
  )
}
```

**File:** `apps/web-learner/src/components/vocabulary/ReviewSession.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { Flashcard } from './Flashcard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

type QualityButton = 1 | 2 | 3 | 4

export function ReviewSession() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: words, isLoading } = useReviewQueue()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const submitReview = useMutation({
    mutationFn: async ({ wordId, quality }: { wordId: string; quality: number }) => {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ wordId, quality })
      })
      
      if (!response.ok) throw new Error('Failed to submit review')
      return response.json()
    },
    onSuccess: () => {
      // Move to next card
      if (currentIndex < (words?.length || 0) - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        // Session complete
        queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
        router.push('/vocabulary/review/complete')
      }
    }
  })
  
  if (isLoading) {
    return <div>Đang tải...</div>
  }
  
  if (!words || words.length === 0) {
    router.push('/dashboard')
    return null
  }
  
  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100
  
  const handleRating = (button: QualityButton) => {
    // Map button to quality score
    const qualityMap: Record<QualityButton, number> = {
      1: 1, // Again
      2: 3, // Hard
      3: 4, // Good
      4: 5  // Easy
    }
    
    submitReview.mutate({
      wordId: currentWord.word.id,
      quality: qualityMap[button]
    })
  }
  
  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFlipped) return // Only rate when flipped
    
    if (e.key === '1') handleRating(1)
    if (e.key === '2') handleRating(2)
    if (e.key === '3') handleRating(3)
    if (e.key === '4') handleRating(4)
  }
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex])
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentIndex + 1} / {words.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
      
      {/* Flashcard */}
      <div className="mb-8 flex justify-center">
        <Flashcard
          word={currentWord.word}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>
      
      {/* Rating Buttons (show only when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => handleRating(1)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">1</span>
            Quên
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
            onClick={() => handleRating(2)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">2</span>
            Khó
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => handleRating(3)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">3</span>
            Tốt
          </Button>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleRating(4)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">4</span>
            Dễ
          </Button>
        </div>
      )}
      
      {!isFlipped && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Lật thẻ để đánh giá độ khó
        </p>
      )}
    </div>
  )
}
```

**Acceptance Criteria:**
- [x] Shows flashcards one by one
- [x] Progress bar updates
- [x] 4 rating buttons (Again, Hard, Good, Easy)
- [x] Keyboard shortcuts (1-4)
- [x] Submits review to API
- [x] Moves to next card after rating
- [x] Redirects to complete page when done

---

### **Task 2.5: Streak Display Component**
**Effort:** 4 hours  
**Dependencies:** ⏳ Task 2.3 (API) complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Animated streak display with flame icon.

#### **Deliverables:**

**File:** `apps/web-learner/src/hooks/useStreak.ts`

```typescript
import { useQuery } from '@tanstack/react-query'

interface StreakData {
  currentStreak: number
  longestStreak: number
  isActiveToday: boolean
  nextMilestone: number | null
  daysUntilMilestone: number | null
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: async (): Promise<StreakData> => {
      const response = await fetch('/api/user/streak', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch streak')
      
      const json = await response.json()
      return json.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  })
}
```

**File:** `apps/web-learner/src/components/gamification/StreakDisplay.tsx`

```typescript
'use client'

import { useStreak } from '@/hooks/useStreak'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

export function StreakDisplay() {
  const { data: streak, isLoading } = useStreak()
  
  if (isLoading || !streak) {
    return <div className="h-20 w-32 bg-gray-100 animate-pulse rounded-lg" />
  }
  
  const progressToMilestone = streak.nextMilestone
    ? (streak.currentStreak / streak.nextMilestone) * 100
    : 100
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
      {/* Flame Icon */}
      <motion.div
        animate={streak.isActiveToday ? {
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
      >
        <Flame
          className={`w-12 h-12 ${
            streak.isActiveToday ? 'text-orange-500' : 'text-gray-400'
          }`}
          fill="currentColor"
        />
      </motion.div>
      
      {/* Streak Info */}
      <div className="flex-1">
        <p className="text-2xl font-bold text-orange-600">
          {streak.currentStreak} ngày
        </p>
        <p className="text-sm text-gray-600">
          Streak hiện tại
        </p>
        
        {/* Progress to next milestone */}
        {streak.nextMilestone && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{streak.currentStreak}</span>
              <span>{streak.nextMilestone} (mốc tiếp theo)</span>
            </div>
            <Progress value={progressToMilestone} className="h-1" />
          </div>
        )}
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [x] Shows current streak with flame icon
- [x] Flame animates if active today
- [x] Shows progress to next milestone
- [x] Fetches from GET /api/user/streak
- [x] Responsive design

---

### **Task 2.6: Integrate Streak into Dashboard**
**Effort:** 2 hours  
**Dependencies:** ⏳ Task 2.5 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Add StreakDisplay to dashboard header.

#### **Deliverables:**

**File:** `apps/web-learner/src/app/dashboard/page.tsx`

```typescript
import { StreakDisplay } from '@/components/gamification/StreakDisplay'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      {/* Header with Streak */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <StreakDisplay />
      </div>
      
      {/* Rest of dashboard */}
      {/* ... */}
    </div>
  )
}
```

**Acceptance Criteria:**
- [x] StreakDisplay in top-right corner
- [x] Responsive (stacks on mobile)
- [x] No layout shifts

---

### **Task 3.3: Audio Player Integration (Frontend)**
**Effort:** 2 hours (frontend part)  
**Dependencies:** ⏳ Backend Task 3.3 complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Integrate audio playback into FlashcardFront.

#### **Deliverables:**

**Update:** `apps/web-learner/src/components/vocabulary/FlashcardFront.tsx`

Replace audio button logic with `useAudio` hook (code in technical review Task 3.3).

**Acceptance Criteria:**
- [x] Audio button plays sound (backend or Web Speech)
- [x] Shows loading spinner while fetching
- [x] Icon changes during playback
- [x] Graceful fallback if backend fails

---

### **Task 3.4: Integrate Flashcard into Review Session**
**Effort:** 2 hours  
**Dependencies:** ⏳ All above tasks complete  
**Status:** ⏳ WAITING

#### **Your Mission:**
Final integration: use real Flashcard + WordMeter in ReviewSession.

#### **Deliverables:**

**Update:** `apps/web-learner/src/components/vocabulary/ReviewSession.tsx`

- Replace placeholder with `<Flashcard />` component
- Add `<WordMeter />` below flashcard
- Verify audio works
- Verify animations smooth

**Acceptance Criteria:**
- [x] All components integrated
- [x] No visual bugs
- [x] Performance: 60fps animations
- [x] No console errors

---

## 📝 SUBMISSION CHECKLIST

- [ ] All components implemented
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Responsive design tested (mobile + desktop)
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Code follows `.claude/rules/frontend-react.md`

**Report format:**
```
✅ Frontend tasks complete!

Task 3.1: Flashcard ✅ (flip animation 60fps)
Task 3.2: Word Meter ✅
Task 1.5: Review Queue UI ✅
Task 1.6: Review Session ✅ (keyboard shortcuts work)
Task 2.5: Streak Display ✅ (animated flame)
Task 2.6: Dashboard integration ✅
Task 3.3: Audio integration ✅ (fallback works)
Task 3.4: Final integration ✅

Files:
- components/vocabulary/Flashcard.tsx
- components/vocabulary/FlashcardFront.tsx
- components/vocabulary/FlashcardBack.tsx
- components/vocabulary/WordMeter.tsx
- components/vocabulary/ReviewQueue.tsx
- components/vocabulary/ReviewSession.tsx
- components/gamification/StreakDisplay.tsx
- hooks/useReviewQueue.ts
- hooks/useStreak.ts
- hooks/useAudio.ts
- app/vocabulary/review/page.tsx

Ready for integration testing!
```

---

**READ THESE RULES:**
- `.claude/rules/frontend-react.md`
- `.execution/TECHNICAL_REVIEW_vocabulary_phase1.md`

**START with Task 3.1 and 3.2** (no dependencies), then wait for backend APIs.
