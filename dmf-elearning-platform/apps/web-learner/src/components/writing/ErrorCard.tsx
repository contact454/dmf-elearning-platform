'use client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { GrammarError } from '@/types/writing';

interface ErrorCardProps {
  error: GrammarError;
  onApply: (suggestion: string) => void;
  onIgnore: () => void;
}

export function ErrorCard({ error, onApply, onIgnore }: ErrorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100">{error.message}</p>
          
          {error.suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {error.suggestions.slice(0, 3).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApply(suggestion)}
                  className="block w-full text-left px-2 py-1 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                >
                  <CheckIcon className="w-3 h-3 inline mr-1" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onIgnore}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          title="Ignore error"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
