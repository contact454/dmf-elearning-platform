'use client';

import { Award, Clock, Flame } from 'lucide-react';

interface ProgressDisplayProps {
  current: number;
  total: number;
  score: number;
  maxScore: number;
  timeElapsed?: number;
  streak?: number;
}

export default function ProgressDisplay({
  current,
  total,
  score,
  maxScore,
  timeElapsed,
  streak
}: ProgressDisplayProps) {
  const progressPercentage = (current / total) * 100;
  const scorePercentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Exercise Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Exercise {current} of {total}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {/* Score */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Score</p>
            <p className="text-sm font-bold text-gray-900">
              {score} / {maxScore}
              <span className="text-xs text-gray-500 ml-1">
                ({Math.round(scorePercentage)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Time */}
        {timeElapsed !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-bold text-gray-900">
                {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
        )}

        {/* Streak */}
        {streak !== undefined && streak > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Streak</p>
              <p className="text-sm font-bold text-gray-900">
                {streak}
                <span className="text-xs text-gray-500 ml-1">days</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
