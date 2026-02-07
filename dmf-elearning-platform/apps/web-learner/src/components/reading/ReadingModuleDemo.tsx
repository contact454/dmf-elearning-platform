'use client';

import { useState } from 'react';
import {
  PassageDisplay,
  MultipleChoiceExercise,
  TrueFalseExercise,
  FillBlankExercise,
  SequencingExercise,
  ProgressDashboard,
} from '@/components/reading';

/**
 * Demo page showcasing all Reading Module components
 * This file demonstrates how to use each component with mock data
 */

export default function ReadingModuleDemo() {
  const [currentView, setCurrentView] = useState<'passage' | 'exercises' | 'progress'>('passage');

  // Mock passage data
  const mockPassage = {
    id: 'passage-1',
    title: 'Greetings Around the World',
    content: `Hello is a common greeting in English-speaking countries. When you meet someone for the first time, you say "Hello" or "Hi". In Spanish-speaking countries, people say "Hola". French speakers greet each other with "Bonjour" during the day. In Japan, people bow and say "Konnichiwa". Different cultures have different ways to greet each other, but they all share the same goal: to be friendly and show respect.`,
    cefrLevel: 'A1',
    topic: 'Culture',
    wordCount: 74,
    estimatedReadingTimeMinutes: 1,
  };

  // Mock exercises
  const mockExercises = {
    multipleChoice: {
      id: 'ex-1',
      question: 'What do people say in Spanish-speaking countries?',
      exerciseData: {
        options: ['Hola', 'Bonjour', 'Konnichiwa', 'Hello'],
        correct_index: 0,
      },
      explanation: 'According to the passage, people in Spanish-speaking countries greet each other by saying "Hola".',
    },
    trueFalse: {
      id: 'ex-2',
      question: 'Is the following statement true or false?',
      exerciseData: {
        statement: 'In Japan, people shake hands when they meet.',
        is_true: false,
      },
      explanation: 'The passage states that in Japan, people bow when greeting each other, not shake hands.',
    },
    fillBlank: {
      id: 'ex-3',
      question: 'Complete the sentence:',
      exerciseData: {
        sentence: 'French speakers greet each other with _____ during the day.',
        correct_answer: 'Bonjour',
        alternatives: ['bonjour', 'BONJOUR'],
        word_bank: ['Bonjour', 'Konnichiwa', 'Hola', 'Hello'],
      },
      explanation: 'The passage mentions that French speakers use "Bonjour" as a greeting during the day.',
    },
    sequencing: {
      id: 'ex-4',
      question: 'Put these greetings in the order they appear in the passage:',
      exerciseData: {
        sentences: [
          { id: 's1', text: 'Hello (English)' },
          { id: 's2', text: 'Hola (Spanish)' },
          { id: 's3', text: 'Bonjour (French)' },
          { id: 's4', text: 'Konnichiwa (Japanese)' },
        ],
        correct_order: ['s1', 's2', 's3', 's4'],
      },
      explanation: 'The passage introduces greetings in this order: English, Spanish, French, then Japanese.',
    },
  };

  // Mock progress data
  const mockProgress = {
    passagesCompleted: 12,
    accuracyByLevel: [
      { level: 'A1', averageAccuracy: 92.5, attempts: 50 },
      { level: 'A2', averageAccuracy: 85.3, attempts: 30 },
      { level: 'B1', averageAccuracy: 78.8, attempts: 20 },
      { level: 'B2', averageAccuracy: 71.2, attempts: 15 },
    ],
    totalTimeSpentMinutes: 180,
    recentAttempts: 25,
    streak: {
      current: 7,
      longest: 15,
    },
  };

  const handleExerciseComplete = (data: any) => {
    console.log('Exercise completed:', data);
    // In production: send to API
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Reading Module Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcasing all 9 components from Phase 1
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCurrentView('passage')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentView === 'passage'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📖 Passage Display
          </button>
          <button
            onClick={() => setCurrentView('exercises')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentView === 'exercises'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ✍️ Exercises (4 Types)
          </button>
          <button
            onClick={() => setCurrentView('progress')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentView === 'progress'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📊 Progress Dashboard
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {currentView === 'passage' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                1. PassageDisplay Component
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Features: Adjustable font size (14-24px), reading mode, responsive layout, interactive vocabulary
              </p>
              <PassageDisplay passage={mockPassage} />
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Try it:</strong> Click any word to see the vocabulary popup! Use the font controls and reading mode toggle.
                </p>
              </div>
            </div>
          )}

          {currentView === 'exercises' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  2. MultipleChoiceExercise
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Features: Radio button selection, visual feedback, confetti animation
                </p>
                <MultipleChoiceExercise
                  exercise={mockExercises.multipleChoice}
                  onComplete={handleExerciseComplete}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  3. TrueFalseExercise
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Features: 2-button layout, statement display, color-coded feedback
                </p>
                <TrueFalseExercise
                  exercise={mockExercises.trueFalse}
                  onComplete={handleExerciseComplete}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  4. FillBlankExercise
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Features: Text input, word bank, fuzzy matching (85% threshold), partial credit
                </p>
                <FillBlankExercise
                  exercise={mockExercises.fillBlank}
                  onComplete={handleExerciseComplete}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  5. SequencingExercise
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Features: Drag & drop (touch + mouse), keyboard accessible, partial credit
                </p>
                <SequencingExercise
                  exercise={mockExercises.sequencing}
                  onComplete={handleExerciseComplete}
                />
              </div>
            </div>
          )}

          {currentView === 'progress' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                6. ProgressDashboard Component
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Features: Stats cards, bar chart (accuracy by level), pie chart (attempts), achievements
              </p>
              <ProgressDashboard stats={mockProgress} />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            ✅ All Components Ready
          </h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>✅ PassageDisplay - Responsive reading view with font controls</li>
            <li>✅ InteractiveText - Click words for definitions</li>
            <li>✅ VocabularyPopup - Dictionary popup with save-to-SRS</li>
            <li>✅ MultipleChoiceExercise - 4-option quiz</li>
            <li>✅ TrueFalseExercise - True/False questions</li>
            <li>✅ FillBlankExercise - Fill-in-the-blank with fuzzy matching</li>
            <li>✅ SequencingExercise - Drag & drop sentence ordering</li>
            <li>✅ FeedbackCard - Success/error feedback UI</li>
            <li>✅ ProgressDashboard - Analytics with charts</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Check console for exercise completion logs. All components use mock data - ready for backend integration.
          </p>
        </div>
      </div>
    </div>
  );
}
