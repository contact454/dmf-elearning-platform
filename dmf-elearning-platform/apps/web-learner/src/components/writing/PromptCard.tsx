'use client';

import type { WritingPrompt } from '@/types/writing';

interface PromptCardProps {
  prompt: WritingPrompt;
  onSelect: () => void;
}

export function PromptCard({ prompt, onSelect }: PromptCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'A2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'B1': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'B2': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <button
      onClick={onSelect}
      className="text-left bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(prompt.cefrLevel)}`}>
          {prompt.cefrLevel}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{prompt.targetWordCount} words</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{prompt.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{prompt.description}</p>

      <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
        Start writing →
      </div>
    </button>
  );
}
