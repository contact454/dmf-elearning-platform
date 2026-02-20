'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { Flashcard } from './Flashcard'
import { ProgressBar } from '@/components/ui/progress'
import { usePathname, useRouter } from 'next/navigation'
import { SkeletonFlashcard, LoadingSpinnerWithText } from '@/components/LoadingStates'

type CardRating = 0 | 1 | 2 | 3

export function ReviewSession() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { data: words, isLoading } = useReviewQueue()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const locale = pathname?.split('/')[1] || 'en'
  
  const submitReview = useMutation({
    mutationFn: async ({ wordId, quality }: { wordId: string; quality: number }) => {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId, quality })
      })
      
      if (!response.ok) throw new Error('Failed to submit review')
      return response.json()
    },
    onSuccess: () => {
      // Move to next card
      if (currentIndex < (words?.length || 0) - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Session complete
        queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
        router.push(`/${locale}/vocabulary/review/complete`)
      }
    }
  })

  const handleRating = useCallback(
    (rating: CardRating) => {
      if (!words || words.length === 0) {
        return
      }

      const currentWord = words[currentIndex]
      if (!currentWord) {
        return
      }

      // Map button to quality score
      const qualityMap: Record<CardRating, number> = {
        0: 1, // Again
        1: 3, // Hard
        2: 4, // Good
        3: 5  // Easy
      }
      
      submitReview.mutate({
        wordId: currentWord.word.id,
        quality: qualityMap[rating]
      })
    },
    [currentIndex, submitReview, words]
  )
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleRating(0)
      if (e.key === '2') handleRating(1)
      if (e.key === '3') handleRating(2)
      if (e.key === '4') handleRating(3)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRating])
  
  // Redirect if no words (using useEffect to avoid render-time side effects)
  useEffect(() => {
    if (!isLoading && (!words || words.length === 0)) {
      router.push(`/${locale}/dashboard`)
    }
  }, [isLoading, words, router, locale])
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinnerWithText text="Đang tải danh sách ôn tập..." />
        <div className="mt-8 flex justify-center">
          <SkeletonFlashcard />
        </div>
      </div>
    )
  }
  
  if (!words || words.length === 0) {
    return null // Will redirect via useEffect
  }
  
  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentIndex + 1} / {words.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      
      {/* Flashcard */}
      <div className="mb-8 flex justify-center">
        <Flashcard
          word={currentWord.word.word}
          meaning={currentWord.word.translation}
          level={currentWord.word.level}
          example={currentWord.word.exampleSentence}
          onRate={handleRating}
        />
      </div>

      {submitReview.isPending && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Đang lưu kết quả ôn tập...
        </p>
      )}
    </div>
  )
}
