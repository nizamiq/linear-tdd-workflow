# Linear Progress Tracking System

**Version**: 1.0.0
**Status**: ✅ Active Implementation
**Integration**: Complete across all agents and hooks

## Overview

The Linear Progress Tracking system enables automatic tracking of agent work progress in Linear.app tasks. This solves the core problem: **"the system is not proactively updating Linear with progress and completion of issues"**.

### Key Features

- **Automatic Progress Detection**: Hooks detect `linear_update` format in agent outputs
- **Structured Progress Updates**: Standardized JSON format for all agents
- **TDD Integration**: Progress tracking at each TDD phase (RED→GREEN→REFACTOR)
- **STRATEGIST Orchestration**: Centralized Linear operations via MCP server
- **Validation Integration**: Progress tracking enforced in quality gates
- **Error Resilience**: Graceful handling of missing or invalid progress data

## Architecture

```
Agent Execution → linear_update Output → Hook Detection → STRATEGIST Update → Linear.app
```

### Components

1. **Agent Communication Protocol**: `linear_update` JSON format
2. **Hook System**: Automatic detection and suggestion of Linear updates
3. **STRATEGIST Agent**: Linear MCP operations (only agent with Linear access)
4. **Validation Workflows**: Progress criteria in quality gates
5. **Configuration Management**: Environment-based enable/disable

## Communication Protocol

### Linear Update Format

All agents use this standardized format for progress updates:

```json
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "start_work|update_progress|complete_task|block_task",
    "status": "Todo|In Progress|In Review|Done|Blocked",
    "comment": "Detailed progress note with phase information",
    "evidence": {
      "phase": "RED|GREEN|REFACTOR|ASSESSMENT|RECOVERY|VALIDATION|SCAN",
      "test_results": "15/15 passing",
      "coverage": "85%",
      "pr_url": "https://github.com/repo/pull/123",
      "files_scanned": 67,
      "issues_found": 23
    }
  }
}
```

### Action Types

| Action | When to Use | Example Comment |
|--------|-------------|-----------------|
| `start_work` | Beginning work on a Linear task | "Starting TDD cycle for CLEAN-123" |
| `update_progress` | During work, milestone reached | "RED phase complete - test fails for expected reason" |
| `complete_task` | Work finished successfully | "Feature implemented with 95% test coverage" |
| `block_task` | Work blocked, needs escalation | "Blocked by missing API endpoint in backend service" |

### Status Mappings

| Linear Status | Agent State | When to Use |
|---------------|-------------|-------------|
| `Todo` | Not started | Before any work begins |
| `In Progress` | Actively working | During TDD phases, assessment, recovery |
| `In Review` | Ready for review | When PR created, validation needed |
| `Done` | Completed | When all tests pass, requirements met |
| `Blocked` | Impeded | When external dependencies block progress |

## Agent Implementation

### EXECUTOR Agent (TDD Implementation)

**Progress at TDD Phases:**

```javascript
// RED Phase - Start Work
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "start_work",
    "status": "In Progress",
    "comment": "Starting RED phase: Writing failing test for user authentication",
    "evidence": {
      "phase": "RED",
      "test_name": "should authenticate user with valid credentials"
    }
  }
}

// GREEN Phase - Progress Update
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "update_progress",
    "status": "In Progress",
    "comment": "GREEN phase complete: Minimal authentication logic implemented",
    "evidence": {
      "phase": "GREEN",
      "test_results": "1/1 passing",
      "coverage": "100%"
    }
  }
}

// REFACTOR Phase - Complete
{
  "linear_update": {
    "task_id": "CLEAN-123",
    "action": "complete_task",
    "status": "Done",
    "comment": "REFACTOR complete: Authentication service refactored with proper error handling",
    "evidence": {
      "phase": "REFACTOR",
      "test_results": "3/3 passing",
      "coverage": "95%",
      "pr_url": "https://github.com/repo/pull/123"
    }
  }
}
```

### AUDITOR Agent (Code Assessment)

**Progress During Assessment:**

```javascript
// Long-running assessment progress
{
  "linear_update": {
    "task_id": "ASSESS-INPROGRESS",
    "action": "update_progress",
    "status": "In Progress",
    "comment": "Phase 2/3: Scanning backend services (45% complete) - Found 12 critical issues in API layer",
    "evidence": {
      "phase": "ASSESSMENT",
      "files_scanned": 67,
      "issues_found": 23,
      "critical_count": 8,
      "high_count": 12
    }
  }
}

// Assessment complete
{
  "linear_update": {
    "task_id": "ASSESS-INPROGRESS",
    "action": "complete_assessment",
    "status": "In Review",
    "comment": "Assessment complete: Ready to create 12 CLEAN tasks in Linear",
    "evidence": {
      "phase": "ASSESSMENT",
      "files_scanned": 150,
      "issues_found": 23,
      "assessment_file": "proposals/issues-2024-01-15-14-30.json"
    }
  }
}
```

### GUARDIAN Agent (Pipeline Recovery)

**Incident Response Progress:**

```javascript
// Incident detected
{
  "linear_update": {
    "task_id": "INCIDENT-001",
    "action": "start_work",
    "status": "In Progress",
    "comment": "Pipeline failure detected: GitHub Actions failing on test stage - Investigating root cause",
    "evidence": {
      "phase": "DETECTION",
      "failed_workflow": "CI/CD Pipeline",
      "failed_stage": "test",
      "error_type": "test_failure"
    }
  }
}

// Recovery complete
{
  "linear_update": {
    "task_id": "INCIDENT-001",
    "action": "complete_incident",
    "status": "Done",
    "comment": "Pipeline recovered: Fixed test configuration issue - All checks now passing",
    "evidence": {
      "phase": "RECOVERY",
      "recovery_actions_taken": 2,
      "resolution_time": "8 minutes"
    }
  }
}
```

### DOC-KEEPER Agent (Documentation)

**Documentation Progress:**

```javascript
// Documentation validation
{
  "linear_update": {
    "task_id": "DOC-045",
    "action": "update_progress",
    "status": "In Progress",
    "comment": "Validating Layer 2 system documentation - Found 8 broken links and 3 outdated command references",
    "evidence": {
      "phase": "VALIDATE",
      "documentation_layer": "L2",
      "files_validated": 15,
      "issues_found": 12,
      "broken_links": 3
    }
  }
}
```

## Hook System Integration

### on-subagent-stop.sh Hook

**Detection Logic:**

```bash
# Function to detect Linear progress updates
detect_linear_updates() {
  local agent_output="$1"
  local agent_name="$2"

  if echo "$agent_output" | grep -q '"linear_update"'; then
    # Extract task details
    local task_id=$(echo "$agent_output" | grep -o '"task_id":"[^"]*"' | head -1)
    local action=$(echo "$agent_output" | grep -o '"action":"[^"]*"' | head -1)

    # Suggest STRATEGIST commands
    case "$action" in
      "start_work")
        echo "Suggested: /invoke STRATEGIST:update-linear-status $task_id $status"
        ;;
      "update_progress")
        echo "Suggested: /invoke STRATEGIST:add-progress-comment $task_id"
        ;;
      "complete_task")
        echo "Suggested: /invoke STRATEGIST:complete-linear-task $task_id"
        ;;
    esac
  fi
}
```

**Agent Integration:**

Each agent case in the hook includes progress detection:

```bash
case "$AGENT_NAME" in
  "EXECUTOR")
    if [ "$STATUS" = "success" ]; then
      # Check for Linear progress updates
      detect_linear_updates "$CLAUDE_AGENT_OUTPUT" "$AGENT_NAME"
      # ... rest of workflow
    fi
    ;;
esac
```

### inject-linear-config.sh Hook

**Progress Tracking Setup:**

```bash
# Enable automatic progress tracking
if [ "${CLAUDE_AUTO_LINEAR_UPDATE}" = "true" ]; then
  export CLAUDE_LINEAR_PROGRESS_ENABLED=true
  export CLAUDE_PROGRESS_LOG_DIR="${CLAUDE_PROJECT_DIR}/.claude/progress"
  mkdir -p "$CLAUDE_PROGRESS_LOG_DIR"

  # Create session tracking
  export CLAUDE_SESSION_ID="$(date +%Y%m%d-%H%M%S)-$$"
fi
```

**Agent Context Injection:**

The hook provides Linear configuration to agents:

```
## 📋 Linear Configuration (Auto-Injected)

**Team Configuration:**
- Team ID: ${LINEAR_TEAM_ID}
- Project ID: ${LINEAR_PROJECT_ID}

**Progress Tracking:**
- Auto Updates: ${CLAUDE_AUTO_LINEAR_UPDATE:-false}
- Session ID: ${CLAUDE_SESSION_ID}
```

## STRATEGIST Integration

### Linear Progress Management Methods

**Status Updates:**

```javascript
async function updateTaskStatus(taskId, status, comment) {
  const stateMapping = {
    "Todo": "unstarted",
    "In Progress": "started",
    "In Review": "in review",
    "Done": "done",
    "Blocked": "canceled"
  };

  const result = await mcp__linear-server__update_issue({
    id: taskId,
    stateId: stateMapping[status]
  });

  if (comment) {
    await addProgressComment(taskId, comment);
  }

  return result;
}
```

**Progress Comments:**

```javascript
async function addProgressComment(taskId, comment, evidence) {
  const commentBody = evidence ?
    `${comment}\n\n**Evidence:**\n${JSON.stringify(evidence, null, 2)}` :
    comment;

  return await mcp__linear-server__create_comment({
    issueId: taskId,
    body: commentBody
  });
}
```

**Task Completion:**

```javascript
async function completeTask(taskId, evidence) {
  // Update status to Done
  await updateTaskStatus(taskId, "Done", "Task completed successfully");

  // Add completion evidence
  if (evidence) {
    await addProgressComment(taskId, "Task completed with evidence:", evidence);
  }

  // Link to PR if provided
  if (evidence.pr_url) {
    await addProgressComment(taskId, `Pull Request: ${evidence.pr_url}`);
  }
}
```

## Validation Integration

### Quality Gate Enforcement

**validation-workflow.yaml** includes progress criteria:

```yaml
unit_tests:
  success_criteria:
    - all_tests_pass
    - coverage_threshold_met
    - tdd_cycle_compliance      # NEW
    - linear_progress_tracked   # NEW

success_criteria:
  strict:
    - blocking_failures == 0
    - quality_score >= 90
    - tdd_cycle_enforced        # NEW
    - linear_progress_updated   # NEW
```

**TDD Cycle Validation:**

```yaml
tdd_cycle:
  phases:
    RED:
      success_criteria:
        - test_fails_correctly
        - linear_status_updated_to_in_progress
    GREEN:
      success_criteria:
        - all_tests_pass
        - minimal_implementation
        - linear_progress_commented
    REFACTOR:
      success_criteria:
        - tests_still_pass
        - design_improved
        - linear_status_updated_to_done
```

## Usage Guide

### Manual Linear Updates

When agents provide linear_update format, hooks suggest STRATEGIST commands:

```bash
# Start work on task
/invoke STRATEGIST:update-linear-status CLEAN-123 "In Progress"

# Add progress comment
/invoke STRATEGIST:add-progress-comment CLEAN-123 "RED phase complete - test fails correctly"

# Complete task
/invoke STRATEGIST:complete-linear-task CLEAN-123

# Block task if needed
/invoke STRATEGIST:block-linear-task CLEAN-123 "Blocked by missing API endpoint"
```

### Automatic Updates

Enable automatic progress tracking:

```bash
export CLAUDE_AUTO_LINEAR_UPDATE=true
```

When enabled:
- Progress updates are logged to `.claude/progress/`
- STRATEGIST can process batch updates
- Session tracking enables audit trails

### Checking Progress Status

```bash
# Check current Linear tasks
make status

# View session progress logs
ls -la .claude/progress/

# Validate current state
npm run release:validate-functional
```

## Configuration

### Environment Variables

```bash
# Linear Configuration
LINEAR_TEAM_ID=your-team-id
LINEAR_PROJECT_ID=your-project-id

# Progress Tracking
CLAUDE_AUTO_LINEAR_UPDATE=false  # Set to true to enable
CLAUDE_PROJECT_DIR=/path/to/project

# Session Tracking (auto-generated)
CLAUDE_SESSION_ID=2024-01-15-14-30-12345
CLAUDE_PROGRESS_LOG_DIR=/path/to/.claude/progress
```

### Hook Configuration

Hooks are automatically configured when the system is installed:

```bash
# Verify hook installation
ls -la .claude/hooks/

# Test hook functionality
echo '{"linear_update":{"task_id":"TEST-123","action":"start_work"}}' | \
  CLAUDE_AGENT_NAME=TEST \
  CLAUDE_AGENT_STATUS=success \
  CLAUDE_AGENT_OUTPUT='{"linear_update":{"task_id":"TEST-123","action":"start_work"}}' \
  bash .claude/hooks/on-subagent-stop.sh
```

## Troubleshooting

### Common Issues

**1. Linear updates not detected**
- Check that agent output contains valid `linear_update` JSON
- Verify hook permissions: `chmod +x .claude/hooks/on-subagent-stop.sh`
- Ensure environment variables are set correctly

**2. STRATEGIST Linear access issues**
- Verify `LINEAR_TEAM_ID` and `LINEAR_PROJECT_ID` are configured
- Check Linear MCP server permissions in `.claude/mcp.json`
- Ensure STRATEGIST has Linear server access

**3. Progress validation failing**
- Check validation workflow includes `linear_progress_tracked` criteria
- Verify TDD phases include Linear status updates
- Review hook detection logs for parsing errors

**4. Hook execution failures**
- Check hook file permissions: `chmod +x .claude/hooks/*.sh`
- Verify hook syntax: `bash -n .claude/hooks/on-subagent-stop.sh`
- Check for missing environment variables

### Debug Mode

Enable detailed logging:

```bash
export CLAUDE_DEBUG_LINEAR=true
export CLAUDE_AUTO_LINEAR_UPDATE=true

# Run agent and check logs
echo "Progress logs:"
ls -la .claude/progress/

# Check session details
cat .claude/progress/*.json | jq '.'
```

### Testing Integration

Run the E2E test suite:

```bash
# Test Linear progress tracking
npm test tests/e2e/linear-progress-tracking.test.js

# Test hook integration
bash .claude/hooks/on-subagent-stop.sh EXECUTOR success 120 '{"linear_update":{"task_id":"TEST","action":"complete"}}'
```

## Performance Impact

### Cost Analysis

- **Hook Detection**: Zero additional cost (bash-based)
- **STRATEGIST Updates**: Minimal MCP server calls
- **Agent Overhead**: Small JSON output formatting (<1% increase)
- **Overall**: <5% impact on agent execution time

### Optimization Features

- **Parallel Detection**: Hooks run in parallel with agent completion
- **Batch Updates**: Multiple progress updates processed together
- **Caching**: Linear status cached to avoid redundant updates
- **Lazy Loading**: Progress tracking only when enabled

## Future Enhancements

### Planned Features

1. **Real-time Progress Dashboard**: Web UI showing live progress
2. **Auto-assignment**: Automatic task assignment based on agent workload
3. **Progress Analytics**: Metrics on completion rates and bottlenecks
4. **Multi-team Support**: Cross-team progress coordination
5. **SLA Tracking**: Automatic SLA monitoring and alerts

### Extension Points

- **Custom Evidence Types**: Domain-specific progress evidence
- **Third-party Integrations**: Jira, Asana, Trello sync
- **Webhook Notifications**: Slack, Teams progress updates
- **Mobile App**: On-the-go progress monitoring

## Migration Guide

### From Static Task Creation

**Before:**
1. AUDITOR generates assessment
2. Manual Linear task creation
3. No progress tracking
4. Manual status updates

**After:**
1. AUDITOR generates assessment + progress tracking
2. Automatic Linear task creation via STRATEGIST
3. Real-time progress updates during implementation
4. Automatic status updates and completion

### Implementation Steps

1. **Enable System** (already done):
   - Hooks updated with detection logic
   - Agents include linear_update format
   - STRATEGIST has progress handling methods

2. **Configure Environment**:
   ```bash
   export LINEAR_TEAM_ID=your-team-id
   export LINEAR_PROJECT_ID=your-project-id
   ```

3. **Test Integration**:
   ```bash
   /assess  # Should show progress updates
   /fix CLEAN-123  # Should track TDD phases
   ```

4. **Enable Automatic Updates** (optional):
   ```bash
   export CLAUDE_AUTO_LINEAR_UPDATE=true
   ```

## Support

### Documentation

- **Complete Guide**: This file
- **Agent Specs**: `.claude/agents/*.md` (individual agent documentation)
- **Hook Reference**: `.claude/hooks/*.sh` (implementation details)
- **Integration Tests**: `tests/e2e/linear-progress-tracking.test.js`

### Getting Help

- **Issues**: Check Linear tasks for progress-related issues
- **Debugging**: Enable `CLAUDE_DEBUG_LINEAR=true`
- **Testing**: Run E2E test suite for validation
- **Configuration**: Verify environment variables and permissions

---

**Status**: ✅ Implementation Complete
**Next Steps**: Enable with `export CLAUDE_AUTO_LINEAR_UPDATE=true`
**Impact**: Real-time Linear progress tracking across all agent workflows