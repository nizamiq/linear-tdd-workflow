# GitHub Configuration

This directory contains configuration files used by GitHub.  It includes the following:

- **Actions workflows** (`workflows/`): CI/CD pipelines enforcing TDD, linting, type checking, security scans, mutation smoke, and policy checks.  See the PRD and `docs/AGENT_WORKFLOW.md` for the list of required checks and gates.
- **CODEOWNERS**: Specifies the required approvers for high‑impact changes (`FIL‑2` and `FIL‑3`), typically Tech Leads and Product owners.  Define your team’s ownership here to ensure feature approvals are enforced.
- **Pull request templates**: Provide a standard template for agent and human PRs, indicating the intent (`Fix Pack` vs `Feature`), linked Linear tasks, and evidence of the `[RED]`→`[GREEN]`→`[REFACTOR]` flow.

This repository provides only a scaffold.  Create the actual workflow YAML files and templates according to your team’s CI/CD tools and gating requirements.