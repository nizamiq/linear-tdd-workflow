---
name: fix
description: Implement a fix from Linear using strict TDD
agent: EXECUTOR
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

Implement an approved fix from Linear using strict Test-Driven Development methodology with the EXECUTOR agent.

## Usage
```
/fix <TASK-ID> [--branch=<branch-name>]
```

## Parameters
- `TASK-ID`: Required. The Linear task ID (e.g., CLEAN-123)
- `--branch`: Optional. Custom branch name (default: feature/TASK-ID-description)

## What This Command Does
The EXECUTOR agent will:
1. Retrieve the task details from Linear
2. Create a feature branch following GitFlow
3. Implement the fix using strict TDD cycle:
   - **RED**: Write failing test first
   - **GREEN**: Minimal code to pass
   - **REFACTOR**: Improve with passing tests
4. Ensure ≥80% diff coverage
5. Commit with proper labels ([RED], [GREEN], [REFACTOR])
6. Create PR with comprehensive documentation

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

## SLAs
- Fix implementation: ≤15 minutes (p50)
- PR creation: ≤2 minutes
- Coverage validation: ≤1 minute