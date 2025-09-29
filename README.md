# Project Title

[![Build Status](https://travis-ci.org/user/repo.svg?branch=main)](https://travis-ci.org/user/repo)
[![Coverage Status](https://coveralls.io/repos/github/user/repo/badge.svg?branch=main)](https://coveralls.io/github/user/repo?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Linear TDD Workflow System

> **Enterprise-grade multi-agent AI framework for autonomous code quality management**

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](CHANGELOG.md)
[![TDD Compliant](https://img.shields.io/badge/TDD-Strict-brightgreen.svg)](docs/WORKFLOW-TDD-PROTOCOL.md)
[![Linear Integrated](https://img.shields.io/badge/Linear-Connected-blue.svg)](docs/INTEGRATION-LINEAR.md)
[![Clean Code](https://img.shields.io/badge/Clean%20Code-Enforced-green.svg)](docs/WORKFLOW-CLEAN-CODE-ASSESSMENT.md)
[![Agents](https://img.shields.io/badge/Agents-20_Specialized-gold.svg)](.claude/agents/CLAUDE.md)
[![Languages](https://img.shields.io/badge/Languages-JS%2FTS%2FPython-blue.svg)](docs/languages/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

*Last Updated: January 2025 | Version: 1.3.0*

## What is Linear TDD Workflow System?

An autonomous code quality management system that uses 20 specialized AI agents to continuously assess, improve, and maintain your codebase. The system enforces strict Test-Driven Development practices with **real coverage validation** and **production-ready deployment pipelines**.

### Key Benefits
- **50% faster** Mean Time to Recovery (MTTR)
- **30-35% improvement** in PR cycle time
- **≥80% diff coverage** enforcement on all changes
- **Real-time Linear.app integration** via authenticated MCP server
- **Production CI/CD pipeline** with blue-green deployment
- **Multi-language support** (JavaScript/TypeScript + Python)
- **Memory-safe operation** (4-6MB peak usage)
- **Self-improvement capabilities** through automated assessment

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start-5-minutes)
- [Core Features](#-core-features)
- [Architecture Overview](#-architecture-overview)
- [Available Commands](#-available-commands)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0+ or **Python** 3.10+
- **Git** with GitFlow extension
- **Linear.app** account with API access
- **GitHub** account with repository permissions
- **Docker** (optional, for containerized agents)

## 🚀 Quick Start (5 Minutes)

Get up and running with the Linear TDD Workflow System using our autonomous journey system:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/linear-tdd-workflow.git
cd linear-tdd-workflow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Linear API key and settings:
# LINEAR_API_KEY=your_key_here
# LINEAR_TEAM_ID=a-coders
# LINEAR_PROJECT_ID=ai-coding

# 4. Run automatic onboarding journey (JR-1)
make onboard
# OR using the journey system directly:
# node .claude/journeys/jr1-onboarding.js

# 5. Run your first assessment (JR-2)
make assess
# This runs the autonomous assessment journey

# 6. Check Linear for automatically created tasks
```

**Next Steps:** View the [Getting Started Guide](docs/getting-started/README.md) for detailed setup instructions.

## 🎯 Core Features

### Test-Driven Development Enforcement

Every change follows the mandatory TDD cycle:

1. **[RED]** - Write a failing test first
2. **[GREEN]** - Write minimal code to pass
3. **[REFACTOR]** - Improve with test safety

**Quality Gates:**
- Diff coverage ≥80% on changed lines
- Mutation testing ≥30% on changed files
- CI automatically blocks non-compliant PRs

### Fix Pack System

Pre-approved, low-risk improvements that agents implement autonomously:

| Fix Type | Description | Example |
|----------|-------------|---------|
| **Linting** | Auto-fix style violations | ESLint, Prettier, Black |
| **Dead Code** | Remove unused code | Unused imports, variables |
| **Documentation** | Add missing docs | JSDoc, docstrings |
| **Refactoring** | Simplify code | Extract constants, rename |
| **Dependencies** | Update packages | Non-breaking patches |
| **Tests** | Add test scaffolds | Basic test structure |

**Constraints:** Max 300 LOC per PR • 80% coverage required • Full rollback plan

### Feature Impact Level (FIL) Classification

| Level | Impact | Examples | Approval |
|-------|--------|----------|----------|
| **FIL-0** | None | Formatting, comments | Auto |
| **FIL-1** | Low | Variable rename, constants | Auto |
| **FIL-2** | Medium | New utilities, configs | Tech Lead |
| **FIL-3** | High | APIs, migrations, UI | Tech Lead + Product |

## 🏗️ Architecture Overview

### 20-Agent System

The system coordinates 20 specialized agents through Linear.app:

```
Linear.app (Task Management)
         ↓
    STRATEGIST
   (Orchestrator)
         ↓
┌────────────┬─────────────┬──────────────┬────────────┐
│  AUDITOR   │  EXECUTOR   │   GUARDIAN   │  SCHOLAR   │
│(Assessment)│(Fix Impl.)  │(CI/CD Guard) │(Learning)  │
└────────────┴─────────────┴──────────────┴────────────┘
                    ↓
        [15 Specialized Support Agents]
```

**Core Agents:**
- **AUDITOR** - Continuous code quality assessment
- **EXECUTOR** - Fix Pack implementation engine
- **GUARDIAN** - Pipeline monitoring & recovery
- **STRATEGIST** - Multi-agent orchestration
- **SCHOLAR** - Pattern learning & optimization

**Specialized Agents:** Testing (3) • Development (3) • Infrastructure (3) • Architecture (3) • Security (3)

<!-- UPDATED: Simplified architecture visualization -->

### Agent Invocation

```bash
# Standard invocation pattern
npm run agent:invoke <AGENT>:<COMMAND> -- [parameters]

# Examples
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

## 💻 Available Commands

### Development Commands

```bash
# Testing
npm test                  # Run all tests with coverage
npm test:watch           # Watch mode for TDD
npm test:unit            # Unit tests only
npm test -- path/to/test.spec.ts  # Run specific test

# Code Quality
npm run lint             # Lint and auto-fix
npm run format           # Format code (Prettier)
npm run typecheck        # TypeScript checking
npm run precommit        # Run all checks before commit

# Building
npm run build            # Compile TypeScript
```

### Agent Operations

```bash
# Core Operations
npm run assess           # Run code assessment
npm run execute:fixpack  # Execute approved fixes
npm run linear:sync      # Sync with Linear

# Agent Management
npm run agents:init      # Initialize agent system
npm run agents:status    # Check agent status

# Monitoring
npm run monitor:pipeline # Monitor CI/CD pipeline
npm run monitor:budget   # Check budget usage
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with these required settings:

```bash
# Linear.app (Required)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=a-coders
LINEAR_PROJECT_ID=ai-coding

# GitHub (Required)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_ORG=your-organization

# Agent Settings (Optional - defaults shown)
ENABLE_AUTO_FIX=true
MAX_FIX_PACK_SIZE=300
MIN_DIFF_COVERAGE=80
MIN_MUTATION_SCORE=30

# Resource Limits (Optional)
MAX_CONCURRENT_REPOS=3
MONTHLY_BUDGET_LIMIT=10000
```

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Code Assessment | ≤12min | 150k LOC JS/TS |
| Python Assessment | ≤15min | 150k LOC |
| Fix Implementation | ≤15min | Average |
| Pipeline Recovery | ≤10min | Auto-recovery |
| Linear Sync | ≤2s | Update latency |

## 📚 Documentation

### Essential Guides
- [Getting Started](docs/getting-started/README.md) - Complete setup guide
- [Agent System Overview](.claude/agents/CLAUDE.md) - All 20 agents detailed
- [AI Development Protocol](docs/ai-development-protocol.md) - TDD methodology
- [Linear Integration](docs/linear-setup.md) - Task management setup

### References
- [API Documentation](docs/api-reference/) - Complete API specs
- [Troubleshooting Guide](docs/reference/troubleshooting.md) - Common issues
- [FAQ](docs/reference/faq.md) - Frequently asked questions
- [Full Documentation Index](docs/REFERENCE-MASTER.md) - All documentation

### Specifications
- [Product Requirements](docs/PRD.md) - Detailed PRD v1.3
- [Architecture Docs](docs/architecture/) - System design
- [Workflow Specs](.claude/docs/AGENT_WORKFLOW.md) - Agent workflows

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>Assessment taking longer than expected</strong></summary>

- Check repository size (should be <200k LOC)
- Verify incremental scanning is enabled
- Review `npm run agents:status` output
</details>

<details>
<summary><strong>Linear tasks not being created</strong></summary>

- Verify LINEAR_API_KEY is correct
- Check team/project IDs match your workspace
- Ensure Linear webhook is configured
</details>

<details>
<summary><strong>Tests failing with coverage errors</strong></summary>

- Run `npm test:unit` to isolate unit tests
- Check diff coverage with `npm run coverage:diff`
- Ensure test files match `*.spec.ts` pattern
</details>

<details>
<summary><strong>Agent invocation errors</strong></summary>

- Verify agent name is uppercase (e.g., AUDITOR)
- Check command exists in `.claude/agents/<agent>.md`
- Review logs in `logs/agent-operations.log`
</details>

For more issues, see the [complete troubleshooting guide](docs/reference/troubleshooting.md).

## 📚 Documentation

### For Claude Code AI Navigation

**Critical References for AI Agents:**
- [Agent System Reference](.claude/agents/CLAUDE.md) - Complete agent specifications and MCP tool matrix
- [Agent Selection Guide](.claude/agents/AGENT-SELECTION-GUIDE.md) - Decision trees for choosing the right agent
- [Linear Operations Guide](.claude/agents/LINEAR-OPERATIONS-GUIDE.md) - Who manages Linear tasks
- [Project Instructions](CLAUDE.md) - Essential commands and workflows

**Core Documentation:**
- [TDD Protocol](docs/WORKFLOW-TDD-PROTOCOL.md) - Test-Driven Development requirements
- [Clean Code Assessment](docs/WORKFLOW-CLEAN-CODE-ASSESSMENT.md) - Quality standards
- [Linear Integration](docs/INTEGRATION-LINEAR.md) - Task management setup
- [GitFlow Integration](docs/INTEGRATION-GITFLOW.md) - Branching strategy

**Reference Guides:**
- [Documentation Index](docs/REFERENCE-MASTER.md) - Complete documentation map
- [Reference Master](docs/REFERENCE-MASTER.md) - Comprehensive reference
- [Architecture Guide](docs/ARCHITECTURE-AGENTS.md) - System architecture

**Recent Updates:**
- [Agent Optimization Report](docs/AGENT-OPTIMIZATION-REPORT.md) - Latest agent improvements
- [Consolidation Summary](docs/CONSOLIDATION-SUMMARY.md) - Documentation consolidation

## 🤝 Contributing

We follow strict TDD practices. All contributions must:

1. **Start with a failing test** (RED phase)
2. **Implement minimal code** to pass (GREEN phase)
3. **Refactor** with test coverage (REFACTOR phase)
4. **Maintain 80% diff coverage** on changes
5. **Pass all quality gates** before merge

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature develop

# 2. Write failing test first
npm test:watch

# 3. Implement feature with TDD
# ... code ...

# 4. Run pre-commit checks
npm run precommit

# 5. Push and create PR
git push origin feature/your-feature
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with [Claude Code AI](https://claude.ai/code) and integrated with [Linear.app](https://linear.app) for maximum development efficiency. Special thanks to the [Model Context Protocol](https://modelcontextprotocol.org) community for enabling advanced tool integrations.

---

<p align="center">
  <strong>Questions?</strong> Check the <a href="docs/reference/faq.md">FAQ</a> •
  <strong>Issues?</strong> See <a href="docs/reference/troubleshooting.md">Troubleshooting</a> •
  <strong>Updates?</strong> View <a href="CHANGELOG.md">Changelog</a>
</p>