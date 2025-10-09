---
name: cycle
description: Automated sprint/cycle planning and management using orchestrator-workers pattern
agent: PLANNER
execution_mode: CONTEXT_DEPENDENT # plan/status use ORCHESTRATOR, execute uses DIRECT
usage: '/cycle [plan|status|execute|review]'
parameters:
  - name: subcommand
    description: Cycle planning operation
    type: string
    options: [plan, status, execute, review]
    required: false
    default: plan
supporting_agents:
  - STRATEGIST
  - AUDITOR
  - SCHOLAR
  - GUARDIAN
- EXECUTOR
subprocess_usage: CONTEXT_DEPENDENT # ⚠️ plan/status use READ_ONLY, execute uses DIRECT
---

# /cycle - Sprint/Cycle Planning Command

## ⚠️ IMPORTANT: Execution Patterns by Subcommand

This command uses different execution patterns depending on the subcommand:

### For `/cycle plan` and `/cycle status` (Analysis Mode):

Uses the **ORCHESTRATOR mode** where:

- **Main agent (PLANNER)** orchestrates workflow and makes decisions in main context
- **Worker subprocesses** perform READ-ONLY analysis tasks (fetch data, calculate metrics)
- **NO subprocess writes** - all Linear updates happen in main context

**Safe subprocess usage (READ-ONLY):**

- ✅ Fetching Linear issues and cycles
- ✅ Analyzing git history
- ✅ Calculating metrics and scoring
- ✅ Generating recommendations

**Prohibited in subprocesses (WRITE operations):**

- ❌ Creating Linear cycles
- ❌ Updating issue states
- ❌ Making git commits
- ❌ Creating PRs

**Rule:** Subprocesses return DATA, main context makes CHANGES.

### For `/cycle execute` (Execution Mode):

Uses **DIRECT mode** where:

- **Main agent (PLANNER)** performs work directly in main context
- **NO subprocess deployment** - all work happens in main context where changes persist
- **Direct tool usage** - Read, Write, Edit, Bash tools affect actual workspace
- **Real work is performed** - files are modified, PRs are created, tasks are updated

**Critical for `/cycle execute`:**

- ✅ Use Read/Write/Edit tools directly to modify files
- ✅ Use Bash commands directly to make git commits
- ✅ Create PRs directly using available tools
- ✅ Update Linear tasks directly with MCP
- ✅ Verify work persists with actual tool output

**ABSOLUTELY FORBIDDEN for `/cycle execute`:**

- ❌ DO NOT use Task tool to spawn subagents for implementation work
- ❌ DO NOT provide "instructions and plans" instead of actual work
- ❌ DO NOT report "agents deployed" without real tool output
- ❌ DO NOT create theoretical implementation guides

**KEY DISTINCTION:**

- `/cycle plan` = Analyze and plan (READ-ONLY subprocess workers)
- `/cycle execute` = Direct execution in main context (NO subprocesses for work)

## Overview

Comprehensive cycle planning automation that analyzes backlog, calculates capacity, selects optimal work items, and prepares the team for sprint execution.

## 🤖 Execution Instructions for Claude Code

When user invokes `/cycle [subcommand]`:

1. **Read command parameters** from user input
2. **DETERMINE EXECUTION MODE** based on subcommand:
   - `/cycle plan` or `/cycle status` → Use **ORCHESTRATOR mode**
   - `/cycle execute` → Use **DIRECT mode**
   - `/cycle review` → Use **ORCHESTRATOR mode**
3. **EXECUTE ACCORDINGLY**:
   - **ORCHESTRATOR mode**: Invoke PLANNER agent via Task tool (spawns READ-ONLY workers)
   - **DIRECT mode**: Claude Code executes work directly using available tools
4. **Wait for results** and present to user
5. **Handle approval gates** only for Linear operations

**CRITICAL for `/cycle execute`:**
- DO NOT invoke PLANNER via Task tool (would create subprocess)
- Claude Code must execute work DIRECTLY using Read/Write/Edit/Bash tools
- Follow the DIRECT execution instructions in the PLANNER agent file

**DO NOT ask for permission** - Execute according to the determined mode.

## Usage

```bash
/cycle plan      # Run full 4-phase planning workflow
/cycle status    # Check current cycle health and metrics
/cycle execute   # Begin cycle execution with prepared work
/cycle review    # Post-cycle retrospective and learning
```

## Subcommands

### `/cycle plan`

Executes the complete 4-phase planning workflow:

**Phase 1: Comprehensive Linear State Analysis (10 min)**

- Current cycle velocity and health metrics
- Backlog composition and depth analysis
- Dependency mapping and blocker identification
- Team capacity calculation

**Phase 2: Intelligent Cycle Planning (15 min)**

- Multi-factor issue scoring algorithm
- Optimal work selection based on capacity
- Technical debt vs feature balancing (30/70)
- Risk mitigation prioritization

**Phase 3: Claude Code Work Alignment (10 min)**

- Work queue generation for agents
- Pre-implementation analysis
- Test coverage requirement mapping
- Task assignment optimization

**Phase 4: Execution Readiness (5 min)**

- CI/CD pipeline validation
- Environment configuration checks
- Quality gate verification
- Kickoff report generation

### `/cycle status`

Quick health check of current cycle:

- Progress against planned work
- Velocity tracking vs historical
- Blocker and risk identification
- Remaining capacity analysis

### `/cycle execute`

**DEPLOY SUBAGENTS IN MAIN CONTEXT - NOT SUBPROCESSES**

Deploy subagents that can persist work to the user's workspace:

1. **Retrieve current cycle** from Linear MCP
2. **Identify ready work items** (Backlog/Todo/Ready status)
3. **DEPLOY SUBAGENTS via Task tool** to execute work:
   - Use `Task({ subagent_type: "executor", ... })` for fixes
   - Use `Task({ subagent_type: "guardian", ... })` for CI/CD
   - Use `Task({ subagent_type: "auditor", ... })` for quality checks
4. **VERIFY subagent work** by checking actual tool output:
   - Files were actually created/modified
   - Git commits have real hashes
   - Tests actually pass/fail
   - Linear tasks actually updated
5. **REPORT ONLY VERIFIED WORK** - no simulations or analyses

**CRITICAL**: Subagents run in main context where their work persists, NOT in isolated subprocesses.

**ABSOLUTELY FORBIDDEN**:

- ❌ Reporting "analyses and simulations"
- ❌ Describing work without showing actual tool output
- ❌ Saying "agents were deployed" without actual Task tool results

### `/cycle review`

Post-cycle analysis and learning:

- Actual vs planned velocity
- Completed vs planned work
- Blocker impact analysis
- Pattern extraction for SCHOLAR

## Output Format

### Planning Report

```markdown
# Cycle Planning Report - Sprint 2024.Q1.3

## Metrics

- Available Capacity: 320 hours
- Selected Issues: 18
- Estimated Effort: 285 hours
- Technical Debt Ratio: 33%

## Selected Work Items

### Critical Path (Must Complete)

1. [TASK-123] Authentication refactor (21 points)
2. [BUG-456] Payment processing fix (13 points)

### Technical Debt

1. [DEBT-789] Test coverage gaps (8 points)
2. [DEBT-101] Legacy API cleanup (13 points)

### Features

1. [FEAT-234] User dashboard v2 (34 points)
2. [FEAT-567] Export functionality (21 points)

## Risk Assessment

- High: Payment system dependencies
- Medium: Third-party API changes
- Low: Minor UI updates

## Pre-Cycle Checklist

✅ CI/CD pipeline healthy
✅ Test suites passing (98.2%)
✅ Environments configured
✅ Team availability confirmed

## Work Queue Assignments

- EXECUTOR: 12 implementation tasks
- GUARDIAN: 3 pipeline fixes
- AUDITOR: 3 quality reviews
```

### Status Report

```markdown
# Cycle Status - Day 5 of 10

## Progress

- Completed: 8/18 issues (44%)
- In Progress: 4 issues
- Blocked: 1 issue
- Not Started: 5 issues

## Velocity

- Current: 67 points/day
- Required: 71 points/day
- Historical: 69 points/day

## Alerts

⚠️ TASK-456 blocked by external dependency
⚠️ Behind schedule by 0.5 days
```

## Agent Coordination

The command coordinates multiple agents:

1. **PLANNER** (Primary)
   - Orchestrates entire workflow
   - Runs scoring algorithms
   - Generates reports

2. **STRATEGIST**
   - Linear API operations
   - Issue updates and assignments
   - Cycle configuration

3. **AUDITOR**
   - Technical debt assessment
   - Quality metrics gathering
   - Risk evaluation

4. **SCHOLAR**
   - Historical pattern analysis
   - Velocity calculation
   - Learning extraction

5. **GUARDIAN**
   - CI/CD health validation
   - Environment checks
   - Pipeline readiness

## Configuration

### Required Settings

```bash
# .env configuration
LINEAR_TEAM_ID=your-team-id
LINEAR_API_KEY=your-api-key
CYCLE_PLANNING_MODE=auto  # auto|semi|manual
VELOCITY_LOOKBACK=3       # cycles to analyze
TECH_DEBT_RATIO=0.3       # 30% technical debt target
```

### Optional Settings

```bash
CYCLE_DURATION_DAYS=14    # Sprint length
FOCUS_FACTOR=0.7          # Team availability
BUFFER_PERCENTAGE=0.15    # Capacity buffer
AUTO_ASSIGN=true          # Automatic task assignment
```

## Integration Points

### Linear

- Reads: Issues, cycles, projects, team members
- Writes: Issue updates, cycle composition, assignments

### GitHub

- Reads: PR history, code metrics, test coverage
- Writes: None (read-only for planning)

### CI/CD

- Reads: Pipeline status, test results, deployment history
- Writes: None (validation only)

## Error Handling

### Common Issues

**Insufficient Capacity**

```
Warning: Selected work (320h) exceeds capacity (280h)
Recommended actions:
1. Defer 2 low-priority items
2. Reduce scope of FEAT-234
3. Add team member capacity
```

**Blocked Dependencies**

```
Error: Critical path blocked by external team
Affected issues: TASK-123 → TASK-456 → TASK-789
Resolution: Escalating to Engineering Manager
```

**Linear API Limits**

```
Warning: Approaching API rate limit (950/1000)
Switching to cached data for non-critical queries
```

## Best Practices

1. **Run planning 2 days before cycle start**
   - Allows time for clarification
   - Enables pre-work preparation

2. **Review with team before execution**
   - Validate assignments
   - Confirm availability
   - Address concerns

3. **Monitor daily during cycle**
   - Track velocity trends
   - Identify blockers early
   - Adjust scope if needed

4. **Always run review after cycle**
   - Capture learnings
   - Update velocity calculations
   - Improve planning accuracy

## Performance SLAs

- Planning execution: < 40 minutes
- Status check: < 2 minutes
- Review generation: < 10 minutes
- API calls: < 100 per planning run

## Related Commands

- `/assess` - Run code quality assessment before planning
- `/status` - Check system health and readiness
- `/fix TASK-ID` - Execute selected work items
- `/release` - Deploy completed cycle work
