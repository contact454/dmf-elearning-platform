'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { Flashcard } from './Flashcard'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SkeletonFlashcard, LoadingSpinnerWithText } from '@/components/LoadingStates'

type QualityButton = 1 | 2 | 3 | 4

export function ReviewSession() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: words, isLoading } = useReviewQueue()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const submitReview = useMutation({
    mutationFn: async ({ wordId, quality }: { wordId: string; quality: number }) => {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        setIsFlipped(false)
      } else {
        // Session complete
        queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
        router.push('/en/vocabulary/review/complete')
      }
    }
  })
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFlipped) return // Only rate when flipped
      
      if (e.key === '1') handleRating(1)
      if (e.key === '2') handleRating(2)
      if (e.key === '3') handleRating(3)
      if (e.key === '4') handleRating(4)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex])
  
  // Redirect if no words (using useEffect to avoid render-time side effects)
  useEffect(() => {
    if (!isLoading && (!words || words.length === 0)) {
      router.push('/en/dashboard')
    }
  }, [isLoading, words, router])
  
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
  
  const handleRating = (button: QualityButton) => {
    // Map button to quality score
    const qualityMap: Record<QualityButton, number> = {
      1: 1, // Again
      2: 3, // Hard
      3: 4, // Good
      4: 5  // Easy
    }
    
    submitReview.mutate({
      wordId: currentWord.word.id,
      quality: qualityMap[button]
    })
  }
  
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
          word={currentWord.word}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>
      
      {/* Rating Buttons (show only when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => handleRating(1)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">1</span>
            Quên
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
            onClick={() => handleRating(2)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">2</span>
            Khó
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => handleRating(3)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">3</span>
            Tốt
          </Button>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleRating(4)}
            disabled={submitReview.isPending}
          >
            <span className="mr-2">4</span>
            Dễ
          </Button>
        </div>
      )}
      
      {!isFlipped && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Lật thẻ để đánh giá độ khó
        </p>
      )}
    </div>
  )
}
