import { motion } from 'framer-motion';
import { X, Trophy, Medal, Award, Clock } from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useChallengeQueries';

interface LeaderboardPreviewProps {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  onClose: () => void;
}

export function LeaderboardPreview({
  leaderboard,
  isLoading,
  onClose,
}: LeaderboardPreviewProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Leaderboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/90">Today's top performers</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
              <p className="text-gray-600">Be the first to complete today's challenge!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: entry.rank * 0.05 }}
                  className={`rounded-xl p-4 ${
                    entry.isCurrentUser
                      ? 'bg-blue-50 border-2 border-blue-300 ring-2 ring-blue-100'
                      : entry.rank <= 3
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(
                        entry.rank
                      )}`}
                    >
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {entry.userName}
                        </h3>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {entry.score} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(entry.timeSpent)}
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">
                        {entry.score}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Complete today's challenge to join the leaderboard!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
