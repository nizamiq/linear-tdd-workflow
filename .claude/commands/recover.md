---
name: recover
description: Auto-recover broken CI/CD pipeline
agent: GUARDIAN
execution_mode: DIRECT # ⚠️ CRITICAL: GUARDIAN runs in main context for state changes
subprocess_usage: ANALYSIS_THEN_ACTION # Read-only analysis, then direct action in main context
usage: '/recover [--auto-revert] [--force]'
parameters:
  - name: auto-revert
    description: Automatically revert if recovery fails
    type: boolean
    required: false
  - name: force
    description: Force recovery even for manual failures
    type: boolean
    required: false
---

# /recover - Pipeline Recovery

Automatically detect and recover from CI/CD pipeline failures using the GUARDIAN agent.

## ⚠️ IMPORTANT: Direct Execution Required

This command performs **STATE-CHANGING operations** and must run in main context:

- **Analysis phase** may use subprocesses to parse logs (read-only)
- **Recovery phase** MUST run in main context (writes git commits, PRs)
- **NO subprocess writes** - all git operations in main context

**Analysis phase (safe for subprocess):**

- ✅ Reading CI/CD logs
- ✅ Analyzing failure patterns
- ✅ Identifying root causes
- ✅ Generating recovery plans

**Recovery phase (MUST be in main context):**

- ⚠️ Creating revert commits
- ⚠️ Quarantining flaky tests (file modifications)
- ⚠️ Creating revert PRs
- ⚠️ Creating Linear INCIDENT tasks
- ⚠️ Updating pipeline configuration

**Architecture:**

```
Main Context (GUARDIAN)
  ├─> Subprocess: Analyze logs (read-only) → Return findings
  └─> Main Context: Execute recovery (git commits, PRs, Linear tasks)
```

**Rule:** Analysis can be delegated, ACTIONS must be in main context.

## Usage

```
/recover [--auto-revert] [--create-incident]
```

## Parameters

- `--auto-revert`: Automatically create revert PR if recovery fails (default: false)
- `--create-incident`: Create INCIDENT-XXX in Linear for tracking (default: true)

## What This Command Does

The GUARDIAN agent will:

1. Analyze CI/CD logs and failure patterns
2. Identify root cause of pipeline failure
3. Apply known recovery playbooks
4. Quarantine flaky tests if needed
5. Create safe revert PRs if necessary
6. Generate incident reports with lessons learned

## Expected Output

- **Recovery Report**: Detailed analysis of failure and recovery actions
- **Revert PR**: If auto-revert enabled and needed
- **Flaky Test Quarantine**: Disabled tests with documentation
- **Linear Incident**: INCIDENT-XXX task for follow-up
- **Recovery Timeline**: Detection → Recovery metrics

## Examples

```bash
# Standard pipeline recovery
/recover

# Aggressive recovery with auto-revert
/recover --auto-revert

# Recovery without incident creation
/recover --create-incident=false
```

## Recovery Strategies

- **Test Failures**: Quarantine flaky tests, retry deterministic failures
- **Build Failures**: Fix dependencies, clear caches, retry builds
- **Deployment Failures**: Rollback, fix configuration, retry deployment
- **Performance Issues**: Resource optimization, scaling adjustments

## SLAs

- Detection: ≤5 minutes
- Recovery: ≤10 minutes (p95)
- Revert creation: ≤2 minutes
- Incident documentation: ≤5 minutes

## Ground Truth Verification (Mandatory)

After completing recovery, GUARDIAN **MUST** verify actions persisted using actual tool calls:

### Required Verification Steps:

1. **Verify Revert Commit Created (if applicable):**

   ```bash
   git log --oneline -5 | grep -i revert
   ```

   Expected: Revert commit appears in git log

2. **Verify Revert PR Created (if applicable):**

   ```bash
   gh pr list --state open | grep -i revert
   ```

   Expected: PR number and URL visible

3. **Verify Linear Incident Created:**

   ```bash
   # Use Linear MCP to verify incident task exists
   mcp__linear__search_issues "identifier:INCIDENT"
   ```

   Expected: INCIDENT-XXX task visible in Linear

4. **Verify Pipeline Status Improved:**

   ```bash
   gh run list --limit 1 --json conclusion
   ```

   Expected: Latest run shows "success" or at least better than before

5. **Verify Quarantined Tests (if applicable):**
   ```bash
   git diff HEAD~1 | grep -A5 "skip\|disable"
   ```
   Expected: Test files show skip/disable markers

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: Revert PR created with link to INCIDENT task
Actual: gh pr list shows no open PRs, Linear shows no INCIDENT tasks

RECOVERY INCOMPLETE - DO NOT REPORT SUCCESS
Manual intervention required: User must manually revert or escalate.
```

**Rule:** NEVER report successful recovery without verified evidence of actions taken.
