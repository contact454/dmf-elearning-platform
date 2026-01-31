/**
 * Practice Service Composition Root (Gốc thành phần Dịch vụ Thực hành)
 *
 * Single source of truth for all dependencies in Practice service.
 * Ensures exactly one instance of each dependency per Node.js process.
 * Uses globalThis to persist across ESM module reloads (tsx watch).
 */

import { sharedEventBus, InMemoryLogger, InMemoryAuditLogger, InMemoryDatabase, InMemoryIdempotencyStore, InMemoryOutbox } from '@dmf/infra/adapters';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { AttemptRepository, SubmissionRepository } from './state';
import { getAttemptStoreInstanceId } from './state';

export interface PracticeDeps {
  eventBus: EventBus;
  database: Database;
  logger: Logger;
  auditLogger: AuditLogger;
  idempotencyStore: IdempotencyStore;
  outbox: Outbox;
  attemptRepository: AttemptRepository;
  submissionRepository: SubmissionRepository;
}

const COMPOSITION_ROOT_KEY = Symbol.for('dmf.practice.compositionRoot');
const INSTANCE_IDS_KEY = Symbol.for('dmf.practice.instanceIds');

interface InstanceIds {
  processId: number;
  dbInstanceId: string;
  attemptRepoInstanceId: string;
  storeInstanceId: string;
}

/**
 * Get or create singleton composition root.
 * Returns the same deps object across all module reloads in the same process.
 */
export function getPracticeDeps(): PracticeDeps {
  const g = globalThis as any;
  
  // Check if already exists
  const existing = g[COMPOSITION_ROOT_KEY] as PracticeDeps | undefined;
  if (existing) {
    // Log reuse (temporary tracing)
    const instanceIds = g[INSTANCE_IDS_KEY] as InstanceIds;
    existing.logger.info('[COMPOSITION] Reusing existing deps', {
      processId: instanceIds.processId,
      dbInstanceId: instanceIds.dbInstanceId,
      attemptRepoInstanceId: instanceIds.attemptRepoInstanceId,
      storeInstanceId: instanceIds.storeInstanceId,
    });
    return existing;
  }

  // Create new instances
  const processId = process.pid;
  const dbInstanceId = `db-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const attemptRepoInstanceId = `repo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const storeInstanceId = getAttemptStoreInstanceId();

  const logger = new InMemoryLogger();
  const auditLogger = new InMemoryAuditLogger();
  const database = new InMemoryDatabase();
  const eventBus = sharedEventBus; // Use shared event bus for dev mode
  const idempotencyStore = new InMemoryIdempotencyStore();
  const outbox = new InMemoryOutbox();
  const attemptRepository = new AttemptRepository();
  const submissionRepository = new SubmissionRepository(database);

  const deps: PracticeDeps = {
    eventBus,
    database,
    logger,
    auditLogger,
    idempotencyStore,
    outbox,
    attemptRepository,
    submissionRepository,
  };

  // Store in globalThis
  g[COMPOSITION_ROOT_KEY] = deps;
  g[INSTANCE_IDS_KEY] = {
    processId,
    dbInstanceId,
    attemptRepoInstanceId,
    storeInstanceId,
  };

  // Log initialization (temporary tracing)
  logger.info('[COMPOSITION] Initialized new deps', {
    processId,
    dbInstanceId,
    attemptRepoInstanceId,
    storeInstanceId,
  });

  return deps;
}

/**
 * Get instance IDs for tracing (temporary, for debugging).
 */
export function getInstanceIds(): InstanceIds {
  const g = globalThis as any;
  return g[INSTANCE_IDS_KEY] || {
    processId: process.pid,
    dbInstanceId: 'unknown',
    attemptRepoInstanceId: 'unknown',
    storeInstanceId: 'unknown',
  };
}
