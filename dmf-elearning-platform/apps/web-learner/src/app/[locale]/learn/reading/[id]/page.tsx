'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  Brain,
  TrendingUp,
  BookMarked,
  Lightbulb,
  ChevronRight,
  Flame,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useReadingById,
  useStartReading,
  useUpdateReadingProgress,
  useCompleteReading,
  useReadingStats,
} from '@/hooks/useApiQueries';
import { useUser } from '@/providers/user-provider';
import {
  PopupDictionary,
  InteractiveText,
  type DictionarySavePayload,
} from '@/components/reading/PopupDictionary';
import { saveReadingVocabulary } from '@/services/german-api';
import {
  PageTransition,
  AnimateOnScroll,
  AnimatedCounter,
  SkeletonTransition,
  ShakeContainer,
  SuccessCheck,
} from '@/components/ui/animations';
import { cn } from '@/lib/utils';

interface ReadingPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock comprehension questions (in real app, these would come from API)
interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MOCK_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: 'q1',
    question: 'Was ist das Hauptthema des Textes?',
    options: [
      'Die Geschichte einer Familie',
      'Eine Reise nach Deutschland',
      'Deutsche Kultur und Traditionen',
      'Ein Rezept für deutsches Essen',
    ],
    correctAnswer: 0,
    explanation: 'Der Text handelt hauptsächlich von einer Familie und ihrem Alltag.',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    question: 'Welche Information ist NICHT im Text erwähnt?',
    options: [
      'Die Namen der Familienmitglieder',
      'Was sie am Wochenende machen',
      'Wo sie wohnen',
      'Ihre Lieblingsfarben',
    ],
    correctAnswer: 3,
    explanation: 'Lieblingsfarben werden im Text nicht erwähnt.',
    difficulty: 'medium',
  },
  {
    id: 'q3',
    question: 'Was können wir über die Familie schlussfolgern?',
    options: [
      'Sie sind sehr reich',
      'Sie verbringen gerne Zeit zusammen',
      'Sie leben in einer großen Stadt',
      'Sie haben viele Haustiere',
    ],
    correctAnswer: 1,
    explanation: 'Der Text zeigt, dass die Familie gerne gemeinsame Aktivitäten unternimmt.',
    difficulty: 'hard',
  },
];

export default function ReadingPracticePage({ params }: ReadingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { userId } = useUser();

  // State management
  const [isReading, setIsReading] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const [wordsLookedUp, setWordsLookedUp] = useState<Set<string>>(new Set());
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsComplete, setQuestionsComplete] = useState(false);
  const [shake, setShake] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // API hooks
  const { data: content, isLoading, error } = useReadingById(id, true);
  const { data: stats } = useReadingStats();
  const startReadingMutation = useStartReading();
  const updateProgressMutation = useUpdateReadingProgress();
  const completeReadingMutation = useCompleteReading();
  const saveReadingVocabularyMutation = useMutation({
    mutationFn: (vocab: DictionarySavePayload) =>
      saveReadingVocabulary(userId, {
        passageId: id,
        word: vocab.word,
        translation: vocab.meaning_vi,
        context: content?.title || undefined,
        sentence: vocab.example_de || undefined,
      }),
  });

  // Initialize from existing progress
  useEffect(() => {
    if (content?.userProgress) {
      setReadingTime(content.userProgress.totalReadTime);
      setWordsLookedUp(new Set(content.userProgress.wordsLookedUp || []));
      if (content.userProgress.status === 'in_progress') {
        setIsReading(true);
      }
    }
  }, [content]);

  // Reading timer
  useEffect(() => {
    if (isReading) {
      timerRef.current = setInterval(() => {
        setReadingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReading]);

  // Auto-save progress
  useEffect(() => {
    if (!isReading || !content) return;

    const saveInterval = setInterval(() => {
      updateProgressMutation.mutate({
        contentId: id,
        progress: {
          totalReadTime: readingTime,
          wordsLookedUp: Array.from(wordsLookedUp),
        },
      });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [isReading, content, id, readingTime, wordsLookedUp, updateProgressMutation]);

  const handleStartReading = useCallback(() => {
    startReadingMutation.mutate(id);
    setIsReading(true);
  }, [id, startReadingMutation]);

  const handleFinishReading = useCallback(() => {
    setIsReading(false);
    setShowQuestions(true);
  }, []);

  const handleWordClick = useCallback((word: string, position: { x: number; y: number }) => {
    setSelectedWord({ word, position });
    setWordsLookedUp((prev) => new Set(prev).add(word.toLowerCase()));
  }, []);

  const handleAddWordToReview = useCallback(
    async (vocab: DictionarySavePayload) => {
      await saveReadingVocabularyMutation.mutateAsync(vocab);
    },
    [saveReadingVocabularyMutation]
  );

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (!isCorrect) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));

    setShowExplanation(true);
  }, [selectedAnswer, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuestionsComplete(true);
      const correctCount = MOCK_QUESTIONS.filter(
        (q) => answers[q.id] === q.correctAnswer
      ).length;
      const accuracy = Math.round((correctCount / MOCK_QUESTIONS.length) * 100);

      completeReadingMutation.mutate({
        contentId: id,
        rating: accuracy >= 80 ? 5 : accuracy >= 60 ? 4 : 3,
      });
    }
  }, [currentQuestionIndex, answers, id, completeReadingMutation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToLibrary = () => {
    router.push('/learn/reading');
  };

  const isCompleted = content?.userProgress?.status === 'completed';
  const knownWords = new Set(content?.analysis?.knownWords || []);
  const correctAnswers = MOCK_QUESTIONS.filter((q) => answers[q.id] === q.correctAnswer).length;
  const accuracy = MOCK_QUESTIONS.length > 0 ? Math.round((correctAnswers / MOCK_QUESTIONS.length) * 100) : 0;

  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToLibrary}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {content?.title || 'Loading...'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {content?.level}
                    </span>
                    {isReading && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(readingTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="hidden md:flex items-center gap-3">
                  <StatBadge
                    icon={<BookMarked className="w-4 h-4" />}
                    label={`${stats.completed} completed`}
                    color="emerald"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonTransition isLoading={isLoading} skeleton={<LoadingSkeleton />}>
            {error ? (
              <ErrorState error={error} onBack={handleBackToLibrary} />
            ) : questionsComplete ? (
              <CompletionState
                content={content}
                readingTime={readingTime}
                wordsLookedUp={wordsLookedUp.size}
                correctAnswers={correctAnswers}
                totalQuestions={MOCK_QUESTIONS.length}
                accuracy={accuracy}
                onBackToLibrary={handleBackToLibrary}
              />
            ) : showQuestions ? (
              <QuestionSection
                question={MOCK_QUESTIONS[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={MOCK_QUESTIONS.length}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                onSubmit={handleSubmitAnswer}
                onNext={handleNextQuestion}
                showExplanation={showExplanation}
                shake={shake}
              />
            ) : (
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Reading Area */}
                <div className="lg:col-span-8">
                  <AnimateOnScroll variant="fadeUp">
                    <ReadingContent
                      content={content}
                      isReading={isReading}
                      isCompleted={isCompleted}
                      knownWords={knownWords}
                      onStartReading={handleStartReading}
                      onFinishReading={handleFinishReading}
                      onWordClick={handleWordClick}
                      wordsLookedUp={wordsLookedUp}
                    />
                  </AnimateOnScroll>
                </div>

                {/* Progress Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  {content?.analysis && (
                    <>
                      <AnimateOnScroll variant="fadeRight" delay={0.1}>
                        <AnalysisCard analysis={content.analysis} />
                      </AnimateOnScroll>

                      <AnimateOnScroll variant="fadeRight" delay={0.2}>
                        <ReadingTipsCard />
                      </AnimateOnScroll>
                    </>
                  )}
                </div>
              </div>
            )}
          </SkeletonTransition>
        </main>

        {/* Popup Dictionary */}
        {selectedWord && (
          <PopupDictionary
            word={selectedWord.word}
            position={selectedWord.position}
            onClose={() => setSelectedWord(null)}
            onAddToReview={handleAddWordToReview}
          />
        )}
      </div>
    </PageTransition>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Reading Content
// ═══════════════════════════════════════════════════════════════

function ReadingContent({
  content,
  isReading,
  isCompleted,
  knownWords,
  onStartReading,
  onFinishReading,
  onWordClick,
  wordsLookedUp,
}: any) {
  if (!content) return null;

  return (
    <div className="space-y-6">
      {/* Content Analysis Card */}
      {content.analysis && !isCompleted && !isReading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Content Preview
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-3xl font-bold text-emerald-600">
                {content.analysis.knownPercentage}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Known Words</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600">
                {content.analysis.unknownWords.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">New Words</p>
            </div>
          </div>

          <div className="flex justify-center">
            <span
              className={cn(
                'px-4 py-2 rounded-full font-medium',
                content.analysis.suitability === 'optimal'
                  ? 'bg-green-100 text-green-700'
                  : content.analysis.suitability === 'too_easy'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
              )}
            >
              {content.analysis.suitability === 'optimal'
                ? '✨ Perfect for your level (i+1)'
                : content.analysis.suitability === 'too_easy'
                ? '📘 Easy for you'
                : '📕 Challenging'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Start Reading Button */}
      {!isReading && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <button
            onClick={onStartReading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            Start Reading
          </button>
          <p className="text-sm text-gray-500 mt-2">Click on any word to see its definition</p>
        </motion.div>
      )}

      {/* Reading Article */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

        <div className="text-lg leading-relaxed">
          <InteractiveText
            content={content.content}
            knownWords={knownWords}
            onWordClick={isReading || isCompleted ? onWordClick : undefined}
            highlightUnknown={isReading || isCompleted}
          />
        </div>
      </motion.article>

      {/* Finish Reading Button */}
      {isReading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={onFinishReading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            Finish Reading & Answer Questions
          </button>
        </motion.div>
      )}

      {/* Words Looked Up */}
      {wordsLookedUp.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-3">
            Words You Looked Up ({wordsLookedUp.size})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(wordsLookedUp).map((word) => (
              <span
                key={String(word)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {String(word)}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Analysis Card
// ═══════════════════════════════════════════════════════════════

function AnalysisCard({ analysis }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Brain className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Content Analysis</h2>
      </div>

      <div className="space-y-4">
        <AnalysisStatRow
          label="Total Words"
          value={analysis.totalWords}
          icon={<BookOpen className="w-4 h-4" />}
        />
        <AnalysisStatRow
          label="Unique Words"
          value={analysis.uniqueWords}
          icon={<BookMarked className="w-4 h-4" />}
        />
        <AnalysisStatRow
          label="Est. Reading Time"
          value={`${analysis.estimatedReadingTime} min`}
          icon={<Clock className="w-4 h-4" />}
        />

        {/* Progress Bar */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Vocabulary Match</span>
            <span className="text-sm font-bold text-emerald-600">
              {analysis.knownPercentage}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.knownPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisStatRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Reading Tips Card
// ═══════════════════════════════════════════════════════════════

function ReadingTipsCard() {
  const tips = [
    'Click on unknown words to see definitions',
    'Read the entire text before answering questions',
    'Focus on understanding the main ideas',
    'Take notes of new vocabulary',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900">Reading Tips</h3>
      </div>

      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm text-blue-700"
          >
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{tip}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Question Section
// ═══════════════════════════════════════════════════════════════

function QuestionSection({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
  onNext,
  showExplanation,
  shake,
}: any) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const hasAnswered = showExplanation;

  return (
    <div className="max-w-3xl mx-auto">
      <AnimateOnScroll variant="scale">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {question.difficulty}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>

          {/* Options */}
          <ShakeContainer shake={shake}>
            <div className="space-y-3 mb-6">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const showCorrect = hasAnswered && isCorrectAnswer;
                const showIncorrect = hasAnswered && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => !hasAnswered && onAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all',
                      hasAnswered
                        ? showCorrect
                          ? 'bg-green-50 border-green-500'
                          : showIncorrect
                          ? 'bg-red-50 border-red-500'
                          : 'bg-gray-50 border-gray-200'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    )}
                    whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium',
                        hasAnswered
                          ? showCorrect
                            ? 'bg-green-500 border-green-500 text-white'
                            : showIncorrect
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white border-gray-300 text-gray-600'
                          : isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-gray-300 text-gray-600'
                      )}>
                        {hasAnswered && showCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : hasAnswered && showIncorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className={cn(
                        'font-medium',
                        showCorrect ? 'text-green-900' :
                        showIncorrect ? 'text-red-900' :
                        'text-gray-900'
                      )}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </ShakeContainer>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'p-4 rounded-xl mb-6',
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-full',
                    isCorrect ? 'bg-green-100' : 'bg-blue-100'
                  )}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      'font-semibold mb-1',
                      isCorrect ? 'text-green-900' : 'text-blue-900'
                    )}>
                      {isCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    <p className="text-sm text-gray-700">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showExplanation ? (
              <button
                onClick={onSubmit}
                disabled={selectedAnswer === null}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition"
              >
                {questionNumber < totalQuestions ? 'Next Question' : 'See Results'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Completion State
// ═══════════════════════════════════════════════════════════════

function CompletionState({
  content,
  readingTime,
  wordsLookedUp,
  correctAnswers,
  totalQuestions,
  accuracy,
  onBackToLibrary,
}: any) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimateOnScroll variant="scale">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl border-2 border-emerald-200 p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-emerald-900 mb-3"
          >
            Reading Complete!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-emerald-700 mb-8"
          >
            Great work on "{content?.title}"
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <CompletionStatCard
              icon={<Award />}
              label="Score"
              value={`${accuracy}%`}
              color="emerald"
            />
            <CompletionStatCard
              icon={<CheckCircle2 />}
              label="Correct"
              value={`${correctAnswers}/${totalQuestions}`}
              color="green"
            />
            <CompletionStatCard
              icon={<Clock />}
              label="Time"
              value={formatTime(readingTime)}
              color="blue"
            />
            <CompletionStatCard
              icon={<BookMarked />}
              label="New Words"
              value={wordsLookedUp}
              color="yellow"
            />
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={onBackToLibrary}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Back to Reading Library
            </button>
          </motion.div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

function CompletionStatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
      <div className={cn('inline-flex p-2 rounded-lg mb-2', colorClasses[color as keyof typeof colorClasses])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        <AnimatedCounter value={typeof value === 'string' ? value : value} />
      </p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Loading Skeleton
// ═══════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Error State
// ═══════════════════════════════════════════════════════════════

function ErrorState({ error, onBack }: any) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Content</h2>
        <p className="text-red-600 mb-6">{error?.message || 'Failed to load reading content'}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
        >
          Back to Library
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Component: Stat Badge
// ═══════════════════════════════════════════════════════════════

function StatBadge({ icon, label, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', colorClasses[color as keyof typeof colorClasses])}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
