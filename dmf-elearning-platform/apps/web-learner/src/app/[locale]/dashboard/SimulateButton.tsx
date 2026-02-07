'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { simulateLessonAction } from './actions';

export function SimulateButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSimulate = async () => {
        setLoading(true);
        const result = await simulateLessonAction(userId);

        if (result.success) {
            // Force refresh the current route to fetch new data from the server
            router.refresh();
        } else {
            alert('Failed to simulate: ' + (result.error || 'Unknown error'));
            console.error(result.error);
        }

        setLoading(false);
    };

    return (
        <button
            onClick={handleSimulate}
            disabled={loading}
            className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }
      `}
        >
            {loading ? 'Simulating...' : 'Simulate Lesson Complete'}
        </button>
    );
}
