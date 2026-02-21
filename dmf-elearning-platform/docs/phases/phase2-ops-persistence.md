# Phase 2: Ops & Persistence Foundation

## Prerequisites

**Node.js Version:** This project requires Node.js 22 LTS (or 20 LTS). Node.js 25+ is not supported due to native dependency build issues.

**Setup:**
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Verify version
node --version  # Should show v22.x.x
```

See [Troubleshooting Guide](./troubleshooting.md) for more details.

## Overview

Phase 2 introduces persistence and modern ops capabilities to make the system restart-safe, operationally inspectable, and more reliable.

## Architecture

### Persistence Layer

**SQLite** is chosen as the persistence layer for Phase 2 (local/dev). It provides:
- File-based storage (restart-safe)
- ACID transactions
- Simple setup (no external dependencies)
- Easy migration to PostgreSQL later

**Key Components:**
- `@dmf/infra/adapters/sqlite-database.ts` - SQLite database adapter
- `@dmf/infra/adapters/sqlite-outbox.ts` - SQLite outbox adapter
- `@dmf/infra/adapters/sqlite-idempotency-store.ts` - SQLite idempotency store adapter
- `services/practice-service/src/state/sqlite-attempt.repository.ts` - SQLite attempt repository
- `services/curriculum-service/src/state/sqlite-enrollment.repository.ts` - SQLite enrollment repository

### Migrations

Migrations are stored in `migrations/` directory:
- `001_create_outbox.sql`
- `002_create_idempotency.sql`
- `003_create_attempts.sql`
- `004_create_enrollments.sql`

Migrations are run automatically on service startup in dev/E2E mode.

### Health Endpoints

All services expose:
- `GET /healthz` - Liveness probe (always returns 200 if service is running)
- `GET /readyz` - Readiness probe (checks database connectivity)

### Contract Lock

Contract schemas are locked in `.contracts-lock.json`. CI fails if schemas change without updating the lock file.

## Usage

### Local Development

```bash
# Start all services (with SQLite persistence)
pnpm dev

# Services will create SQLite databases in ./data/ directory:
# - data/practice.db
# - data/curriculum.db
# - data/infra.db (outbox + idempotency)
```

### E2E Testing

```bash
# Run E2E tests (uses separate SQLite databases)
pnpm e2e

# E2E databases are created in ./data/e2e/ directory
```

### Migrations

Migrations run automatically on startup. To run manually:

```bash
# Run migrations for a specific service
pnpm --filter @dmf/practice-service migrate

# Or use the migration script directly
tsx scripts/migrate.ts practice
```

## Configuration

### Environment Variables

- `DMF_DB_PATH` - Path to SQLite database file (default: `./data/{service}.db`)
- `DMF_DB_MIGRATIONS_PATH` - Path to migrations directory (default: `./migrations`)
- `DMF_MODE` - `dev` | `e2e` | `prod` (affects database path)

### Database Paths

- **Dev mode**: `./data/{service}.db`
- **E2E mode**: `./data/e2e/{service}.db`
- **Prod mode**: (future: PostgreSQL)

## Testing

### Restart Test

1. Start services: `pnpm dev`
2. Create an attempt: `curl -X POST http://localhost:3001/api/learning/lesson/start ...`
3. Stop services: `Ctrl+C`
4. Start services again: `pnpm dev`
5. Verify attempt still exists: `curl http://localhost:3001/api/debug/attempts/{attemptId}`

### Health Check Test

```bash
# Check liveness
curl http://localhost:3001/healthz

# Check readiness (should fail if DB is down)
curl http://localhost:3001/readyz
```

## Migration to PostgreSQL

Phase 2 uses SQLite for simplicity. Phase 3 will migrate to PostgreSQL:

1. Create PostgreSQL adapters (similar to SQLite)
2. Update connection logic
3. Update migrations (PostgreSQL syntax)
4. Add connection pooling
5. Add replication support

## Troubleshooting

### Database locked errors

SQLite can have locking issues with concurrent writes. Solutions:
- Use WAL mode (Write-Ahead Logging)
- Use connection pooling (future)
- Migrate to PostgreSQL (Phase 3)

### Migration failures

If migrations fail:
1. Check migration files in `migrations/` directory
2. Check database file permissions
3. Check for schema conflicts
4. Reset database: `rm data/{service}.db` (dev only)

## Next Steps

- [ ] Add connection pooling
- [ ] Add database backup/restore
- [ ] Add migration rollback
- [ ] Add database monitoring
- [ ] Migrate to PostgreSQL (Phase 3)
