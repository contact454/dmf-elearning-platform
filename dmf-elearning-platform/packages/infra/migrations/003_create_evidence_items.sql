-- Migration: 003_create_evidence_items.sql
-- Phase 2 Sprint 1: SQLite Persistence (Opt-in)
-- Creates table for storing evidence items

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY,
  correlationId TEXT NOT NULL,
  status TEXT NOT NULL, -- EvidenceStatus enum value
  payload TEXT NOT NULL, -- JSON serialized EvidenceItem
  createdAt INTEGER NOT NULL, -- Unix timestamp in milliseconds
  updatedAt INTEGER NOT NULL -- Unix timestamp in milliseconds
);

CREATE INDEX IF NOT EXISTS idx_evidence_items_correlation_id ON evidence_items(correlationId);
CREATE INDEX IF NOT EXISTS idx_evidence_items_status ON evidence_items(status);
CREATE INDEX IF NOT EXISTS idx_evidence_items_created_at ON evidence_items(createdAt);
CREATE INDEX IF NOT EXISTS idx_evidence_items_updated_at ON evidence_items(updatedAt);
