<!--
This document defines the shared workflow specification for the Agentic AI Coding Assistant.  Agents rely on this file for consistent behavior across repositories.  Keep it up to date with the system’s PRD and policies.
-->

# Agent Workflow Specification

This file serves as the single source of truth for how agents should operate on this codebase.  It is version‑controlled and machine‑readable.  Agents must load and adhere to the rules in this document before performing any actions.

## 1. Repository Metadata

- **Supported languages:** JavaScript/TypeScript, Python
- **Test frameworks:**
  - JS/TS: Vitest/Jest (unit), Playwright (E2E)
  - Python: pytest (unit/integration)
- **Linting/formatting:**
  - JS/TS: ESLint (with @typescript-eslint), Prettier
  - Python: Ruff (lint + isort), Black
- **Type checking:**
  - JS/TS: `tsc --noEmit`
  - Python: mypy (strict on changed files)
- **Security scanning:** CodeQL + Semgrep + OSV

## 2. Guardrails

The following constraints apply to all agent actions:

1. **PR‑only writes.**  Agents must never merge code directly into the default branch.
2. **TDD enforcement.**  Every change must follow the `[RED]` → `[GREEN]` → `[REFACTOR]` pattern.  Diff coverage must be ≥ 80% and mutation smoke tests (StrykerJS/mutmut) must pass on changed files.
3. **Fix Packs only.**  Agents may implement only pre‑approved refactors and chore work (lint/format, unused imports, docstrings, test scaffolding, minor/patch dependency upgrades) without authorization.  All other work must be proposed via Linear and approved before implementation.
4. **Feature Impact Level (FIL) classification.**  The agent must classify each change as FIL‑0 (chore), FIL‑1 (low‑risk refactor), FIL‑2 (medium‑impact), or FIL‑3 (high‑impact/feature) based on the PRD.  FIL‑2 and FIL‑3 work require `FEAT‑APPROVED` from designated code owners and cannot be executed by the agent without approval.
5. **Rollback strategy.**  For every PR, the agent must include a rollback plan describing how to revert or mitigate the change if it causes issues after merge.

## 3. Agent Roles & Responsibilities

### AUDITOR
- **Goal:** Assess codebases and produce actionable findings.
- **Actions:** Scan code, compute metrics, classify issues by category, create Linear tasks with severity and effort estimates.

### EXECUTOR
- **Goal:** Implement approved improvements in a safe, atomic manner.
- **Actions:** Apply codemods, generate/modify tests, run local test suites, create PRs; respect Fix Packs and FIL rules; never merge.

### GUARDIAN
- **Goal:** Maintain a healthy pipeline by monitoring CI status and remediating failures.
- **Actions:** Detect failing tests or linting issues, attempt up to 3 automated fixes, and revert if unsuccessful; notify humans on escalation.

### STRATEGIST
- **Goal:** Orchestrate tasks and coordinate multiple agents.
- **Actions:** Schedule work, resolve dependencies, rebase branches, enforce concurrency limits.

### SCHOLAR
- **Goal:** Learn from past actions and improve system efficiency.
- **Actions:** Analyze successful fixes to extract patterns, update this workflow, and train models.

## 4. Workflow Steps

1. **Assessment**
   - Trigger: Cron schedule or on‑demand.
   - AUDITOR scans the codebase, identifies issues, and populates the Linear backlog.
2. **Prioritization**
   - Human stakeholders triage the backlog, labeling tasks as FIL‑0/1/2/3 and assigning priorities.
3. **Implementation**
   - For FIL‑0/1 tasks: EXECUTOR applies Fix Packs, following TDD gates.
   - For FIL‑2/3 tasks: EXECUTOR switches to Suggest Mode, generating an RFC and/or failing (skipped) tests.  Implementation begins only when `FEAT‑APPROVED` is present.
4. **CI/CD & Guardian**
   - On PR creation, CI enforces lint/type checks, diff coverage, mutation smoke, security scans, and branch protection.
   - GUARDIAN monitors pipeline status and attempts auto‑remediation on failures.
5. **Learning**
   - SCHOLAR runs weekly to extract patterns from merged PRs and update the pattern catalog.

## 5. Change Control & Approvals

| FIL Level | Description | Actions Allowed | Requires `FEAT‑APPROVED` |
| --- | --- | --- | --- |
| **FIL‑0** | Chore work (formatting, linting, docstrings, comments) | Auto‑apply | No |
| **FIL‑1** | Low‑risk refactor/test (pure functions, unused code removal, non‑breaking patch upgrades) | Auto‑apply (Fix Packs) | No |
| **FIL‑2** | Medium‑impact changes (performance tweaks, behavior changes behind existing interfaces) | Suggest Mode → needs approval | Yes |
| **FIL‑3** | High‑impact/feature (new APIs/routes, DB migrations, new env/config, major/minor dependency upgrades) | Suggest Mode → needs approval | Yes |

## 6. Extend & Customize

Projects can extend this workflow by adding custom Fix Packs, additional agents, or alternative CI tools.  All changes to this file must be reviewed by Security, Product, and Platform leads.