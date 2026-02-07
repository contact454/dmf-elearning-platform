'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { Check, X } from 'lucide-react';

interface FillBlankExerciseProps {
  audioUrl: string;
  sentence: string; // Use {blank} as placeholder
  answers: string[]; // Array of correct answers for each blank
  onSubmit: (userAnswers: string[], score: number) => void;
  onNext?: () => void;
}

export default function FillBlankExercise({
  audioUrl,
  sentence,
  answers,
  onSubmit,
  onNext
}: FillBlankExerciseProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(answers.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  // Parse sentence into parts and blanks
  const parseSentence = () => {
    const parts = sentence.split('{blank}');
    return parts;
  };

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const normalizeText = (text: string): string => {
    return text.trim().toLowerCase();
  };

  const handleSubmit = () => {
    if (submitted) return;

    // Check each answer
    const checkResults = userAnswers.map((userAnswer, index) => {
      const normalized = normalizeText(userAnswer);
      const correctNormalized = normalizeText(answers[index]);
      return normalized === correctNormalized;
    });

    setResults(checkResults);
    setSubmitted(true);

    // Calculate score
    const correctCount = checkResults.filter(r => r).length;
    const score = (correctCount / answers.length) * 100;

    onSubmit(userAnswers, score);
  };

  const handleTryAgain = () => {
    setUserAnswers(new Array(answers.length).fill(''));
    setSubmitted(false);
    setResults([]);
  };

  const allFilled = userAnswers.every(answer => answer.trim().length > 0);
  const sentenceParts = parseSentence();
  const correctCount = results.filter(r => r).length;
  const totalBlanks = answers.length;

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <AudioPlayer audioUrl={audioUrl} />

      {/* Instruction */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Fill in the missing words
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Listen to the audio and complete the sentence
        </p>
      </div>

      {/* Sentence with Blanks */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-lg leading-relaxed flex flex-wrap items-center gap-2">
          {sentenceParts.map((part, index) => (
            <span key={index} className="inline-flex items-center gap-2 flex-wrap">
              {/* Text part */}
              <span className="text-gray-900">{part}</span>

              {/* Input blank (if not the last part) */}
              {index < sentenceParts.length - 1 && (
                <span className="inline-block">
                  {!submitted ? (
                    <input
                      type="text"
                      value={userAnswers[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder="___"
                      className="w-32 px-3 py-1.5 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-center font-medium text-gray-900 bg-blue-50"
                    />
                  ) : (
                    <span className={`inline-block px-3 py-1.5 border-b-2 font-medium min-w-[8rem] text-center ${
                      results[index] 
                        ? 'border-green-500 text-green-700 bg-green-50' 
                        : 'border-red-500 text-red-700 bg-red-50 line-through'
                    }`}>
                      {userAnswers[index]}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Show correct answers after submission */}
        {submitted && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <p className="text-sm font-medium text-gray-700">Correct sentence:</p>
            <div className="text-lg leading-relaxed flex flex-wrap items-center gap-2">
              {sentenceParts.map((part, index) => (
                <span key={index} className="inline-flex items-center gap-2">
                  <span className="text-gray-900">{part}</span>
                  {index < sentenceParts.length - 1 && (
                    <span className="inline-block px-3 py-1.5 border-b-2 border-green-500 text-green-700 bg-green-50 font-medium">
                      {answers[index]}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
        >
          Submit Answer
        </button>
      )}

      {/* Results */}
      {submitted && (
        <div className={`p-6 rounded-lg border-2 space-y-4 ${
          correctCount === totalBlanks 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          {/* Status */}
          <div className="flex items-center gap-2">
            {correctCount === totalBlanks ? (
              <>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-green-900">
                  Perfect! All correct!
                </span>
              </>
            ) : correctCount > 0 ? (
              <>
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {correctCount}
                </div>
                <span className="text-lg font-semibold text-yellow-900">
                  {correctCount} out of {totalBlanks} correct ({Math.round((correctCount / totalBlanks) * 100)}%)
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-red-900">
                  All incorrect - try again!
                </span>
              </>
            )}
          </div>

          {/* Individual Results */}
          {correctCount < totalBlanks && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
              <p className="text-sm font-medium text-gray-700">Results for each blank:</p>
              <div className="space-y-1.5">
                {userAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {results[index] ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-gray-600">Blank {index + 1}:</span>
                    <span className={results[index] ? 'text-green-700 font-medium' : 'text-red-700 line-through'}>
                      {answer || '(empty)'}
                    </span>
                    {!results[index] && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-700 font-medium">{answers[index]}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
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
