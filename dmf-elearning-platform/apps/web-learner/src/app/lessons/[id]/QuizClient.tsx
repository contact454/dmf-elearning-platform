'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '../../../data/lessons';
import { submitLessonResult } from './actions';

export default function QuizClient({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    lesson.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    }); // Fixed implicit any error if it existed
    return Math.round((correctCount / lesson.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < lesson.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    const score = calculateScore();
    const userId = 'user-m3-demo';

    try {
      // Call Server Action instead of direct fetch to avoid CORS
      const result = await submitLessonResult(userId, score);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Success! Redirect to result page
      console.log('Redirecting to result page...');
      router.push(`/lessons/${lesson.id}/result?score=${score}`);
    } catch (error) {
      console.error('Failed to submit lesson:', error);
      alert('Failed to submit lesson. Check console for details.');
      setSubmitting(false);
    }
  };

  const progress = Math.round(
    (Object.keys(answers).length / lesson.questions.length) * 100
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-8">
        {lesson.questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              <span className="text-slate-400 mr-2">{index + 1}.</span>
              {q.text}
            </h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answers[q.id] === i
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={answers[q.id] === i}
                    onChange={() => handleSelect(q.id, i)}
                    disabled={submitting}
                  />
                  <span className={`ml-3 ${answers[q.id] === i ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${submitting
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
            }`}
        >
          {submitting ? 'Submitting...' : 'Complete & Submit'}
        </button>
      </div>
    </div>
  );
}
