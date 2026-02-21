/**
 * Offline Cache — AsyncStorage-based caching for vocabulary and progress
 * Enables offline vocabulary review when no network available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'dmf_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: number;
}

export const offlineCache = {
    /**
     * Store data with expiry timestamp
     */
    async set<T>(key: string, data: T, version = 1): Promise<void> {
        const entry: CacheEntry<T> = { data, timestamp: Date.now(), version };
        await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    },

    /**
     * Get cached data if not expired
     */
    async get<T>(key: string, maxAge = CACHE_EXPIRY_MS): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            if (!raw) return null;

            const entry: CacheEntry<T> = JSON.parse(raw);
            if (Date.now() - entry.timestamp > maxAge) {
                await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
                return null;
            }
            return entry.data;
        } catch {
            return null;
        }
    },

    /**
     * Cache vocabulary for offline use
     */
    async cacheVocabulary(level: string, items: unknown[]): Promise<void> {
        await this.set(`vocab_${level}`, items);
    },

    /**
     * Get cached vocabulary
     */
    async getVocabulary(level: string): Promise<unknown[] | null> {
        return this.get(`vocab_${level}`);
    },

    /**
     * Cache user progress for offline display
     */
    async cacheProgress(userId: string, progress: unknown): Promise<void> {
        await this.set(`progress_${userId}`, progress);
    },

    /**
     * Queue actions when offline (sync later)
     */
    async queueAction(action: { type: string; payload: unknown; timestamp: number }): Promise<void> {
        const queue = await this.get<unknown[]>('action_queue') || [];
        queue.push(action);
        await this.set('action_queue', queue);
    },

    /**
     * Get and clear queued actions for sync
     */
    async drainQueue(): Promise<unknown[]> {
        const queue = await this.get<unknown[]>('action_queue') || [];
        await AsyncStorage.removeItem(`${CACHE_PREFIX}action_queue`);
        return queue;
    },

    /**
     * Clear all cached data
     */
    async clearAll(): Promise<void> {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
    },

    /**
     * Get cache size info
     */
    async getInfo(): Promise<{ entries: number; totalSize: number }> {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
        let totalSize = 0;
        for (const key of cacheKeys) {
            const val = await AsyncStorage.getItem(key);
            if (val) totalSize += val.length;
        }
        return { entries: cacheKeys.length, totalSize };
    },
};

export default offlineCache;
