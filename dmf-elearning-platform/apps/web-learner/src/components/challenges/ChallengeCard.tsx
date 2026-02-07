import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Volume2,
  Image as ImageIcon,
} from 'lucide-react';
import { DailyChallenge, ChallengeQuestion } from '@/hooks/useChallengeQueries';
import { useStartChallenge, useSubmitChallenge } from '@/hooks/useChallengeQueries';

interface ChallengeCardProps {
  challenge: DailyChallenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [isStarted, setIsStarted] = useState(challenge.status === 'in_progress');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startMutation = useStartChallenge();
  const submitMutation = useSubmitChallenge();

  const currentQuestion = challenge.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === challenge.questions.length - 1;
  const allAnswered = Object.keys(answers).length === challenge.questions.length;

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(challenge.id);
      setIsStarted(true);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to start challenge:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const submission = {
      challengeId: challenge.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      timeSpent,
    };

    try {
      const result = await submitMutation.mutateAsync(submission);
      setResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    }
  };

  // Challenge completed view
  if (challenge.status === 'completed' || showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge Completed!</h2>
          <p className="text-gray-600 mb-6">Great job on today's challenge</p>

          {result && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {result.score}/{result.maxScore}
                </p>
                <p className="text-xs text-gray-500">{result.percentage}%</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-amber-600">#{result.rank}</p>
                <p className="text-xs text-gray-500">of {result.totalParticipants}</p>
              </div>
            </div>
          )}

          {challenge.userScore && (
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Score</span>
                <span className="font-bold text-gray-900">
                  {challenge.userScore}/{challenge.maxPoints}
                </span>
              </div>
              {challenge.userRank && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rank</span>
                  <span className="font-bold text-amber-600">#{challenge.userRank}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600">
            Come back tomorrow for a new challenge!
          </p>
        </div>
      </motion.div>
    );
  }

  // Not started view
  if (!isStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                {challenge.level}
              </span>
              <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
              <p className="text-white/90">{challenge.description}</p>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(challenge.timeLimit / 60)} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{challenge.maxPoints} points</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{challenge.questions.length} questions</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">
                {challenge.type === 'vocabulary' && '📚'}
                {challenge.type === 'reading' && '📖'}
                {challenge.type === 'listening' && '🎧'}
                {challenge.type === 'speaking' && '🎤'}
                {challenge.type === 'writing' && '✍️'}
                {challenge.type === 'grammar' && '📝'}
                {challenge.type === 'mixed' && '🎯'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">{challenge.type} Challenge</h3>
              <p className="text-sm text-gray-600">Test your skills</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5" />
            {startMutation.isPending ? 'Starting...' : 'Start Challenge'}
          </button>
        </div>
      </motion.div>
    );
  }

  // In progress view - Quiz interface
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="h-2 bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${((currentQuestionIndex + 1) / challenge.questions.length) * 100}%`,
          }}
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
        />
      </div>

      {/* Question */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestionIndex + 1} of {challenge.questions.length}
          </span>
          <span className="text-sm font-medium text-amber-600">
            {currentQuestion.points} points
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Audio/Image if available */}
            {currentQuestion.audioUrl && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <audio controls className="flex-1">
                  <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="w-full rounded-xl border-2 border-gray-200"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                      answers[currentQuestion.id] === option
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))
              ) : (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              {submitMutation.isPending ? 'Submitting...' : 'Submit Challenge'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Answer Status */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {challenge.questions.map((q, idx) => (
            <div
              key={q.id}
              className={`w-2 h-2 rounded-full ${
                answers[q.id]
                  ? 'bg-amber-500'
                  : idx === currentQuestionIndex
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
