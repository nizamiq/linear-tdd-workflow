# Agentic AI Coding Agent

This repository provides a starting point for building an autonomous coding assistant system as outlined in the *Agentic AI Coding Agent PRD*.  It is designed to support **JavaScript/TypeScript** and **Python** codebases and enforces strict test‑driven development (TDD) policies with robust guardrails.

## Repository Structure

The project is organized into the following top‑level directories:

- **`agents/`** – Contains implementations of the individual agents:
  - `auditor/`
  - `executor/`
  - `guardian/`
  - `strategist/`
  - `scholar/`
- **`core/`** – Shared framework code and base classes for building agents and orchestrating tasks.
- **`integrations/`** – Connectors for third‑party services such as GitHub, Linear, and MCP tools.
- **`api/`** – REST/GraphQL endpoints for interacting with the system.
- **`dashboard/`** – Web user interface components and monitoring dashboards.
- **`docs/`** – Documentation files including the PRDs, RFC templates, and the `AGENT_WORKFLOW.md` specification.
- **`tests/`** – Test suites for JS/TS and Python components.
- **`.github/`** – GitHub Actions workflows and PR templates for CI/CD and TDD enforcement.
- **`config/`** – Configuration files for the orchestrator, agent policies, and environment settings.

## Getting Started

> **Note:** This scaffold does not include runtime code; it serves as a skeleton for the architecture defined in the PRD.  Implementations of each agent and service should be added under their respective directories.

1. **Initialize your JS/TS environment** (if using Node):
   ```bash
   # Install Node dependencies
   npm install
   ```
2. **Initialize your Python environment** (requires Python ≥ 3.12):
   ```bash
   # Create and activate a virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install Python dependencies
   # pip install -r requirements.txt  # Create this file as needed
   ```
3. **Generate an assessment backlog** once the AUDITOR agent is implemented.  For example:
   ```bash
   # JS/TS (assuming an npm script called audit exists)
   npm run audit

   # Python auditor (assuming a CLI entry point)
   python -m agents.auditor
   ```
4. **Run tests** using your chosen frameworks:
   - For JS/TS code, use `npm test` or `pnpm test` (e.g., with Vitest or Jest).
   - For Python code, use `pytest` with coverage.

## Policies and Processes

This project enforces strict TDD policies and guardrails to ensure that autonomous agents cannot introduce unauthorized features or regressions.  See the **PRD** and **docs/AGENT_WORKFLOW.md** for details on the required gates (diff coverage ≥ 80%, mutation smoke tests, `[RED]`→`[GREEN]`→`[REFACTOR]` commit flow) and the **Feature‑Impact Level (FIL)** classification system for approvals.

For more information, refer to the documentation in the `docs/` directory.