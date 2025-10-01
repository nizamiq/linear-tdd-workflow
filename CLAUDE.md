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

**Core Workflow Commands** - TDD enforcement and quality management:
- `/assess` - Scan code quality → Generate task definitions (AUDITOR)
- `/linear` - Create Linear tasks from latest assessment (STRATEGIST)
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

## 🎯 The Simplicity Principle (CRITICAL)

**IMPORTANT**: Following Anthropic's "Building Effective Agents" guidance, always prefer the **simplest approach** that achieves quality targets.

### Decision Hierarchy

```
1. Direct Tool Call  →  2. Workflow  →  3. Autonomous Agent
   (simplest, fastest)   (when needed)     (last resort)
```

**Cost/Complexity Impact**:
- Direct call: ~1x cost, 100% deterministic, instant
- Workflow: ~2-5x cost, 100% deterministic (if well-specified), fast
- Agent: ~10-20x cost, 70-95% reliable, slow (LLM latency)

**Decision Matrix**: See `.claude/docs/DECISION-MATRIX.md` for comprehensive guide on when to use each approach.

### Quick Rules

**Use Direct Tool Call** (via hooks or bash) for:
✅ Linting (`npm run lint` via hook)
✅ Type checking (`npx tsc --noEmit`)
✅ Running tests (`npm test`)
✅ Formatting (`prettier --write`)

**Use Workflow** (deterministic orchestration) for:
✅ TDD cycle (RED→GREEN→REFACTOR defined steps)
✅ Multi-phase validation (lint + typecheck + tests in sequence)
✅ Parallel batch operations (multiple independent assessments)

**Use Agent** (autonomous loop) only for:
✅ Unpredictable complexity (code quality assessment)
✅ Requires judgment (fix implementation, architecture decisions)
✅ Adaptive planning (pipeline recovery, pattern learning)

**Available Workflows**:
- `.claude/workflows/lint-workflow.yaml` - Replaces LINTER agent (95% cost reduction)
- `.claude/workflows/typecheck-workflow.yaml` - Replaces TYPECHECKER agent (95% cost reduction)
- `.claude/workflows/validation-workflow.yaml` - Replaces VALIDATOR agent (90% cost reduction)

## Parallel Execution Strategy

**IMPORTANT**: This system supports parallel subagent execution for maximum efficiency. When working with multiple independent tasks, leverage Claude Code's Task tool to run up to 10 subagents concurrently.

### How to Execute Agents in Parallel

**Critical Rule**: Send **a single message with multiple Task tool calls** to run subagents in parallel.

**Example - Parallel Assessment**:
```
User: "Assess the entire codebase"

You: I'll assess 3 areas in parallel for speed:
[In ONE message, make 3 Task tool calls:]
- Task 1: Assess backend (src/api/**)
- Task 2: Assess frontend (src/ui/**)
- Task 3: Assess tests (tests/**)

[All 3 run concurrently, results merge after completion]
Total time: ~10 minutes (vs ~30 minutes sequential)
```

**Example - Parallel Fix Implementation**:
```
User: "Implement these 5 Linear tasks"

You: I'll implement all 5 fixes in parallel:
[In ONE message, make 5 Task tool calls:]
- Task 1: Fix CLEAN-123
- Task 2: Fix CLEAN-124
- Task 3: Fix CLEAN-125
- Task 4: Fix CLEAN-126
- Task 5: Fix CLEAN-127

[All 5 run concurrently]
Total time: ~15 minutes (vs ~75 minutes sequential)
```

### Key Principles

1. **Single message = Parallel** - Multiple Task calls in one message run concurrently
2. **Multiple messages = Sequential** - Each message waits for the previous to complete
3. **Maximum 10 concurrent subagents** - Claude Code's limit
4. **Independent scopes only** - No shared file writes between parallel agents
5. **Result merging** - Wait for all completions, then aggregate results

### When to Use Parallel Execution

**✅ Use parallel execution for:**
- Assessing multiple directories/files independently
- Implementing multiple independent fix packs
- Running different types of validation (security, types, tests, lint)
- Analyzing separate modules or services
- Processing batch operations (multiple PRs, multiple issues)

**❌ Don't use parallel for:**
- Tasks with dependencies (A depends on B's output)
- Shared file modifications (merge conflicts)
- Sequential workflows (RED→GREEN→REFACTOR must be ordered)
- Single large tasks that can't be split

### Performance Benefits

- **5-10x faster** execution for independent tasks
- **Better resource utilization** - max out 10-subagent limit
- **Reduced wait time** - no idle periods between tasks
- **Scalable** - handles large codebases efficiently

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
[17 Specialized Agents for tech stack coverage]

Tech Stack Specialists:
• DJANGO-PRO, PYTHON-PRO, TYPESCRIPT-PRO
• KUBERNETES-ARCHITECT, DEPLOYMENT-ENGINEER
• DATABASE-OPTIMIZER, OBSERVABILITY-ENGINEER
• CODE-REVIEWER, TEST-AUTOMATOR, LEGACY-MODERNIZER
• DOC-KEEPER (Documentation validation & generation)
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

**STRATEGIST is the EXCLUSIVE Linear MCP manager**. Linear integration follows delegation pattern:

**Permission Model**:
- **STRATEGIST**: ONLY agent with `linear-server` MCP access - manages all Linear operations
- **AUDITOR**: Generates Linear task definitions (in `linear_tasks` array) → delegates to STRATEGIST
- **DOC-KEEPER**: Generates doc task definitions → delegates to STRATEGIST
- **GUARDIAN**: Reports incidents → STRATEGIST creates INCIDENT-XXX tasks
- **EXECUTOR**: Implements fixes → STRATEGIST updates task status and links PRs
- **All Others**: No direct Linear access - work through STRATEGIST

**IMPORTANT**: No agent except STRATEGIST can call `mcp__linear-server__*` tools. This prevents permission conflicts and ensures consistent task management.

**Workflow**:
1. Agent completes work (e.g., AUDITOR finishes assessment)
2. Agent provides structured output with task definitions
3. STRATEGIST reads output and creates Linear tasks via MCP
4. User receives Linear task IDs for implementation

When in doubt about Linear operations, use STRATEGIST.

### Key Workflows

1. **Assessment → Linear → Execution**
   - AUDITOR scans code → generates task definitions → STRATEGIST creates Linear tasks → EXECUTOR implements fixes

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
Tasks are managed via STRATEGIST delegation pattern:
- Assessment results → AUDITOR generates task definitions → STRATEGIST creates Linear issues via MCP
- Fix Packs → Linear tasks with estimates (created by STRATEGIST)
- PR status → STRATEGIST updates Linear via MCP + GitHub CLI

**Always check Linear for task context before implementing fixes.**

**To create Linear tasks after assessment**:
```bash
# Quick command (auto-detects latest assessment)
/linear

# Or specify file explicitly
/linear proposals/issues-TIMESTAMP.json

# Alternative: Direct STRATEGIST invocation
/invoke STRATEGIST:create-linear-tasks proposals/issues-TIMESTAMP.json

# Fallback for CI/CD (no MCP available)
.claude/scripts/linear/create-tasks-from-assessment.sh proposals/issues-TIMESTAMP.json
```
- This system must support python development
- you need to ensure that all the aspects of the workflows are working properly with proper E2E testing! you can use this workflow to self improve this project!