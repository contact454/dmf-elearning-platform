'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Mic,
  StopCircle,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  Volume2,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  usePrompts,
  useCreateSubmission,
  useProgress,
} from '@/hooks/useSpeakingQueries';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { uploadAudioBlob, blobToFile, formatDuration, getScoreColor } from '@/services/speakingApi';
import { SkeletonCard, SkeletonStats, CountUp, ThemeToggle } from '@/components/ui';
import type { CEFRLevel, SpeakingPrompt } from '@/types/speaking';

export default function SpeakingPracticePage() {
  // Filters
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | ''>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build filters object for query
  const filters = useMemo(() => ({
    cefr: selectedLevel || undefined,
    topic: selectedTopic || undefined,
    search: searchQuery || undefined,
    limit: 20,
  }), [selectedLevel, selectedTopic, searchQuery]);

  // React Query hooks
  const {
    data: promptsData,
    isLoading: promptsLoading,
    error: promptsError,
    refetch: refetchPrompts,
    isFetching: promptsFetching,
  } = usePrompts(filters);

  const {
    data: progress,
    isLoading: progressLoading,
  } = useProgress();

  const createSubmission = useCreateSubmission();

  // Audio recording
  const recorder = useAudioRecorder(120); // 2 min max

  const prompts = promptsData?.items || [];
  const isLoading = promptsLoading && prompts.length === 0;
  const error = promptsError;

  // Extract unique topics
  const topics = useMemo(() => {
    const topicSet = new Set(prompts.map(p => p.topic).filter(Boolean));
    return Array.from(topicSet);
  }, [prompts]);

  // Available levels
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // Handle submission
  const handleSubmit = async () => {
    if (!recorder.audioBlob || !selectedPrompt) return;

    try {
      setIsSubmitting(true);

      // Upload audio (in production, this would upload to cloud storage)
      const audioUrl = await uploadAudioBlob(
        recorder.audioBlob,
        `speaking-${selectedPrompt.id}-${Date.now()}.webm`
      );

      // Create submission
      await createSubmission.mutateAsync({
        promptId: selectedPrompt.id,
        audioUrl,
        durationSeconds: recorder.duration,
      });

      // Reset recorder and show success
      recorder.reset();
      setSelectedPrompt(null);
      
      // Could show success toast here
      alert('Submission successful! Analysis in progress...');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit recording. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonStats className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Connection Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load prompts. Is the Speaking Service running?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetchPrompts()}
              className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/learn/hub"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Back to Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        onRefresh={() => refetchPrompts()}
        isFetching={promptsFetching}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<Mic className="w-5 h-5" />}
              label="Total Submissions"
              value={progress.totalSubmissions}
              color="violet"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Average Score"
              value={Math.round(progress.averageScore)}
              suffix="%"
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Today"
              value={progress.completedToday}
              color="purple"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="Streak"
              value={progress.currentStreak}
              suffix=" days"
              color="orange"
            />
          </motion.div>
        )}

        {/* Recording Section */}
        {selectedPrompt && (
          <RecordingSection
            prompt={selectedPrompt}
            recorder={recorder}
            onCancel={() => {
              recorder.reset();
              setSelectedPrompt(null);
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedLevel('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedLevel === ''
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Levels
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedLevel === level
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Topic Filter */}
            {topics.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Topics</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Prompts Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Prompts
          </h2>
          {prompts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No prompts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onSelect={() => setSelectedPrompt(prompt)}
                  isSelected={selectedPrompt?.id === prompt.id}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function Header({
  onRefresh,
  isFetching,
}: {
  onRefresh?: () => void;
  isFetching?: boolean;
}) {
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/learn/hub"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Mic className="w-6 h-6 text-violet-500" />
                Speaking Practice
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Practice speaking with AI feedback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isFetching}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                />
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        <CountUp end={value} />
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function PromptCard({
  prompt,
  onSelect,
  isSelected,
}: {
  prompt: SpeakingPrompt;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const levelColor =
    prompt.cefrLevel === 'A1' || prompt.cefrLevel === 'A2'
      ? 'from-green-400 to-emerald-500'
      : prompt.cefrLevel === 'B1' || prompt.cefrLevel === 'B2'
      ? 'from-blue-400 to-indigo-500'
      : 'from-purple-400 to-violet-500';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-violet-500 ring-2 ring-violet-200 dark:ring-violet-800'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div
        className={`h-24 bg-gradient-to-br ${levelColor} flex items-center justify-center relative`}
      >
        <div className="text-center text-white">
          <Volume2 className="w-8 h-8 mx-auto mb-1" />
          <span className="text-sm font-medium">{prompt.topic}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-medium rounded-full">
            {prompt.cefrLevel}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {prompt.speakingTimeSeconds}s
          </span>
        </div>

        {/* Question */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {prompt.question}
        </h3>

        {/* Evaluation Criteria */}
        {prompt.evaluationCriteria && prompt.evaluationCriteria.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Evaluated on:</p>
            <div className="flex flex-wrap gap-1">
              {prompt.evaluationCriteria.slice(0, 3).map((criteria, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                >
                  {criteria}
                </span>
              ))}
              {prompt.evaluationCriteria.length > 3 && (
                <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                  +{prompt.evaluationCriteria.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <button
          className={`w-full py-2 rounded-lg text-sm font-medium transition ${
            isSelected
              ? 'bg-violet-500 text-white'
              : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
          }`}
        >
          {isSelected ? 'Selected ✓' : 'Select Prompt'}
        </button>
      </div>
    </motion.div>
  );
}

function RecordingSection({
  prompt,
  recorder,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  prompt: SpeakingPrompt;
  recorder: ReturnType<typeof useAudioRecorder>;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [preparationTime, setPreparationTime] = useState(prompt.preparationTimeSeconds);
  const [isPreparing, setIsPreparing] = useState(true);

  // Countdown timer for preparation
  useEffect(() => {
    if (!isPreparing) return;

    const timer = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          setIsPreparing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPreparing]);

  const canSubmit = recorder.audioBlob && !recorder.isRecording;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-violet-200 dark:border-violet-800 p-6"
    >
      {/* Prompt Display */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg p-6 text-white mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {prompt.cefrLevel}
            </span>
            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {prompt.topic}
            </span>
          </div>
          {isPreparing && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Prepare: {preparationTime}s</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold mb-2">{prompt.question}</h2>
        {prompt.tips && prompt.tips.length > 0 && (
          <div className="bg-white/10 rounded-lg p-3 mt-3">
            <p className="text-sm font-medium mb-1">💡 Tips:</p>
            <ul className="text-sm text-white/90 space-y-1">
              {prompt.tips.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {/* Recording Status */}
        <div className="mb-4">
          {recorder.isRecording ? (
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
              <span className="font-medium">Recording... {formatDuration(recorder.duration)}</span>
            </div>
          ) : recorder.audioBlob ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Recording ready ({formatDuration(recorder.duration)})</span>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {isPreparing ? 'Preparing...' : 'Ready to record'}
            </p>
          )}
        </div>

        {/* Record Button */}
        <div className="flex justify-center gap-4 mb-4">
          {!recorder.audioBlob ? (
            <>
              <button
                onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                disabled={isPreparing}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-lg ${
                  recorder.isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : isPreparing
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-violet-500 hover:bg-violet-600'
                } text-white disabled:opacity-50`}
              >
                {recorder.isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              {recorder.isRecording && !recorder.isPaused && (
                <button
                  onClick={recorder.pauseRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white transition"
                >
                  <Pause className="w-6 h-6" />
                </button>
              )}
              {recorder.isPaused && (
                <button
                  onClick={recorder.resumeRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition"
                >
                  <Play className="w-6 h-6" />
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={recorder.reset}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Re-record
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Recording
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {recorder.audioUrl && (
          <div className="max-w-md mx-auto">
            <audio controls src={recorder.audioUrl} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {recorder.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {recorder.error}
          </div>
        )}
      </div>

      {/* Cancel Button */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
        >
          Cancel and choose different prompt
        </button>
      </div>
    </motion.div>
  );
}
