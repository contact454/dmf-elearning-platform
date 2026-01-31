# Troubleshooting Guide

## Node Version Issues

### Problem: `better-sqlite3` fails to build with Node 25+

**Symptoms:**
```
ModuleNotFoundError: No module named 'distutils'
```

**Cause:**
Node.js v25+ removed Python's `distutils` module, which is required by `node-gyp` (used by native modules like `better-sqlite3`). Python 3.14 also removed `distutils`.

**Solution:**
Use Node.js LTS version (22.x or 20.x):

```bash
# Using nvm
nvm install 22
nvm use 22

# Or using volta (if configured)
volta install node@22
```

**Verification:**
```bash
node --version  # Should show v22.x.x or v20.x.x
pnpm install    # Should succeed
```

### Why Node 25 Breaks Native Dependencies

Node.js v25+ uses a newer version of V8 that requires updated build tools. The `distutils` module was deprecated in Python 3.10 and removed in Python 3.12+. Native Node.js modules (like `better-sqlite3`) use `node-gyp` which relies on `distutils` for building.

**Workaround (if you must use Node 25):**
1. Install `setuptools` (provides `distutils`):
   ```bash
   pip install setuptools
   ```
2. Or use a Python version < 3.12

**Recommended:** Use Node.js 22 LTS (or 20 LTS) for this project.

## Python / node-gyp Issues (macOS arm64)

### Problem: `node-gyp` uses Python 3.14.x and fails with `distutils` missing

**Symptoms:**
```
ModuleNotFoundError: No module named 'distutils'
```

**Confirm which Python node-gyp is using:**
Run:
```bash
pnpm run doctor
```

If you have a failing install log, it will also show a line like:
```
gyp info find Python using Python version 3.14.x found at "/opt/homebrew/opt/python@3.14/bin/python3.14"
```

**Fix (preferred): force node-gyp to use Python 3.11**
```bash
brew install python@3.11
pnpm run setup:python
```

If `pnpm config set` fails due to permissions (sandboxed shells / locked-down environments), use the repo-provided wrapper that sets env vars for node-gyp:
```bash
pnpm run install:mac
```

Or run manually:
```bash
npm_config_python=/opt/homebrew/opt/python@3.11/bin/python3.11 \
PYTHON=/opt/homebrew/opt/python@3.11/bin/python3.11 \
pnpm install
```

Then retry:
```bash
pnpm install
```

### Fallback if prebuilds are missing on Node 22

If `better-sqlite3` does not provide a prebuilt binary for your exact Node 22 version/platform and compilation is still failing, switch local dev to **Node 20 LTS**:
```bash
# example if you use a node version manager
# nvm install 20 && nvm use 20
node --version
pnpm install
```

## Cyclic Dependency Issues

### Problem: Turbo reports cyclic workspace dependencies

**Symptoms:**
```
Circular dependency detected: @dmf/ops <-> @dmf/evidence
```

**Solution:**
See [Breaking Cyclic Dependencies](#breaking-cyclic-dependencies) section below.

## Contract Lock Script Issues

### Problem: `tsx` command not found

**Symptoms:**
```
Error: Cannot find module 'tsx'
```

**Solution:**
```bash
pnpm install  # Install dependencies including tsx
```

If still failing, ensure `tsx` is in root `package.json` devDependencies.

## Build Issues

### Problem: TypeScript compilation errors

**Symptoms:**
```
error TS2307: Cannot find module '@dmf/...'
```

**Solution:**
1. Ensure all packages are built:
   ```bash
   pnpm build
   ```
2. Check workspace dependencies in `package.json`
3. Verify `tsconfig.json` paths are correct

### Problem: Migration files not found

**Symptoms:**
```
Error: ENOENT: no such file or directory, open 'migrations/001_create_outbox.sql'
```

**Solution:**
Ensure migrations directory exists and contains migration files:
```bash
ls migrations/
```

## Database Issues

### Problem: SQLite database locked

**Symptoms:**
```
SQLITE_BUSY: database is locked
```

**Solution:**
- SQLite uses WAL mode by default (better concurrency)
- If still locked, check for multiple processes accessing the same database
- In E2E mode, use separate databases per test run

### Problem: Migrations not running

**Symptoms:**
Tables don't exist after service start

**Solution:**
1. Check migration files exist in `migrations/` directory
2. Check database path is correct
3. Verify migration table exists:
   ```sql
   SELECT * FROM migrations;
   ```

## E2E Test Issues

### Problem: Tests are flaky

**Symptoms:**
Tests pass sometimes but fail other times

**Solution:**
1. Use fixed correlation IDs (not random)
2. Ensure cleanup between test runs
3. Use separate databases for E2E (`./data/e2e/`)

### Problem: Services not starting

**Symptoms:**
E2E tests fail with connection errors

**Solution:**
1. Check ports are not in use:
   ```bash
   pnpm dev:clean  # Kills ports and restarts
   ```
2. Verify all services are running:
   ```bash
   curl http://localhost:3001/healthz
   ```

## Performance Issues

### Problem: Slow builds

**Symptoms:**
`pnpm build` takes a long time

**Solution:**
1. Use Turbo cache:
   ```bash
   pnpm build --force  # Clear cache and rebuild
   ```
2. Check for unnecessary dependencies
3. Verify TypeScript incremental builds are enabled

## Getting Help

If you encounter issues not covered here:

1. Check logs: `pnpm build 2>&1 | tee build.log`
2. Verify Node version: `node --version`
3. Verify dependencies: `pnpm install`
4. Check for circular dependencies: `pnpm build` (Turbo will report cycles)
5. Check contract lock: `pnpm contract-lock:validate`
