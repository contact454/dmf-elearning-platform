'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardProps {
  word: string;
  meaning: string;
  level: string;
  example?: string;
  onRate: (rating: 0 | 1 | 2 | 3) => void;
}

export function Flashcard({ word, meaning, level, example, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => setShowRating(true), 300);
    }
  };

  const handleRate = (rating: 0 | 1 | 2 | 3) => {
    setShowRating(false);
    setIsFlipped(false);
    onRate(rating);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Card Container */}
      <div
        className="relative h-96 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // Front Side - German Word
            <motion.div
              key="front"
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white p-8 backface-hidden"
            >
              <div className="absolute top-6 right-6 bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
                {level}
              </div>
              <h2 className="text-6xl font-bold mb-4">{word}</h2>
              <p className="text-blue-100 text-xl">Tap to reveal</p>
            </motion.div>
          ) : (
            // Back Side - Vietnamese Meaning
            <motion.div
              key="back"
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8"
            >
              <div className="text-center">
                <h3 className="text-4xl font-bold text-gray-800 mb-6">{meaning}</h3>
                {example && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-600 italic">{example}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 grid grid-cols-4 gap-4"
          >
            <button
              onClick={() => handleRate(0)}
              className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              😵 Again
            </button>
            <button
              onClick={() => handleRate(1)}
              className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              😰 Hard
            </button>
            <button
              onClick={() => handleRate(2)}
              className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              😊 Good
            </button>
            <button
              onClick={() => handleRate(3)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              🎉 Easy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!isFlipped && (
        <p className="text-center text-gray-500 mt-4 text-sm">
          Click the card to see the meaning, then rate how well you know it
        </p>
      )}
    </div>
  );
}
