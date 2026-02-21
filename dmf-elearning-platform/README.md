# DMF E-Learning Platform

**Enterprise-Grade Hybrid Learning System for German Language**

> **Current Status**: Active Development — Sprint S7 (Security & Cleanup)
> 
> `learning-service` deployed on Railway · `web-learner` deployed on Vercel  
> 73+ API endpoints · 90 React components · 183 backend tests · 63 frontend tests

## Architecture Overview

Monorepo powered by **pnpm workspaces + Turborepo**, following a **Domain-Driven, Layered Architecture**:

```
[ L2/L3: Apps ] -> [ L4: Services ] -> [ L5: Education / L6: AI ]
                                      \-> [ Data / Contracts ]
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TailwindCSS v4 + shadcn/ui |
| **Backend** | Express.js 5 + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 16 + Redis 7 |
| **Auth** | Supabase (email/password + Google OAuth) |
| **AI** | Claude API + Google Cloud TTS (planned) |
| **DevOps** | Docker Compose + GitHub Actions + Railway + Vercel |

### Directory Guide

| Directory | Purpose |
|-----------|---------|
| `apps/` | Frontend apps: `web-learner` (deployed), `web-teacher`, `web-admin`, `web-mentor`, `mobile` |
| `services/` | Backend services: `learning-service` (active monolith), event-driven service stubs |
| `education/` | Pedagogy Engine — CEFR, rubrics, readiness model (planned) |
| `ai/` | AI agents and models (planned) |
| `contracts/` | OpenAPI specs, Event definitions, JSON schemas — **system law** |
| `data/` | Migrations, seeds, content structures |
| `packages/` | Shared libraries: `@dmf/shared` (frozen types), `@dmf/infra`, `@dmf/testing`, etc. |
| `docs/` | Architecture, pedagogy, and product documentation |
| `configs/` | Shared configurations |
| `scripts/` | Build, seed, and utility scripts |

## Development Philosophy

1. **Education First**: Technology serves the pedagogy
2. **Contract-First**: Define schemas in `contracts/` before implementing code
3. **Strict Boundaries**: Services cannot import from Apps; Packages cannot import from Services
4. **No Hidden Logic**: All business rules must be explicit

## Quick Start

### Prerequisites

- **Node.js 22 LTS** (or Node 20 LTS — do **not** use Node 25+)
- **pnpm** (package manager)
- **Docker** (for PostgreSQL + Redis)
- **Python 3.11** (for node-gyp / better-sqlite3)

### Setup

```bash
# 1. Check environment
pnpm run doctor

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Generate Prisma client
pnpm --filter learning-service prisma:generate

# 5. Run database migrations
pnpm --filter learning-service prisma:migrate

# 6. Build all packages
pnpm build

# 7. Run tests
pnpm test

# 8. Start development server
pnpm dev
```

### Verification

```bash
# Full CI pipeline
pnpm lint && pnpm build && pnpm test

# Smoke tests
pnpm phase3:smoke:all    # Core learning loop
pnpm s1:auth-smoke       # Auth flow (requires Supabase)
pnpm m1:smoke            # Event bus + onboarding
pnpm m3:smoke            # Progress + mastery
```

### Troubleshooting

If `better-sqlite3` fails to build:
1. `brew install python@3.11`
2. `pnpm run setup:python`
3. `pnpm install`

If TypeScript `TS6305` errors:
```bash
pnpm -r clean && find . -name '*.tsbuildinfo' -delete && pnpm build
```

## AI Governance

> [!IMPORTANT]
> All AI agents **MUST** read and follow `.rules/ANTIGRAVITY.md`.
> - No hallucinations — do not assume files/APIs exist
> - Strict scoping — do not implement unrequested features
> - Layered integrity — respect architectural boundaries

## Roadmap

See [docs/MASTER-PLAN.md](docs/MASTER-PLAN.md) for the full product vision and [task.md](task.md) for the execution tracker.

**Current Sprint**: S7 — Security & Cleanup  
**Next**: S8 — OWASP & Database Hardening → M2 Content Pipeline
