---
name: recover
description: Auto-recover broken CI/CD pipeline
agent: GUARDIAN
usage: "/recover [--auto-revert] [--force]"
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