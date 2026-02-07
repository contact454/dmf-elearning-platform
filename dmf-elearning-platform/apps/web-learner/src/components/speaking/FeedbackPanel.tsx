'use client';

import { TrendingUp, TrendingDown, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import type { SpeakingFeedback } from '@/types/speaking';
import { PronunciationCard } from './PronunciationCard';

interface FeedbackPanelProps {
  feedback: SpeakingFeedback;
  onPlayPronunciation?: (audioUrl: string) => void;
  className?: string;
}

export function FeedbackPanel({
  feedback,
  onPlayPronunciation,
  className = '',
}: FeedbackPanelProps) {
  const { scores, strengths, weaknesses, suggestions, pronunciationDetails, transcription } = feedback;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const CircularProgress = ({ score, label }: { score: number; label: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={getScoreColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
          {label}
        </p>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
          Overall Score
        </h3>
        <div className="flex justify-center">
          <CircularProgress score={scores.overall} label="" />
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Detailed Scores
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <CircularProgress score={scores.pronunciation} label="Pronunciation" />
          <CircularProgress score={scores.fluency} label="Fluency" />
          <CircularProgress score={scores.vocabulary} label="Vocabulary" />
          <CircularProgress score={scores.grammar} label="Grammar" />
        </div>
      </div>

      {/* Transcription */}
      {transcription && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📝 Transcription
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {transcription}
          </p>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
              Strengths
            </h4>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200"
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">
              Areas to Improve
            </h4>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200"
              >
                <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Suggestions
            </h4>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pronunciation Details */}
      {pronunciationDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Word-level Pronunciation Feedback
          </h4>
          <div className="space-y-3">
            {pronunciationDetails.map((detail, index) => (
              <PronunciationCard
                key={index}
                feedback={detail}
                onPlayAudio={() => detail.audioSnippetUrl && onPlayPronunciation?.(detail.audioSnippetUrl)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
