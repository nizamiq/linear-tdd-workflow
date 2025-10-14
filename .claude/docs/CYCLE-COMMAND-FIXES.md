# Cycle Command Issues & Solutions

## Issues Identified

### Issue 1: `/cycle plan` - Linear Issues Not Created/Updated

**Root Cause:**
- PLANNER completes analysis and generates plan report
- BUT: No explicit step to create Linear cycle or tasks
- Missing approval gate before Linear write operations
- Workflow ends at "plan generation" instead of "cycle creation"

**Evidence:**
- `cycle.md` has NO approval gate keywords
- PLANNER has Linear MCP access but doesn't use it for cycle creation
- Documentation says "PLANNER makes all state changes" but no implementation guidance

### Issue 2: `/cycle execute` - Subagents Not Persisting Work

**Root Cause:**
- PLANNER invokes subagents via Task tool (correct)
- BUT: Subagents receive vague instructions and analyze instead of execute
- Anti-hallucination protocols may be too strict
- No explicit WRITE permissions or clear execution instructions

**Evidence:**
- Subagents ARE invoked (architecture is correct)
- But prompts may be analysis-focused instead of execution-focused
- Missing verification that actual tool calls happened

## Solutions

### Solution 1: Fix `/cycle plan` Linear Task Creation

**Architecture Decision:**

Two options:

**Option A: PLANNER Creates Directly (Recommended)**
- ✅ Simpler - one agent, one Linear connection
- ✅ Faster - no agent handoff overhead
- ✅ Clear ownership - PLANNER owns cycle planning end-to-end
- ❌ Violates STRATEGIST exclusivity principle slightly

**Option B: PLANNER → STRATEGIST Handoff**
- ✅ Maintains STRATEGIST as exclusive Linear manager
- ✅ Clear separation: PLANNER plans, STRATEGIST executes
- ❌ More complex - requires agent coordination
- ❌ Slower - additional agent invocation

**Recommendation: Option A with Documentation Update**

Justification:
- PLANNER already has Linear MCP access for cycle operations
- Creating cycle/tasks is part of "cycle planning" workflow
- STRATEGIST remains exclusive manager for OTHER Linear operations (assessments, fixes, etc.)
- Performance and simplicity win

**Implementation:**

1. **Add Approval Gate to cycle.md:**

```markdown
### `/cycle plan`

**Phase 4.5: Linear Cycle Creation (Approval Gate)**

After generating the plan, PLANNER will:

1. **Present Plan** to user with selected work items
2. **ASK FOR APPROVAL**: "Would you like me to create this cycle in Linear?"
3. **On approval**:
   - Create Linear cycle using `mcp__linear-server__create_cycle()`
   - Add selected issues to cycle
   - Return cycle ID and Linear URL
4. **On rejection**: Save plan to file for manual review
```

2. **Add Implementation to planner.md:**

```javascript
// Phase 4.5: Create Linear Cycle (with approval)
async function createLinearCycle(selectedIssues, cycleData) {
  // Present plan summary
  console.log(`
📋 CYCLE PLAN READY
==================
Selected Issues: ${selectedIssues.length}
Estimated Effort: ${cycleData.totalEffort} hours
Technical Debt: ${cycleData.techDebtRatio}%

Would you like me to create this cycle in Linear? (yes/no)
  `);

  // Wait for approval (system will pause here)
  const approved = await getUserApproval();

  if (!approved) {
    console.log("❌ Cycle creation cancelled. Plan saved to docs/cycle-plan.json");
    return null;
  }

  // Create cycle in Linear
  const team = process.env.LINEAR_TEAM_ID || 'ACO';
  const cycle = await mcp__linear-server__create_cycle({
    team: team,
    name: cycleData.name,
    startsAt: cycleData.startsAt,
    endsAt: cycleData.endsAt,
  });

  // Add issues to cycle
  for (const issue of selectedIssues) {
    await mcp__linear-server__update_issue({
      id: issue.id,
      cycleId: cycle.id,
    });
  }

  console.log(`✅ Created cycle: ${cycle.url}`);
  return cycle;
}
```

### Solution 2: Fix `/cycle execute` Subagent Persistence

**Architecture Decision:**

Problem is NOT the architecture - subagents CAN persist work.
Problem is EXECUTION: Subagents aren't being given clear WRITE instructions.

**Solution: Explicit Execution Instructions**

1. **Update cycle.md with explicit subagent prompts:**

```markdown
### `/cycle execute`

**Subagent Invocation Pattern:**

```javascript
// CORRECT: Explicit write instructions
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
```

2. **Add Ground Truth Verification to planner.md:**

```javascript
// After deploying subagents, verify actual work
async function verifySubagentWork(taskResults) {
  const verifications = [];

  for (const result of taskResults) {
    // Verify files were actually modified
    const gitStatus = await Bash({ command: "git status --porcelain" });

    // Verify commits exist
    const gitLog = await Bash({ command: "git log --oneline -3" });

    // Verify PRs exist
    const prCheck = await Bash({ command: `gh pr view ${result.prNumber} --json url` });

    // Verify Linear tasks updated
    const linearTask = await mcp__linear-server__get_issue({ id: result.taskId });

    verifications.push({
      taskId: result.taskId,
      filesModified: gitStatus.includes(result.expectedFiles),
      commitExists: gitLog.includes(result.commitHash),
      prExists: prCheck.success,
      linearUpdated: linearTask.state.name === "In Progress",
    });
  }

  return verifications;
}
```

3. **Add Verification Step to cycle.md:**

```markdown
**Phase 5: Verification (CRITICAL)**

After subagent deployment:

1. **Wait for subagents to complete** (collect Task tool results)
2. **Verify actual work happened:**
   - `git log` shows new commits
   - `git status` shows clean working directory
   - `gh pr list` shows new PRs
   - Linear MCP shows tasks updated to "In Progress"
3. **Report ONLY verified work** with actual evidence
4. **Flag failures** if verification fails

**Example Verified Report:**

```
✅ VERIFIED WORK COMPLETION

Task CLEAN-123:
- Commit: a1b2c3d (verified via git log)
- PR: #456 (verified via gh pr view)
- Linear: In Progress (verified via Linear MCP)
- Files: src/auth.ts modified (verified via git diff)

Task CLEAN-124:
- Commit: e4f5g6h
- PR: #457
- Linear: In Progress
- Files: src/api.ts modified
```
```

## Implementation Plan

### Phase 1: Fix `/cycle plan` (High Priority)

1. ✅ Update `.claude/commands/cycle.md`:
   - Add Phase 4.5: Approval Gate
   - Add Linear cycle creation instructions

2. ✅ Update `.claude/agents/planner.md`:
   - Add `createLinearCycle()` implementation
   - Add approval gate handling
   - Add environment variable usage (LINEAR_TEAM_ID)

3. ✅ Test:
   - Run `/cycle plan`
   - Verify plan is generated
   - Verify approval prompt appears
   - Approve and verify Linear cycle is created
   - Check Linear workspace for new cycle

### Phase 2: Fix `/cycle execute` (High Priority)

1. ✅ Update `.claude/commands/cycle.md`:
   - Add explicit subagent invocation examples
   - Add "DO NOT analyze" warnings
   - Add verification phase

2. ✅ Update `.claude/agents/planner.md`:
   - Add `verifySubagentWork()` function
   - Add explicit execution instructions
   - Add ground truth checks

3. ✅ Test:
   - Run `/cycle execute`
   - Verify subagents are deployed with Task tool
   - Verify actual git commits are created
   - Verify PRs are created
   - Verify Linear tasks are updated

### Phase 3: Documentation & Testing (Medium Priority)

1. ✅ Update CLAUDE.md with clarified Linear permissions:
   - STRATEGIST: Exclusive for assessment/general operations
   - PLANNER: Cycle creation and cycle-specific operations
   - All others: No Linear access

2. ✅ Add E2E tests:
   - `tests/e2e/cycle-plan.test.js` - Test full plan workflow
   - `tests/e2e/cycle-execute.test.js` - Test subagent execution

3. ✅ Update troubleshooting guide:
   - Common issues with `/cycle plan`
   - Common issues with `/cycle execute`
   - Verification steps

## Best Practices & Stability

### Design Principles

1. **Clear Ownership**:
   - PLANNER owns cycle planning end-to-end (including Linear cycle creation)
   - STRATEGIST owns general Linear operations (assessments, fixes, releases)

2. **Explicit Over Implicit**:
   - Explicit approval gates for write operations
   - Explicit execution instructions for subagents
   - Explicit verification of actual work

3. **Fail-Safe Defaults**:
   - If approval not received, save plan but don't create cycle
   - If subagent fails, report failure (don't fabricate success)
   - If verification fails, flag the issue

4. **Ground Truth Verification**:
   - All work claims must be verified with tool output
   - Git operations verified with `git log`, `git status`
   - Linear operations verified with Linear MCP queries
   - PR operations verified with `gh` CLI

### Stability Measures

1. **Transaction Semantics**:
   - Create cycle first
   - Then add issues one by one
   - If failure, report partial success with cycle ID

2. **Error Recovery**:
   - If Linear cycle creation fails, save plan to file
   - If subagent fails, continue with remaining subagents
   - If verification fails, report which tasks succeeded/failed

3. **Rate Limiting**:
   - Batch Linear operations (update 5 issues at a time)
   - Add delays between operations (200ms)
   - Respect Linear API rate limits

4. **Rollback Capability**:
   - Keep cycle plan in version control
   - Enable manual cycle creation from saved plan
   - Enable manual cleanup of partially created cycles

## Testing Checklist

### `/cycle plan` Tests

- [ ] Plan generation completes successfully
- [ ] Selected issues are reasonable (not too many/few)
- [ ] Technical debt ratio is calculated correctly
- [ ] Approval prompt appears
- [ ] On approval, Linear cycle is created
- [ ] On rejection, plan is saved to file
- [ ] Linear cycle URL is returned
- [ ] Selected issues are added to cycle

### `/cycle execute` Tests

- [ ] Subagents are deployed via Task tool
- [ ] Each subagent receives explicit WRITE instructions
- [ ] Subagents actually create commits (verify with git log)
- [ ] Subagents actually create PRs (verify with gh CLI)
- [ ] Subagents actually update Linear (verify with MCP)
- [ ] Verification phase detects actual work
- [ ] Report shows only verified work
- [ ] Failures are reported correctly

## Migration Notes

**Breaking Changes:** None - this is additive functionality

**Backward Compatibility:** Existing plans still work, but won't auto-create Linear cycles

**Upgrade Path:**
1. Deploy updated cycle.md and planner.md
2. Test with `/cycle plan` on non-production team
3. Verify Linear cycle creation works
4. Test with `/cycle execute` on small work item
5. Verify subagent persistence works
6. Roll out to production

## Success Metrics

### `/cycle plan`

- ✅ 100% of plans result in Linear cycle creation (when approved)
- ✅ Cycle creation latency <5 seconds
- ✅ 0 failed cycle creations due to configuration issues

### `/cycle execute`

- ✅ 100% of deployed subagents actually persist work
- ✅ Verification detects all actual work (no false positives)
- ✅ Report accuracy: 100% (only verified work reported)
- ✅ Average cycle execution time: <15min per task

## References

- `/cycle` command specification: `.claude/commands/cycle.md`
- PLANNER agent specification: `.claude/agents/planner.md`
- Linear MCP documentation: Linear.app API docs
- Subagent execution model: `.claude/docs/AUTONOMOUS-EXECUTION.md`
