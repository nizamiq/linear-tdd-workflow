# Implement Task

Execute a specific improvement task from the Linear backlog following strict TDD principles.

## Usage
```
/implement-task <task-id> [--branch=<branch-name>] [--test-first] [--language=<js|ts|python>]
```

## Description
This command instructs the EXECUTOR agent to implement a specific task, following TDD principles and best practices for both JavaScript/TypeScript and Python codebases.

## Parameters
- `task-id`: Linear task identifier (required) - e.g., CLEAN-123
- `--branch`: Custom branch name (default: auto-generated from task)
- `--test-first`: Enforce writing tests before implementation (default: true)
- `--language`: Target language if ambiguous (auto-detected by default)

## Agents Involved
- **Primary**: EXECUTOR - Implements the task
- **Support**: VALIDATOR - Runs tests and validates coverage
- **Review**: REVIEWER - Checks implementation quality

## Process Flow
1. Fetch task details from Linear
2. Create feature branch (agent/{agent-name}/{task-id}-{description})
3. Write failing tests (RED phase)
4. Implement minimal code to pass tests (GREEN phase)
5. Refactor for quality (REFACTOR phase)
6. Run full test suite
7. Verify diff coverage ≥80%
8. Commit with descriptive message
9. Create pull request
10. Update Linear task status

## Language-Specific Handling

### JavaScript/TypeScript
- Test frameworks: Jest, Mocha, Vitest
- Linting: ESLint
- Formatting: Prettier
- Type checking: TypeScript compiler
- Coverage: NYC, C8

### Python
- Test frameworks: pytest, unittest
- Linting: Pylint, Ruff
- Formatting: Black
- Type checking: mypy
- Coverage: coverage.py

## Examples
```bash
# Implement a JavaScript task
/implement-task CLEAN-123

# Python task with custom branch
/implement-task CLEAN-456 --branch=fix/optimize-algorithm

# Ensure test-first approach
/implement-task CLEAN-789 --test-first
```

## Quality Gates
- All existing tests must pass
- Diff coverage must be ≥80%
- No linting errors
- Type checking passes (if applicable)
- Documentation updated
- Commit messages follow convention

## SLAs
- Simple fix: ≤15 minutes
- Medium complexity: ≤30 minutes
- Complex refactoring: ≤60 minutes