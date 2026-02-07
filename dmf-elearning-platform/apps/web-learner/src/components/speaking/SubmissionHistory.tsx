'use client';

import { useState } from 'react';
import { Play, Trash2, Eye, Calendar, Award, Filter } from 'lucide-react';
import type { SpeakingSubmission, CEFRLevel } from '@/types/speaking';

interface SubmissionHistoryProps {
  submissions: SpeakingSubmission[];
  onPlayRecording?: (audioUrl: string) => void;
  onViewFeedback?: (submission: SpeakingSubmission) => void;
  onDelete?: (submissionId: string) => void;
  className?: string;
}

export function SubmissionHistory({
  submissions,
  onPlayRecording,
  onViewFeedback,
  onDelete,
  className = '',
}: SubmissionHistoryProps) {
  const [filterCEFR, setFilterCEFR] = useState<CEFRLevel | 'all'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'week' | 'month'>('all');

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesCEFR =
      filterCEFR === 'all' || submission.prompt?.cefrLevel === filterCEFR;

    let matchesDate = true;
    if (filterDate !== 'all') {
      const submissionDate = new Date(submission.createdAt);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (filterDate === 'week') matchesDate = daysDiff <= 7;
      if (filterDate === 'month') matchesDate = daysDiff <= 30;
    }

    return matchesCEFR && matchesDate;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Submission History
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CEFR:
          </span>
          <select
            value={filterCEFR}
            onChange={(e) => setFilterCEFR(e.target.value as CEFRLevel | 'all')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
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
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date:
          </span>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value as 'all' | 'week' | 'month')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Info */}
              <div className="flex-1 space-y-2">
                {/* Date and CEFR */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(submission.createdAt)}
                  </span>
                  {submission.prompt && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {submission.prompt.cefrLevel}
                    </span>
                  )}
                  {submission.prompt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {submission.prompt.topic}
                    </span>
                  )}
                </div>

                {/* Question */}
                {submission.prompt && (
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {submission.prompt.question}
                  </p>
                )}

                {/* Duration and Status */}
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Duration: {formatDuration(submission.durationSeconds)}</span>
                  <span>•</span>
                  <span className="capitalize">{submission.status}</span>
                </div>

                {/* Scores */}
                {submission.feedback && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Overall:
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(submission.feedback.scores.overall)}`}>
                        {submission.feedback.scores.overall}
                      </span>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        P: {submission.feedback.scores.pronunciation}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        F: {submission.feedback.scores.fluency}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        V: {submission.feedback.scores.vocabulary}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        G: {submission.feedback.scores.grammar}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col gap-2">
                {onPlayRecording && (
                  <button
                    onClick={() => onPlayRecording(submission.audioUrl)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Play Recording"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}

                {submission.feedback && onViewFeedback && (
                  <button
                    onClick={() => onViewFeedback(submission)}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="View Feedback"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this submission?')) {
                        onDelete(submission.id);
                      }
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No submissions found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or start practicing!
          </p>
        </div>
      )}
    </div>
  );
}
