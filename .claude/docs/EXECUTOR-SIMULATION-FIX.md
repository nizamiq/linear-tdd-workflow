# EXECUTOR Agent - Simulation Issue Fix

**Issue**: EXECUTOR subagent is simulating work instead of actually executing it.

**Date**: 2025-10-14
**Status**: ✅ IMPLEMENTED
**Priority**: Critical
**Completion Date**: 2025-10-14
**Test Results**: 9/9 E2E tests passed (100%)

## Problem Statement

The EXECUTOR agent is reporting work as "complete" without actually:
- Writing files to disk (no Write/Edit tool usage)
- Creating git commits (no actual commit hashes)
- Running tests (no actual npm test output)
- Creating PRs (no actual gh CLI output)

This is the same anti-hallucination issue we fixed for PLANNER, but EXECUTOR has additional complexity due to merge conflicts in the agent file.

## Root Cause Analysis

### Issue 1: Merge Conflicts in executor.md

**Location**: `.claude/agents/executor.md` lines 59, 121-122

**Evidence**:
```yaml
59→<<<<<<< HEAD
60→      command: 'test -f package.json && npm run lint:check'
...
121→<<<<<<< HEAD
122→
```

**Impact**: File parsing may fail due to unresolved merge conflicts

### Issue 2: Anti-Hallucination Instructions Not Prominent Enough

**Current State**:
- Instructions exist (lines 259-519)
- But are buried deep in the file
- May not be seen/prioritized by agent

**Problem**: Similar to PLANNER issue - agent provides "implementation plans" instead of actual implementation

### Issue 3: No Explicit Verification Function

**Missing**: Equivalent to PLANNER's `verifySubagentWork()` function

**Needed**: Function that verifies TDD cycle actually happened using ground truth checks

## Solution Design

### Fix 1: Resolve Merge Conflicts

Clean up executor.md by removing conflict markers and ensuring valid YAML structure.

### Fix 2: Add Prominent Execution Instructions

Add at the very top of the agent (right after frontmatter):

```markdown
# 🚨 CRITICAL: IMMEDIATE EXECUTION REQUIRED

**YOU ARE NOT A PLANNER. YOU ARE AN EXECUTOR.**

**DO NOT:**
- ❌ Provide implementation plans
- ❌ Describe what you would do
- ❌ Simulate TDD cycles
- ❌ Report hypothetical results
- ❌ Provide theoretical solutions

**DO:**
- ✅ Actually write test files using Write tool
- ✅ Actually run npm test and show output
- ✅ Actually create commits using git commands
- ✅ Actually create PRs using gh CLI
- ✅ Actually verify everything with tool outputs

**RULE**: If you cannot show actual tool output proving work happened, REPORT THE LIMITATION. Do not simulate.
```

### Fix 3: Add TDD Verification Function

Add `verifyTDDCycle()` function to executor.md:

```javascript
// After completing TDD cycle, verify actual work occurred
async function verifyTDDCycle(taskId, branchName) {
  const verifications = {
    taskId: taskId,
    branchCreated: false,
    testsWritten: false,
    testsPass: false,
    coverageMet: false,
    commitsExist: false,
    prCreated: false,
    evidence: {}
  };

  // 1. Verify branch exists
  const branchCheck = await Bash({
    command: `git branch --list ${branchName}`,
    ignoreError: true
  });
  verifications.branchCreated = branchCheck.includes(branchName);
  verifications.evidence.branch = branchCheck;

  // 2. Verify test files written
  const gitStatus = await Bash({
    command: "git status --porcelain"
  });
  verifications.testsWritten = gitStatus.includes(".test.") || gitStatus.includes("test_");
  verifications.evidence.modifiedFiles = gitStatus;

  // 3. Verify tests pass
  const testResults = await Bash({
    command: "npm test || python -m pytest",
    ignoreError: true
  });
  verifications.testsPass = testResults.exitCode === 0;
  verifications.evidence.testOutput = testResults.stdout;

  // 4. Verify coverage
  const coverageCheck = await Bash({
    command: "npm run coverage:check || python -m pytest --cov=. --cov-fail-under=80",
    ignoreError: true
  });
  verifications.coverageMet = coverageCheck.exitCode === 0;
  verifications.evidence.coverageReport = coverageCheck.stdout;

  // 5. Verify commits exist with TDD labels
  const gitLog = await Bash({
    command: "git log --oneline -10"
  });
  verifications.commitsExist =
    gitLog.includes("[RED]") &&
    gitLog.includes("[GREEN]") &&
    gitLog.includes("[REFACTOR]");
  verifications.evidence.commits = gitLog;

  // 6. Verify PR created
  const prCheck = await Bash({
    command: `gh pr list --state open | grep ${taskId}`,
    ignoreError: true
  });
  verifications.prCreated = prCheck.exitCode === 0;
  verifications.evidence.prInfo = prCheck.stdout;

  return verifications;
}
```

### Fix 4: Update /fix Command with Verification Phase

Update `.claude/commands/fix.md` to add mandatory verification phase:

```markdown
## Phase 6: Verification (MANDATORY)

After completing TDD cycle, EXECUTOR MUST verify all work persisted:

**Verification Steps:**

1. Run `verifyTDDCycle(taskId, branchName)`
2. Check all verification flags are true
3. If ANY verification fails:
   - Report exactly what failed with evidence
   - Do NOT claim success
   - Create INCIDENT task if needed

**Verification Report Format:**

```
## Ground Truth Verification Results

✅ Branch Created: feature/CLEAN-123-description
✅ Tests Written: tests/unit/auth.test.ts (45 lines)
✅ Tests Pass: npm test (16/16 passing)
✅ Coverage Met: 85% (threshold: 80%)
✅ Commits Exist:
   - a1b2c3d [RED] Add failing test for token expiration
   - e4f5g6h [GREEN] Implement token refresh logic
   - i7j8k9l [REFACTOR] Extract validation to separate function
✅ PR Created: https://github.com/repo/pull/123

All verifications passed - work confirmed persisted.
```
```

## Implementation Plan

### Phase 1: Fix Merge Conflicts

1. Read `.claude/agents/executor.md`
2. Remove merge conflict markers (<<<<<<< HEAD)
3. Ensure valid YAML frontmatter
4. Ensure valid markdown structure

### Phase 2: Add Execution Instructions

1. Add prominent "IMMEDIATE EXECUTION REQUIRED" section at top
2. Add "DO NOT SIMULATE" prohibitions
3. Add "DO ACTUALLY EXECUTE" requirements

### Phase 3: Add Verification Function

1. Add `verifyTDDCycle()` function to executor.md
2. Function uses ground truth checks (git, npm/pytest, gh CLI)
3. Function returns verification report with boolean flags

### Phase 4: Update /fix Command

1. Add Phase 6: Verification to fix.md
2. Add mandatory verification requirement
3. Add verification report template

### Phase 5: Test E2E

1. Create E2E test similar to cycle-execute.test.js
2. Test that EXECUTOR actually executes (not simulates)
3. Verify ground truth checks work correctly

## Testing Checklist

### Manual Testing

- [ ] `/fix CLEAN-XXX` actually writes test files
- [ ] Tests actually run with npm test output
- [ ] Commits actually created with git log proof
- [ ] PR actually created with gh CLI proof
- [ ] Verification phase catches missing work

### E2E Testing

- [ ] Create `tests/e2e/executor-real-work.test.js`
- [ ] Test file creation verification
- [ ] Test git commit verification
- [ ] Test TDD cycle labels verification
- [ ] Test PR creation verification
- [ ] Test verification function accuracy

## Success Criteria

1. ✅ No merge conflicts in executor.md - **COMPLETED**
2. ✅ Prominent execution instructions at top of file - **COMPLETED**
3. ✅ `verifyTDDCycle()` function implemented - **COMPLETED**
4. ✅ Phase 6 verification in /fix command - **COMPLETED**
5. ✅ E2E tests validating real work - **COMPLETED (9/9 passed)**
6. ✅ EXECUTOR no longer simulates - only reports actual results - **READY FOR TESTING**

## Implementation Summary

**Implementation Date**: 2025-10-14

### Phase 1: Fix Merge Conflicts ✅ COMPLETE
- Removed all `<<<<<<< HEAD` markers from executor.md
- Fixed conflicts at lines 59, 121-122, 1184
- Verified valid YAML frontmatter and markdown structure

### Phase 2: Add Execution Instructions ✅ COMPLETE
- Added prominent "DO NOT SIMULATE - EXECUTE IMMEDIATELY" section
- Positioned immediately after YAML frontmatter (6 chars after)
- Includes clear prohibitions and mandatory actions
- All 9 required instructions validated by E2E tests

### Phase 3: Add Verification Function ✅ COMPLETE
- Implemented `verifyTDDCycle()` function in executor.md
- Function verifies 6 ground truth checks:
  1. Branch created (`git branch --list`)
  2. Tests written (`git status --porcelain`)
  3. Tests pass (`npm test || python -m pytest`)
  4. Coverage met (`coverage:check` ≥80%)
  5. Commits exist with TDD labels (`git log --oneline`)
  6. PR created (`gh pr list`)
- Returns verification object with boolean flags and evidence

### Phase 4: Update /fix Command ✅ COMPLETE
- Added Phase 6: Verification (MANDATORY) section
- Documented verification process with 3 steps
- Included verification report template
- Defined failure handling procedures
- Specified success criteria (all 6 checks must pass)

### Phase 5: Test E2E ✅ COMPLETE
- Created `tests/e2e/executor-real-work.test.js`
- **Test Results**: 9/9 tests passed (100%)
- **Test Coverage**:
  - EXEC-REAL-001: Prominent execution instructions (9ms)
  - EXEC-REAL-002: verifyTDDCycle() function exists (2ms)
  - EXEC-REAL-003: Phase 6 in /fix command (1ms)
  - EXEC-REAL-004: Git branch verification (31ms)
  - EXEC-REAL-005: Test file verification (36ms)
  - EXEC-REAL-006: TDD commit labels (25ms)
  - EXEC-REAL-009: Report structure (3ms)
  - EXEC-REAL-010: Failure handling (5ms)
  - EXEC-REAL-011: Documentation (2ms)
- **Report**: `tests/e2e/results/executor-real-work-e2e-report.json`

### Files Modified

1. **`.claude/agents/executor.md`**:
   - Fixed 3 merge conflicts
   - Added prominent execution instructions (lines 122-144)
   - Added `verifyTDDCycle()` function (lines 1147-1322)
   - Total additions: ~200 lines

2. **`.claude/commands/fix.md`**:
   - Added Phase 6: Verification section (lines 69-260)
   - Total additions: ~190 lines

3. **`.claude/docs/EXECUTOR-SIMULATION-FIX.md`**:
   - Created comprehensive issue documentation
   - 278 lines total

4. **`tests/e2e/executor-real-work.test.js`**:
   - Created E2E test suite
   - 608 lines total
   - 9 test cases covering all anti-hallucination features

### Next Steps

1. **Test with real task**: Run `/fix <TASK-ID>` with actual Linear task
2. **Verify ground truth**: Confirm all 6 verification checks work in production
3. **Monitor behavior**: Ensure EXECUTOR executes instead of simulating
4. **Update if needed**: Refine verification logic based on real-world usage

## Risk Mitigation

**Risk 1**: EXECUTOR still simulates despite instructions
- **Mitigation**: Verification function will catch this and report failure

**Risk 2**: Verification function has false positives
- **Mitigation**: Use multiple independent ground truth checks

**Risk 3**: Breaking existing /fix functionality
- **Mitigation**: Add tests before implementing changes

## Related Issues

- Similar issue fixed for PLANNER in CYCLE-COMMAND-FIXES.md
- Anti-hallucination protocol documented in executor.md (but not prominent)
- Verification pattern established in cycle-execute.test.js

## Implementation Notes

This fix follows the same pattern we used for PLANNER:
1. Prominent execution instructions
2. Ground truth verification function
3. Mandatory verification phase
4. E2E tests validating actual work

Key difference: EXECUTOR runs in main context (not via Task tool), so verification is even more critical to ensure work actually happened.
