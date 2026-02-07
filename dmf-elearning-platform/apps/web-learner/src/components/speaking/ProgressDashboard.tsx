'use client';

import { TrendingUp, Award, Target, AlertCircle, LineChart } from 'lucide-react';
import type { SpeakingStats, CEFRLevel } from '@/types/speaking';

interface ProgressDashboardProps {
  stats: SpeakingStats;
  className?: string;
}

export function ProgressDashboard({ stats, className = '' }: ProgressDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // Calculate max for CEFR distribution bar chart
  const maxCEFRCount = Math.max(...cefrLevels.map((level) => stats.cefrDistribution[level] || 0));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Progress Dashboard
        </h2>
        <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Total Submissions"
          value={stats.totalSubmissions.toString()}
          color="blue"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Average Score"
          value={`${stats.averageOverallScore}%`}
          color={stats.averageOverallScore >= 80 ? 'green' : stats.averageOverallScore >= 60 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Pronunciation"
          value={`${stats.averagePronunciation}%`}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Fluency"
          value={`${stats.averageFluency}%`}
          color="indigo"
        />
      </div>

      {/* Dimension Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Average Scores by Dimension
        </h3>
        <div className="space-y-4">
          <ScoreBar label="Pronunciation" score={stats.averagePronunciation} />
          <ScoreBar label="Fluency" score={stats.averageFluency} />
          <ScoreBar label="Vocabulary" score={stats.averageVocabulary} />
          <ScoreBar label="Grammar" score={stats.averageGrammar} />
        </div>
      </div>

      {/* Score Trends (Simple Line Chart) */}
      {stats.scoreHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Score Trends
          </h3>
          <div className="space-y-2">
            {stats.scoreHistory.slice(-10).map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        entry.overall >= 80 ? 'bg-green-500' : entry.overall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${entry.overall}%` }}
                    />
                  </div>
                  <span className={`font-bold ${getScoreColor(entry.overall)}`}>
                    {entry.overall}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEFR Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          CEFR Level Distribution
        </h3>
        <div className="space-y-3">
          {cefrLevels.map((level) => {
            const count = stats.cefrDistribution[level] || 0;
            const percentage = maxCEFRCount > 0 ? (count / maxCEFRCount) * 100 : 0;

            return (
              <div key={level} className="flex items-center gap-3">
                <span className="w-8 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {level}
                </span>
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs font-medium text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Issues */}
      {stats.mostCommonIssues.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Most Common Issues
            </h3>
          </div>
          <ul className="space-y-2">
            {stats.mostCommonIssues.map((issue, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200"
              >
                <span className="font-bold">{index + 1}.</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations (AI-generated placeholder) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Practice speaking for 15-20 minutes daily to improve fluency</li>
          <li>• Focus on pronunciation exercises for words you commonly struggle with</li>
          <li>• Try recording yourself and comparing with native speakers</li>
          <li>• Gradually increase CEFR difficulty level as you improve</li>
        </ul>
      </div>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border border-${color}-200 dark:border-${color}-800`}>
      <div className="flex items-center gap-3">
        <div className={colorClasses[color]}>{icon}</div>
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {score}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
