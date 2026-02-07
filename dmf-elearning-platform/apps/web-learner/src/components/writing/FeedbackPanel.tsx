'use client';

import type { GrammarError, WritingStats } from '@/types/writing';
import { ErrorCard } from './ErrorCard';
import { StatsDisplay } from './StatsDisplay';

interface FeedbackPanelProps {
  errors: GrammarError[];
  stats: WritingStats;
  onApply: (errorId: string, suggestion: string) => void;
  onIgnore: (errorId: string) => void;
}

export function FeedbackPanel({ errors, stats, onApply, onIgnore }: FeedbackPanelProps) {
  const groupedErrors = {
    grammar: errors.filter(e => e.type === 'grammar'),
    spelling: errors.filter(e => e.type === 'spelling'),
    style: errors.filter(e => e.type === 'style'),
  };

  return (
    <div className="w-96 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback</h2>
      </div>

      {/* Stats */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <StatsDisplay {...stats} />
      </div>

      {/* Errors by type */}
      <div className="p-4 space-y-4">
        {groupedErrors.grammar.length > 0 && (
          <ErrorSection
            title="Grammar"
            errors={groupedErrors.grammar}
            color="red"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {groupedErrors.spelling.length > 0 && (
          <ErrorSection
            title="Spelling"
            errors={groupedErrors.spelling}
            color="blue"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {groupedErrors.style.length > 0 && (
          <ErrorSection
            title="Style"
            errors={groupedErrors.style}
            color="orange"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {errors.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No errors found! Great job! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ErrorSectionProps {
  title: string;
  errors: GrammarError[];
  color: 'red' | 'blue' | 'orange';
  onApply: (errorId: string, suggestion: string) => void;
  onIgnore: (errorId: string) => void;
}

function ErrorSection({ title, errors, color, onApply, onIgnore }: ErrorSectionProps) {
  const colorClasses = {
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div>
      <h3 className={`text-sm font-medium mb-2 ${colorClasses[color]}`}>
        {title} ({errors.length})
      </h3>
      <div className="space-y-2">
        {errors.map((error: GrammarError) => (
          <ErrorCard
            key={error.id}
            error={error}
            onApply={(suggestion) => onApply(error.id, suggestion)}
            onIgnore={() => onIgnore(error.id)}
          />
        ))}
      </div>
    </div>
  );
}
