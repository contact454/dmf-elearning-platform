export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
            <div className="text-center">
                {/* Animated spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-lg font-outfit font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                    Wird geladen...
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Đang tải...
                </p>
            </div>
        </div>
    );
}
