'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

interface ImageOption {
  url: string;
  label: string;
}

interface AudioImageExerciseProps {
  audioUrl: string;
  images: ImageOption[];
  correctIndex: number;
  onSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onNext?: () => void;
}

export default function AudioImageExercise({
  audioUrl,
  images,
  correctIndex,
  onSubmit,
  onNext
}: AudioImageExerciseProps) {
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

  const getImageContainerClass = (index: number): string => {
    const baseClass = "relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all";

    if (!submitted) {
      return `${baseClass} ${
        selectedIndex === index
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`;
    }

    // After submission
    if (index === correctIndex) {
      return `${baseClass} border-green-500 shadow-lg`;
    }

    if (index === selectedIndex && selectedIndex !== correctIndex) {
      return `${baseClass} border-red-500 shadow-lg`;
    }

    return `${baseClass} border-gray-200 opacity-60`;
  };

  const isCorrect = submitted && selectedIndex === correctIndex;

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <AudioPlayer audioUrl={audioUrl} />

      {/* Instruction */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Select the image that matches the audio
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Listen carefully and choose the correct picture
        </p>
      </div>

      {/* Image Grid */}
      <div className={`
        grid gap-4
        ${images.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}
      `}>
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => !submitted && setSelectedIndex(index)}
            className={getImageContainerClass(index)}
          >
            {/* Image */}
            <div className="aspect-square relative bg-gray-100">
              <Image
                src={image.url}
                alt={submitted ? image.label : `Option ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Selection Indicator (Before Submit) */}
              {!submitted && selectedIndex === index && (
                <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {/* Result Indicator (After Submit) */}
              {submitted && (
                <>
                  {index === correctIndex && (
                    <div className="absolute inset-0 bg-green-600 bg-opacity-20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  {index === selectedIndex && selectedIndex !== correctIndex && (
                    <div className="absolute inset-0 bg-red-600 bg-opacity-20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <X className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Label (shown after submit) */}
            {submitted && (
              <div className={`p-3 text-center font-medium ${
                index === correctIndex 
                  ? 'bg-green-100 text-green-900' 
                  : index === selectedIndex 
                  ? 'bg-red-100 text-red-900'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {image.label}
              </div>
            )}
          </div>
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
                  Incorrect - The correct answer was: {images[correctIndex].label}
                </span>
              </>
            )}
          </div>

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
