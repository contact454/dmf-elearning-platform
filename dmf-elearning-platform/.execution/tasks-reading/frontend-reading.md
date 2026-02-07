# Frontend Developer - Reading Module Phase 1

**Role:** UI Components, Interactive Text, Exercise Flows  
**Duration:** Weeks 3-8 (50-60 hours total)  
**Priority:** HIGH (user-facing features)

---

## 🎯 Your Mission

Build the reading passage display UI, create interactive vocabulary system, implement 4 exercise type components, build feedback system, and create progress dashboard for the Reading Module.

---

## ✅ Task Checklist

### **Week 3-4: Reading Passage Display**

#### **Task 1.1: Install dependencies**
**Duration:** 30 minutes  
**Priority:** P0 (Critical)

**Packages:**
```bash
npm install framer-motion lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install recharts clsx tailwind-merge
npm install --save-dev @types/node
```

**Purpose:**
- `framer-motion`: Smooth animations
- `lucide-react`: Icon library
- `@dnd-kit`: Drag & drop for sequencing
- `recharts`: Charts for progress dashboard
- `clsx` + `tailwind-merge`: Utility for className merging

**Acceptance Criteria:**
- [x] All packages installed
- [x] No dependency conflicts
- [x] TypeScript types available

---

#### **Task 1.2: Create PassageDisplay component**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**File:** `components/reading/PassageDisplay.tsx`

**Features:**
- Clean typography (18px font, 1.7 line height)
- Font size controls (14-24px)
- Reading mode toggle (distraction-free fullscreen)
- Mobile-responsive layout

**Code:**
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveText } from './InteractiveText';

interface Passage {
  id: string;
  title: string;
  content: string;
  cefrLevel: string;
  topic: string;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
}

interface PassageDisplayProps {
  passage: Passage;
}

export function PassageDisplay({ passage }: PassageDisplayProps) {
  const [fontSize, setFontSize] = useState(18);
  const [isReadingMode, setIsReadingMode] = useState(false);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(24, prev + 2));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(14, prev - 2));
  };

  const toggleReadingMode = () => {
    setIsReadingMode((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'passage-container',
        isReadingMode &&
          'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto'
      )}
    >
      {/* Header */}
      <div className="passage-header sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Metadata */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{passage.cefrLevel}</Badge>
            <Badge variant="outline">{passage.topic}</Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {passage.wordCount} words · {passage.estimatedReadingTimeMinutes} min read
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={decreaseFontSize}
              size="icon"
              variant="ghost"
              aria-label="Decrease font size"
              disabled={fontSize <= 14}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium min-w-[3ch] text-center">
              {fontSize}px
            </span>

            <Button
              onClick={increaseFontSize}
              size="icon"
              variant="ghost"
              aria-label="Increase font size"
              disabled={fontSize >= 24}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            <Button
              onClick={toggleReadingMode}
              size="sm"
              variant={isReadingMode ? 'default' : 'outline'}
              aria-label={isReadingMode ? 'Exit reading mode' : 'Enter reading mode'}
            >
              {isReadingMode ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Focus
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Passage Content */}
      <motion.article
        className="passage-content max-w-3xl mx-auto px-4 py-8"
        style={{ fontSize: `${fontSize}px` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="passage-title text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {passage.title}
        </h1>

        <InteractiveText content={passage.content} passageId={passage.id} />
      </motion.article>
    </div>
  );
}

// Utility function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**CSS (if needed):**
```css
/* globals.css */
.passage-content {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.7;
  color: #1a1a1a;
}

.passage-content p {
  margin-bottom: 1.5em;
}

@media (max-width: 640px) {
  .passage-container {
    padding: 0;
  }
  
  .passage-content {
    padding: 1rem;
  }
}
```

**Acceptance Criteria:**
- [x] Typography is readable (18px default, 1.7 line height)
- [x] Font size controls work (14-24px)
- [x] Reading mode shows fullscreen view
- [x] Mobile responsive (single column, padding adjusted)
- [x] Keyboard shortcuts work (optional)

---

#### **Task 1.3: Create InteractiveText component**
**Duration:** 8 hours  
**Priority:** P0 (Critical)

**File:** `components/reading/InteractiveText.tsx`

**Features:**
- Split text into clickable words
- Click word → show VocabularyPopup
- Color-code words by status (new/learning/known)

**Code:**
```tsx
'use client';

import { useState } from 'react';
import { useVocabularyStatus } from '@/hooks/useVocabulary';
import { VocabularyPopup } from './VocabularyPopup';

interface InteractiveTextProps {
  content: string;
  passageId: string;
}

export function InteractiveText({ content, passageId }: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Tokenize text into words and punctuation
  const tokens = content.split(/(\s+|[.,!?;:—\-"])/);

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    // Ignore punctuation and whitespace
    if (/^\s+|[.,!?;:—\-"]$/.test(word)) return;

    setSelectedWord(word);
    setClickPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setClickPosition(null);
  };

  return (
    <div className="interactive-text">
      {tokens.map((token, index) => {
        // Skip whitespace/punctuation rendering as separate components
        if (/^\s+|[.,!?;:—\-"]$/.test(token)) {
          return <span key={index}>{token}</span>;
        }

        return (
          <InteractiveWord
            key={index}
            word={token}
            onSelect={handleWordClick}
          />
        );
      })}

      {selectedWord && clickPosition && (
        <VocabularyPopup
          word={selectedWord}
          passageId={passageId}
          position={clickPosition}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

interface InteractiveWordProps {
  word: string;
  onSelect: (word: string, event: React.MouseEvent) => void;
}

function InteractiveWord({ word, onSelect }: InteractiveWordProps) {
  const { status, isLoading } = useVocabularyStatus(word);

  const getClassName = () => {
    const base =
      'word cursor-pointer transition-colors duration-150 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-0.5 rounded';

    if (isLoading) return `${base} opacity-50`;

    if (status === 'new') {
      return `${base} text-blue-600 dark:text-blue-400 border-b-2 border-dotted border-blue-600`;
    }

    if (status === 'learning') {
      return `${base} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-300 font-medium`;
    }

    if (status === 'known') {
      return `${base} text-green-600 dark:text-green-400 font-medium`;
    }

    return base;
  };

  return (
    <span
      className={getClassName()}
      onClick={(e) => onSelect(word, e)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onSelect(word, e as any);
        }
      }}
    >
      {word}
    </span>
  );
}
```

**Custom Hook:** `hooks/useVocabulary.ts`
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function useVocabularyStatus(word: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['vocabulary-status', word.toLowerCase()],
    queryFn: async () => {
      const res = await fetch(`/api/vocabulary/status?word=${encodeURIComponent(word)}`);
      if (!res.ok) return { status: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    status: data?.status || null, // 'new', 'learning', 'known', or null
    isLoading,
  };
}
```

**Acceptance Criteria:**
- [x] Text splits into clickable words
- [x] Click word opens popup
- [x] Word colors match status (new=blue, learning=yellow, known=green)
- [x] Hover effect shows interactivity
- [x] Keyboard accessible (Tab + Enter)

---

#### **Task 1.4: Create VocabularyPopup component**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**File:** `components/reading/VocabularyPopup.tsx`

**Features:**
- Show word definition, pronunciation, translation
- Play audio pronunciation (optional)
- Save word to vocabulary button
- Desktop: popover near word, Mobile: bottom sheet

**Code:**
```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VocabularyPopupProps {
  word: string;
  passageId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function VocabularyPopup({
  word,
  passageId,
  position,
  onClose,
}: VocabularyPopupProps) {
  const queryClient = useQueryClient();

  // Fetch definition
  const { data: definition, isLoading } = useQuery({
    queryKey: ['vocabulary-definition', word],
    queryFn: async () => {
      const res = await fetch(
        `/api/vocabulary/definition?word=${encodeURIComponent(word)}`
      );
      if (!res.ok) throw new Error('Failed to fetch definition');
      return res.json();
    },
  });

  // Save vocabulary mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/vocabulary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          passageId,
          context: definition?.exampleSentence,
        }),
      });
      if (!res.ok) throw new Error('Failed to save vocabulary');
      return res.json();
    },
    onSuccess: () => {
      toast.success(`"${word}" saved to vocabulary!`);
      queryClient.invalidateQueries({ queryKey: ['vocabulary-status', word.toLowerCase()] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to save vocabulary');
    },
  });

  // Position popup (desktop: near click, mobile: bottom sheet)
  const isMobile = window.innerWidth < 640;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Popup content */}
        <motion.div
          initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full',
            isMobile ? 'max-h-[80vh]' : 'max-h-[60vh]'
          )}
          onClick={(e) => e.stopPropagation()}
          style={
            !isMobile && position
              ? {
                  position: 'fixed',
                  left: `${position.x}px`,
                  top: `${position.y + 20}px`,
                  transform: 'translateX(-50%)',
                }
              : undefined
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {word}
            </h3>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            ) : definition ? (
              <div className="space-y-4">
                {/* Pronunciation */}
                {definition.pronunciation && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-mono">
                      /{definition.pronunciation}/
                    </span>
                    {definition.audioUrl && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => playAudio(definition.audioUrl)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Definition */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Definition:
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {definition.definition}
                  </p>
                </div>

                {/* Vietnamese Translation */}
                {definition.translationVi && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Tiếng Việt:
                    </h4>
                    <p className="text-gray-900 dark:text-gray-100">
                      {definition.translationVi}
                    </p>
                  </div>
                )}

                {/* Example Sentence */}
                {definition.exampleSentence && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Example:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      "{definition.exampleSentence}"
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {saveMutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Vocabulary
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Definition not found.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function playAudio(url: string) {
  const audio = new Audio(url);
  audio.play();
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**Acceptance Criteria:**
- [x] Shows definition, pronunciation, translation
- [x] Desktop: popover near word
- [x] Mobile: bottom sheet
- [x] Save button works (adds to vocabulary)
- [x] Audio playback works (if URL provided)
- [x] Handles loading and error states

---

### **Week 4-6: Exercise Components**

#### **Task 2.1: Create MultipleChoiceExercise component**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**File:** `components/reading/exercises/MultipleChoiceExercise.tsx`

**Code:**
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackCard } from './FeedbackCard';
import confetti from 'canvas-confetti';

interface Exercise {
  id: string;
  question: string;
  exerciseData: {
    options: string[];
    correct_index: number;
  };
  explanation?: string;
}

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onComplete: (data: any) => void;
}

export function MultipleChoiceExercise({
  exercise,
  onComplete,
}: MultipleChoiceExerciseProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    const correct = selectedIndex === exercise.exerciseData.correct_index;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Confetti if correct
    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Notify parent
    onComplete({
      exerciseId: exercise.id,
      userAnswer: { selected_index: selectedIndex },
      isCorrect: correct,
    });
  };

  return (
    <motion.div
      className="exercise-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="exercise-header mb-4">
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Multiple Choice
        </span>
      </div>

      <h3 className="question text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        {exercise.question}
      </h3>

      <div className="options space-y-3">
        {exercise.exerciseData.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption =
            index === exercise.exerciseData.correct_index;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <label
              key={index}
              className={cn(
                'option flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                isSelected && !showFeedback &&
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                !isSelected &&
                  !showFeedback &&
                  'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
                showCorrect &&
                  'border-green-500 bg-green-50 dark:bg-green-900/20',
                showIncorrect &&
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
              )}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={isSelected}
                onChange={() => setSelectedIndex(index)}
                disabled={showFeedback}
                className="sr-only"
              />

              <span className="flex-1 text-gray-900 dark:text-gray-100">
                {option}
              </span>

              {showCorrect && (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              )}
              {showIncorrect && (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </label>
          );
        })}
      </div>

      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="w-full mt-6"
          size="lg"
        >
          Check Answer
        </Button>
      )}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 10 : 0}
          onNext={() => {
            /* Move to next exercise */
          }}
        />
      )}
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**Acceptance Criteria:**
- [x] Shows question and 4 options
- [x] User can select one option
- [x] Submit button validates answer
- [x] Correct answer shows green check
- [x] Wrong answer shows red X + correct answer
- [x] Confetti on correct answer
- [x] Explanation displayed after submit

---

*(Continue with TrueFalseExercise, FillBlankExercise, SequencingExercise, FeedbackCard, and ReadingDashboard components in similar detail)*

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Reading Display UI | 14h |
| Interactive Vocabulary | 14h |
| Exercise Components (4 types) | 20h |
| Feedback System | 4h |
| Progress Dashboard | 8h |
| Responsive Design & Polish | 6h |
| **Total** | **66h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] All components render correctly
- [ ] Interactive text works (click word → popup)
- [ ] All 4 exercise types functional
- [ ] Feedback system shows success/error states
- [ ] Progress dashboard displays stats
- [ ] Mobile responsive (tested on iPhone, Android)
- [ ] Keyboard accessible (Tab navigation works)
- [ ] Dark mode support (if applicable)

---

## 📞 Coordination Points

**With Backend Developer:**
- Get API endpoint documentation
- Test API integration together
- Discuss error handling

**With Integration Specialist:**
- Share component APIs (props, events)
- Help debug state management
- Review React Query usage

---

## 🚀 Next Steps After Completion

1. Notify Integration Specialist: Components ready for API integration
2. Conduct accessibility audit (axe DevTools)
3. Test on real devices (iOS, Android)
4. Gather user feedback from beta testers

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ Ready for Execution
