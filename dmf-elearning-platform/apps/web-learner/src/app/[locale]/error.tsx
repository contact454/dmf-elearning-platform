'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[DMF] Unhandled error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950 p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                    <span className="text-7xl block mb-4" role="img" aria-label="warning">⚠️</span>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Fehler aufgetreten
                    </div>
                </div>

                <h1 className="text-3xl font-outfit font-bold text-gray-800 dark:text-gray-100 mb-3">
                    Etwas ist schiefgelaufen
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    Đã xảy ra lỗi. Vui lòng thử lại.
                </p>

                {error.digest && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mb-6">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        Erneut versuchen
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                        Zur Startseite
                    </a>
                </div>
            </div>
        </div>
    );
}
