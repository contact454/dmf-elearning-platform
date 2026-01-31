# DMF E-Learning Platform — AI Rules

This directory defines mandatory governance rules for AI agents (Antigravity) working on this repository.

Purpose:
- Prevent AI hallucination and false assumptions
- Prevent scope creep and premature implementation
- Enforce layered architecture and education-first design
- Ensure all changes are verifiable, auditable, and intentional

All AI agents MUST:
- Read `.rules/ANTIGRAVITY.md` before doing any task
- Follow these rules strictly
- Stop and ask for clarification if any instruction conflicts with these rules

If a task violates or bypasses these rules, the agent must:
- Stop execution
- Document the issue in `task.md`
- Request explicit user approval before proceeding
