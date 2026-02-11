'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/components/vocabulary/Flashcard';

interface VocabularyCard {
  id: string;
  word: string;
  meaning_vi: string;
  level: string;
  example_de?: string;
  example_vi?: string;
}

const DEMO_CARDS: VocabularyCard[] = [
  {
    id: '1',
    word: 'das Haus',
    meaning_vi: 'Ngôi nhà',
    level: 'A1',
    example_de: 'Das Haus ist groß.',
    example_vi: 'Ngôi nhà rất lớn.',
  },
  {
    id: '2',
    word: 'der Hund',
    meaning_vi: 'Con chó',
    level: 'A1',
    example_de: 'Der Hund ist freundlich.',
    example_vi: 'Con chó rất thân thiện.',
  },
  {
    id: '3',
    word: 'die Katze',
    meaning_vi: 'Con mèo',
    level: 'A1',
    example_de: 'Die Katze schläft.',
    example_vi: 'Con mèo đang ngủ.',
  },
  {
    id: '4',
    word: 'das Buch',
    meaning_vi: 'Quyển sách',
    level: 'A1',
    example_de: 'Ich lese ein Buch.',
    example_vi: 'Tôi đang đọc một quyển sách.',
  },
  {
    id: '5',
    word: 'der Tisch',
    meaning_vi: 'Cái bàn',
    level: 'A1',
    example_de: 'Der Tisch ist neu.',
    example_vi: 'Cái bàn mới.',
  },
];

export default function VocabularyReviewPage() {
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Load demo cards (replace with API call)
    setCards(DEMO_CARDS);
    setStats((prev) => ({ ...prev, total: DEMO_CARDS.length }));
  }, []);

  const handleRate = (rating: 0 | 1 | 2 | 3) => {
    const ratingNames = ['again', 'hard', 'good', 'easy'];
    const ratingKey = ratingNames[rating] as 'again' | 'hard' | 'good' | 'easy';

    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [ratingKey]: prev[ratingKey] + 1,
    }));

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }

    // TODO: Submit to API
    console.log('Rated:', { cardId: cards[currentIndex].id, rating });
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vocabulary cards...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Review Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You reviewed {stats.reviewed} cards
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-600">{stats.again}</div>
              <div className="text-sm text-red-700">Again</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600">{stats.hard}</div>
              <div className="text-sm text-orange-700">Hard</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600">{stats.good}</div>
              <div className="text-sm text-green-700">Good</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.easy}</div>
              <div className="text-sm text-blue-700">Easy</div>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setStats({
                total: cards.length,
                reviewed: 0,
                again: 0,
                hard: 0,
                good: 0,
                easy: 0,
              });
              setIsComplete(false);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg"
          >
            Review Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📚 Vocabulary Review
            </h1>
            <div className="text-lg font-medium text-gray-600">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <Flashcard
          word={currentCard.word}
          meaning={currentCard.meaning_vi}
          level={currentCard.level}
          example={
            currentCard.example_de
              ? `${currentCard.example_de}\n${currentCard.example_vi}`
              : undefined
          }
          onRate={handleRate}
        />

        {/* Session Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">Session Stats</h3>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-red-600 font-bold">{stats.again}</span>
              <span className="text-gray-600"> Again</span>
            </div>
            <div>
              <span className="text-orange-600 font-bold">{stats.hard}</span>
              <span className="text-gray-600"> Hard</span>
            </div>
            <div>
              <span className="text-green-600 font-bold">{stats.good}</span>
              <span className="text-gray-600"> Good</span>
            </div>
            <div>
              <span className="text-blue-600 font-bold">{stats.easy}</span>
              <span className="text-gray-600"> Easy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
