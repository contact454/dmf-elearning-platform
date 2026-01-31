# Development and E2E Testing Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- macOS or Linux (for port cleanup script)

## Installation

```bash
pnpm install
```

## Development

### Start all services

```bash
pnpm dev
```

This starts all services concurrently:
- Onboarding service: http://localhost:3002
- Curriculum service: http://localhost:3003
- Practice service: http://localhost:3001
- Progress service: http://localhost:3004
- Motivation Progress service: http://localhost:3005
- Assessment service: http://localhost:3006

### Handle port collisions

If you see `EADDRINUSE` errors, ports are already in use. Clean up and restart:

```bash
pnpm dev:clean
```

This kills processes on ports 3001-3006 and starts services fresh.

### Manual port cleanup

```bash
tsx scripts/kill-ports.ts [port1] [port2] ...
```

Example:
```bash
tsx scripts/kill-ports.ts 3001 3002
```

### Health checks

All services expose a health endpoint:

```bash
curl http://localhost:3001/health  # Practice service
curl http://localhost:3002/health  # Onboarding service
curl http://localhost:3003/health  # Curriculum service
curl http://localhost:3004/health  # Progress service
curl http://localhost:3005/health  # Motivation Progress service
curl http://localhost:3006/health  # Assessment service
```

Response format:
```json
{
  "ok": true,
  "service": "practice-service",
  "version": "0.1.0",
  "timestamp": "2024-01-19T12:00:00.000Z"
}
```

## Building

```bash
pnpm build
```

Builds all packages and services.

## Testing

### Run all tests

```bash
pnpm test
```

This runs unit tests across all packages. Packages with no tests will pass (no failure).

### Run tests for a specific package

```bash
pnpm --filter @dmf/practice-service test
```

## E2E Testing

### Run E2E tests

**Important**: Services must be running before running E2E tests.

**For development (with watch mode):**
1. Start services in one terminal:
   ```bash
   pnpm dev
   ```

2. Run E2E tests in another terminal:
   ```bash
   pnpm e2e
   ```

**For CI/E2E stability (non-watch mode, recommended):**
1. Start services in one terminal:
   ```bash
   pnpm dev:e2e
   ```

2. Run E2E tests in another terminal:
   ```bash
   pnpm e2e
   ```

**Note**: `dev:e2e` runs services without watch mode, preventing state resets between requests. Use this for reliable E2E runs.

### E2E test flow

The E2E test suite (`packages/e2e`) runs a smoke test that:
1. Registers a user
2. Enrolls in a course
3. Gets available lessons
4. Starts a lesson (creates attempt)
5. Submits an activity
6. Completes the lesson
7. Queries the dashboard

All steps must pass for the suite to succeed.

## CI/CD

The CI pipeline (`.github/workflows/ci.yml`) runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. `pnpm test`
4. Start services in background
5. Wait for all services to be healthy (checks `/health` endpoints)
6. `pnpm e2e`
7. Cleanup background processes

### CI requirements

- Node.js 20.x
- pnpm 8.15.1
- Services must respond to `/health` within 60 seconds
- E2E tests must complete within 5 minutes

## Troubleshooting

### Port already in use

**Symptom**: `EADDRINUSE` error when starting services

**Solution**:
```bash
pnpm dev:clean
```

### E2E tests fail with "Attempt not found"

**Symptom**: Step 4 (Submit activity) fails

**Possible causes**:
- Services not fully started (wait a few seconds)
- Port collision (use `pnpm dev:clean`)
- Module reload issue (restart services)

**Solution**:
1. Ensure all services are running: `curl http://localhost:3001/health`
2. Restart services: `pnpm dev:clean`
3. Wait 5 seconds for services to initialize
4. Run E2E again: `pnpm e2e`

### "No test files found" error

**Symptom**: `pnpm test` fails with "No test files found"

**Solution**: This should not happen. All packages are configured with `passWithNoTests: true`. If it does, check:
- `packages/testing/src/__tests__/vitest.config.ts` has `passWithNoTests: true`
- Package `package.json` has `"test": "vitest run --passWithNoTests"`

### Services not responding

**Symptom**: Health checks fail or timeout

**Solution**:
1. Check if services are running: `ps aux | grep tsx`
2. Check logs for errors
3. Verify ports are not blocked: `lsof -i :3001`
4. Restart: `pnpm dev:clean`

## Service Ports Reference

| Service | Port | Health Endpoint |
|---------|------|----------------|
| Practice | 3001 | http://localhost:3001/health |
| Onboarding | 3002 | http://localhost:3002/health |
| Curriculum | 3003 | http://localhost:3003/health |
| Progress | 3004 | http://localhost:3004/health |
| Motivation Progress | 3005 | http://localhost:3005/health |
| Assessment | 3006 | http://localhost:3006/health |

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services concurrently |
| `pnpm dev:clean` | Kill ports 3001-3006 and start services |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all unit tests |
| `pnpm e2e` | Run E2E smoke tests |
| `pnpm ci` | Run build + test + e2e (CI command) |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Clean build artifacts |
