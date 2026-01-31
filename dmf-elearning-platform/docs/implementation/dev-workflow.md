# Development Workflow (MVP)
## Quy trình Phát triển

This document defines the development workflow, branching strategy, PR checklist, and architecture violation checklist for the DMF Hybrid Language Learning Platform.

---

## 1. Branching Strategy (Chiến lược Nhánh)

### Branch Naming

- **Feature**: `feature/{service-name}/{feature-description}`
  - Example: `feature/practice-service/lesson-start-handler`
- **Fix**: `fix/{service-name}/{fix-description}`
  - Example: `fix/assessment-service/quiz-validation`
- **Refactor**: `refactor/{service-name}/{refactor-description}`
  - Example: `refactor/shared/authz-helpers`

### Branch Protection

- **Main branch**: `main` (protected, requires PR)
- **PR requirements**:
  - At least 1 approval
  - All tests pass
  - Linting passes
  - No architecture violations (see checklist below)

---

## 2. PR Checklist (Checklist Pull Request)

### Code Quality

- [ ] Code follows TypeScript best practices
- [ ] Code is properly typed (no `any` unless necessary)
- [ ] Code has inline comments for complex logic (bilingual: English + tiếng Việt)
- [ ] Code follows ESLint rules
- [ ] Code is formatted with Prettier

### Testing

- [ ] Unit tests added/updated for new handlers
- [ ] Unit tests added/updated for new event consumers
- [ ] Contract tests pass (command/event schemas)
- [ ] Authz tests pass (403/404 error semantics)
- [ ] Integration tests pass (if applicable)

### Architecture Compliance

- [ ] No new commands/events/states/services invented
- [ ] Command/event names match frozen contracts
- [ ] Event payloads contain IDs only (no computed outcomes)
- [ ] Service only writes to owned state
- [ ] No direct DB access to foreign services
- [ ] Authz rules followed (403 role-only, 404 ownership)
- [ ] Teacher/Mentor access via queue boundary only
- [ ] No PII leakage in logs/read models

### Documentation

- [ ] Code comments explain complex logic
- [ ] README updated (if service structure changed)
- [ ] Architecture docs updated (if needed, with approval)

---

## 3. Architecture Violation Checklist (Checklist Vi phạm Kiến trúc)

### Violation 1: Cross-Service DB Writes

**Check**:
```bash
# ESLint rule should catch this
grep -r "foreign.*repository" services/
```

**Fix**: Use read-only HTTP APIs instead of direct DB access.

### Violation 2: New Commands/Events Not in Contracts

**Check**:
```typescript
// Build should fail if command not in registry
import { commandRegistry } from '@dmf/contracts';
const schema = commandRegistry['new.command.name']; // ❌ TypeScript error
```

**Fix**: Add command/event to `packages/contracts` (requires architecture approval).

### Violation 3: Non-ID Data in Event Payloads

**Check**:
```typescript
// TypeScript should catch this
interface MyEventPayload {
  userId: UserId; // ✅ OK
  score: number; // ❌ NO! Score is computed outcome
  email: string; // ❌ NO! Email is PII
}
```

**Fix**: Remove non-ID fields from event payload, fetch via read-only API in consumer.

### Violation 4: Derived State Updated by Commands

**Check**:
```typescript
// ESLint rule should catch this
// In command handler:
await masteryStateRepository.update(...); // ❌ NO! MasteryState is derived
```

**Fix**: Update derived state via event consumer, not command handler.

### Violation 5: Wrong Authz Error Semantics

**Check**:
```typescript
// ❌ Wrong: 403 for ownership failure
if (entity.userId !== authenticated.userId) {
  throw new ForbiddenError(); // NO!
}

// ✅ Correct: 404 for ownership failure
if (entity.userId !== authenticated.userId) {
  failOwnership(); // Returns 404
}
```

**Fix**: Use `failOwnership()` for ownership failures, `forbidRole()` for role violations.

### Violation 6: Teacher/Mentor Bypasses Queue

**Check**:
```typescript
// ❌ Wrong: Direct access without FeedbackRequest
const submission = await submissionRepository.findById(submissionId);

// ✅ Correct: Verify FeedbackRequest linkage
const feedbackRequest = await feedbackRequestRepository.findBySubmissionId(submissionId);
if (!feedbackRequest || feedbackRequest.authorId !== authenticated.userId) {
  failOwnership();
}
```

**Fix**: Always verify FeedbackRequest linkage for teacher/mentor access.

### Violation 7: PII Leakage in Logs

**Check**:
```typescript
// ❌ Wrong: Log PII
logger.info('User logged in', { email: user.email }); // NO!

// ✅ Correct: Log IDs only
logger.info('User logged in', { userId: user.id });
```

**Fix**: Use logger interface that enforces redaction (IDs only).

---

## 4. Development Commands (Lệnh Phát triển)

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Run all services in dev mode
pnpm dev

# Run specific service
pnpm --filter @dmf/practice-service dev

# Run with hot reload
pnpm --filter @dmf/practice-service dev --watch
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific service
pnpm --filter @dmf/practice-service test

# Run tests in watch mode
pnpm --filter @dmf/practice-service test --watch

# Run contract tests
pnpm --filter @dmf/testing test:contracts
```

### Linting

```bash
# Lint all packages and services
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Format code
pnpm format
```

### Building

```bash
# Build all packages and services
pnpm build

# Build specific service
pnpm --filter @dmf/practice-service build

# Build in production mode
pnpm build --mode production
```

---

## 5. Code Review Guidelines (Hướng dẫn Review)

### What to Review

1. **Architecture Compliance**: Does code follow frozen contracts?
2. **Error Semantics**: Are 403/404 used correctly?
3. **Event Payloads**: Do events contain IDs only?
4. **State Ownership**: Does service only write to owned state?
5. **Authz Rules**: Are authz checks correct?
6. **PII Handling**: Is PII properly redacted?

### Review Comments

- Use bilingual comments (English + tiếng Việt) for key architecture terms
- Reference frozen docs (STEP 4-9) when pointing out violations
- Suggest specific fixes, not just "this is wrong"

---

## 6. Troubleshooting (Xử lý Sự cố)

### Build Fails: Command/Event Not in Registry

**Error**: `TypeError: commandRegistry['new.command'] is undefined`

**Fix**: Add command/event to `packages/contracts` (requires architecture approval).

### TypeScript Error: Non-ID Field in Event Payload

**Error**: `Type '{ score: number }' is not assignable to type 'EventPayload'`

**Fix**: Remove non-ID fields from event payload, fetch via read-only API in consumer.

### ESLint Error: Importing Foreign Repository

**Error**: `Cannot import repository from foreign service`

**Fix**: Use read-only HTTP client instead of direct repository import.

### Test Fails: Authz Error Semantics

**Error**: `Expected 404 but got 403`

**Fix**: Use `failOwnership()` for ownership failures, not `forbidRole()`.

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Development workflow documented
