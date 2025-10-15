# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: THIS REPOSITORY IS THE SYSTEM ITSELF

**You are working in the LINEAR TDD WORKFLOW SYSTEM source repository.**

This is NOT a project using the system - this IS the system.

### What This Means

**This codebase contains:**
- The Linear TDD Workflow System source code
- Agent definitions (`.claude/agents/*.md`)
- Command specifications (`.claude/commands/*.md`)
- Workflow definitions (`.claude/journeys/*.md`)
- System documentation (`.claude/docs/`)
- System tests (`tests/e2e/`)
- The framework that gets installed in other projects

**When you work here, you are:**
- ✅ Developing/maintaining THE SYSTEM itself
- ✅ Improving agent capabilities and workflows
- ✅ Updating system documentation and tests
- ✅ Building features that will be used BY other projects
- ❌ NOT working on an application using the system

**DO NOT CONFUSE:**
- ❌ System documentation (`.claude/docs/`) with project docs
- ❌ System tests (`tests/e2e/executor-real-work.test.js`) with project tests
- ❌ Agent definitions (system files) with application code
- ❌ Improving the system with using the system

### Directory Structure

```
linear-tdd-workflow/ (THIS REPO - THE SYSTEM)
├── .claude/
│   ├── agents/          ← System agent definitions
│   ├── commands/        ← System command specs
│   ├── docs/            ← System documentation
│   └── workflows/       ← System workflow definitions
├── tests/e2e/           ← System E2E tests
├── scripts/             ← System utilities
└── docs/                ← System user documentation

my-app/ (ANOTHER PROJECT - USES THE SYSTEM)
├── .claude/             ← Installed system (copied from above)
├── src/                 ← Application code (managed BY system)
├── tests/               ← Application tests (managed BY system)
└── docs/                ← Application documentation
```

### When Asked to "Work on the Project"

**Always clarify:**
1. "Do you mean the Linear TDD Workflow System itself (this repo)?"
2. "Or a project that uses this system?"

**If unclear, check:**
- Working directory: `/Users/cnross/code/linear-tdd-workflow` = SYSTEM
- File paths: `.claude/agents/executor.md` = SYSTEM FILE
- Tests: `tests/e2e/executor-real-work.test.js` = SYSTEM TEST

**Examples:**

❌ **WRONG**: "Let me use `/assess` to scan this project's code quality"
→ That would assess THE SYSTEM's code, not intended

✅ **RIGHT**: "I'm updating the EXECUTOR agent definition to fix simulation issues"
→ Correct - you're developing the system itself

❌ **WRONG**: "Let me add a new feature to the application"
→ This repo has no "application" - it IS the system

✅ **RIGHT**: "I'm adding a new verification function to the system"
→ Correct - you're enhancing system capabilities

---

## 🚀 System Capabilities Overview

As the Linear TDD Workflow System source repository, you have access to powerful autonomous capabilities for development:

### Quick Discovery

```bash
# Check if system is active
test -d .claude && echo "✅ TDD Workflow System Available" || echo "❌ System not found"

# View system capabilities
cat .claude/README.md

# Activate if needed
make onboard
```

### Primary Commands Available to You (Slash Commands)

**Core Workflow Commands** - TDD enforcement and quality management:

- `/assess` - Scan code quality → Create Linear tasks (AUDITOR)
- `/fix <TASK-ID>` - Implement fix with TDD enforcement (EXECUTOR)
- `/recover` - Auto-fix broken CI/CD pipeline (GUARDIAN)
- `/learn` - Mine patterns from successful PRs (SCHOLAR)
- `/release <version>` - Manage production deployment (STRATEGIST)
- `/status` - Current workflow & Linear status (STRATEGIST)
- `/commit` - Git commit with Conventional Commits and validation (STRATEGIST)
- `/cycle [plan|status|execute|review]` - Sprint planning (PLANNER)
- `/docs` - Documentation validation and generation (DOC-KEEPER)

**Development & Framework Commands** - Tech stack specific:

- `/django` - Django development assistance (DJANGO-PRO)
- `/python` - Python optimization and modern patterns (PYTHON-PRO)
- `/typescript` - TypeScript and React development (TYPESCRIPT-PRO)

**Infrastructure & Operations Commands** - Deployment and monitoring:

- `/deploy` - Progressive deployment orchestration (DEPLOYMENT-ENGINEER)
- `/optimize-db` - Database performance analysis (DATABASE-OPTIMIZER)
- `/monitor` - Observability and alerting setup (OBSERVABILITY-ENGINEER)

**Alternative Script Entrypoints:**

```bash
# Via Makefile (if slash commands not available)
make assess                  # Code assessment
make fix TASK=CLEAN-123      # TDD fix implementation
make recover                 # Pipeline recovery
make learn                   # Pattern learning
make release                 # Release management
make status                  # System status

# Direct agent discovery
ls .claude/agents/*.md       # List available agents
ls .claude/commands/*.md     # List available commands
```

**Documentation:** Each command has full docs in `.claude/commands/`
**For detailed instructions:** See `.claude/DISCOVERY.md`

## Project Context

**Linear TDD Workflow System** - Multi-agent autonomous code quality management system that enforces strict Test-Driven Development.

Linear Configuration:

- Team: Configured via `LINEAR_TEAM_ID` environment variable
- Project: Configured via `LINEAR_PROJECT_ID` environment variable (optional)
- Task Prefix: Configured via `LINEAR_TASK_PREFIX` environment variable (optional)

## Essential Commands

### Testing

```bash
# Run all tests with coverage
npm test

# Run single test file
npm test -- path/to/test.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate"

# Run specific test suite
npm test:unit        # Unit tests only
npm test:integration # Integration tests
npm test:e2e        # End-to-end tests

# Watch mode for TDD
npm test:watch
```

### Code Quality

```bash
# Lint and auto-fix
npm run lint

# Check without fixing
npm run lint:check

# Format code
npm run format

# Type checking
npm run typecheck

# Pre-commit checks (runs lint, format, unit tests)
npm run precommit
```

### Build

```bash
# TypeScript compilation
npm run build
```

### Agent Operations

```bash
# Assess code quality
npm run assess

# Execute approved fixes
npm run execute:fixpack

# Sync with Linear
npm run linear:sync

# Cycle Planning (NEW!)
npm run cycle:analyze    # Phase 1: Analyze current state
npm run cycle:plan       # Phase 2: Select and score issues
npm run cycle:align      # Phase 3: Map work to agents
npm run cycle:ready      # Phase 4: Validate readiness
npm run cycle:full       # Run all 4 phases sequentially
```

## Architecture

### Multi-Agent System

The system operates through 23 specialized agents coordinated via Linear.app:

```
Linear.app (Task Management)
    ↓
STRATEGIST (Orchestration) ← → PLANNER (Cycle Planning)
    ↓
┌─────────────┬──────────────┬────────────────┬──────────────┐
│   AUDITOR   │   EXECUTOR   │   GUARDIAN     │   SCHOLAR    │
│ (Assessment)│ (Fix Impl.)  │ (CI/CD Guard)  │ (Learning)   │
└─────────────┴──────────────┴────────────────┴──────────────┘
       ↓              ↓               ↓                ↓
[17 Specialized Agents for tech stack & quality coverage]

Tech Stack Specialists:
• DJANGO-PRO, PYTHON-PRO, TYPESCRIPT-PRO
• KUBERNETES-ARCHITECT, DEPLOYMENT-ENGINEER
• DATABASE-OPTIMIZER, OBSERVABILITY-ENGINEER

Quality & Testing Specialists:
• CODE-REVIEWER, TEST-AUTOMATOR, TESTER
• LINTER, TYPECHECKER, VALIDATOR

Migration & Documentation:
• LEGACY-MODERNIZER, DOC-KEEPER, SECURITY
```

**Agent Usage:**
Claude Code natively discovers and uses agents through:

- **Slash Commands**: `/assess`, `/fix`, `/recover`, `/learn`, `/release`, `/status`, `/cycle`, `/docs`
- **Agent Files**: `.claude/agents/*.md` - Each agent has comprehensive system prompts
- **Direct Invocation**: Agents are automatically selected based on the task

**Agent Documentation:**

- `.claude/agents/` - All agent definitions in Markdown with frontmatter
- `.claude/commands/` - Slash command definitions
- Each agent file contains complete role description and capabilities

### Directory Structure

```
.claude/
├── agents/         # 23 agent specifications
│   └── CLAUDE.md  # Detailed agent reference
├── commands/      # Command templates
└── mcp.json      # MCP server configuration

scripts/           # Operational scripts for agents
tests/            # Test suites (unit/integration/e2e)
docs/             # Project documentation
```

### Linear Task Management

**STRATEGIST is the PRIMARY Linear manager**. Other agents have limited roles:

- **STRATEGIST**: Full CRUD - manages all tasks, sprints, assignments
- **AUDITOR**: CREATE only - quality issues (CLEAN-XXX)
- **DOC-KEEPER**: CREATE only - documentation issues (DOC-XXX)
- **MONITOR**: CREATE only - incidents (INCIDENT-XXX)
- **SCHOLAR**: READ only - pattern analysis
- **Others**: UPDATE only for specific status changes

When in doubt about Linear operations, use STRATEGIST.

### Key Workflows

1. **Assessment → Linear → Execution**
   - AUDITOR scans code → creates Linear tasks → EXECUTOR implements fixes

2. **TDD Enforcement (RED→GREEN→REFACTOR)**
   - Every change must: write failing test → minimal code to pass → refactor
   - Enforced by CI: diff coverage ≥80%, mutation testing ≥30%

3. **Fix Pack Constraints**
   - Max 300 LOC per PR
   - Pre-approved changes only (FIL-0/FIL-1)
   - Atomic commits with rollback plans

## Critical Constraints

### Test-Driven Development

**Mandatory cycle for every change:**

1. **[RED]** - Write failing test first
2. **[GREEN]** - Minimal code to pass
3. **[REFACTOR]** - Improve with passing tests

### Fix Pack Limits

- ≤300 LOC per PR
- Diff coverage ≥80%
- Only FIL-0/FIL-1 changes (no feature work)

### Feature Impact Levels (FIL)

- **FIL-0/1**: Auto-approved (formatting, dead code, renames)
- **FIL-2**: Tech Lead approval (utilities, configs)
- **FIL-3**: Tech Lead + Product approval (APIs, migrations)

## Performance SLAs

- Code assessment: ≤12min for 150k LOC (JS/TS)
- Fix implementation: ≤15min p50
- Pipeline recovery: ≤10min p95

## MCP Tools Available

- `sequential-thinking` - Complex reasoning
- `context7` - Code understanding
- `linear` - Task management
- `playwright` - E2E testing
- `kubernetes` - Deployment

## Testing Framework

- **Framework**: Jest with TypeScript
- **Coverage Requirements**: 80% minimum
- **Test Organization**:
  - `tests/unit/` - Isolated component tests
  - `tests/integration/` - Component interaction
  - `tests/e2e/` - Full user journeys

## Development Workflow

1. Create feature branch from `develop`
2. Follow TDD cycle strictly
3. Run `npm run precommit` before pushing
4. Create PR with diff coverage ≥80%
5. Merge to `develop` after review

GitFlow branches:

- `main` - Production releases only
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

## Agent-Specific Notes

When working with agents:

1. Check `.claude/agents/CLAUDE.md` for detailed specifications
2. Use standardized CLI invocation syntax
3. All agent PRs require human review
4. Agents operate in development/staging only (no production access)

## Linear Integration

**Primary Integration: MCP Tools + GitHub CLI** (No infrastructure needed!)

The system uses Claude Code's built-in tools for seamless integration:

- **Linear MCP Server** - Direct API access to Linear.app
- **GitHub CLI (`gh`)** - Direct GitHub operations
- **No webhooks needed** - Works immediately in Claude Code

### Integration Modes

- **🟢 Standard (Recommended)** - MCP tools + CLI (zero setup)
- **🟡 Polling** - Scheduled sync for CI/CD
- **🔴 Webhooks** - Advanced/Enterprise only (see `.claude/advanced/webhooks/`)

For details, see `.claude/INTEGRATION-GUIDE.md`

### How It Works

Tasks are automatically managed via Linear MCP:

- Assessment results → Linear issues (via MCP)
- Fix Packs → Linear tasks with estimates
- PR status → GitHub CLI + Linear MCP updates

Always check Linear for task context before implementing fixes.

- This system must support python development
- you need to ensure that all the aspects of the workflows are working properly with proper E2E testing! you can use this workflow to self improve this project!
