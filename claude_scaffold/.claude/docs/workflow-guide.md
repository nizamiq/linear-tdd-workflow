# Workflow Guide

This guide describes the major phases and responsibilities of the agentic workflow defined for this project.  It summarizes how the system operates to assess, improve, and maintain code quality.

## Overview

The agentic workflow is composed of five agents—**AUDITOR**, **EXECUTOR**, **GUARDIAN**, **STRATEGIST**, and **SCHOLAR**—working together under the coordination of the **STRATEGIST**.  These agents follow a continuous loop that starts with assessment and ends with learning, enabling autonomous improvement of the codebase while maintaining strict control and traceability.

## Workflow Phases

### Assessment
The **AUDITOR** scans the repository to identify code quality issues, technical debt, and opportunities for improvement.  It uses linters, security scanners, and static analysis tools to produce actionable tasks in Linear.

### Prioritization
Human stakeholders (Tech Leads, Product, or Engineering Managers) triage the tasks created by the **AUDITOR**.  They assign severity, effort estimates, and labels such as `FIL-0`, `FIL-1`, `FIL-2`, or `FIL-3` to indicate the feature impact level and determine whether a change can be auto‑implemented or must be approved.

### Implementation
For `FIL-0` and `FIL-1` tasks (chore and low‑risk refactor), the **EXECUTOR** applies the approved Fix Packs, adhering to TDD gates and generating atomic commits.  For `FIL-2` and `FIL-3` tasks (medium or high impact), the **EXECUTOR** operates in Suggest Mode, drafting an RFC or failing tests and awaiting approval before proceeding.

### CI/CD & Guardian
All changes go through CI/CD pipelines.  The **GUARDIAN** monitors pipeline health, enforces quality gates, and attempts automatic remediation of failures.  It ensures that tests pass, coverage does not regress, security scans are clean, and the deployment is ready.

### Learning
The **SCHOLAR** analyzes recently completed tasks to identify patterns of success or failure.  It updates a catalog of patterns in `.claude/agents/scholar.md` and proposes improvements to the workflow.  This continuous learning process helps the system improve over time.

## Roles and Responsibilities

- **AUDITOR**: Performs continuous code quality assessment and task generation.
- **EXECUTOR**: Implements tasks safely with strict TDD and atomic commits.
- **GUARDIAN**: Monitors CI/CD pipelines and remediates failures.
- **STRATEGIST**: Coordinates all agents, manages progress, and reports to stakeholders.
- **SCHOLAR**: Learns from past fixes and optimizes agent performance.

Each agent has specific permissions and tool integrations as defined in their corresponding Markdown files under `.claude/agents/`.
