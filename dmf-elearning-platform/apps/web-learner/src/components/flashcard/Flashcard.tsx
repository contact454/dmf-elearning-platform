'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Volume2 } from 'lucide-react';
import type { DbVocabularyItem } from '@/services/german-api';
import { useSpeaking } from '@/hooks/useSpeaking';

interface FlashcardProps {
  word: DbVocabularyItem;
  onFlip?: (isFlipped: boolean) => void;
  isFlipped?: boolean;
}

// Gender color mapping based on German articles
const getGenderColor = (word: DbVocabularyItem) => {
  const gender = word.gender;
  const artikel = word.artikel;

  if (gender === 'm' || artikel === 'der') {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-700',
      gradient: 'from-blue-100 to-blue-50',
      glow: 'shadow-blue-200/50',
      artikelColor: 'text-blue-600',
    };
  }
  if (gender === 'f' || artikel === 'die') {
    return {
      bg: 'bg-pink-50',
      border: 'border-pink-300',
      text: 'text-pink-900',
      badge: 'bg-pink-100 text-pink-700',
      gradient: 'from-pink-100 to-pink-50',
      glow: 'shadow-pink-200/50',
      artikelColor: 'text-pink-600',
    };
  }
  if (gender === 'n' || artikel === 'das') {
    return {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-700',
      gradient: 'from-green-100 to-green-50',
      glow: 'shadow-green-200/50',
      artikelColor: 'text-green-600',
    };
  }

  // Default for verbs and other parts of speech
  return {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-700',
    gradient: 'from-gray-100 to-gray-50',
    glow: 'shadow-gray-200/50',
    artikelColor: 'text-gray-600',
  };
};

export function Flashcard({ word, onFlip, isFlipped: controlledFlipped }: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const colors = getGenderColor(word);
  const { speak, stop, isSpeaking, isSupported } = useSpeaking({ rate: 0.85 });
  const isNoun = word.pos === 'noun';

  const handleFlip = useCallback(() => {
    const newState = !isFlipped;
    if (controlledFlipped === undefined) {
      setInternalFlipped(newState);
    }
    onFlip?.(newState);
  }, [isFlipped, onFlip, controlledFlipped]);

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(word.word);
    }
  }, [word.word, isSpeaking, speak, stop]);

  return (
    <div
      className="w-full max-w-2xl mx-auto cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-80 sm:h-96"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side - German Word */}
        <div
          className={`absolute inset-0 rounded-3xl border-2 ${colors.border} ${colors.bg} p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl ${colors.glow}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Level Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {word.level}
          </div>

          {/* POS Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            {word.pos || 'word'}
          </div>

          {/* Topic Badge */}
          {word.topic && (
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {word.topic}
            </div>
          )}

          {/* German Word with Artikel for Nouns */}
          <div className="mb-6 text-center">
            {isNoun && word.artikel && (
              <span className={`text-2xl sm:text-3xl font-medium ${colors.artikelColor} mr-2`}>
                {word.artikel}
              </span>
            )}
            <h2 className={`inline text-4xl sm:text-5xl font-bold ${colors.text}`}>
              {word.word}
            </h2>
            {/* Plural form for nouns */}
            {isNoun && word.plural && (
              <p className="text-sm text-gray-500 mt-2">
                pl. <span className="font-medium">{word.plural}</span>
              </p>
            )}
          </div>

          {/* Audio Button with Speaking State */}
          {isSupported && (
            <button
              onClick={handleSpeak}
              className={`mb-6 p-3 rounded-full shadow-md hover:shadow-lg transition-all group ${
                isSpeaking
                  ? 'bg-indigo-500 animate-pulse'
                  : 'bg-white/80 hover:bg-white'
              }`}
              aria-label={isSpeaking ? 'Dừng đọc' : 'Đọc từ'}
            >
              <Volume2
                className={`w-6 h-6 transition-colors ${
                  isSpeaking
                    ? 'text-white'
                    : 'text-gray-600 group-hover:text-indigo-600'
                }`}
              />
            </button>
          )}

          {/* Flip Hint */}
          <div className="flex items-center gap-2 text-gray-500">
            <RotateCw className="w-4 h-4" />
            <p className="text-sm">Nhấn để xem nghĩa</p>
          </div>
        </div>

        {/* Back Side - Vietnamese Meaning */}
        <div
          className={`absolute inset-0 rounded-3xl border-2 ${colors.border} bg-gradient-to-br ${colors.gradient} p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl ${colors.glow}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Level Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {word.level}
          </div>

          {/* POS Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            {word.pos || 'word'}
          </div>

          {/* Audio Button on Back Side */}
          {isSupported && (
            <button
              onClick={handleSpeak}
              className={`absolute top-4 left-1/2 -translate-x-1/2 p-2 rounded-full shadow-md transition-all ${
                isSpeaking
                  ? 'bg-indigo-500 animate-pulse'
                  : 'bg-white/80 hover:bg-white'
              }`}
              aria-label={isSpeaking ? 'Dừng đọc' : 'Đọc từ'}
            >
              <Volume2
                className={`w-5 h-5 ${
                  isSpeaking
                    ? 'text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              />
            </button>
          )}

          {/* Content */}
          <div className="text-center space-y-6 mt-4">
            {/* German Word (smaller) with Artikel */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiếng Đức</p>
              <p className={`text-2xl font-semibold ${colors.text}`}>
                {isNoun && word.artikel && (
                  <span className={`${colors.artikelColor} mr-1`}>{word.artikel}</span>
                )}
                {word.word}
              </p>
              {isNoun && word.plural && (
                <p className="text-xs text-gray-500 mt-1">
                  pl. <span className="font-medium">{word.plural}</span>
                </p>
              )}
            </div>

            {/* Vietnamese Meaning */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiếng Việt</p>
              <p className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>
                {word.meaning_vi}
              </p>
            </div>

            {/* Example Sentence */}
            {word.example_de && (
              <div className="pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Ví dụ</p>
                <p className="text-sm text-gray-700 italic">{word.example_de}</p>
                {word.example_vi && (
                  <p className="text-sm text-gray-600 mt-1">{word.example_vi}</p>
                )}
              </div>
            )}
          </div>

          {/* Flip Hint */}
          <div className="absolute bottom-4 flex items-center gap-2 text-gray-500">
            <RotateCw className="w-4 h-4" />
            <p className="text-sm">Nhấn để quay lại</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Flashcard;
