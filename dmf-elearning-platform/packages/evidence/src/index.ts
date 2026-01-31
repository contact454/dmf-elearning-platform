/**
 * Evidence Package Exports
 */

export * from './evidence.types.js';
export * from './evidence.registry.js';
export * from './enforcement/enforcement.types.js';
export * from './enforcement/evidence-enforcer.js';
export * from './policies/policy-registry.js';
export * from './domain/evidence-review.js';
export * from './domain/review-registry.js';
export * from './config/review-sla.js';

// Phase 2 Track B: Evidence System formalization
export * from './domain/EvidenceStatus.js';
export * from './domain/EvidenceLifecycle.js';

// Phase 2 Sprint 1: Persistence ports (re-exported from @dmf/infra)
export type { EvidenceStore } from '@dmf/infra';

// Initialize registry provider to break cyclic dependency
// This must be imported to register the provider
import './domain/review-registry.js';
