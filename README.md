# Linear TDD Workflow System

> **Enterprise-grade multi-agent AI framework for autonomous code quality management**

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](CHANGELOG.md)
[![TDD Compliant](https://img.shields.io/badge/TDD-Strict-brightgreen.svg)](docs/WORKFLOW-TDD-PROTOCOL.md)
[![Linear Integrated](https://img.shields.io/badge/Linear-Connected-blue.svg)](docs/INTEGRATION-LINEAR.md)
[![Clean Code](https://img.shields.io/badge/Clean%20Code-Enforced-green.svg)](docs/WORKFLOW-CLEAN-CODE-ASSESSMENT.md)
[![Agents](https://img.shields.io/badge/Agents-20_Specialized-gold.svg)](.claude/agents/CLAUDE.md)
[![Languages](https://img.shields.io/badge/Languages-JS%2FTS%2FPython-blue.svg)](docs/languages/)
[![Installation](https://img.shields.io/badge/Install-Drop--in-purple.svg)](#installation-strategy)
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

- [Installation Strategy](#-installation-strategy)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start-5-minutes)
- [How It Works](#-how-it-works)
- [Core Features](#-core-features)
- [Architecture Overview](#-architecture-overview)
- [Available Commands](#-available-commands)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Installation Strategy

The Linear TDD Workflow System is designed as a **drop-in enhancement** for any project:

1. **Clone alongside your projects** - Keep this repository next to your project(s)
2. **Copy into your project** - Simple manual copy of `.claude/` and `Makefile`
3. **Configure and use** - Set up your Linear API key and start using

### Directory Structure
```
~/code/                          # Your development directory
├── linear-tdd-workflow/         # This repository
│   ├── .claude/                 # Agent system source
│   ├── scripts/                 # System scripts
│   └── Makefile                 # Universal commands template
└── your-project/                # Your target project
    ├── .claude/                 # Copied agent system
    ├── package.json             # Your existing package.json
    ├── Makefile                 # Copied universal commands
    ├── .env                     # Your configuration
    └── CLAUDE.md                # Project instructions (auto-created)
```

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0+ or **Python** 3.10+
- **Git** with GitFlow extension
- **Linear.app** account with API access
- **GitHub** account with repository permissions
- **Make** (optional but recommended)
- **Docker** (optional, for containerized agents)

## 🚀 Quick Start (5 Minutes)

Get up and running with the Linear TDD Workflow System in your project:

### Simple Manual Setup

```bash
# 1. Clone this repository alongside your project
cd ~/code  # Or wherever you keep your projects
git clone https://github.com/your-org/linear-tdd-workflow.git

# 2. Navigate to your target project
cd your-existing-project

# 3. Copy the core components
cp -r ../linear-tdd-workflow/.claude .
cp ../linear-tdd-workflow/Makefile .

# 4. Create your environment configuration
cat > .env << EOF
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=a-coders
LINEAR_PROJECT_ID=ai-coding
GITHUB_TOKEN=your_github_token_here  # Optional
EOF

# 5. Install dependencies (if Node.js project)
npm install

# 6. Initialize the system
node .claude/setup.js

# 7. Run onboarding to detect project type and configure
make onboard

# 8. Run your first assessment
make assess
```

### For New Projects

```bash
# 1. Create your new project
mkdir my-new-project && cd my-new-project
npm init -y  # or: python -m venv venv (for Python)

# 2. Follow the same steps above from step 3
cp -r ../linear-tdd-workflow/.claude .
cp ../linear-tdd-workflow/Makefile .
# ... continue with setup
```

### What This Installs

- **`.claude/`** - The complete agent system and workflows
- **`Makefile`** - Universal commands that work for any language
- **`.env`** - Your configuration (Linear API keys, etc.)
- **Enhanced `package.json`** - Additional scripts for the workflow (if applicable)

## 🎯 How It Works

### Installation Process

When you install the Linear TDD Workflow System into a project:

1. **Detection Phase** - The installer detects your project type (JavaScript, TypeScript, Python, or polyglot)
2. **Backup Phase** - Existing files are backed up before modification
3. **Installation Phase** - The `.claude` directory and supporting files are installed
4. **Enhancement Phase** - Your `package.json` (or `pyproject.toml`) is enhanced with workflow scripts
5. **Integration Phase** - Makefile is added/updated with universal commands
6. **Validation Phase** - The system validates the installation and runs initial checks

### What Gets Installed

| Component | Purpose | Location |
|-----------|---------|----------|
| `.claude/` directory | Agent system, journeys, and core logic | Project root |
| `Makefile` | Universal command interface | Project root |
| `CLAUDE.md` | Instructions for Claude Code AI | Project root |
| Enhanced scripts | Workflow commands in package.json | Existing file |
| `.env` template | Configuration for Linear and GitHub | Project root |

### After Installation

Your project gains:
- **20 specialized AI agents** ready for autonomous operation
- **6 autonomous journeys** for complete workflows
- **Universal commands** that work regardless of language
- **TDD enforcement** with automatic validation
- **Linear.app integration** for task management

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

### Agent Invocation

```bash
# Standard invocation pattern (from your project)
npm run agent:invoke <AGENT>:<COMMAND> -- [parameters]

# Examples
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

## 💻 Available Commands

Once installed in your project, you have access to:

### Universal Commands (via Makefile)

```bash
# Core Journey Commands
make onboard      # Initialize new project with agents
make assess       # Run clean-code assessment
make fix TASK=xxx # Implement TDD fix pack
make recover      # CI break diagnosis and recovery
make learn        # Pattern mining and insights
make release      # UAT and production release

# Development Commands
make test         # Run tests with coverage
make lint         # Lint and format code
make build        # Build the project
make validate     # Run all quality gates

# Utility Commands
make status       # Show workflow and agent status
make monitor      # Start monitoring dashboard
make clean        # Clean generated files
```

### NPM Scripts (JavaScript/TypeScript projects)

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

# Agent Operations
npm run assess           # Run code assessment
npm run execute:fixpack  # Execute approved fixes
npm run linear:sync      # Sync with Linear

# Agent Management
npm run agents:init      # Initialize agent system
npm run agents:status    # Check agent status
```

### Python Projects

For Python projects, the system adapts commands:

```bash
# Using Make (universal)
make test         # Runs pytest with coverage
make lint         # Runs pylint/black/ruff
make assess       # Same assessment, Python-aware

# Using Poetry (if detected)
poetry run pytest --cov
poetry run black .
poetry run ruff check .
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project with these required settings:

```bash
# Linear.app (Required)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=a-coders
LINEAR_PROJECT_ID=ai-coding

# GitHub (Required for PR creation)
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

# Project Type (Auto-detected, can override)
PROJECT_TYPE=javascript  # or: typescript, python, polyglot
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

### For Claude Code AI Navigation

**Critical References for AI Agents:**
- [Agent System Reference](.claude/agents/CLAUDE.md) - Complete agent specifications and MCP tool matrix
- [Agent Selection Guide](.claude/agents/AGENT-SELECTION-GUIDE.md) - Decision trees for choosing the right agent
- [Linear Operations Guide](.claude/agents/LINEAR-OPERATIONS-GUIDE.md) - Who manages Linear tasks
- [Project Instructions](CLAUDE.md) - Essential commands and workflows

### Essential Guides
- [Getting Started](docs/getting-started/README.md) - Complete setup guide
- [Installation Guide](docs/INSTALLATION-TROUBLESHOOTING.md) - Detailed installation help
- [AI Development Protocol](docs/ai-development-protocol.md) - TDD methodology
- [Linear Integration](docs/linear-setup.md) - Task management setup

### Core Documentation
- [TDD Protocol](docs/WORKFLOW-TDD-PROTOCOL.md) - Test-Driven Development requirements
- [Clean Code Assessment](docs/WORKFLOW-CLEAN-CODE-ASSESSMENT.md) - Quality standards
- [GitFlow Integration](docs/INTEGRATION-GITFLOW.md) - Branching strategy
- [Architecture Guide](docs/ARCHITECTURE-AGENTS.md) - System architecture

### References
- [API Documentation](docs/api-reference/) - Complete API specs
- [Documentation Index](docs/REFERENCE-MASTER.md) - Complete documentation map
- [FAQ](docs/reference/faq.md) - Frequently asked questions
- [Full Specifications](docs/PRD.md) - Detailed PRD v1.3

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>Installation fails with "Node.js version too old"</strong></summary>

- Ensure Node.js 18.0+ is installed: `node --version`
- Update Node.js: `nvm install 18` or download from nodejs.org
- Re-run the installer after updating
</details>

<details>
<summary><strong>.claude directory already exists</strong></summary>

- If it's from a previous installation, the installer will update it
- If it's a different system, back it up first: `mv .claude .claude.backup`
- Re-run the installer
</details>

<details>
<summary><strong>Assessment taking longer than expected</strong></summary>

- Check repository size (should be <200k LOC)
- Verify incremental scanning is enabled
- Review `npm run agents:status` output
</details>

<details>
<summary><strong>Linear tasks not being created</strong></summary>

- Verify LINEAR_API_KEY is correct in `.env`
- Check team/project IDs match your workspace
- Test with: `node .claude/cli.js linear test`
</details>

<details>
<summary><strong>Tests failing with coverage errors</strong></summary>

- Run `npm test:unit` to isolate unit tests
- Check diff coverage with `npm run coverage:diff`
- Ensure test files match `*.spec.ts` or `*.test.js` pattern
</details>

<details>
<summary><strong>Agent invocation errors</strong></summary>

- Verify agent name is uppercase (e.g., AUDITOR)
- Check command exists in `.claude/agents/<agent>.md`
- Review logs in `logs/agent-operations.log`
</details>

<details>
<summary><strong>Make commands not working</strong></summary>

- Ensure Makefile was installed: `ls -la Makefile`
- If missing, copy from workflow system: `cp ../linear-tdd-workflow/Makefile .`
- Alternative: use npm scripts instead
</details>

For more issues, see the [complete troubleshooting guide](docs/reference/troubleshooting.md).

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