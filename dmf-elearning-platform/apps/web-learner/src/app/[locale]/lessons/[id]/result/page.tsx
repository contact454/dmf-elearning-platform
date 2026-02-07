
import Link from 'next/link';

export default function LessonResultPage({ params, searchParams }: { params: { id: string }, searchParams: { score: string } }) {
    const score = Number(searchParams.score || 0);
    const isPass = score >= 70;

    let message = '';
    let colorClass = '';

    if (score === 100) {
        message = 'Perfect! You are a master.';
        colorClass = 'text-green-600';
    } else if (score >= 80) {
        message = 'Excellent work! Keep it up.';
        colorClass = 'text-blue-600';
    } else if (score >= 50) {
        message = 'Good effort! Review and try again to improve.';
        colorClass = 'text-yellow-600';
    } else {
        message = 'Don\'t give up! Practice makes perfect.';
        colorClass = 'text-red-600';
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

                {/* Animated Icon (CSS only for simplicity) */}
                <div className="text-6xl mb-6 animate-bounce">
                    {isPass ? '🏆' : '📚'}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Lesson Completed</h1>

                <div className={`text-5xl font-extrabold my-6 ${colorClass}`}>
                    {score}%
                </div>

                <p className="text-slate-600 text-lg mb-8 font-medium">
                    {message}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </Link>

                    <Link
                        href={`/lessons/${params.id}`}
                        className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                    >
                        Retry Lesson
                    </Link>
                </div>

            </div>
        </div>
    );
}
