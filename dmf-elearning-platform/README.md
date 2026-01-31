# DMF E-Learning Platform

**Enterprise-Grade Hybrid Learning System**

This repository contains the source code for the DMF E-Learning Platform. It is engineered with a strict layered architecture to support scalability, maintainability, and a clear separation between technical concerns and educational pedagogy.

> [!NOTE]
> **Current Status**: Architecture Hardening Phase Complete. No business logic or functional features are currently implemented.

## Architecture Overview

The project follows a **Domain-Driven, Layered Architecture**:

```
[ L2/L3: Apps ] -> [ L4: Services ] -> [ L5: Education / L6: AI ]
                                      \-> [ Data / Contracts ]
```

### Top-Level Directory Guide

*   **`apps/`**: User-facing applications (Next.js web clients, Mobile). **Strictly presentation logic.**
*   **`services/`**: Core backend microservices (NestJS). Handles business rules, API serving, and transaction management.
*   **`education/`**: The "Pedagogy Engine". Pure logic for curriculum, scoring rubrics, and educational standards (CEFR).
*   **`ai/`**: Intelligent agents and models. Provides probabilistic support (grading, recommendations) to the core services.
*   **`contracts/`**: **Critical**. Contains the "Law" of the system. OpenAPI specs, Event definitions, and shared data schemas.
*   **`data/`**: Migrations, Seeds, and Raw Content structures (e.g., German course content hierarchy).
*   **`infra/`**: Terraform/Kubernetes configurations.
*   **`observability/`**: Monitoring, logging, and audit configurations.
*   **`packages/`**: Shared stateless libraries (UI kit, Types, Utilities). **NO business logic allowed.**
*   **`docs/`**: Living documentation for Architecture, Product, and Pedagogy.

## Development Philosophy

1.  **Education First**: Technology serves the pedagogy. Changes to `education/` logic take precedence.
2.  **Contract-First**: Define API/Event contracts in `contracts/` before implementing code.
3.  **Strict Boundaries**: Services cannot import from Apps. Packages cannot import from Services.
4.  **No Hidden Logic**: All business rules must be explicit in `services/` or `education/`.

## AI Governance

> [!IMPORTANT]
> All AI agents working on this repository **MUST** read and follow the rules defined in [`.rules/ANTIGRAVITY.md`](.rules/ANTIGRAVITY.md).
>
> *   **No Hallucinations**: Do not assume existence of files or APIs not present in the repo.
> *   **Strict Scoping**: Do not implement features not explicitly requested.
> *   **Layered Integrity**: Respect the architectural boundaries defined in `docs/architecture/`.

## Getting Started

Currently, the repository is in an architectural skeleton state.

1.  **Explore**: Review `docs/architecture/` for detailed system design.
2.  **Structure**: Check `contracts/` and `packages/` to understand data flow standards.

## Local Dev Prereqs (macOS arm64)

- **Node.js**: use **Node 22 LTS** (preferred) or **Node 20 LTS**. **Do not use Node 25+** (native deps like `better-sqlite3` can fail to build).
- **Python for node-gyp**: prefer **Python 3.11** (Python 3.14 can break node-gyp with missing `distutils`).

### Quick Setup (One Command)

```bash
# 1. Check environment
pnpm run doctor

# 2. Setup Python for node-gyp (if needed)
pnpm run setup:python

# 3. Install dependencies
pnpm install

# 4. Build all packages
pnpm build

# 5. Run tests
pnpm test

# 6. Run E2E smoke tests (optional, requires services running)
pnpm e2e:smoke
```

### Troubleshooting

If `better-sqlite3` fails to build:

1. **Check Python version**: `python3 --version` (should be 3.11, not 3.14+)
2. **Install Python 3.11 via Homebrew**: `brew install python@3.11`
3. **Run setup script**: `pnpm run setup:python`
4. **Reinstall**: `pnpm install`

More details: see `docs/phase2/troubleshooting.md`.

#### TypeScript Build Errors (TS6305)

If you encounter `TS6305: Output file has not been built from source file` errors:

1. **Clean build artifacts**: `pnpm -r clean && pnpm build`
2. **Ensure build order**: Turbo should handle this automatically via `dependsOn: ["^build"]`
3. **Check project references**: Packages with `composite: true` must use `tsc -b` (not plain `tsc`)

If the error persists, run: `pnpm -r clean && find . -name '*.tsbuildinfo' -delete && pnpm build`

## Next Steps

*   [ ] Implement Shared Packages (Types, Configs).
*   [ ] Initialize API Gateway with minimal endpoints.
*   [ ] Scaffold Web Learner Application.
