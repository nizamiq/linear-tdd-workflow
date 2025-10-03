---
name: status
description: Get current workflow and Linear status
agent: STRATEGIST
usage: "/status [--detailed] [--format=<json|table>]"
allowed-tools: [Read, Grep, Bash, mcp__linear-server__*]
argument-hint: "[--detailed] [--format=json|table]"
parameters:
  - name: detailed
    description: Include detailed agent and task information
    type: boolean
    required: false
  - name: format
    description: Output format
    type: string
    options: [json, table]
    default: table
---

# /status - Workflow Status

Get comprehensive status of the current workflow, Linear tasks, and agent activities using the STRATEGIST agent.

## Usage
```
/status [--detailed] [--format=<text|json>]
```

## Parameters
- `--detailed`: Include detailed metrics and agent status (default: false)
- `--format`: Output format (default: text)

## What This Command Does
The STRATEGIST agent will:
1. Query Linear for current sprint status
2. Check active agent operations
3. Review quality metrics and trends
4. Analyze CI/CD pipeline health
5. Report on TDD compliance
6. Provide velocity and performance metrics

## Expected Output
- **Sprint Status**: Current sprint progress and burndown
- **Active Tasks**: Linear tasks in progress with assignees
- **Quality Metrics**: Coverage, mutation scores, technical debt
- **Pipeline Health**: CI/CD status and recent failures
- **Agent Activity**: Current and recent agent operations
- **Performance Trends**: Velocity, efficiency, quality trends

## Examples
```bash
# Quick status overview
/status

# Detailed status with all metrics
/status --detailed

# JSON format for dashboard integration
/status --detailed --format=json
```

## Status Categories
- **Linear Integration**: Tasks, sprints, velocity
- **Code Quality**: Coverage, linting, type safety
- **Pipeline Status**: Build, test, deployment health
- **TDD Compliance**: Cycle adherence, coverage trends
- **Team Performance**: Efficiency metrics, pattern reuse

## Key Metrics
- Sprint velocity and burndown
- Test coverage percentage
- Pipeline success rate
- Average fix implementation time
- Pattern reuse rate