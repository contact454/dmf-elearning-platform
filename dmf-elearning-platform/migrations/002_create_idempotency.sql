-- Idempotency store table
CREATE TABLE IF NOT EXISTS idempotency (
  key TEXT PRIMARY KEY,
  result_ids TEXT NOT NULL, -- JSON
  emitted_event_ids TEXT NOT NULL, -- JSON array
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_timestamp ON idempotency(timestamp);
