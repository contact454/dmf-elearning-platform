'use server'

import { revalidatePath } from 'next/cache';

export async function simulateLessonAction(userId: string) {
    try {
        const res = await fetch('http://127.0.0.1:3005/api/debug/seed-mastery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                score: 85, // Fixed score as per request
            }),
            cache: 'no-store',
        });

        if (!res.ok) {
            return { success: false, error: 'Failed to seed data' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Seed action error:', error);
        return { success: false, error: 'Network error connecting to backend' };
    }
}
