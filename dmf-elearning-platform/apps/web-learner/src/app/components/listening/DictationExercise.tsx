'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { Check, X } from 'lucide-react';

interface DictationExerciseProps {
  audioUrl: string;
  correctAnswer: string;
  onSubmit: (userAnswer: string, isCorrect: boolean) => void;
  onNext?: () => void;
}

export default function DictationExercise({
  audioUrl,
  correctAnswer,
  onSubmit,
  onNext
}: DictationExerciseProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const normalizeText = (text: string): string => {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const handleSubmit = () => {
    if (!userAnswer.trim() || submitted) return;

    const normalized = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);
    const correct = normalized === normalizedCorrect;

    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(userAnswer, correct);
  };

  const handleTryAgain = () => {
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  const highlightDifferences = () => {
    const userWords = normalizeText(userAnswer).split(' ');
    const correctWords = normalizeText(correctAnswer).split(' ');
    const maxLength = Math.max(userWords.length, correctWords.length);

    const result: JSX.Element[] = [];

    for (let i = 0; i < maxLength; i++) {
      const userWord = userWords[i] || '';
      const correctWord = correctWords[i] || '';
      const matches = userWord === correctWord;

      if (userWord) {
        result.push(
          <span
            key={`user-${i}`}
            className={matches ? 'text-green-600 font-medium' : 'text-red-600 font-medium line-through'}
          >
            {userWord}
          </span>
        );
        result.push(<span key={`space-${i}`}> </span>);
      }
    }

    return result;
  };

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <AudioPlayer audioUrl={audioUrl} />

      {/* Instruction */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Type what you hear</h3>
        <p className="text-sm text-gray-500 mt-1">
          Listen carefully and type the sentence exactly as you hear it
        </p>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer here..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
        />
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{userAnswer.length} characters</span>
          {!submitted && (
            <span className="text-xs">Press Enter or click Submit</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
        >
          Submit Answer
        </button>
      )}

      {/* Results */}
      {submitted && (
        <div className={`p-6 rounded-lg border-2 space-y-4 ${
          isCorrect 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {/* Status */}
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-green-900">
                  Correct! Well done!
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-red-900">
                  Not quite right
                </span>
              </>
            )}
          </div>

          {/* Your Answer */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Your answer:</p>
            <p className="text-base text-gray-900">
              {isCorrect ? (
                <span className="text-green-600 font-medium">{userAnswer}</span>
              ) : (
                <>{highlightDifferences()}</>
              )}
            </p>
          </div>

          {/* Correct Answer */}
          {!isCorrect && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Correct answer:</p>
              <p className="text-base text-green-600 font-medium">{correctAnswer}</p>
            </div>
          )}

          {/* Accuracy */}
          {!isCorrect && (
            <div>
              <p className="text-sm text-gray-600">
                Tip: Listen to the audio again and pay attention to each word
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTryAgain}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Try Again
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Next Exercise
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
