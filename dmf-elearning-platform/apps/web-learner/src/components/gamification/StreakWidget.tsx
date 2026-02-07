'use client'

import { useStreak } from '@/hooks/useStreak'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { SkeletonStreakWidget } from '@/components/LoadingStates'

export function StreakWidget() {
  const { data: streak, isLoading } = useStreak()
  
  if (isLoading || !streak) {
    return <SkeletonStreakWidget />
  }
  
  const progressToMilestone = streak.nextMilestone
    ? (streak.currentStreak / streak.nextMilestone) * 100
    : 100
  
  // Milestone badges configuration
  const milestones = [
    { days: 7, label: '1 Tuần', emoji: '🔥', achieved: streak.currentStreak >= 7 },
    { days: 30, label: '1 Tháng', emoji: '💪', achieved: streak.currentStreak >= 30 },
    { days: 100, label: '100 Ngày', emoji: '🏆', achieved: streak.currentStreak >= 100 },
    { days: 365, label: '1 Năm', emoji: '👑', achieved: streak.currentStreak >= 365 },
  ]
  
  return (
    <div className="w-full">
      {/* Main Streak Display */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        {/* Flame Icon */}
        <motion.div
          animate={streak.isActiveToday ? {
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <Flame
            className={`w-12 h-12 ${
              streak.isActiveToday ? 'text-orange-500' : 'text-gray-400'
            }`}
            fill="currentColor"
          />
        </motion.div>
        
        {/* Streak Info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-orange-600">
              {streak.currentStreak}
            </p>
            <span className="text-sm text-gray-600">ngày</span>
          </div>
          <p className="text-sm text-gray-600">
            Streak hiện tại
          </p>
          
          {/* Progress to next milestone */}
          {streak.nextMilestone && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{streak.currentStreak}</span>
                <span className="font-medium">
                  Mốc tiếp theo: {streak.nextMilestone} ngày
                </span>
              </div>
              <ProgressBar value={progressToMilestone} size="sm" />
            </div>
          )}
        </div>
        
        {/* Longest Streak Badge */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">
            {streak.longestStreak}
          </p>
          <p className="text-xs text-gray-500">
            Dài nhất
          </p>
        </div>
      </div>
      
      {/* Milestone Badges */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.days}
            className={`p-3 rounded-lg border text-center transition-all ${
              milestone.achieved
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">
              {milestone.achieved ? milestone.emoji : '🔒'}
            </div>
            <p className={`text-xs font-medium ${
              milestone.achieved ? 'text-orange-700' : 'text-gray-500'
            }`}>
              {milestone.label}
            </p>
            <p className="text-xs text-gray-500">
              {milestone.days} ngày
            </p>
          </div>
        ))}
      </div>
      
      {/* Next Goal Countdown */}
      {streak.nextMilestone && streak.daysUntilMilestone !== null && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-center text-blue-700">
            <span className="font-bold">{streak.daysUntilMilestone}</span> ngày nữa để đạt mốc{' '}
            <span className="font-bold">{streak.nextMilestone} ngày</span>! 🎯
          </p>
        </div>
      )}
    </div>
  )
}
