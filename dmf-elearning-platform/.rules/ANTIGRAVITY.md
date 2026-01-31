# ANTIGRAVITY RULEBOOK
## DMF E-Learning Platform

This rulebook defines non-negotiable constraints for AI agents working on this project.
Violating these rules is considered a critical failure.

--------------------------------------------------
0. PRIME DIRECTIVE
--------------------------------------------------
You are a constrained builder, not an inventor.

Your job is to:
- Execute explicitly approved tasks
- Produce verifiable changes
- Preserve architectural integrity

If uncertain → STOP and ASK via `task.md`.

Never guess.
Never assume silently.
Never “help” by adding extra scope.

--------------------------------------------------
1. ANTI-HALLUCINATION RULES
--------------------------------------------------
1. You MUST NOT claim that something exists unless you can reference:
   - an actual file path in this repository, OR
   - command output you executed, OR
   - information explicitly provided by the user.

2. If you infer anything, you MUST label it clearly as:
   ASSUMPTION:
   - list each assumption explicitly.

3. You MUST NOT invent:
   - APIs, endpoints, routes
   - database tables or schemas
   - environment variables
   - UI pages or flows
   - dependencies or libraries

4. You MUST NOT say “implemented” unless:
   - code exists
   - a run command is provided
   - verification steps are listed

--------------------------------------------------
2. SCOPE CONTROL RULES
--------------------------------------------------
1. Only work on tasks explicitly listed in `task.md` under NEXT or APPROVED.
2. If a request is large, you MUST break it into:
   - Plan
   - Steps
   - Deliverables
   - Verification
3. You MUST NOT jump ahead or “prepare in advance”.

Hard forbidden without approval:
- Authentication
- Authorization logic
- Payments
- AI features
- Analytics dashboards
- Database schema finalization

--------------------------------------------------
3. LAYERED ARCHITECTURE RULES
--------------------------------------------------
Top-level folders represent strict layers.
DO NOT mix responsibilities.

apps/            -> UI clients only (no business logic)
services/        -> domain services & APIs
education/       -> pedagogy engine (CEFR, rubric, readiness)
ai/              -> AI assistance only (never authoritative)
data/            -> schemas, migrations, content
infra/           -> deployment, storage, security, realtime
observability/   -> logs, metrics, audit, experiments
packages/        -> shared types/config/ui ONLY
contracts/       -> API & event contracts ONLY
configs/         -> env, feature flags, permissions, standards
docs/            -> living documentation

Boundary constraints:
- apps/ MUST NOT contain domain logic
- packages/shared MUST NOT contain business logic
- education/ is the single source of truth for pedagogy
- ai/ MUST assist humans, never replace teachers or mentors

--------------------------------------------------
4. NAMING & STRUCTURE RULES
--------------------------------------------------
- Folder names: kebab-case only
- Service names must map 1:1 to bounded contexts
- No new top-level folders without approval

--------------------------------------------------
5. DOCUMENTATION-FIRST RULES
--------------------------------------------------
Before implementing anything beyond scaffolding:
- Update docs/architecture
- Update docs/pedagogy if learning-related
- Create outlines before code

If documentation is missing → create placeholders first.

--------------------------------------------------
6. VERIFICATION RULES
--------------------------------------------------
Every change MUST include:
- What changed (files)
- Why it changed
- How to verify (commands + expected result)

If verification is not possible → DO NOT PROCEED.

--------------------------------------------------
7. GIT & CHANGE HYGIENE
--------------------------------------------------
- Small, atomic changes only
- Clear commit messages (feat, chore, docs, refactor, fix)
- Never commit secrets
- Only `.env.example` is allowed
- Always update `task.md` after changes

--------------------------------------------------
8. DEPENDENCY CONTROL
--------------------------------------------------
You MUST NOT add dependencies unless:
- The need is explicit
- Alternatives are insufficient
- Impact is documented

Every new dependency must be justified.

--------------------------------------------------
9. SECURITY & PERMISSIONS
--------------------------------------------------
- Respect role separation: learner, teacher, mentor, admin
- No shortcut permissions
- Any auth work requires a documented threat model

--------------------------------------------------
10. DATA & CONTENT RULES
--------------------------------------------------
- `data/content` is immutable source of truth
- Content structure: language → CEFR → unit/lesson
- No hardcoded lessons in code
- Schema changes require documentation updates

--------------------------------------------------
11. AI FEATURE CONSTRAINTS
--------------------------------------------------
- AI output must be explainable
- AI must include failure handling
- No auto-grading without rubric alignment
- Human override must always exist

--------------------------------------------------
12. UX & GAMIFICATION RULES
--------------------------------------------------
- Gamification allowed ONLY in motivation-progress
- Never gamify assessments or readiness checks
- Progress must reflect mastery, not activity
- Every UX flow must answer:
  “Why am I learning this?” and “What is my next action?”

--------------------------------------------------
13. OPERATING MODE
--------------------------------------------------
For every task:
1. Restate objective
2. Propose plan
3. List files to change
4. Execute
5. Provide verification
6. Update task.md

If blocked:
- Write BLOCKED section in task.md
- Explain what is missing
- Ask for minimal clarification

--------------------------------------------------
14. HARD BANS
--------------------------------------------------
- No auth without approval
- No random services
- No production AI without pedagogy + human workflow
- No architecture drift
- No silent assumptions

--------------------------------------------------
15. DEFINITION OF DONE (ARCHITECTURE PHASE)
--------------------------------------------------
Architecture phase is DONE only when:
- Folder structure matches blueprint
- contracts/ exists
- packages/shared exists
- docs/architecture core files exist
- task.md reflects current state
