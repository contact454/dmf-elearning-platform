'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mic,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Award,
  Brain,
  TrendingUp,
  Volume2,
  Lightbulb,
  ChevronRight,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Square,
  AlertCircle,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useSpeakingById,
  useSpeakingStats,
  useSubmitSpeaking,
  useSpeakingAttempts,
} from '@/hooks/useSpeakingLearningQueries';
import { useUser } from '@/providers/user-provider';
import {
  useSpeechRecognition,
  useAudioRecording,
  calculateSimilarity,
  compareWords,
} from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useAudioPlayer';
import {
  PageTransition,
  AnimateOnScroll,
  AnimatedCounter,
  SkeletonTransition,
  ShakeContainer,
} from '@/components/ui/animations';
import { cn } from '@/lib/utils';

interface SpeakingPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// Waveform Visualizer Component
// ═══════════════════════════════════════════════════════════════

function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  const bars = 30;

  return (
    <div className="flex items-center justify-center gap-1 h-20">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'w-1.5 rounded-full',
            isActive ? 'bg-rose-500' : 'bg-gray-300'
          )}
          animate={
            isActive
              ? {
                  height: [12, Math.random() * 50 + 30, 12],
                }
              : { height: 12 }
          }
          transition={
            isActive
              ? {
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.03,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════

export default function SpeakingPracticePage({ params }: SpeakingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { userId } = useUser();

  // State management
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentScore, setCurrentScore] = useState<any>(null);
  const [shake, setShake] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // API hooks
  const { data: content, isLoading, error } = useSpeakingById(id);
  const { data: stats } = useSpeakingStats();
  const { data: previousAttempts } = useSpeakingAttempts(id);
  const submitAttemptMutation = useSubmitSpeaking();

  // Speech recognition
  const [speechState, speechControls] = useSpeechRecognition({
    lang: 'de-DE',
    continuous: true,
    interimResults: true,
  });

  // Audio recording
  const [recordingState, recordingControls] = useAudioRecording();

  // TTS for playing sample
  const [ttsState, ttsControls] = useTTS({ lang: 'de-DE' });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlayingBack(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Practice timer
  useEffect(() => {
    if (isPracticing) {
      timerRef.current = setInterval(() => {
        setPracticeTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPracticing]);

  const handleStartPractice = useCallback(() => {
    setIsPracticing(true);
    setShowResult(false);
    setCurrentScore(null);
  }, []);

  const handleStartRecording = useCallback(async () => {
    speechControls.reset();
    speechControls.start();
    await recordingControls.startRecording();
  }, [speechControls, recordingControls]);

  const handleStopRecording = useCallback(() => {
    speechControls.stop();
    recordingControls.stopRecording();
  }, [speechControls, recordingControls]);

  const handleReset = useCallback(() => {
    speechControls.reset();
    recordingControls.reset();
    setIsPlayingBack(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [speechControls, recordingControls]);

  const handlePlaySample = useCallback(() => {
    if (content?.sampleAudioUrl) {
      if (audioRef.current) {
        audioRef.current.src = content.sampleAudioUrl;
        audioRef.current.play();
      }
    } else if (content?.promptText) {
      ttsControls.speak(content.promptText);
    }
  }, [content, ttsControls]);

  const handlePlayRecording = useCallback(() => {
    if (!recordingState.audioUrl || !audioRef.current) return;

    if (isPlayingBack) {
      audioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      audioRef.current.src = recordingState.audioUrl;
      audioRef.current.play();
      setIsPlayingBack(true);
    }
  }, [recordingState.audioUrl, isPlayingBack]);

  const handleSubmitAttempt = useCallback(async () => {
    if (!speechState.transcript.trim() || !content) return;

    setAttemptCount((prev) => prev + 1);

    // Calculate scores
    const expectedText = content.sampleResponse || content.promptText;
    const similarity = calculateSimilarity(speechState.transcript, expectedText);
    const { score, wordScores } = compareWords(speechState.transcript, expectedText);

    // Mock pronunciation and fluency scores (in production, these would come from backend)
    const pronunciationScore = Math.max(70, Math.min(100, similarity + Math.random() * 10 - 5));
    const fluencyScore = Math.max(60, Math.min(100, 85 + Math.random() * 15));
    const accuracyScore = score;
    const overallScore = Math.round(
      (pronunciationScore * 0.4 + fluencyScore * 0.3 + accuracyScore * 0.3)
    );

    const result = {
      transcript: speechState.transcript,
      overallScore,
      pronunciationScore: Math.round(pronunciationScore),
      fluencyScore: Math.round(fluencyScore),
      accuracyScore: Math.round(accuracyScore),
      wordScores,
      confidence: speechState.confidence,
    };

    setCurrentScore(result);
    setShowResult(true);

    // Submit to backend
    try {
      await submitAttemptMutation.mutateAsync({
        promptId: id,
        data: {
          transcript: speechState.transcript,
          audioDuration: recordingState.duration,
          recordingTime: practiceTime,
        },
      });
    } catch (error) {
      console.error('Failed to submit attempt:', error);
    }
  }, [
    speechState.transcript,
    speechState.confidence,
    content,
    id,
    recordingState.duration,
    practiceTime,
    submitAttemptMutation,
  ]);

  const handleTryAgain = useCallback(() => {
    handleReset();
    setShowResult(false);
    setCurrentScore(null);
  }, [handleReset]);

  const handleBackToLibrary = () => {
    router.push('/learn/speaking');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecording = speechState.isListening || recordingState.isRecording;
  const hasRecording = !!recordingState.audioBlob || !!speechState.transcript;

  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToLibrary}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-rose-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {content?.title || 'Loading...'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                      {content?.level}
                    </span>
                    {isPracticing && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(practiceTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="hidden md:flex items-center gap-3">
                  <StatBadge
                    icon={<Mic className="w-4 h-4" />}
                    label={`${stats.promptsMastered || 0} mastered`}
                    color="rose"
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
            ) : showResult && currentScore ? (
              <ResultSection
                content={content}
                score={currentScore}
                practiceTime={practiceTime}
                attemptCount={attemptCount}
                onTryAgain={handleTryAgain}
                onBackToLibrary={handleBackToLibrary}
              />
            ) : (
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Practice Area */}
                <div className="lg:col-span-8">
                  <AnimateOnScroll variant="fadeUp">
                    <PracticeContent
                      content={content}
                      isPracticing={isPracticing}
                      isRecording={isRecording}
                      hasRecording={hasRecording}
                      speechState={speechState}
                      recordingState={recordingState}
                      ttsState={ttsState}
                      isPlayingBack={isPlayingBack}
                      onStartPractice={handleStartPractice}
                      onStartRecording={handleStartRecording}
                      onStopRecording={handleStopRecording}
                      onReset={handleReset}
                      onSubmit={handleSubmitAttempt}
                      onPlaySample={handlePlaySample}
                      onPlayRecording={handlePlayRecording}
                    />
                  </AnimateOnScroll>
                </div>

                {/* Progress Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <AnimateOnScroll variant="fadeRight" delay={0.1}>
                    <StatsCard
                      attemptCount={attemptCount}
                      practiceTime={practiceTime}
                      previousAttempts={previousAttempts || []}
                    />
                  </AnimateOnScroll>

                  <AnimateOnScroll variant="fadeRight" delay={0.2}>
                    <SpeakingTipsCard />
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
// Component: Practice Content
// ═══════════════════════════════════════════════════════════════

function PracticeContent({
  content,
  isPracticing,
  isRecording,
  hasRecording,
  speechState,
  recordingState,
  ttsState,
  isPlayingBack,
  onStartPractice,
  onStartRecording,
  onStopRecording,
  onReset,
  onSubmit,
  onPlaySample,
  onPlayRecording,
}: any) {
  if (!content) return null;

  return (
    <div className="space-y-6">
      {/* Start Practice Button */}
      {!isPracticing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            Start Practice
          </button>
          <p className="text-sm text-gray-500 mt-2">Record yourself speaking German</p>
        </motion.div>
      )}

      {/* Recording Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        {/* Error Message */}
        <AnimatePresence>
          {(speechState.error || recordingState.error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Recording Error</p>
                <p className="text-sm text-red-600">
                  {speechState.error || recordingState.error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browser Support Warning */}
        {!speechState.isSupported && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              Speech recognition is not supported in this browser. Please use Chrome or Edge.
            </p>
          </div>
        )}

        {/* Prompt Display */}
        <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
          <p className="text-sm text-rose-600 font-medium mb-1">Say this:</p>
          <p className="text-xl text-rose-900 font-semibold mb-3">{content.promptText}</p>

          <button
            onClick={onPlaySample}
            disabled={ttsState.isSpeaking}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            {ttsState.isSpeaking ? 'Playing...' : 'Listen to sample'}
          </button>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6">
          <WaveformVisualizer isActive={isRecording} />
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              disabled={!isPracticing || !speechState.isSupported}
              className="flex items-center justify-center w-20 h-20 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="flex items-center justify-center w-20 h-20 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition shadow-lg animate-pulse"
            >
              <Square className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Status Text */}
        <p className="text-center text-sm text-gray-500 mb-4">
          {isRecording
            ? 'Recording... Click to stop'
            : hasRecording
            ? 'Recording complete'
            : isPracticing
            ? 'Click the microphone to start'
            : 'Start practice to begin recording'}
        </p>

        {/* Transcript Display */}
        {(speechState.transcript || speechState.interimTranscript) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">Your speech:</p>
            <p className="text-gray-900 text-lg">
              {speechState.transcript}
              {speechState.interimTranscript && (
                <span className="text-gray-400 italic">{speechState.interimTranscript}</span>
              )}
            </p>
            {speechState.confidence > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Confidence: {Math.round(speechState.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {/* Playback Controls */}
        {hasRecording && !isRecording && (
          <div className="flex items-center justify-center gap-4 mb-6">
            {recordingState.audioUrl && (
              <button
                onClick={onPlayRecording}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition',
                  isPlayingBack
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {isPlayingBack ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play recording
                  </>
                )}
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {/* Submit Button */}
        {hasRecording && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={onSubmit}
              disabled={!speechState.transcript.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              Submit for Evaluation
            </button>
          </motion.div>
        )}

        {/* Recording Duration */}
        {recordingState.duration > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Duration: {recordingState.duration.toFixed(1)}s
          </p>
        )}
      </motion.div>

      {/* Instructions */}
      {content.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-2xl border border-blue-200 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Instructions</h3>
          </div>
          <p className="text-blue-700">{content.description}</p>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Stats Card
// ═══════════════════════════════════════════════════════════════

function StatsCard({ attemptCount, practiceTime, previousAttempts }: any) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const bestScore = previousAttempts?.length > 0
    ? Math.max(...previousAttempts.map((a: any) => a.overallScore))
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-rose-100 rounded-lg">
          <Brain className="w-5 h-5 text-rose-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
      </div>

      <div className="space-y-4">
        <StatRow
          label="Practice Time"
          value={formatTime(practiceTime)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatRow
          label="Attempts"
          value={attemptCount}
          icon={<Mic className="w-4 h-4" />}
        />
        {bestScore > 0 && (
          <StatRow
            label="Best Score"
            value={`${bestScore}%`}
            icon={<Trophy className="w-4 h-4" />}
          />
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
// Component: Speaking Tips Card
// ═══════════════════════════════════════════════════════════════

function SpeakingTipsCard() {
  const tips = [
    'Speak clearly and at a natural pace',
    'Listen to the sample audio before recording',
    'Practice pronunciation of difficult words',
    'Record multiple times to improve',
    'Focus on accuracy and fluency',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900">Speaking Tips</h3>
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
// Component: Result Section
// ═══════════════════════════════════════════════════════════════

function ResultSection({
  content,
  score,
  practiceTime,
  attemptCount,
  onTryAgain,
  onBackToLibrary,
}: any) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getFeedback = (overallScore: number) => {
    if (overallScore >= 90) return { title: 'Excellent!', message: 'Your pronunciation and fluency are outstanding!' };
    if (overallScore >= 80) return { title: 'Great Job!', message: 'You\'re speaking German very well!' };
    if (overallScore >= 70) return { title: 'Good Work!', message: 'Keep practicing to improve further!' };
    if (overallScore >= 60) return { title: 'Nice Try!', message: 'You\'re making progress!' };
    return { title: 'Keep Practicing!', message: 'Every attempt makes you better!' };
  };

  const feedback = getFeedback(score.overallScore);

  return (
    <AnimateOnScroll variant="scale">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 sm:p-12">
          {/* Score Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={cn(
                'inline-flex items-center justify-center w-32 h-32 rounded-full mb-4',
                score.overallScore >= 80
                  ? 'bg-green-100'
                  : score.overallScore >= 60
                  ? 'bg-yellow-100'
                  : 'bg-orange-100'
              )}
            >
              <span
                className={cn(
                  'text-5xl font-bold',
                  score.overallScore >= 80
                    ? 'text-green-600'
                    : score.overallScore >= 60
                    ? 'text-yellow-600'
                    : 'text-orange-600'
                )}
              >
                {score.overallScore}%
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              {feedback.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600"
            >
              {feedback.message}
            </motion.p>
          </div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <ScoreCard
              icon={<Volume2 className="w-5 h-5" />}
              label="Pronunciation"
              score={score.pronunciationScore}
            />
            <ScoreCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Fluency"
              score={score.fluencyScore}
            />
            <ScoreCard
              icon={<Target className="w-5 h-5" />}
              label="Accuracy"
              score={score.accuracyScore}
            />
          </motion.div>

          {/* Word Scores */}
          {score.wordScores && score.wordScores.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Word by Word Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {score.wordScores.map((ws: any, index: number) => (
                  <span
                    key={index}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium',
                      ws.isCorrect
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {ws.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{ws.word}</span>
                    {!ws.isCorrect && ws.userWord && (
                      <span className="text-xs opacity-75">({ws.userWord})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Your Speech */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 font-medium mb-1">What you said:</p>
            <p className="text-gray-900 text-lg">{score.transcript || '(No transcript)'}</p>
          </div>

          {/* Expected */}
          <div className="mb-8 p-4 bg-rose-50 rounded-xl">
            <p className="text-sm text-rose-600 font-medium mb-1">Expected:</p>
            <p className="text-rose-900 text-lg">{content?.sampleResponse || content?.promptText}</p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <CompletionStatCard
              icon={<Clock />}
              label="Time"
              value={formatTime(practiceTime)}
              color="blue"
            />
            <CompletionStatCard
              icon={<Zap />}
              label="Attempts"
              value={attemptCount}
              color="purple"
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4"
          >
            <button
              onClick={onTryAgain}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={onBackToLibrary}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 text-white rounded-xl font-medium transition shadow-lg hover:shadow-xl"
            >
              Next Prompt
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-50';
    if (s >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className={cn('p-4 rounded-xl text-center', getColor(score))}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{score}%</p>
    </div>
  );
}

function CompletionStatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
      <div className={cn('inline-flex p-2 rounded-lg mb-2', colorClasses[color])}>{icon}</div>
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
        <p className="text-red-600 mb-6">{error?.message || 'Failed to load speaking content'}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
        >
          Back to Speaking Studio
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
    rose: 'bg-rose-100 text-rose-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', colorClasses[color])}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
