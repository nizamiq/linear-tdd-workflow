---
name: cycle
description: Automated sprint/cycle planning and management using orchestrator-workers pattern
agent: PLANNER
execution_mode: CONTEXT_DEPENDENT # plan/status use READ_ONLY subagents, execute uses WRITE subagents
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
subagent_usage: CONTEXT_DEPENDENT # ⚠️ plan/status use READ_ONLY subagents, execute uses WRITE subagents
---

# /cycle - Sprint/Cycle Planning Command

## ⚠️ IMPORTANT: Execution Patterns by Subcommand

This command uses different execution patterns depending on the subcommand:

### For `/cycle plan` and `/cycle status` (Analysis Mode):

Uses **READ-ONLY subagents** where:

- **Main agent (PLANNER)** orchestrates workflow and makes decisions
- **Worker subagents** perform READ-ONLY analysis tasks via Task tool
- **Subagents fetch and analyze data** - return results to orchestrator
- **PLANNER makes all state changes** in main context (Linear updates, etc.)

**Subagent responsibilities (READ-ONLY):**

- ✅ Fetching Linear issues and cycles (read operations)
- ✅ Analyzing git history (read operations)
- ✅ Calculating metrics and scoring (analysis)
- ✅ Generating recommendations (analysis)

**Reserved for main context (WRITE operations):**

- ❌ Creating Linear cycles (orchestrator does this)
- ❌ Updating issue states (orchestrator does this)
- ❌ Making git commits (not needed for analysis)
- ❌ Creating PRs (not needed for analysis)

**Rule:** Worker subagents return DATA, orchestrator makes CHANGES.

## Overview

Comprehensive cycle planning automation that analyzes backlog, calculates capacity, selects optimal work items, and prepares the team for sprint execution.

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

**Phase 4.5: Linear Cycle Creation (Approval Gate)**

After generating the plan, PLANNER will:

1. **Present Plan** to user with selected work items, capacity analysis, and technical debt ratio
2. **ASK FOR APPROVAL**: "Would you like me to create this cycle in Linear?"
3. **On approval**:
   - Create Linear cycle using `mcp__linear-server__create_cycle()`
   - Add selected issues to cycle using `mcp__linear-server__update_issue()`
   - Return cycle ID and Linear URL
4. **On rejection**: Save plan to file for manual review

**Implementation Notes:**

- Use environment variable `LINEAR_TEAM_ID` or dynamic team discovery
- Create cycle first, then add issues one by one
- If failure occurs, report partial success with cycle ID
- Batch issue updates (5 at a time) with 200ms delays between batches

### `/cycle status`

**Comprehensive cycle health check with work verification:**

#### Phase 1: Linear Cycle Data Collection

1. **Query current cycle** from Linear MCP:
   ```javascript
   mcp__linear-server__list_cycles({ team: LINEAR_TEAM_ID, state: "started" })
   ```

2. **Fetch all cycle issues** with current status:
   ```javascript
   mcp__linear-server__list_issues({
     team: LINEAR_TEAM_ID,
     cycle: currentCycleId
   })
   ```

3. **Categorize issues by status**:
   - Backlog: Not started
   - Todo: Planned but not started
   - In Progress: Actively being worked on
   - In Review: Awaiting review
   - Done: Claimed as complete

#### Phase 2: Work Completion Verification (MANDATORY)

**CRITICAL**: Do NOT trust Linear status alone - verify actual work exists.

For each issue marked "In Progress" or "Done", run ground truth verification:

**Verification Function:**

```javascript
async function verifyCycleWork(issueId, issueStatus) {
  const verifications = {
    issueId: issueId,
    status: issueStatus,
    branchExists: false,
    commitsExist: false,
    prExists: false,
    testsModified: false,
    verified: false,
    evidence: {}
  };

  // 1. Check for feature branch
  const branchPattern = `*${issueId}*`;
  const branchCheck = await Bash({
    command: `git branch -a --list ${branchPattern}`,
    ignoreError: true
  });
  verifications.branchExists = branchCheck.stdout.trim().length > 0;
  verifications.evidence.branch = branchCheck.stdout;

  // 2. Check for commits mentioning issue
  const gitLog = await Bash({
    command: `git log --all --oneline --grep="${issueId}" -10`,
    ignoreError: true
  });
  verifications.commitsExist = gitLog.stdout.trim().length > 0;
  verifications.evidence.commits = gitLog.stdout;

  // 3. Check for PR with issue ID
  const prCheck = await Bash({
    command: `gh pr list --search "${issueId}" --state all --json number,title,state 2>&1`,
    ignoreError: true
  });
  verifications.prExists = !prCheck.stdout.includes("no pull requests");
  verifications.evidence.pr = prCheck.stdout;

  // 4. Check for test modifications (if applicable)
  if (verifications.commitsExist) {
    const testChanges = await Bash({
      command: `git log --all --oneline --grep="${issueId}" -- "*test*" "*spec*" -5`,
      ignoreError: true
    });
    verifications.testsModified = testChanges.stdout.trim().length > 0;
    verifications.evidence.tests = testChanges.stdout;
  }

  // Determine verification status
  if (issueStatus === "Done") {
    // Done tasks MUST have: commits, PR, and tests
    verifications.verified =
      verifications.commitsExist &&
      verifications.prExists &&
      verifications.testsModified;
  } else if (issueStatus === "In Progress") {
    // In Progress tasks MUST have: branch or commits
    verifications.verified =
      verifications.branchExists ||
      verifications.commitsExist;
  }

  return verifications;
}
```

**Verification Report:**

For each issue, generate verification status:

```markdown
## Work Verification Results

### Done Tasks

✅ CLEAN-123: "Fix authentication bug"
- Status: Done ✅
- Branch: feature/CLEAN-123-fix-auth (verified)
- Commits: 3 commits found (a1b2c3d, e4f5g6h, i7j8k9l)
- PR: #456 (merged)
- Tests: Modified auth.test.ts
- **VERIFIED**: All evidence present ✅

❌ CLEAN-124: "Update API documentation"
- Status: Done ❌ (CLAIMED BUT NOT VERIFIED)
- Branch: NOT FOUND ❌
- Commits: NOT FOUND ❌
- PR: NOT FOUND ❌
- Tests: N/A
- **UNVERIFIED**: No evidence of work ❌

### In Progress Tasks

✅ CLEAN-125: "Refactor data layer"
- Status: In Progress ✅
- Branch: feature/CLEAN-125-refactor (verified)
- Commits: 1 commit found (partial)
- PR: NOT YET
- Tests: In progress
- **VERIFIED**: Work started ✅

⚠️ CLEAN-126: "Add error handling"
- Status: In Progress ⚠️
- Branch: NOT FOUND
- Commits: NOT FOUND
- PR: NOT FOUND
- **UNVERIFIED**: No evidence of work started ⚠️
```

#### Phase 3: Status Report Generation

Generate comprehensive status report including:

**1. Progress Metrics:**
- Completed (verified): X/Y issues
- In Progress (verified): X/Y issues
- Not Started: X issues
- **Unverified claims**: X issues ❌

**2. Velocity Tracking:**
- Current velocity (verified points only)
- Required velocity to complete
- Historical velocity comparison
- **Discrepancy**: Claimed vs verified points

**3. Blocker Identification:**
- External dependency blockers
- Technical blockers (failing tests, etc.)
- **Verification blockers**: Tasks claiming "Done" without evidence

**4. Remaining Capacity:**
- Days remaining in cycle
- Points remaining (verified only)
- Recommended actions

**5. Health Score:**

```
Cycle Health: 78/100

Breakdown:
- Progress: 85/100 (on track)
- Velocity: 75/100 (slightly behind)
- Verification: 65/100 ⚠️ (3 unverified claims)
- Blockers: 90/100 (minimal)
```

#### Phase 4: Alert Generation

**Critical Alerts:**

```
🚨 CRITICAL: 2 tasks marked "Done" have NO verified work
   - CLEAN-124: No branch, commits, or PR found
   - CLEAN-127: No commits or tests found

   Action required: Verify actual completion or update status

⚠️ WARNING: 1 task marked "In Progress" has NO verified work
   - CLEAN-126: No branch or commits found

   Action recommended: Confirm work actually started
```

**Informational Alerts:**

```
ℹ️ INFO: Cycle 33% complete (verified)
ℹ️ INFO: On track to complete 80% of planned work
```

#### Phase 5: Recommendations

Based on verification results, provide actionable recommendations:

**If unverified claims found:**

```
Recommendations:

1. Review unverified "Done" tasks:
   - CLEAN-124, CLEAN-127
   - Update status to actual state
   - Create evidence (commits, PRs, tests)

2. Check stalled "In Progress" tasks:
   - CLEAN-126 has no commits after 3 days
   - May need reassignment or unblocking

3. Adjust velocity calculations:
   - Claimed: 87 points
   - Verified: 65 points
   - Use verified number for projections
```

**If all verified:**

```
Recommendations:

1. ✅ All claims verified - excellent discipline
2. Maintain current pace to complete 85% of work
3. Consider pulling 2 stretch goals from backlog
```

### Status Report Output Format

```markdown
# Cycle Status Report - Day 5 of 10

## Summary

- **Cycle**: Sprint 2024.Q1.3
- **Team**: ACO (ai-coders)
- **Days Remaining**: 5
- **Health Score**: 78/100 ⚠️

## Progress (Verified)

- ✅ Done (verified): 6/18 issues (33%, 52 points)
- 🔄 In Progress (verified): 3/18 issues (17%, 28 points)
- ⏸️ Not Started: 9/18 issues (50%, 80 points)
- ❌ Unverified claims: 2 issues (CLEAN-124, CLEAN-127)

## Velocity

- **Current** (verified): 10.4 points/day
- **Required**: 16.0 points/day
- **Historical**: 12.3 points/day
- **Gap**: Behind by 5.6 points/day ⚠️

## Work Verification

### ✅ Verified Done (6 issues)
1. CLEAN-123: Auth bug fix (PR #456, 3 commits, tests ✅)
2. CLEAN-125: API refactor (PR #457, 5 commits, tests ✅)
3. CLEAN-128: Documentation (PR #458, 2 commits)
4. CLEAN-130: Error handling (PR #459, 4 commits, tests ✅)
5. CLEAN-131: Validation (PR #460, 2 commits, tests ✅)
6. CLEAN-132: Cleanup (PR #461, 1 commit)

### ❌ Unverified Claims (2 issues)
1. CLEAN-124: Marked "Done" but NO evidence found ❌
   - No branch, commits, or PR
   - Status needs correction
2. CLEAN-127: Marked "Done" but incomplete evidence ❌
   - PR exists but no tests
   - Coverage requirement not met

### 🔄 Verified In Progress (3 issues)
1. CLEAN-126: Branch exists, 2 commits, WIP
2. CLEAN-129: Branch exists, 1 commit, WIP
3. CLEAN-133: Branch exists, active work

## Alerts

🚨 **CRITICAL**: 2 unverified "Done" claims require investigation
⚠️ **WARNING**: Behind pace by 5.6 points/day
⚠️ **WARNING**: 3 issues at risk of missing cycle

## Recommendations

1. **Immediate**: Verify or correct status for CLEAN-124, CLEAN-127
2. **Today**: Increase velocity to 18 points/day to catch up
3. **Tomorrow**: Review blocked items for unblocking
4. **This week**: Complete 3 in-progress items before starting new work

## Next Review

- **Scheduled**: Tomorrow at 9:00 AM
- **Focus**: Velocity recovery and blocker resolution
```

### Integration with PLANNER Agent

When `/cycle status` is invoked, PLANNER must:

1. **Fetch cycle data** from Linear MCP
2. **Run verification function** for all "In Progress" and "Done" tasks
3. **Generate comprehensive report** with verification evidence
4. **Flag unverified claims** prominently
5. **Provide actionable recommendations**

**CRITICAL RULE**: Never report a task as "Done" or "In Progress" without verification evidence. If verification fails, report the discrepancy and recommend investigation.

### `/cycle execute`

**DEPLOY WRITE-ENABLED SUBAGENTS**

Deploy subagents with full write permissions to execute cycle work:

1. **Retrieve current cycle** from Linear MCP
2. **Identify ready work items** (Backlog/Todo/Ready status)
3. **DEPLOY SUBAGENTS via Task tool** with **EXPLICIT EXECUTION INSTRUCTIONS**:

**Subagent Invocation Pattern (CORRECT):**

```javascript
// CORRECT: Explicit write instructions for EXECUTOR
Task({
  subagent_type: "executor",
  description: "Implement CLEAN-123",
  prompt: `
    IMMEDIATE EXECUTION REQUIRED:

    1. Read Linear task CLEAN-123 details
    2. Create feature branch: feature/CLEAN-123-description
    3. Write failing test (RED phase)
    4. Implement minimal code (GREEN phase)
    5. Refactor (REFACTOR phase)
    6. Commit with actual git commands
    7. Create PR with gh cli
    8. Return PR URL and commit hashes

    DO NOT analyze or plan - EXECUTE IMMEDIATELY.
    Use Write/Edit/Bash tools to make actual changes.
    Verify all changes with git status, test output.
  `
});

// WRONG: Vague analysis-focused prompt
Task({
  subagent_type: "executor",
  description: "Fix CLEAN-123",
  prompt: "Analyze and implement the fix for CLEAN-123"  // ❌ TOO VAGUE
});
```

4. **VERIFY subagent work** by checking actual tool output:
   - Files were actually created/modified (`git status`)
   - Git commits have real hashes (`git log --oneline -3`)
   - PRs actually exist (`gh pr view <number> --json url`)
   - Linear tasks actually updated (Linear MCP query)
   - Tests actually pass (`npm test`)

5. **REPORT ONLY VERIFIED WORK** with concrete evidence:

**Example Verified Report:**

```
✅ VERIFIED WORK COMPLETION

Task CLEAN-123:
- Commit: a1b2c3d (verified via git log)
- PR: #456 (verified via gh pr view)
- Linear: In Progress (verified via Linear MCP)
- Files: src/auth.ts modified (verified via git diff)
- Tests: 15 passing (verified via npm test)

Task CLEAN-124:
- Commit: e4f5g6h
- PR: #457
- Linear: In Progress
- Files: src/api.ts modified
- Tests: 8 passing
```

**Phase 5: Verification (MANDATORY)**

After subagent deployment:

1. **Wait for subagents to complete** (collect Task tool results)
2. **Verify actual work happened:**
   - Run `git log` to show new commits
   - Run `git status` to show clean working directory
   - Run `gh pr list` to show new PRs
   - Query Linear MCP to show tasks updated to "In Progress"
3. **Report ONLY verified work** with actual evidence
4. **Flag failures** if verification fails

**CRITICAL**: These subagents have full write permissions. Their changes persist to the user's workspace.

**ABSOLUTELY FORBIDDEN**:

- ❌ Reporting "analyses and simulations"
- ❌ Describing work without showing actual tool output
- ❌ Saying "agents were deployed" without actual Task tool results
- ❌ Claiming work is done without git/PR/Linear verification

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
