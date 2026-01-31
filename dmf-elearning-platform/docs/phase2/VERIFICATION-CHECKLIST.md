# Phase 2 Verification Checklist

## Prerequisites

- [ ] Node.js version is 22.x (or 20.x)
  ```bash
  node --version  # Should show v22.x.x or v20.x.x
  ```

## A) Tooling Sanity

- [ ] `.nvmrc` file exists with Node 22
  ```bash
  cat .nvmrc  # Should show "22"
  ```

- [ ] `package.json` engines field restricts Node to <23
  ```bash
  grep -A 2 '"engines"' package.json
  ```

- [ ] Documentation updated with Node version requirement
  ```bash
  grep -i "node.*22\|node.*20\|node.*lts" docs/phase2/*.md
  ```

- [ ] Troubleshooting guide exists
  ```bash
  test -f docs/phase2/troubleshooting.md
  ```

## B) Cyclic Dependency Resolution

- [ ] `@dmf/ops` no longer depends on `@dmf/evidence`
  ```bash
  grep -v "^#" packages/ops/package.json | grep -i "@dmf/evidence"  # Should return nothing
  ```

- [ ] `@dmf/evidence` no longer depends on `@dmf/ops`
  ```bash
  grep -v "^#" packages/evidence/package.json | grep -i "@dmf/ops"  # Should return nothing
  ```

- [ ] Interface exists in `@dmf/shared` for evidence review registry
  ```bash
  test -f packages/shared/src/ops/evidence-review-registry.interface.ts
  ```

- [ ] `@dmf/ops` imports from `@dmf/shared` instead of `@dmf/evidence`
  ```bash
  grep -r "from '@dmf/evidence'" packages/ops/src/  # Should return nothing
  grep -r "from '@dmf/shared'" packages/ops/src/readmodels/ops-snapshot-builder.ts  # Should show import
  ```

- [ ] Turbo build reports no cycles
  ```bash
  pnpm build 2>&1 | grep -i "circular\|cycle"  # Should return nothing
  ```

## C) Contract Lock Script

- [ ] `tsx` is in root `package.json` devDependencies
  ```bash
  grep -i "tsx" package.json
  ```

- [ ] `glob` is in root `package.json` devDependencies
  ```bash
  grep -i "glob" package.json
  ```

- [ ] Contract lock script uses correct import
  ```bash
  grep "globSync\|glob\." scripts/contract-lock.ts
  ```

- [ ] Contract lock generate works
  ```bash
  pnpm contract-lock:generate
  test -f .contracts-lock.json
  ```

- [ ] Contract lock validate works
  ```bash
  pnpm contract-lock:validate  # Should pass
  ```

## D) Full Verification

- [ ] Install dependencies succeeds
  ```bash
  pnpm install
  ```

- [ ] Build succeeds without cycles
  ```bash
  pnpm build 2>&1 | tee build.log
  # Check build.log for "circular" or "cycle" - should be empty
  ```

- [ ] Typecheck passes
  ```bash
  pnpm typecheck  # If implemented
  ```

- [ ] Tests pass
  ```bash
  pnpm test
  ```

- [ ] Contract lock validation passes
  ```bash
  pnpm contract-lock:validate
  ```

## Quick Verification Command

Run this single command to verify everything:

```bash
echo "=== Node Version ===" && \
node --version && \
echo "\n=== Checking Dependencies ===" && \
grep -q "tsx" package.json && echo "✓ tsx found" || echo "✗ tsx missing" && \
grep -q "glob" package.json && echo "✓ glob found" || echo "✗ glob missing" && \
echo "\n=== Checking Cyclic Dependencies ===" && \
! grep -q "@dmf/evidence" packages/ops/package.json && echo "✓ @dmf/ops doesn't depend on @dmf/evidence" || echo "✗ @dmf/ops still depends on @dmf/evidence" && \
! grep -q "@dmf/ops" packages/evidence/package.json && echo "✓ @dmf/evidence doesn't depend on @dmf/ops" || echo "✗ @dmf/evidence still depends on @dmf/ops" && \
echo "\n=== Building ===" && \
pnpm build 2>&1 | grep -qi "circular\|cycle" && echo "✗ Build reports cycles" || echo "✓ Build has no cycles" && \
echo "\n=== Contract Lock ===" && \
pnpm contract-lock:generate && \
pnpm contract-lock:validate && echo "✓ Contract lock works" || echo "✗ Contract lock failed"
```

## Expected Output

All checks should pass (show ✓). If any show ✗, fix the issue before proceeding.
