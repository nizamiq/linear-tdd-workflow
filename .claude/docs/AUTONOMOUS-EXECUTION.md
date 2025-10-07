# Autonomous Execution Guide

## Overview

The Linear TDD Workflow System is designed for **autonomous execution** within Claude Code. When you invoke slash commands (like `/assess`, `/fix`, `/cycle`), agents execute immediately without requiring manual Task tool invocations or step-by-step confirmation.

This document explains how the autonomous execution system works, what "autonomous" means in this context, and where human intervention is required.

## What is Autonomous Execution?

**Autonomous execution** means:

- ✅ Slash commands trigger immediate agent invocation
- ✅ Agents complete their full workflow without pausing
- ✅ No manual Task tool invocations required
- ✅ Human intervenes only at approval gates
- ✅ Agents make decisions within their scope automatically

**Autonomous execution does NOT mean**:

- ❌ No human oversight
- ❌ Bypassing safety checks
- ❌ Deploying to production without approval
- ❌ Making architectural decisions without review

## How It Works

### 1. Command Invocation

When a user invokes a slash command:

```bash
/assess --scope=src/api
```

Claude Code:

1. Reads `.claude/commands/assess.md`
2. Sees the "🤖 Execution Instructions for Claude Code" section
3. Follows the instructions to invoke the AUDITOR agent via Task tool
4. Passes parameters (scope, format, depth) to the agent

### 2. Agent Execution

The AUDITOR agent receives the Task tool invocation and:

1. Reads its specification from `.claude/agents/auditor.md`
2. Sees the "⚡ IMMEDIATE EXECUTION INSTRUCTIONS" section at the top
3. Begins execution immediately without asking for permission
4. Scans all files in scope using Glob and Read tools
5. Categorizes issues by severity
6. Generates comprehensive assessment report
7. Prepares Linear task definitions
8. Returns results to parent (Claude Code)

### 3. Result Presentation

Claude Code receives the agent's results and:

1. Displays quality report to user
2. Shows key metrics and findings
3. Asks user: "Would you like me to create Linear tasks for these findings?"
4. If user approves, invokes STRATEGIST agent to create tasks

## Execution Flow Diagrams

### /assess Command Flow

```
User: /assess
    ↓
Claude Code reads: .claude/commands/assess.md
    ↓
Execution Instructions: "Invoke AUDITOR immediately"
    ↓
Task tool invocation: subagent_type="AUDITOR"
    ↓
AUDITOR reads: .claude/agents/auditor.md
    ↓
Immediate Execution Section: "Begin scanning immediately"
    ↓
AUDITOR: Scans files → Categorizes issues → Generates report
    ↓
Returns to Claude Code
    ↓
Claude Code: Presents report to user
    ↓
[APPROVAL GATE] "Create Linear tasks?"
    ↓ (if yes)
Task tool invocation: subagent_type="STRATEGIST"
    ↓
STRATEGIST: Creates CLEAN-XXX tasks in Linear via MCP
    ↓
Returns task IDs to user
```

### /fix Command Flow

```
User: /fix CLEAN-123
    ↓
Claude Code reads: .claude/commands/fix.md
    ↓
Execution Instructions: "Retrieve task from Linear, then implement with TDD"
    ↓
[Step 1] Task tool: STRATEGIST retrieves CLEAN-123 from Linear
    ↓
[Step 2] Task tool: EXECUTOR implements with RED→GREEN→REFACTOR
    ↓
EXECUTOR reads: .claude/agents/executor.md
    ↓
Immediate Execution Instructions: "Execute TDD cycle autonomously"
    ↓
EXECUTOR: RED (failing test) → GREEN (minimal code) → REFACTOR (improve)
    ↓
EXECUTOR: Creates PR, links to Linear task
    ↓
Returns to Claude Code
    ↓
Claude Code: Shows TDD summary, PR link, coverage report
```

### /cycle Command Flow

```
User: /cycle plan
    ↓
Claude Code reads: .claude/commands/cycle.md
    ↓
Execution Instructions: "Execute all 4 phases autonomously"
    ↓
Task tool invocation: subagent_type="PLANNER"
    ↓
PLANNER reads: .claude/agents/planner.md
    ↓
Immediate Execution Instructions: "Execute Phase 1→2→3→4 without pausing"
    ↓
PLANNER Phase 1: Analysis (10 min, parallelized)
    ↓
PLANNER Phase 2: Planning (15 min)
    ↓
PLANNER Phase 3: Work Alignment (10 min)
    ↓
PLANNER Phase 4: Readiness Validation (5 min, parallelized)
    ↓
Returns comprehensive planning report
    ↓
Claude Code: Presents cycle plan to user
    ↓
[APPROVAL GATE] "Create Linear cycle with this plan?"
    ↓ (if yes)
Task tool: STRATEGIST creates/updates cycle in Linear
```

## Human Intervention Points

### Approval Gates (Required)

Human approval is **required** at these points:

1. **Linear Task Creation** (`/assess`)
   - After assessment complete
   - Before creating CLEAN-XXX tasks

2. **Linear Cycle Creation** (`/cycle plan`)
   - After planning complete
   - Before creating/updating cycle

3. **Production Deployment** (`/release`)
   - After pre-flight checks and functional gate
   - Before deploying to production

4. **Incident Creation** (`/recover`)
   - After recovery attempt
   - Before creating INCIDENT-XXX task (if enabled)

### NO Approval Required (Fully Autonomous)

These actions execute **without pausing**:

1. **Code Scanning** (`/assess`)
   - File reading and analysis
   - Issue categorization
   - Report generation

2. **TDD Implementation** (`/fix`)
   - RED phase (failing test)
   - GREEN phase (minimal code)
   - REFACTOR phase (improve design)
   - PR creation (automatic)

3. **Pipeline Recovery** (`/recover`)
   - Failure detection
   - Root cause analysis
   - Recovery strategy application
   - Revert PR creation (if enabled)

4. **Cycle Planning** (`/cycle`)
   - All 4 phases
   - Backlog analysis
   - Capacity calculation
   - Work selection

## Command Reference

### /assess - Autonomous Code Quality Assessment

**Human intervention**: Once (Linear task creation approval)

**Autonomous actions**:

- Scan all files in scope
- Categorize issues by severity
- Generate assessment report
- Prepare Linear task definitions

**Timeline**: 5-12 minutes
**Approval point**: Create Linear tasks?

### /fix - Autonomous TDD Implementation

**Human intervention**: None (PR creation automatic)

**Autonomous actions**:

- Retrieve task from Linear
- RED phase: Write failing test
- GREEN phase: Implement minimal solution
- REFACTOR phase: Improve code design
- Create PR with Linear task link

**Timeline**: 8-25 minutes (depends on complexity)
**Approval point**: None (PR requires review separately)

### /cycle - Autonomous Sprint Planning

**Human intervention**: Once (Linear cycle creation approval)

**Autonomous actions**:

- Phase 1: Analyze Linear state (parallelized)
- Phase 2: Score and select issues
- Phase 3: Create work queues
- Phase 4: Validate readiness (parallelized)

**Timeline**: 40 minutes with parallelization
**Approval point**: Create Linear cycle?

### /recover - Autonomous Pipeline Recovery

**Human intervention**: Once (incident creation, if enabled)

**Autonomous actions**:

- Detect pipeline failures
- Analyze root cause
- Apply recovery strategy
- Quarantine flaky tests
- Create revert PR (if needed)

**Timeline**: 10-15 minutes
**Approval point**: Create INCIDENT-XXX? (optional)

### /release - Semi-Autonomous Release Management

**Human intervention**: Once (production deployment approval)

**Autonomous actions**:

- Phase 1: Preparation (branch, version, changelog)
- Phase 2: Pre-flight checks
- Phase 2.5: Functional release gate validation
- Phase 3: UAT preparation
- **[PAUSE]** Phase 4: User approval required
- Phase 5: Deployment
- Phase 6: Post-deployment validation
- Phase 7: Cleanup

**Timeline**: 35-50 minutes (excluding UAT execution)
**Approval point**: Proceed with production deployment?

## Parallel Execution

The system uses parallel execution for maximum efficiency:

### AUDITOR Agent

For large codebases (>100k LOC):

- Analyzes codebase size using Bash commands
- **Partitions by directory** (e.g., src/api, src/ui, src/core, tests)
- **Launches parallel AUDITOR subagents via Task tool**:
  ```
  In a SINGLE message, makes multiple Task tool calls:
  - Task call 1: AUDITOR for src/api
  - Task call 2: AUDITOR for src/ui
  - Task call 3: AUDITOR for src/core
  - Task call 4: AUDITOR for tests
  ```
- Each subagent scans its scope independently
- Parent AUDITOR merges all results into unified report

**Critical**: All Task calls MUST be in a single message for concurrent execution

**Speedup**: 5-10x faster for independent scopes

### PLANNER Agent

**Phase 1 - Parallel Analysis**:

```
In a SINGLE message, makes 4 Task tool calls:
- Task call 1: general-purpose for cycle health
- Task call 2: SCHOLAR for velocity calculation
- Task call 3: AUDITOR for backlog analysis
- Task call 4: general-purpose for dependency mapping
```

Waits for all 4 to complete, then merges results

**Phase 4 - Parallel Validation**:

```
In a SINGLE message, makes 3 Task tool calls:
- Task call 1: GUARDIAN for pipeline health
- Task call 2: general-purpose for environment config
- Task call 3: general-purpose for quality gates
```

Waits for all 3 to complete, then merges results

**Critical**: All Task calls within each phase MUST be in a single message

**Speedup**: 2x overall planning time (40 min vs 80 min)

### EXECUTOR Agent

For batch fix implementations:

- STRATEGIST launches multiple EXECUTOR agents
- Each EXECUTOR implements one fix independently
- All follow strict TDD cycle

**Speedup**: 3-5x for independent fixes

## Troubleshooting

### Agent Not Executing Immediately

**Symptom**: Agent asks "should I start?" instead of executing

**Cause**: Immediate execution instructions not being read

**Fix**:

1. Check command file has "🤖 Execution Instructions" section
2. Check agent file has "⚡ IMMEDIATE EXECUTION INSTRUCTIONS" section
3. Ensure instructions are clear and directive

### Agent Pausing Between Phases

**Symptom**: Agent asks "proceed to Phase 2?" during workflow

**Cause**: Instructions not clear about autonomous execution

**Fix**:

1. Update instructions to say "execute all phases WITHOUT pausing"
2. Add "DO NOT ask permission between phases" to agent spec

### Approval Gate Skipped

**Symptom**: Linear tasks created without asking user

**Cause**: Command instructions missing approval gate step

**Fix**:

1. Add "Step 3: Pause for Approval" section to command
2. Ensure instructions say "Ask user: Would you like...?"

### Linear Operations Failing

**Symptom**: Error "Linear MCP not available" or "Permission denied"

**Cause**: Non-STRATEGIST agent trying to access Linear

**Fix**:

1. Ensure only STRATEGIST has linear-server in mcp_servers
2. Route all Linear operations through STRATEGIST
3. Update command to invoke STRATEGIST for Linear tasks

## Best Practices

### For Command Files

1. **Be Directive**: Use "Execute immediately" not "You can execute"
2. **Show Task Tool Usage**: Include exact Task tool invocation syntax
3. **Clear Approval Gates**: Explicitly mark human intervention points
4. **Expected Timeline**: Set expectations for execution time

### For Agent Files

1. **Immediate Section First**: Place "⚡ IMMEDIATE EXECUTION INSTRUCTIONS" right after YAML frontmatter
2. **Numbered Steps**: Provide clear sequential actions
3. **DO NOT List**: Explicitly state what NOT to do
4. **Execution Mode**: Clarify autonomous vs supervised behavior

### For Users

1. **Trust Agents**: Let agents complete workflows without interruption
2. **Review Approval Gates**: Carefully review before approving critical actions
3. **Monitor Progress**: Check agent output for completion status
4. **Provide Feedback**: Report issues if agents ask unnecessary questions

## Configuration

### Required Environment Variables

```bash
# Linear.app Integration (Required)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=your-team-id
LINEAR_PROJECT_ID=your-project-id  # Optional

# Agent Behavior (Optional)
ENABLE_AUTO_FIX=true
MAX_FIX_PACK_SIZE=300
MIN_DIFF_COVERAGE=80
MIN_MUTATION_SCORE=30
```

### MCP Server Configuration

Ensure Linear MCP server is configured in `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "linear-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-linear"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
```

## Performance SLAs

| Operation              | Target Time | With Parallelization |
| ---------------------- | ----------- | -------------------- |
| Code Assessment        | 8-12 min    | 5-8 min              |
| TDD Fix Implementation | 12-18 min   | N/A (sequential)     |
| Cycle Planning         | 80 min      | 40 min               |
| Pipeline Recovery      | 10-15 min   | N/A                  |
| Release Management     | 50 min      | N/A                  |

## Success Metrics

**Autonomous execution is working correctly when**:

- ✅ Slash commands trigger immediate agent execution
- ✅ No manual Task tool invocations needed
- ✅ Agents complete workflows without unnecessary pauses
- ✅ Human intervenes only at defined approval gates
- ✅ Execution times meet SLA targets
- ✅ Quality gates enforced automatically

**Autonomous execution needs improvement when**:

- ❌ Agents ask permission for standard operations
- ❌ User must manually invoke Task tool
- ❌ Workflows pause unexpectedly
- ❌ Approval gates bypassed or missing
- ❌ Execution times exceed SLAs significantly

## Related Documentation

- **Command Specifications**: `.claude/commands/` - All slash commands with execution instructions
- **Agent Specifications**: `.claude/agents/` - All agents with immediate execution sections
- **Parallel Execution**: `.claude/docs/PARALLEL-EXECUTION.md` - Detailed parallelization guide
- **TDD Enforcement**: `.claude/docs/TDD-REMINDER.md` - Strict TDD cycle requirements
- **Functional Release**: `.claude/docs/FUNCTIONAL-RELEASE.md` - Release gate validation

## Quick Reference

| User Action      | Agent      | Autonomous? | Approval Gate?               |
| ---------------- | ---------- | ----------- | ---------------------------- |
| `/assess`        | AUDITOR    | Yes         | Linear task creation         |
| `/fix CLEAN-123` | EXECUTOR   | Yes         | No (PR reviewed separately)  |
| `/cycle plan`    | PLANNER    | Yes         | Linear cycle creation        |
| `/recover`       | GUARDIAN   | Yes         | Incident creation (optional) |
| `/release 1.2.0` | STRATEGIST | Semi        | Production deployment        |
| `/learn`         | SCHOLAR    | Yes         | No                           |
| `/status`        | STRATEGIST | Yes         | No                           |

## Version

**System Version**: 1.5.0
**Documentation Updated**: 2025-10-03
**Key Feature**: Autonomous agent execution with immediate instructions
