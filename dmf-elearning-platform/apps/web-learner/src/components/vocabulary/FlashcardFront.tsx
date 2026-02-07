'use client'

import { Volume2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAudio } from '@/hooks/useAudio'

interface FlashcardFrontProps {
  word: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  wordType: string
  wordId: string
}

export function FlashcardFront({ word, level, wordType, wordId }: FlashcardFrontProps) {
  const { isPlaying, isLoading, error, play } = useAudio(wordId, word)
  
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't flip card
    play()
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
      {/* Badges */}
      <div className="flex gap-2 mb-8">
        <Badge variant="secondary" className="text-sm">
          {level}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {wordType}
        </Badge>
      </div>
      
      {/* German Word */}
      <h2 className="text-6xl font-bold text-gray-900 mb-8 text-center">
        {word}
      </h2>
      
      {/* Audio Button */}
      <button
        onClick={handleAudioClick}
        disabled={isLoading || isPlaying}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
          isPlaying 
            ? 'bg-green-500 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={`Play pronunciation of ${word}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
        )}
        <span>{isPlaying ? 'Đang phát...' : 'Phát âm'}</span>
      </button>
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-red-500 text-xs">{error}</p>
      )}
      
      {/* Hint */}
      <p className="mt-8 text-gray-500 text-sm">
        Click hoặc nhấn Space để xem nghĩa
      </p>
    </div>
  )
}
