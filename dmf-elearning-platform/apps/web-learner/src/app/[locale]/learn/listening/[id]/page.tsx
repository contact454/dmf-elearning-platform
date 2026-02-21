'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Headphones,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Award,
  Brain,
  TrendingUp,
  Volume2,
  Lightbulb,
  ChevronRight,
  Trophy,
  FileText,
  Eye,
  EyeOff,
  SkipBack,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useListeningById,
  useStartListening,
  useUpdateListeningProgress,
  useListeningStats,
} from '@/hooks/useListeningLearningQueries';
import { useUser } from '@/providers/user-provider';
import {
  PageTransition,
  AnimateOnScroll,
  AnimatedCounter,
  SkeletonTransition,
  ShakeContainer,
} from '@/components/ui/animations';
import { cn } from '@/lib/utils';

interface ListeningPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock comprehension questions
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
    question: 'Was ist das Hauptthema des Hörtextes?',
    options: [
      'Ein Gespräch über das Wetter',
      'Eine Diskussion über Familie',
      'Ein Interview über Arbeit',
      'Eine Unterhaltung über Hobbys',
    ],
    correctAnswer: 1,
    explanation: 'Der Hörtext handelt hauptsächlich von einer Familie und ihren Aktivitäten.',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    question: 'Welche Information wird NICHT erwähnt?',
    options: [
      'Die Namen der Sprecher',
      'Wo sie sich befinden',
      'Was sie planen',
      'Ihre Lieblingsfarben',
    ],
    correctAnswer: 3,
    explanation: 'Lieblingsfarben werden im Hörtext nicht erwähnt.',
    difficulty: 'medium',
  },
  {
    id: 'q3',
    question: 'Welche Schlussfolgerung können wir ziehen?',
    options: [
      'Die Sprecher sind Fremde',
      'Sie kennen sich gut',
      'Sie sind unzufrieden',
      'Sie streiten sich',
    ],
    correctAnswer: 1,
    explanation: 'Aus dem freundlichen Ton und der Art der Konversation können wir schließen, dass die Sprecher sich gut kennen.',
    difficulty: 'hard',
  },
];

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export default function ListeningPracticePage({ params }: ListeningPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { userId } = useUser();

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  // Practice state
  const [isListening, setIsListening] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsComplete, setQuestionsComplete] = useState(false);
  const [shake, setShake] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // API hooks
  const { data: content, isLoading, error } = useListeningById(id);
  const { data: stats } = useListeningStats();
  const startListeningMutation = useStartListening();
  const updateProgressMutation = useUpdateListeningProgress();

  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !content?.audioUrl) return;

    audio.src = content.audioUrl;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlayCount((prev) => prev + 1);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [content?.audioUrl]);

  // Listening timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setListeningTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Auto-save progress
  useEffect(() => {
    if (!isListening || !content) return;

    const saveInterval = setInterval(() => {
      updateProgressMutation.mutate({
        contentId: id,
        progress: {
          totalListenTime: listeningTime,
          playCount,
          lastPosition: currentTime,
        },
      });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [isListening, content, id, listeningTime, playCount, currentTime, updateProgressMutation]);

  const handleStartListening = useCallback(() => {
    startListeningMutation.mutate(id);
    setIsListening(true);
  }, [id, startListeningMutation]);

  const handleFinishListening = useCallback(() => {
    setIsListening(false);
    setShowQuestions(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleSkipBackward = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 10));
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 10));
  }, [currentTime, duration, handleSeek]);

  const handleRestart = useCallback(() => {
    handleSeek(0);
  }, [handleSeek]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

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
    }
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToLibrary = () => {
    router.push('/learn/listening');
  };

  const correctAnswers = MOCK_QUESTIONS.filter((q) => answers[q.id] === q.correctAnswer).length;
  const accuracy = MOCK_QUESTIONS.length > 0 ? Math.round((correctAnswers / MOCK_QUESTIONS.length) * 100) : 0;

  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hidden audio element */}
        <audio ref={audioRef} />

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToLibrary}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {content?.title || 'Loading...'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      {content?.level}
                    </span>
                    {isListening && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(listeningTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="hidden md:flex items-center gap-3">
                  <StatBadge
                    icon={<Headphones className="w-4 h-4" />}
                    label={`${stats.completed || 0} completed`}
                    color="indigo"
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
                listeningTime={listeningTime}
                playCount={playCount}
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
                {/* Main Listening Area */}
                <div className="lg:col-span-8">
                  <AnimateOnScroll variant="fadeUp">
                    <ListeningContent
                      content={content}
                      isListening={isListening}
                      isPlaying={isPlaying}
                      currentTime={currentTime}
                      duration={duration}
                      playbackSpeed={playbackSpeed}
                      playCount={playCount}
                      showTranscript={showTranscript}
                      onStartListening={handleStartListening}
                      onFinishListening={handleFinishListening}
                      onTogglePlayPause={togglePlayPause}
                      onSeek={handleSeek}
                      onSkipBackward={handleSkipBackward}
                      onSkipForward={handleSkipForward}
                      onRestart={handleRestart}
                      onSpeedChange={handleSpeedChange}
                      onToggleTranscript={() => setShowTranscript(!showTranscript)}
                    />
                  </AnimateOnScroll>
                </div>

                {/* Progress Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <AnimateOnScroll variant="fadeRight" delay={0.1}>
                    <StatsCard
                      playCount={playCount}
                      listeningTime={listeningTime}
                      duration={duration}
                    />
                  </AnimateOnScroll>

                  <AnimateOnScroll variant="fadeRight" delay={0.2}>
                    <ListeningTipsCard />
                  </AnimateOnScroll>
                </div>
              </div>
            )}
          </SkeletonTransition>
        </main>
      </div>
    </PageTransition>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Listening Content
// ═══════════════════════════════════════════════════════════════

function ListeningContent({
  content,
  isListening,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  playCount,
  showTranscript,
  onStartListening,
  onFinishListening,
  onTogglePlayPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onRestart,
  onSpeedChange,
  onToggleTranscript,
}: any) {
  if (!content) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Start Listening Button */}
      {!isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={onStartListening}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            Start Listening
          </button>
          <p className="text-sm text-gray-500 mt-2">Listen carefully to understand the content</p>
        </motion.div>
      )}

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Headphones className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
            {content.speaker && (
              <p className="text-sm text-gray-600">Speaker: {content.speaker}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              onSeek(percent * duration);
            }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={onRestart}
            disabled={!isListening}
            className="p-3 hover:bg-gray-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onSkipBackward}
            disabled={!isListening}
            className="p-3 hover:bg-gray-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Skip back 10s"
          >
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onTogglePlayPause}
            disabled={!isListening}
            className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onSkipForward}
            disabled={!isListening}
            className="p-3 hover:bg-gray-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Skip forward 10s"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative group">
            <button
              disabled={!isListening}
              className="p-3 hover:bg-gray-100 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Volume2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{playbackSpeed}x</span>
            </button>

            {/* Speed Options */}
            {isListening && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm rounded-lg transition',
                      playbackSpeed === speed
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Play Count */}
        {playCount > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Played <span className="font-medium text-indigo-600">{playCount}</span>{' '}
              {playCount === 1 ? 'time' : 'times'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Transcript
          </h3>
          <button
            onClick={onToggleTranscript}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition',
              showTranscript
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {showTranscript ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showTranscript ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* German Transcript */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 font-medium mb-2">Deutsch</p>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {content.transcript}
                </p>
              </div>

              {/* Vietnamese Translation */}
              {content.transcriptVi && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-2">Tiếng Việt</p>
                  <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                    {content.transcriptVi}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <p className="text-gray-500 text-sm">
              Click "Show" to reveal the transcript. Try to understand by listening first!
            </p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Finish Listening Button */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={onFinishListening}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            Finish Listening & Answer Questions
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Stats Card
// ═══════════════════════════════════════════════════════════════

function StatsCard({ playCount, listeningTime, duration }: any) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
      </div>

      <div className="space-y-4">
        <StatRow
          label="Listening Time"
          value={formatTime(listeningTime)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatRow
          label="Times Played"
          value={playCount}
          icon={<Volume2 className="w-4 h-4" />}
        />
        <StatRow
          label="Audio Duration"
          value={formatTime(duration)}
          icon={<Headphones className="w-4 h-4" />}
        />

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completion</span>
              <span className="text-sm font-bold text-indigo-600">
                {Math.min(100, Math.round((listeningTime / duration) * 100))}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (listeningTime / duration) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, icon }: any) {
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
// Component: Listening Tips Card
// ═══════════════════════════════════════════════════════════════

function ListeningTipsCard() {
  const tips = [
    'Listen to the entire audio at least once before checking the transcript',
    'Use different playback speeds to improve comprehension',
    'Focus on understanding the main ideas, not every word',
    'Take notes of unfamiliar words or phrases',
    'Listen multiple times for better retention',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900">Listening Tips</h3>
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
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  question.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700'
                    : question.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {question.difficulty}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
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
                        ? 'bg-indigo-50 border-indigo-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    )}
                    whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium',
                          hasAnswered
                            ? showCorrect
                              ? 'bg-green-500 border-green-500 text-white'
                              : showIncorrect
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-white border-gray-300 text-gray-600'
                            : isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'bg-white border-gray-300 text-gray-600'
                        )}
                      >
                        {hasAnswered && showCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : hasAnswered && showIncorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span
                        className={cn(
                          'font-medium',
                          showCorrect
                            ? 'text-green-900'
                            : showIncorrect
                            ? 'text-red-900'
                            : 'text-gray-900'
                        )}
                      >
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
                  isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      isCorrect ? 'bg-green-100' : 'bg-blue-100'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        'font-semibold mb-1',
                        isCorrect ? 'text-green-900' : 'text-blue-900'
                      )}
                    >
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
                className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition"
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
  listeningTime,
  playCount,
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
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl border-2 border-indigo-200 p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-full mb-6"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-indigo-900 mb-3"
          >
            Listening Complete!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-indigo-700 mb-8"
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
              color="indigo"
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
              value={formatTime(listeningTime)}
              color="blue"
            />
            <CompletionStatCard
              icon={<Volume2 />}
              label="Plays"
              value={playCount}
              color="purple"
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
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Back to Listening Lab
            </button>
          </motion.div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

function CompletionStatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
      <div className={cn('inline-flex p-2 rounded-lg mb-2', colorClasses[color as keyof typeof colorClasses])}>{icon}</div>
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
          <div className="h-48 bg-gray-200 rounded-xl mb-6 animate-pulse" />
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
        <p className="text-red-600 mb-6">{error?.message || 'Failed to load listening content'}</p>
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
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', colorClasses[color as keyof typeof colorClasses])}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
