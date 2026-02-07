import { motion } from 'framer-motion';
import { Users, Star, Target, Flame } from 'lucide-react';
import { LeaderboardStats as Stats } from '@/services/german-api';
import { CountUp } from '@/components/ui';

interface LeaderboardStatsProps {
  stats: Stats;
}

export function LeaderboardStatsCards({ stats }: LeaderboardStatsProps) {
  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Star,
      label: 'Avg Points',
      value: stats.averagePoints,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Target,
      label: 'Top Level',
      value: stats.topLevel,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      isText: true,
    },
    {
      icon: Flame,
      label: 'Top Streak',
      value: stats.highestStreak,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      suffix: 'days',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            {stat.isText ? (
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            ) : (
              <CountUp 
                end={typeof stat.value === 'number' ? stat.value : 0} 
                className="text-2xl font-bold text-gray-900" 
              />
            )}
            {stat.suffix && (
              <span className="text-sm text-gray-500">{stat.suffix}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
