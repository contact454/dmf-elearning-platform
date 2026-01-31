# Repository Structure (MVP)
## Cấu trúc Kho mã nguồn

This document lists all folders and their responsibilities in the DMF Hybrid Language Learning Platform monorepo.

---

## Root Structure

```
dmf-elearning-platform/
├── apps/                          # Frontend applications (out of scope for STEP 10)
├── services/                      # Microservices (7 services)
├── packages/                      # Shared packages
├── contracts/                     # Command/event schemas (JSON, frozen)
├── docs/                          # Documentation
│   ├── architecture/              # Architecture docs (STEP 4-9, frozen)
│   └── implementation/            # Implementation docs (STEP 10+)
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # pnpm workspace config
├── turbo.json                     # Turbo build config
└── tsconfig.json                  # Root TypeScript config
```

---

## packages/ Structure

### packages/shared

**Purpose**: Type definitions only (NO business logic)

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── ids.ts                 # Branded ID types (UserId, LessonId, etc.)
│   │   └── enums.ts                # Enums (SkillType, UserRole, etc.)
│   ├── value-objects/              # Value objects (if any)
│   └── authz/                      # Authz helpers (forbidRole, failOwnership)
├── package.json
└── tsconfig.json
```

**Responsibility**: 
- Define branded ID types
- Export enums from frozen docs
- Provide authz helper functions
- NO domain logic, NO service clients

### packages/contracts

**Purpose**: Command and event schemas (frozen from STEP 4.2, STEP 5C)

```
packages/contracts/
├── src/
│   ├── commands/
│   │   ├── learning.ts             # learning.* commands
│   │   ├── assessment.ts           # assessment.* commands
│   │   ├── mentoring.ts            # mentoring.* commands
│   │   ├── curriculum.ts           # curriculum.* commands
│   │   └── system.ts               # system.* commands
│   ├── events/
│   │   ├── learning.ts             # learning.* events
│   │   ├── assessment.ts           # assessment.* events
│   │   ├── mentoring.ts           # mentoring.* events
│   │   ├── curriculum.ts           # curriculum.* events
│   │   └── system.ts               # system.* events
│   ├── registries.ts               # commandRegistry, eventRegistry
│   └── index.ts                    # Public exports
├── package.json
└── tsconfig.json
```

**Responsibility**:
- Export TypeScript interfaces for all 15 commands
- Export TypeScript interfaces for all events
- Export Zod schemas for validation
- Export commandRegistry and eventRegistry
- Enforce contract-first approach (build fails if command/event not in registry)

### packages/infra

**Purpose**: Infrastructure ports (interfaces only, no implementations)

```
packages/infra/
├── src/
│   ├── event-bus.ts                # EventBus interface
│   ├── logger.ts                   # Logger interface (with PII redaction)
│   ├── database.ts                 # Database port interface
│   ├── http-client.ts              # HttpClient interface (for read-only service calls)
│   └── index.ts                    # Public exports
├── package.json
└── tsconfig.json
```

**Responsibility**:
- Define interfaces for event bus, logger, database, HTTP client
- NO concrete implementations (adapters in services)

### packages/testing

**Purpose**: Test utilities and contract test helpers

```
packages/testing/
├── src/
│   ├── contract-tests.ts           # Contract test utilities
│   ├── authz-helpers.ts            # Authz test helpers
│   ├── mocks/                      # Mock factories
│   └── index.ts                    # Public exports
├── package.json
└── tsconfig.json
```

**Responsibility**:
- Provide contract test utilities
- Provide test helpers for authz checks
- Provide mock factories for services

---

## services/ Structure

Each service follows this structure:

```
services/{service-name}/
├── src/
│   ├── index.ts                    # Bootstrap (HTTP server, event bus connection)
│   ├── http/                       # HTTP layer (Fastify)
│   │   ├── commands/               # Command endpoints (POST)
│   │   │   └── {command-name}.route.ts
│   │   ├── queries/                # Query endpoints (GET)
│   │   │   └── {query-name}.route.ts
│   │   └── middleware/             # Auth, validation, rate limiting
│   │       ├── auth.middleware.ts
│   │       ├── validation.middleware.ts
│   │       └── rate-limit.middleware.ts
│   ├── application/                # Command handlers (use cases)
│   │   └── {command-name}.handler.ts
│   ├── domain/                     # Domain entities (only for owned write states)
│   │   ├── entities/
│   │   │   └── {entity-name}.ts
│   │   └── value-objects/
│   ├── state/                      # Repositories for owned states
│   │   └── {entity-name}.repository.ts
│   ├── events/                     # Event emitters + consumers
│   │   ├── emitter.ts
│   │   └── consumers/
│   │       └── {event-name}.consumer.ts
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

### Folder Responsibilities

#### src/index.ts
- Bootstrap HTTP server (Fastify)
- Connect to event bus
- Register routes
- Start server

#### src/http/
- **commands/**: POST endpoints for commands
- **queries/**: GET endpoints for queries
- **middleware/**: Auth, validation, rate limiting

#### src/application/
- Command handlers (use cases)
- Business logic orchestration
- NO direct DB access (use repositories)

#### src/domain/
- Domain entities (only for owned write states)
- Value objects
- Domain invariants

#### src/state/
- Repository interfaces and implementations
- State persistence logic
- Only for owned states

#### src/events/
- **emitter.ts**: Event emission logic
- **consumers/**: Event consumer handlers (for derived states)

#### src/read/
- Read-only HTTP clients to other services
- NO direct DB access to foreign services

#### src/auth/
- Authorization checks (STEP 8B)
- `forbidRole()`, `failOwnership()` helpers

#### src/observability/
- Audit logging (STEP 9B)
- Metrics hooks (STEP 9A)

---

## Service-Specific Notes

### practice-service

- **Owns**: Attempt, Submission
- **Handles**: `learning.lesson.start`, `learning.lesson.complete`, `learning.lesson.abandon`, `learning.activity.submit`
- **Serves queries**: `/api/learner/lessons/:lessonId/attempts`, `/api/learner/attempts/:attemptId`, `/api/learner/submissions`, `/api/learner/submissions/:submissionId`, `/api/teacher/submissions/:submissionId`

### assessment-service

- **Owns**: Assessment
- **Handles**: `assessment.quiz.start`, `assessment.quiz.submit`, `assessment.placement.take`
- **Serves queries**: `/api/learner/readiness`

### mentoring-service

- **Owns**: Feedback, FeedbackRequest
- **Handles**: `mentoring.feedback.request`, `mentoring.feedback.publish`
- **Serves queries**: `/api/teacher/feedback-queue`, `/api/teacher/feedback-requests/:feedbackRequestId`

### curriculum-service

- **Owns**: Enrollment, Course, Unit, Lesson, SRSItem
- **Handles**: `curriculum.course.enroll`, `system.srs.schedule`
- **Serves queries**: None (read-only API for other services)

### progress-service

- **Owns**: ProgressState (derived)
- **Handles**: None (event consumer only)
- **Serves queries**: `/api/learner/dashboard`, `/api/learner/courses/:courseId/progress`

### motivation-progress-service

- **Owns**: MasteryState, SkillScore (derived)
- **Handles**: None (event consumer only)
- **Serves queries**: `/api/learner/mastery`

### onboarding-service

- **Owns**: User, LearnerProfile, Session
- **Handles**: `system.user.register`, `system.user.login`, `system.profile.modify`
- **Serves queries**: `/api/teacher/learners/:userId/summary` (composes from multiple services)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - Repository structure documented
