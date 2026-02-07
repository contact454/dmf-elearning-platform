import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target, Calendar } from 'lucide-react';
import { StreakInfo } from '@/hooks/useChallengeQueries';

interface StreakTrackerProps {
  streakInfo: StreakInfo;
}

export function StreakTracker({ streakInfo }: StreakTrackerProps) {
  const streakPercentage = Math.min(
    (streakInfo.currentStreak / streakInfo.nextMilestone) * 100,
    100
  );

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '🌱';
    if (streak < 7) return '🔥';
    if (streak < 30) return '⚡';
    if (streak < 100) return '🌟';
    return '👑';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak < 7) return 'Great start! Keep it up!';
    if (streak < 30) return 'You\'re on fire! 🔥';
    if (streak < 100) return 'Amazing streak! 🌟';
    return 'Legendary streak! 👑';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Streak Tracker</h3>
          <p className="text-xs text-gray-600">{getStreakMessage(streakInfo.currentStreak)}</p>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl mb-2"
        >
          {getStreakEmoji(streakInfo.currentStreak)}
        </motion.div>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold text-orange-600">
            {streakInfo.currentStreak}
          </span>
          <span className="text-lg text-gray-600">days</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Current Streak</p>
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Next milestone</span>
          <span className="font-medium text-gray-900">
            {streakInfo.nextMilestone} days
          </span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${streakPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-400 to-red-500"
          />
        </div>
        <p className="text-xs text-gray-600 mt-1 text-right">
          {streakInfo.nextMilestone - streakInfo.currentStreak} days to go
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center">
          <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{streakInfo.longestStreak}</p>
          <p className="text-xs text-gray-600">Best Streak</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <Target className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{streakInfo.totalCompleted}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
      </div>

      {/* Last Completed */}
      {streakInfo.lastCompletedDate && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Last completed:{' '}
              {new Date(streakInfo.lastCompletedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Streak Broken Warning */}
      {streakInfo.streakBroken && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center">
            ⚠️ Your streak was broken. Start again today!
          </p>
        </div>
      )}
    </motion.div>
  );
}
