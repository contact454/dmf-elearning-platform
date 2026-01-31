'use server'

import { revalidatePath } from 'next/cache';

export async function submitLessonResult(userId: string, score: number) {
    const payload = { userId, score };
    console.log('🚀 [Action] Starting Lesson Submission');

    const tryFetch = async (host: string) => {
        const url = `http://${host}:3005/api/debug/seed-mastery`;
        console.log(`🔗 [Action] Attempting connection to: ${url}`);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-store',
            });

            console.log(`📡 [Action] Response Status: ${res.status} ${res.statusText}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP Error ${res.status} ${res.statusText}: ${text}`);
            }

            return await res.json();
        } catch (error: any) {
            console.error(`🔥 [Action] Connection failed for ${host}:`, {
                message: error.message,
                code: error.code || 'UNKNOWN_CODE',
                cause: error.cause || 'No cause'
            });
            throw error;
        }
    };

    try {
        let data;
        try {
            // Priority 1: 127.0.0.1 (Avoids localhost DNS ambiguity)
            data = await tryFetch('127.0.0.1');
        } catch (e) {
            console.warn('⚠️ [Action] 127.0.0.1 failed, retrying with localhost...');
            // Priority 2: localhost
            data = await tryFetch('localhost');
        }

        console.log('✅ [Action] Success:', data);
        revalidatePath('/dashboard');
        return { success: true, data };
    } catch (error: any) {
        console.error('☠️ [Action] All attempts failed');
        return {
            success: false,
            error: `Connection Error: ${error.message} (Check Terminal for detailed logs)`
        };
    }
}
