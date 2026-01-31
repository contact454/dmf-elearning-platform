-- Migration: 004_create_readmodel_snapshots.sql
-- Phase 2 Sprint 1: SQLite Persistence (Opt-in)
-- Creates table for storing read model snapshots

CREATE TABLE IF NOT EXISTS readmodel_snapshots (
  id TEXT PRIMARY KEY,
  modelName TEXT NOT NULL,
  modelKey TEXT NOT NULL,
  snapshot TEXT NOT NULL, -- JSON serialized snapshot data
  eventId TEXT NOT NULL,
  correlationId TEXT,
  createdAt INTEGER NOT NULL -- Unix timestamp in milliseconds
);

CREATE INDEX IF NOT EXISTS idx_snapshots_model_name_key ON readmodel_snapshots(modelName, modelKey);
CREATE INDEX IF NOT EXISTS idx_snapshots_event_id ON readmodel_snapshots(eventId);
CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON readmodel_snapshots(createdAt);
CREATE INDEX IF NOT EXISTS idx_snapshots_correlation_id ON readmodel_snapshots(correlationId);
