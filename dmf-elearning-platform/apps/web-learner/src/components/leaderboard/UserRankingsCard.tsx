import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Crown, Target, Star } from 'lucide-react';

interface UserRankingsCardProps {
  rankings: {
    global: number;
    weekly: number;
    monthly: number;
    byLevel: Record<string, number>;
    byModule: Record<string, number>;
  };
}

export function UserRankingsCard({ rankings }: UserRankingsCardProps) {
  // Find best module ranking
  const moduleEntries = Object.entries(rankings.byModule || {});
  const bestModule = moduleEntries.length > 0
    ? moduleEntries.reduce((best, current) => 
        current[1] < best[1] ? current : best
      )
    : null;

  // Find best level ranking
  const levelEntries = Object.entries(rankings.byLevel || {});
  const bestLevel = levelEntries.length > 0
    ? levelEntries.reduce((best, current) => 
        current[1] < best[1] ? current : best
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white shadow-lg"
    >
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Your Rankings
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Global Rank */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 opacity-80" />
            <p className="text-sm opacity-90">Global</p>
          </div>
          <p className="text-3xl font-bold">#{rankings.global}</p>
        </div>

        {/* Weekly Rank */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 opacity-80" />
            <p className="text-sm opacity-90">Weekly</p>
          </div>
          <p className="text-3xl font-bold">#{rankings.weekly}</p>
        </div>

        {/* Monthly Rank */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <p className="text-sm opacity-90">Monthly</p>
          </div>
          <p className="text-3xl font-bold">#{rankings.monthly}</p>
        </div>

        {/* Best Achievement */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 opacity-80" />
            <p className="text-sm opacity-90">Best Rank</p>
          </div>
          <p className="text-3xl font-bold">
            #{Math.min(rankings.global, rankings.weekly, rankings.monthly)}
          </p>
        </div>
      </div>

      {/* Best Performance Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestModule && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-2">🏆 Best Module</p>
            <p className="text-lg font-bold capitalize">
              {bestModule[0]} - #{bestModule[1]}
            </p>
          </div>
        )}

        {bestLevel && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-90 mb-2">🎯 Best Level</p>
            <p className="text-lg font-bold">
              {bestLevel[0]} - #{bestLevel[1]}
            </p>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm opacity-90 text-center">
          {rankings.global <= 10
            ? "🔥 You're a top 10 learner! Amazing work!"
            : rankings.global <= 50
            ? "⭐ Keep pushing! You're in the top 50!"
            : rankings.global <= 100
            ? "💪 Great job! You're in the top 100!"
            : "🚀 Keep learning to climb the rankings!"}
        </p>
      </div>
    </motion.div>
  );
}
