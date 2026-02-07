'use client'

/**
 * Vocabulary Components Demo
 * 
 * This page showcases the Flashcard and WordMeter components
 * for visual verification and testing.
 * 
 * Route: /vocabulary/demo
 */

import { Flashcard } from '@/components/vocabulary/Flashcard'
import { WordMeter } from '@/components/vocabulary/WordMeter'

const mockWords = [
  {
    id: '1',
    word: 'Hallo',
    translation: 'Xin chào',
    level: 'A1' as const,
    wordType: 'Interjection',
    exampleSentence: 'Hallo, wie geht es dir?',
    exampleTranslation: 'Xin chào, bạn khỏe không?'
  },
  {
    id: '2',
    word: 'Danke',
    translation: 'Cảm ơn',
    level: 'A1' as const,
    wordType: 'Interjection',
    exampleSentence: 'Danke für deine Hilfe!',
    exampleTranslation: 'Cảm ơn vì sự giúp đỡ của bạn!'
  },
  {
    id: '3',
    word: 'Schule',
    translation: 'Trường học',
    level: 'A2' as const,
    wordType: 'Noun',
    exampleSentence: 'Ich gehe zur Schule.',
    exampleTranslation: 'Tôi đi đến trường.'
  }
]

export default function VocabularyDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Vocabulary Components Demo
      </h1>
      
      {/* Flashcards Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Flashcard Component</h2>
        <p className="text-gray-600 mb-8">
          Click on the card or press Space to flip. Click the audio button to test event propagation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockWords.map((word) => (
            <div key={word.id} className="flex justify-center">
              <Flashcard 
                word={word}
                onFlip={() => console.log(`Flipped: ${word.word}`)}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Word Meter Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Word Progress Meter</h2>
        <p className="text-gray-600 mb-8">
          Visual progress indicator showing word mastery level.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* NEW Status */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-bold mb-4">NEW Status</h3>
            <WordMeter 
              status="NEW" 
              accuracy={0} 
              totalReviews={0}
            />
          </div>
          
          {/* LEARNING Status */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-bold mb-4">LEARNING Status</h3>
            <WordMeter 
              status="LEARNING" 
              accuracy={0.65} 
              totalReviews={5}
            />
          </div>
          
          {/* REVIEW Status */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-bold mb-4">REVIEW Status</h3>
            <WordMeter 
              status="REVIEW" 
              accuracy={0.82} 
              totalReviews={12}
            />
          </div>
          
          {/* MASTERED Status */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-bold mb-4">MASTERED Status</h3>
            <WordMeter 
              status="MASTERED" 
              accuracy={0.95} 
              totalReviews={25}
            />
          </div>
        </div>
      </section>
      
      {/* Integration Example */}
      <section className="mt-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Combined Example</h2>
        <p className="text-gray-600 mb-6">
          Flashcard with Word Meter (typical review session view)
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Flashcard word={mockWords[0]} />
          </div>
          <WordMeter 
            status="LEARNING" 
            accuracy={0.7} 
            totalReviews={8}
          />
        </div>
      </section>
    </div>
  )
}
