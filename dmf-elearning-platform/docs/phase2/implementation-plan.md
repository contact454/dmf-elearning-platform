# Phase 2 Implementation Plan

## Architecture Overview

### Persistence Strategy
- **SQLite** for local/dev (file-based, restart-safe)
- Migrations in `migrations/` directory
- Automatic migration on startup
- Separate databases per service: `practice.db`, `curriculum.db`, `infra.db`

### Key Components

1. **SQLite Database Adapter** (`packages/infra/src/adapters/sqlite-database.ts`)
   - Implements `Database` interface
   - Uses `better-sqlite3` library
   - Supports transactions
   - WAL mode for better concurrency

2. **SQLite Outbox Adapter** (`packages/infra/src/adapters/sqlite-outbox.ts`)
   - Implements `Outbox` interface
   - Stores events in `outbox` table
   - Supports pending/published status

3. **SQLite Idempotency Store** (`packages/infra/src/adapters/sqlite-idempotency-store.ts`)
   - Implements `IdempotencyStore` interface
   - Stores idempotency keys in `idempotency` table

4. **SQLite Attempt Repository** (`services/practice-service/src/state/sqlite-attempt.repository.ts`)
   - Implements same interface as `AttemptRepository`
   - Uses SQLite instead of Map

5. **SQLite Enrollment Repository** (`services/curriculum-service/src/state/sqlite-enrollment.repository.ts`)
   - Updates existing `EnrollmentRepository` to use SQLite

## File Structure

```
packages/infra/src/adapters/
  - sqlite-database.ts (NEW)
  - sqlite-outbox.ts (NEW)
  - sqlite-idempotency-store.ts (NEW)

services/practice-service/src/state/
  - sqlite-attempt.repository.ts (NEW)
  - attempt.repository.ts (MODIFY - add factory)

services/curriculum-service/src/state/
  - enrollment.repository.ts (MODIFY - use SQLite)

migrations/
  - 001_create_outbox.sql (NEW)
  - 002_create_idempotency.sql (NEW)
  - 003_create_attempts.sql (NEW)
  - 004_create_enrollments.sql (NEW)

scripts/
  - migrate.ts (NEW)

packages/infra/src/
  - migration-runner.ts (NEW)
```

## Migration Schema

### Outbox Table
```sql
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

CREATE INDEX idx_outbox_status ON outbox(status);
CREATE INDEX idx_outbox_command_key ON outbox(command_key);
```

### Idempotency Table
```sql
CREATE TABLE IF NOT EXISTS idempotency (
  key TEXT PRIMARY KEY,
  result_ids TEXT NOT NULL, -- JSON
  emitted_event_ids TEXT NOT NULL, -- JSON array
  timestamp TEXT NOT NULL
);
```

### Attempts Table
```sql
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed', 'abandoned')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  abandoned_at TEXT
);

CREATE INDEX idx_attempts_user_lesson ON attempts(user_id, lesson_id);
```

### Enrollments Table
```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TEXT NOT NULL,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

## Implementation Steps

1. **Add SQLite dependency**
   - Add `better-sqlite3` to `packages/infra/package.json`

2. **Create SQLite Database Adapter**
   - Implement `Database` interface
   - Add migration runner
   - Support WAL mode

3. **Create SQLite Outbox Adapter**
   - Implement `Outbox` interface
   - Use outbox table

4. **Create SQLite Idempotency Store**
   - Implement `IdempotencyStore` interface
   - Use idempotency table

5. **Create SQLite Attempt Repository**
   - Implement same interface as in-memory version
   - Use attempts table

6. **Update Enrollment Repository**
   - Use SQLite instead of in-memory

7. **Add Health Endpoints**
   - `/healthz` - liveness
   - `/readyz` - readiness (check DB)

8. **Add Contract Lock**
   - Generate `.contracts-lock.json`
   - Add CI check

9. **Update CI Scripts**
   - Add `pnpm lint`
   - Add `pnpm typecheck`
   - Add `pnpm test`
   - Add `pnpm e2e`
   - Add contract lock check

10. **Update E2E**
    - Use fixed correlation IDs
    - Cleanup between runs

## Risk Mitigation

1. **SQLite Locking**: Use WAL mode, handle errors gracefully
2. **Migration Failures**: Add rollback support (future)
3. **Data Loss**: Add backup scripts (future)
4. **Performance**: Monitor query performance, add indexes
5. **E2E Flakiness**: Use deterministic IDs, cleanup properly

## Testing Strategy

1. **Unit Tests**: Test each adapter independently
2. **Integration Tests**: Test repositories with SQLite
3. **E2E Tests**: Run full flow with persistence
4. **Restart Test**: Verify data persists across restarts
5. **Health Check Test**: Verify readiness fails when DB down

## Rollout Plan

1. Implement SQLite adapters (non-breaking)
2. Add feature flag to switch between in-memory and SQLite
3. Test thoroughly in dev
4. Enable SQLite in E2E
5. Monitor for issues
6. Remove in-memory adapters (future)
