'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveText } from './InteractiveText';
import { cn } from '@/lib/utils';

interface Passage {
  id: string;
  title: string;
  content: string;
  cefrLevel: string;
  topic: string;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
}

interface PassageDisplayProps {
  passage: Passage;
}

export function PassageDisplay({ passage }: PassageDisplayProps) {
  const [fontSize, setFontSize] = useState(18);
  const [isReadingMode, setIsReadingMode] = useState(false);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(24, prev + 2));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(14, prev - 2));
  };

  const toggleReadingMode = () => {
    setIsReadingMode((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'passage-container',
        isReadingMode &&
          'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto'
      )}
    >
      {/* Header */}
      <div className="passage-header sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary">{passage.cefrLevel}</Badge>
            <Badge variant="outline">{passage.topic}</Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {passage.wordCount} words · {passage.estimatedReadingTimeMinutes} min read
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={decreaseFontSize}
              size="icon"
              variant="ghost"
              aria-label="Decrease font size"
              disabled={fontSize <= 14}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium min-w-[3ch] text-center">
              {fontSize}px
            </span>

            <Button
              onClick={increaseFontSize}
              size="icon"
              variant="ghost"
              aria-label="Increase font size"
              disabled={fontSize >= 24}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            <Button
              onClick={toggleReadingMode}
              size="sm"
              variant={isReadingMode ? 'default' : 'outline'}
              aria-label={isReadingMode ? 'Exit reading mode' : 'Enter reading mode'}
            >
              {isReadingMode ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Focus
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Passage Content */}
      <motion.article
        className="passage-content max-w-3xl mx-auto px-4 py-8"
        style={{ fontSize: `${fontSize}px` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="passage-title text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {passage.title}
        </h1>

        <InteractiveText content={passage.content} passageId={passage.id} />
      </motion.article>
    </div>
  );
}
