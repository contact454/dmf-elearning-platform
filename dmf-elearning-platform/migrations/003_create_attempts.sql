-- Attempts table for practice service
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed', 'abandoned')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  abandoned_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_lesson ON attempts(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
