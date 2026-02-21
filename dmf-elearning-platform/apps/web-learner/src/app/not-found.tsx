'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
            <div className="text-center max-w-md mx-auto">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[12rem] font-outfit font-extrabold leading-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl" role="img" aria-label="confused face">😵</span>
                    </div>
                </div>

                <h2 className="text-2xl font-outfit font-bold text-gray-800 dark:text-gray-100 mb-3">
                    Seite nicht gefunden
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
                    Diese Seite existiert leider nicht.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    Trang này không tồn tại.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Zurück zur Startseite
                    </Link>
                    <Link
                        href="/learn"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        Weiterlernen
                    </Link>
                </div>
            </div>
        </div>
    );
}
