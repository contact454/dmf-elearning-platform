
import Link from 'next/link';
import { MOCK_LESSONS } from '../../../data/lessons';
import QuizClient from './QuizClient';

export default async function LessonPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log('🔍 URL ID:', id);
  console.log('📂 Available IDs:', MOCK_LESSONS.map(l => l.id));

  const lesson = MOCK_LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Lesson Not Found</h1>
        <p className="text-slate-500 mb-6">The lesson you are looking for does not exist (ID: {id}).</p>
        <Link
          href="/lessons"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lesson.title}</h1>
            <span className="text-sm text-slate-500">{lesson.questions.length} Questions • {lesson.difficulty}</span>
          </div>
          <Link
            href="/lessons"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8">
        <QuizClient lesson={lesson} />
      </main>
    </div>
  );
}
