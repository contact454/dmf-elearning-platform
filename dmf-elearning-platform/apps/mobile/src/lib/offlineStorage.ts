/**
 * Offline Storage Service — Sprint 5.3
 * Expo SQLite-based local storage for vocabulary and SRS data
 * Enables offline learning with background sync
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───

interface OfflineVocabItem {
    id: string;
    word: string;
    meaning: string;
    exampleSentence?: string;
    level: string;
    audioUrl?: string;
    // SRS fields
    nextReview: string; // ISO date
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
}

interface OfflineReview {
    id: string;
    wordId: string;
    rating: 1 | 2 | 3 | 4;
    timestamp: string;
    synced: boolean;
}

interface SyncStatus {
    lastSync: string | null;
    pendingReviews: number;
    pendingErrors: number;
    isOnline: boolean;
}

// ─── Storage Keys ───

const KEYS = {
    VOCAB_ITEMS: '@offline_vocab_items',
    PENDING_REVIEWS: '@offline_pending_reviews',
    LAST_SYNC: '@offline_last_sync',
    USER_PROFILE: '@offline_user_profile',
    DAILY_PLAN: '@offline_daily_plan',
};

// ─── Vocabulary Storage ───

/**
 * Save vocabulary items for offline use
 */
export async function saveVocabOffline(items: OfflineVocabItem[]): Promise<void> {
    const existing = await getOfflineVocab();
    const merged = mergeItems(existing, items);
    await AsyncStorage.setItem(KEYS.VOCAB_ITEMS, JSON.stringify(merged));
}

/**
 * Get all offline vocabulary items
 */
export async function getOfflineVocab(): Promise<OfflineVocabItem[]> {
    const data = await AsyncStorage.getItem(KEYS.VOCAB_ITEMS);
    return data ? JSON.parse(data) : [];
}

/**
 * Get items due for review (offline SRS queue)
 */
export async function getOfflineDueItems(): Promise<OfflineVocabItem[]> {
    const items = await getOfflineVocab();
    const now = new Date().toISOString();
    return items.filter(item => item.nextReview <= now);
}

/**
 * Update a vocab item after offline review
 */
export async function updateVocabAfterReview(
    wordId: string,
    updates: Partial<OfflineVocabItem>
): Promise<void> {
    const items = await getOfflineVocab();
    const idx = items.findIndex(i => i.id === wordId);
    if (idx !== -1) {
        items[idx] = { ...items[idx], ...updates };
        await AsyncStorage.setItem(KEYS.VOCAB_ITEMS, JSON.stringify(items));
    }
}

// ─── Pending Reviews ───

/**
 * Queue a review for later sync
 */
export async function queueReview(review: Omit<OfflineReview, 'id' | 'synced'>): Promise<void> {
    const pending = await getPendingReviews();
    pending.push({
        ...review,
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        synced: false,
    });
    await AsyncStorage.setItem(KEYS.PENDING_REVIEWS, JSON.stringify(pending));
}

/**
 * Get all pending (unsynced) reviews
 */
export async function getPendingReviews(): Promise<OfflineReview[]> {
    const data = await AsyncStorage.getItem(KEYS.PENDING_REVIEWS);
    return data ? JSON.parse(data) : [];
}

/**
 * Mark reviews as synced
 */
export async function markReviewsSynced(reviewIds: string[]): Promise<void> {
    const pending = await getPendingReviews();
    const updated = pending.map(r =>
        reviewIds.includes(r.id) ? { ...r, synced: true } : r
    );
    // Remove synced reviews older than 24h
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const cleaned = updated.filter(r => !r.synced || r.timestamp > cutoff);
    await AsyncStorage.setItem(KEYS.PENDING_REVIEWS, JSON.stringify(cleaned));
}

// ─── Sync Manager ───

/**
 * Sync pending reviews to server
 */
export async function syncToServer(apiBaseUrl: string, authToken: string): Promise<{
    synced: number;
    failed: number;
    errors: string[];
}> {
    const pending = await getPendingReviews();
    const unsynced = pending.filter(r => !r.synced);

    if (unsynced.length === 0) return { synced: 0, failed: 0, errors: [] };

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];
    const syncedIds: string[] = [];

    for (const review of unsynced) {
        try {
            const response = await fetch(`${apiBaseUrl}/api/vocabulary/srs/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    wordId: review.wordId,
                    quality: review.rating,
                }),
            });

            if (response.ok) {
                synced++;
                syncedIds.push(review.id);
            } else {
                failed++;
                errors.push(`Failed to sync review ${review.id}: ${response.status}`);
            }
        } catch (e: any) {
            failed++;
            errors.push(`Network error syncing ${review.id}: ${e.message}`);
        }
    }

    if (syncedIds.length > 0) {
        await markReviewsSynced(syncedIds);
        await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    }

    return { synced, failed, errors };
}

/**
 * Download latest vocabulary from server for offline use
 */
export async function downloadVocabFromServer(
    apiBaseUrl: string,
    authToken: string
): Promise<number> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/vocabulary/srs/due?limit=100`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (data.success && data.data) {
            const items: OfflineVocabItem[] = data.data.map((item: any) => ({
                id: item.id,
                word: item.word,
                meaning: item.meaning || item.translation || '',
                exampleSentence: item.exampleSentence,
                level: item.level || 'A1',
                audioUrl: item.audioUrl,
                nextReview: item.nextReview || new Date().toISOString(),
                stability: item.stability || 0,
                difficulty: item.difficulty || 0,
                reps: item.reps || 0,
                lapses: item.lapses || 0,
                state: item.state || 'new',
            }));

            await saveVocabOffline(items);
            return items.length;
        }
        return 0;
    } catch (e) {
        console.error('[Offline] Download failed:', e);
        return 0;
    }
}

// ─── Status ───

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
    const lastSync = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    const pending = await getPendingReviews();
    const unsynced = pending.filter(r => !r.synced);

    return {
        lastSync,
        pendingReviews: unsynced.length,
        pendingErrors: 0,
        isOnline: true, // Caller should check NetInfo
    };
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
    await AsyncStorage.multiRemove([
        KEYS.VOCAB_ITEMS,
        KEYS.PENDING_REVIEWS,
        KEYS.LAST_SYNC,
        KEYS.DAILY_PLAN,
    ]);
}

// ─── Helpers ───

function mergeItems(existing: OfflineVocabItem[], incoming: OfflineVocabItem[]): OfflineVocabItem[] {
    const map = new Map<string, OfflineVocabItem>();
    for (const item of existing) map.set(item.id, item);
    for (const item of incoming) map.set(item.id, { ...map.get(item.id), ...item });
    return Array.from(map.values());
}
