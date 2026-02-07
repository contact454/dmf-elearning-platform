'use client';

import { useState } from 'react';
import { Search, Filter, Shuffle, BookOpen } from 'lucide-react';
import type { SpeakingPrompt, CEFRLevel } from '@/types/speaking';

interface PromptSelectorProps {
  prompts: SpeakingPrompt[];
  onSelectPrompt: (prompt: SpeakingPrompt) => void;
  selectedPromptId?: string;
  className?: string;
}

export function PromptSelector({
  prompts,
  onSelectPrompt,
  selectedPromptId,
  className = '',
}: PromptSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCEFR, setSelectedCEFR] = useState<CEFRLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Extract unique topics
  const topics = Array.from(new Set(prompts.map((p) => p.topic)));

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      searchQuery === '' ||
      prompt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCEFR = selectedCEFR === 'all' || prompt.cefrLevel === selectedCEFR;
    const matchesTopic = selectedTopic === 'all' || prompt.topic === selectedTopic;

    return matchesSearch && matchesCEFR && matchesTopic;
  });

  // Random prompt
  const handleRandomPrompt = () => {
    if (filteredPrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredPrompts.length);
      onSelectPrompt(filteredPrompts[randomIndex]);
    }
  };

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const cefrColors: Record<CEFRLevel, string> = {
    A1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    A2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    B1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    B2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    C1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    C2: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Speaking Prompts
        </h2>
        <button
          onClick={handleRandomPrompt}
          disabled={filteredPrompts.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          <Shuffle className="w-4 h-4" />
          Random
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CEFR:
          </span>
          <select
            value={selectedCEFR}
            onChange={(e) => setSelectedCEFR(e.target.value as CEFRLevel | 'all')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            {cefrLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Topic:
          </span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
      </p>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt)}
            className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
              selectedPromptId === prompt.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  cefrColors[prompt.cefrLevel]
                }`}
              >
                {prompt.cefrLevel}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {prompt.topic}
              </span>
            </div>

            {/* Question */}
            <div className="flex items-start gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-3">
                {prompt.question}
              </p>
            </div>

            {/* Time info */}
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span>Prep: {Math.floor(prompt.preparationTimeSeconds / 60)}m</span>
              <span>•</span>
              <span>Speak: {Math.floor(prompt.speakingTimeSeconds / 60)}m</span>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No prompts found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
