# /fix - TDD Fix Implementation

Implement a specific fix from Linear using strict Test-Driven Development.

## Usage
```
/fix <TASK-ID> [--validate-only] [--dry-run]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make fix TASK=CLEAN-123

# Direct journey execution
node .claude/journeys/jr3-fix-pack.js --task-id CLEAN-123

# Via CLI
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
```

## Parameters
- `<TASK-ID>`: Required Linear task ID (e.g., CLEAN-123)
- `--validate-only`: Only validate the fix, don't commit
- `--dry-run`: Show what would be done without changes

## TDD Enforcement (Non-negotiable)
Every fix follows the strict cycle:

### 1. RED Phase
- Write failing test FIRST
- Test must fail for the right reason
- Verify test actually tests the issue

### 2. GREEN Phase
- Write MINIMAL code to pass test
- No extra features or edge cases
- Must see test go from red to green

### 3. REFACTOR Phase
- Improve code with passing tests
- Clean up duplication
- Enhance readability

## Linear Integration
- **Reads**: Task details from Linear
- **Updates**: Task status through workflow
  - `Todo` → `In Progress` (start)
  - `In Progress` → `In Review` (PR created)
  - `In Review` → `Done` (merged)
- **Comments**: Adds PR link to Linear task
- **Time tracking**: Updates actual vs estimated

## MCP Tools Used
- `mcp__linear-server__get_issue` - Get task details
- `mcp__linear-server__update_issue` - Update status
- `mcp__linear-server__create_comment` - Add PR link
- `gh pr create` - Create GitHub PR

## Fix Pack Constraints
- **Max LOC**: 300 lines per PR
- **Coverage**: ≥80% diff coverage required
- **Atomic**: One fix per PR
- **Tests**: Must include tests

## FIL Classification
- **FIL-0**: Auto-approved (formatting, dead code)
- **FIL-1**: Auto-approved (simple renames, comments)
- **FIL-2**: Needs review (utilities, configs)
- **FIL-3**: Needs approval (APIs, migrations)

## Agents Involved
- **Primary**: EXECUTOR - Implements fix
- **Support**: TESTER - Creates test cases
- **Validation**: VALIDATOR - Reviews changes

## Output
1. **Feature branch**: `feature/CLEAN-123-fix-description`
2. **Commit**: Atomic with descriptive message
3. **Pull Request**: With Linear link
4. **Test results**: Coverage report
5. **Linear update**: Status and PR link

## SLAs
- Simple fix (FIL-0/1): ≤15 minutes
- Medium fix (FIL-2): ≤30 minutes
- Complex fix (FIL-3): ≤60 minutes

## Example Workflow
```bash
# 1. Get task from Linear
/fix CLEAN-123

# Output:
# [RED] Writing test for authentication timeout...
# ✗ Test failing as expected
# [GREEN] Implementing minimal fix...
# ✓ Test passing
# [REFACTOR] Improving code structure...
# ✓ All tests passing
#
# Created PR #456: Fix authentication timeout
# Linear CLEAN-123 updated to "In Review"
```

## Validation Gates
Before PR creation:
1. All tests pass
2. Coverage ≥80% on changed lines
3. Linting passes
4. Type checking passes
5. No security vulnerabilities

## Rollback Plan
Every fix includes:
- Revert instructions in PR
- Feature flag (if applicable)
- Rollback tested in staging

## Notes
- Enforces atomic commits
- Auto-links to Linear task
- Respects .gitignore
- Creates draft PR if confidence <85%