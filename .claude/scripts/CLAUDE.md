# 📜 Scripts Directory - Claude Code Guide

## Purpose

This directory contains utility scripts that support the agent system and workflow automation. These are the "behind-the-scenes" workers that make the system function.

## Directory Structure

```
scripts/
├── core/           # Core system utilities
├── language/       # Language-specific helpers
├── monitoring/     # System monitoring
├── cleanup-processes.js
├── create-env.js
├── initialize-agents.js
└── install.sh
```

## Core Scripts (`core/`)

### Agent Command Router (`agent-command-router.js`)
**Purpose:** Routes commands to appropriate agents
**Usage:** Called by CLI and journeys
**Key Function:** Maps agent:command syntax to implementations

### Agent Pool (`agent-pool.js`)
**Purpose:** Manages agent lifecycle and pooling
**Features:**
- Agent initialization
- Resource management
- Concurrency control

### Error Recovery Manager (`error-recovery-manager.js`)
**Purpose:** Handles system errors and recovery
**Features:**
- Automatic retry logic
- Rollback procedures
- Error reporting to Linear

### Performance Monitor (`performance-monitor.js`)
**Purpose:** Tracks system performance
**Metrics:**
- Agent execution times
- Memory usage
- Success/failure rates

### Tool Permission Validator (`tool-permission-validator.js`)
**Purpose:** Validates MCP tool permissions
**Checks:**
- Agent has required permissions
- Tool availability
- Safety constraints

### Concurrency Orchestrator (`concurrency-orchestrator.js`)
**Purpose:** Manages parallel agent execution
**Features:**
- Queue management
- Resource allocation
- Deadlock prevention

### MCP Queue Manager (`mcp-queue-manager.js`)
**Purpose:** Manages MCP tool invocation queue
**Features:**
- Rate limiting
- Priority scheduling
- Request batching

### MCP Concurrency Validator (`mcp-concurrency-validator.js`)
**Purpose:** Validates concurrent MCP operations
**Checks:**
- Tool conflicts
- Resource availability
- Safety validations

## Root Scripts

### Initialize Agents (`initialize-agents.js`)
**Purpose:** Sets up agent system
**When to run:** During onboarding or setup
**Usage:**
```bash
npm run agents:init
```

### Create Environment (`create-env.js`)
**Purpose:** Creates .env file from template
**Usage:**
```bash
npm run create:env
```

### Cleanup Processes (`cleanup-processes.js`)
**Purpose:** Cleans up stuck processes
**Usage:**
```bash
npm run cleanup:processes
npm run cleanup:processes:force  # Force cleanup
npm run cleanup:processes:check  # Check only
```

### Installation Script (`install.sh`)
**Purpose:** Installs system in new projects
**Usage:**
```bash
./.claude/install.sh /path/to/project
```

## Language Support (`language/`)

Contains language-specific utilities:
- Test runners
- Linters
- Formatters
- Build tools

## Monitoring (`monitoring/`)

### Production Monitor (`production-monitor.js`)
**Purpose:** Monitors production systems
**Features:**
- Health checks
- Alert generation
- Metric collection

## Script Patterns

### Common Patterns

1. **Error Handling:**
```javascript
try {
  // Operation
} catch (error) {
  errorRecoveryManager.handle(error);
}
```

2. **Agent Invocation:**
```javascript
const agent = agentPool.get('AUDITOR');
const result = await agent.execute(command, options);
```

3. **Performance Tracking:**
```javascript
const timer = performanceMonitor.start('operation');
// ... operation ...
timer.end();
```

## Adding New Scripts

When adding scripts:
1. Follow existing naming conventions
2. Include error handling
3. Add performance monitoring
4. Document in this file
5. Add npm script in package.json

## Important Notes

- Scripts are stateless where possible
- All scripts support dry-run mode
- Error recovery is automatic
- Logs are written to `.claude/logs/`

## Quick Reference

| Need | Script | Command |
|------|--------|---------|
| Initialize system | initialize-agents.js | `npm run agents:init` |
| Clean up processes | cleanup-processes.js | `npm run cleanup:processes` |
| Create .env | create-env.js | `npm run create:env` |
| Install in project | install.sh | `./.claude/install.sh` |

## Environment Variables

Scripts respect these environment variables:
- `DEBUG=true` - Enable debug logging
- `DRY_RUN=true` - Preview without changes
- `FORCE=true` - Skip confirmations
- `QUIET=true` - Minimal output