# Frontend Developer - Listening Module Phase 1

**Role:** UI Components, Audio Player, Exercise Flows  
**Duration:** Weeks 1-8 (40-48 hours total)  
**Priority:** HIGH (user-facing features)

---

## 🎯 Your Mission

Build the audio player, create 4 exercise type components, implement feedback system, progress tracking UI, and ensure responsive design for the Listening Module.

---

## ✅ Task Checklist

### **Week 1-2: Audio Player Foundation**

- [ ] **Task 1.1: Install audio dependencies**
  - **Packages:**
    ```bash
    npm install howler
    npm install --save-dev @types/howler
    ```
  - **Purpose:** Howler.js for cross-browser audio playback
  - **Duration:** 15 minutes

- [ ] **Task 1.2: Create AudioPlayer component**
  - **File:** `components/listening/AudioPlayer.tsx`
  - **Features:**
    - Play/Pause button
    - Replay button (restart from 0:00)
    - Progress bar (shows current time / total duration)
    - Speed controls (0.75x, 1x, 1.25x)
    - Loading state (skeleton while audio loads)
  - **Code:**
    ```tsx
    import { useState, useEffect, useRef } from 'react';
    import { Howl } from 'howler';
    import { Play, Pause, RotateCcw } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    
    interface AudioPlayerProps {
      audioUrl: string;
      onPlayComplete?: () => void;
    }
    
    export function AudioPlayer({ audioUrl, onPlayComplete }: AudioPlayerProps) {
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentTime, setCurrentTime] = useState(0);
      const [duration, setDuration] = useState(0);
      const [playbackRate, setPlaybackRate] = useState(1.0);
      const [isLoading, setIsLoading] = useState(true);
      
      const audioRef = useRef<Howl | null>(null);
      const intervalRef = useRef<NodeJS.Timeout | null>(null);
      
      useEffect(() => {
        audioRef.current = new Howl({
          src: [audioUrl],
          html5: true,
          rate: playbackRate,
          onload: () => {
            setDuration(audioRef.current!.duration());
            setIsLoading(false);
          },
          onplay: () => setIsPlaying(true),
          onpause: () => setIsPlaying(false),
          onend: () => {
            setIsPlaying(false);
            onPlayComplete?.();
          },
        });
        
        return () => {
          audioRef.current?.unload();
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }, [audioUrl, playbackRate, onPlayComplete]);
      
      useEffect(() => {
        if (isPlaying) {
          intervalRef.current = setInterval(() => {
            setCurrentTime(audioRef.current?.seek() || 0);
          }, 100);
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }, [isPlaying]);
      
      const togglePlay = () => {
        if (isPlaying) {
          audioRef.current?.pause();
        } else {
          audioRef.current?.play();
        }
      };
      
      const replay = () => {
        audioRef.current?.seek(0);
        audioRef.current?.play();
      };
      
      const changeSpeed = (rate: number) => {
        setPlaybackRate(rate);
        audioRef.current?.rate(rate);
      };
      
      if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />;
      }
      
      return (
        <div className="audio-player bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={togglePlay}
              size="icon"
              variant="default"
              className="h-12 w-12"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button
              onClick={replay}
              size="icon"
              variant="outline"
              className="h-10 w-10"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            {[0.75, 1, 1.25].map((rate) => (
              <Button
                key={rate}
                onClick={() => changeSpeed(rate)}
                size="sm"
                variant={playbackRate === rate ? 'default' : 'outline'}
                className="text-xs"
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      );
    }
    
    function formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    ```
  - **Duration:** 4 hours

- [ ] **Task 1.3: Add keyboard shortcuts**
  - **Shortcuts:**
    - **Space:** Toggle play/pause
    - **R:** Replay
    - **1, 2, 3:** Change speed (0.75x, 1x, 1.25x)
  - **Implementation:** Add event listener in component
    ```tsx
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        } else if (e.code === 'KeyR') {
          replay();
        } else if (e.code === 'Digit1') {
          changeSpeed(0.75);
        } else if (e.code === 'Digit2') {
          changeSpeed(1);
        } else if (e.code === 'Digit3') {
          changeSpeed(1.25);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying]);
    ```
  - **Duration:** 1 hour

- [ ] **Task 1.4: Test audio player**
  - **Manual testing:**
    - Load component with sample MP3
    - Verify play/pause works
    - Verify replay restarts audio
    - Verify speed controls work (0.75x, 1x, 1.25x)
    - Verify keyboard shortcuts work
    - Test on Chrome, Firefox, Safari
  - **Duration:** 1 hour

---

### **Week 3-4: Exercise Type Components**

- [ ] **Task 2.1: Create DictationExercise component**
  - **File:** `components/listening/exercises/DictationExercise.tsx`
  - **Features:**
    - AudioPlayer (integrated)
    - Text input field (autofocus)
    - Submit button
    - Character count (optional)
  - **Code:**
    ```tsx
    import { useState } from 'react';
    import { AudioPlayer } from '../AudioPlayer';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    
    interface DictationExerciseProps {
      exerciseId: string;
      audioUrl: string;
      onSubmit: (answer: string) => void;
    }
    
    export function DictationExercise({ exerciseId, audioUrl, onSubmit }: DictationExerciseProps) {
      const [userAnswer, setUserAnswer] = useState('');
      
      const handleSubmit = () => {
        if (userAnswer.trim()) {
          onSubmit(userAnswer.trim());
        }
      };
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🎧 Listen and Type</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type what you hear in the audio
            </p>
          </div>
          
          <AudioPlayer audioUrl={audioUrl} />
          
          <div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {userAnswer.length} characters
            </p>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="w-full"
            size="lg"
          >
            Check Answer
          </Button>
        </div>
      );
    }
    ```
  - **Duration:** 3 hours

- [ ] **Task 2.2: Create MultipleChoiceExercise component**
  - **File:** `components/listening/exercises/MultipleChoiceExercise.tsx`
  - **Features:**
    - AudioPlayer
    - Question text
    - 4 option buttons (A, B, C, D)
    - Selected state (highlight)
  - **Code:**
    ```tsx
    import { useState } from 'react';
    import { AudioPlayer } from '../AudioPlayer';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';
    
    interface MultipleChoiceExerciseProps {
      exerciseId: string;
      audioUrl: string;
      question: string;
      options: string[];
      onSubmit: (selectedIndex: number) => void;
    }
    
    export function MultipleChoiceExercise({
      exerciseId,
      audioUrl,
      question,
      options,
      onSubmit,
    }: MultipleChoiceExerciseProps) {
      const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
      
      const handleSubmit = () => {
        if (selectedIndex !== null) {
          onSubmit(selectedIndex);
        }
      };
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">📝 Listen and Choose</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{question}</p>
          </div>
          
          <AudioPlayer audioUrl={audioUrl} />
          
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="w-full"
            size="lg"
          >
            Check Answer
          </Button>
        </div>
      );
    }
    ```
  - **Duration:** 3 hours

- [ ] **Task 2.3: Create AudioImageMatchingExercise component**
  - **File:** `components/listening/exercises/AudioImageMatchingExercise.tsx`
  - **Features:**
    - AudioPlayer
    - 4-6 images in grid
    - Selected state (border highlight)
    - Alt text for accessibility
  - **Code:**
    ```tsx
    import { useState } from 'react';
    import { AudioPlayer } from '../AudioPlayer';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';
    import Image from 'next/image';
    
    interface AudioImageMatchingExerciseProps {
      exerciseId: string;
      audioUrl: string;
      images: Array<{ id: string; url: string; alt: string }>;
      onSubmit: (selectedImageId: string) => void;
    }
    
    export function AudioImageMatchingExercise({
      exerciseId,
      audioUrl,
      images,
      onSubmit,
    }: AudioImageMatchingExerciseProps) {
      const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
      
      const handleSubmit = () => {
        if (selectedImageId) {
          onSubmit(selectedImageId);
        }
      };
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🖼️ Listen and Match</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select the image that matches what you hear
            </p>
          </div>
          
          <AudioPlayer audioUrl={audioUrl} />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border-4 transition-all',
                  selectedImageId === image.id
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedImageId}
            className="w-full"
            size="lg"
          >
            Check Answer
          </Button>
        </div>
      );
    }
    ```
  - **Duration:** 3 hours

- [ ] **Task 2.4: Create FillInTheBlankExercise component**
  - **File:** `components/listening/exercises/FillInTheBlankExercise.tsx`
  - **Features:**
    - AudioPlayer
    - Transcript with blanks (_____)
    - Dropdown or text input for each blank
    - Multiple blanks support
  - **Code:**
    ```tsx
    import { useState } from 'react';
    import { AudioPlayer } from '../AudioPlayer';
    import { Button } from '@/components/ui/button';
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from '@/components/ui/select';
    
    interface Blank {
      id: string;
      options: string[];
      correctAnswer: string;
    }
    
    interface FillInTheBlankExerciseProps {
      exerciseId: string;
      audioUrl: string;
      transcript: string; // e.g., "Hello, _____ are you?"
      blanks: Blank[];
      onSubmit: (answers: Record<string, string>) => void;
    }
    
    export function FillInTheBlankExercise({
      exerciseId,
      audioUrl,
      transcript,
      blanks,
      onSubmit,
    }: FillInTheBlankExerciseProps) {
      const [answers, setAnswers] = useState<Record<string, string>>({});
      
      const handleSubmit = () => {
        if (Object.keys(answers).length === blanks.length) {
          onSubmit(answers);
        }
      };
      
      const parts = transcript.split('_____');
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">✍️ Fill in the Blanks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete the transcript by selecting the correct words
            </p>
          </div>
          
          <AudioPlayer audioUrl={audioUrl} />
          
          <div className="text-lg leading-relaxed">
            {parts.map((part, index) => (
              <span key={index}>
                {part}
                {index < blanks.length && (
                  <Select
                    value={answers[blanks[index].id] || ''}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [blanks[index].id]: value })
                    }
                  >
                    <SelectTrigger className="inline-flex w-32 mx-1">
                      <SelectValue placeholder="?" />
                    </SelectTrigger>
                    <SelectContent>
                      {blanks[index].options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </span>
            ))}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== blanks.length}
            className="w-full"
            size="lg"
          >
            Check Answer
          </Button>
        </div>
      );
    }
    ```
  - **Duration:** 4 hours

---

### **Week 5-6: Feedback & Progress UI**

- [ ] **Task 3.1: Create FeedbackCard component**
  - **File:** `components/listening/FeedbackCard.tsx`
  - **Features:**
    - Correct state (green, checkmark, celebration)
    - Incorrect state (red, X, show correct answer)
    - Partial credit state (yellow, score display)
    - XP earned animation
  - **Code:**
    ```tsx
    import { CheckCircle, XCircle, Star } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    
    interface FeedbackCardProps {
      correct: boolean;
      accuracyScore: number;
      feedback: string;
      xpEarned: number;
      expectedAnswer?: string;
      userAnswer?: string;
      onContinue: () => void;
    }
    
    export function FeedbackCard({
      correct,
      accuracyScore,
      feedback,
      xpEarned,
      expectedAnswer,
      userAnswer,
      onContinue,
    }: FeedbackCardProps) {
      if (correct && accuracyScore === 100) {
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6 text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
              Perfect! 🎉
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{feedback}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold">+{xpEarned} XP</span>
            </div>
            <Button onClick={onContinue} size="lg" className="w-full">
              Continue
            </Button>
          </motion.div>
        );
      }
      
      if (!correct) {
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6"
          >
            <div className="text-center mb-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4 animate-shake" />
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                Not Quite
              </h3>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-500 mb-1">Your Answer:</p>
                <p className="text-red-600 dark:text-red-400">{userAnswer}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-500 mb-1">Correct Answer:</p>
                <p className="text-green-600 dark:text-green-400">{expectedAnswer}</p>
              </div>
            </div>
            
            <Button onClick={onContinue} size="lg" className="w-full">
              Continue
            </Button>
          </motion.div>
        );
      }
      
      // Partial credit
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6 text-center"
        >
          <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
            Good Try!
          </h3>
          <p className="text-lg mb-2">Accuracy: {accuracyScore}%</p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{feedback}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold">+{xpEarned} XP</span>
          </div>
          <Button onClick={onContinue} size="lg" className="w-full">
            Continue
          </Button>
        </motion.div>
      );
    }
    ```
  - **Duration:** 4 hours

- [ ] **Task 3.2: Create SessionProgress component**
  - **File:** `components/listening/SessionProgress.tsx`
  - **Features:**
    - Current exercise / total exercises (8 / 15)
    - Progress bar (visual)
    - Optional: Exercises remaining
  - **Code:**
    ```tsx
    interface SessionProgressProps {
      current: number;
      total: number;
    }
    
    export function SessionProgress({ current, total }: SessionProgressProps) {
      const percentage = (current / total) * 100;
      
      return (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{current} / {total}</span>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    }
    ```
  - **Duration:** 1 hour

- [ ] **Task 3.3: Create OverallProgress component (dashboard widget)**
  - **File:** `components/listening/OverallProgress.tsx`
  - **Features:**
    - Total exercises completed
    - Average accuracy
    - Total listening time (minutes)
    - Current streak (days)
  - **Code:**
    ```tsx
    import { Clock, Target, TrendingUp, Flame } from 'lucide-react';
    
    interface OverallProgressProps {
      totalExercises: number;
      averageAccuracy: number;
      listeningTimeSeconds: number;
      currentStreak: number;
    }
    
    export function OverallProgress({
      totalExercises,
      averageAccuracy,
      listeningTimeSeconds,
      currentStreak,
    }: OverallProgressProps) {
      const listeningMinutes = Math.floor(listeningTimeSeconds / 60);
      
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold">{totalExercises}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
            </div>
            <p className="text-2xl font-bold">{averageAccuracy.toFixed(0)}%</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Time</span>
            </div>
            <p className="text-2xl font-bold">{listeningMinutes} min</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
            </div>
            <p className="text-2xl font-bold">{currentStreak} days</p>
          </div>
        </div>
      );
    }
    ```
  - **Duration:** 2 hours

---

### **Week 7-8: Polish & Responsive Design**

- [ ] **Task 4.1: Add loading states (skeletons)**
  - **Files:** Create skeleton components for each exercise type
  - **Purpose:** Show placeholders while data loads
  - **Example:**
    ```tsx
    export function ExerciseSkeleton() {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      );
    }
    ```
  - **Duration:** 2 hours

- [ ] **Task 4.2: Implement error boundaries**
  - **File:** `components/ErrorBoundary.tsx`
  - **Purpose:** Catch errors gracefully, show fallback UI
  - **Code:**
    ```tsx
    import { Component, ReactNode } from 'react';
    
    interface ErrorBoundaryProps {
      children: ReactNode;
      fallback?: ReactNode;
    }
    
    interface ErrorBoundaryState {
      hasError: boolean;
    }
    
    export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
      constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
      }
      
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      
      componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
      }
      
      render() {
        if (this.state.hasError) {
          return this.props.fallback || (
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="text-blue-500 underline"
              >
                Try again
              </button>
            </div>
          );
        }
        
        return this.props.children;
      }
    }
    ```
  - **Usage:** Wrap exercise components in ErrorBoundary
  - **Duration:** 1 hour

- [ ] **Task 4.3: Responsive design testing**
  - **Breakpoints to test:**
    - Mobile (\< 640px): Single column, large buttons
    - Tablet (640-1024px): 2-column layouts
    - Desktop (\> 1024px): Max-width 800px centered
  - **Tools:** Use Chrome DevTools responsive mode
  - **Adjustments:** Tweak spacing, font sizes, button sizes
  - **Duration:** 3 hours

- [ ] **Task 4.4: Accessibility audit**
  - **Checklist:**
    - [ ] All buttons have aria-labels
    - [ ] Audio player controls keyboard accessible
    - [ ] Focus indicators visible (2px outline)
    - [ ] Color contrast \u003e 4.5:1 (text)
    - [ ] Screen reader friendly (test with VoiceOver/NVDA)
    - [ ] Tab order logical
  - **Tool:** Use axe DevTools browser extension
  - **Duration:** 3 hours

- [ ] **Task 4.5: Animation polish**
  - **Target:** 60fps smooth animations
  - **Optimizations:**
    - Use CSS transforms (not top/left)
    - Use will-change for animated elements
    - Debounce expensive operations
  - **Testing:** Use Chrome DevTools Performance tab
  - **Duration:** 2 hours

- [ ] **Task 4.6: Bug fixes**
  - **Priority:** Fix all critical bugs found in testing
  - **Testing:** Manual testing of all 4 exercise types
  - **Edge cases:**
    - Audio fails to load → Show error message
    - Network error on submit → Show retry button
    - Empty answer submission → Disable submit button
  - **Duration:** 4 hours

---

## 📊 Deliverables Summary

| Deliverable | File Path | Status |
|-------------|-----------|--------|
| AudioPlayer | `components/listening/AudioPlayer.tsx` | ⬜ |
| DictationExercise | `components/listening/exercises/DictationExercise.tsx` | ⬜ |
| MultipleChoiceExercise | `components/listening/exercises/MultipleChoiceExercise.tsx` | ⬜ |
| AudioImageMatchingExercise | `components/listening/exercises/AudioImageMatchingExercise.tsx` | ⬜ |
| FillInTheBlankExercise | `components/listening/exercises/FillInTheBlankExercise.tsx` | ⬜ |
| FeedbackCard | `components/listening/FeedbackCard.tsx` | ⬜ |
| SessionProgress | `components/listening/SessionProgress.tsx` | ⬜ |
| OverallProgress | `components/listening/OverallProgress.tsx` | ⬜ |
| ErrorBoundary | `components/ErrorBoundary.tsx` | ⬜ |

---

## 🎯 Success Criteria

- [ ] 9+ React components built
- [ ] Audio player working (3 speed options)
- [ ] 4 exercise types implemented
- [ ] Feedback system clear (correct/incorrect/partial)
- [ ] Keyboard shortcuts working (Space, R, 1-4)
- [ ] Loading states implemented (skeletons)
- [ ] Error boundaries working
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Animation frame rate \u003e= 60fps

---

## 🚨 Blockers & Dependencies

**Dependencies:**
- Backend Dev (Audio) must implement API endpoints first (Week 3-4)
- Design system (Shadcn UI) must be installed

**Potential Blockers:**
- Howler.js not working in Safari → Use HTML5 audio fallback
- Audio CORS errors → Check R2 bucket CORS config

**Escalation:**
- If blocked for \u003e 4 hours → Report to PM or Tech Lead

---

## 📚 Resources

**Documentation:**
- Howler.js Docs: https://howlerjs.com/
- Framer Motion Docs: https://www.framer.com/motion/
- Shadcn UI: https://ui.shadcn.com/
- React Hook Form: https://react-hook-form.com/

**Example Code:**
- See `components/vocabulary/ReviewSession.tsx` for exercise flow patterns

**Contact:**
- Backend Dev (Audio): For API response structure
- Backend Dev (SRS): For progress tracking integration
- DB Specialist: For exercise data structure

---

**Task File Version:** 1.0  
**Last Updated:** 2026-02-06  
**Owner:** Frontend Developer
