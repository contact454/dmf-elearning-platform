'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Plus, X, BookOpen, Loader2 } from 'lucide-react';
import { getVocabularyByWord, DbVocabularyItem } from '@/services/german-api';
import { useSpeaking } from '@/hooks/useSpeaking';

export interface DictionarySavePayload {
  word: string;
  meaning_vi: string;
  example_de?: string | null;
}

interface PopupDictionaryProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToReview?: (word: DictionarySavePayload) => Promise<void> | void;
  userId?: string;
}

export function PopupDictionary({
  word,
  position,
  onClose,
  onAddToReview,
}: PopupDictionaryProps) {
  const [vocabData, setVocabData] = useState<DbVocabularyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [manualTranslation, setManualTranslation] = useState('');
  const { speak, isSpeaking, isSupported } = useSpeaking({ rate: 0.85 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch word data
  useEffect(() => {
    async function fetchWord() {
      setLoading(true);
      setError(null);
      setSaveMessage(null);
      setManualTranslation('');
      try {
        const data = await getVocabularyByWord(word);
        setVocabData(data);
      } catch (err) {
        setVocabData(null);
        setError('Word not found in vocabulary');
      } finally {
        setLoading(false);
      }
    }
    fetchWord();
  }, [word]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSpeak = useCallback(() => {
    speak(word);
  }, [speak, word]);

  const handleAddToReview = useCallback(async () => {
    if (!onAddToReview || isSaving) {
      return;
    }

    const payload: DictionarySavePayload =
      vocabData !== null
        ? {
            word: vocabData.word,
            meaning_vi: vocabData.meaning_vi,
            example_de: vocabData.example_de,
          }
        : {
            word,
            meaning_vi: manualTranslation.trim(),
          };

    if (!payload.meaning_vi) {
      setSaveMessage('Please enter Vietnamese meaning first.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      await onAddToReview(payload);
      setSaveMessage('Added to review queue');
    } catch (saveError) {
      console.error('Failed to save word from popup dictionary:', saveError);
      setSaveMessage('Failed to add word. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, manualTranslation, onAddToReview, vocabData, word]);

  // Calculate position to keep popup in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y + 20, window.innerHeight - 300),
  };

  // Gender color
  const getGenderColor = (vocab: DbVocabularyItem) => {
    if (vocab.gender === 'm' || vocab.artikel === 'der') return 'blue';
    if (vocab.gender === 'f' || vocab.artikel === 'die') return 'pink';
    if (vocab.gender === 'n' || vocab.artikel === 'das') return 'green';
    return 'gray';
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium text-sm">Dictionary</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-2">{error}</p>
              <p className="text-lg font-medium text-gray-700">{word}</p>
              {isSupported && (
                <button
                  onClick={handleSpeak}
                  className="mt-3 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-indigo-500' : 'text-gray-600'}`} />
                </button>
              )}
              {onAddToReview && (
                <div className="mt-4 space-y-2 text-left">
                  <label className="text-xs text-gray-500 block">Vietnamese meaning</label>
                  <input
                    value={manualTranslation}
                    onChange={(event) => setManualTranslation(event.target.value)}
                    placeholder="Nhập nghĩa tiếng Việt..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    onClick={handleAddToReview}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Add to Review Queue'}
                  </button>
                </div>
              )}
              {saveMessage && (
                <p className="text-xs text-center text-gray-600 mt-3">{saveMessage}</p>
              )}
            </div>
          ) : vocabData ? (
            <div className="space-y-3">
              {/* Word with article */}
              <div className="flex items-start justify-between">
                <div>
                  {vocabData.artikel && (
                    <span className={`text-sm font-medium text-${getGenderColor(vocabData)}-600 mr-1`}>
                      {vocabData.artikel}
                    </span>
                  )}
                  <span className="text-xl font-bold text-gray-900">{vocabData.word}</span>
                  {vocabData.plural && (
                    <span className="text-xs text-gray-500 ml-2">pl. {vocabData.plural}</span>
                  )}
                </div>
                {isSupported && (
                  <button
                    onClick={handleSpeak}
                    className={`p-2 rounded-full transition ${
                      isSpeaking ? 'bg-indigo-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-indigo-500 animate-pulse' : 'text-gray-600'}`} />
                  </button>
                )}
              </div>

              {/* Level & POS badges */}
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {vocabData.level}
                </span>
                {vocabData.pos && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {vocabData.pos}
                  </span>
                )}
              </div>

              {/* Vietnamese meaning */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Vietnamese</p>
                <p className="text-lg font-medium text-gray-900">{vocabData.meaning_vi}</p>
              </div>

              {/* Example */}
              {vocabData.example_de && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Example</p>
                  <p className="text-sm text-gray-700 italic">{vocabData.example_de}</p>
                  {vocabData.example_vi && (
                    <p className="text-sm text-gray-500 mt-1">{vocabData.example_vi}</p>
                  )}
                </div>
              )}

              {/* Add to review button */}
              {onAddToReview && (
                <button
                  onClick={handleAddToReview}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Add to Review Queue'}
                </button>
              )}

              {saveMessage && (
                <p className="text-xs text-center text-gray-600">{saveMessage}</p>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// Interactive Text Component
// ═══════════════════════════════════════════════════════════════

interface InteractiveTextProps {
  content: string;
  knownWords?: Set<string>;
  onWordClick?: (word: string, position: { x: number; y: number }) => void;
  highlightUnknown?: boolean;
}

export function InteractiveText({
  content,
  knownWords = new Set(),
  onWordClick,
  highlightUnknown = true,
}: InteractiveTextProps) {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    if (onWordClick) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      onWordClick(word, { x: rect.left, y: rect.bottom });
    }
  };

  const renderWord = (word: string, index: number) => {
    // Clean word for lookup (remove punctuation)
    const cleanWord = word.toLowerCase().replace(/[^\wäöüßÄÖÜ]/g, '');
    const isKnown = knownWords.has(cleanWord);
    const hasPunctuation = word !== cleanWord;
    const punctuation = word.replace(cleanWord, '');

    if (cleanWord.length === 0) {
      return <span key={index}>{word} </span>;
    }

    return (
      <span key={index}>
        <span
          onClick={(e) => handleWordClick(e, cleanWord)}
          className={`cursor-pointer transition-colors rounded px-0.5 ${
            highlightUnknown && !isKnown
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900'
              : 'hover:bg-indigo-100 hover:text-indigo-700'
          }`}
        >
          {cleanWord}
        </span>
        {hasPunctuation && punctuation}{' '}
      </span>
    );
  };

  const renderParagraph = (paragraph: string, pIndex: number) => {
    const words = paragraph.split(/\s+/);
    return (
      <p key={pIndex} className="mb-4 leading-relaxed text-gray-800">
        {words.map((word, wIndex) => renderWord(word, wIndex))}
      </p>
    );
  };

  return <div className="prose prose-lg max-w-none">{paragraphs.map(renderParagraph)}</div>;
}

export default PopupDictionary;
