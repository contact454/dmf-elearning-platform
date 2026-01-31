# Phase 2 Blockers - Resolution Summary

## Issues Resolved

### 1. Node Version Compatibility (better-sqlite3)

**Problem:** Node.js v25.3.0 breaks `better-sqlite3` build due to missing `distutils` module.

**Solution:**
- Added `.nvmrc` file pinning Node.js to version 22
- Updated `package.json` engines field to restrict Node to `>=20.0.0 <23.0.0`
- Added troubleshooting documentation explaining the issue
- Updated Phase 2 docs with Node version prerequisites

**Files Changed:**
- `.nvmrc` (new)
- `package.json` (engines field)
- `docs/phase2/troubleshooting.md` (new)
- `docs/phase2/ops-persistence.md` (prerequisites section)

### 2. Cyclic Dependency (@dmf/ops <-> @dmf/evidence)

**Problem:** Turbo build fails due to circular dependency between `@dmf/ops` and `@dmf/evidence`.

**Root Cause:**
- `@dmf/ops` imported `getEvidenceReviewRegistry` from `@dmf/evidence`
- `@dmf/evidence` had `@dmf/ops` as a dependency (unused, but still created cycle)

**Solution:**
- Created `EvidenceReviewRegistry` interface in `@dmf/shared`
- Implemented registry provider pattern:
  - `@dmf/shared` provides interface and provider functions
  - `@dmf/evidence` registers its implementation with `@dmf/shared`
  - `@dmf/ops` gets registry from `@dmf/shared` (no direct import from `@dmf/evidence`)
- Removed `@dmf/ops` dependency from `@dmf/evidence/package.json`
- Removed `@dmf/evidence` dependency from `@dmf/ops/package.json`

**Files Changed:**
- `packages/shared/src/ops/evidence-review-registry.interface.ts` (new)
- `packages/shared/src/index.ts` (export new interface)
- `packages/ops/src/readmodels/ops-snapshot-builder.ts` (import from `@dmf/shared` instead)
- `packages/evidence/src/domain/review-registry.ts` (register provider)
- `packages/evidence/src/index.ts` (ensure registry is initialized)
- `packages/ops/package.json` (removed `@dmf/evidence` dependency)
- `packages/evidence/package.json` (removed `@dmf/ops` dependency)

### 3. Contract Lock Script (tsx not found)

**Problem:** `pnpm contract-lock:generate` fails because `tsx` is not found.

**Solution:**
- Added `tsx` to root `package.json` devDependencies
- Added `glob` to root `package.json` devDependencies (required by contract-lock script)
- Fixed `glob` import in `scripts/contract-lock.ts` (changed from `glob` to `globSync`)

**Files Changed:**
- `package.json` (added `tsx` and `glob` to devDependencies)
- `scripts/contract-lock.ts` (fixed import to use `globSync`)

## Verification

Run these commands to verify all fixes:

```bash
# 1. Check Node version
node --version  # Should be v22.x.x or v20.x.x

# 2. Install dependencies
pnpm install

# 3. Build (should not report cycles)
pnpm build 2>&1 | grep -i "circular\|cycle"  # Should return nothing

# 4. Test contract lock
pnpm contract-lock:generate
pnpm contract-lock:validate  # Should pass

# 5. Run tests
pnpm test
```

## Architecture Changes

### Registry Provider Pattern

The cyclic dependency was broken using a registry provider pattern:

```
@dmf/shared (interface)
    ↑                    ↑
    |                    |
@dmf/evidence      @dmf/ops
(implementation)   (consumer)
```

- `@dmf/shared` defines the `EvidenceReviewRegistry` interface
- `@dmf/evidence` implements the registry and registers it with `@dmf/shared`
- `@dmf/ops` gets the registry from `@dmf/shared` without importing from `@dmf/evidence`

This pattern can be reused for other cyclic dependencies in the future.

## Next Steps

1. Run `pnpm install` to install new dependencies
2. Run `pnpm build` to verify no cycles
3. Run `pnpm contract-lock:generate` to create lock file
4. Run `pnpm test` to verify everything works
5. Continue with Phase 2 implementation
