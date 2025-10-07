# Linear Integration Scripts

Helper scripts for Linear.app integration within the `.claude` directory tree.

## Overview

These scripts provide Linear task management capabilities for the TDD workflow system. All scripts are self-contained within `.claude` for easy drop-in installation.

## Scripts

### `create-tasks-from-assessment.sh`

Creates Linear tasks from AUDITOR assessment results.

**Usage**:

```bash
# From STRATEGIST agent or hooks
.claude/scripts/linear/create-tasks-from-assessment.sh proposals/issues-2025-10-01.json
```

**Environment Variables**:

- `LINEAR_API_KEY` - Linear API token (required)
- `LINEAR_TEAM_ID` - Linear team ID (required)
- `LINEAR_PROJECT_ID` - Linear project ID (optional)

**Input Format**:
Assessment JSON file with `linear_tasks` array:

```json
{
  "linear_tasks": [
    {
      "title": "Fix: Issue title",
      "description": "Detailed description with markdown",
      "labels": ["code-quality", "critical"],
      "priority": 1,
      "estimated_hours": 2
    }
  ]
}
```

**Output**:

- Prints created task IDs to stdout
- Returns exit code 0 on success, 1 if any task creation failed

**Integration with Claude Code**:

In Claude Code, STRATEGIST should use MCP tools directly instead of calling this script:

```javascript
// Preferred: Direct MCP call
const result =
  (await mcp__linear) -
  server__create_issue({
    team: process.env.LINEAR_TEAM_ID,
    title: taskDef.title,
    description: taskDef.description,
    labels: taskDef.labels,
    priority: taskDef.priority,
  });
```

This script serves as a fallback for:

- CI/CD automation (GitHub Actions, Jenkins)
- Manual task creation from terminal
- Testing Linear integration without Claude Code

## Directory Structure

```
.claude/scripts/linear/
├── README.md                          # This file
├── create-tasks-from-assessment.sh    # Batch task creation
└── [future scripts]
```

## Configuration

Linear credentials should be set as environment variables:

```bash
# .env (do not commit!)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=abc123
LINEAR_PROJECT_ID=proj456  # optional
```

Or via export:

```bash
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxx"
export LINEAR_TEAM_ID="abc123"
```

## Testing

Test scripts without creating real tasks:

```bash
# Dry run using mock assessment
cat > /tmp/test-assessment.json <<EOF
{
  "linear_tasks": [
    {
      "title": "Test: Sample task",
      "description": "This is a test task",
      "labels": ["test"],
      "priority": 4
    }
  ]
}
EOF

# Run script (will attempt actual creation)
.claude/scripts/linear/create-tasks-from-assessment.sh /tmp/test-assessment.json
```

## Error Handling

Scripts use exit codes and colored output:

- **Green (✓)**: Success
- **Red (✗)**: Error
- **Yellow (⚠)**: Warning
- **Blue (ℹ)**: Info

Exit codes:

- `0`: All tasks created successfully
- `1`: One or more tasks failed to create

## Best Practices

1. **Use MCP in Claude Code**: When running in Claude Code sessions, STRATEGIST should use `mcp__linear-server__*` tools directly instead of these scripts.

2. **Scripts for CI/CD**: Use these scripts in automated pipelines where MCP isn't available.

3. **Rate Limiting**: Scripts include 200ms delays between API calls to respect Linear's rate limits.

4. **Error Recovery**: Failed task creations are logged but don't prevent subsequent tasks from being attempted.

5. **Idempotency**: Check for existing tasks before creation to avoid duplicates (future enhancement).

## Future Enhancements

- [ ] Add `update-task-status.sh` for workflow transitions
- [ ] Add `link-pr-to-task.sh` for GitHub PR integration
- [ ] Add `query-tasks.sh` for reading Linear data
- [ ] Add task deduplication logic
- [ ] Add retry logic with exponential backoff
- [ ] Add webhook event handlers (for advanced setups)
