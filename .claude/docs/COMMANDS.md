# Commands Reference - Claude Agentic Workflow System

Complete reference for all CLI commands and agent invocations available in the Claude Agentic Workflow System.

## Table of Contents

1. [System Commands](#system-commands)
2. [Quality & Assessment](#quality--assessment)
3. [TDD & Testing](#tdd--testing)
4. [Agent Invocations](#agent-invocations)
5. [Linear Integration](#linear-integration)
6. [CI/CD & Pipeline](#cicd--pipeline)
7. [Maintenance & Diagnostics](#maintenance--diagnostics)
8. [Development Workflow](#development-workflow)
9. [Configuration Management](#configuration-management)
10. [Advanced Operations](#advanced-operations)

## System Commands

### Core System Operations

#### `npm run status`

Display comprehensive system status and health metrics.

```bash
npm run status

# Outputs:
# ✅ Claude Agentic Workflow System - Status Report
# ✅ MCP Tools: 5 servers operational
# ✅ Agent System: 23 agents ready
# ✅ TDD Gates: Active
# ✅ Linear Integration: Connected
# ✅ Quality Metrics: Coverage 85%, Mutation 32%
```

#### `npm run validate`

Validate system configuration and dependencies.

```bash
npm run validate

# Options:
npm run validate -- --quick      # Quick validation only
npm run validate -- --full       # Full system validation
npm run validate -- --fix        # Auto-fix issues where possible
```

#### `npm run setup`

Initialize or re-initialize the workflow system.

```bash
npm run setup

# Options:
npm run setup -- --reset         # Reset to default configuration
npm run setup -- --upgrade       # Upgrade to latest version
npm run setup -- --team          # Setup for team environment
```

#### `npm run doctor`

Comprehensive system diagnostics and health check.

```bash
npm run doctor

# Checks:
# - System dependencies
# - Agent health
# - MCP tool connectivity
# - Configuration validity
# - Performance metrics
```

## Quality & Assessment

### Code Quality Assessment

#### `npm run assess`

Run comprehensive code quality assessment.

```bash
npm run assess

# Scope options:
npm run assess -- --scope full          # Full codebase assessment
npm run assess -- --scope incremental   # Changed files only
npm run assess -- --scope critical      # Critical paths only

# Output options:
npm run assess -- --format json         # JSON output
npm run assess -- --format detailed     # Detailed report
npm run assess -- --output file.json    # Save to file
```

#### `npm run lint`

Lint code with automatic fixing.

```bash
npm run lint

# Language specific:
npm run lint:js                  # JavaScript/TypeScript only
npm run lint:py                  # Python only

# Options:
npm run lint -- --no-fix         # Check only, don't fix
npm run lint -- --quiet          # Suppress warnings
npm run lint -- --max-warnings 0 # Fail on any warnings
```

#### `npm run format`

Format code according to style guidelines.

```bash
npm run format

# Language specific:
npm run format:js                # JavaScript/TypeScript
npm run format:py                # Python

# Options:
npm run format -- --check        # Check formatting without changes
npm run format -- --diff         # Show formatting changes
```

#### `npm run typecheck`

Run TypeScript type checking.

```bash
npm run typecheck

# Options:
npm run typecheck -- --incremental    # Incremental checking
npm run typecheck -- --watch          # Watch mode
npm run typecheck -- --project tsconfig.build.json  # Specific config
```

## TDD & Testing

### Test Execution

#### `npm test`

Run all tests with coverage.

```bash
npm test

# Test types:
npm run test:unit                # Unit tests only
npm run test:integration         # Integration tests only
npm run test:e2e                # End-to-end tests only

# Coverage options:
npm test -- --coverage          # Generate coverage report
npm test -- --coverage-html     # HTML coverage report
npm test -- --coverage-json     # JSON coverage data
```

#### `npm test:watch`

Run tests in watch mode for TDD.

```bash
npm test:watch

# Options:
npm test:watch -- --coverage            # Watch with coverage
npm test:watch -- --verbose             # Verbose output
npm test:watch -- --testNamePattern="user"  # Filter tests
```

#### `npm run test:mutation`

Run mutation testing for critical paths.

```bash
npm run test:mutation

# Options:
npm run test:mutation -- --threshold 30     # Set mutation threshold
npm run test:mutation -- --incremental      # Only test changes
npm run test:mutation -- --reporters html   # HTML report
```

### TDD Workflow Commands

#### `npm run precommit`

Run pre-commit quality checks.

```bash
npm run precommit

# Runs:
# 1. Linting with auto-fix
# 2. Code formatting
# 3. Type checking
# 4. Unit tests
# 5. Coverage validation
```

#### `npm run validate-tdd`

Validate TDD compliance for changes.

```bash
npm run validate-tdd

# Options:
npm run validate-tdd -- --mode new-only     # New code only
npm run validate-tdd -- --mode full         # All code
npm run validate-tdd -- --threshold 80      # Coverage threshold
```

## Agent Invocations

### Core Agent Commands

All agent commands follow the pattern:

```bash
npm run agent:invoke <AGENT>:<COMMAND> -- [options]
```

#### AUDITOR (Code Quality Assessment)

```bash
# Full codebase assessment
npm run agent:invoke AUDITOR:assess-code -- --scope full

# Incremental assessment
npm run agent:invoke AUDITOR:assess-code -- --scope incremental

# Specific files assessment
npm run agent:invoke AUDITOR:assess-code -- --files "src/components/*.tsx"

# Technical debt analysis
npm run agent:invoke AUDITOR:analyze-debt

# Generate quality report
npm run agent:invoke AUDITOR:quality-report -- --format json

# List Fix Pack candidates
npm run agent:invoke AUDITOR:list-fixes

# Prioritize issues
npm run agent:invoke AUDITOR:prioritize-issues -- --criteria severity,impact

# Health check
npm run agent:invoke AUDITOR:health-check
```

#### EXECUTOR (Fix Implementation)

```bash
# Implement specific Fix Pack
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123

# Batch implement multiple fixes
npm run agent:invoke EXECUTOR:implement-batch -- --task-ids "CLEAN-123,CLEAN-124"

# Preview changes without implementing
npm run agent:invoke EXECUTOR:preview-fix -- --task-id CLEAN-123

# Rollback last implementation
npm run agent:invoke EXECUTOR:rollback-last

# Rollback specific implementation
npm run agent:invoke EXECUTOR:rollback -- --task-id CLEAN-123

# Implementation status
npm run agent:invoke EXECUTOR:status

# Performance metrics
npm run agent:invoke EXECUTOR:performance-metrics
```

#### GUARDIAN (CI/CD Protection)

```bash
# Check pipeline health
npm run agent:invoke GUARDIAN:check-pipelines

# Analyze specific failure
npm run agent:invoke GUARDIAN:analyze-failure -- --build-id 12345

# Enable auto-recovery
npm run agent:invoke GUARDIAN:enable-auto-recovery -- --pipeline main

# Generate health report
npm run agent:invoke GUARDIAN:health-report

# Monitor specific pipeline
npm run agent:invoke GUARDIAN:monitor-pipeline -- --name ci-cd-main

# Recovery statistics
npm run agent:invoke GUARDIAN:recovery-stats

# Alert configuration
npm run agent:invoke GUARDIAN:configure-alerts -- --config alerts.json
```

#### STRATEGIST (Workflow Orchestration)

```bash
# Plan next sprint
npm run agent:invoke STRATEGIST:plan-sprint

# Coordinate multi-agent task
npm run agent:invoke STRATEGIST:coordinate-task -- --task-id REFACTOR-456

# Optimize agent workload
npm run agent:invoke STRATEGIST:optimize-workload

# Generate coordination report
npm run agent:invoke STRATEGIST:coordination-report

# Linear task management
npm run agent:invoke STRATEGIST:manage-linear-tasks

# Resource allocation
npm run agent:invoke STRATEGIST:allocate-resources

# Sprint retrospective
npm run agent:invoke STRATEGIST:sprint-retrospective
```

#### SCHOLAR (Learning & Optimization)

```bash
# Analyze patterns
npm run agent:invoke SCHOLAR:analyze-patterns

# Generate learning report
npm run agent:invoke SCHOLAR:learning-report

# Update system based on learnings
npm run agent:invoke SCHOLAR:update-system

# Export knowledge base
npm run agent:invoke SCHOLAR:export-knowledge

# Performance optimization
npm run agent:invoke SCHOLAR:optimize-performance

# Team insights
npm run agent:invoke SCHOLAR:team-insights

# Best practices recommendations
npm run agent:invoke SCHOLAR:recommend-practices
```

### Specialized Agent Commands

#### TESTER & VALIDATOR

```bash
# Generate test suite
npm run agent:invoke TESTER:generate-tests -- --scope src/components/

# Validate test coverage
npm run agent:invoke VALIDATOR:validate-coverage -- --threshold 80

# Test quality analysis
npm run agent:invoke VALIDATOR:analyze-test-quality

# Generate test report
npm run agent:invoke TESTER:test-report
```

#### ANALYZER & OPTIMIZER

```bash
# Performance analysis
npm run agent:invoke ANALYZER:analyze-performance

# Code complexity analysis
npm run agent:invoke ANALYZER:analyze-complexity

# Bundle optimization
npm run agent:invoke OPTIMIZER:optimize-bundle

# Database query optimization
npm run agent:invoke OPTIMIZER:optimize-queries
```

#### CLEANER & REFACTORER

```bash
# Clean dead code
npm run agent:invoke CLEANER:remove-dead-code

# Large-scale refactoring
npm run agent:invoke REFACTORER:refactor -- --scope src/legacy/

# Code style cleanup
npm run agent:invoke CLEANER:cleanup-style

# Architecture refactoring
npm run agent:invoke REFACTORER:improve-architecture
```

#### SECURITYGUARD & MONITOR

```bash
# Security scan
npm run agent:invoke SECURITYGUARD:security-scan

# Vulnerability assessment
npm run agent:invoke SECURITYGUARD:assess-vulnerabilities

# Real-time monitoring
npm run agent:invoke MONITOR:start-monitoring

# Performance metrics
npm run agent:invoke MONITOR:performance-metrics

# Alert management
npm run agent:invoke MONITOR:manage-alerts
```

## Linear Integration

### Linear Task Management

#### `npm run linear:sync`

Synchronize with Linear tasks and update status.

```bash
npm run linear:sync

# Options:
npm run linear:sync -- --force          # Force sync all tasks
npm run linear:sync -- --team a-coders  # Specific team only
npm run linear:sync -- --project ai-coding  # Specific project
```

#### Linear Agent Commands

```bash
# Create quality task
npm run agent:invoke STRATEGIST:create-linear-task -- --type quality --title "Fix code complexity" --priority high

# Update task status
npm run agent:invoke STRATEGIST:update-linear-task -- --task-id CLEAN-123 --status "In Progress"

# Assign task to agent
npm run agent:invoke STRATEGIST:assign-task -- --task-id CLEAN-123 --agent EXECUTOR

# Generate sprint plan
npm run agent:invoke STRATEGIST:linear-sprint-plan

# Task progress report
npm run agent:invoke STRATEGIST:task-progress-report
```

## CI/CD & Pipeline

### Pipeline Management

#### Pipeline Status Commands

```bash
# Check all pipelines
npm run agent:invoke GUARDIAN:check-all-pipelines

# Monitor specific pipeline
npm run agent:invoke GUARDIAN:monitor -- --pipeline production

# Pipeline health dashboard
npm run agent:invoke GUARDIAN:dashboard

# Recovery actions
npm run agent:invoke GUARDIAN:recover-pipeline -- --pipeline main --action restart
```

#### Quality Gate Commands

```bash
# Validate quality gates
npm run validate:quality-gates

# Coverage gate check
npm run validate:coverage-gate -- --threshold 80

# Performance gate check
npm run validate:performance-gate

# Security gate check
npm run validate:security-gate
```

## Maintenance & Diagnostics

### System Maintenance

#### `npm run reset`

Reset system to clean state.

```bash
npm run reset

# Options:
npm run reset -- --agents           # Reset agents only
npm run reset -- --config           # Reset configuration only
npm run reset -- --cache            # Clear caches only
npm run reset -- --full             # Full system reset
```

#### `npm run rollback`

Emergency rollback system.

```bash
npm run rollback

# Options:
npm run rollback -- --to-commit abc123    # Rollback to specific commit
npm run rollback -- --last-fix            # Rollback last Fix Pack
npm run rollback -- --agent EXECUTOR      # Rollback specific agent changes
```

### Diagnostic Commands

#### `npm run diagnose`

Comprehensive system diagnostics.

```bash
npm run diagnose

# Specific diagnostics:
npm run diagnose:agents              # Agent system health
npm run diagnose:mcp                 # MCP tool connectivity
npm run diagnose:linear              # Linear integration
npm run diagnose:performance         # Performance analysis
```

#### Performance Analysis

```bash
# System performance report
npm run agent:invoke MONITOR:system-performance

# Agent performance analysis
npm run agent:invoke SCHOLAR:agent-performance

# Resource utilization
npm run agent:invoke MONITOR:resource-utilization

# SLA compliance report
npm run agent:invoke MONITOR:sla-compliance
```

## Development Workflow

### Build & Compilation

#### `npm run build`

Build the application.

```bash
npm run build

# Build variants:
npm run build:dev                   # Development build
npm run build:prod                  # Production build
npm run build:analyze               # Build with analysis

# Language specific:
npm run build:js                    # JavaScript/TypeScript only
npm run build:py                    # Python package build
```

### Development Server

#### Development Commands

```bash
# Start development server
npm run dev

# Watch mode
npm run dev:watch

# Debug mode
npm run dev:debug

# Hot reload
npm run dev:hot
```

## Configuration Management

### Configuration Commands

#### `npm run config`

Configuration management utilities.

```bash
# View current configuration
npm run config:show

# Validate configuration
npm run config:validate

# Reset to defaults
npm run config:reset

# Backup configuration
npm run config:backup

# Restore configuration
npm run config:restore -- --backup config-backup-20240101.json
```

#### Agent Configuration

```bash
# Configure agent settings
npm run agent:configure -- --agent AUDITOR --setting max_files=1000

# Export agent configuration
npm run agent:export-config -- --agent STRATEGIST

# Import agent configuration
npm run agent:import-config -- --file strategist-config.json

# List agent configurations
npm run agent:list-configs
```

## Advanced Operations

### Multi-Project Operations

#### Project Management

```bash
# Register new project
npm run project:register -- --name new-project --path ../new-project

# List registered projects
npm run project:list

# Sync across projects
npm run project:sync-all

# Cross-project analysis
npm run agent:invoke SCHOLAR:cross-project-analysis

# Project health comparison
npm run project:compare-health
```

### Batch Operations

#### Batch Agent Commands

```bash
# Batch assessment across multiple files
npm run agent:invoke AUDITOR:batch-assess -- --files "src/**/*.ts,tests/**/*.ts"

# Batch fix implementation
npm run agent:invoke EXECUTOR:batch-implement -- --task-pattern "CLEAN-1*"

# Batch monitoring setup
npm run agent:invoke MONITOR:batch-setup -- --services "api,database,cache"
```

### Custom Agent Development

#### Agent Development Commands

```bash
# Create new agent
npm run agent:create -- --name CustomAgent --template specialized

# Test agent
npm run agent:test -- --agent CustomAgent

# Deploy agent
npm run agent:deploy -- --agent CustomAgent

# Remove agent
npm run agent:remove -- --agent CustomAgent --confirm
```

## Command Options & Flags

### Global Options

Most commands support these global options:

```bash
--verbose, -v          # Verbose output
--quiet, -q           # Suppress output
--format FORMAT       # Output format (json, yaml, table)
--output FILE         # Save output to file
--config FILE         # Use specific config file
--dry-run            # Show what would be done without executing
--force              # Force execution, skip confirmations
--help, -h           # Show help for command
```

### Environment Variables

Set these environment variables to modify command behavior:

```bash
# Agent behavior
CLAUDE_AGENT_TIMEOUT=300        # Agent operation timeout (seconds)
CLAUDE_MAX_CONCURRENT_AGENTS=3  # Maximum concurrent agents

# Quality gates
CLAUDE_COVERAGE_THRESHOLD=80    # Minimum coverage percentage
CLAUDE_MUTATION_THRESHOLD=30    # Minimum mutation score

# Linear integration
CLAUDE_LINEAR_TEAM_ID=your-team-id
CLAUDE_LINEAR_API_KEY=your-api-key

# Performance tuning
CLAUDE_MCP_OPERATION_LIMIT=2    # Operations per MCP server
CLAUDE_PERFORMANCE_MODE=optimal  # Performance optimization mode
```

## Command Aliases

### Quick Aliases

Common command shortcuts:

```bash
npm run s               # Alias for npm run status
npm run a               # Alias for npm run assess
npm run t               # Alias for npm test
npm run tw              # Alias for npm test:watch
npm run l               # Alias for npm run lint
npm run f               # Alias for npm run format
npm run pc              # Alias for npm run precommit
npm run d               # Alias for npm run doctor
```

## Exit Codes

Commands return these exit codes:

- `0` - Success
- `1` - General error
- `2` - Configuration error
- `3` - Agent execution error
- `4` - Quality gate failure
- `5` - Timeout error
- `6` - Permission error
- `7` - Network/connectivity error
- `8` - Resource exhaustion error

## Getting Help

### Command Help

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

### Troubleshooting Commands

```bash
# Quick diagnostics
npm run doctor

# Detailed system analysis
npm run diagnose

# Performance analysis
npm run agent:invoke MONITOR:system-health

# Error log analysis
npm run logs:analyze
```

---

**For additional help, see:**

- [User Guide](USER-GUIDE.md) - Complete system overview
- [Troubleshooting](TROUBLESHOOTING.md) - Problem resolution
- [Configuration](CONFIGURATION.md) - System configuration
- [FAQ](FAQ.md) - Frequently asked questions

**Command reference complete! Master these commands to unlock the full power of the Claude Agentic Workflow System. 🚀**
