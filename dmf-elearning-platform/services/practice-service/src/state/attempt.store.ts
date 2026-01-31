/**
 * Attempt Store (Kho lưu trữ Attempt)
 *
 * True singleton Map store for Attempt entities.
 * Uses Symbol.for() + globalThis to ensure single store even with ESM module duplication.
 * 
 * CRITICAL: Always access via getAttemptStore() getter to guarantee same instance.
 */

import type { Attempt } from './attempt.repository';

// Use Symbol.for() for true cross-module singleton
const STORE_KEY = Symbol.for('dmf.practice.attemptStore');
const INSTANCE_ID_KEY = Symbol.for('dmf.practice.attemptStore.instanceId');

/**
 * Get the singleton attempt store instance.
 * Always returns the SAME Map instance across all module reloads.
 */
export function getAttemptStore(): Map<string, Attempt> {
  const g = globalThis as any;
  
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Attempt>();
    g[INSTANCE_ID_KEY] = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return g[STORE_KEY];
}

/**
 * Get store instance ID for verification.
 */
export function getAttemptStoreInstanceId(): string {
  const g = globalThis as any;
  return g[INSTANCE_ID_KEY] || 'unknown';
}

/**
 * Legacy export for backward compatibility.
 * Use getAttemptStore() directly for new code.
 */
export const attemptStore = getAttemptStore();

export const getAttemptStoreSize = () => getAttemptStore().size;
