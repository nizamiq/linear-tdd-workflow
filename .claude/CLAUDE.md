# Linear TDD Workflow System - Complete Claude Code Guide

This is the comprehensive reference for Claude Code when working with projects using the Linear TDD Workflow System.

## 🚀 System Overview

You are working in a project with the **Linear TDD Workflow System** installed - a multi-agent autonomous code quality management system that enforces strict Test-Driven Development and functional release practices.

**Version:** 1.5.0
**Agents:** 23 specialized agents
**Journeys:** 7 autonomous workflows
**Key Features:** Autonomous execution, TDD enforcement, functional release gates, parallel execution, cycle planning

## Quick Discovery

```bash
# Verify system is active
test -d .claude && echo "✅ System Available" || echo "❌ Not found"

# View capabilities
cat .claude/README.md

# Activate if needed
make onboard
```

## Slash Commands Available

### Core Workflow Commands

- `/assess` - Scan code quality → Generate task definitions (AUDITOR)
- `/linear` - Create Linear tasks from latest assessment (STRATEGIST)
- `/fix <TASK-ID>` - Implement fix with TDD enforcement (EXECUTOR)
- `/lint` - Intelligent linting with auto-detection (LINTER)
- `/recover` - Auto-fix broken CI/CD pipeline (GUARDIAN)
- `/learn` - Mine patterns from successful PRs (SCHOLAR)
- `/release <version>` - Manage production deployment with functional gate (STRATEGIST)
- `/status` - Current workflow & Linear status (STRATEGIST)
- `/commit` - Git commit with validation (STRATEGIST)
- `/cycle [plan|status|execute|review]` - Sprint planning (PLANNER)
- `/docs` - Documentation validation and generation (DOC-KEEPER)

### Tech Stack Commands

- `/django` - Django development assistance (DJANGO-PRO)
- `/python` - Python optimization and modern patterns (PYTHON-PRO)
- `/typescript` - TypeScript and React development (TYPESCRIPT-PRO)

### Infrastructure Commands

- `/deploy` - Progressive deployment orchestration (DEPLOYMENT-ENGINEER)
- `/optimize-db` - Database performance analysis (DATABASE-OPTIMIZER)
- `/monitor` - Observability and alerting setup (OBSERVABILITY-ENGINEER)

### Alternative Access

```bash
# Via Makefile
make assess                  # Code assessment
make fix TASK=CLEAN-123      # TDD fix implementation
make lint                    # Intelligent linting
make recover                 # Pipeline recovery
make release                 # Release management
make status                  # System status

# Direct agent/command discovery
ls .claude/agents/*.md       # List all agents
ls .claude/commands/*.md     # List all commands
```

## 🤖 Autonomous Execution (NEW in v1.5.0)

**Slash commands now execute immediately without manual Task tool invocations.**

### How It Works

When you invoke a slash command (e.g., `/assess`, `/fix CLEAN-123`), the system:

1. **Reads command specification** from `.claude/commands/<command>.md`
2. **Finds execution instructions** in "🤖 Execution Instructions for Claude Code" section
3. **Invokes agent via Task tool** automatically with specified parameters
4. **Agent executes immediately** following "⚡ IMMEDIATE EXECUTION INSTRUCTIONS"
5. **Returns results** to you without unnecessary pauses

### Key Principles

**✅ Agents execute autonomously:**

- No manual Task tool invocations required
- No confirmation needed for standard operations
- Complete workflows without pausing between phases
- Only stop at defined approval gates

**🚦 Human intervention points:**

- Creating Linear tasks (after assessment)
- Creating Linear cycles (after planning)
- Deploying to production (after pre-flight checks)
- Creating incident tasks (after recovery, optional)

### Example: /assess Command

```
You: /assess --scope=src/api

[Automatic execution]:
1. Command file triggers AUDITOR agent invocation
2. AUDITOR scans all files in src/api
3. Categorizes issues by severity
4. Generates assessment report
5. Prepares Linear task definitions
6. Returns report to you

[Approval gate]:
Me: "I've identified 12 critical and 8 high severity issues.
    Would you like me to create Linear tasks for these findings?"

You: "Yes"

[Automatic execution]:
7. STRATEGIST creates CLEAN-XXX tasks in Linear
8. Returns task IDs
```

### No More Manual Task Tool Calls

**Before v1.5.0** (Manual):

```
You: /assess
Me: "Would you like me to assess the code?"
You: "Yes"
Me: [Manually invokes Task tool with AUDITOR]
AUDITOR: "Should I scan files?"
...
```

**v1.5.0** (Autonomous):

```
You: /assess
Me: [Immediately invokes AUDITOR, scans complete, presents report]
Me: "Assessment complete. Create Linear tasks?"
```

### Performance Improvements

With immediate execution:

- **5-10x faster** for large assessments (parallel execution)
- **2x faster** for cycle planning (parallel phases)
- **Zero manual steps** for TDD implementation
- **10-15 min** pipeline recovery (fully automated)

### Detailed Documentation

**Complete guide:** `.claude/docs/AUTONOMOUS-EXECUTION.md`

**Topics covered:**

- Execution flow diagrams for each command
- Human intervention points (approval gates)
- Parallel execution strategies
- Troubleshooting autonomous execution
- Performance SLAs
- Best practices

## ⚠️ NON-NEGOTIABLE: Test-Driven Development

**Every code change follows strict TDD. This is enforced automatically.**

```
[RED] → [GREEN] → [REFACTOR]
  ↓         ↓           ↓
Test    Minimal    Improve
First     Code     Design
```

### Quality Gates (Blocking)

- **≥80% diff coverage** - Every changed line must be tested
- **≥30% mutation score** - Tests must validate actual behavior
- **NO production code without failing test first** - Zero exceptions

### TDD Enforcement by EXECUTOR Agent

When you run `/fix CLEAN-XXX`, the EXECUTOR agent automatically:

1. ✅ Refuses to write production code before tests exist
2. ✅ Verifies RED phase (test fails for expected reason)
3. ✅ Verifies GREEN phase (minimal code to pass)
4. ✅ Verifies REFACTOR phase (improvements with passing tests)
5. ✅ Checks coverage gates (≥80% diff, ≥30% mutation)
6. ✅ Blocks commits that don't meet quality standards
7. ✅ Labels commits with TDD phase: [RED], [GREEN], [REFACTOR]

**You cannot bypass this. It's built into the system.**

### TDD Quick Reference

**[RED Phase]** - Write failing test FIRST:

```javascript
test('calculates tax for high income', () => {
  expect(calculateTax(100000)).toBe(25000);
});
// ❌ FAILS - calculateTax doesn't exist yet
```

**[GREEN Phase]** - Minimal code to pass:

```javascript
function calculateTax(income) {
  return income * 0.25;
}
// ✅ PASSES
```

**[REFACTOR Phase]** - Improve design:

```javascript
const TAX_RATE = 0.25;
function calculateTax(income) {
  validateIncome(income);
  return income * TAX_RATE;
}
// ✅ STILL PASSES - refactored safely
```

**Complete reference:** `.claude/docs/TDD-REMINDER.md`

## 🎯 Functional Release Management

**Core Principle:** Only release features that are truly functional and validated via E2E tests simulating real user stories.

### User Story Registry

All features tracked in `.claude/user-stories/registry.yaml`:

```yaml
features:
  feature-slug:
    name: 'User-facing feature description'
    status: implemented | partial | planned
    e2e_test: 'path/to/test.js::test-name'
    notes: 'Optional implementation notes'
```

**Status Meanings:**

- **`implemented`**: Feature built + E2E test passing → ✅ **Allows release**
- **`partial`**: Feature built but NO E2E test → ❌ **BLOCKS release**
- **`planned`**: Not yet built → ⚪ Doesn't affect release

### Functional Release Gate

Automated validator that runs as **Phase 2.5** in release journey:

**What it checks:**

1. ✅ All `implemented` features have `e2e_test` specified
2. ✅ All E2E tests pass when executed
3. ❌ **BLOCKS** if any `partial` status features exist
4. ❌ **BLOCKS** if any E2E test fails

**Commands:**

```bash
# Check if ready for release
npm run release:validate-functional
make release-check

# View current coverage
npm run release:user-stories
make release-stories

# Add new feature to registry
npm run release:add-story
make add-story

# Validate E2E test metadata
npm run e2e:validate
make validate-e2e
```

### E2E Test Metadata

Link tests to features using `@feature` tags:

```javascript
/**
 * E2E Test: Complete Workflow Validation
 * @feature assess-code-quality
 * @user-story User runs /assess to scan code and generate Linear tasks
 */
test('should complete full assessment workflow', async () => {
  // Test implementation
});
```

### Release Workflow

1. **Build feature** with TDD (RED→GREEN→REFACTOR)
2. **Add to registry** with `status: planned`
3. **Merge to develop**
4. **Write E2E test** simulating user story with `@feature` tag
5. **Update registry** to `status: implemented` with `e2e_test` path
6. **Verify**: `npm test:e2e`
7. **Release**: `/release 1.2.0` (gate runs automatically in Phase 2.5)

**If gate blocks:** Fix missing E2E tests, update registry to `implemented`, re-run validation.

**Complete guide:** `.claude/docs/FUNCTIONAL-RELEASE.md`

## 🎯 The Simplicity Principle (CRITICAL)

Following Anthropic's "Building Effective Agents" guidance, always prefer the **simplest approach** that achieves quality targets.

### Decision Hierarchy

```
1. Direct Tool Call  →  2. Workflow  →  3. Autonomous Agent
   (simplest, fastest)   (when needed)     (last resort)
```

**Cost/Complexity Impact:**

- Direct call: ~1x cost, 100% deterministic, instant
- Workflow: ~2-5x cost, 100% deterministic, fast
- Agent: ~10-20x cost, 70-95% reliable, slow

### Quick Rules

**Use Direct Tool Call** (via hooks or bash):
✅ Linting (`npm run lint`)
✅ Type checking (`npx tsc --noEmit`)
✅ Running tests (`npm test`)
✅ Formatting (`prettier --write`)

**Use Workflow** (deterministic orchestration):
✅ TDD cycle (RED→GREEN→REFACTOR)
✅ Multi-phase validation
✅ Parallel batch operations

**Use Agent** (autonomous loop) only for:
✅ Unpredictable complexity (code assessment)
✅ Requires judgment (fix implementation)
✅ Adaptive planning (pipeline recovery)

**Available Workflows:**

- `.claude/workflows/lint-workflow.yaml` - Replaces LINTER agent (95% cost reduction)
- `.claude/workflows/typecheck-workflow.yaml` - Replaces TYPECHECKER agent (95% cost reduction)
- `.claude/workflows/validation-workflow.yaml` - Replaces VALIDATOR agent (90% cost reduction)

**Complete decision guide:** `.claude/docs/DECISION-MATRIX.md`

## Parallel Execution Strategy

**CRITICAL**: This system supports parallel subagent execution for maximum efficiency.

### How to Execute in Parallel

**Rule**: Send **a single message with multiple Task tool calls** to run subagents concurrently.

**Example - Parallel Assessment:**

```
User: "Assess the entire codebase"

You: I'll assess 3 areas in parallel:
[In ONE message, make 3 Task tool calls:]
- Task 1: Assess backend (src/api/**)
- Task 2: Assess frontend (src/ui/**)
- Task 3: Assess tests (tests/**)

[All 3 run concurrently]
Time: ~10min (vs ~30min sequential)
```

**Example - Parallel Fixes:**

```
User: "Implement these 5 Linear tasks"

You: I'll implement all 5 fixes in parallel:
[In ONE message, make 5 Task tool calls:]
- Task 1: Fix CLEAN-123
- Task 2: Fix CLEAN-124
- Task 3: Fix CLEAN-125
- Task 4: Fix CLEAN-126
- Task 5: Fix CLEAN-127

Time: ~15min (vs ~75min sequential)
```

### Key Principles

1. **Single message = Parallel** - Multiple Task calls in one message run concurrently
2. **Multiple messages = Sequential** - Each message waits for previous
3. **Maximum 10 concurrent subagents** - Claude Code's limit
4. **Independent scopes only** - No shared file writes
5. **Result merging** - Wait for all, then aggregate

### When to Use Parallel

**✅ Use for:**

- Assessing multiple directories independently
- Implementing multiple independent fix packs
- Running different validations (security, types, tests, lint)
- Analyzing separate modules
- Processing batch operations

**❌ Don't use for:**

- Tasks with dependencies
- Shared file modifications
- Sequential workflows (TDD cycle)
- Single large tasks

**Performance:** 5-10x faster for independent tasks

**Complete guide:** `.claude/docs/PARALLEL-EXECUTION.md`

## Architecture

### Multi-Agent System

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

Specialists:
• DJANGO-PRO, PYTHON-PRO, TYPESCRIPT-PRO
• KUBERNETES-ARCHITECT, DEPLOYMENT-ENGINEER
• DATABASE-OPTIMIZER, OBSERVABILITY-ENGINEER
• CODE-REVIEWER, TEST-AUTOMATOR, LEGACY-MODERNIZER
• DOC-KEEPER, VALIDATOR, LINTER, TYPECHECKER, TESTER
```

**Agent discovery:**

- Slash Commands: `/assess`, `/fix`, `/recover`, etc.
- Agent Files: `.claude/agents/*.md`
- Commands: `.claude/commands/*.md`

### Linear Task Management

**STRATEGIST is the PRIMARY Linear MCP manager, with PLANNER having limited access for cycle operations.**

**Permission Model:**

- **STRATEGIST**: Full Linear MCP access for all task management operations
  - Creates/updates/queries any Linear tasks
  - Manages issue status, assignments, labels
  - Links PRs to issues via GitHub CLI
  - Handles CLEAN-XXX, DOC-XXX, INCIDENT-XXX tasks
- **PLANNER**: Limited Linear MCP access ONLY for cycle planning workflow
  - Creates Linear cycles during `/cycle plan` (Phase 4.5)
  - Adds issues to cycles using `mcp__linear-server__update_issue()`
  - Uses dynamic team discovery via `LINEAR_TEAM_ID` or `discoverLinearTeam()`
  - Rate-limited batch processing (5 issues/batch, 200ms delays)
- **AUDITOR**: Generates task definitions → delegates to STRATEGIST
- **DOC-KEEPER**: Generates doc tasks → delegates to STRATEGIST
- **GUARDIAN**: Reports incidents → STRATEGIST creates INCIDENT-XXX
- **EXECUTOR**: Implements fixes → STRATEGIST updates status/links PRs
- **All Others**: No direct Linear access - work through STRATEGIST

**Workflow:**

1. Agent completes work (e.g., AUDITOR finishes assessment)
2. Agent provides structured output with task definitions
3. STRATEGIST reads output and creates Linear tasks via MCP
4. User receives Linear task IDs

**Special Case - Cycle Planning:**

1. User runs `/cycle plan`
2. PLANNER analyzes backlog and generates capacity-based plan (Phases 1-4)
3. PLANNER presents plan with approval gate (Phase 4.5)
4. On approval, PLANNER creates Linear cycle and adds issues
5. PLANNER returns cycle ID and URL

**When in doubt about Linear operations, use STRATEGIST. For cycle planning, use PLANNER.**

### Key Workflows

1. **Assessment → Linear → Execution**
   - AUDITOR scans → generates task definitions → STRATEGIST creates Linear tasks → EXECUTOR implements

2. **TDD Enforcement**
   - RED→GREEN→REFACTOR cycle mandatory
   - Enforced by CI: diff coverage ≥80%, mutation ≥30%

3. **Fix Pack Constraints**
   - Max 300 LOC per PR
   - Pre-approved changes only (FIL-0/FIL-1)
   - Atomic commits with rollback plans

## Critical Constraints

### Test-Driven Development

**Mandatory cycle:**

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

## Essential Commands

### Testing

```bash
# Run all tests with coverage
npm test

# Run specific test suite
npm test:unit        # Unit tests
npm test:integration # Integration tests
npm test:e2e        # End-to-end tests

# Watch mode for TDD
npm test:watch

# Single test file
npm test -- path/to/test.spec.ts

# Pattern matching
npm test -- --testNamePattern="should validate"
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

# Pre-commit checks
npm run precommit
```

### Build

```bash
# TypeScript compilation
npm run build
```

### Agent Operations

```bash
# Assessment
npm run assess

# Fix execution
npm run execute:fixpack

# Linear sync
npm run linear:sync

# Cycle planning
npm run cycle:full

# Functional release
npm run release:validate-functional
npm run release:user-stories
npm run release:add-story
npm run e2e:validate
npm run e2e:report
```

## Performance SLAs

- Code assessment: ≤12min for 150k LOC (JS/TS)
- Fix implementation: ≤15min p50
- Pipeline recovery: ≤10min p95

## MCP Tools Available

- `sequential-thinking` - Complex reasoning
- `context7` - Code understanding
- `linear-server` - Task management (STRATEGIST only)
- `playwright` - E2E testing
- `kubernetes` - Deployment

## Testing Framework

- **Framework**: Jest with TypeScript
- **Coverage Requirements**: 80% minimum
- **Test Organization**:
  - `tests/unit/` - Isolated component tests
  - `tests/integration/` - Component interaction
  - `tests/e2e/` - Full user journeys with @feature tags

## Development Workflow

1. Create feature branch from `develop`
2. Follow TDD cycle strictly (RED→GREEN→REFACTOR)
3. Run `npm run precommit` before pushing
4. Create PR with diff coverage ≥80%
5. Merge to `develop` after review

**GitFlow branches:**

- `main` - Production releases only
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

## Linear Integration

**Primary Integration:** MCP Tools + GitHub CLI (zero setup)

**Tools:**

- Linear MCP Server - Direct API access
- GitHub CLI (`gh`) - Direct GitHub operations
- No webhooks needed

**How it works:**

- AUDITOR generates task definitions
- STRATEGIST creates Linear issues via MCP
- STRATEGIST updates tasks via MCP + GitHub CLI
- Always check Linear for task context before implementing

**To create Linear tasks:**

```bash
# Quick command
/linear

# Specify file
/linear proposals/issues-TIMESTAMP.json

# Direct invocation
/invoke STRATEGIST:create-linear-tasks proposals/issues-TIMESTAMP.json
```

## Agent-Specific Notes

When working with agents:

1. Check `.claude/agents/CLAUDE.md` for detailed specs
2. Use standardized CLI invocation
3. All PRs require human review
4. Agents operate in dev/staging only (no production access)

## Documentation

**Core docs in `.claude/docs/`:**

- `FUNCTIONAL-RELEASE.md` - Complete functional release guide
- `TDD-REMINDER.md` - TDD reference card
- `DECISION-MATRIX.md` - When to use agents vs workflows
- `PARALLEL-EXECUTION.md` - Parallel execution guide
- `HOOKS-GUIDE.md` - Git hooks and automation

**Agent specs:** `.claude/agents/`
**Commands:** `.claude/commands/`
**Journeys:** `.claude/journeys/`

## Troubleshooting Cycle Commands

### `/cycle plan` Issues

**Problem: PLANNER doesn't create Linear cycle**

**Symptoms:**
- Plan generated but no cycle created in Linear.app
- "Would you like me to create this cycle?" prompt never appears
- No approval gate shown

**Root Cause:**
- Missing Phase 4.5 approval gate
- PLANNER not configured with Linear MCP access

**Solution:**
1. Verify Phase 4.5 exists in `.claude/commands/cycle.md`:
   ```bash
   grep -A 5 "Phase 4.5" .claude/commands/cycle.md
   ```
2. Check PLANNER has `createLinearCycle()` function in `.claude/agents/planner.md`:
   ```bash
   grep -A 10 "createLinearCycle" .claude/agents/planner.md
   ```
3. Ensure `LINEAR_TEAM_ID` is set:
   ```bash
   echo $LINEAR_TEAM_ID  # Should show your team ID (e.g., "ACO")
   ```
4. Verify Linear MCP server is configured in `.claude/mcp.json`:
   ```bash
   cat .claude/mcp.json | grep linear-server
   ```

**Problem: Partial success - cycle created but issues not added**

**Symptoms:**
- Cycle exists in Linear.app
- Some or all issues not added to cycle
- Error messages like "Failed to add issue XXX"

**Root Cause:**
- API rate limiting
- Invalid issue IDs
- Permission issues

**Solution:**
1. Check batch size and delay settings (should be 5 issues/batch, 200ms delay)
2. Verify all issue IDs exist in Linear:
   ```bash
   # Use Linear MCP to check issue
   mcp linear-server get_issue --id=ISSUE-123
   ```
3. Check PLANNER has permission to update issues
4. Review error logs for specific failure reasons

**Problem: Dynamic team discovery fails**

**Symptoms:**
- Error: "Could not discover Linear team"
- Cycle creation fails with team ID error

**Root Cause:**
- `LINEAR_TEAM_ID` not set
- Linear API credentials missing
- `discoverLinearTeam()` function missing

**Solution:**
1. Set `LINEAR_TEAM_ID` explicitly:
   ```bash
   export LINEAR_TEAM_ID=ACO  # Replace with your team ID
   ```
2. Verify Linear API key is configured
3. Check `discoverLinearTeam()` function exists in planner.md

### `/cycle execute` Issues

**Problem: Subagents don't persist work**

**Symptoms:**
- Subagent reports "work complete" but no actual changes
- No git commits exist
- No PRs created
- Tests not modified

**Root Cause:**
- Vague subagent instructions
- Subagent analyzing instead of executing
- No verification phase (Phase 5)

**Solution:**
1. Verify explicit execution instructions in `.claude/commands/cycle.md`:
   ```bash
   grep -A 20 "IMMEDIATE EXECUTION" .claude/commands/cycle.md
   ```
2. Check for "DO NOT analyze - EXECUTE IMMEDIATELY" directive
3. Ensure Phase 5 verification exists:
   ```bash
   grep -A 10 "Phase 5: Verification" .claude/commands/cycle.md
   ```
4. Run manual verification:
   ```bash
   # Check for commits
   git log --oneline -5

   # Check for modified files
   git status

   # Check for PRs
   gh pr list
   ```

**Problem: Verification phase reports false positives**

**Symptoms:**
- Verification says "work complete" but files unchanged
- No git commits found during verification
- PR checks fail

**Root Cause:**
- Missing `verifySubagentWork()` function
- No ground truth checks
- Verification relying on subagent reports instead of actual output

**Solution:**
1. Verify `verifySubagentWork()` exists in `.claude/agents/planner.md`:
   ```bash
   grep -A 30 "verifySubagentWork" .claude/agents/planner.md
   ```
2. Check function uses ground truth verification:
   - `git status --porcelain` for file changes
   - `git log` for commits
   - `gh pr view` for PRs
   - Linear MCP for task status
3. Ensure function returns verification report with boolean flags
4. Review verification report output for accuracy

**Problem: Subagents fail with "no write permission"**

**Symptoms:**
- Error: "Cannot write to file"
- Subagent reports permission denied
- Changes not saved

**Root Cause:**
- Subagent not using Write/Edit tools
- File permissions issue
- Incorrect file paths

**Solution:**
1. Check execution instructions specify Write/Edit/Bash tools
2. Verify file paths are absolute:
   ```bash
   pwd  # Check current directory
   ```
3. Check file permissions:
   ```bash
   ls -la path/to/file
   ```
4. Ensure subagent has explicit instruction to use tools

**Problem: TDD cycle not enforced during execution**

**Symptoms:**
- Production code written before tests
- No RED phase verification
- Coverage gates not checked

**Root Cause:**
- EXECUTOR not invoked for implementation
- TDD instructions missing from subagent prompt

**Solution:**
1. Use EXECUTOR agent for fix implementation:
   ```bash
   /fix CLEAN-123  # Uses EXECUTOR with TDD enforcement
   ```
2. If using custom subagents, add TDD instructions:
   ```
   MANDATORY TDD CYCLE:
   1. Write failing test (RED)
   2. Minimal code to pass (GREEN)
   3. Refactor with tests passing (REFACTOR)
   ```
3. Add coverage verification to Phase 5:
   ```bash
   npm test -- --coverage --changedSince=HEAD~1
   ```

### Common Configuration Issues

**Problem: Environment variables not loaded**

**Symptoms:**
- `LINEAR_TEAM_ID` undefined
- `LINEAR_PROJECT_ID` undefined
- Cycle creation uses wrong team

**Solution:**
```bash
# Check current values
echo $LINEAR_TEAM_ID
echo $LINEAR_PROJECT_ID

# Set in current session
export LINEAR_TEAM_ID=ACO
export LINEAR_PROJECT_ID=your-project-id

# Set permanently in ~/.zshrc or ~/.bashrc
echo 'export LINEAR_TEAM_ID=ACO' >> ~/.zshrc
source ~/.zshrc
```

**Problem: MCP server not responding**

**Symptoms:**
- Linear commands timeout
- "MCP server unreachable" error
- Cycle creation fails

**Solution:**
```bash
# Check MCP configuration
cat .claude/mcp.json

# Test Linear MCP
mcp linear-server get_team --id=$LINEAR_TEAM_ID

# Restart Claude Code if needed
```

### Quick Diagnostic Commands

```bash
# Check cycle plan implementation
grep -r "Phase 4.5" .claude/commands/cycle.md

# Check cycle execute implementation
grep -r "Phase 5" .claude/commands/cycle.md

# Verify PLANNER functions
grep -A 5 "createLinearCycle\|verifySubagentWork" .claude/agents/planner.md

# Check environment
env | grep LINEAR

# Test E2E tests
npm test tests/e2e/cycle-plan.test.js
npm test tests/e2e/cycle-execute.test.js

# View recent test reports
cat tests/e2e/results/cycle-plan-e2e-report.json
cat tests/e2e/results/cycle-execute-e2e-report.json
```

### Getting Help

If issues persist after troubleshooting:

1. **Check E2E test results** for specific failures:
   ```bash
   npm test:e2e -- --verbose
   ```

2. **Review implementation docs**:
   - `.claude/docs/CYCLE-COMMAND-FIXES.md` - Complete implementation details
   - `.claude/agents/planner.md` - PLANNER agent specification
   - `.claude/commands/cycle.md` - Cycle command specification

3. **Run diagnostic commands** above to identify root cause

4. **File issue** with:
   - Error messages
   - Test results
   - Configuration values (sanitize sensitive data)
   - Output from diagnostic commands

## Quick Reference

| User Says                 | Command                               | What It Does                                    |
| ------------------------- | ------------------------------------- | ----------------------------------------------- |
| "Check my code"           | `/assess`                             | AUDITOR scans quality                           |
| "Create Linear tasks"     | `/linear`                             | STRATEGIST creates tasks from assessment        |
| "Fix CLEAN-123"           | `/fix CLEAN-123`                      | EXECUTOR implements with TDD                    |
| "Lint my code"            | `/lint`                               | LINTER auto-detects and lints all file types    |
| "Tests failing"           | `/recover`                            | GUARDIAN fixes pipeline                         |
| "Deploy v1.2.0"           | `/release 1.2.0`                      | STRATEGIST manages release with functional gate |
| "Plan sprint"             | `/cycle plan`                         | PLANNER capacity-based planning                 |
| "Check release readiness" | `npm run release:validate-functional` | Functional gate validation                      |

## Important Notes

- **TDD is mandatory** - enforced automatically by EXECUTOR
- **Functional gate blocks releases** - all implemented features need E2E tests
- **STRATEGIST manages Linear** - only agent with MCP access
- **Use parallel execution** - 5-10x faster for independent tasks
- **Prefer simplicity** - tools > workflows > agents
- **All changes need tests** - 80% diff coverage minimum
- **Fix packs are limited** - 300 LOC max, FIL-0/1 only

## System Version

**Version:** 1.4.0
**Features:**

- 23 specialized agents
- 7 autonomous journeys
- Functional release gate
- User story registry
- E2E validation
- Parallel execution
- Cycle planning
- Documentation automation

**Installation:** `.claude/install.sh`
**License:** MIT
