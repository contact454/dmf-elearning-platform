import { motion } from 'framer-motion';
import { Award, Star, Trophy, Zap, Gift } from 'lucide-react';
import { DailyChallenge } from '@/hooks/useChallengeQueries';

interface RewardsPanelProps {
  challenge: DailyChallenge;
}

export function RewardsPanel({ challenge }: RewardsPanelProps) {
  const rewards = [
    {
      icon: <Trophy className="w-4 h-4" />,
      label: 'Points',
      value: challenge.maxPoints,
      color: 'amber',
      description: 'Total points available',
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'XP Boost',
      value: '+50%',
      color: 'blue',
      description: 'Extra experience',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Streak Bonus',
      value: '+25',
      color: 'orange',
      description: 'For consecutive days',
    },
  ];

  const milestones = [
    { score: 50, reward: 'Bronze Badge', icon: '🥉' },
    { score: 75, reward: 'Silver Badge', icon: '🥈' },
    { score: 90, reward: 'Gold Badge', icon: '🥇' },
    { score: 100, reward: 'Perfect Score!', icon: '💎' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Rewards</h3>
          <p className="text-xs text-gray-600">What you can earn</p>
        </div>
      </div>

      {/* Rewards List */}
      <div className="space-y-3 mb-6">
        {rewards.map((reward, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-lg p-3 border-2 border-${reward.color}-200`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-${reward.color}-100 flex items-center justify-center text-${reward.color}-600`}>
                  {reward.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{reward.label}</p>
                  <p className="text-xs text-gray-600">{reward.description}</p>
                </div>
              </div>
              <span className={`text-lg font-bold text-${reward.color}-600`}>
                {reward.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      <div className="border-t-2 border-purple-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-purple-600" />
          Score Milestones
        </h4>
        <div className="space-y-2">
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-white rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{milestone.icon}</span>
                <div>
                  <p className="text-xs font-medium text-gray-900">
                    {milestone.reward}
                  </p>
                  <p className="text-xs text-gray-600">
                    {milestone.score === 100 ? 'Perfect' : `${milestone.score}%+`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
        <p className="text-xs text-gray-700 text-center font-medium">
          🎁 Complete before midnight for daily bonus!
        </p>
      </div>
    </motion.div>
  );
}
