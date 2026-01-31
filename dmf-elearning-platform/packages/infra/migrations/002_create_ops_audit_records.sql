-- Migration: 002_create_ops_audit_records.sql
-- Phase 2 Sprint 1: SQLite Persistence (Opt-in)
-- Creates table for storing audit records

CREATE TABLE IF NOT EXISTS ops_audit_records (
  id TEXT PRIMARY KEY,
  correlationId TEXT NOT NULL,
  actorType TEXT NOT NULL,
  actorUserId TEXT,
  record TEXT NOT NULL, -- JSON serialized AuditRecord
  createdAt INTEGER NOT NULL -- Unix timestamp in milliseconds
);

CREATE INDEX IF NOT EXISTS idx_audit_records_correlation_id ON ops_audit_records(correlationId);
CREATE INDEX IF NOT EXISTS idx_audit_records_actor_user_id ON ops_audit_records(actorUserId);
CREATE INDEX IF NOT EXISTS idx_audit_records_created_at ON ops_audit_records(createdAt);
CREATE INDEX IF NOT EXISTS idx_audit_records_actor_type ON ops_audit_records(actorType);
