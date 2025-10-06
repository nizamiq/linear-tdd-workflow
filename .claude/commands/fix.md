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
7. **Verify all changes persisted** (ground truth checks)

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