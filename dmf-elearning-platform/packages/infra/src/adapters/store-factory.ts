/**
 * Store Factory: Creates persistence stores based on environment configuration
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Usage:
 *   const stores = createStores({ persistence: 'memory' }); // Default
 *   const stores = createStores({ persistence: 'sqlite', dbPath: './data/app.db' });
 */

import Database from 'better-sqlite3';
import type { PolicyDecisionStore } from '../ports/PolicyDecisionStore.js';
import type { AuditStore } from '../ports/AuditStore.js';
import type { EvidenceStore } from '../ports/EvidenceStore.js';
import type { SnapshotStore } from '../ports/SnapshotStore.js';
import { SqlitePolicyDecisionStore } from './sqlite-policy-decision-store.js';
import { SqliteAuditStore } from './sqlite-audit-store.js';
import { SqliteEvidenceStore } from './sqlite-evidence-store.js';
import { SqliteSnapshotStore } from './sqlite-snapshot-store.js';
import { InMemoryPolicyDecisionStore } from './in-memory-policy-decision-store.js';
import { InMemoryAuditStore } from './in-memory-audit-store.js';
import { InMemoryEvidenceStore } from './in-memory-evidence-store.js';
import { InMemorySnapshotStore } from './in-memory-snapshot-store.js';

export type PersistenceType = 'memory' | 'sqlite';

export interface StoreFactoryOptions {
  persistence?: PersistenceType;
  dbPath?: string;
}

export interface Stores {
  policyDecisionStore: PolicyDecisionStore;
  auditStore: AuditStore;
  evidenceStore: EvidenceStore;
  snapshotStore: SnapshotStore;
}

/**
 * Create persistence stores based on configuration
 * 
 * Defaults to in-memory stores unless DMF_PERSISTENCE=sqlite is set.
 */
export function createStores(options?: StoreFactoryOptions): Stores {
  const persistence = options?.persistence || (process.env.DMF_PERSISTENCE === 'sqlite' ? 'sqlite' : 'memory');
  
  if (persistence === 'sqlite') {
    const dbPath = options?.dbPath || process.env.DMF_DB_PATH || ':memory:';
    const db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    return {
      policyDecisionStore: new SqlitePolicyDecisionStore(db),
      auditStore: new SqliteAuditStore(db),
      evidenceStore: new SqliteEvidenceStore(db),
      snapshotStore: new SqliteSnapshotStore(db),
    };
  }
  
  // Default: in-memory stores
  return {
    policyDecisionStore: new InMemoryPolicyDecisionStore(),
    auditStore: new InMemoryAuditStore(),
    evidenceStore: new InMemoryEvidenceStore(),
    snapshotStore: new InMemorySnapshotStore(),
  };
}
