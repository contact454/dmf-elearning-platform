'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Play,
  Volume2,
} from 'lucide-react';
import {
  getReadingById,
  startReading,
  updateReadingProgress,
  completeReading,
  ReadingWithAnalysis,
  GermanApiError,
} from '@/services/german-api';
import { PopupDictionary, InteractiveText } from '@/components/reading/PopupDictionary';

// Temporary user ID
const TEMP_USER_ID = 'demo-user-001';

export default function ReadingDetailPage() {
  const params = useParams();
  const contentId = params.id as string;

  const [content, setContent] = useState<ReadingWithAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const [wordsLookedUp, setWordsLookedUp] = useState<Set<string>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load content
  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const data = await getReadingById(contentId, TEMP_USER_ID);
        setContent(data);

        // Resume from previous progress
        if (data.userProgress) {
          setReadingTime(data.userProgress.totalReadTime);
          setWordsLookedUp(new Set(data.userProgress.wordsLookedUp));
          if (data.userProgress.status === 'in_progress') {
            setIsReading(true);
          }
        }
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
    loadContent();
  }, [contentId]);

  // Timer for reading time
  useEffect(() => {
    if (isReading) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setReadingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReading]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!isReading || !content) return;

    const saveInterval = setInterval(async () => {
      try {
        await updateReadingProgress(TEMP_USER_ID, contentId, {
          totalReadTime: readingTime,
          wordsLookedUp: Array.from(wordsLookedUp),
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [isReading, content, contentId, readingTime, wordsLookedUp]);

  const handleStartReading = useCallback(async () => {
    try {
      await startReading(TEMP_USER_ID, contentId);
      setIsReading(true);
    } catch (err) {
      console.error('Failed to start reading:', err);
    }
  }, [contentId]);

  const handleComplete = useCallback(async () => {
    try {
      setIsReading(false);
      await completeReading(TEMP_USER_ID, contentId);
      // Reload content to get updated progress
      const data = await getReadingById(contentId, TEMP_USER_ID);
      setContent(data);
    } catch (err) {
      console.error('Failed to complete reading:', err);
    }
  }, [contentId]);

  const handleWordClick = useCallback((word: string, position: { x: number; y: number }) => {
    setSelectedWord({ word, position });
    setWordsLookedUp((prev) => new Set(prev).add(word.toLowerCase()));
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
          <Link
            href="/learn/reading"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = content.userProgress?.status === 'completed';
  const knownWords = new Set(content.analysis?.knownWords || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/learn/reading"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
                  {content.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {content.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(readingTime)}
                  </span>
                </div>
              </div>
            </div>

            {isReading && (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                <CheckCircle className="w-4 h-4" />
                Done
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Card */}
        {content.analysis && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Content Analysis
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {content.analysis.knownPercentage}%
                </p>
                <p className="text-sm text-gray-600">Known Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {content.analysis.unknownWords.length}
                </p>
                <p className="text-sm text-gray-600">New Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {content.analysis.totalWords}
                </p>
                <p className="text-sm text-gray-600">Total Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {content.analysis.estimatedReadingTime} min
                </p>
                <p className="text-sm text-gray-600">Est. Time</p>
              </div>
            </div>

            {/* Suitability Badge */}
            <div className="flex justify-center">
              <span
                className={`px-4 py-2 rounded-full font-medium ${
                  content.analysis.suitability === 'optimal'
                    ? 'bg-green-100 text-green-700'
                    : content.analysis.suitability === 'too_easy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {content.analysis.suitability === 'optimal'
                  ? 'Perfect for your level (i+1)'
                  : content.analysis.suitability === 'too_easy'
                  ? 'Easy for you'
                  : 'Challenging'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">Completed!</h3>
            <p className="text-green-600">
              You read this in {formatTime(content.userProgress?.totalReadTime || 0)}
            </p>
          </motion.div>
        )}

        {/* Start Reading Button */}
        {!isReading && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <button
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              Start Reading
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Click on any word to see its definition
            </p>
          </motion.div>
        )}

        {/* Reading Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

          {/* Content with Interactive Words */}
          <div className="text-lg leading-relaxed">
            <InteractiveText
              content={content.content}
              knownWords={knownWords}
              onWordClick={isReading || isCompleted ? handleWordClick : undefined}
              highlightUnknown={isReading || isCompleted}
            />
          </div>
        </motion.article>

        {/* Words Looked Up */}
        {wordsLookedUp.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              Words You Looked Up ({wordsLookedUp.size})
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(wordsLookedUp).map((word) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Popup Dictionary */}
      {selectedWord && (
        <PopupDictionary
          word={selectedWord.word}
          position={selectedWord.position}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
