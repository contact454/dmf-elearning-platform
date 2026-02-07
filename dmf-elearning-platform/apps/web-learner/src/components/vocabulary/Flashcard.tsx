'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlashcardFront } from './FlashcardFront'
import { FlashcardBack } from './FlashcardBack'

interface FlashcardProps {
  word: {
    id: string
    word: string
    translation: string
    level: 'A1' | 'A2' | 'B1' | 'B2'
    wordType: string
    exampleSentence?: string
    exampleTranslation?: string
  }
  isFlipped?: boolean
  onFlip?: () => void
}

export function Flashcard({ word, isFlipped = false, onFlip }: FlashcardProps) {
  const [flipped, setFlipped] = useState(isFlipped)
  
  const handleFlip = () => {
    setFlipped(!flipped)
    onFlip?.()
  }
  
  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    }
  }
  
  return (
    <div 
      className="relative w-full max-w-xl h-96"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${word.word}. Press space to flip.`}
    >
      <motion.div
        className="w-full h-full"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <FlashcardFront
            word={word.word}
            level={word.level}
            wordType={word.wordType}
            wordId={word.id}
          />
        </div>
        
        {/* Back */}
        <div
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <FlashcardBack
            translation={word.translation}
            exampleSentence={word.exampleSentence}
            exampleTranslation={word.exampleTranslation}
          />
        </div>
      </motion.div>
    </div>
  )
}
