---
name: fix
description: Implement approved fix pack using strict TDD methodology (RED→GREEN→REFACTOR). Use PROACTIVELY when implementing any code changes, bug fixes, or improvements from Linear tasks.
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

## ⚠️ TDD PRE-FLIGHT CHECKLIST

**Before running `/fix`, verify you understand:**

- [ ] **TDD Cycle**: RED (failing test first) → GREEN (minimal code) → REFACTOR (improve design)
- [ ] **Coverage Gates**: ≥80% diff coverage (blocking), ≥30% mutation score (blocking)
- [ ] **NO production code without failing test first** - This is non-negotiable
- [ ] **EXECUTOR enforces TDD automatically** - You cannot bypass these requirements

**If you skip TDD, EXECUTOR will refuse to proceed.**

See `.claude/docs/TDD-REMINDER.md` for detailed TDD guidance.

## Usage
```
/fix <TASK-ID> [--branch=<branch-name>]
```

## Parameters
- `TASK-ID`: Required. The Linear task ID (e.g., CLEAN-123)
- `--branch`: Optional. Custom branch name (default: feature/TASK-ID-description)

## 🤖 Execution Instructions for Claude Code

**When user invokes `/fix <TASK-ID>`, execute immediately following strict TDD methodology.**

### Step 1: Retrieve Task from Linear
```
Use Task tool with:
- subagent_type: "STRATEGIST"
- description: "Retrieve Linear task [TASK-ID]"
- prompt: "You are the STRATEGIST agent. Retrieve task details from Linear:

Task ID: [user-provided TASK-ID]

Use Linear MCP server to:
1. Fetch task details (title, description, acceptance criteria)
2. Verify task is ready for implementation (state not 'Done' or 'Cancelled')
3. Extract technical requirements and constraints
4. Return task context to parent

Complete this immediately without waiting for confirmation."
```

### Step 2: Invoke EXECUTOR Agent for TDD Implementation
```
Use Task tool with:
- subagent_type: "EXECUTOR"
- description: "Implement fix for [TASK-ID] with strict TDD"
- prompt: "You are the EXECUTOR agent. Implement this fix using strict TDD methodology:

Task: [TASK-ID]
Title: [from STRATEGIST result]
Description: [from STRATEGIST result]
Branch: [user-provided branch or feature/TASK-ID-description]

Execute TDD cycle immediately:

**RED PHASE** (Write failing test first):
1. Create/modify test file in appropriate tests/ directory
2. Write test that captures expected behavior from acceptance criteria
3. Run test suite: npm test -- <test-file>
4. VERIFY test fails for expected reason
5. Commit with message: '[RED] <TASK-ID>: Add failing test for <feature>'

**GREEN PHASE** (Minimal code to pass):
6. Write MINIMUM production code to make test pass
7. Run test suite again: npm test -- <test-file>
8. VERIFY test passes
9. Commit with message: '[GREEN] <TASK-ID>: Implement minimal solution'

**REFACTOR PHASE** (Improve design):
10. Refactor production and test code for clarity
11. Run full test suite: npm test
12. VERIFY all tests still pass
13. Check coverage: npm test -- --coverage
14. VERIFY ≥80% diff coverage
15. Commit with message: '[REFACTOR] <TASK-ID>: Improve code design'

**PR CREATION**:
16. Push branch: git push -u origin <branch-name>
17. Create PR using gh CLI
18. Link PR to Linear task
19. Return PR URL to parent

Execute all steps autonomously. Do NOT skip RED phase or write production code before test exists."
```

### Step 3: Present Results
After EXECUTOR completes:
- Show TDD cycle summary (RED → GREEN → REFACTOR commits)
- Display coverage report (must be ≥80%)
- Provide PR URL
- Show Linear task link

### Step 4: Update Linear Task (Automatic)
EXECUTOR will automatically:
- Update Linear task status to "In Review"
- Add PR link to task
- Add comment with implementation summary

### Completion Criteria
- ✅ Feature branch created following GitFlow
- ✅ RED phase: Failing test committed
- ✅ GREEN phase: Passing implementation committed
- ✅ REFACTOR phase: Improved code committed
- ✅ Coverage ≥80% diff coverage achieved
- ✅ PR created and linked to Linear task
- ✅ All commits follow TDD labeling

### Expected Timeline
- Small fix (<100 LOC): 8-12 minutes
- Medium fix (100-200 LOC): 12-18 minutes
- Large fix (200-300 LOC): 18-25 minutes
- **MAX 300 LOC per Fix Pack** (enforced by EXECUTOR)

### Critical Constraints (ENFORCED)
- **NO production code before failing test** - EXECUTOR will refuse to proceed
- **Coverage gate ≥80%** - PR creation blocked if not met
- **FIL-0/1 changes only** - Feature work not allowed
- **Atomic commits** - Each TDD phase gets own commit
- **Rollback plan** - EXECUTOR prepares revert strategy

**DO NOT:**
- Ask "should I retrieve the task?" - just execute
- Skip RED phase and write production code first - this violates TDD
- Write tests and production code in same commit - separate by phase
- Bypass coverage gates - 80% is non-negotiable
- Ask to continue between TDD phases - execute full cycle autonomously

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

## Parallel Execution Support

When implementing **multiple independent fixes**, use STRATEGIST to coordinate parallel execution:

**Scenario: Batch Fix Implementation**
```bash
# Sequential approach (slow)
/fix CLEAN-123   # 15 min
/fix CLEAN-124   # 12 min
/fix CLEAN-125   # 18 min
/fix CLEAN-126   # 10 min
/fix CLEAN-127   # 14 min
# Total: 69 minutes

# Parallel approach via STRATEGIST (fast)
# User: "Implement CLEAN-123 through CLEAN-127"
# STRATEGIST launches 5 EXECUTOR agents concurrently
# Total: ~18 minutes (3.8x speedup)
```

**Requirements for Parallel Fixes:**
- ✅ Independent files (no overlapping changes)
- ✅ No shared dependencies
- ✅ Each fix ≤300 LOC
- ✅ All FIL-0 or FIL-1 level

**How It Works:**
1. User requests multiple fixes from Linear backlog
2. STRATEGIST analyzes fix dependencies
3. Groups independent fixes for parallel execution
4. Launches multiple EXECUTOR agents (max 10)
5. Each EXECUTOR follows full TDD cycle independently
6. Results merged: 5 PRs created simultaneously

**Best Practice:**
For batch operations, use STRATEGIST coordination:
```bash
# Instead of sequential /fix commands
# Use: "Implement all CLEAN-* tasks from current sprint"
# STRATEGIST will parallelize automatically
```

See `.claude/docs/PARALLEL-EXECUTION.md` for details.

## SLAs
- Single fix implementation: ≤15 minutes (p50)
- Parallel fix batch (5 fixes): ≤18 minutes (vs 69 min sequential)
- PR creation: ≤2 minutes
- Coverage validation: ≤1 minute