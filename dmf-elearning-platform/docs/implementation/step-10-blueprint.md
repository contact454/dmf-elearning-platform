# STEP 10 — Implementation Blueprint (MVP)
## Bản thiết kế Triển khai (Khung cấu trúc)

**Status**: ACTIVE  
**Scope**: STEP 10 — Repository Scaffolding & Implementation Guardrails  
**Date**: 2026-01-18 (Asia/Ho_Chi_Minh)

---

This document defines the repository structure, package organization, and implementation guardrails for the DMF Hybrid Language Learning Platform MVP.

---

## 0. Repository Decision (Quyết định Cấu trúc)

### Monorepo Structure

- **Package Manager**: `pnpm` (already configured)
- **Build System**: `turbo` (preferred for simplicity and speed)
- **Workspace Pattern**: 
  - `packages/*` — Shared libraries
  - `services/*` — Microservices
  - `apps/*` — Frontend applications (out of scope for STEP 10)

### Rationale

- **Monorepo**: Enables shared types, contracts, and infrastructure across services
- **pnpm**: Fast, disk-efficient, strict dependency resolution
- **turbo**: Fast incremental builds, task orchestration, caching

---

## 1. Service Boundaries Summary (Tóm tắt Ranh giới Dịch vụ)

### Write Services (Own State)

| Service | Owns State | Handles Commands | Emits Events |
|---------|-----------|------------------|--------------|
| `practice-service` | Attempt, Submission | `learning.lesson.start`, `learning.lesson.complete`, `learning.lesson.abandon`, `learning.activity.submit` | `learning.lesson.started`, `learning.lesson.completed`, `learning.lesson.abandoned`, `learning.submission.created` |
| `assessment-service` | Assessment | `assessment.quiz.start`, `assessment.quiz.submit`, `assessment.placement.take` | `assessment.quiz.started`, `assessment.quiz.submitted`, `assessment.level_test.completed` |
| `mentoring-service` | Feedback, FeedbackRequest | `mentoring.feedback.request`, `mentoring.feedback.publish` | `mentoring.feedback.requested`, `mentoring.feedback.published` |
| `curriculum-service` | Enrollment, Course, Unit, Lesson, SRSItem | `curriculum.course.enroll`, `system.srs.schedule` | `curriculum.course.enrolled`, `curriculum.srs_items.due` |
| `onboarding-service` | User, LearnerProfile, Session | `system.user.register`, `system.user.login`, `system.profile.modify` | `system.user.registered`, `system.user.login`, `system.profile.updated` |

### Derived State Services (Event Consumers)

| Service | Owns Derived State | Consumes Events | Updates State |
|---------|-------------------|-----------------|---------------|
| `progress-service` | ProgressState | `learning.lesson.completed`, `curriculum.course.enrolled`, `curriculum.unit.unlocked`, `system.user.registered`, `assessment.level_test.completed`, `system.profile.updated` | ProgressState (unlocked lessons/units) |
| `motivation-progress-service` | MasteryState, SkillScore | `learning.lesson.completed`, `learning.submission.created`, `assessment.quiz.submitted`, `mentoring.feedback.published`, `system.profile.updated` | MasteryState, SkillScore (aggregated scores) |

### Query Layer Decision

**Decision**: Read models and query endpoints are hosted within their owning services (no separate `query-service` for MVP).

**Rationale**:
- Simpler architecture for MVP
- Read models are co-located with write models (same service)
- Reduces network hops
- Easier to maintain consistency

**Services Serving Queries**:
- `progress-service`: `/api/learner/dashboard`, `/api/learner/courses/:courseId/progress`
- `practice-service`: `/api/learner/lessons/:lessonId/attempts`, `/api/learner/attempts/:attemptId`, `/api/learner/submissions`, `/api/learner/submissions/:submissionId`, `/api/teacher/submissions/:submissionId`
- `mentoring-service`: `/api/teacher/feedback-queue`, `/api/teacher/feedback-requests/:feedbackRequestId`
- `motivation-progress-service`: `/api/learner/mastery`
- `assessment-service`: `/api/learner/readiness`
- `onboarding-service`: `/api/teacher/learners/:userId/summary` (composes from multiple services)

---

## 2. Package Structure (Cấu trúc Gói)

### packages/shared

**Purpose**: Type definitions only (NO business logic)

**Contents**:
- Branded ID types (`UserId`, `LessonId`, `AttemptId`, etc.)
- Enums (`SkillType`, `UserRole`, etc.)
- Shared value objects (if any)
- NO domain logic, NO service clients, NO repositories

### packages/contracts

**Purpose**: Command and event schemas (frozen from STEP 4.2, STEP 5C)

**Contents**:
- TypeScript interfaces for all 15 commands
- TypeScript interfaces for all events
- Zod schemas for validation
- Command registry: `commandRegistry: Record<CommandName, ZodSchema>`
- Event registry: `eventRegistry: Record<EventName, ZodSchema>`
- **Guardrail**: Any new command/event name not in registry → build error

### packages/infra

**Purpose**: Infrastructure ports (interfaces only, no implementations)

**Contents**:
- `EventBus` interface (emit, subscribe)
- `Logger` interface (with PII redaction)
- `Database` port interface (repository pattern)
- `HttpClient` interface (for read-only service calls)
- NO concrete implementations (adapters in services)

### packages/testing

**Purpose**: Test utilities and contract test helpers

**Contents**:
- Contract test utilities (verify command/event schemas)
- Test helpers for authz checks
- Mock factories for services
- Event consumer test utilities

---

## 3. Service Folder Structure (Cấu trúc Thư mục Dịch vụ)

Each service follows this structure:

```
services/{service-name}/
├── src/
│   ├── index.ts                    # Bootstrap (HTTP server, event bus connection)
│   ├── http/                       # HTTP controllers (Fastify routes)
│   │   ├── commands/               # Command endpoints (POST)
│   │   ├── queries/                # Query endpoints (GET)
│   │   └── middleware/             # Auth, validation, rate limiting
│   ├── application/                # Command handlers (use cases)
│   │   └── {command-name}.handler.ts
│   ├── domain/                     # Domain entities (only for owned write states)
│   │   ├── entities/
│   │   └── value-objects/
│   ├── state/                      # Repositories for owned states
│   │   └── {entity-name}.repository.ts
│   ├── events/                     # Event emitters + consumers
│   │   ├── emitter.ts
│   │   └── consumers/
│   ├── read/                       # Read-only clients to other services
│   │   └── {service-name}.client.ts
│   ├── auth/                       # Authorization checks (STEP 8B)
│   │   └── authz.ts
│   └── observability/              # Audit logs, metrics hooks (STEP 9)
│       ├── audit.ts
│       └── metrics.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. How to Add a New Handler Safely (Cách Thêm Handler Mới)

### Step 1: Verify Command Exists in Contracts

```typescript
import { commandRegistry } from '@dmf/contracts';

// Build will fail if command not in registry
const schema = commandRegistry['learning.lesson.start'];
```

### Step 2: Create Handler in application/

```typescript
// services/practice-service/src/application/learning.lesson.start.handler.ts
import { LearningLessonStartCommand } from '@dmf/contracts';
import { AttemptRepository } from '../state/attempt.repository';
import { EventEmitter } from '../events/emitter';
import { forbidRole, failOwnership } from '@dmf/shared/authz';

export async function handleLearningLessonStart(
  command: LearningLessonStartCommand,
  context: { userId: string; role: string }
) {
  // 1. Authz check
  forbidRole(context.role, ['learner']); // Throws 403 if not learner
  
  // 2. Domain logic (create Attempt)
  const attempt = await attemptRepository.create({ ... });
  
  // 3. Emit event (IDs only)
  await eventEmitter.emit({
    eventName: 'learning.lesson.started',
    payload: {
      eventId: generateId(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      attemptId: attempt.id,
      userId: attempt.userId,
      lessonId: command.lessonId,
    },
  });
  
  return attempt;
}
```

### Step 3: Register Route in http/commands/

```typescript
// services/practice-service/src/http/commands/learning.lesson.start.route.ts
import { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleLearningLessonStart } from '../../application/learning.lesson.start.handler';

export function registerLearningLessonStartRoute(app: FastifyInstance) {
  app.post('/api/learning/lesson/start', async (request, reply) => {
    const command = commandRegistry['learning.lesson.start'].parse(request.body);
    const context = extractAuthContext(request);
    
    const result = await handleLearningLessonStart(command, context);
    return reply.code(201).send(result);
  });
}
```

### Step 4: Add Event Consumer (if needed)

```typescript
// services/progress-service/src/events/consumers/learning.lesson.completed.consumer.ts
import { LearningLessonCompletedEvent } from '@dmf/contracts';
import { ProgressStateRepository } from '../../state/progress-state.repository';

export async function handleLearningLessonCompleted(
  event: LearningLessonCompletedEvent
) {
  // 1. Dedupe by eventId
  if (await isEventProcessed(event.eventId)) {
    return; // Idempotent replay
  }
  
  // 2. Read Attempt via read-only API (not from event payload)
  const attempt = await practiceServiceClient.getAttempt(event.payload.attemptId);
  
  // 3. Update own state
  await progressStateRepository.addCompletedLesson(
    event.payload.userId,
    event.payload.lessonId
  );
  
  // 4. Mark event as processed
  await markEventProcessed(event.eventId);
}
```

---

## 5. How to Run (Cách Chạy)

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
# Run all services in dev mode
pnpm dev

# Run specific service
pnpm --filter @dmf/practice-service dev
```

### Build

```bash
# Build all packages and services
pnpm build

# Build specific service
pnpm --filter @dmf/practice-service build
```

### Test

```bash
# Run all tests
pnpm test

# Run tests for specific service
pnpm --filter @dmf/practice-service test
```

### Lint

```bash
# Lint all packages and services
pnpm lint

# Fix linting issues
pnpm lint:fix
```

---

## 6. Guardrails Summary (Tóm tắt Rào chắn)

### 1. No Cross-Service DB Writes

- **Enforcement**: Repository interfaces are service-scoped
- **Check**: ESLint rule prevents importing foreign service repositories

### 2. Commands & Events: Contract-First

- **Enforcement**: `packages/contracts` exports registries
- **Check**: TypeScript compile-time check (command/event names must exist in registry)

### 3. IDs-Only Event Payload Policy

- **Enforcement**: Event payload types in `packages/contracts` only contain IDs
- **Check**: TypeScript compile-time check (no score/email/role in event payload types)

### 4. Derived States Updated by Events Only

- **Enforcement**: Folder convention + ESLint rule
- **Check**: ESLint rule forbids importing derived state repositories in command handler folders

### 5. Authz Error Semantics

- **Enforcement**: Shared helpers in `packages/shared/authz`
- **Check**: Unit tests verify `forbidRole()` → 403, `failOwnership()` → 404

### 6. Audit Logging & Redaction

- **Enforcement**: Logger interface in `packages/infra` enforces redaction
- **Check**: Logger interface methods only accept IDs (no PII)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Implementation blueprint defined for MVP  
**Related Documents**: 
- `docs/implementation/repo-structure.md` (Detailed folder structure)
- `docs/implementation/service-boundaries.md` (Service ownership details)
- `docs/implementation/dev-workflow.md` (Development workflow)
