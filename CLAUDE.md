# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 IMPORTANT: Autonomous Workflow System Detected

This project has the **Linear TDD Workflow System** installed. You have access to powerful autonomous capabilities:

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

**Core Journey Commands** - Aligned to TDD + Linear workflow:
- `/assess` - Scan code quality → Create Linear tasks (JR-2)
- `/fix TASK-ID` - Implement fix with TDD enforcement (JR-3)
- `/recover` - Auto-fix broken CI/CD pipeline (JR-4)
- `/learn` - Mine patterns from successful PRs (JR-5)
- `/release` - Manage production deployment (JR-6)
- `/status` - Current workflow & Linear status

**Script Entrypoints:**
```bash
# Via Makefile (recommended)
make assess                  # Code assessment
make fix TASK=CLEAN-123      # TDD fix implementation
make recover                 # Pipeline recovery
make learn                   # Pattern learning
make release                 # Release management
make status                  # System status

# Command discovery
node .claude/cli.js commands:list      # List all commands
node .claude/cli.js commands:list --json # JSON format for parsing
```

**Documentation:** Each command has full docs in `.claude/commands/`
**For detailed instructions:** See `.claude/DISCOVERY.md`

## Project Context

**Linear TDD Workflow System** - Multi-agent autonomous code quality management system that enforces strict Test-Driven Development.

Linear Configuration:
- Team: `a-coders`
- Project: `ai-coding`

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
```

## Architecture

### Multi-Agent System

The system operates through 20 specialized agents coordinated via Linear.app:

```
Linear.app (Task Management)
    ↓
STRATEGIST (Orchestration)
    ↓
┌─────────────┬──────────────┬────────────────┬──────────────┐
│   AUDITOR   │   EXECUTOR   │   GUARDIAN     │   SCHOLAR    │
│ (Assessment)│ (Fix Impl.)  │ (CI/CD Guard)  │ (Learning)   │
└─────────────┴──────────────┴────────────────┴──────────────┘
       ↓              ↓               ↓                ↓
[15 Specialized Agents for specific tasks]
```

**Agent Invocation Pattern:**
```bash
npm run agent:invoke <AGENT>:<COMMAND> -- [parameters]

# Examples:
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke GUARDIAN:analyze-failure -- --auto-fix
```

**Critical Agent References:**
- `.claude/agents/CLAUDE.md` - Complete agent system reference with Linear matrix
- `.claude/agents/AGENT-SELECTION-GUIDE.md` - Decision trees for choosing agents
- `.claude/agents/LINEAR-OPERATIONS-GUIDE.md` - Linear task management clarity

### Directory Structure

```
.claude/
├── agents/         # 20 agent specifications
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