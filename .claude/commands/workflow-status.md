# /status - Workflow & System Status

Get real-time status of the TDD workflow, Linear tasks, and agent availability.

## Usage
```
/status [--verbose] [--format=table|json]
```

## Script Entrypoints
```bash
# Via Makefile (recommended)
make status

# Via CLI
npm run linear:status
npm run agent:status

# Direct check
node .claude/cli.js status
```

## Parameters
- `--verbose`: Detailed status information
- `--format`: Output format
  - `table`: Human-readable (default)
  - `json`: Machine-readable

## Status Components

### 1. Linear Sprint Status
```
Current Sprint: Sprint 23
━━━━━━━━━━━━━━━━━━━━━━━━
📊 Progress: ████████░░ 82%
✅ Done: 41 tasks
🔄 In Progress: 8 tasks
📝 Todo: 11 tasks
⏱️ Days remaining: 3
```

### 2. Task Pipeline
```
Task Pipeline Status
━━━━━━━━━━━━━━━━━━━━
CLEAN-XXX Issues:
  P0: 0 🟢
  P1: 2 🟡
  P2: 15 🟢
  P3: 8 🟢

In Review: 5 PRs
Blocked: 1 task
```

### 3. CI/CD Health
```
Pipeline Status
━━━━━━━━━━━━━━
main: ✅ passing
develop: ✅ passing
Last failure: 3 days ago
Success rate: 97.5%
```

### 4. Agent Status
```
Agent Availability
━━━━━━━━━━━━━━━━
AUDITOR:    🟢 idle
EXECUTOR:   🟡 busy (CLEAN-123)
GUARDIAN:   🟢 monitoring
STRATEGIST: 🟢 available
SCHOLAR:    🔵 learning
```

### 5. Metrics Dashboard
```
Performance Metrics (Last 7 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix completion: 18min avg (SLA: 30min) ✅
Assessment time: 8min avg (SLA: 12min) ✅
Pipeline MTTR: 7min avg (SLA: 10min) ✅
Test coverage: 87% (min: 80%) ✅
```

## Linear Integration
Real-time queries via MCP:
- Active sprint progress
- Task distribution by status
- Blocked items with reasons
- Team velocity trends

## MCP Tools Used
- `mcp__linear-server__list_issues` - Current tasks
- `mcp__linear-server__list_cycles` - Sprint info
- `gh run list` - CI/CD status
- `gh pr list` - PR queue

## Information Sources
1. **Linear API** - Task and sprint data
2. **GitHub API** - PR and CI status
3. **Local Cache** - Agent states
4. **Metrics Store** - Historical data

## Output Formats

### Standard View
```bash
/status

# Displays:
- Sprint progress bar
- Task counts by priority
- CI/CD status lights
- Active agent operations
```

### Verbose View
```bash
/status --verbose

# Additionally shows:
- Individual task details
- PR review queue
- Agent confidence scores
- Detailed metrics
```

### JSON Format
```json
{
  "sprint": {
    "name": "Sprint 23",
    "progress": 0.82,
    "tasks": { "done": 41, "doing": 8, "todo": 11 }
  },
  "pipeline": { "status": "passing", "success_rate": 0.975 },
  "agents": { "active": 1, "idle": 4 }
}
```

## Quick Actions
Based on status, suggests actions:
```
Suggested Actions:
━━━━━━━━━━━━━━━━━
⚠️ 2 P1 issues need attention
   → Run: /fix CLEAN-501
⚠️ 5 PRs awaiting review
   → Review queue in Linear
✅ All systems operational
```

## Monitoring Alerts
Automatic alerts for:
- P0 issues created
- Pipeline failures
- SLA violations
- Sprint burndown risks

## Example Workflow
```bash
# Morning check
/status

# Output shows 2 P1 issues
/fix CLEAN-501

# Check progress
/status --verbose

# Export for standup
/status --format=json > standup.json
```

## Dashboard Integration
Can be used for:
- Slack status updates
- Team dashboards
- Daily standups
- Sprint reviews

## Auto-Refresh
In monitoring mode:
```bash
# Live dashboard (updates every 30s)
make monitor
```

## Health Indicators
- 🟢 Green: Optimal
- 🟡 Yellow: Attention needed
- 🔴 Red: Critical issue
- 🔵 Blue: Information

## SLA Tracking
Shows performance against SLAs:
- Assessment: ≤12min
- Fix implementation: ≤30min
- Pipeline recovery: ≤10min
- Release cycle: ≤2 hours

## Notes
- Caches data for 60 seconds
- Respects rate limits
- Shows only accessible data
- Configurable thresholds