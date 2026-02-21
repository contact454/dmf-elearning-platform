# Phase 2 Kickoff: Modern Ops & Persistence — Summary

## ✅ Completed (Foundation)

### 1. SQLite Persistence Layer

**Created:**
- `packages/infra/src/adapters/sqlite-database.ts` - SQLite database adapter
- `packages/infra/src/adapters/sqlite-outbox.ts` - SQLite outbox adapter
- `packages/infra/src/adapters/sqlite-idempotency-store.ts` - SQLite idempotency store
- `services/practice-service/src/state/sqlite-attempt.repository.ts` - SQLite attempt repository

**Migrations:**
- `migrations/001_create_outbox.sql` - Outbox table
- `migrations/002_create_idempotency.sql` - Idempotency table
- `migrations/003_create_attempts.sql` - Attempts table
- `migrations/004_create_enrollments.sql` - Enrollments table

**Updated:**
- `services/curriculum-service/src/state/enrollment.repository.ts` - Uses SQLite queries
- `packages/infra/package.json` - Added `better-sqlite3` dependency

### 2. Health Endpoints

**Updated:**
- `services/practice-service/src/http/health.route.ts` - Added `/healthz` (liveness) and `/readyz` (readiness)

**Pattern:**
- `/healthz` - Always returns 200 if service is running
- `/readyz` - Returns 200 if database is connected, 503 if not
- `/health` - Legacy endpoint (same as `/readyz`)

### 3. Contract Lock Mechanism

**Created:**
- `scripts/contract-lock.ts` - Contract lock generator/validator
- `.contracts-lock.json` - Lock file (to be generated)

**Commands:**
- `pnpm contract-lock:generate` - Generate lock file
- `pnpm contract-lock:validate` - Validate lock file (CI)

### 4. CI Scripts

**Updated:**
- `package.json` - Added `typecheck`, `contract-lock:generate`, `contract-lock:validate`
- Updated `ci` script to include typecheck, lint, test, contract-lock validation

## 🚧 Remaining Work

### 1. Service Integration

**Need to update:**
- `services/practice-service/src/composition-root.ts` - Switch to SQLite adapters
- `services/practice-service/src/index.ts` - Use SQLite database
- `services/curriculum-service/src/index.ts` - Use SQLite database
- All other services - Add health endpoints

### 2. Health Endpoints

**Need to add to all services:**
- onboarding-service
- curriculum-service (update existing)
- progress-service
- motivation-progress-service
- assessment-service
- read-service
- ops-admin-service
- evidence-service
- ops-service

### 3. E2E Updates

**Need to:**
- Use fixed correlation IDs for determinism
- Add cleanup between runs
- Verify restart test works

### 4. Policy Center Skeleton

**Need to create:**
- `packages/contracts/src/commands/policy.ts` - Policy commands (already exists, may need updates)
- `packages/infra/src/policy-store.ts` - Policy store interface
- `packages/infra/src/adapters/sqlite-policy-store.ts` - SQLite policy store

### 5. RBAC/Versioning Placeholders

**Need to create:**
- `packages/shared/src/rbac/` - RBAC types and interfaces
- `packages/infra/src/versioning/` - Versioning interfaces
- Placeholder implementations

## 📋 Next Steps

1. **Complete Service Integration**
   - Update composition roots to use SQLite
   - Test restart persistence
   - Verify E2E still passes

2. **Add Health Endpoints to All Services**
   - Copy pattern from practice-service
   - Test readiness checks

3. **Update E2E**
   - Add deterministic IDs
   - Add cleanup
   - Test restart scenario

4. **Create Policy Center Skeleton**
   - Define contracts
   - Create store interfaces
   - Add SQLite implementation

5. **Create RBAC/Versioning Placeholders**
   - Define types
   - Create interfaces
   - Document future implementation

## 🔍 Verification Commands

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Generate contract lock
pnpm contract-lock:generate

# Validate contract lock
pnpm contract-lock:validate

# Run typecheck
pnpm typecheck

# Run tests
pnpm test

# Run E2E
pnpm e2e

# Start services (with SQLite)
pnpm dev
```

## 📝 Notes

- SQLite databases are created in `./data/` directory (dev) or `./data/e2e/` (E2E)
- Migrations run automatically on service startup
- Health endpoints follow Kubernetes conventions (`/healthz`, `/readyz`)
- Contract lock ensures schema changes are intentional
- All changes are backward compatible (in-memory adapters still work)

## 🎯 Acceptance Criteria Status

- ✅ SQLite adapters created
- ✅ Migrations created
- ✅ Health endpoints pattern defined
- ✅ Contract lock mechanism created
- ✅ CI scripts updated
- 🚧 Service integration (in progress)
- 🚧 E2E updates (pending)
- 🚧 Policy Center skeleton (pending)
- 🚧 RBAC/Versioning placeholders (pending)

## 🚀 Ready for Next Phase

Foundation is in place. Next steps:
1. Complete service integration
2. Add health endpoints to all services
3. Update E2E
4. Create Policy Center skeleton
5. Create RBAC/Versioning placeholders
