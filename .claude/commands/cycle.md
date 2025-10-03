---
name: cycle
description: Automated sprint/cycle planning and management
agent: PLANNER
usage: "/cycle [plan|status|execute|review]"
allowed-tools: [Task, Read, Grep, Glob, Bash, mcp__linear-server__*]
argument-hint: "[plan|status|execute|review]"
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
---

# /cycle - Sprint/Cycle Planning Command

## Overview

Comprehensive cycle planning automation that analyzes backlog, calculates capacity, selects optimal work items, and prepares the team for sprint execution.

## Usage

```bash
/cycle plan      # Run full 4-phase planning workflow
/cycle status    # Check current cycle health and metrics
/cycle execute   # Begin cycle execution with prepared work
/cycle review    # Post-cycle retrospective and learning
```

## 🤖 Execution Instructions for Claude Code

**When user invokes `/cycle plan`, execute all 4 phases autonomously in a single workflow.**

### Step 1: Invoke PLANNER Agent for Full Cycle Planning
```
Use Task tool with:
- subagent_type: "PLANNER"
- description: "Execute complete cycle planning workflow (all 4 phases)"
- prompt: "You are the PLANNER agent. Execute the complete 4-phase cycle planning workflow autonomously:

**Phase 1: Comprehensive Linear State Analysis** (10 min with parallelization)
1. Use Linear MCP to fetch basic cycle data
2. **Launch 4 parallel analyzers using Task tool IN A SINGLE MESSAGE**:
   * Task tool call 1: subagent_type='general-purpose', task='Analyze current cycle health and metrics from Linear'
   * Task tool call 2: subagent_type='SCHOLAR', task='Calculate velocity from last 3 cycles'
   * Task tool call 3: subagent_type='AUDITOR', task='Analyze backlog composition and technical debt ratio'
   * Task tool call 4: subagent_type='general-purpose', task='Map dependencies and identify blockers'
3. Wait for all 4 parallel subagents to complete
4. Merge results into unified state analysis

**Phase 2: Intelligent Cycle Planning** (15 min)
6. Apply multi-factor scoring algorithm to all backlog issues:
   - Business value (0-10)
   - Technical complexity (0-10)
   - Risk level (0-10)
   - Dependencies (0-10)
   - Age in backlog (0-10)
7. Select optimal work items based on:
   - Available capacity
   - 30/70 technical debt/feature balance
   - Risk mitigation priorities
8. Generate recommended cycle composition

**Phase 3: Claude Code Work Alignment** (10 min)
9. Create work queues for agents:
   - EXECUTOR: Implementation tasks (FIL-0/1)
   - GUARDIAN: Pipeline and CI/CD tasks
   - AUDITOR: Quality review tasks
10. Map test coverage requirements to each task
11. Prepare pre-implementation analysis

**Phase 4: Execution Readiness Validation** (5 min with parallelization)
12. **Launch 3 parallel validators using Task tool IN A SINGLE MESSAGE**:
    * Task tool call 1: subagent_type='GUARDIAN', task='Validate CI/CD pipeline health'
    * Task tool call 2: subagent_type='general-purpose', task='Check environment configuration'
    * Task tool call 3: subagent_type='general-purpose', task='Verify quality gate status'
13. Wait for all 3 parallel validators to complete
14. Merge validation results
15. Generate comprehensive kickoff report
16. Return complete planning report to parent

Execute all 4 phases in sequence WITHOUT pausing between phases. Total runtime: ~40 minutes with parallelization.

CRITICAL FOR PARALLEL EXECUTION:
- In Phase 1: Send all 4 Task tool calls in a SINGLE message to run concurrently
- In Phase 4: Send all 3 Task tool calls in a SINGLE message to run concurrently
- Do NOT send Task calls in separate messages or they will run sequentially
- Wait for all parallel tasks to complete before proceeding to next phase"
```

### Step 2: Present Planning Report
After PLANNER completes:
- Display cycle composition (selected issues, effort estimates)
- Show capacity analysis (available vs planned hours)
- Present risk assessment
- Summarize work queue assignments
- Display pre-cycle checklist status

### Step 3: Pause for Approval (ONLY Human Intervention Point)
Ask user: "I've created a complete cycle plan with [N] issues totaling [M] hours. Would you like me to create/update the Linear cycle with this work?"

If user confirms:
- Invoke Task tool with subagent_type "STRATEGIST"
- STRATEGIST will create/update Linear cycle via MCP
- STRATEGIST will assign issues to cycle
- Report cycle URL back to user

### Alternative Subcommands

**`/cycle status`** - Quick health check (no execution required)
```
Use Task tool with:
- subagent_type: "PLANNER"
- description: "Generate current cycle status report"
- prompt: "Analyze current cycle progress, velocity, and blockers. Generate status report. Execute immediately."
```

**`/cycle review`** - Post-cycle retrospective
```
Use Task tool with:
- subagent_type: "PLANNER"
- description: "Generate cycle retrospective"
- prompt: "Analyze completed cycle: actual vs planned velocity, completed vs planned work, blocker impact. Extract learnings for SCHOLAR. Execute immediately."
```

### Completion Criteria
- ✅ All 4 phases completed sequentially
- ✅ Parallel execution used in Phases 1 and 4
- ✅ Comprehensive planning report generated
- ✅ Work queues prepared for all agents
- ✅ Readiness validation passed
- ✅ Linear cycle created/updated (if user approves)

### Expected Timeline
- **With Parallelization**: 40 minutes total
  - Phase 1: 10 min (parallel analysis)
  - Phase 2: 15 min (scoring and selection)
  - Phase 3: 10 min (work alignment)
  - Phase 4: 5 min (parallel validation)
- **Without Parallelization**: 80 minutes

**DO NOT:**
- Ask "should I proceed to Phase 2?" - execute all 4 phases automatically
- Wait for confirmation between phases - run sequentially
- Skip parallel execution opportunities - use them in Phases 1 and 4
- Ask to create Linear cycle before showing plan - present plan first, then ask

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
Begin cycle execution:
- Activate work queues for agents
- Initialize tracking dashboards
- Set up monitoring alerts
- Start daily standup automation

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

## Parallel Execution Support

The PLANNER agent leverages **parallel execution** in Phases 1 and 4 for dramatic speedup:

**Phase 1: Analysis (Parallelized)**
```bash
# Sequential approach (slow)
- Cycle health analysis: 10 min
- Velocity calculation: 10 min
- Backlog assessment: 10 min
- Dependency mapping: 10 min
# Total: 40 minutes

# Parallel approach (fast)
# PLANNER launches 4 analyzers concurrently
# Total: ~10 minutes (4x speedup)
```

**Phase 4: Validation (Parallelized)**
```bash
# Sequential approach (slow)
- Pipeline validation: 5 min
- Environment checks: 5 min
- Report generation: 5 min
# Total: 15 minutes

# Parallel approach (fast)
# PLANNER launches 3 validators concurrently
# Total: ~5 minutes (3x speedup)
```

**Overall Performance Improvement:**
- **Without parallelization**: 80 minutes (40+15+10+15)
- **With parallelization**: 40 minutes (10+15+10+5)
- **Speedup**: 2x faster

**How It Works:**
1. PLANNER detects independent analysis tasks in Phase 1
2. Launches parallel subagents via Task tool (max 10)
3. Agents analyze different aspects concurrently:
   - Cycle health (SCHOLAR)
   - Velocity trends (SCHOLAR)
   - Backlog composition (AUDITOR)
   - Dependencies (general-purpose)
4. Results merge into unified planning report
5. Phase 4 repeats parallel pattern for validation

**Automatic Parallelization:**
The PLANNER automatically uses parallel execution when:
- Backlog has >50 issues
- Multiple teams involved
- Complex dependency graphs
- Large codebases requiring assessment

See `.claude/docs/PARALLEL-EXECUTION.md` and `.claude/agents/planner.md` for implementation details.

## Performance SLAs

- Planning execution (sequential): < 80 minutes
- Planning execution (parallel): < 40 minutes ⚡
- Status check: < 2 minutes
- Review generation: < 10 minutes
- API calls: < 100 per planning run

## Related Commands

- `/assess` - Run code quality assessment before planning
- `/status` - Check system health and readiness
- `/fix TASK-ID` - Execute selected work items
- `/release` - Deploy completed cycle work