'use client';

import type { WritingStats } from '@/types/writing';

export function StatsDisplay({ wordCount, errorCount, writingTime }: WritingStats) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const errorRate = wordCount > 0 ? ((errorCount / wordCount) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Words</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{wordCount}</p>
      </div>
      
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Errors</p>
        <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{errorCount}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{errorRate}% rate</p>
      </div>
      
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatTime(writingTime)}</p>
      </div>
    </div>
  );
}
