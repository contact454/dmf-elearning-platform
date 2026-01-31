
import Link from 'next/link';
import { MOCK_LESSONS } from '../../data/lessons';

export default function LessonsPage() {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-700';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'Advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Available Lessons</h1>
                        <p className="text-slate-500 mt-1">Select a module to start improving your skills.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </header>

                {/* Lesson Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_LESSONS.map((lesson) => (
                        <div
                            key={lesson.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
                                    {lesson.difficulty}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{lesson.durationMinutes} min</span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h2>
                            <p className="text-slate-500 text-sm mb-6 flex-grow">{lesson.description}</p>

                            <div className="mt-auto">
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {/* Extract unique skills from questions for tags */}
                                    {Array.from(new Set(lesson.questions.map(q => q.skill))).map(skill => (
                                        <span key={skill} className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-xs capitalize">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    href={`/lessons/${lesson.id}`}
                                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
