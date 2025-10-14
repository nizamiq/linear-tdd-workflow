---
name: fix
description: Implement approved fix pack using strict TDD methodology (RED→GREEN→REFACTOR). EXECUTES DIRECTLY IN MAIN CONTEXT - no subprocess isolation issues.
agent: EXECUTOR
execution_mode: DIRECT  # ⚠️ CRITICAL: EXECUTOR runs in main context, NOT via Task tool
usage: "/fix <TASK-ID> [--branch=<branch-name>]"
parameters:
  - name: TASK-ID
    description: The Linear task ID (e.g., CLEAN-123)
    type: string
    required: true
  - name: branch
    description: Custom branch name (default: feature/TASK-ID-description)
    type: string
    required: false
---

# /fix - TDD Fix Implementation

Implement an approved fix from Linear using strict Test-Driven Development methodology with the EXECUTOR agent **running directly in main context**.

## ⚠️ IMPORTANT: Direct Execution (No Subprocess)

This command invokes EXECUTOR **directly in the main context** - NOT via the Task tool. This ensures:

- ✅ File writes **persist** to your actual workspace
- ✅ Git commits **persist** to your actual repository
- ✅ PRs reference **real branches** in your repo
- ✅ All changes are **immediately verifiable** by you

**Previous Architecture (BROKEN):**

```
User → Main Agent → Task(EXECUTOR subprocess) → Work in isolation → Nothing persists ❌
```

**Current Architecture (FIXED):**

```
User → EXECUTOR in main context → Work persists directly → Verified results ✅
```

## Usage

```
/fix <TASK-ID> [--branch=<branch-name>]
```

## Parameters

- `TASK-ID`: Required. The Linear task ID (e.g., CLEAN-123)
- `--branch`: Optional. Custom branch name (default: feature/TASK-ID-description)

## What This Command Does

When you invoke `/fix CLEAN-123`, Claude Code **becomes EXECUTOR** and performs work directly:

1. **Retrieve task from Linear** (via Linear MCP)
2. **Create feature branch** (git commands in your repo)
3. **Implement TDD cycle in your workspace:**
   - **RED**: Write failing test → Verify it fails
   - **GREEN**: Implement minimal code → Verify it passes
   - **REFACTOR**: Improve design → Verify tests still pass
4. **Validate quality gates** (≥80% diff coverage)
5. **Commit changes** (to your actual git repository)
6. **Create PR** (in your actual GitHub repo)
7. **Verify all changes persisted** (ground truth checks via Phase 6)

## Phase 6: Verification (MANDATORY)

After completing the TDD cycle and creating the PR, EXECUTOR **MUST** run comprehensive ground truth verification to ensure all work actually persisted.

### Why This Phase Exists

This phase prevents the EXECUTOR from reporting "implementation complete" when work was only simulated or analyzed but not actually executed. It uses ground truth checks (actual tool outputs) to verify real work happened.

### Verification Process

**Step 1: Run verifyTDDCycle() Function**

EXECUTOR must execute the `verifyTDDCycle()` function (defined in `.claude/agents/executor.md`) with actual Bash tool calls:

```javascript
const taskId = "CLEAN-123";  // From command parameter
const branchName = "feature/CLEAN-123-description";  // Actual branch name

const verificationResults = await verifyTDDCycle(taskId, branchName);
```

**Step 2: Check All Verification Flags**

The function returns a verification object with 6 boolean flags:

```javascript
{
  taskId: "CLEAN-123",
  branchCreated: true/false,      // Branch exists in git
  testsWritten: true/false,       // Test files modified
  testsPass: true/false,          // npm test exit code 0
  coverageMet: true/false,        // Coverage ≥80%
  commitsExist: true/false,       // RED, GREEN, REFACTOR commits exist
  prCreated: true/false,          // PR exists with task ID
  evidence: {
    branch: "...",
    modifiedFiles: "...",
    testOutput: "...",
    coverageReport: "...",
    commits: "...",
    prInfo: "..."
  }
}
```

**Step 3: Generate Verification Report**

Format the results into a clear report showing what succeeded and what failed:

```markdown
## Ground Truth Verification Results

Task: CLEAN-123
Branch: feature/CLEAN-123-fix-auth

### Verification Checks

✅ **Branch Created**: feature/CLEAN-123-fix-auth
✅ **Tests Written**: tests/unit/auth.test.ts (modified)
✅ **Tests Pass**: npm test (16/16 passing)
✅ **Coverage Met**: 85% (threshold: 80%)
✅ **Commits Exist**:
   - a1b2c3d [RED] Add failing test for token expiration
   - e4f5g6h [GREEN] Implement token refresh logic
   - i7j8k9l [REFACTOR] Extract validation to separate function
✅ **PR Created**: https://github.com/repo/pull/123

**Overall Status**: 6/6 verifications passed ✅

All verifications passed - work confirmed persisted.
```

### Handling Verification Failures

If **ANY** verification fails, EXECUTOR **MUST**:

1. **Report exactly what failed** with evidence:

   ```markdown
   ❌ VERIFICATION FAILED

   Task: CLEAN-123

   Failed Checks:
   - ❌ Tests Pass: npm test exited with code 1 (3/16 failing)
   - ❌ Coverage Met: 72% (need 80%)

   Evidence:
   - Test output: "FAIL src/auth.test.ts - token_refresh_throws_on_expired"
   - Coverage report: "Line coverage: 72.3%"

   **CANNOT REPORT COMPLETION** - Implementation incomplete
   ```

2. **Do NOT claim success** - Be honest about the failure

3. **Create INCIDENT task** (optional but recommended):
   ```
   Title: EXECUTOR verification failed for CLEAN-123
   Description: TDD cycle completed but verification checks failed.
   Failed: Tests passing, Coverage threshold
   ```

4. **Investigate and fix** - Redo the work properly, then re-run verification

### Success Criteria

**ONLY report task completion if ALL 6 verification flags are TRUE:**

```javascript
if (allChecksPassed(verificationResults)) {
  // Safe to report completion
  reportTaskComplete(taskId, verificationResults);
} else {
  // Report failure with details
  reportVerificationFailure(taskId, verificationResults);
}
```

### Verification Commands (For Reference)

The `verifyTDDCycle()` function runs these actual Bash commands:

```bash
# 1. Branch verification
git branch --list ${branchName}

# 2. Test files verification
git status --porcelain

# 3. Tests passing verification
npm test || python -m pytest

# 4. Coverage verification
npm run coverage:check || python -m pytest --cov=. --cov-fail-under=80

# 5. Commits verification
git log --oneline -10

# 6. PR verification
gh pr list --state open | grep ${taskId}
```

All commands must succeed and produce expected output for verification to pass.

### Integration with Linear

If verification passes, include verification report in Linear task update:

```json
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "complete_task",
    "status": "Done",
    "comment": "✅ Task completed successfully\n\n[Verification Report]\n\n6/6 verifications passed",
    "evidence": {
      "verification_report": "...",
      "pr_url": "..."
    }
  }
}
```

If verification fails, update Linear to Blocked:

```json
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "block_task",
    "status": "Blocked",
    "comment": "❌ Verification failed\n\n[Failed Checks]\n- Tests: 3/16 failing\n- Coverage: 72% (need 80%)",
    "evidence": {
      "verification_failures": ["tests_pass", "coverage_met"]
    }
  }
}
```

### When NOT to Skip Verification

Verification is **MANDATORY** and **CANNOT BE SKIPPED** for:

- ✅ All `/fix` command invocations
- ✅ Any TDD cycle completion
- ✅ Before reporting task complete
- ✅ Before creating PR
- ✅ When any doubt exists about work persistence

**There are NO exceptions to this rule.**

## Expected Output

- **Feature Branch**: Properly named GitFlow branch
- **Test Implementation**: Failing test → passing test → refactored code
- **Coverage Report**: Showing ≥80% diff coverage
- **Pull Request**: With Linear task link and testing evidence
- **Commit History**: Clear TDD cycle demonstration

## Examples

```bash
# Implement a standard fix
/fix CLEAN-123

# Implement with custom branch name
/fix CLEAN-456 --branch=feature/improve-auth-validation
```

## Constraints

- Maximum 300 LOC per Fix Pack
- Only FIL-0/FIL-1 changes (auto-approved)
- Must follow TDD cycle strictly
- Coverage gates are non-negotiable

## Ground Truth Verification (Mandatory)

After completing implementation, EXECUTOR **MUST** verify work persisted using actual tool calls:

### Required Verification Steps:

1. **Verify Branch Created:**

   ```bash
   git branch --list feature/*TASK-ID*
   ```

   Expected: Branch name appears in output

2. **Verify Commits Exist:**

   ```bash
   git log --oneline -5
   ```

   Expected: RED, GREEN, REFACTOR commits visible

3. **Verify Tests Pass:**

   ```bash
   npm test
   ```

   Expected: Exit code 0, all tests passing

4. **Verify Coverage Met:**

   ```bash
   npm run coverage:check
   ```

   Expected: Diff coverage ≥80%

5. **Verify PR Created:**
   ```bash
   gh pr list --state open | grep TASK-ID
   ```
   Expected: PR number and URL in output

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: Tests passing
Actual: npm test exited with code 1

IMPLEMENTATION INCOMPLETE - DO NOT REPORT SUCCESS
Creating INCIDENT task for investigation.
```

**Rule:** NEVER report success without verified evidence.

## SLAs

- Fix implementation: ≤15 minutes (p50)
- PR creation: ≤2 minutes
- Coverage validation: ≤1 minute
- Ground truth verification: ≤1 minute
