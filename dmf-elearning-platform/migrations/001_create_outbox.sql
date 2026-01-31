-- Outbox table for safe event emission
CREATE TABLE IF NOT EXISTS outbox (
  outbox_id TEXT PRIMARY KEY,
  command_key TEXT,
  event_id TEXT UNIQUE NOT NULL,
  event_name TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  status TEXT NOT NULL CHECK(status IN ('pending', 'published')),
  created_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_command_key ON outbox(command_key);
CREATE INDEX IF NOT EXISTS idx_outbox_event_id ON outbox(event_id);
