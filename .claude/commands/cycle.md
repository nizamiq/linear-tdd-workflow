---
name: cycle
description: Automated sprint/cycle planning and management using orchestrator-workers pattern for parallel execution
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
  - PLANNER (data processor)
  - STRATEGIST (Linear operations)
  - AUDITOR (backlog analysis)
  - SCHOLAR (velocity calculation)
  - GUARDIAN (pipeline validation)
---

# /cycle - Sprint/Cycle Planning Command

## Overview

Comprehensive cycle planning automation using **orchestrator-workers pattern** where YOU (main agent) orchestrate parallel execution and delegate data processing to PLANNER.

**CRITICAL ARCHITECTURE CHANGE:** Subagents spawned via Task tool CANNOT spawn more subagents. Therefore:
- **YOU orchestrate** (spawn parallel workers via Task tool)
- **PLANNER processes** (analyzes data using available tools)

## Usage

```bash
/cycle plan      # Run full 4-phase planning workflow (YOU orchestrate)
/cycle status    # Quick cycle health check
/cycle execute   # Begin cycle execution
/cycle review    # Post-cycle retrospective
```

## 🤖 Execution Instructions for Claude Code

**When user invokes `/cycle plan`, execute all 4 phases autonomously. YOU are the orchestrator.**

### **PHASE 1: Comprehensive Linear State Analysis (10 min)**

**YOU spawn 4 parallel analyzers DIRECTLY using Task tool in a SINGLE message:**

#### Task Call 1 - Current Cycle Health
```
Use Task tool with:
- subagent_type: "general-purpose"
- description: "Analyze current cycle health and metrics"
- prompt: "Use Linear MCP to analyze current cycle state:

1. Get current cycle: mcp__linear-server__list_cycles with teamId from injected config
2. If no current cycle exists, return: {status: 'no_active_cycle'}
3. If cycle exists:
   - Get all issues in cycle: mcp__linear-server__list_issues filtered by cycle
   - Calculate completion rate: (completed issues / total issues) * 100
   - Calculate current velocity: completed points / days elapsed
   - Identify at-risk issues (due soon, high priority, incomplete)
4. Return JSON: {cycle_id, cycle_name, completion_rate, current_velocity, at_risk_count, total_issues, completed_issues, days_elapsed, days_remaining, status}

Use available tools: Linear MCP only. Do NOT try to spawn subagents."
```

#### Task Call 2 - Historical Velocity
```
Use Task tool with:
- subagent_type: "SCHOLAR"
- description: "Calculate team velocity from last 3 cycles"
- prompt: "Calculate historical velocity trends using Linear MCP:

1. Get last 3 completed cycles: mcp__linear-server__list_cycles with teamId from injected config
2. For each cycle, get completed issues and calculate points
3. Calculate average velocity: sum(points) / sum(days)
4. Determine trend: increasing (>10% improvement), stable (±10%), or decreasing (<-10%)
5. Calculate confidence level based on consistency

Return JSON: {avg_velocity_points_per_day, last_3_velocities, trend, confidence_level, historical_data}

Use available tools: Linear MCP, sequential-thinking for analysis. Do NOT spawn subagents."
```

#### Task Call 3 - Backlog Analysis
```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Analyze backlog composition and technical debt ratio"
- prompt: "Assess backlog using Linear MCP:

1. Get all backlog issues: mcp__linear-server__list_issues with teamId, NO cycle filter
2. Categorize by labels/tags: Features, Technical debt, Bugs
3. Analyze priority distribution: urgent/high/medium/low
4. Calculate technical debt ratio: tech_debt_issues / total_issues
5. Identify top priorities (urgent + high priority issues)

Return JSON: {total_issues, by_type, by_priority, tech_debt_ratio, top_priorities}

Use available tools: Linear MCP only. Do NOT spawn subagents."
```

#### Task Call 4 - Dependency Mapping
```
Use Task tool with:
- subagent_type: "general-purpose"
- description: "Map issue dependencies and identify blockers"
- prompt: "Identify dependencies and blockers using Linear MCP:

1. Get all issues with parent/child relationships: mcp__linear-server__list_issues with teamId
2. Build dependency graph: which issues have parent dependencies, which block others
3. Identify blocked issues (cannot start until dependencies resolve)
4. Find circular dependencies if any (A blocks B blocks A)
5. Calculate critical path length (longest dependency chain)

Return JSON: {blocked_issues_count, blocking_issues, critical_path_length, circular_deps, dependency_summary}

Use available tools: Linear MCP, sequential-thinking. Do NOT spawn subagents."
```

**CRITICAL:** Send all 4 Task calls in a SINGLE message to run concurrently. Wait for all 4 results before proceeding.

---

### **PHASE 2: Intelligent Cycle Planning (15 min)**

After receiving all 4 Phase 1 results, invoke PLANNER with the data:

```
Use Task tool with:
- subagent_type: "PLANNER"
- description: "Analyze data and generate optimal cycle plan"
- prompt: "You are PLANNER. Analyze this pre-fetched data and generate cycle plan:

**Phase 1 Results:**

Current Cycle Health:
[Insert JSON from Task 1]

Historical Velocity:
[Insert JSON from Task 2]

Backlog Analysis:
[Insert JSON from Task 3]

Dependencies:
[Insert JSON from Task 4]

**Your Tasks:**

1. Apply multi-factor scoring algorithm to all backlog issues:
   - Business value (0-10 from Linear priority)
   - Technical complexity (0-10 from estimates)
   - Risk level (0-10 from dependencies)
   - Age in backlog (0-10 from created date)

2. Select optimal work items based on:
   - Available capacity (from velocity calculation)
   - 30/70 technical debt/feature balance
   - Risk mitigation priorities

3. Generate recommended cycle composition with:
   - Selected issues (IDs, titles, estimates)
   - Total effort hours
   - Technical debt ratio
   - Risk assessment

4. Create work queues for agents:
   - EXECUTOR: Implementation tasks (FIL-0/1 only)
   - GUARDIAN: Pipeline and CI/CD tasks
   - AUDITOR: Quality review tasks

5. Return comprehensive planning report

**Available Tools:** Linear MCP (for additional queries), Bash, Read, Grep
**Do NOT:** Try to spawn subagents via Task tool (you don't have access)"
```

---

### **PHASE 3: Claude Code Work Alignment (5 min)**

YOU process PLANNER's recommendations:
1. Extract work queue assignments from PLANNER report
2. Map test coverage requirements to each task
3. Prepare pre-implementation analysis
4. Format for presentation

No Task tool calls needed - process PLANNER output directly.

---

### **PHASE 4: Execution Readiness Validation (5 min)**

**YOU spawn 3 parallel validators DIRECTLY using Task tool in a SINGLE message:**

#### Task Call 1 - Pipeline Validation
```
Use Task tool with:
- subagent_type: "GUARDIAN"
- description: "Validate CI/CD pipeline health"
- prompt: "Check pipeline status:

1. Use Bash: gh run list --limit 10 --json status,conclusion
2. Identify failing or flaky tests
3. Verify latest build passed
4. Check for deployment readiness

Return JSON: {status, last_10_runs, failures, flaky_tests, deployment_ready}

Use available tools: Bash, Grep. Do NOT spawn subagents."
```

#### Task Call 2 - Environment Check
```
Use Task tool with:
- subagent_type: "general-purpose"
- description: "Validate environment configuration readiness"
- prompt: "Check environment readiness:

1. Verify required env vars: LINEAR_TEAM_ID, LINEAR_API_KEY (use Bash to check .env)
2. Check dependency versions: npm list --depth=0
3. Validate test suite health: npm test -- --listTests
4. Check disk space and resources

Return JSON: {env_status, missing_vars, outdated_deps, test_suite_health, resources_ok}

Use available tools: Bash, Read. Do NOT spawn subagents."
```

#### Task Call 3 - Quality Gates
```
Use Task tool with:
- subagent_type: "general-purpose"
- description: "Verify quality gate status"
- prompt: "Validate quality gates:

1. Check test coverage: npm test -- --coverage --silent
2. Verify linting passes: npm run lint:check
3. Check type safety: npm run typecheck
4. Verify build succeeds: npm run build

Return JSON: {coverage_percent, lint_errors, type_errors, build_status, gates_passing}

Use available tools: Bash. Do NOT spawn subagents."
```

**CRITICAL:** Send all 3 Task calls in a SINGLE message to run concurrently. Wait for all 3 results.

---

### **FINAL STEP: Present Planning Report**

After all phases complete:

1. **Synthesize Results:**
   - Merge Phase 1 analysis data
   - Include PLANNER's cycle recommendations (Phase 2)
   - Add work queue assignments (Phase 3)
   - Include validation results (Phase 4)

2. **Present to User:**
   - Display cycle composition (selected issues, effort estimates)
   - Show capacity analysis (available vs planned hours)
   - Present risk assessment
   - Summarize work queue assignments
   - Display pre-cycle checklist status

3. **Pause for Approval (ONLY Human Intervention Point):**

Ask user: "I've created a complete cycle plan with [N] issues totaling [M] hours. Would you like me to create/update the Linear cycle with this work?"

If user confirms:
```
Use Task tool with:
- subagent_type: "STRATEGIST"
- description: "Create/update Linear cycle with selected work"
- prompt: "You are STRATEGIST. Create Linear cycle:

Selected Issues: [list from PLANNER]
Cycle Duration: [calculated]
Team ID: [from injected config]

1. Create or update cycle in Linear
2. Assign selected issues to cycle
3. Update issue states to 'Ready for Development'
4. Return cycle URL and summary

Use Linear MCP. Complete autonomously."
```

---

## Alternative Subcommands

### `/cycle status` - Quick Health Check

```
Use Task tool with:
- subagent_type: "general-purpose"
- description: "Generate current cycle status report"
- prompt: "Analyze current cycle progress using Linear MCP:

1. Get current cycle and all issues
2. Calculate completion percentage
3. Compare actual vs planned velocity
4. Identify blockers

Return status report with progress metrics."
```

### `/cycle review` - Post-Cycle Retrospective

```
Use Task tool with:
- subagent_type: "PLANNER"
- description: "Generate cycle retrospective"
- prompt: "Analyze completed cycle using Linear MCP:

1. Get completed cycle data
2. Calculate actual vs planned velocity
3. Analyze completed vs planned work
4. Assess blocker impact
5. Extract learnings for SCHOLAR

Return retrospective report."
```

---

## Completion Criteria

- ✅ All 4 phases completed sequentially
- ✅ Phase 1: 4 parallel analyzers spawned by YOU (not PLANNER)
- ✅ Phase 2: PLANNER analyzes data (doesn't spawn subagents)
- ✅ Phase 3: Work queues created
- ✅ Phase 4: 3 parallel validators spawned by YOU
- ✅ Comprehensive planning report presented
- ✅ Linear cycle created/updated (if user approves)

## Expected Timeline

- **With Parallelization (Correct Architecture)**: 40 minutes total
  - Phase 1: 10 min (4 parallel analyzers)
  - Phase 2: 15 min (PLANNER analysis)
  - Phase 3: 5 min (work queue creation)
  - Phase 4: 5 min (3 parallel validators)
  - Final: 5 min (report synthesis)

- **Without Parallelization (Sequential)**: 80 minutes

- **Simulation (Broken Architecture)**: 24 seconds (WRONG - not actually executing)

## Performance SLAs

- Planning execution with parallelization: < 45 minutes
- Status check: < 2 minutes
- Review generation: < 10 minutes
- API calls: < 100 per planning run

## Related Commands

- `/assess` - Run code quality assessment before planning
- `/status` - Check system health and readiness
- `/fix TASK-ID` - Execute selected work items
- `/release` - Deploy completed cycle work
