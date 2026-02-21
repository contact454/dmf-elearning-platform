# AGENTS.md

This file defines how AI coding agents (Codex, Claude Code, etc.) must operate in this repository.

## 1) Mandatory First Read

Before any implementation:
1. Read `.rules/ANTIGRAVITY.md`.
2. Read `task.md` and only execute items in `NEXT` or `APPROVED`.
3. Scan the relevant `README.md` for the package or service you are editing.

If any instruction conflicts, follow this priority:
1. `task.md` explicit approved scope
2. `.rules/ANTIGRAVITY.md`
3. This `AGENTS.md`

## 2) Prime Behavior

- Be a constrained builder, not an inventor.
- No hallucinated files, APIs, schemas, routes, env vars, or dependencies.
- No silent assumptions. Mark uncertain points as `ASSUMPTION:` in your response.
- Do not expand scope without explicit approval.

## 3) Architecture Boundaries (Strict)

- `apps/`: UI and presentation only. No domain/business rules.
- `services/`: domain logic, workflows, APIs, transaction handling.
- `education/`: pedagogy logic and learning standards source of truth.
- `ai/`: assistive logic only, never authoritative grading or final decisions.
- `contracts/`: API/event/data contracts only.
- `packages/`: shared stateless libraries only (types, ui, config, helpers).
- `data/`: migrations, seeds, content structure.
- `infra/`, `observability/`, `docs/`, `configs/`: keep responsibilities separated.

Hard constraints:
- Do not add new top-level folders without approval.
- Do not place business logic in `apps/` or shared packages.
- Do not bypass contracts when changing API behavior.

## 4) Standard Execution Flow Per Task

1. Restate objective and scope.
2. Propose a short plan.
3. List files to change.
4. Implement minimal, targeted edits.
5. Run verification commands.
6. Report results (what changed, why, how verified).
7. Update `task.md` with progress or blocked status.

If blocked:
- Add a `BLOCKED` section in `task.md` with missing info and next required decision.

## 5) Build/Test/Lint Policy

Use `pnpm` commands from repository root.

Baseline checks:
- `pnpm build`
- `pnpm lint`
- `pnpm test`

When contracts/events are touched:
- `pnpm contract-lock:validate`

When possible, run targeted checks first (affected package/service), then broader checks if shared code changed.

## 6) Environment and Tooling Guardrails

- Preferred Node version: `22` (or `20`), do not use `25+`.
- Package manager: `pnpm@8.x`.
- For native dependency build issues, use Python `3.11` and `pnpm run setup:python`.
- Do not introduce new dependencies unless explicitly necessary and justified in the report.

## 7) Database and Schema Rules

- Never edit historical migrations in place.
- Create a new migration for schema changes.
- Validate migrations locally before declaring completion.
- Document schema-impacting changes in docs and task tracking.

## 8) Security and Secrets

- Never commit secrets or real credentials.
- Only `.env.example` may be committed for env templates.
- Do not expose private tokens or backend secrets in frontend code.
- Respect role boundaries (learner/teacher/mentor/admin) when changing access logic.

## 9) Definition of Done (Per Change)

A task is not done unless the final report includes:
1. Changed files list.
2. Why each change was needed.
3. Exact verification commands executed.
4. Actual verification outcome (pass/fail and blockers).
5. `task.md` update status.

## 10) Forbidden Without Explicit Approval

- Auth/authorization redesign.
- Payment-related work.
- Production AI behavior changes.
- Large architecture refactors.
- New service creation or cross-layer boundary violations.
