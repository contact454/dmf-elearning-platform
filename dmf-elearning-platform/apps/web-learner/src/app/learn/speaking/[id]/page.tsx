'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Mic,
  Volume2,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import {
  getSpeakingById,
  submitSpeakingAttempt,
  getSpeakingAttempts,
  SpeakingWithProgress,
  SpeakingAttempt,
  GermanApiError,
} from '@/services/german-api';
import { SpeechRecorder } from '@/components/speaking';

// Temporary user ID
const TEMP_USER_ID = 'demo-user-001';

export default function SpeakingPracticePage() {
  const params = useParams();
  const id = params?.id as string;

  const [prompt, setPrompt] = useState<SpeakingWithProgress | null>(null);
  const [attempts, setAttempts] = useState<SpeakingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<SpeakingAttempt | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      try {
        setLoading(true);
        const [promptData, attemptsData] = await Promise.all([
          getSpeakingById(id, TEMP_USER_ID),
          getSpeakingAttempts(id, TEMP_USER_ID).catch(() => []),
        ]);
        setPrompt(promptData);
        setAttempts(attemptsData);
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load prompt');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = useCallback(
    async (transcript: string, audioBlob?: Blob) => {
      if (!prompt || submitting) return;

      try {
        setSubmitting(true);

        const attempt = await submitSpeakingAttempt(prompt.id, TEMP_USER_ID, {
          transcript,
          audioDuration: 0,
          recordingTime: 0,
        });

        setCurrentAttempt(attempt);
        setAttempts((prev) => [attempt, ...prev]);
        setShowResult(true);
      } catch (err) {
        console.error('Submit error:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [prompt, submitting]
  );

  const handleTryAgain = useCallback(() => {
    setCurrentAttempt(null);
    setShowResult(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Prompt not found'}</p>
          <Link
            href="/learn/speaking"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Speaking Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/learn/speaking" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{prompt.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                  {prompt.level}
                </span>
                <span className="capitalize">{prompt.category}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!showResult ? (
            /* Recording Mode */
            <motion.div
              key="recording"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Instructions */}
              {prompt.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <p className="text-gray-600">{prompt.description}</p>
                </div>
              )}

              {/* Speech Recorder */}
              <SpeechRecorder
                promptText={prompt.promptText}
                sampleAudioUrl={prompt.sampleAudioUrl || undefined}
                onSubmit={handleSubmit}
                disabled={submitting}
              />

              {/* Loading overlay */}
              {submitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">Evaluating your speech...</p>
                  </div>
                </div>
              )}

              {/* Previous Attempts */}
              {attempts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h3>
                  <div className="space-y-3">
                    {attempts.slice(0, 5).map((attempt, index) => (
                      <div
                        key={attempt.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              attempt.overallScore >= 80
                                ? 'bg-green-100 text-green-700'
                                : attempt.overallScore >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <span className="font-bold">{attempt.overallScore}%</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Attempt #{attempt.attemptNumber}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-400">Pronunciation</p>
                            <p className="font-medium">{attempt.pronunciationScore}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Fluency</p>
                            <p className="font-medium">{attempt.fluencyScore}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Accuracy</p>
                            <p className="font-medium">{attempt.accuracyScore}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Result Mode */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {currentAttempt && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {/* Score Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                        currentAttempt.overallScore >= 80
                          ? 'bg-green-100'
                          : currentAttempt.overallScore >= 60
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <span
                        className={`text-4xl font-bold ${
                          currentAttempt.overallScore >= 80
                            ? 'text-green-600'
                            : currentAttempt.overallScore >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {currentAttempt.overallScore}%
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentAttempt.overallScore >= 80
                        ? 'Excellent!'
                        : currentAttempt.overallScore >= 60
                        ? 'Good Job!'
                        : 'Keep Practicing!'}
                    </h2>
                    <p className="text-gray-600">{currentAttempt.feedback}</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <ScoreCard
                      icon={<Volume2 className="w-5 h-5" />}
                      label="Pronunciation"
                      score={currentAttempt.pronunciationScore}
                    />
                    <ScoreCard
                      icon={<TrendingUp className="w-5 h-5" />}
                      label="Fluency"
                      score={currentAttempt.fluencyScore}
                    />
                    <ScoreCard
                      icon={<Target className="w-5 h-5" />}
                      label="Accuracy"
                      score={currentAttempt.accuracyScore}
                    />
                  </div>

                  {/* Word Scores */}
                  {currentAttempt.wordScores && currentAttempt.wordScores.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-900 mb-3">Word by Word</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentAttempt.wordScores.map((ws, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                              ws.isCorrect
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {ws.isCorrect ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="font-medium">{ws.word}</span>
                            {!ws.isCorrect && ws.userWord && (
                              <span className="text-xs opacity-75">({ws.userWord})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Your Speech */}
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 font-medium mb-1">What you said:</p>
                    <p className="text-gray-900">{currentAttempt.transcript || '(No transcript)'}</p>
                  </div>

                  {/* Expected */}
                  <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium mb-1">Expected:</p>
                    <p className="text-indigo-900">{prompt.sampleResponse || prompt.promptText}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleTryAgain}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Try Again
                    </button>
                    <Link
                      href="/learn/speaking"
                      className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition"
                    >
                      Next Prompt
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ScoreCard({
  icon,
  label,
  score,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-50';
    if (s >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`p-4 rounded-xl text-center ${getColor(score)}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{score}%</p>
    </div>
  );
}
