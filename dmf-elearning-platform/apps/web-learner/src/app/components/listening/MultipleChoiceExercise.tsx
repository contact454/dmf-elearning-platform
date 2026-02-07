'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { Check, X } from 'lucide-react';

interface MultipleChoiceExerciseProps {
  audioUrl: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  onSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onNext?: () => void;
}

export default function MultipleChoiceExercise({
  audioUrl,
  question,
  options,
  correctIndex,
  explanation,
  onSubmit,
  onNext
}: MultipleChoiceExerciseProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return;

    const isCorrect = selectedIndex === correctIndex;
    setSubmitted(true);
    onSubmit(selectedIndex, isCorrect);
  };

  const handleTryAgain = () => {
    setSelectedIndex(null);
    setSubmitted(false);
  };

  const getOptionClass = (index: number): string => {
    const baseClass = "w-full text-left px-6 py-4 rounded-lg border-2 transition font-medium flex items-center gap-3";

    if (!submitted) {
      return `${baseClass} ${
        selectedIndex === index
          ? 'border-blue-500 bg-blue-50 text-blue-900'
          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
      }`;
    }

    // After submission
    if (index === correctIndex) {
      return `${baseClass} border-green-500 bg-green-50 text-green-900`;
    }

    if (index === selectedIndex && selectedIndex !== correctIndex) {
      return `${baseClass} border-red-500 bg-red-50 text-red-900`;
    }

    return `${baseClass} border-gray-200 bg-gray-50 text-gray-500`;
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const isCorrect = submitted && selectedIndex === correctIndex;

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <AudioPlayer audioUrl={audioUrl} />

      {/* Question */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Listen to the audio and select the correct answer
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !submitted && setSelectedIndex(index)}
            disabled={submitted}
            className={getOptionClass(index)}
          >
            {/* Option Label (A, B, C, D) */}
            <span className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${!submitted && selectedIndex === index ? 'bg-blue-600 text-white' : ''}
              ${submitted && index === correctIndex ? 'bg-green-600 text-white' : ''}
              ${submitted && index === selectedIndex && selectedIndex !== correctIndex ? 'bg-red-600 text-white' : ''}
              ${!submitted && selectedIndex !== index ? 'bg-gray-200 text-gray-600' : ''}
              ${submitted && index !== correctIndex && index !== selectedIndex ? 'bg-gray-300 text-gray-500' : ''}
            `}>
              {getOptionLabel(index)}
            </span>

            {/* Option Text */}
            <span className="flex-1 text-left">{option}</span>

            {/* Check/X Icon */}
            {submitted && (
              <span className="flex-shrink-0">
                {index === correctIndex ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : index === selectedIndex ? (
                  <X className="w-6 h-6 text-red-600" />
                ) : null}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
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
                  Incorrect
                </span>
              </>
            )}
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
              <p className="text-sm text-gray-600">{explanation}</p>
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
