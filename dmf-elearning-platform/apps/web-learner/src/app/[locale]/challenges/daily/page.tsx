'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Challenge {
  id: string;
  type: 'vocabulary' | 'translation' | 'listening' | 'speaking';
  title: string;
  description: string;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  icon: string;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: '1',
    type: 'vocabulary',
    title: 'Learn 5 New Words',
    description: 'Master 5 new German words today',
    xp: 50,
    difficulty: 'easy',
    completed: false,
    icon: '📚',
  },
  {
    id: '2',
    type: 'translation',
    title: 'Translate 10 Sentences',
    description: 'Practice German to Vietnamese translation',
    xp: 75,
    difficulty: 'medium',
    completed: false,
    icon: '🔄',
  },
  {
    id: '3',
    type: 'listening',
    title: 'Listen & Repeat',
    description: 'Complete 3 listening exercises',
    xp: 100,
    difficulty: 'medium',
    completed: false,
    icon: '🎧',
  },
  {
    id: '4',
    type: 'speaking',
    title: 'Practice Speaking',
    description: 'Record yourself speaking 2 prompts',
    xp: 125,
    difficulty: 'hard',
    completed: false,
    icon: '🎤',
  },
  {
    id: '5',
    type: 'vocabulary',
    title: 'Perfect Review',
    description: 'Get 100% on 10 vocabulary reviews',
    xp: 150,
    difficulty: 'hard',
    completed: false,
    icon: '⭐',
  },
];

export default function DailyChallengesPage() {
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES);
  const [totalXP, setTotalXP] = useState(0);

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const progress = (completedCount / totalCount) * 100;

  const handleComplete = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId && !c.completed) {
          setTotalXP((xp) => xp + c.xp);
          return { ...c, completed: true };
        }
        return c;
      })
    );
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    hard: 'bg-red-100 text-red-700 border-red-300',
  };

  const difficultyIcons = {
    easy: '🟢',
    medium: '🟠',
    hard: '🔴',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Daily Challenges
          </h1>
          <p className="text-gray-600">
            Complete challenges to earn XP and keep your streak!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{completedCount}/{totalCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalXP} XP</div>
              <div className="text-sm text-gray-600">Earned Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">7 🔥</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full"
            />
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Challenge List */}
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
                challenge.completed ? 'opacity-60' : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-5xl">{challenge.icon}</div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {challenge.description}
                      </p>
                    </div>
                    {challenge.completed && (
                      <div className="text-4xl">✅</div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    {/* Difficulty Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        difficultyColors[challenge.difficulty]
                      }`}
                    >
                      {difficultyIcons[challenge.difficulty]}{' '}
                      {challenge.difficulty.toUpperCase()}
                    </span>

                    {/* XP Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                      +{challenge.xp} XP
                    </span>

                    {/* Action Button */}
                    {!challenge.completed && (
                      <button
                        onClick={() => handleComplete(challenge.id)}
                        className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
                      >
                        Start Challenge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All Complete Message */}
        {completedCount === totalCount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-2xl p-8 text-center text-white"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">
              All Challenges Complete!
            </h2>
            <p className="text-lg mb-4">
              You earned {totalXP} XP today. Come back tomorrow for new challenges!
            </p>
            <div className="text-5xl">🔥 Streak: 8 Days!</div>
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete all challenges to maximize your daily XP</li>
            <li>• Harder challenges give more XP rewards</li>
            <li>• Keep your streak alive by completing at least 1 challenge daily</li>
            <li>• New challenges unlock every day at midnight</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
