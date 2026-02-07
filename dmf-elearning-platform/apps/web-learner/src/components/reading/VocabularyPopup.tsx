'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VocabularyPopupProps {
  word: string;
  passageId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function VocabularyPopup({
  word,
  passageId,
  position,
  onClose,
}: VocabularyPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock definition data - in production, would fetch from API
  const definition = {
    word: word,
    pronunciation: 'example',
    definition: `The meaning of "${word}" would appear here.`,
    translationVi: `Bản dịch của "${word}" sẽ xuất hiện ở đây.`,
    exampleSentence: `This is an example sentence using the word "${word}".`,
    audioUrl: null,
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production: await API call
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  // Position popup (desktop: near click, mobile: bottom sheet)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Popup content */}
        <motion.div
          initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full',
            isMobile ? 'max-h-[80vh]' : 'max-h-[60vh]'
          )}
          onClick={(e) => e.stopPropagation()}
          style={
            !isMobile && position
              ? {
                  position: 'fixed',
                  left: `${Math.min(position.x, window.innerWidth - 400)}px`,
                  top: `${position.y + 20}px`,
                  transform: 'translateX(-50%)',
                }
              : undefined
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {word}
            </h3>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            ) : definition ? (
              <div className="space-y-4">
                {/* Pronunciation */}
                {definition.pronunciation && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-mono">
                      /{definition.pronunciation}/
                    </span>
                    {definition.audioUrl && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => playAudio(definition.audioUrl!)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Definition */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Definition:
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {definition.definition}
                  </p>
                </div>

                {/* Vietnamese Translation */}
                {definition.translationVi && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Tiếng Việt:
                    </h4>
                    <p className="text-gray-900 dark:text-gray-100">
                      {definition.translationVi}
                    </p>
                  </div>
                )}

                {/* Example Sentence */}
                {definition.exampleSentence && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Example:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      "{definition.exampleSentence}"
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                  size="lg"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Vocabulary
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Definition not found.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
