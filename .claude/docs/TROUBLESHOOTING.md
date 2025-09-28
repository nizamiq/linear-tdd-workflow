# Troubleshooting Guide - Claude Agentic Workflow System

Comprehensive troubleshooting guide for resolving common issues with the Claude Agentic Workflow System.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [System Startup Issues](#system-startup-issues)
3. [Agent System Problems](#agent-system-problems)
4. [TDD Workflow Issues](#tdd-workflow-issues)
5. [Quality Gate Failures](#quality-gate-failures)
6. [Linear Integration Problems](#linear-integration-problems)
7. [Performance Issues](#performance-issues)
8. [Configuration Problems](#configuration-problems)
9. [CI/CD Integration Issues](#cicd-integration-issues)
10. [Emergency Recovery](#emergency-recovery)
11. [Getting Additional Help](#getting-additional-help)

## Quick Diagnostics

### First Steps for Any Issue

```bash
# Run comprehensive diagnostics
npm run doctor

# Check system status
npm run status

# Validate configuration
npm run validate

# View recent logs
npm run logs:view -- --tail 50
```

### Common Quick Fixes

```bash
# Reset system to clean state
npm run reset

# Clear caches
npm run cache:clear

# Restart agent system
npm run agents:restart

# Sync with Linear
npm run linear:sync
```

## System Startup Issues

### Issue: System Won't Start

**Symptoms:**
- Commands hang or timeout
- "System not initialized" errors
- Agent health checks fail

**Diagnosis:**
```bash
# Check system initialization
npm run validate -- --full

# Check dependencies
npm run check-deps

# Verify Node.js version
node --version  # Should be ≥18.0.0

# Check npm configuration
npm config list
```

**Solutions:**

1. **Re-initialize System**
   ```bash
   npm run setup -- --reset
   npm run validate
   ```

2. **Check Dependencies**
   ```bash
   npm install
   npm run build
   ```

3. **Verify Environment**
   ```bash
   # Check required environment variables
   echo $CLAUDE_LINEAR_API_KEY
   echo $CLAUDE_LINEAR_TEAM_ID

   # Set missing variables
   export CLAUDE_LINEAR_API_KEY=your_key
   export CLAUDE_LINEAR_TEAM_ID=your_team_id
   ```

### Issue: Permission Errors

**Symptoms:**
- "Permission denied" errors
- Cannot write to `.claude/` directory
- MCP tool access failures

**Solutions:**

1. **Fix Directory Permissions**
   ```bash
   sudo chown -R $USER:$USER .claude/
   chmod -R 755 .claude/
   ```

2. **Check File System Permissions**
   ```bash
   ls -la .claude/
   # Ensure files are readable/writable by user
   ```

3. **MCP Tool Permissions**
   ```bash
   # Check MCP configuration
   cat .claude/mcp.json

   # Validate MCP tools access
   npm run agent:invoke AUDITOR:health-check
   ```

## Agent System Problems

### Issue: Agents Not Responding

**Symptoms:**
- Agent commands timeout
- "Agent not available" errors
- Health checks fail

**Diagnosis:**
```bash
# Check agent system status
npm run agents:status

# Test individual agent
npm run agent:invoke AUDITOR:health-check

# Check agent logs
npm run agent:logs -- --agent AUDITOR
```

**Solutions:**

1. **Restart Agent System**
   ```bash
   npm run agents:restart
   npm run agents:status
   ```

2. **Check Agent Configuration**
   ```bash
   npm run config:validate -- --agents
   cat .claude/agents/auditor.json
   ```

3. **Reset Specific Agent**
   ```bash
   npm run agent:reset -- --agent AUDITOR
   npm run agent:invoke AUDITOR:health-check
   ```

### Issue: Agent Performance Problems

**Symptoms:**
- Slow agent responses
- Timeouts during operations
- High resource usage

**Diagnosis:**
```bash
# Check performance metrics
npm run agent:invoke SCHOLAR:performance-analysis

# Monitor resource usage
npm run monitor:resources

# Check concurrency settings
npm run config:show -- --section concurrency
```

**Solutions:**

1. **Adjust Concurrency Settings**
   ```bash
   # Reduce concurrent agents
   export CLAUDE_MAX_CONCURRENT_AGENTS=2

   # Reduce MCP operation limit
   export CLAUDE_MCP_OPERATION_LIMIT=1
   ```

2. **Optimize Agent Configuration**
   ```json
   // .claude/settings.local.json
   {
     "agents": {
       "max_concurrent": 2,
       "default_timeout": 600000
     },
     "performance": {
       "memory_limit": "2GB",
       "cpu_limit": "70%"
     }
   }
   ```

### Issue: MCP Tool Failures

**Symptoms:**
- "MCP operation failed" errors
- Tool connectivity issues
- Circuit breaker triggered

**Diagnosis:**
```bash
# Check MCP tool status
npm run mcp:status

# Test MCP connectivity
npm run mcp:test-connection

# Check circuit breaker status
npm run agent:invoke GUARDIAN:circuit-breaker-status
```

**Solutions:**

1. **Reset MCP Tools**
   ```bash
   npm run mcp:reset
   npm run mcp:test-connection
   ```

2. **Adjust Circuit Breaker Settings**
   ```json
   // .claude/settings.local.json
   {
     "concurrency": {
       "circuit_breaker": {
         "failure_threshold": 10,
         "timeout": 60000
       }
     }
   }
   ```

## TDD Workflow Issues

### Issue: TDD Enforcement Blocking Valid Changes

**Symptoms:**
- "TDD violation" errors for valid code
- Coverage requirements too strict
- Tests required for config files

**Diagnosis:**
```bash
# Check TDD configuration
npm run config:show -- --section tdd

# Validate TDD rules
npm run validate-tdd -- --explain

# Check coverage thresholds
npm test -- --coverage
```

**Solutions:**

1. **Adjust TDD Configuration**
   ```json
   // .claude/settings.local.json
   {
     "tdd": {
       "enforcement_mode": "moderate",
       "exemptions": {
         "file_patterns": [
           "**/*.config.{js,ts}",
           "**/scripts/**",
           "**/docs/**"
         ]
       }
     }
   }
   ```

2. **Fix Coverage Issues**
   ```bash
   # Generate coverage report with details
   npm test -- --coverage --verbose

   # Identify uncovered lines
   npm test -- --coverage --coverage-html
   open coverage/lcov-report/index.html
   ```

### Issue: Tests Failing Unexpectedly

**Symptoms:**
- Tests pass locally but fail in CI
- Intermittent test failures
- Environment-specific failures

**Diagnosis:**
```bash
# Run tests with verbose output
npm test -- --verbose

# Check test environment
npm run test:debug

# Compare local vs CI environment
npm run diagnose:test-environment
```

**Solutions:**

1. **Environment Consistency**
   ```bash
   # Check Node.js version consistency
   node --version

   # Check npm dependencies
   npm ls --depth=0

   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Fix Flaky Tests**
   ```bash
   # Identify flaky tests
   npm run test:flaky-detection

   # Run specific test multiple times
   npm test -- --testNamePattern="flaky test" --repeat 10
   ```

## Quality Gate Failures

### Issue: Coverage Gate Failures

**Symptoms:**
- "Coverage below threshold" errors
- Diff coverage requirements not met
- Coverage reports showing gaps

**Diagnosis:**
```bash
# Generate detailed coverage report
npm test -- --coverage --coverage-html

# Check diff coverage
npm run coverage:diff

# Identify uncovered critical paths
npm run coverage:critical-paths
```

**Solutions:**

1. **Add Missing Tests**
   ```bash
   # Generate test stubs for uncovered files
   npm run generate:test-stubs -- --coverage-threshold 80

   # Focus on critical paths first
   npm run test:critical-paths
   ```

2. **Adjust Coverage Thresholds**
   ```json
   // .claude/settings.local.json
   {
     "quality_gates": {
       "coverage": {
         "thresholds": {
           "global": {
             "lines": 75,
             "branches": 75
           }
         }
       }
     }
   }
   ```

### Issue: Linting Failures

**Symptoms:**
- ESLint errors blocking commits
- Formatting inconsistencies
- TypeScript type errors

**Diagnosis:**
```bash
# Check linting errors
npm run lint -- --no-fix

# Check formatting issues
npm run format -- --check

# Check TypeScript errors
npm run typecheck
```

**Solutions:**

1. **Auto-fix Issues**
   ```bash
   # Fix linting and formatting
   npm run lint
   npm run format

   # Fix TypeScript issues
   npm run typecheck -- --incremental
   ```

2. **Update ESLint Configuration**
   ```javascript
   // .eslintrc.js
   module.exports = {
     rules: {
       // Temporarily disable problematic rules
       '@typescript-eslint/no-explicit-any': 'warn',
       '@typescript-eslint/no-unused-vars': 'warn',
     }
   };
   ```

## Linear Integration Problems

### Issue: Linear API Connection Failures

**Symptoms:**
- "Linear API error" messages
- Tasks not syncing
- Authentication failures

**Diagnosis:**
```bash
# Test Linear connection
npm run linear:test-connection

# Check API key validity
npm run linear:validate-credentials

# View Linear sync logs
npm run linear:logs
```

**Solutions:**

1. **Fix Authentication**
   ```bash
   # Set correct API key
   export CLAUDE_LINEAR_API_KEY=your_valid_key

   # Verify team and project IDs
   export CLAUDE_LINEAR_TEAM_ID=your_team_id
   export CLAUDE_LINEAR_PROJECT_ID=your_project_id

   # Test connection
   npm run linear:test-connection
   ```

2. **Reset Linear Integration**
   ```bash
   npm run linear:reset
   npm run linear:sync
   ```

### Issue: Tasks Not Being Created

**Symptoms:**
- AUDITOR finds issues but no Linear tasks appear
- Task creation permissions errors
- Wrong team/project assignment

**Diagnosis:**
```bash
# Check task creation logs
npm run agent:logs -- --agent AUDITOR

# Verify Linear permissions
npm run linear:check-permissions

# Test task creation manually
npm run linear:create-test-task
```

**Solutions:**

1. **Fix Permissions**
   ```bash
   # Check Linear team permissions
   npm run linear:check-team-access

   # Verify project access
   npm run linear:check-project-access
   ```

2. **Configure Task Creation**
   ```json
   // .claude/settings.local.json
   {
     "linear": {
       "settings": {
         "auto_create_tasks": true
       },
       "task_configuration": {
         "default_assignee": "your-user-id"
       }
     }
   }
   ```

## Performance Issues

### Issue: Slow Assessment Performance

**Symptoms:**
- Assessments taking >15 minutes
- System becomes unresponsive
- Memory usage spikes

**Diagnosis:**
```bash
# Check current performance
npm run agent:invoke MONITOR:performance-metrics

# Analyze slow operations
npm run performance:analyze

# Check resource usage
npm run monitor:resources
```

**Solutions:**

1. **Optimize Assessment Scope**
   ```bash
   # Run incremental assessment only
   npm run assess -- --scope incremental

   # Exclude large directories
   npm run assess -- --exclude "node_modules,dist,build"
   ```

2. **Tune Performance Settings**
   ```json
   // .claude/settings.local.json
   {
     "performance": {
       "max_files_per_scan": 500,
       "concurrent_operations": 2,
       "memory_limit": "2GB"
     }
   }
   ```

### Issue: High Memory Usage

**Symptoms:**
- Out of memory errors
- System slowdowns
- Process crashes

**Diagnosis:**
```bash
# Check memory usage
npm run monitor:memory

# Identify memory leaks
npm run diagnose:memory-leaks

# Check Node.js heap usage
node --max-old-space-size=4096 npm run assess
```

**Solutions:**

1. **Increase Memory Limits**
   ```bash
   # Set Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"

   # Restart with new limits
   npm run restart
   ```

2. **Optimize Memory Usage**
   ```json
   // .claude/settings.local.json
   {
     "performance": {
       "memory_optimization": true,
       "cache_size_limit": "512MB",
       "garbage_collection": "aggressive"
     }
   }
   ```

## Configuration Problems

### Issue: Invalid Configuration

**Symptoms:**
- "Configuration validation failed" errors
- System won't start
- Missing required settings

**Diagnosis:**
```bash
# Validate all configuration
npm run config:validate

# Check configuration schema
npm run config:schema

# Show current configuration
npm run config:show
```

**Solutions:**

1. **Fix Configuration Errors**
   ```bash
   # Reset to default configuration
   npm run config:reset

   # Validate step by step
   npm run config:validate -- --verbose
   ```

2. **Restore from Backup**
   ```bash
   # List available backups
   npm run config:list-backups

   # Restore from backup
   npm run config:restore -- --backup latest
   ```

### Issue: Environment Variable Problems

**Symptoms:**
- "Environment variable not set" errors
- Configuration not loading
- Feature toggles not working

**Diagnosis:**
```bash
# Check all environment variables
npm run config:env-check

# Show required variables
npm run config:required-env

# Validate environment setup
npm run validate:environment
```

**Solutions:**

1. **Set Missing Variables**
   ```bash
   # Create .env file
   cat > .env << EOF
   CLAUDE_LINEAR_API_KEY=your_key
   CLAUDE_LINEAR_TEAM_ID=your_team_id
   CLAUDE_MODE=development
   EOF

   # Load variables
   source .env
   ```

2. **Fix Variable Format**
   ```bash
   # Check variable format
   echo $CLAUDE_LINEAR_API_KEY | wc -c  # Should be proper length

   # Remove extra whitespace
   export CLAUDE_LINEAR_API_KEY=$(echo $CLAUDE_LINEAR_API_KEY | xargs)
   ```

## CI/CD Integration Issues

### Issue: Pipeline Failures

**Symptoms:**
- CI/CD builds failing unexpectedly
- Quality gates blocking deployment
- GUARDIAN not recovering pipelines

**Diagnosis:**
```bash
# Check pipeline status
npm run agent:invoke GUARDIAN:check-pipelines

# Analyze recent failures
npm run agent:invoke GUARDIAN:analyze-failures

# Check quality gate status
npm run validate:quality-gates
```

**Solutions:**

1. **Fix Quality Gate Issues**
   ```bash
   # Run quality checks locally
   npm run precommit

   # Fix coverage issues
   npm test -- --coverage

   # Fix linting issues
   npm run lint
   ```

2. **Configure Pipeline Recovery**
   ```bash
   # Enable auto-recovery
   npm run agent:invoke GUARDIAN:enable-auto-recovery

   # Set recovery parameters
   npm run agent:invoke GUARDIAN:configure-recovery -- --max-attempts 3
   ```

### Issue: GUARDIAN Auto-Recovery Failures

**Symptoms:**
- Pipelines failing repeatedly
- Recovery attempts unsuccessful
- Alert fatigue from failed recoveries

**Diagnosis:**
```bash
# Check recovery statistics
npm run agent:invoke GUARDIAN:recovery-stats

# Analyze recovery failures
npm run agent:invoke GUARDIAN:analyze-recovery-failures

# Check pipeline health trends
npm run agent:invoke GUARDIAN:health-trends
```

**Solutions:**

1. **Improve Recovery Strategy**
   ```json
   // .claude/agents/guardian.json
   {
     "settings": {
       "max_recovery_attempts": 5,
       "recovery_delay": 60000,
       "escalation_timeout": 300000
     }
   }
   ```

2. **Manual Pipeline Recovery**
   ```bash
   # Manually trigger recovery
   npm run agent:invoke GUARDIAN:manual-recovery -- --pipeline main

   # Reset pipeline state
   npm run agent:invoke GUARDIAN:reset-pipeline -- --pipeline main
   ```

## Emergency Recovery

### Complete System Reset

**When to use:** System is completely unresponsive or corrupted

```bash
# Emergency reset procedure
npm run emergency:reset

# Or manual reset:
rm -rf .claude/cache/
rm -rf .claude/logs/
npm run setup -- --force-reset
npm run validate
```

### Rollback Last Changes

**When to use:** Recent changes broke the system

```bash
# Rollback last Fix Pack
npm run agent:invoke EXECUTOR:rollback-last

# Rollback to specific commit
git log --oneline -10  # Find commit hash
npm run rollback -- --to-commit abc123

# Rollback specific agent changes
npm run agent:rollback -- --agent EXECUTOR
```

### Data Recovery

**When to use:** Lost configuration or important data

```bash
# Restore from backup
npm run restore:from-backup

# Recover Linear task mapping
npm run linear:recover-tasks

# Rebuild agent knowledge base
npm run agent:invoke SCHOLAR:rebuild-knowledge
```

## Getting Additional Help

### Built-in Help Commands

```bash
# General help
npm run help

# Command-specific help
npm run <command> -- --help

# Agent-specific help
npm run agent:invoke <AGENT>:help

# Configuration help
npm run config:help
```

### Diagnostic Information Collection

When reporting issues, collect this information:

```bash
# Generate comprehensive diagnostic report
npm run diagnose:full-report

# System information
npm run system:info

# Recent logs
npm run logs:export -- --last-24h

# Configuration dump (sanitized)
npm run config:export -- --sanitize
```

### Support Channels

1. **Self-Diagnosis**
   ```bash
   npm run doctor
   npm run diagnose:auto-fix
   ```

2. **Documentation**
   - [FAQ](FAQ.md) - Common questions
   - [User Guide](USER-GUIDE.md) - Complete system guide
   - [Configuration](CONFIGURATION.md) - Setup guidance

3. **Community Resources**
   - GitHub Issues for bug reports
   - Team knowledge base
   - Internal documentation wiki

### Common Error Codes

| Error Code | Description | Quick Fix |
|------------|-------------|-----------|
| `CLAUDE_001` | System not initialized | `npm run setup` |
| `CLAUDE_002` | Agent timeout | Increase timeout or reduce concurrency |
| `CLAUDE_003` | Configuration invalid | `npm run config:validate` |
| `CLAUDE_004` | Linear API error | Check API key and permissions |
| `CLAUDE_005` | Quality gate failure | Fix tests/coverage/linting |
| `CLAUDE_006` | MCP tool failure | `npm run mcp:reset` |
| `CLAUDE_007` | Memory exhaustion | Increase memory limits |
| `CLAUDE_008` | Permission denied | Fix file/directory permissions |
| `CLAUDE_009` | Network timeout | Check connectivity |
| `CLAUDE_010` | Circuit breaker open | Wait for recovery or reset |

---

**Remember:** Most issues can be resolved with `npm run doctor` followed by the suggested fixes. When in doubt, try a system reset with `npm run reset` - it's designed to be safe and preserve your important data.

**For additional help, see:**
- [FAQ](FAQ.md) - Frequently asked questions
- [User Guide](USER-GUIDE.md) - Complete system documentation
- [Commands Reference](COMMANDS.md) - All available commands
- [Configuration](CONFIGURATION.md) - System configuration guide

**Stay calm, diagnose systematically, and the Claude Agentic Workflow System will be back to optimal performance! 🚀**