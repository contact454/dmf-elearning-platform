'use client'

import { Loader2 } from 'lucide-react'

// Loading Spinner - General purpose
export function LoadingSpinner({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
    </div>
  )
}

// Loading Spinner with Text
export function LoadingSpinnerWithText({ text = 'Đang tải...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="text-gray-600">{text}</span>
    </div>
  )
}

// Skeleton Loader - Card
export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

// Skeleton Loader - Flashcard
export function SkeletonFlashcard() {
  return (
    <div className="w-full max-w-xl h-96 bg-white rounded-2xl shadow-xl border-2 border-gray-200 animate-pulse">
      <div className="flex flex-col items-center justify-center h-full p-8">
        {/* Badges */}
        <div className="flex gap-2 mb-8">
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
        
        {/* Word */}
        <div className="h-16 w-48 bg-gray-200 rounded mb-8"></div>
        
        {/* Audio Button */}
        <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}

// Skeleton Loader - Word List
export function SkeletonWordList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton Loader - Streak Widget
export function SkeletonStreakWidget() {
  return (
    <div className="w-full animate-pulse">
      {/* Main streak */}
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      
      {/* Milestones */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
            <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Full Page Loading
export function PageLoading({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  )
}

// Progress Indicator (for multi-step processes)
export function ProgressIndicator({ 
  current, 
  total, 
  label 
}: { 
  current: number
  total: number
  label?: string 
}) {
  const percentage = Math.round((current / total) * 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{label || 'Tiến độ'}</span>
        <span>{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Empty State
export function EmptyState({ 
  icon, 
  title, 
  description,
  action
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
