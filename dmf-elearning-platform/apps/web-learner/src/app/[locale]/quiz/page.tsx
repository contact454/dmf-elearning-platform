'use client';

import { useState, useEffect } from 'react';

interface QuizOption {
  id: string;
  text: string;
}

interface Quiz {
  id: string;
  courseId: string;
  question: string;
  options: QuizOption[];
  xpReward: number;
}

interface VerifyResult {
  isCorrect: boolean;
  explanation: string;
  correctAnswerId: string;
  xpGained: number;
  currentLevelStats?: {
    level: number;
    xp: number;
    leveledUp: boolean;
  };
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  const DEMO_USER_ID = 'user-m3-demo';
  const COURSE_ID = 'course-nextjs-basic';

  // Load quizzes
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`http://localhost:3005/api/quiz/${COURSE_ID}`);
      const data = await response.json();
      setQuizzes(data.quizzes || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuiz) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3005/api/learning/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          quizId: currentQuiz.id,
          answer: selectedAnswer,
        }),
      });

      const result: VerifyResult = await response.json();
      setVerifyResult(result);

      // Show XP animation if correct
      if (result.isCorrect && result.xpGained > 0) {
        setShowXPAnimation(true);
        setTimeout(() => setShowXPAnimation(false), 2000);
      }
    } catch (error) {
      console.error('Failed to verify answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setVerifyResult(null);
    }
  };

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">No quizzes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* XP Animation */}
      {showXPAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="animate-bounce text-6xl font-bold text-amber-500 drop-shadow-lg">
            +{verifyResult?.xpGained} XP 🎉
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <span className="text-sm font-medium text-purple-600">
              Question {currentQuizIndex + 1} of {quizzes.length}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Next.js Basic Quiz</h1>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Question */}
          <h2 className="text-2xl font-semibold text-slate-800 mb-8">
            {currentQuiz.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuiz.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = verifyResult?.correctAnswerId === option.id;
              const isWrong = verifyResult && isSelected && !verifyResult.isCorrect;

              let optionClass = 'border-2 border-gray-200 hover:border-purple-300 bg-white';

              if (verifyResult) {
                if (isCorrect) {
                  optionClass = 'border-2 border-green-500 bg-green-50';
                } else if (isWrong) {
                  optionClass = 'border-2 border-red-500 bg-red-50 animate-shake';
                }
              } else if (isSelected) {
                optionClass = 'border-2 border-purple-500 bg-purple-50';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => !verifyResult && setSelectedAnswer(option.id)}
                  disabled={!!verifyResult}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-200 ${optionClass} ${
                    verifyResult ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isSelected || isCorrect ? 'border-current' : 'border-gray-300'
                    }`}>
                      {(isSelected || isCorrect) && (
                        <div className={`w-4 h-4 rounded-full ${
                          isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-purple-500'
                        }`}></div>
                      )}
                    </div>
                    <span className="text-lg font-medium text-slate-700">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {verifyResult && (
            <div className={`p-6 rounded-2xl mb-8 ${
              verifyResult.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {verifyResult.isCorrect ? '✅' : '❌'}
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-2 ${
                    verifyResult.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verifyResult.isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-slate-700">{verifyResult.explanation}</p>
                  {verifyResult.currentLevelStats?.leveledUp && (
                    <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                      <p className="text-amber-900 font-semibold">
                        🎊 Level Up! You're now Level {verifyResult.currentLevelStats.level}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!verifyResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                {isSubmitting ? 'Checking...' : 'Check Answer'}
              </button>
            ) : (
              <>
                {currentQuizIndex < quizzes.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                  >
                    Next Question →
                  </button>
                ) : (
                  <div className="flex-1 text-center p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl">
                    <p className="text-lg font-semibold text-amber-900">
                      🎉 Quiz Complete! Great job!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: [
        '@keyframes shake {',
        '  0%, 100% { transform: translateX(0); }',
        '  25% { transform: translateX(-10px); }',
        '  75% { transform: translateX(10px); }',
        '}',
        '.animate-shake {',
        '  animation: shake 0.5s ease-in-out;',
        '}',
      ].join('\n') }} />
    </div>
  );
}
