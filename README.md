# Linear TDD Workflow System

> **Enterprise-grade multi-agent AI framework for autonomous code quality management**

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](CHANGELOG.md)
[![TDD Compliant](https://img.shields.io/badge/TDD-Strict-brightgreen.svg)](docs/WORKFLOW-TDD-PROTOCOL.md)
[![Linear Integrated](https://img.shields.io/badge/Linear-Connected-blue.svg)](docs/INTEGRATION-LINEAR.md)
[![Clean Code](https://img.shields.io/badge/Clean%20Code-Enforced-green.svg)](docs/WORKFLOW-CLEAN-CODE-ASSESSMENT.md)
[![Agents](https://img.shields.io/badge/Agents-23_Specialized-gold.svg)](.claude/agents/CLAUDE.md)
[![Languages](https://img.shields.io/badge/Languages-JS%2FTS%2FPython-blue.svg)](docs/languages/)
[![Installation](https://img.shields.io/badge/Install-Drop--in-purple.svg)](#installation-strategy)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

*Last Updated: January 2025 | Version: 1.3.0*

## What is Linear TDD Workflow System?

An autonomous code quality management system that uses 23 specialized AI agents to continuously assess, improve, and maintain your codebase. The system enforces strict Test-Driven Development practices with **real coverage validation** and **production-ready deployment pipelines**.

## ⚠️ Non-Negotiable: Test-Driven Development

**Every code change follows strict TDD. This is not optional.**

```
[RED] → [GREEN] → [REFACTOR]
  ↓         ↓           ↓
Test    Minimal    Improve
First     Code     Design
```

**The EXECUTOR agent enforces TDD automatically through the `/fix` command.**

### Quality Gates (Blocking)
- **≥80% diff coverage** - Every changed line must be tested
- **≥30% mutation score** - Tests must validate actual behavior
- **NO production code without failing test first** - Zero exceptions

### Why This Matters
1. **Tests as Documentation** - Your tests explain what code should do
2. **Confidence to Change** - Refactor fearlessly with test safety net
3. **Better Design** - TDD forces testable, loosely-coupled code
4. **Automatic Coverage** - TDD gives you ≥80% coverage for free

### TDD Cycle Example
```javascript
// [RED] Write failing test FIRST
test('calculates tax for high income', () => {
  expect(calculateTax(100000)).toBe(25000);
});
// ❌ FAILS - calculateTax doesn't exist yet

// [GREEN] Minimal code to pass
function calculateTax(income) {
  return income * 0.25;
}
// ✅ PASSES

// [REFACTOR] Improve design
const TAX_RATE = 0.25;
function calculateTax(income) {
  validateIncome(income);
  return income * TAX_RATE;
}
// ✅ STILL PASSES - refactored safely
```

**Learn more:** `.claude/docs/TDD-REMINDER.md` - Quick reference card for TDD requirements

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

The Linear TDD Workflow System is designed as a **self-contained drop-in enhancement** for both new and existing projects:

1. **Clone alongside your target projects** - Keep this repository in your parent development directory
2. **Install into target project** - The system copies all components into the target project's `.claude/` directory
3. **Self-contained operation** - Everything runs from within the target project's `.claude/` directory
4. **Configure and use** - Set up your Linear API key and start using

### Key Design Principles

- **Self-contained**: All system components live in `.claude/` directory
- **Non-invasive**: Minimal changes to existing project structure
- **Universal**: Works for new projects or existing codebases
- **Language-agnostic**: Supports JavaScript/TypeScript, Python, and polyglot projects

### Directory Structure After Installation
```
~/code/                                    # Your development directory
├── linear-tdd-workflow/                   # This repository (source)
│   ├── .claude/                           # Agent system templates
│   ├── scripts/install.sh                 # Installation script
│   ├── Makefile                           # Universal commands template
│   └── README.md                          # This file
│
└── your-target-project/                   # Your project (new or existing)
    ├── .claude/                           # Self-contained system (installed)
    │   ├── agents/                        # 23 agent specifications
    │   ├── commands/                      # Slash command definitions
    │   ├── docs/                          # System documentation
    │   ├── scripts/                       # Operational scripts
    │   ├── workflows/                     # Workflow definitions
    │   ├── mcp.json                       # MCP server configuration
    │   ├── setup.js                       # System initialization
    │   ├── cli.js                         # CLI interface
    │   └── DISCOVERY.md                   # System discovery guide
    │
    ├── package.json                       # Your project file (optional enhancement)
    ├── Makefile                           # Copied universal commands
    ├── CLAUDE.md                          # Project instructions (auto-created)
    ├── .env                               # Your configuration
    └── [your existing project files]     # Untouched
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

### Installation for Existing Projects

```bash
# 1. Clone this repository in your development directory
cd ~/code  # Or wherever you keep your projects
git clone https://github.com/your-org/linear-tdd-workflow.git

# 2. Navigate to your existing target project
cd ../your-existing-project

# 3. Install the system (self-contained in .claude/)
cp -r ../linear-tdd-workflow/.claude .
cp ../linear-tdd-workflow/Makefile .

# 4. Create environment configuration
cat > .env << EOF
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=your-team-id
LINEAR_PROJECT_ID=your-project-id  # Optional
GITHUB_TOKEN=your_github_token     # Optional for PR creation
EOF

# 5. Initialize the system (detects project type)
node .claude/setup.js

# 6. Run onboarding (configures for your tech stack)
make onboard

# 7. Run your first assessment
make assess
```

### Installation for New Projects

```bash
# 1. Create your new project directory
mkdir my-new-project && cd my-new-project

# 2. Initialize project (choose one)
npm init -y              # For Node.js/JavaScript
npm init -y && npx tsc --init  # For TypeScript
python -m venv venv      # For Python

# 3. Install the workflow system
cp -r ../linear-tdd-workflow/.claude .
cp ../linear-tdd-workflow/Makefile .

# 4. Configure environment (create .env as shown above)

# 5. Initialize and onboard
node .claude/setup.js
make onboard

# 6. Start developing with TDD
make assess
```

### What This Installs

The system is **completely self-contained** in the `.claude/` directory:

- **`.claude/agents/`** - 23 specialized agent specifications
- **`.claude/commands/`** - Slash command definitions
- **`.claude/docs/`** - Complete system documentation
- **`.claude/scripts/`** - Operational automation scripts
- **`.claude/workflows/`** - Multi-phase workflow definitions
- **`.claude/mcp.json`** - MCP server configuration (Linear, etc.)
- **`.claude/cli.js`** - Command-line interface
- **`Makefile`** - Universal commands (language-agnostic)
- **`CLAUDE.md`** - Instructions for Claude Code AI (auto-created)

## 🎯 How It Works

### Installation Process

The installation is simple and self-contained:

1. **Copy Phase** - Copy `.claude/` directory and `Makefile` into your target project
2. **Detection Phase** - System detects project type (JavaScript/TypeScript/Python)
3. **Initialization Phase** - Run `node .claude/setup.js` to configure
4. **Onboarding Phase** - Run `make onboard` for tech-stack-specific setup
5. **Validation Phase** - System validates configuration and runs health checks

### Self-Contained Architecture

All system components live in `.claude/` directory:

| Component | Purpose | Location |
|-----------|---------|----------|
| `.claude/agents/` | 23 specialized agent specifications | Self-contained |
| `.claude/commands/` | Slash command definitions | Self-contained |
| `.claude/docs/` | System documentation | Self-contained |
| `.claude/scripts/` | Operational automation | Self-contained |
| `.claude/workflows/` | Multi-phase workflows | Self-contained |
| `.claude/mcp.json` | MCP server config (Linear, K8s, etc.) | Self-contained |
| `.claude/cli.js` | Command-line interface | Self-contained |
| `Makefile` | Universal command interface | Project root |
| `CLAUDE.md` | Instructions for Claude Code AI | Project root (auto-created) |
| `.env` | Your configuration (Linear API keys) | Project root (user-created) |

**Key Benefit**: The entire system can be installed, updated, or removed by simply managing the `.claude/` directory.

### After Installation

Your project gains autonomous capabilities:

- **23 specialized AI agents** operating from `.claude/agents/`
- **Multi-phase workflows** defined in `.claude/workflows/`
- **Universal commands** via `Makefile` (language-agnostic)
- **TDD enforcement** with automatic validation
- **Linear.app integration** via MCP server configuration
- **Slash commands** available in Claude Code (`/assess`, `/fix`, `/recover`, etc.)

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

### Self-Contained 23-Agent System

All agents operate from within your project's `.claude/agents/` directory:

```
Linear.app (Task Management)
         ↓
    STRATEGIST (Orchestrator)
         ↓
┌────────────┬─────────────┬──────────────┬────────────┬──────────────┐
│  AUDITOR   │  EXECUTOR   │   GUARDIAN   │  SCHOLAR   │   PLANNER    │
│(Assessment)│(Fix Impl.)  │(CI/CD Guard) │(Learning)  │(Cycle Plan)  │
└────────────┴─────────────┴──────────────┴────────────┴──────────────┘
                              ↓
              [18 Specialized Support Agents]
```

**Core Agents** (in `.claude/agents/`):
- **AUDITOR** - Code quality assessment (generates Linear task definitions)
- **EXECUTOR** - TDD fix implementation (strict RED→GREEN→REFACTOR)
- **GUARDIAN** - CI/CD monitoring & auto-recovery (reports incidents to STRATEGIST)
- **STRATEGIST** - Multi-agent orchestration & **EXCLUSIVE Linear MCP access**
- **SCHOLAR** - Pattern learning from successful PRs
- **PLANNER** - Sprint/cycle planning with parallel execution
- **DOC-KEEPER** - Documentation validation & generation (generates doc task definitions)

**Linear Integration Model:**
- **STRATEGIST** is the ONLY agent with `linear-server` MCP access
- **All other agents** delegate Linear operations through STRATEGIST
- AUDITOR/GUARDIAN/DOC-KEEPER provide task definitions → STRATEGIST creates issues
- This prevents permission conflicts and ensures consistent task management

**Specialized Agents:** Testing (3) • Development (3) • Infrastructure (3) • Database (1) • Documentation (1) • Security (1) • Legacy (1) • Review (2)

### Parallel Execution Support

The system supports **parallel subagent execution** for 5-10x speedup:

- **Max 10 concurrent subagents** via Claude Code Task tool
- **Phases 1 & 4 of cycle planning** run in parallel (40 min → 20 min)
- **Batch assessments** of multiple directories (30 min → 10 min)
- **Parallel fix implementation** of independent tasks (69 min → 18 min)

See `.claude/docs/PARALLEL-EXECUTION.md` for comprehensive guide.

### Agent Invocation Methods

**Via Slash Commands** (Recommended in Claude Code):
```bash
/assess              # AUDITOR - Code quality scan
/fix CLEAN-123       # EXECUTOR - Implement fix with TDD
/recover             # GUARDIAN - Auto-fix broken pipeline
/learn               # SCHOLAR - Mine patterns from PRs
/cycle plan          # PLANNER - Sprint planning (parallel phases)
/docs                # DOC-KEEPER - Validate documentation
```

**Via Makefile** (Universal):
```bash
make assess          # Invoke AUDITOR
make fix TASK=CLEAN-123  # Invoke EXECUTOR
make recover         # Invoke GUARDIAN
make learn           # Invoke SCHOLAR
make cycle:full      # Invoke PLANNER (all 4 phases)
```

**Via CLI** (Direct):
```bash
node .claude/cli.js assess --scope=full
node .claude/cli.js fix --task-id=CLEAN-123
node .claude/cli.js recover --auto-fix
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

## 🏢 Enterprise Features

**Phase 5: Production-Grade Automation** (✅ Complete)

The system includes enterprise features for production deployments and large teams:

### Hooks-Based Workflow Automation

Automated workflow chaining eliminates manual orchestration:

```bash
# Hooks automatically suggest next steps
User: "/assess"
AUDITOR completes → Hook suggests: "/fix CLEAN-123"

User: "/fix CLEAN-123"
EXECUTOR completes → Hook suggests: "/invoke CODE-REVIEWER"

User: "/invoke CODE-REVIEWER"
CODE-REVIEWER completes → Hook suggests: "gh pr merge 456"
```

**Configuration**: `.claude/settings.json`
```json
{
  "hooks": {
    "enabled": true,
    "onSubagentStop": ".claude/hooks/on-subagent-stop.sh",
    "onStop": ".claude/hooks/on-stop.sh"
  }
}
```

### Enhancement Queue System

Track multi-phase workflows across agent handoffs:

```json
{
  "enhancements": {
    "user-auth": {
      "slug": "user-auth",
      "status": "READY_FOR_BUILD",
      "linear_task": "FEAT-123",
      "agent_history": [
        {"agent": "PM", "status": "READY_FOR_ARCH"},
        {"agent": "ARCHITECT", "status": "READY_FOR_BUILD"}
      ],
      "next_agent": "EXECUTOR"
    }
  }
}
```

**Status Flow**:
```
BACKLOG → READY_FOR_DESIGN → READY_FOR_ARCH → READY_FOR_BUILD
  → READY_FOR_REVIEW → READY_FOR_TEST → READY_FOR_DEPLOY → DONE
```

### Definition of Done Checklists

Every agent has explicit completion criteria:

**EXECUTOR Checklist** (9 items):
- ✓ [RED] Write failing test
- ✓ [GREEN] Implement minimal code
- ✓ [REFACTOR] Improve design
- ✓ Achieve ≥80% diff coverage
- ✓ Pass all linting/formatting
- ✓ Create PR with description
- ✓ Update Linear task to Done

**Benefits**:
- Consistent execution across agent invocations
- Clear expectations for completion
- Easier debugging when agents "miss" steps

### Conflict Detection

Pre-flight checks prevent race conditions in parallel execution:

```bash
# Automated conflict detection
.claude/scripts/check-conflicts.sh

# Pre-flight checklist
- [ ] List files each agent will read/write
- [ ] Check for write-write conflicts
- [ ] Verify unique Linear task assignments
- [ ] Confirm no shared state modifications
```

**Resolution Strategies**:
1. File Separation (assign disjoint file sets)
2. Sequential Execution (run conflicting tasks sequentially)
3. Git Worktrees (isolated workspaces per agent)
4. Resource Locking (queue-based file locking)

### Enterprise Documentation

Comprehensive guides for production deployment:

- **[HOOKS-GUIDE.md](.claude/docs/HOOKS-GUIDE.md)** (650+ lines)
  - Setup, configuration, customization
  - Common workflows and patterns
  - Debugging and troubleshooting
  - CI/CD integration examples

- **[PARALLEL-EXECUTION.md](.claude/docs/PARALLEL-EXECUTION.md)** (850+ lines)
  - Conflict detection and prevention
  - Batch orchestration patterns
  - Performance optimization strategies

- **[ANTHROPIC-BEST-PRACTICES.md](.claude/ANTHROPIC-BEST-PRACTICES.md)** (1000+ lines)
  - Phase 5 implementation details
  - Alignment with October 2025 best practices
  - 98% compliance with Anthropic guidance

### Enterprise Metrics

**Reliability Improvements**:
- Workflow automation: Manual → Automated (hooks suggest next steps)
- Queue tracking: Ad-hoc → Structured (status transitions logged)
- Definition of Done: Implicit → Explicit (checklists per agent)
- Conflict prevention: Reactive → Proactive (pre-flight detection)

**Alignment with Best Practices**:
- Before Phase 5: 85% aligned
- After Phase 5: **98% aligned** with Anthropic's October 2025 guidance

### Usage

```bash
# Enable hooks (already configured in settings.json)
# Hooks automatically activate on agent completion

# Check enhancement queue
cat .claude/queue/enhancements.json

# Run conflict detection before parallel execution
.claude/scripts/check-conflicts.sh

# Session end summary (automatic)
# Displays: duration, uncommitted changes, open PRs, next steps
```

**See Also**:
- [HOOKS-GUIDE.md](.claude/docs/HOOKS-GUIDE.md) - Complete hooks documentation
- [DECISION-MATRIX.md](.claude/docs/DECISION-MATRIX.md) - When to use agents vs workflows vs hooks

---

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

**Root Cause**: Only STRATEGIST can create Linear tasks. Other agents provide task definitions.

**Solution**:
1. Verify STRATEGIST has Linear MCP access in `.claude/mcp.json`:
   ```json
   {
     "mcpServers": {
       "linear-server": {
         "allowedAgents": ["strategist"]
       }
     }
   }
   ```

2. After AUDITOR completes, create Linear tasks:
   ```bash
   # Quick command (auto-detects latest assessment)
   /linear

   # Or specify file explicitly
   /linear proposals/issues-TIMESTAMP.json
   ```

3. Alternative methods:
   ```bash
   # Direct STRATEGIST invocation
   /invoke STRATEGIST:create-linear-tasks proposals/issues-TIMESTAMP.json

   # Helper script (for CI/CD)
   .claude/scripts/linear/create-tasks-from-assessment.sh proposals/issues-TIMESTAMP.json
   ```

4. Verify environment variables:
   - `LINEAR_API_KEY` - Your Linear API token
   - `LINEAR_TEAM_ID` - Your team ID
   - `LINEAR_PROJECT_ID` - (optional) Project ID

**Test Connection**:
```bash
# Via helper script
LINEAR_API_KEY="your-key" LINEAR_TEAM_ID="your-team" \
  .claude/scripts/linear/create-tasks-from-assessment.sh /path/to/assessment.json
```
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