/**
 * Quick test script to verify attemptStore singleton behavior
 * Run: node services/practice-service/test-store.mjs
 */

import { attemptStore, getAttemptStoreSize } from './dist/state/index.js';

console.log('Testing attemptStore singleton...');
console.log('Initial store size:', getAttemptStoreSize());

// Simulate creating an attempt
const testAttemptId = 'test-attempt-123';
attemptStore.set(testAttemptId, {
  id: testAttemptId,
  userId: 'user-1',
  lessonId: 'lesson-1',
  status: 'in_progress',
  startedAt: new Date(),
});

console.log('After setting test attempt:');
console.log('  Store size:', getAttemptStoreSize());
console.log('  Has test attempt:', attemptStore.has(testAttemptId));
console.log('  All keys:', Array.from(attemptStore.keys()));

// Test retrieval
const retrieved = attemptStore.get(testAttemptId);
console.log('Retrieved attempt:', retrieved ? 'SUCCESS' : 'FAILED');
