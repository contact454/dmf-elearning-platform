# UX Analyst Report: Reading Module Interface Design

**Date:** February 6, 2026  
**Analyst:** UX Analyst  
**Focus:** User Experience & Interface Design for Reading Comprehension

---

## Executive Summary

This report analyzes UX best practices for reading comprehension platforms, focusing on interface patterns, interaction design, and accessibility. Successful reading platforms balance clean, distraction-free reading experiences with rich interactive features (vocabulary lookups, highlighting, progress tracking).

Key findings from competitor analysis and UX research:

1. **Mobile-first design is critical** - 80-90% of users access on mobile devices
2. **Progressive disclosure** - Hide complexity, reveal features as needed
3. **Immediate feedback** - Visual confirmation for all interactions (clicks, answers)
4. **Consistent navigation** - Predictable patterns reduce cognitive load
5. **Accessibility compliance** - WCAG 2.1 AA is both legal requirement and good UX

**Development Estimate:** 130-150 hours across 6 phases

---

## Reading Interface Patterns

### 1. Passage Display Modes

#### Single-Column Layout (Recommended for Mobile)

**Characteristics:**
- Full-width text (90% of screen width, 5% padding each side)
- Comfortable line length: 60-80 characters (~10-12 words)
- Font size: 16-18px (minimum) for mobile, 18-20px for desktop
- Line height: 1.6-1.8 (optimal for readability)
- Paragraph spacing: 1.5× line height

**Visual Design:**
```
┌─────────────────────────────────────┐
│  ← [Back]    Reading: A1           │ Header
├─────────────────────────────────────┤
│                                     │
│  ■■■■■ Progress: 3/8                │ Progress
│                                     │
├─────────────────────────────────────┤
│                                     │
│   My Daily Routine                  │ Title
│                                     │
│   I wake up at 7 AM every morning.  │
│   First, I brush my teeth and wash  │
│   my face. Then I eat breakfast     │ Passage
│   with my family. I usually have    │ (clean, spacious)
│   toast and orange juice.           │
│                                     │
│   After breakfast, I go to school.  │
│   My school starts at 8:30 AM...    │
│                                     │
└─────────────────────────────────────┘
```

**CSS Implementation:**
```css
.passage-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: #1a1a1a;
}

.passage-text {
  margin-bottom: 2rem;
}

.passage-text p {
  margin-bottom: 1.5em;
}

@media (max-width: 640px) {
  .passage-container {
    padding: 1rem;
    font-size: 16px;
  }
}
```

---

#### Reading Mode (Distraction-Free)

**Features:**
- Hide header/footer
- Full-screen text
- Toggle button to exit
- Inspired by Medium, Pocket reader modes

**Implementation:**
```typescript
function ReadingModeToggle() {
  const [isReadingMode, setIsReadingMode] = useState(false);
  
  useEffect(() => {
    if (isReadingMode) {
      document.body.classList.add('reading-mode');
    } else {
      document.body.classList.remove('reading-mode');
    }
  }, [isReadingMode]);
  
  return (
    <button
      onClick={() => setIsReadingMode(!isReadingMode)}
      className="reading-mode-toggle"
    >
      {isReadingMode ? '📖 Exit Reading Mode' : '📖 Reading Mode'}
    </button>
  );
}
```

```css
.reading-mode {
  /* Hide navigation, sidebars, etc. */
}

.reading-mode .passage-container {
  max-width: 700px;
  padding: 3rem 2rem;
  font-size: 20px;
  line-height: 1.8;
}
```

**Benefits:**
- ✅ Reduces distractions, improves focus
- ✅ Particularly useful for longer passages (B2-C2 levels)
- ✅ User preference can be saved (localStorage)

---

### 2. Interactive Word Highlighting

#### Hover/Tap States

**Desktop (Hover):**
```css
.word {
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 2px 0;
  border-radius: 3px;
}

.word:hover {
  background-color: rgba(255, 193, 7, 0.2); /* Light yellow */
  transform: translateY(-1px);
}

/* Tooltip on hover */
.word:hover::after {
  content: 'Click for definition';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0.9;
  pointer-events: none;
}
```

**Mobile (Tap):**
- No hover state (doesn't exist on touch devices)
- Use `:active` for tap feedback
- Show definition popup immediately on tap

```css
@media (hover: none) {
  .word:active {
    background-color: rgba(255, 193, 7, 0.3);
  }
}
```

---

#### Word Status Color Coding (LingQ-Style)

**Visual System:**
- **Gray (default):** Unseen word, no interaction yet
- **Blue underline:** New word, clicked once, added to vocabulary
- **Yellow background:** Learning (reviewed 1-3 times)
- **Green text:** Known (reviewed 4+ times, mastered)

**Implementation:**
```tsx
function InteractiveWord({ word, status, onClick }: Props) {
  const getWordClassName = (status: WordStatus) => {
    const base = 'word';
    
    switch (status) {
      case 'new':
        return `${base} word-new`;
      case 'learning':
        return `${base} word-learning`;
      case 'known':
        return `${base} word-known`;
      default:
        return base;
    }
  };
  
  return (
    <span
      className={getWordClassName(status)}
      onClick={() => onClick(word)}
    >
      {word}
    </span>
  );
}
```

```css
.word {
  color: #333; /* Default gray */
  cursor: pointer;
}

.word-new {
  color: #0d6efd; /* Blue */
  border-bottom: 2px dotted #0d6efd;
}

.word-learning {
  background-color: #fff3cd; /* Light yellow */
  padding: 2px 4px;
  border-radius: 3px;
}

.word-known {
  color: #198754; /* Green */
  font-weight: 500;
}
```

**User Education:**
- First-time user: Show tooltip explaining color system
- Use animation to highlight color change when word status updates

---

### 3. Vocabulary Definition Popup

#### Design Pattern: Modal vs Popover

**Popover (Recommended for Desktop):**
- Appears next to clicked word
- Doesn't block reading flow
- Easy to dismiss (click outside or Escape key)

**Modal (Recommended for Mobile):**
- Full-width panel slides up from bottom
- Large touch targets for buttons
- More space for content (definition, examples, audio)

**Desktop Popover Implementation:**
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function VocabularyPopover({ word, definition, translation }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="word word-new">{word}</span>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">{word}</h4>
          
          <div className="text-sm text-muted-foreground">
            /{pronunciation}/
          </div>
          
          <div className="border-t pt-2">
            <p className="font-medium">Definition:</p>
            <p className="text-sm">{definition}</p>
          </div>
          
          <div className="border-t pt-2">
            <p className="font-medium">Vietnamese:</p>
            <p className="text-sm">{translation}</p>
          </div>
          
          <div className="border-t pt-2">
            <button className="btn-secondary w-full">
              🔊 Pronunciation
            </button>
            <button className="btn-primary w-full mt-2">
              ➕ Add to Vocabulary
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Mobile Bottom Sheet:**
```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function VocabularySheet({ word, definition, translation }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <span className="word word-new">{word}</span>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[60vh]">
        <div className="space-y-4 p-4">
          <h3 className="text-2xl font-bold">{word}</h3>
          
          <div className="text-gray-600">
            /{pronunciation}/
          </div>
          
          <div>
            <h4 className="font-semibold mb-1">Definition:</h4>
            <p className="text-lg">{definition}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-1">Tiếng Việt:</h4>
            <p className="text-lg">{translation}</p>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button className="btn-secondary flex-1 py-3">
              🔊 Listen
            </button>
            <button className="btn-primary flex-1 py-3">
              ➕ Save Word
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Best Practices:**
- ✅ Prevent parent scroll when popup is open (mobile)
- ✅ Auto-close on outside click (desktop)
- ✅ Keyboard navigation (Tab to buttons, Escape to close)
- ✅ Show loading state while fetching definition

---

## Exercise Interaction Designs

### 1. Multiple Choice Exercise

**Layout:**
```
┌─────────────────────────────────────┐
│  Question 3 of 8                    │
│  ■■■■■■□□                          │ Progress bar
├─────────────────────────────────────┤
│                                     │
│  What does the author eat for       │
│  breakfast?                         │ Question
│                                     │
│  ○ Rice and soup                    │
│  ○ Toast and orange juice           │ Options
│  ○ Noodles and tea                  │ (radio buttons)
│  ○ Cereal and milk                  │
│                                     │
│         [Check Answer]              │ Action
│                                     │
└─────────────────────────────────────┘
```

**State Management:**
```tsx
function MultipleChoiceExercise({ question, options, correctIndex }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    if (selectedIndex === null) return;
    
    const correct = selectedIndex === correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Trigger confetti animation if correct
    if (correct) {
      triggerConfetti();
    }
  };
  
  return (
    <div className="exercise-container">
      <h3 className="question">{question}</h3>
      
      <div className="options">
        {options.map((option, index) => (
          <label
            key={index}
            className={cn(
              'option',
              selectedIndex === index && 'selected',
              showFeedback && index === correctIndex && 'correct',
              showFeedback && selectedIndex === index && !isCorrect && 'incorrect'
            )}
          >
            <input
              type="radio"
              name="answer"
              value={index}
              checked={selectedIndex === index}
              onChange={() => setSelectedIndex(index)}
              disabled={showFeedback}
            />
            <span>{option}</span>
            
            {showFeedback && index === correctIndex && (
              <CheckCircle className="icon-correct" />
            )}
            {showFeedback && selectedIndex === index && !isCorrect && (
              <XCircle className="icon-incorrect" />
            )}
          </label>
        ))}
      </div>
      
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="btn-primary"
        >
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          correctAnswer={options[correctIndex]}
          onNext={() => {/* Move to next question */}}
        />
      )}
    </div>
  );
}
```

**Visual States:**
```css
.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.option:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.option.selected {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.option.correct {
  border-color: #22c55e;
  background-color: #dcfce7;
}

.option.incorrect {
  border-color: #ef4444;
  background-color: #fee2e2;
}

.icon-correct {
  margin-left: auto;
  color: #22c55e;
}

.icon-incorrect {
  margin-left: auto;
  color: #ef4444;
}
```

---

### 2. Fill-in-the-Blank Exercise

**Layout:**
```
┌─────────────────────────────────────┐
│  Question 2 of 8                    │
│  ■■■■□□□□                          │
├─────────────────────────────────────┤
│                                     │
│  I _____ up at 7 AM every morning.  │
│    [wake]                           │ Input field
│                                     │
│  Word bank (optional):              │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ wake │ │ woke │ │ woken│       │ Hint tiles
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│         [Check Answer]              │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```tsx
function FillBlankExercise({ sentence, blankIndex, correctAnswer, wordBank }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase();
    const correct = trimmedAnswer === correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
  };
  
  const handleWordBankClick = (word: string) => {
    setUserAnswer(word);
  };
  
  // Split sentence into parts (before blank, blank, after blank)
  const parts = sentence.split('_____');
  
  return (
    <div className="exercise-container">
      <div className="sentence">
        <span>{parts[0]}</span>
        
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={showFeedback}
          className={cn(
            'blank-input',
            showFeedback && (isCorrect ? 'correct' : 'incorrect')
          )}
          placeholder="Type here..."
          autoFocus
        />
        
        <span>{parts[1]}</span>
      </div>
      
      {wordBank && (
        <div className="word-bank">
          <p className="text-sm text-gray-600 mb-2">Tap a word to fill:</p>
          <div className="word-tiles">
            {wordBank.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordBankClick(word)}
                disabled={showFeedback}
                className="word-tile"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="btn-primary"
        >
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          userAnswer={userAnswer}
          correctAnswer={correctAnswer}
          onNext={() => {/* Next question */}}
        />
      )}
    </div>
  );
}
```

**Styling:**
```css
.blank-input {
  display: inline-block;
  min-width: 120px;
  padding: 8px 12px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: inherit;
  font-family: inherit;
  margin: 0 4px;
  text-align: center;
}

.blank-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.blank-input.correct {
  border-color: #22c55e;
  background-color: #dcfce7;
}

.blank-input.incorrect {
  border-color: #ef4444;
  background-color: #fee2e2;
}

.word-bank {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.word-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.word-tile {
  padding: 10px 20px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.word-tile:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.word-tile:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 3. True/False Exercise

**Compact Layout:**
```
┌─────────────────────────────────────┐
│  Question 4 of 8                    │
│  ■■■■■■■□                          │
├─────────────────────────────────────┤
│                                     │
│  The author eats breakfast alone.   │
│                                     │
│    ┌───────┐      ┌───────┐       │
│    │ TRUE  │      │ FALSE │       │ Large buttons
│    └───────┘      └───────┘       │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```tsx
function TrueFalseExercise({ statement, isTrue }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };
  
  const isCorrect = selectedAnswer === isTrue;
  
  return (
    <div className="exercise-container text-center">
      <p className="statement text-xl mb-6">{statement}</p>
      
      {!showFeedback && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleAnswer(true)}
            className="btn-large btn-true"
          >
            ✓ TRUE
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="btn-large btn-false"
          >
            ✗ FALSE
          </button>
        </div>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          correctAnswer={isTrue ? 'TRUE' : 'FALSE'}
          onNext={() => {/* Next */}}
        />
      )}
    </div>
  );
}
```

---

### 4. Sequencing Exercise (Drag & Drop)

**Layout:**
```
┌─────────────────────────────────────┐
│  Put these sentences in order:      │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ ⋮⋮ Then I eat breakfast.    │   │ Draggable
│  └─────────────────────────────┘   │ cards
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⋮⋮ After that, I go to work.│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⋮⋮ I wake up at 7 AM.       │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Check Answer]              │
│                                     │
└─────────────────────────────────────┘
```

**Implementation (using dnd-kit):**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SequencingExercise({ sentences, correctOrder }: Props) {
  const [items, setItems] = useState(sentences);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const handleSubmit = () => {
    const currentOrder = items.map((item) => item.id);
    const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    
    setIsCorrect(correct);
    setShowFeedback(true);
  };
  
  return (
    <div className="exercise-container">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} text={item.text} />
          ))}
        </SortableContext>
      </DndContext>
      
      {!showFeedback && (
        <button onClick={handleSubmit} className="btn-primary mt-4">
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard isCorrect={isCorrect} onNext={() => {/* Next */}} />
      )}
    </div>
  );
}

function SortableItem({ id, text }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-item"
    >
      <GripVertical className="grip-icon" />
      <span>{text}</span>
    </div>
  );
}
```

```css
.sortable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: grab;
  user-select: none;
}

.sortable-item:active {
  cursor: grabbing;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.grip-icon {
  color: #94a3b8;
  flex-shrink: 0;
}
```

---

## Feedback System Design

### Success Feedback

**Visual:**
```tsx
function SuccessFeedback({ xpEarned, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="feedback-card success"
    >
      <div className="icon-container">
        <CheckCircle className="icon-large" />
      </div>
      
      <h3 className="title">Perfect! 🎉</h3>
      <p className="message">You got it right on the first try!</p>
      
      <div className="xp-badge">
        <Star className="star-icon" />
        <span>+{xpEarned} XP</span>
      </div>
      
      <button onClick={onNext} className="btn-primary mt-4">
        Continue →
      </button>
    </motion.div>
  );
}
```

**Animation:**
- Confetti burst (use react-confetti)
- XP number count-up animation
- Smooth slide-in transition

---

### Error Feedback

**Visual:**
```tsx
function ErrorFeedback({ userAnswer, correctAnswer, explanation, onRetry, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="feedback-card error"
    >
      <div className="icon-container">
        <XCircle className="icon-large" />
      </div>
      
      <h3 className="title">Not quite</h3>
      
      <div className="answer-comparison">
        <div className="user-answer">
          <span className="label">Your answer:</span>
          <span className="value incorrect">{userAnswer}</span>
        </div>
        
        <div className="correct-answer">
          <span className="label">Correct answer:</span>
          <span className="value correct">{correctAnswer}</span>
        </div>
      </div>
      
      {explanation && (
        <div className="explanation">
          <Lightbulb className="icon-small" />
          <p>{explanation}</p>
        </div>
      )}
      
      <div className="actions">
        <button onClick={onRetry} className="btn-secondary">
          🔄 Try Again
        </button>
        <button onClick={onNext} className="btn-primary">
          Continue →
        </button>
      </div>
    </motion.div>
  );
}
```

---

## Progress Tracking & Gamification

### 1. Progress Indicators

**Session Progress Bar:**
```tsx
function SessionProgress({ current, total }: Props) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="session-progress">
      <div className="progress-header">
        <span className="progress-text">Progress</span>
        <span className="progress-fraction">{current} / {total}</span>
      </div>
      
      <div className="progress-bar-container">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
```

**Circular Progress (Alternative):**
```tsx
function CircularProgress({ current, total }: Props) {
  const percentage = (current / total) * 100;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width="100" height="100">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="bold">
        {current}/{total}
      </text>
    </svg>
  );
}
```

---

### 2. XP System Visualization

**XP Gain Animation:**
```tsx
function XpGainAnimation({ amount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 1 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -50],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 2 }}
      className="xp-gain-floating"
    >
      <Star className="star-icon" />
      <span>+{amount} XP</span>
    </motion.div>
  );
}
```

**XP Progress Bar (Global):**
```tsx
function XpProgressBar({ currentXp, nextLevelXp, level }: Props) {
  const percentage = (currentXp / nextLevelXp) * 100;
  
  return (
    <div className="xp-progress">
      <div className="level-badge">Lv {level}</div>
      
      <div className="xp-bar-container">
        <div
          className="xp-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <span className="xp-text">{currentXp} / {nextLevelXp} XP</span>
    </div>
  );
}
```

---

### 3. Streak Display

**Minimal Header Version:**
```tsx
function StreakIndicator({ currentStreak }: Props) {
  return (
    <div className="streak-indicator">
      <Flame className={cn('flame-icon', currentStreak > 0 && 'active')} />
      <span className="streak-count">{currentStreak}</span>
    </div>
  );
}
```

**Detailed Dashboard Version:**
```tsx
function StreakCalendar({ last7Days }: Props) {
  return (
    <div className="streak-calendar">
      <h4>7-Day Streak</h4>
      <div className="days-grid">
        {last7Days.map((day, index) => (
          <div key={index} className={cn('day', day.practiced && 'active')}>
            <span className="day-name">{day.name}</span>
            {day.practiced ? (
              <CheckCircle className="check-icon" />
            ) : (
              <Circle className="empty-icon" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Mobile-First Design Patterns

### 1. Touch Target Sizes

**Minimum Standards (WCAG 2.1 AA):**
- Buttons: 44px × 44px minimum
- Links in text: 44px height (can be width of text)
- Input fields: 44px height minimum

**Implementation:**
```css
/* Mobile-friendly buttons */
.btn {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px; /* Prevents iOS zoom on focus */
}

/* Touch-friendly radio/checkbox */
.option label {
  min-height: 56px;
  padding: 16px;
}

/* Input fields */
input[type="text"],
textarea {
  min-height: 48px;
  font-size: 16px; /* Prevents zoom */
  padding: 12px 16px;
}
```

---

### 2. Swipe Gestures

**Next/Previous Exercise:**
```tsx
import { useSwipeable } from 'react-swipeable';

function ExerciseContainer({ onNext, onPrevious }: Props) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onNext(),
    onSwipedRight: () => onPrevious(),
    preventScrollOnSwipe: true,
    trackMouse: false // Only touch, not mouse drag
  });
  
  return (
    <div {...handlers} className="exercise-swipeable">
      {/* Exercise content */}
    </div>
  );
}
```

**Visual Feedback:**
- Show subtle arrow indicators when swiping
- Animate slide transition between exercises

---

### 3. Bottom Navigation (Mobile)

**Fixed Bottom Bar:**
```tsx
function MobileBottomNav({ onPrevious, onNext, canGoBack, canGoForward }: Props) {
  return (
    <div className="mobile-bottom-nav">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className="nav-button"
      >
        ← Back
      </button>
      
      <div className="progress-indicator">
        3 / 8
      </div>
      
      <button
        onClick={onNext}
        disabled={!canGoForward}
        className="nav-button"
      >
        Next →
      </button>
    </div>
  );
}
```

```css
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none; /* Hide on desktop */
  }
}
```

---

## Accessibility (WCAG 2.1 AA Compliance)

### 1. Color Contrast

**Requirements:**
- Text: Minimum 4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): Minimum 3:1
- UI components (buttons, inputs): Minimum 3:1

**Testing:**
```tsx
// Good contrast examples
const colors = {
  text: {
    primary: '#1a1a1a', // on white background → 16.1:1 ✅
    secondary: '#475569', // on white background → 8.6:1 ✅
  },
  buttons: {
    primary: '#3b82f6', // Blue on white → 4.5:1 ✅
    primaryText: '#ffffff', // White on blue → 4.5:1 ✅
  },
  success: '#16a34a', // Green on white → 4.5:1 ✅
  error: '#dc2626', // Red on white → 5.1:1 ✅
};
```

**Audit Tool:**
```bash
npm install -g pa11y
pa11y http://localhost:3000/reading
```

---

### 2. Keyboard Navigation

**Tab Order:**
1. Skip to content link (for screen readers)
2. Main navigation
3. Exercise question
4. Answer options/inputs
5. Submit button
6. Feedback area
7. Next button

**Implementation:**
```tsx
function AccessibleExercise() {
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Auto-focus first input on mount
    firstInputRef.current?.focus();
  }, []);
  
  return (
    <div className="exercise">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      
      <h2 id="question" tabIndex={-1}>
        {question}
      </h2>
      
      <input
        ref={firstInputRef}
        aria-labelledby="question"
        aria-describedby="hint"
      />
      
      <button
        onClick={handleSubmit}
        aria-label="Submit answer"
      >
        Check Answer
      </button>
    </div>
  );
}
```

**CSS for Skip Link:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

---

### 3. Screen Reader Support

**ARIA Labels:**
```tsx
function AccessibleMultipleChoice({ question, options, correctIndex }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  return (
    <div
      role="group"
      aria-labelledby="question"
      aria-describedby="instructions"
    >
      <h3 id="question">{question}</h3>
      <p id="instructions" className="sr-only">
        Select one option and press Check Answer
      </p>
      
      <div role="radiogroup" aria-label="Answer options">
        {options.map((option, index) => (
          <label key={index}>
            <input
              type="radio"
              name="answer"
              value={index}
              checked={selectedIndex === index}
              onChange={() => setSelectedIndex(index)}
              aria-checked={selectedIndex === index}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        aria-label="Check your selected answer"
      >
        Check Answer
      </button>
      
      {showFeedback && (
        <div
          role="alert"
          aria-live="polite"
          className="feedback"
        >
          {isCorrect ? 'Correct! Well done.' : `Incorrect. The correct answer is: ${options[correctIndex]}`}
        </div>
      )}
    </div>
  );
}
```

**Visually Hidden Class:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Development Time Estimates

| Phase | Features | Hours | Weeks (2 devs) |
|-------|----------|-------|----------------|
| **Phase 1: Basic UI** | Passage display, basic styling, navigation | 25-30 | 1-1.5 |
| **Phase 2: Exercises** | 4 exercise types with interactions | 35-40 | 1.5-2 |
| **Phase 3: Feedback** | Success/error states, animations | 15-20 | 0.75-1 |
| **Phase 4: Progress** | XP, streaks, analytics dashboard | 20-25 | 1-1.25 |
| **Phase 5: Mobile** | Responsive design, touch gestures | 20-25 | 1-1.25 |
| **Phase 6: Accessibility** | WCAG 2.1 AA compliance, keyboard nav | 15-20 | 0.75-1 |
| **TOTAL** | All features | **130-160 hours** | **6-8 weeks** |

**Team Recommendation:**
- 2 Frontend Developers: Reduce timeline to 3-4 weeks
- 1 UI/UX Designer: Create high-fidelity mockups, design system

---

## Conclusion

Reading module UX should prioritize:

1. **Clarity** - Clean text display, comfortable reading experience
2. **Interactivity** - Engaging exercises with immediate feedback
3. **Motivation** - Progress bars, XP, streaks drive continued use
4. **Accessibility** - WCAG 2.1 AA compliance ensures inclusivity
5. **Mobile-first** - 85% of users will access on mobile devices

**Key UX Patterns:**
- Interactive word highlighting with vocabulary popups
- Four exercise types with distinct visual designs
- Immediate, animated feedback (success/error states)
- Session progress tracking with visual indicators
- Gamification elements (XP, streaks, badges)

**Recommended Design System:**
- Tailwind CSS for rapid prototyping
- Shadcn UI for accessible components
- Framer Motion for smooth animations
- React Hook Form for form handling

**Development Estimate:** 130-160 hours (6-8 weeks with 2 frontend devs)

---

**Report prepared by:** UX Analyst  
**Date:** February 6, 2026  
**Document version:** 1.0  
**Status:** ✅ Complete
