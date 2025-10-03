---
name: recover
description: Auto-recover broken CI/CD pipeline
agent: GUARDIAN
usage: "/recover [--auto-revert] [--force]"
allowed-tools: [Read, Grep, Glob, Bash, Task]
argument-hint: "[--auto-revert] [--force]"
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

## Usage
```
/recover [--auto-revert] [--create-incident]
```

## Parameters
- `--auto-revert`: Automatically create revert PR if recovery fails (default: false)
- `--create-incident`: Create INCIDENT-XXX in Linear for tracking (default: true)

## 🤖 Execution Instructions for Claude Code

**When user invokes `/recover`, execute immediate pipeline recovery without asking for permission.**

### Step 1: Invoke GUARDIAN Agent for Pipeline Recovery
```
Use Task tool with:
- subagent_type: "GUARDIAN"
- description: "Diagnose and recover broken CI/CD pipeline"
- prompt: "You are the GUARDIAN agent. Execute immediate CI/CD pipeline recovery:

Auto-revert: [user-provided --auto-revert flag or false]
Create Incident: [user-provided --create-incident flag or true]

Execute immediately:
1. Detect pipeline failures:
   - Use Bash to check CI/CD status (gh api, kubectl, etc.)
   - Identify failing jobs, tests, deployments
   - Determine failure timestamp and affected commits

2. Analyze root cause:
   - Read CI/CD logs using Bash
   - Identify failure patterns (flaky test, dependency issue, environment problem)
   - Check for known issues in Linear and past incidents

3. Apply recovery strategy:
   - **Test Failures**: Quarantine flaky tests using test.skip, create PR
   - **Build Failures**: Clear caches, retry build with Bash commands
   - **Deployment Failures**: Rollback using kubectl/gh commands
   - **Environment Issues**: Fix configuration, restart services

4. Create revert PR if recovery fails and auto-revert=true:
   - Use Bash: git revert <commit> && git push
   - Use Bash: gh pr create with detailed explanation

5. Document incident:
   - Prepare incident report with timeline, root cause, recovery actions
   - If create-incident=true, return incident data for STRATEGIST

6. Verify recovery:
   - Re-run failed jobs
   - Confirm pipeline is green
   - Return recovery status to parent

Complete all steps autonomously. Pipeline stability is critical - act immediately."
```

### Step 2: Present Recovery Report
After GUARDIAN completes:
- Show failure analysis (root cause, affected systems)
- Display recovery actions taken
- Report pipeline status (recovered or needs escalation)
- Show recovery timeline (detection → resolution)

### Step 3: Create Linear Incident (if flag enabled)
If create-incident flag is true:
- Invoke Task tool with subagent_type "STRATEGIST"
- STRATEGIST creates INCIDENT-XXX task in Linear via MCP
- Report incident ID back to user

### Completion Criteria
- ✅ Pipeline failure detected and analyzed
- ✅ Root cause identified
- ✅ Recovery strategy applied
- ✅ Pipeline status verified (green or escalated)
- ✅ Incident documented in Linear (if enabled)
- ✅ Revert PR created (if auto-revert and recovery failed)

### Expected Timeline
- Detection: 2-3 minutes
- Analysis: 3-5 minutes
- Recovery: 3-7 minutes
- Total: ≤10 minutes (p95)

**DO NOT:**
- Ask "should I analyze the pipeline?" - diagnose immediately
- Wait for permission to apply recovery - fix automatically
- Ask before quarantining flaky tests - take action
- Request approval for revert PR - create if auto-revert enabled

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