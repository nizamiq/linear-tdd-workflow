# 🔌 Integrations Directory - Claude Code Guide

## Purpose

This directory contains integration modules that connect the workflow system with external services, primarily Linear.app for task management and MCP (Model Context Protocol) for tool access.

## Available Integrations

### Linear MCP Integration (`linear-mcp-integration.js`)
**Purpose:** Direct integration with Linear via MCP tools
**Features:**
- Task creation and updates
- Sprint management
- Label handling
- Project tracking
**Usage:**
```javascript
const linear = require('./linear-mcp-integration');
await linear.createTask({
  title: 'Fix linting issues',
  description: 'Auto-generated from assessment',
  labels: ['clean-code', 'auto-fix']
});
```

### Agent Linear Integration (`agent-linear-integration.js`)
**Purpose:** Agent-specific Linear operations
**Features:**
- Agent permission enforcement
- Task routing by agent type
- Status synchronization
**Key Functions:**
- `createAuditTask()` - Creates CLEAN-XXX tasks
- `updateExecutorProgress()` - Updates fix progress
- `createIncident()` - Creates INCIDENT-XXX issues

## Integration Patterns

### Task Creation Pattern
```javascript
// AUDITOR creates quality issues
const task = await createLinearTask({
  title: `[CLEAN-${id}] ${issue.title}`,
  description: issue.description,
  priority: calculatePriority(issue),
  labels: ['clean-code', fil],
  assignee: 'EXECUTOR'
});
```

### Status Update Pattern
```javascript
// EXECUTOR updates progress
await updateLinearTask(taskId, {
  state: 'In Progress',
  comment: 'Fix implementation started',
  estimate: estimatePoints(complexity)
});
```

### Webhook Handling
Webhooks are processed in `.claude/webhooks/` but integrations here handle:
- Event parsing
- State synchronization
- Agent notification

## Linear Permissions by Integration

| Integration Type | Create | Read | Update | Delete |
|-----------------|--------|------|--------|--------|
| MCP Direct | ✅ | ✅ | ✅ | ✅ |
| Agent Integration | Limited | ✅ | Limited | ❌ |

### Permission Rules
- **STRATEGIST**: Full CRUD access
- **AUDITOR**: CREATE quality issues only
- **EXECUTOR**: UPDATE status only
- **GUARDIAN**: CREATE incidents only
- **SCHOLAR**: READ only

## Configuration

### Required Environment Variables
```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx  # Required
LINEAR_TEAM_ID=your-team-id           # Required
LINEAR_PROJECT_ID=your-project-id     # Required
LINEAR_WEBHOOK_SECRET=secret          # Optional (for webhooks)
```

### Settings
Configure in `.claude/settings.json`:
```json
{
  "integrations": {
    "linear": {
      "enabled": true,
      "autoCreateTasks": true,
      "taskPrefix": "CLEAN",
      "incidentPrefix": "INCIDENT",
      "defaultPriority": 3,
      "batchSize": 10
    }
  }
}
```

## Common Operations

### Check Linear Connection
```bash
npm run linear:test-connection
```

### Sync with Linear
```bash
npm run linear:sync
```

### Get Linear Status
```bash
npm run linear:status
```

## Error Handling

All integrations include:
- Automatic retry (3 attempts)
- Exponential backoff
- Error reporting
- Fallback mechanisms

### Error Patterns
```javascript
try {
  const result = await linearOperation();
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    await delay(error.retryAfter);
    return retry();
  }
  // Log and fallback
  console.error('Linear operation failed:', error);
  return fallbackOperation();
}
```

## Adding New Integrations

To add an integration:
1. Create `service-integration.js`
2. Implement standard interface:
   - `connect()`
   - `disconnect()`
   - `healthCheck()`
   - Service-specific methods
3. Add configuration to settings.json
4. Document in this file
5. Add tests

## Testing Integrations

```bash
# Test Linear connection
node .claude/integrations/test-linear-connection.js

# Test with mock data
DEBUG=true node .claude/integrations/linear-mcp-integration.js --test
```

## Important Notes

- All integrations are async
- Rate limiting is enforced
- Credentials are never logged
- Webhooks use signature validation
- Fallback to local storage if offline

## Quick Reference

| Task | Integration | Method |
|------|------------|--------|
| Create task | linear-mcp | `createTask()` |
| Update status | agent-linear | `updateStatus()` |
| Get sprint | linear-mcp | `getCurrentSprint()` |
| Create incident | agent-linear | `createIncident()` |
| Sync state | both | `syncWithLinear()` |