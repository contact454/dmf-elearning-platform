'use client';

import { useState } from 'react';
import { VocabularyPopup } from './VocabularyPopup';
import { cn } from '@/lib/utils';

interface InteractiveTextProps {
  content: string;
  passageId: string;
}

export function InteractiveText({ content, passageId }: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Tokenize text into words and punctuation
  const tokens = content.split(/(\s+|[.,!?;:—\-"])/ );

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    // Ignore punctuation and whitespace
    if (/^\s+|[.,!?;:—\-"]$/.test(word)) return;

    setSelectedWord(word);
    setClickPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setClickPosition(null);
  };

  return (
    <div className="interactive-text">
      {tokens.map((token, index) => {
        // Skip whitespace/punctuation rendering as separate components
        if (/^\s+|[.,!?;:—\-"]$/.test(token)) {
          return <span key={index}>{token}</span>;
        }

        return (
          <InteractiveWord
            key={index}
            word={token}
            onSelect={handleWordClick}
          />
        );
      })}

      {selectedWord && clickPosition && (
        <VocabularyPopup
          word={selectedWord}
          passageId={passageId}
          position={clickPosition}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

interface InteractiveWordProps {
  word: string;
  onSelect: (word: string, event: React.MouseEvent) => void;
}

function InteractiveWord({ word, onSelect }: InteractiveWordProps) {
  // Simplified version - in production, would use useVocabularyStatus hook
  // For now, just make words clickable with hover effect
  const status = null; // 'new' | 'learning' | 'known' | null

  const getClassName = () => {
    const base =
      'word cursor-pointer transition-colors duration-150 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-0.5 rounded';

    if (status === 'new') {
      return `${base} text-blue-600 dark:text-blue-400 border-b-2 border-dotted border-blue-600`;
    }

    if (status === 'learning') {
      return `${base} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-300 font-medium`;
    }

    if (status === 'known') {
      return `${base} text-green-600 dark:text-green-400 font-medium`;
    }

    return base;
  };

  return (
    <span
      className={getClassName()}
      onClick={(e) => onSelect(word, e)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onSelect(word, e as any);
        }
      }}
    >
      {word}
    </span>
  );
}
