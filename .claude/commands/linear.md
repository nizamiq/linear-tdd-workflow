---
name: linear
description: Create Linear tasks from assessment results
agent: STRATEGIST
priority: high
allowed-tools: [Read, mcp__linear-server__*]
argument-hint: "[proposals/issues-*.json]"
---

# /linear - Create Linear Tasks from Assessment

Creates Linear issues from AUDITOR assessment results using STRATEGIST.

## ⚠️ CRITICAL: TDD Requirement

**After creating Linear tasks, ALL implementations MUST follow strict Test-Driven Development:**

1. **[RED]** - Write failing test FIRST (no exceptions)
2. **[GREEN]** - Write minimal code to pass test
3. **[REFACTOR]** - Improve design with passing tests

**Non-Negotiable Quality Gates:**
- ≥80% diff coverage (blocking)
- ≥30% mutation score (blocking)
- **NO production code without failing test first**

**The `/fix` command enforces TDD automatically through the EXECUTOR agent.**

## Usage

```bash
# Auto-detect latest assessment file
/linear

# Specify assessment file explicitly
/linear proposals/issues-2025-10-01-120000.json

# With options
/linear --dry-run           # Preview without creating tasks
/linear --priority urgent   # Set all tasks to urgent priority
/linear --team TEAM-ID      # Override team ID
```

## When to Use

Use this command **immediately after** running `/assess`:

```bash
# Step 1: Run assessment
/assess

# Step 2: Create Linear tasks from assessment
/linear
```

The command will:
1. Find the latest assessment file (or use the one you specify)
2. Read the `linear_tasks` array from assessment JSON
3. Create Linear issues via STRATEGIST's MCP access
4. Return the created task IDs (CLEAN-XXX format)

## Prerequisites

Ensure these environment variables are set in `.env`:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=your-team-id
LINEAR_PROJECT_ID=your-project-id  # optional
```

## What Gets Created

For each issue in the assessment's `linear_tasks` array, creates a Linear issue with:

- **Title**: From assessment (e.g., "Fix: SQL injection in auth.py")
- **Description**: Markdown formatted with:
  - Issue details (file, line, severity)
  - Recommended fix
  - Estimated effort
- **Labels**: From assessment (e.g., ["code-quality", "critical", "security"])
- **Priority**: Based on severity (1=Urgent, 2=High, 3=Normal, 4=Low)
- **Team**: From `LINEAR_TEAM_ID` environment variable
- **State**: "Backlog" (default)

## Example Output

```
Creating Linear tasks from assessment...
Assessment file: proposals/issues-2025-10-01-120000.json

Found 5 tasks to create:
  ✓ CLEAN-123: Fix: SQL injection in auth.py [Critical]
  ✓ CLEAN-124: Fix: Exposed API key in client.js [Critical]
  ✓ CLEAN-125: Fix: N+1 query in dashboard [High]
  ✓ CLEAN-126: Refactor: Extract validation logic [High]
  ✓ CLEAN-127: Fix: Missing error handling [Medium]

Successfully created 5 Linear tasks
Total estimated effort: 12 hours

Next steps:
  /fix CLEAN-123     # Implement first critical fix
  /status            # View all tasks in current sprint
```

## Options

### `--dry-run`
Preview tasks without creating them:

```bash
/linear --dry-run
```

Output shows what would be created without making API calls.

### `--priority <level>`
Override priority for all tasks:

```bash
/linear --priority urgent    # Set all to priority 1 (Urgent)
/linear --priority high      # Set all to priority 2 (High)
/linear --priority normal    # Set all to priority 3 (Normal)
/linear --priority low       # Set all to priority 4 (Low)
```

### `--team <TEAM-ID>`
Override the default team ID:

```bash
/linear --team abc123
```

### `--project <PROJECT-ID>`
Assign all tasks to a specific project:

```bash
/linear --project proj456
```

### `--labels <label1,label2>`
Add additional labels to all tasks:

```bash
/linear --labels sprint-2,tech-debt
```

## Task Naming Convention

Created tasks follow this pattern:

- **CLEAN-XXX**: Code quality fixes (from AUDITOR)
- **INCIDENT-XXX**: CI/CD failures (from GUARDIAN)
- **DOC-XXX**: Documentation issues (from DOC-KEEPER)

Linear auto-increments the number (XXX) based on your team's sequence.

## Error Handling

### Missing Environment Variables

```
❌ ERROR: LINEAR_API_KEY not set

Solution:
  1. Create .env file in project root
  2. Add: LINEAR_API_KEY=lin_api_xxxxx
  3. Add: LINEAR_TEAM_ID=your-team-id
  4. Restart Claude Code session
```

### No Assessment File Found

```
❌ ERROR: No assessment file found

Solution:
  1. Run /assess first to generate assessment
  2. Or specify file explicitly: /linear proposals/issues-TIMESTAMP.json
```

### Linear API Failure

```
❌ ERROR: Linear API rate limit exceeded

Solution:
  Wait 60 seconds and retry
  Or use --batch option to group requests
```

### Permission Denied

```
❌ ERROR: Linear API key lacks permission to create issues

Solution:
  1. Verify API key has "Write" permissions in Linear settings
  2. Check team ID matches your workspace
  3. Ensure you're a member of the team
```

## Under the Hood

This command invokes **STRATEGIST** agent with Linear MCP access:

```yaml
Workflow:
  1. Find latest assessment in proposals/
  2. Parse linear_tasks array from JSON
  3. For each task:
     - Call mcp__linear-server__create_issue()
     - Map assessment fields to Linear fields
     - Handle rate limiting (200ms between requests)
     - Retry on failure (max 3 attempts)
  4. Return created task IDs
  5. Update enhancement queue
```

## Fallback for CI/CD

If running in CI/CD without Claude Code MCP, use the helper script:

```bash
.claude/scripts/linear/create-tasks-from-assessment.sh proposals/issues-TIMESTAMP.json
```

## Integration with Other Commands

This command integrates seamlessly with the TDD workflow:

```bash
# Complete workflow
/assess                    # Step 1: Scan code quality
/linear                    # Step 2: Create Linear tasks
/fix CLEAN-123            # Step 3: Implement fix with TDD
/status                   # Step 4: Check progress
```

## Agent Details

**Primary Agent**: STRATEGIST
**MCP Tools Used**: `mcp__linear-server__create_issue`, `mcp__linear-server__list_issues`
**Execution Time**: ~2-5 seconds for 10 tasks
**Token Usage**: ~500-1,000 tokens

## Success Criteria

Command succeeds when:
- ✓ All tasks from assessment created in Linear
- ✓ Task IDs returned to user (CLEAN-XXX format)
- ✓ Tasks visible in Linear workspace
- ✓ Proper labels, priority, and description set
- ✓ No API errors or permission issues

## Related Commands

- `/assess` - Generate assessment with task definitions (prerequisite)
- `/fix <TASK-ID>` - Implement fix for a Linear task
- `/status` - View current sprint status including Linear tasks
- `/cycle plan` - Plan sprint with Linear integration

## Troubleshooting

**Problem**: "Assessment file has no linear_tasks array"

**Solution**: This happens when AUDITOR finds no issues. This is expected for high-quality codebases. Re-run `/assess` with a different scope or check if assessment was interrupted.

---

**Problem**: "Created tasks don't appear in Linear"

**Solution**:
1. Check Linear team ID matches your workspace
2. Verify you have permission to view team's backlog
3. Try filtering by label: "code-quality"
4. Check if tasks were created in a different project

---

**Problem**: "Rate limit exceeded"

**Solution**: Linear API limits: 1,000 requests per hour. Wait 60 seconds between large batches or use `--batch` mode to group requests.

## Examples

### Basic Usage (Most Common)

```bash
# After running /assess
/linear
```

### Dry Run (Preview)

```bash
/linear --dry-run
```

### Urgent Priority Override

```bash
/linear --priority urgent
```

### Specific Team

```bash
/linear --team engineering-team-id
```

### With Additional Labels

```bash
/linear --labels sprint-3,q4-cleanup
```

## Best Practices

1. **Run immediately after `/assess`** - Task definitions are freshest
2. **Review assessment first** - Check `proposals/issues-TIMESTAMP.json` before creating
3. **Use dry-run for large batches** - Preview 50+ tasks before creating
4. **Check Linear workspace** - Verify tasks created correctly
5. **Link to PRs** - STRATEGIST auto-links PRs when using `/fix`

## Notes

- Only STRATEGIST can create Linear tasks (exclusive MCP access)
- Other agents (AUDITOR, GUARDIAN) generate task definitions → STRATEGIST creates them
- This prevents permission conflicts and ensures consistent task management
- Created tasks are in "Backlog" state - use Linear or `/cycle plan` to schedule them
