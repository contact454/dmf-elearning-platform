'use client';

import Link from 'next/link';
import type { Essay } from '@/types/writing';

interface EssayDashboardProps {
  essays: Essay[];
  isLoading?: boolean;
}

export function EssayDashboard({ essays, isLoading = false }: EssayDashboardProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading essays...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Essays</h1>
        <Link
          href="/writing/prompts"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          New Essay
        </Link>
      </div>

      {essays.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven&apos;t written any essays yet.</p>
          <Link href="/writing/prompts" className="text-blue-600 dark:text-blue-400 hover:underline">
            Get started →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {essays.map((essay) => (
            <EssayRow key={essay.id} essay={essay} />
          ))}
        </div>
      )}
    </div>
  );
}

function EssayRow({ essay }: { essay: Essay }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 dark:text-gray-400';
      case 'submitted': return 'text-blue-600 dark:text-blue-400';
      case 'reviewed': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Link
      href={`/writing/essays/${essay.id}`}
      className="block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {essay.prompt?.title || 'Untitled Essay'}
            </h3>
            <span className={`text-xs capitalize ${getStatusColor(essay.status)}`}>
              ({essay.status})
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {essay.content.substring(0, 150)}...
          </p>
        </div>

        <div className="ml-4 text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(essay.createdAt)}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{essay.wordCount} words</span>
            <span>{essay.errorCount} errors</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
