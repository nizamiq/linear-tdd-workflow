# Implement Task

Execute a specific improvement task from the Linear backlog.

## Usage
```
/implement-task <task-id> [--branch=<branch-name>] [--test-first]
```

## Description
This command instructs the **EXECUTOR** agent to implement a specific task, following TDD principles and best practices.

## Parameters
- `task-id`: Linear task identifier (required)
- `--branch`: Custom branch name (default: auto-generated)
- `--test-first`: Write tests before implementation

## Process
1. Fetch task details from Linear
2. Create a feature branch
3. Implement changes
4. Run tests
5. Commit changes
6. Update task status

## Example
```
/implement-task CLEAN-123 --test-first
```
