/**
 * Submission Store (Kho lưu trữ Submission)
 *
 * True singleton Map store for Submission entities.
 * Uses Symbol.for() + globalThis to ensure single store even with ESM module duplication.
 * 
 * CRITICAL: Always access via getSubmissionStore() getter to guarantee same instance.
 */

import type { Submission } from './submission.repository';

// Use Symbol.for() for true cross-module singleton
const STORE_KEY = Symbol.for('dmf.practice.submissionStore');
const INSTANCE_ID_KEY = Symbol.for('dmf.practice.submissionStore.instanceId');

/**
 * Get the singleton submission store instance.
 * Always returns the SAME Map instance across all module reloads.
 */
export function getSubmissionStore(): Map<string, Submission> {
  const g = globalThis as any;
  
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Submission>();
    g[INSTANCE_ID_KEY] = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return g[STORE_KEY];
}

/**
 * Get store instance ID for verification.
 */
export function getSubmissionStoreInstanceId(): string {
  const g = globalThis as any;
  return g[INSTANCE_ID_KEY] || 'unknown';
}

/**
 * Legacy export for backward compatibility.
 * Use getSubmissionStore() directly for new code.
 */
export const submissionStore = getSubmissionStore();

export const getSubmissionStoreSize = () => getSubmissionStore().size;
