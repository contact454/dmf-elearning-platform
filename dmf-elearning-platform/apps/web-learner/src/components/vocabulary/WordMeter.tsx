'use client'

import { cn } from '@/lib/utils'

type Status = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'

interface WordMeterProps {
  status: Status
  accuracy: number // 0-1
  totalReviews?: number
  className?: string
}

const statusConfig = {
  NEW: {
    label: 'Mới',
    color: 'bg-gray-400',
    progress: 0
  },
  LEARNING: {
    label: 'Đang học',
    color: 'bg-yellow-500',
    progress: 25
  },
  REVIEW: {
    label: 'Ôn tập',
    color: 'bg-orange-500',
    progress: 50
  },
  MASTERED: {
    label: 'Thuộc lòng',
    color: 'bg-green-600',
    progress: 100
  }
}

export function WordMeter({ status, accuracy, totalReviews = 0, className }: WordMeterProps) {
  const config = statusConfig[status]
  const accuracyPercent = Math.round(accuracy * 100)
  
  return (
    <div className={cn('w-full', className)}>
      {/* Status Label */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {config.label}
        </span>
        <span className="text-xs text-gray-500">
          {totalReviews} lần ôn • {accuracyPercent}% đúng
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            config.color
          )}
          style={{ width: `${config.progress}%` }}
          role="progressbar"
          aria-valuenow={config.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${config.label}`}
        />
      </div>
      
      {/* Stages */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Mới</span>
        <span>Đang học</span>
        <span>Ôn tập</span>
        <span>Thuộc lòng</span>
      </div>
    </div>
  )
}
