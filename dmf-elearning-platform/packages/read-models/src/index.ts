/**
 * Read Models Package Exports
 * 
 * Provides read-only models for UI queries and analytics.
 * Updated via event projections (no direct write access).
 */

// Dashboard
export * from './dashboard/user-learning.dashboard.js';

// Progress
export * from './progress/lesson-progress.snapshot.js';

// Assessment
export * from './assessment/readiness.view.js';

// Replay (Phase 2 Track A)
export * from './replay/index.js';
