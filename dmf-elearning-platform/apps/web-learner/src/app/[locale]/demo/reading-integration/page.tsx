/**
 * Reading Module Integration Demo Page
 * Demonstrates React Query hooks working with API
 */

'use client';

import { useState } from 'react';
import {
  usePassages,
  usePassage,
  useSubmitAnswer,
  useProgress,
  useVocabularyDefinition,
  useSaveVocabulary,
} from '@/hooks/useReadingQueries';
import { PassageFilters } from '@/services/reading-api';

export default function ReadingIntegrationDemo() {
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [filters, setFilters] = useState<PassageFilters>({});

  // Fetch passages list
  const {
    data: passagesData,
    isLoading: passagesLoading,
    error: passagesError,
  } = usePassages(filters);

  // Fetch single passage
  const {
    data: passageData,
    isLoading: passageLoading,
  } = usePassage(selectedPassageId);

  // Progress stats
  const { data: progressData } = useProgress();

  // Submit answer mutation
  const submitAnswer = useSubmitAnswer();

  // Vocabulary hooks
  const { data: vocabularyDef } = useVocabularyDefinition(selectedWord);
  const saveVocabulary = useSaveVocabulary();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Reading Module Integration Demo</h1>

      {/* Progress Stats */}
      <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📊 Your Progress</h2>
        {progressData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold">{progressData.passagesCompleted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-2xl font-bold">🔥 {progressData.streak.current}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
              <p className="text-2xl font-bold">{progressData.totalTimeSpentMinutes}m</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attempts</p>
              <p className="text-2xl font-bold">{progressData.recentAttempts}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading progress...</p>
        )}
      </section>

      {/* Filters */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🔍 Filter Passages</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filters.cefr || ''}
            onChange={(e) => setFilters({ ...filters, cefr: e.target.value || undefined })}
            className="px-4 py-2 border rounded-md dark:bg-gray-700"
          >
            <option value="">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <select
            value={filters.topic || ''}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value || undefined })}
            className="px-4 py-2 border rounded-md dark:bg-gray-700"
          >
            <option value="">All Topics</option>
            <option value="culture">Culture</option>
            <option value="health">Health</option>
            <option value="business">Business</option>
          </select>
        </div>
      </section>

      {/* Passages List */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">📚 Reading Passages</h2>

        {passagesLoading && <p className="text-gray-500">Loading passages...</p>}
        {passagesError && (
          <p className="text-red-600">Error: {passagesError.message}</p>
        )}

        {passagesData && (
          <div className="space-y-4">
            {passagesData.passages.map((passage) => (
              <div
                key={passage.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                onClick={() => setSelectedPassageId(passage.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{passage.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {passage.cefrLevel} • {passage.topic} • {passage.wordCount} words
                    </p>
                  </div>
                  {passage.isPremium && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div className="text-sm text-gray-500 mt-4">
              Page {passagesData.pagination.page} of {passagesData.pagination.totalPages} 
              ({passagesData.pagination.total} total)
            </div>
          </div>
        )}
      </section>

      {/* Selected Passage */}
      {selectedPassageId && (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📖 Reading Passage</h2>

          {passageLoading && <p className="text-gray-500">Loading passage...</p>}

          {passageData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{passageData.passage.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {passageData.passage.cefrLevel} • {passageData.passage.wordCount} words • 
                  {passageData.passage.estimatedReadingTimeMinutes} min read
                </p>
                <p className="leading-relaxed">{passageData.passage.content}</p>
              </div>

              {/* Interactive Text Demo */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click a word to see its definition:
                </p>
                <div className="flex flex-wrap gap-2">
                  {passageData.passage.content.split(/\s+/).slice(0, 10).map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWord(word.replace(/[.,!?;:]/g, ''))}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              {passageData.passage.exercises && passageData.passage.exercises.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">✏️ Exercises ({passageData.passage.exercises.length})</h4>
                  <div className="space-y-4">
                    {passageData.passage.exercises.map((exercise) => (
                      <div key={exercise.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">{exercise.question}</p>
                        <button
                          onClick={() => {
                            submitAnswer.mutate({
                              passageId: passageData.passage.id,
                              exerciseId: exercise.id,
                              userAnswer: { selected_index: 0 }, // Demo: always submit first option
                              timeSpentSeconds: 30,
                            });
                          }}
                          disabled={submitAnswer.isPending}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitAnswer.isPending ? 'Submitting...' : 'Submit Answer (Demo)'}
                        </button>

                        {submitAnswer.isSuccess && submitAnswer.data && (
                          <div className={`mt-2 p-2 rounded ${submitAnswer.data.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {submitAnswer.data.isCorrect ? '✅ Correct!' : '❌ Incorrect'} 
                            (+{submitAnswer.data.xpEarned} XP)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Progress */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">📈 Your Progress on This Passage</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Accuracy</p>
                    <p className="text-lg font-bold">{passageData.userProgress.accuracyPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Correct</p>
                    <p className="text-lg font-bold">
                      {passageData.userProgress.correctExercises}/{passageData.userProgress.totalExercises}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Time</p>
                    <p className="text-lg font-bold">{Math.floor(passageData.userProgress.timeSpentSeconds / 60)}m</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Vocabulary Definition */}
      {selectedWord && (
        <section className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📖 Vocabulary: {selectedWord}</h2>

          {vocabularyDef ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Definition:</p>
                <p className="font-medium">{vocabularyDef.definition}</p>
              </div>

              {vocabularyDef.translationVi && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vietnamese:</p>
                  <p className="font-medium">{vocabularyDef.translationVi}</p>
                </div>
              )}

              {vocabularyDef.pronunciation && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pronunciation:</p>
                  <p className="font-mono">{vocabularyDef.pronunciation}</p>
                </div>
              )}

              <button
                onClick={() => {
                  saveVocabulary.mutate({
                    word: selectedWord,
                    passageId: selectedPassageId || '',
                    context: vocabularyDef.exampleSentence,
                  });
                }}
                disabled={saveVocabulary.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saveVocabulary.isPending ? 'Saving...' : '💾 Save to Vocabulary'}
              </button>

              {saveVocabulary.isSuccess && (
                <p className="text-green-600 dark:text-green-400">✅ Saved successfully!</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading definition...</p>
          )}
        </section>
      )}

      {/* API Status */}
      <section className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs font-mono">
        <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
        <p><strong>React Query:</strong> ✅ Active</p>
        <p><strong>Error Handling:</strong> ✅ Configured</p>
      </section>
    </div>
  );
}
