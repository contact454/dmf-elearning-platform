/**
 * Offline Sync Context — Sprint 5.3
 * React context that manages offline/online state and auto-sync
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
    syncToServer,
    downloadVocabFromServer,
    getSyncStatus,
    getOfflineDueItems,
    queueReview,
    updateVocabAfterReview,
} from '../lib/offlineStorage';

// ─── Types ───

interface OfflineSyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: string | null;
    pendingReviews: number;
    offlineDueCount: number;
}

interface OfflineSyncActions {
    syncNow: () => Promise<void>;
    downloadVocab: () => Promise<number>;
    submitOfflineReview: (wordId: string, rating: 1 | 2 | 3 | 4) => Promise<void>;
    refreshStatus: () => Promise<void>;
}

type OfflineSyncContextType = OfflineSyncState & OfflineSyncActions;

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null);

// ─── Provider ───

interface OfflineSyncProviderProps {
    children: React.ReactNode;
    apiBaseUrl: string;
    authToken: string | null;
    autoSyncIntervalMs?: number; // Default: 5 minutes
}

export function OfflineSyncProvider({
    children,
    apiBaseUrl,
    authToken,
    autoSyncIntervalMs = 5 * 60 * 1000,
}: OfflineSyncProviderProps) {
    const [state, setState] = useState<OfflineSyncState>({
        isOnline: true,
        isSyncing: false,
        lastSync: null,
        pendingReviews: 0,
        offlineDueCount: 0,
    });

    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Monitor network state
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
            const online = netState.isConnected === true;
            setState(prev => ({ ...prev, isOnline: online }));

            // Auto-sync when coming back online
            if (online && authToken) {
                syncNow();
            }
        });

        return () => unsubscribe();
    }, [authToken]);

    // Auto-sync interval
    useEffect(() => {
        if (authToken && autoSyncIntervalMs > 0) {
            syncIntervalRef.current = setInterval(() => {
                if (state.isOnline && !state.isSyncing) {
                    syncNow();
                }
            }, autoSyncIntervalMs);

            return () => {
                if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
            };
        }
    }, [authToken, autoSyncIntervalMs, state.isOnline]);

    // Initial status load
    useEffect(() => {
        refreshStatus();
    }, []);

    const refreshStatus = useCallback(async () => {
        const status = await getSyncStatus();
        const dueItems = await getOfflineDueItems();
        setState(prev => ({
            ...prev,
            lastSync: status.lastSync,
            pendingReviews: status.pendingReviews,
            offlineDueCount: dueItems.length,
        }));
    }, []);

    const syncNow = useCallback(async () => {
        if (!authToken || state.isSyncing) return;

        setState(prev => ({ ...prev, isSyncing: true }));
        try {
            const result = await syncToServer(apiBaseUrl, authToken);
            console.log(`[Sync] Synced ${result.synced}, failed ${result.failed}`);
            await refreshStatus();
        } catch (e) {
            console.error('[Sync] Error:', e);
        } finally {
            setState(prev => ({ ...prev, isSyncing: false }));
        }
    }, [authToken, apiBaseUrl, state.isSyncing]);

    const downloadVocab = useCallback(async () => {
        if (!authToken) return 0;
        const count = await downloadVocabFromServer(apiBaseUrl, authToken);
        await refreshStatus();
        return count;
    }, [authToken, apiBaseUrl]);

    const submitOfflineReview = useCallback(async (wordId: string, rating: 1 | 2 | 3 | 4) => {
        // Queue for later sync
        await queueReview({
            wordId,
            rating,
            timestamp: new Date().toISOString(),
        });

        // Update local SRS data
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + (rating >= 3 ? rating : 0));
        await updateVocabAfterReview(wordId, {
            nextReview: nextReview.toISOString(),
            reps: 1, // Will be corrected on sync
            state: rating >= 3 ? 'review' : 'learning',
        });

        await refreshStatus();

        // Try immediate sync if online
        if (state.isOnline && authToken) {
            syncNow();
        }
    }, [state.isOnline, authToken]);

    const value: OfflineSyncContextType = {
        ...state,
        syncNow,
        downloadVocab,
        submitOfflineReview,
        refreshStatus,
    };

    return React.createElement(
        OfflineSyncContext.Provider,
        { value },
        children
    );
}

// ─── Hook ───

export function useOfflineSync(): OfflineSyncContextType {
    const context = useContext(OfflineSyncContext);
    if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
    return context;
}
