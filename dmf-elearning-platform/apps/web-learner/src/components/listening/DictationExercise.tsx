'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Check,
  X,
  Eye,
  EyeOff,
  Send,
  Lightbulb,
} from 'lucide-react';
import { useTTS, formatTime, SPEED_OPTIONS, PlaybackSpeed } from '@/hooks/useAudioPlayer';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface DictationResult {
  userText: string;
  correctText: string;
  accuracy: number;
  wordsCorrect: number;
  wordsTotal: number;
  mistakes: DictationMistake[];
}

export interface DictationMistake {
  expected: string;
  actual: string;
  position: number;
  type: 'missing' | 'extra' | 'wrong';
}

interface DictationExerciseProps {
  text: string;
  translation?: string;
  audioUrl?: string;
  hints?: string[];
  difficulty?: number;
  onComplete?: (result: DictationResult) => void;
  onSkip?: () => void;
  showTranslation?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Dictation Comparison Algorithm
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\wäöüßÄÖÜ\s]/g, '') // Remove punctuation except German chars
    .replace(/\s+/g, ' ')
    .trim();
}

function compareTexts(userText: string, correctText: string): DictationResult {
  const normalizedUser = normalizeText(userText);
  const normalizedCorrect = normalizeText(correctText);

  const userWords = normalizedUser.split(' ').filter(w => w.length > 0);
  const correctWords = normalizedCorrect.split(' ').filter(w => w.length > 0);

  const mistakes: DictationMistake[] = [];
  let wordsCorrect = 0;

  // Simple word-by-word comparison with tolerance
  const maxLen = Math.max(userWords.length, correctWords.length);

  for (let i = 0; i < maxLen; i++) {
    const expected = correctWords[i] || '';
    const actual = userWords[i] || '';

    if (expected === actual) {
      wordsCorrect++;
    } else if (expected && !actual) {
      mistakes.push({ expected, actual: '', position: i, type: 'missing' });
    } else if (!expected && actual) {
      mistakes.push({ expected: '', actual, position: i, type: 'extra' });
    } else {
      mistakes.push({ expected, actual, position: i, type: 'wrong' });
    }
  }

  const accuracy = correctWords.length > 0
    ? Math.round((wordsCorrect / correctWords.length) * 100)
    : 0;

  return {
    userText,
    correctText,
    accuracy,
    wordsCorrect,
    wordsTotal: correctWords.length,
    mistakes,
  };
}

// ═══════════════════════════════════════════════════════════════
// Dictation Exercise Component
// ═══════════════════════════════════════════════════════════════

export function DictationExercise({
  text,
  translation,
  audioUrl,
  hints = [],
  difficulty = 1,
  onComplete,
  onSkip,
  showTranslation = false,
}: DictationExerciseProps) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<DictationResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [ttsState, ttsControls] = useTTS({ rate: 1 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePlay = useCallback(() => {
    if (audioUrl) {
      // TODO: Use audio player for audio files
      ttsControls.speak(text);
    } else {
      ttsControls.speak(text);
    }
    setPlayCount(prev => prev + 1);
  }, [audioUrl, text, ttsControls]);

  const handleStop = useCallback(() => {
    ttsControls.stop();
  }, [ttsControls]);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;

    const comparisonResult = compareTexts(userInput, text);
    setResult(comparisonResult);
    onComplete?.(comparisonResult);
  }, [userInput, text, onComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleRetry = useCallback(() => {
    setUserInput('');
    setResult(null);
    setShowAnswer(false);
    setPlayCount(0);
    inputRef.current?.focus();
  }, []);

  const handleSpeedChange = useCallback((speed: PlaybackSpeed) => {
    ttsControls.setRate(speed);
  }, [ttsControls]);

  // Keyboard shortcut for play
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        if (ttsState.isSpeaking) {
          handleStop();
        } else {
          handlePlay();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handlePlay, handleStop, ttsState.isSpeaking]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Audio Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-500" />
            Listen and Type
          </h3>
          <div className="flex items-center gap-2">
            {/* Difficulty stars */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-sm ${star <= difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">Played: {playCount}x</span>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={ttsState.isSpeaking ? handleStop : handlePlay}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition ${
              ttsState.isSpeaking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {ttsState.isSpeaking ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>

          {/* Speed Control */}
          <div className="flex gap-1">
            {SPEED_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`px-2 py-1 rounded text-sm font-medium transition ${
                  ttsState.rate === option.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Hints Button */}
          {hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className={`p-2 rounded-lg transition ${
                showHints
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hints */}
        <AnimatePresence>
          {showHints && hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <p className="text-sm text-yellow-800 font-medium mb-2">Hints:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {hints.map((hint, i) => (
                  <li key={i}>• {hint}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation (if enabled) */}
        {showTranslation && translation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Translation:</p>
            <p className="text-blue-800">{translation}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      {!result ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type what you hear:
          </label>
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the German text here..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Space</kbd> Play
              <span className="mx-2">|</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Enter</kbd> Submit
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswer ? 'Hide' : 'Show Answer'}
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Check
              </button>
            </div>
          </div>

          {/* Show Answer */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-sm text-gray-600 font-medium mb-1">Correct answer:</p>
                <p className="text-lg text-gray-900">{text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Results */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {/* Score */}
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                result.accuracy >= 90
                  ? 'bg-green-100'
                  : result.accuracy >= 70
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              }`}
            >
              <span
                className={`text-3xl font-bold ${
                  result.accuracy >= 90
                    ? 'text-green-600'
                    : result.accuracy >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {result.accuracy}%
              </span>
            </div>
            <p className="mt-2 text-gray-600">
              {result.wordsCorrect} of {result.wordsTotal} words correct
            </p>
          </div>

          {/* Comparison */}
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-medium mb-1">Your answer:</p>
              <p className="text-gray-900">{result.userText || '(empty)'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Correct answer:</p>
              <p className="text-gray-900">{result.correctText}</p>
            </div>
          </div>

          {/* Mistakes */}
          {result.mistakes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Mistakes:</p>
              <div className="flex flex-wrap gap-2">
                {result.mistakes.slice(0, 10).map((mistake, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                  >
                    {mistake.type === 'missing' && (
                      <>
                        <span className="line-through opacity-50">_</span>
                        <span>→</span>
                        <span className="font-medium">{mistake.expected}</span>
                      </>
                    )}
                    {mistake.type === 'extra' && (
                      <>
                        <span className="line-through">{mistake.actual}</span>
                        <span className="text-gray-400">(extra)</span>
                      </>
                    )}
                    {mistake.type === 'wrong' && (
                      <>
                        <span className="line-through">{mistake.actual}</span>
                        <span>→</span>
                        <span className="font-medium">{mistake.expected}</span>
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition"
              >
                Next
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DictationExercise;
