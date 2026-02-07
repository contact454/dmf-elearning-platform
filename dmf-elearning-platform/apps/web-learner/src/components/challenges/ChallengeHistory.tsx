import { motion } from 'framer-motion';
import { X, Calendar, Trophy, Clock, TrendingUp, Award } from 'lucide-react';
import { ChallengeHistory as ChallengeHistoryType } from '@/hooks/useChallengeQueries';

interface ChallengeHistoryProps {
  history: ChallengeHistoryType[];
  isLoading: boolean;
  onClose: () => void;
}

export function ChallengeHistory({
  history,
  isLoading,
  onClose,
}: ChallengeHistoryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Challenge History
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/90">Your past challenge performances</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
              <p className="text-gray-600">Complete your first challenge to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {entry.challenge.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {entry.challenge.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold px-3 py-1 rounded-lg ${getScoreColor(
                          entry.percentage
                        )}`}
                      >
                        {entry.percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                      <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">
                        {entry.score}/{entry.maxScore}
                      </p>
                      <p className="text-xs text-gray-600">Score</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                      <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">#{entry.rank}</p>
                      <p className="text-xs text-gray-600">Rank</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                      <Clock className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">
                        {formatTime(entry.timeSpent)}
                      </p>
                      <p className="text-xs text-gray-600">Time</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                      <Award className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">
                        {entry.totalParticipants}
                      </p>
                      <p className="text-xs text-gray-600">Players</p>
                    </div>
                  </div>

                  {/* Challenge Type */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium capitalize">
                        {entry.challenge.type}
                      </span>{' '}
                      • {entry.challenge.questions.length} questions • Completed{' '}
                      {new Date(entry.completedAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total challenges: {history.length}</span>
            {history.length > 0 && (
              <span>
                Average score:{' '}
                {Math.round(
                  history.reduce((sum, h) => sum + h.percentage, 0) / history.length
                )}
                %
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
