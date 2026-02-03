'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Headphones,
  Clock,
  Play,
  CheckCircle,
  Target,
  Trophy,
  ChevronRight,
  Volume2,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getListeningById,
  getListeningExercises,
  startListening,
  submitDictationAttempt,
  ListeningWithProgress,
  DictationExercise as DictationExerciseType,
  GermanApiError,
} from '@/services/german-api';
import { DictationExercise, DictationResult } from '@/components/listening';
import { AudioPlayer } from '@/components/listening';

// Temporary user ID
const TEMP_USER_ID = 'demo-user-001';

export default function ListeningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [content, setContent] = useState<ListeningWithProgress | null>(null);
  const [exercises, setExercises] = useState<DictationExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [mode, setMode] = useState<'listen' | 'practice'>('listen');

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      try {
        setLoading(true);
        const [contentData, exercisesData] = await Promise.all([
          getListeningById(id, TEMP_USER_ID),
          getListeningExercises(id),
        ]);
        setContent(contentData);
        setExercises(exercisesData);

        // Start listening progress
        await startListening(TEMP_USER_ID, id);
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load content');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleExerciseComplete = useCallback(
    async (result: DictationResult) => {
      const exercise = exercises[currentExerciseIndex];
      if (!exercise) return;

      try {
        await submitDictationAttempt(exercise.id, TEMP_USER_ID, {
          userText: result.userText,
          accuracy: result.accuracy,
          wordsCorrect: result.wordsCorrect,
          wordsTotal: result.wordsTotal,
          mistakes: result.mistakes,
          listenCount: 1,
          timeSpent: 0,
        });

        setCompletedExercises((prev) => new Set(prev).add(exercise.id));
      } catch (err) {
        console.error('Failed to submit attempt:', err);
      }
    },
    [exercises, currentExerciseIndex]
  );

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  }, [currentExerciseIndex, exercises.length]);

  const handlePrevExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  }, [currentExerciseIndex]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
          <Link
            href="/learn/listening"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Listening Lab
          </Link>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progressPercent = exercises.length > 0
    ? (completedExercises.size / exercises.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/learn/listening" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{content.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {content.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(content.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('listen')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  mode === 'listen'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Headphones className="w-4 h-4" />
                Listen
              </button>
              <button
                onClick={() => setMode('practice')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  mode === 'practice'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Target className="w-4 h-4" />
                Practice
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {mode === 'listen' ? (
            /* Listen Mode */
            <motion.div
              key="listen"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Audio Player */}
              <AudioPlayer
                src={content.audioUrl || undefined}
                title="Audio Content"
                subtitle={content.speaker ? `Speaker: ${content.speaker}` : undefined}
                className="mb-6"
              />

              {/* Transcript Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Transcript
                  </h3>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      showTranscript
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
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
                  {showTranscript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* German Transcript */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 font-medium mb-2">German</p>
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {content.transcript}
                        </p>
                      </div>

                      {/* Vietnamese Translation */}
                      {content.transcriptVi && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium mb-2">Vietnamese</p>
                          <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                            {content.transcriptVi}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showTranscript && (
                  <p className="text-gray-500 text-sm">
                    Click "Show" to reveal the transcript. Try to understand by listening first!
                  </p>
                )}
              </div>

              {/* Start Practice CTA */}
              {exercises.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Ready to Practice?</h3>
                      <p className="text-white/80">
                        {exercises.length} dictation exercises available
                      </p>
                    </div>
                    <button
                      onClick={() => setMode('practice')}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition"
                    >
                      <Play className="w-5 h-5" />
                      Start Practice
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Practice Mode */
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {exercises.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises available</h3>
                  <p className="text-gray-600 mb-4">This content doesn't have any dictation exercises yet.</p>
                  <button
                    onClick={() => setMode('listen')}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  >
                    Back to Listening
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Exercise {currentExerciseIndex + 1} of {exercises.length}
                      </span>
                      <span className="text-sm text-gray-500">
                        {completedExercises.size} completed
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {/* Exercise Navigation */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {exercises.map((exercise, index) => (
                        <button
                          key={exercise.id}
                          onClick={() => setCurrentExerciseIndex(index)}
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition ${
                            currentExerciseIndex === index
                              ? 'bg-indigo-500 text-white'
                              : completedExercises.has(exercise.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {completedExercises.has(exercise.id) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Exercise */}
                  {currentExercise && (
                    <DictationExercise
                      text={currentExercise.correctText}
                      hints={currentExercise.hints}
                      difficulty={currentExercise.difficulty}
                      onComplete={handleExerciseComplete}
                      onSkip={handleNextExercise}
                    />
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePrevExercise}
                      disabled={currentExerciseIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextExercise}
                      disabled={currentExerciseIndex === exercises.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Completion Message */}
                  {completedExercises.size === exercises.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-center"
                    >
                      <Trophy className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">All Exercises Completed!</h3>
                      <p className="text-white/80 mb-4">
                        Great job! You've completed all dictation exercises.
                      </p>
                      <Link
                        href="/learn/listening"
                        className="inline-block px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition"
                      >
                        Back to Listening Lab
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
