'use client';

import { useState } from 'react';
import { PromptCard } from './PromptCard';
import type { WritingPrompt } from '@/types/writing';

interface PromptSelectorProps {
  prompts: WritingPrompt[];
  onSelect: (promptId: string) => void;
  isLoading?: boolean;
}

export function PromptSelector({ prompts, onSelect, isLoading = false }: PromptSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const levels = ['A1', 'A2', 'B1', 'B2'];
  const categories = Array.from(new Set(prompts.map(p => p.category))).filter(Boolean);

  const filteredPrompts = prompts.filter(prompt => {
    if (selectedLevel && prompt.cefrLevel !== selectedLevel) return false;
    if (selectedCategory && prompt.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Select a Prompt</h1>

      {/* Level filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CEFR Level</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedLevel === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Levels
          </button>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category?.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading prompts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onSelect={() => onSelect(prompt.id)} />
          ))}
        </div>
      )}

      {!isLoading && filteredPrompts.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No prompts found matching your filters.
        </div>
      )}
    </div>
  );
}
