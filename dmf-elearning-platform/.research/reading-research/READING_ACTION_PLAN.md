# READING MODULE ACTION PLAN

**Project:** DMF E-Learning Platform - Reading Module  
**Date:** February 6, 2026  
**Prepared by:** Research Team (Market Scout + Tech Detective + UX Analyst + Strategy Synthesizer)  
**Purpose:** Developer-ready action plan for implementing reading comprehension features

---

## 🎯 Executive Summary

This action plan translates competitive research, technical analysis, and UX best practices into concrete development tasks for the DMF Reading Module. The plan is structured in 6 phases over 24 weeks, prioritizing MVP features first, then iterating toward advanced capabilities.

**Core Goal:** Build an engaging, effective reading comprehension system that helps Vietnamese learners master English reading skills through diverse exercises, intelligent vocabulary tracking, and motivating progression.

**Scope for Phase 1 (Foundation):**
- **70 reading passages** (10 per CEFR level: A1, A2, B1, B2, C1, C2)
- **4 exercise types:** Multiple choice, True/False, Fill-in-the-blank, Sequencing
- **350+ exercises** total (5 per passage minimum)
- **Interactive vocabulary system** (click word → definition, SRS flashcards)
- **Progress tracking** (session + overall stats)
- **Mobile-first responsive design**

---

## 📋 Key Features to Implement

### Must-Have (MVP - Phases 1-3)

#### 1. Reading Passage Display

**Why:** Foundation for all reading exercises - clean, readable text interface

**How:**
- Render passage text with optimal typography (18px font, 1.7 line height)
- Mobile-responsive (single column, max-width 800px)
- Reading mode toggle (distraction-free full-screen)
- Adjustable font size (user preference)

**Technical Stack:**
```tsx
// PassageDisplay.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

interface Passage {
  id: string;
  title: string;
  content: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  word_count: number;
}

function PassageDisplay({ passage }: { passage: Passage }) {
  const [fontSize, setFontSize] = useState(18);
  const [isReadingMode, setIsReadingMode] = useState(false);
  
  return (
    <div className={`passage-container ${isReadingMode ? 'reading-mode' : ''}`}>
      {/* Header */}
      <div className="passage-header">
        <div className="meta-info">
          <span className="cefr-badge">{passage.cefr_level}</span>
          <span className="word-count">{passage.word_count} words</span>
        </div>
        
        <div className="controls">
          <button
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            aria-label="Decrease font size"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            aria-label="Increase font size"
          >
            A+
          </button>
          <button
            onClick={() => setIsReadingMode(!isReadingMode)}
            aria-label="Toggle reading mode"
          >
            {isReadingMode ? '📖 Exit' : '📖 Focus'}
          </button>
        </div>
      </div>
      
      {/* Passage Content */}
      <motion.article
        className="passage-text"
        style={{ fontSize: `${fontSize}px` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="passage-title">{passage.title}</h1>
        
        <InteractiveText content={passage.content} />
      </motion.article>
    </div>
  );
}
```

**CSS Styling:**
```css
.passage-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.passage-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.7;
  color: #1a1a1a;
}

.passage-text p {
  margin-bottom: 1.5em;
}

/* Reading mode: hide distractions */
.reading-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  overflow-y: auto;
}

.reading-mode .passage-text {
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 2rem;
  font-size: 20px;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .passage-container {
    padding: 1rem;
  }
  
  .passage-text {
    font-size: 16px;
  }
}
```

**Priority:** P0 (Critical)  
**Effort:** 12-16 hours  
**Dependencies:** None

---

#### 2. Interactive Word Highlighting & Vocabulary Popup

**Why:** Core learning feature - instant definitions drive vocabulary acquisition

**How:**
- Split text into individual word spans
- Click/tap word → show definition popup (desktop: popover, mobile: bottom sheet)
- Save word to vocabulary list
- Color-code words by status (new/learning/known à la LingQ)

**Component Structure:**
```tsx
// InteractiveText.tsx
import { useState } from 'react';
import { useVocabularyStatus } from '@/hooks/useVocabulary';

function InteractiveText({ content }: { content: string }) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  // Tokenize text into words
  const words = content.split(/(\s+|[.,!?;:])/);
  
  return (
    <div className="interactive-text">
      {words.map((token, index) => {
        // Skip whitespace/punctuation
        if (/^\s+|[.,!?;:]$/.test(token)) {
          return <span key={index}>{token}</span>;
        }
        
        return (
          <InteractiveWord
            key={index}
            word={token}
            onSelect={setSelectedWord}
          />
        );
      })}
      
      {selectedWord && (
        <VocabularyPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}

function InteractiveWord({ word, onSelect }: { word: string; onSelect: (word: string) => void }) {
  const { status } = useVocabularyStatus(word);
  
  const getClassName = () => {
    const base = 'word';
    if (status === 'new') return `${base} word-new`;
    if (status === 'learning') return `${base} word-learning`;
    if (status === 'known') return `${base} word-known`;
    return base;
  };
  
  return (
    <span
      className={getClassName()}
      onClick={() => onSelect(word)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(word)}
    >
      {word}
    </span>
  );
}
```

**Vocabulary Popup (Desktop):**
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVocabularyLookup, useAddVocabulary } from '@/hooks/useVocabulary';

function VocabularyPopup({ word, onClose }: Props) {
  const { data: definition, isLoading } = useVocabularyLookup(word);
  const addVocabulary = useAddVocabulary();
  
  const handleAddToVocabulary = async () => {
    await addVocabulary.mutateAsync({
      word,
      definition: definition.definition,
      translation_vi: definition.translation_vi
    });
    
    toast.success('Added to vocabulary!');
  };
  
  return (
    <div className="vocabulary-popup">
      <div className="popup-header">
        <h3 className="word-text">{word}</h3>
        <button onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="popup-content">
          <div className="pronunciation">
            <span className="ipa">/{definition.pronunciation}/</span>
            <button className="play-audio" onClick={() => playAudio(definition.audio_url)}>
              🔊
            </button>
          </div>
          
          <div className="definition-section">
            <h4>Definition:</h4>
            <p>{definition.definition}</p>
          </div>
          
          <div className="translation-section">
            <h4>Tiếng Việt:</h4>
            <p>{definition.translation_vi}</p>
          </div>
          
          {definition.example_sentence && (
            <div className="example-section">
              <h4>Example:</h4>
              <p className="example">{definition.example_sentence}</p>
            </div>
          )}
          
          <button
            onClick={handleAddToVocabulary}
            className="btn-primary"
            disabled={addVocabulary.isLoading}
          >
            ➕ Add to Vocabulary
          </button>
        </div>
      )}
    </div>
  );
}
```

**Word Status CSS:**
```css
.word {
  cursor: pointer;
  transition: background-color 0.15s ease;
  padding: 2px 0;
  border-radius: 2px;
}

.word:hover {
  background-color: rgba(255, 193, 7, 0.15);
}

/* Color-coded status */
.word-new {
  color: #0d6efd; /* Blue */
  border-bottom: 2px dotted #0d6efd;
}

.word-learning {
  background-color: #fff3cd; /* Yellow background */
  padding: 2px 4px;
  border-radius: 3px;
}

.word-known {
  color: #198754; /* Green text */
  font-weight: 500;
}
```

**Priority:** P0 (Critical)  
**Effort:** 20-24 hours  
**Dependencies:** Vocabulary database, dictionary API

---

#### 3. Exercise Type: Multiple Choice

**Why:** Fundamental comprehension check, confidence builder for beginners

**How:**
- Display question about passage
- Show 4 answer options (randomized order)
- User selects one → immediate visual feedback
- Show explanation for correct answer

**Component:**
```tsx
function MultipleChoiceExercise({ exercise, onComplete }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    if (selectedIndex === null) return;
    
    const correct = selectedIndex === exercise.correct_index;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Save result
    onComplete({
      exercise_id: exercise.id,
      user_answer: exercise.options[selectedIndex],
      correct_answer: exercise.options[exercise.correct_index],
      is_correct: correct,
      attempts: 1
    });
    
    // Confetti if correct
    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };
  
  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <span className="exercise-type">Multiple Choice</span>
      </div>
      
      <h3 className="question">{exercise.question}</h3>
      
      <div className="options">
        {exercise.options.map((option, index) => (
          <label
            key={index}
            className={cn(
              'option',
              selectedIndex === index && 'selected',
              showFeedback && index === exercise.correct_index && 'correct',
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
            <span className="option-text">{option}</span>
            
            {showFeedback && index === exercise.correct_index && (
              <CheckCircle className="icon-feedback correct" />
            )}
            {showFeedback && selectedIndex === index && !isCorrect && (
              <XCircle className="icon-feedback incorrect" />
            )}
          </label>
        ))}
      </div>
      
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="btn-primary btn-submit"
        >
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 10 : 0}
          onNext={() => {/* Move to next exercise */}}
        />
      )}
    </div>
  );
}
```

**Styling:**
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

.option:hover:not(.correct):not(.incorrect) {
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

.icon-feedback {
  margin-left: auto;
  width: 24px;
  height: 24px;
}

.icon-feedback.correct {
  color: #22c55e;
}

.icon-feedback.incorrect {
  color: #ef4444;
}
```

**Priority:** P0 (Critical)  
**Effort:** 12-16 hours  
**Dependencies:** Exercise database

---

#### 4. Exercise Type: True/False

**Why:** Simple, fast comprehension check - builds confidence

**Component:**
```tsx
function TrueFalseExercise({ exercise, onComplete }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const correct = answer === exercise.is_true;
    
    onComplete({
      exercise_id: exercise.id,
      user_answer: answer ? 'TRUE' : 'FALSE',
      correct_answer: exercise.is_true ? 'TRUE' : 'FALSE',
      is_correct: correct,
      attempts: 1
    });
    
    if (correct) {
      confetti({ particleCount: 50 });
    }
  };
  
  return (
    <div className="exercise-container text-center">
      <div className="exercise-header">
        <span className="exercise-type">True / False</span>
      </div>
      
      <h3 className="statement">{exercise.statement}</h3>
      
      {!showFeedback && (
        <div className="true-false-buttons">
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
          isCorrect={selectedAnswer === exercise.is_true}
          explanation={exercise.explanation}
          xpEarned={selectedAnswer === exercise.is_true ? 10 : 0}
          onNext={() => {/* Next */}}
        />
      )}
    </div>
  );
}
```

**Priority:** P0 (Critical)  
**Effort:** 8-12 hours  
**Dependencies:** Exercise database

---

#### 5. Exercise Type: Fill-in-the-Blank

**Why:** Tests vocabulary recall, grammar understanding

**Component:**
```tsx
function FillBlankExercise({ exercise, onComplete }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = exercise.correct_answer.toLowerCase();
    
    // Fuzzy matching (allow minor typos)
    const similarity = stringSimilarity(trimmedAnswer, correctAnswer);
    const correct = similarity > 0.85; // 85% match threshold
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    onComplete({
      exercise_id: exercise.id,
      user_answer: userAnswer,
      correct_answer: exercise.correct_answer,
      is_correct: correct,
      attempts: 1
    });
  };
  
  const handleWordBankClick = (word: string) => {
    setUserAnswer(word);
  };
  
  // Split sentence into parts around blank
  const parts = exercise.sentence.split('_____');
  
  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <span className="exercise-type">Fill in the Blank</span>
      </div>
      
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
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        
        <span>{parts[1]}</span>
      </div>
      
      {exercise.word_bank && (
        <div className="word-bank">
          <p className="hint-text">Tap a word to fill:</p>
          <div className="word-tiles">
            {exercise.word_bank.map((word, index) => (
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
          className="btn-primary btn-submit"
        >
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          userAnswer={userAnswer}
          correctAnswer={exercise.correct_answer}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 10 : 0}
          onNext={() => {/* Next */}}
        />
      )}
    </div>
  );
}

// Helper: String similarity (Levenshtein distance)
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
```

**Priority:** P0 (Critical)  
**Effort:** 16-20 hours  
**Dependencies:** Exercise database, fuzzy matching logic

---

#### 6. Exercise Type: Sequencing (Drag & Drop)

**Why:** Tests comprehension of narrative flow, paragraph structure

**Component:**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SequencingExercise({ exercise, onComplete }: Props) {
  const [items, setItems] = useState(exercise.sentences);
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
    const correctOrder = exercise.correct_order;
    
    const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    onComplete({
      exercise_id: exercise.id,
      user_answer: currentOrder.join(','),
      correct_answer: correctOrder.join(','),
      is_correct: correct,
      attempts: 1
    });
  };
  
  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <span className="exercise-type">Sequencing</span>
      </div>
      
      <h3 className="instruction">Put these sentences in order:</h3>
      
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} text={item.text} />
          ))}
        </SortableContext>
      </DndContext>
      
      {!showFeedback && (
        <button onClick={handleSubmit} className="btn-primary btn-submit">
          Check Answer
        </button>
      )}
      
      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 15 : 0}
          onNext={() => {/* Next */}}
        />
      )}
    </div>
  );
}

function SortableItem({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      <span className="item-text">{text}</span>
    </div>
  );
}
```

**Styling:**
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
  transition: all 0.2s ease;
}

.sortable-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

**Priority:** P0 (Critical)  
**Effort:** 18-22 hours  
**Dependencies:** @dnd-kit library, exercise database

---

#### 7. Feedback System (Success/Error States)

**Why:** Immediate feedback drives learning, motivates users

**Component:**
```tsx
function FeedbackCard({ isCorrect, userAnswer, correctAnswer, explanation, xpEarned, onNext }: Props) {
  if (isCorrect) {
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
        
        {explanation && (
          <div className="explanation">
            <Lightbulb className="icon-small" />
            <p>{explanation}</p>
          </div>
        )}
        
        <div className="xp-badge">
          <Star className="star-icon" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            +{xpEarned} XP
          </motion.span>
        </div>
        
        <button onClick={onNext} className="btn-primary">
          Continue →
        </button>
      </motion.div>
    );
  }
  
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
      
      {userAnswer && (
        <div className="answer-comparison">
          <div className="answer-row">
            <span className="label">Your answer:</span>
            <span className="value incorrect">{userAnswer}</span>
          </div>
          
          <div className="answer-row">
            <span className="label">Correct answer:</span>
            <span className="value correct">{correctAnswer}</span>
          </div>
        </div>
      )}
      
      {explanation && (
        <div className="explanation">
          <Lightbulb className="icon-small" />
          <p>{explanation}</p>
        </div>
      )}
      
      <button onClick={onNext} className="btn-primary">
        Continue →
      </button>
    </motion.div>
  );
}
```

**Styling:**
```css
.feedback-card {
  padding: 24px;
  border-radius: 12px;
  margin-top: 24px;
  text-align: center;
}

.feedback-card.success {
  background-color: #dcfce7;
  border: 2px solid #22c55e;
}

.feedback-card.error {
  background-color: #fee2e2;
  border: 2px solid #ef4444;
}

.icon-large {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.feedback-card.success .icon-large {
  color: #22c55e;
}

.feedback-card.error .icon-large {
  color: #ef4444;
}

.xp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #fef3c7;
  border-radius: 20px;
  margin: 16px 0;
  font-weight: 600;
  color: #92400e;
}
```

**Priority:** P0 (Critical)  
**Effort:** 12-16 hours  
**Dependencies:** Exercise completion handler

---

### Should-Have (Phases 4-5)

#### 8. Spaced Repetition Flashcards (SRS)

**Why:** Scientific method for vocabulary retention - proven by Anki, Duolingo

**Algorithm: SuperMemo 2**
```tsx
interface VocabularyCard {
  word: string;
  ease_factor: number; // 1.3 - 2.5
  interval_days: number; // Days until next review
  repetition_count: number;
  next_review: Date;
}

function calculateNextReview(
  card: VocabularyCard,
  performanceRating: number // 1 (forgot) to 5 (perfect)
): VocabularyCard {
  let { ease_factor, interval_days, repetition_count } = card;
  
  if (performanceRating >= 3) {
    // Correct answer
    ease_factor = Math.max(
      1.3,
      ease_factor + (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02))
    );
    
    repetition_count++;
    
    // Calculate new interval
    if (repetition_count === 1) {
      interval_days = 1;
    } else if (repetition_count === 2) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  } else {
    // Incorrect - reset
    repetition_count = 0;
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  }
  
  const next_review = new Date();
  next_review.setDate(next_review.getDate() + interval_days);
  
  return {
    ...card,
    ease_factor,
    interval_days,
    repetition_count,
    next_review
  };
}
```

**Flashcard Component:**
```tsx
function FlashcardReview({ userId }: Props) {
  const { data: dueCards } = useQuery(['flashcards-due', userId], async () => {
    const { data } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })
      .limit(20);
    
    return data;
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  if (!dueCards || dueCards.length === 0) {
    return <div>No cards due today! 🎉</div>;
  }
  
  const currentCard = dueCards[currentIndex];
  
  const handleRating = async (rating: number) => {
    const updated = calculateNextReview(currentCard, rating);
    
    await supabase
      .from('user_vocabulary')
      .update({
        ease_factor: updated.ease_factor,
        interval_days: updated.interval_days,
        review_count: updated.repetition_count,
        last_reviewed: new Date(),
        next_review: updated.next_review
      })
      .eq('id', currentCard.id);
    
    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Review complete!
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="flashcard-review">
      <div className="progress">
        {currentIndex + 1} / {dueCards.length}
      </div>
      
      <div className="flashcard">
        <div className="card-front">
          <h2 className="word">{currentCard.word}</h2>
          
          {!showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="btn-primary"
            >
              Show Answer
            </button>
          )}
        </div>
        
        {showAnswer && (
          <div className="card-back">
            <div className="pronunciation">/{currentCard.pronunciation}/</div>
            <div className="definition">{currentCard.definition}</div>
            <div className="translation">{currentCard.translation_vi}</div>
            
            <div className="rating-buttons">
              <p>How well did you know this word?</p>
              
              <button onClick={() => handleRating(1)} className="btn-rating">
                1 - Forgot
              </button>
              <button onClick={() => handleRating(3)} className="btn-rating">
                3 - Hard
              </button>
              <button onClick={() => handleRating(4)} className="btn-rating">
                4 - Good
              </button>
              <button onClick={() => handleRating(5)} className="btn-rating">
                5 - Perfect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Priority:** P1 (Important)  
**Effort:** 24-30 hours  
**Dependencies:** Vocabulary system

---

#### 9. Progress Tracking Dashboard

**Why:** Shows improvement, identifies weak areas, motivates continued practice

**Component:**
```tsx
function ReadingDashboard({ userId }: Props) {
  const { data: stats } = useQuery(['reading-stats', userId], async () => {
    // Overall stats
    const { data: overall } = await supabase.rpc('get_reading_stats', {
      p_user_id: userId
    });
    
    // Performance by CEFR level
    const { data: byLevel } = await supabase
      .from('reading_attempts')
      .select(`
        *,
        reading_passages!inner(cefr_level)
      `)
      .eq('user_id', userId);
    
    const levelStats = byLevel.reduce((acc, attempt) => {
      const level = attempt.reading_passages.cefr_level;
      if (!acc[level]) {
        acc[level] = { attempts: 0, totalAccuracy: 0 };
      }
      acc[level].attempts++;
      acc[level].totalAccuracy += attempt.accuracy_percentage;
      return acc;
    }, {});
    
    return {
      overall,
      byLevel: Object.entries(levelStats).map(([level, stats]) => ({
        level,
        attempts: stats.attempts,
        avgAccuracy: stats.totalAccuracy / stats.attempts
      }))
    };
  });
  
  return (
    <div className="dashboard">
      <h1>Your Reading Progress</h1>
      
      {/* Summary Stats */}
      <div className="stats-grid">
        <StatCard
          title="Passages Completed"
          value={stats.overall.passages_completed}
          icon={<BookOpen />}
        />
        <StatCard
          title="Average Accuracy"
          value={`${stats.overall.avg_accuracy.toFixed(1)}%`}
          icon={<CheckCircle />}
        />
        <StatCard
          title="Total Reading Time"
          value={`${Math.round(stats.overall.total_minutes)} min`}
          icon={<Clock />}
        />
        <StatCard
          title="Vocabulary Learned"
          value={stats.overall.vocabulary_count}
          icon={<Brain />}
        />
      </div>
      
      {/* Performance by Level */}
      <div className="chart-container">
        <h2>Performance by CEFR Level</h2>
        <BarChart
          data={stats.byLevel}
          xKey="level"
          yKey="avgAccuracy"
          color="#3b82f6"
        />
      </div>
      
      {/* Vocabulary Due */}
      <div className="vocab-section">
        <h2>Vocabulary Review</h2>
        <p>{stats.overall.vocab_due_today} words due for review today</p>
        <Link href="/flashcards">
          <button className="btn-primary">Review Now</button>
        </Link>
      </div>
    </div>
  );
}
```

**Priority:** P1 (Important)  
**Effort:** 20-24 hours  
**Dependencies:** Progress tracking data

---

## 🛠 Technical Requirements

### Frontend Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (fast builds, hot reload)
- **State Management:**
  - React Query (server state, caching)
  - Zustand (UI state, vocabulary preferences)
- **UI Components:** Shadcn UI (accessible, customizable)
- **Styling:** Tailwind CSS (utility-first)
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **Drag & Drop:** @dnd-kit
- **Confetti:** canvas-confetti

### Backend Stack
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (email/password, Google OAuth)
- **Storage:** Supabase Storage (future: audio files)
- **Caching:** Upstash Redis
- **File Storage:** Cloudflare R2 (audio files, cheap)
- **Optional:** Google Cloud Text-to-Speech (Phase 2+)

### Infrastructure
- **Frontend Hosting:** Vercel (automatic deployments, edge network)
- **Database Hosting:** Supabase Cloud
- **CDN:** Cloudflare (automatic with R2)
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Plausible (privacy-friendly)

---

## 🎨 UX Requirements

### Design System
- **Colors:**
  - Primary: #3b82f6 (Blue)
  - Success: #22c55e (Green)
  - Error: #ef4444 (Red)
  - Warning: #f59e0b (Amber)
  - Neutral: #64748b (Slate)
  
- **Typography:**
  - Headings: Inter (600, 700)
  - Body: Inter (400, 500)
  - Monospace: JetBrains Mono (code)
  
- **Spacing:** 4px base (4, 8, 12, 16, 24, 32, 48, 64)
- **Border Radius:** 8px (cards), 6px (buttons), 4px (inputs)

### Responsive Breakpoints
- Mobile: <640px
- Tablet: 640-1024px
- Desktop: >1024px

### Accessibility (WCAG 2.1 AA)
- Color contrast: 4.5:1 minimum
- Keyboard navigation: All features accessible via keyboard
- Screen reader support: ARIA labels, live regions
- Focus indicators: 2px solid outline
- Reduced motion: Respect prefers-reduced-motion

---

## 📅 Timeline Estimate

### Phase 1: Foundation (Weeks 1-4)
**Tasks:**
- Setup project (React + Vite + Tailwind)
- Configure Supabase (database, auth)
- Create database schema
- Seed 20 sample passages
- Implement passage display + interactive text
- Build 4 exercise types
- User authentication
- Deploy staging

**Deliverables:**
- Working passage reader
- 4 exercise types functional
- 20 passages with exercises
- User accounts working

**Effort:** 160 hours (3 devs × ~53 hrs)

---

### Phase 2: Vocabulary & SRS (Weeks 5-8)
**Tasks:**
- Vocabulary cloud sync (Supabase)
- SRS algorithm implementation
- Flashcard review interface
- Color-coded word status
- Add 30 more passages (total 50)

**Deliverables:**
- Vocabulary system working
- SRS flashcards functional
- 50 total passages

**Effort:** 160 hours

---

### Phase 3: Gamification (Weeks 9-12)
**Tasks:**
- XP system + animations
- Daily streak tracking
- Achievement badges
- Analytics dashboard
- Add 20 more passages (total 70)

**Deliverables:**
- Gamification live
- Analytics dashboard
- 70 passages (A1-C1 complete)

**Effort:** 160 hours

---

### Phase 4: Polish (Weeks 13-16)
**Tasks:**
- Performance optimization
- WCAG 2.1 AA compliance
- Keyboard navigation
- Offline mode (Service Worker)
- Mobile gestures

**Deliverables:**
- Lighthouse >90
- WCAG compliant
- Offline mode working

**Effort:** 160 hours

---

### Phase 5: Advanced Features (Weeks 17-20)
**Tasks:**
- Teacher/parent dashboards
- Text-to-Speech (Google Cloud TTS)
- Adaptive difficulty
- Exam prep passages (IELTS/TOEIC)

**Deliverables:**
- Teacher tools functional
- TTS working
- Exam prep section

**Effort:** 200 hours

---

### Phase 6: Launch Prep (Weeks 21-24)
**Tasks:**
- Final QA (cross-browser, mobile)
- Load testing
- Security audit
- Marketing materials
- Production deployment

**Deliverables:**
- Production site live
- Marketing ready
- Launch announcement

**Effort:** 240 hours

---

### **Total Timeline: 24 weeks (6 months)**
### **Total Effort: 1,080 hours**

---

## 💵 Resource Requirements

### Development Team
| Role | Duration | Rate | Cost |
|------|----------|------|------|
| Senior Frontend Dev (×2) | 24 weeks | $80/hr × 40hr/wk | $153,600 |
| Senior Backend Dev | 24 weeks | $80/hr × 40hr/wk | $76,800 |
| Content Creator | 16 weeks | $50/hr × 40hr/wk | $32,000 |
| QA Engineer | 4 weeks | $60/hr × 40hr/wk | $9,600 |
| **Total Salary** | | | **$272,000** |

### Infrastructure (Monthly)
| Service | Usage | Cost |
|---------|-------|------|
| Cloudflare R2 | 50GB storage | $0.75 |
| Supabase Pro | 8GB database | $25 |
| Upstash Redis | 1GB | $10 |
| Google Cloud TTS | 10k users | $450 |
| Vercel Pro | Next.js hosting | $20 |
| Sentry | Error tracking | $26 |
| **Total** | | **~$532/month** |

**First 6 months infrastructure:** $532 × 6 = **$3,192**

### Content Creation
- Voice actors: $500/hr × 10hr = $5,000
- Transcription: $1/min × 300min = $300
- **Total:** $5,300

### **Grand Total: ~$280,000**

---

## 🎯 Success Metrics

### User Engagement
- DAU: 5,000 (Month 1) → 50,000 (Month 12)
- Avg session: >12 minutes
- Exercises/session: >6
- 7-day retention: >40%
- 30-day retention: >25%

### Learning Outcomes
- Reading accuracy improvement: >20% after 20 passages
- Vocabulary retention: >80% after SRS reviews
- User-reported confidence: >60% feel more confident

### Technical Performance
- Page load (p95): <2 seconds
- Lighthouse: >90 all categories
- Uptime: >99.5%

### Business Metrics
- Free-to-paid conversion: >15%
- Monthly churn: <5%
- LTV:CAC ratio: >3:1

---

## 🚧 Risk Mitigation

### Risk 1: Low User Adoption
**Mitigation:** Pre-launch waitlist, influencer partnerships, school pilots
**Contingency:** Pivot to B2B (school licenses)

### Risk 2: High Churn
**Mitigation:** Onboarding flow, engagement hooks, value reinforcement
**Contingency:** Focus on annual plans

### Risk 3: Competitor Response
**Mitigation:** Speed to market, deep specialization, community
**Contingency:** Emphasize price + teacher tools

### Risk 4: Technical Scalability
**Mitigation:** Proven stack, load testing, caching, CDN
**Contingency:** Upgrade Supabase, add read replicas

---

## ✅ Next Steps

### Week 1 (Immediate)
1. ✅ Review and approve action plan
2. ✅ Assemble team (2 frontend, 1 backend)
3. ✅ Setup repository (GitHub)
4. ✅ Initialize React + Vite project
5. ✅ Create Supabase project
6. ✅ Setup Cloudflare R2
7. ✅ Schedule kickoff meeting

### Week 2-4 (Phase 1 Execution)
1. Implement passage display
2. Build interactive text component
3. Create 4 exercise types
4. Setup database + seed data
5. User authentication
6. Deploy staging
7. Weekly standups (Monday 10am)

---

## 📚 Additional Resources

### Documentation
- **React Docs:** https://react.dev/
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn UI:** https://ui.shadcn.com/
- **@dnd-kit:** https://dndkit.com/

### Design References
- **Duolingo:** https://www.duolingo.com/
- **LingQ:** https://www.lingq.com/
- **Beelinguapp:** https://www.beelinguapp.com/

### Code Examples
- **React Query:** https://tanstack.com/query/latest
- **Framer Motion:** https://www.framer.com/motion/

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** Ready for Development  
**Prepared by:** DMF Research Team

**Questions? Contact:**
- Technical Lead: [TBD]
- Product Manager: [TBD]
- Project Manager: [TBD]
