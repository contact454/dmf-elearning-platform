-- Migration: 001_create_ops_policy_decisions.sql
-- Phase 2 Sprint 1: SQLite Persistence (Opt-in)
-- Creates table for storing policy decisions

CREATE TABLE IF NOT EXISTS ops_policy_decisions (
  id TEXT PRIMARY KEY,
  correlationId TEXT NOT NULL,
  actorType TEXT NOT NULL,
  actorUserId TEXT NOT NULL,
  decision TEXT NOT NULL, -- JSON serialized PolicyDecision
  createdAt INTEGER NOT NULL -- Unix timestamp in milliseconds
);

CREATE INDEX IF NOT EXISTS idx_policy_decisions_correlation_id ON ops_policy_decisions(correlationId);
CREATE INDEX IF NOT EXISTS idx_policy_decisions_actor_user_id ON ops_policy_decisions(actorUserId);
CREATE INDEX IF NOT EXISTS idx_policy_decisions_created_at ON ops_policy_decisions(createdAt);
