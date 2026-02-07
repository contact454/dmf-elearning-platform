import { motion } from 'framer-motion';
import { Crown, Medal, Award, Target, Flame, Award as BadgeIcon } from 'lucide-react';
import { LeaderboardEntry } from '@/services/german-api';
import { CountUp } from '@/components/ui';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  index: number;
  timeframe: 'weekly' | 'monthly' | 'all-time';
}

export function LeaderboardCard({ entry, index, timeframe }: LeaderboardCardProps) {
  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-600">#{rank}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 hover:bg-gray-50 transition ${
        entry.isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <RankBadge rank={entry.rank} />

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
          {entry.avatar ? (
            <img src={entry.avatar} alt={entry.displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            entry.displayName.charAt(0).toUpperCase()
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{entry.displayName}</p>
            {entry.isCurrentUser && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                You
              </span>
            )}
            {entry.rank <= 3 && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded shadow-sm">
                TOP {entry.rank}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">@{entry.username}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {entry.level}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {entry.streak} day{entry.streak !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <BadgeIcon className="w-3 h-3 text-blue-500" />
              {entry.badges} badge{entry.badges !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">
            <CountUp end={entry.totalPoints} />
          </p>
          <p className="text-sm text-gray-500">points</p>
          {timeframe === 'weekly' && entry.weeklyPoints !== undefined && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              +{entry.weeklyPoints} this week
            </p>
          )}
          {timeframe === 'monthly' && entry.monthlyPoints !== undefined && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              +{entry.monthlyPoints} this month
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
