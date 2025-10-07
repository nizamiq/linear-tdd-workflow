# Agent Overview - Claude Agentic Workflow System

Complete guide to understanding and working with the 20-agent autonomous code quality management system.

## Table of Contents

1. [Agent System Architecture](#agent-system-architecture)
2. [Core Agents](#core-agents)
3. [Specialized Agents](#specialized-agents)
4. [Agent Coordination](#agent-coordination)
5. [Agent Invocation](#agent-invocation)
6. [Agent Performance](#agent-performance)
7. [Agent Configuration](#agent-configuration)
8. [Custom Agent Development](#custom-agent-development)
9. [Agent Troubleshooting](#agent-troubleshooting)
10. [Agent Best Practices](#agent-best-practices)

## Agent System Architecture

### Overview

The Claude Agentic Workflow System operates through a sophisticated network of 20 specialized AI agents, each designed for specific code quality management tasks. These agents work autonomously while being coordinated by the STRATEGIST agent.

### Agent Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIST (Orchestrator)                │
│                   Workflow Coordination                     │
├─────────────────────────────────────────────────────────────┤
│                      Core Agents                           │
│  ┌─────────────┬──────────────┬─────────────┬─────────────┐ │
│  │   AUDITOR   │   EXECUTOR   │   GUARDIAN  │   SCHOLAR   │ │
│  │ Assessment  │ Fix Impl.    │ CI/CD Guard │ Learning    │ │
│  └─────────────┴──────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Specialized Agents                        │
│  ┌──────────────────────────────┬──────────────────────────┐ │
│  │        Testing Agents        │     Quality Agents       │ │
│  │  ┌─────────┬──────────────┐  │  ┌─────────┬──────────┐ │ │
│  │  │ TESTER  │  VALIDATOR   │  │  │ANALYZER │OPTIMIZER │ │ │
│  │  └─────────┴──────────────┘  │  └─────────┴──────────┘ │ │
│  │                              │  ┌─────────┬──────────┐ │ │
│  │                              │  │ CLEANER │ REVIEWER │ │ │
│  │                              │  └─────────┴──────────┘ │ │
│  └──────────────────────────────┴──────────────────────────┘ │
│  ┌──────────────────────────────┬──────────────────────────┐ │
│  │   Infrastructure Agents      │   Architecture Agents    │ │
│  │  ┌─────────┬─────────────┐   │  ┌───────────┬─────────┐ │ │
│  │  │DEPLOYER │   MONITOR   │   │  │ARCHITECT  │REFACTOR │ │ │
│  │  └─────────┴─────────────┘   │  └───────────┴─────────┘ │ │
│  │  ┌─────────┐                 │  ┌─────────────────────┐ │ │
│  │  │MIGRATOR │                 │  │    RESEARCHER       │ │ │
│  │  └─────────┘                 │  └─────────────────────┘ │ │
│  └──────────────────────────────┴──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 Utility Agents                           │ │
│  │  ┌─────────────┬──────────────┬──────────────────────┐  │ │
│  │  │SECURITYGUARD│  DOCUMENTER  │     INTEGRATOR       │  │ │
│  │  └─────────────┴──────────────┴──────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Agent Communication

Agents communicate through:

- **Linear.app Integration**: Task creation, status updates, assignments
- **MCP Protocol**: Tool access and operation coordination
- **Internal Messaging**: Direct agent-to-agent communication
- **Shared State**: Configuration and status information

## Core Agents

The core agents are always active and handle fundamental system operations.

### AUDITOR - Code Quality Assessment

**Primary Responsibility**: Continuous code quality monitoring and issue detection

#### Capabilities

- **Comprehensive Code Scanning**: Analyzes entire codebase for quality issues
- **Issue Classification**: Categorizes problems by severity and type
- **Linear Task Creation**: Automatically creates improvement tasks
- **Technical Debt Tracking**: Monitors and quantifies technical debt
- **Pattern Recognition**: Identifies recurring quality problems

#### Key Operations

```bash
# Full codebase assessment
npm run agent:invoke AUDITOR:assess-code -- --scope full

# Incremental assessment (changed files only)
npm run agent:invoke AUDITOR:assess-code -- --scope incremental

# Technical debt analysis
npm run agent:invoke AUDITOR:analyze-debt

# Quality trends report
npm run agent:invoke AUDITOR:quality-trends

# Fix Pack candidate generation
npm run agent:invoke AUDITOR:generate-fix-candidates
```

#### Configuration Options

```json
{
  "agent": "AUDITOR",
  "settings": {
    "scan_interval": 300000,
    "max_files_per_scan": 1000,
    "quality_thresholds": {
      "complexity": 10,
      "duplication": 5,
      "maintainability": 70
    },
    "auto_create_tasks": true,
    "severity_mapping": {
      "critical": ["security", "data_loss"],
      "high": ["performance", "reliability"],
      "medium": ["maintainability", "style"],
      "low": ["documentation", "naming"]
    }
  }
}
```

### EXECUTOR - Fix Implementation

**Primary Responsibility**: Implements approved fixes using strict TDD methodology

#### Capabilities

- **TDD-Driven Implementation**: Follows RED→GREEN→REFACTOR cycle
- **Fix Pack Management**: Implements atomic changes ≤300 LOC
- **Rollback Capability**: Automatic rollback on failure
- **Code Style Preservation**: Maintains existing project patterns
- **Safety Mechanisms**: Multiple validation layers

#### Key Operations

```bash
# Implement specific Fix Pack
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123

# Preview changes without implementation
npm run agent:invoke EXECUTOR:preview-fix -- --task-id CLEAN-123

# Batch implement multiple fixes
npm run agent:invoke EXECUTOR:implement-batch -- --task-ids "CLEAN-123,CLEAN-124"

# Rollback last implementation
npm run agent:invoke EXECUTOR:rollback-last

# Implementation status and metrics
npm run agent:invoke EXECUTOR:status
```

#### Safety Features

- **Test-First Implementation**: Must write failing tests before code
- **Coverage Validation**: Ensures adequate test coverage
- **Automated Rollback**: Reverts changes on test failures
- **Human Approval**: Requires explicit approval for implementation
- **Change Auditing**: Complete audit trail of all changes

### GUARDIAN - CI/CD Protection

**Primary Responsibility**: Monitors and protects CI/CD pipelines with auto-recovery

#### Capabilities

- **Pipeline Monitoring**: Real-time health monitoring
- **Failure Detection**: Intelligent failure pattern recognition
- **Auto-Recovery**: Automatic pipeline recovery strategies
- **Performance Tracking**: SLA monitoring and alerting
- **Incident Management**: Creates and manages incident tickets

#### Key Operations

```bash
# Check all pipeline health
npm run agent:invoke GUARDIAN:check-pipelines

# Analyze specific failure
npm run agent:invoke GUARDIAN:analyze-failure -- --build-id 12345

# Enable auto-recovery for pipeline
npm run agent:invoke GUARDIAN:enable-auto-recovery -- --pipeline main

# Generate health report
npm run agent:invoke GUARDIAN:health-report

# Recovery statistics
npm run agent:invoke GUARDIAN:recovery-stats
```

#### Auto-Recovery Strategies

- **Retry with Backoff**: Intelligent retry mechanisms
- **Resource Scaling**: Automatic resource allocation
- **Environment Reset**: Clean environment restoration
- **Dependency Recovery**: Fix broken dependencies
- **Alert Escalation**: Human intervention when needed

### STRATEGIST - Workflow Orchestration

**Primary Responsibility**: Coordinates multi-agent workflows and Linear integration

#### Capabilities

- **Multi-Agent Coordination**: Orchestrates complex workflows
- **Linear Integration**: Full task management lifecycle
- **Resource Optimization**: Efficient resource allocation
- **Sprint Planning**: Automated sprint planning and management
- **Workload Balancing**: Distributes work across agents

#### Key Operations

```bash
# Plan next sprint
npm run agent:invoke STRATEGIST:plan-sprint

# Coordinate complex task
npm run agent:invoke STRATEGIST:coordinate-task -- --task-id REFACTOR-456

# Optimize agent workload
npm run agent:invoke STRATEGIST:optimize-workload

# Linear task management
npm run agent:invoke STRATEGIST:manage-linear-tasks

# Generate coordination report
npm run agent:invoke STRATEGIST:coordination-report
```

#### Linear Management

- **Task Creation**: Creates tasks based on agent findings
- **Assignment Management**: Assigns tasks to appropriate agents
- **Progress Tracking**: Real-time progress updates
- **Sprint Coordination**: Manages sprint planning and execution

### SCHOLAR - Learning & Optimization

**Primary Responsibility**: Continuous learning and system optimization

#### Capabilities

- **Pattern Analysis**: Identifies successful patterns and anti-patterns
- **Performance Optimization**: Improves system efficiency
- **Knowledge Extraction**: Builds knowledge base from experiences
- **Predictive Insights**: Predicts potential issues and solutions
- **System Evolution**: Recommends system improvements

#### Key Operations

```bash
# Analyze recent patterns
npm run agent:invoke SCHOLAR:analyze-patterns

# Generate learning report
npm run agent:invoke SCHOLAR:learning-report

# Performance optimization
npm run agent:invoke SCHOLAR:optimize-performance

# Export knowledge base
npm run agent:invoke SCHOLAR:export-knowledge

# Team insights
npm run agent:invoke SCHOLAR:team-insights
```

#### Learning Capabilities

- **Success Pattern Recognition**: Learns from successful fixes
- **Failure Analysis**: Analyzes and learns from failures
- **Performance Metrics**: Tracks and optimizes system performance
- **Predictive Modeling**: Predicts likely issues and solutions

## Specialized Agents

Specialized agents are activated based on context and specific needs.

### Testing Agents

#### TESTER - Test Suite Generation

**Focus**: Creates comprehensive test suites for untested code

```bash
# Generate tests for specific module
npm run agent:invoke TESTER:generate-tests -- --module src/payment/

# Create missing test coverage
npm run agent:invoke TESTER:fill-coverage-gaps

# Generate property-based tests
npm run agent:invoke TESTER:generate-property-tests
```

#### VALIDATOR - Test Quality Assessment

**Focus**: Validates test quality and effectiveness

```bash
# Analyze test suite quality
npm run agent:invoke VALIDATOR:analyze-test-quality

# Validate coverage adequacy
npm run agent:invoke VALIDATOR:validate-coverage

# Mutation testing analysis
npm run agent:invoke VALIDATOR:mutation-analysis
```

### Quality Agents

#### ANALYZER - Deep Code Analysis

**Focus**: Comprehensive code metrics and analysis

```bash
# Analyze code complexity
npm run agent:invoke ANALYZER:analyze-complexity

# Performance bottleneck analysis
npm run agent:invoke ANALYZER:analyze-performance

# Architecture quality assessment
npm run agent:invoke ANALYZER:analyze-architecture
```

#### OPTIMIZER - Performance Optimization

**Focus**: Code and system performance improvements

```bash
# Optimize bundle size
npm run agent:invoke OPTIMIZER:optimize-bundle

# Database query optimization
npm run agent:invoke OPTIMIZER:optimize-queries

# Memory usage optimization
npm run agent:invoke OPTIMIZER:optimize-memory
```

#### CLEANER - Code Cleanup

**Focus**: Removes dead code, improves maintainability

```bash
# Remove dead code
npm run agent:invoke CLEANER:remove-dead-code

# Clean up code style inconsistencies
npm run agent:invoke CLEANER:cleanup-style

# Consolidate duplicate code
npm run agent:invoke CLEANER:consolidate-duplicates
```

#### REVIEWER - Automated Code Review

**Focus**: Provides automated code review insights

```bash
# Review pull request
npm run agent:invoke REVIEWER:review-pr -- --pr-number 123

# Generate review checklist
npm run agent:invoke REVIEWER:generate-checklist

# Best practices validation
npm run agent:invoke REVIEWER:validate-practices
```

### Infrastructure Agents

#### DEPLOYER - Deployment Automation

**Focus**: Safe and reliable deployment management

```bash
# Deploy to staging
npm run agent:invoke DEPLOYER:deploy -- --environment staging

# Rollback deployment
npm run agent:invoke DEPLOYER:rollback -- --deployment-id dep-123

# Deployment health check
npm run agent:invoke DEPLOYER:health-check
```

#### MONITOR - Real-time Monitoring

**Focus**: System observability and metrics collection

```bash
# Start monitoring session
npm run agent:invoke MONITOR:start-monitoring

# Generate performance report
npm run agent:invoke MONITOR:performance-report

# Configure alerts
npm run agent:invoke MONITOR:configure-alerts
```

#### MIGRATOR - Data/Code Migration

**Focus**: Manages migrations and data transformations

```bash
# Database migration
npm run agent:invoke MIGRATOR:migrate-database

# Code migration analysis
npm run agent:invoke MIGRATOR:analyze-migration

# Migration rollback planning
npm run agent:invoke MIGRATOR:plan-rollback
```

### Architecture Agents

#### ARCHITECT - System Design

**Focus**: Architecture analysis and design guidance

```bash
# Architecture assessment
npm run agent:invoke ARCHITECT:assess-architecture

# Design pattern recommendations
npm run agent:invoke ARCHITECT:recommend-patterns

# Dependency analysis
npm run agent:invoke ARCHITECT:analyze-dependencies
```

#### REFACTORER - Code Refactoring

**Focus**: Large-scale code restructuring

```bash
# Plan refactoring strategy
npm run agent:invoke REFACTORER:plan-refactoring -- --scope src/legacy/

# Execute refactoring plan
npm run agent:invoke REFACTORER:execute-plan -- --plan-id refactor-123

# Refactoring impact analysis
npm run agent:invoke REFACTORER:impact-analysis
```

#### RESEARCHER - Technology Research

**Focus**: Technology recommendations and research

```bash
# Technology stack analysis
npm run agent:invoke RESEARCHER:analyze-stack

# Alternative technology research
npm run agent:invoke RESEARCHER:research-alternatives

# Technology upgrade planning
npm run agent:invoke RESEARCHER:plan-upgrades
```

### Utility Agents

#### SECURITYGUARD - Security Management

**Focus**: Security vulnerability detection and remediation

```bash
# Security vulnerability scan
npm run agent:invoke SECURITYGUARD:security-scan

# Dependency vulnerability check
npm run agent:invoke SECURITYGUARD:check-dependencies

# Security best practices audit
npm run agent:invoke SECURITYGUARD:audit-practices
```

#### DOCUMENTER - Documentation Management

**Focus**: Documentation creation and maintenance

```bash
# Generate API documentation
npm run agent:invoke DOCUMENTER:generate-api-docs

# Update README files
npm run agent:invoke DOCUMENTER:update-readme

# Create code documentation
npm run agent:invoke DOCUMENTER:document-code
```

#### INTEGRATOR - External Integration

**Focus**: External service integration and management

```bash
# API integration analysis
npm run agent:invoke INTEGRATOR:analyze-integrations

# Service dependency mapping
npm run agent:invoke INTEGRATOR:map-dependencies

# Integration health check
npm run agent:invoke INTEGRATOR:health-check-integrations
```

## Agent Coordination

### Multi-Agent Workflows

The STRATEGIST coordinates complex workflows involving multiple agents:

#### Quality Improvement Workflow

```
1. AUDITOR identifies quality issues
2. STRATEGIST creates Linear tasks and assigns priorities
3. EXECUTOR implements fixes using TDD
4. VALIDATOR ensures fix quality
5. REVIEWER provides feedback
6. SCHOLAR learns from successful patterns
```

#### Security Remediation Workflow

```
1. SECURITYGUARD detects vulnerabilities
2. STRATEGIST prioritizes based on severity
3. AUDITOR assesses impact scope
4. EXECUTOR implements security fixes
5. GUARDIAN ensures deployment safety
6. MONITOR validates fix effectiveness
```

#### Performance Optimization Workflow

```
1. MONITOR identifies performance issues
2. ANALYZER performs deep analysis
3. OPTIMIZER recommends improvements
4. ARCHITECT validates design impact
5. EXECUTOR implements optimizations
6. VALIDATOR measures improvements
```

### Concurrency Management

The system implements Phase B.1 Enhanced Concurrency:

- **Maximum 3 concurrent agents**: Prevents resource exhaustion
- **Evidence-based limits**: 2 operations per MCP server
- **Circuit breakers**: Automatic failure recovery
- **Load balancing**: Distributes work efficiently

## Agent Invocation

### Command Syntax

All agent commands follow the standardized pattern:

```bash
npm run agent:invoke <AGENT>:<COMMAND> -- [options]
```

### Common Invocation Patterns

#### Health Checks

```bash
# Individual agent health
npm run agent:invoke AUDITOR:health-check

# All agents health status
npm run agents:status

# System-wide health
npm run status
```

#### Status and Reporting

```bash
# Agent status
npm run agent:invoke EXECUTOR:status

# Performance metrics
npm run agent:invoke SCHOLAR:performance-metrics

# Coordination report
npm run agent:invoke STRATEGIST:coordination-report
```

#### Configuration Management

```bash
# Configure agent settings
npm run agent:configure -- --agent AUDITOR --setting max_files=1000

# Export configuration
npm run agent:export-config -- --agent STRATEGIST

# Import configuration
npm run agent:import-config -- --file strategist-config.json
```

## Agent Performance

### Performance Metrics

The system tracks comprehensive agent performance:

#### Response Time Metrics

- **Health Check**: ≤30 seconds
- **Assessment**: ≤12 minutes for 150k LOC
- **Fix Implementation**: ≤15 minutes p50
- **Pipeline Recovery**: ≤10 minutes p95

#### Success Rate Metrics

- **MCP Operations**: >99% success rate
- **Fix Implementation**: >95% success rate
- **Pipeline Recovery**: >90% success rate
- **Task Completion**: >98% success rate

#### Resource Utilization

- **Memory Usage**: Monitored and optimized
- **CPU Usage**: Load balanced across agents
- **Network Usage**: Efficient MCP protocol usage
- **Storage Usage**: Optimized caching strategies

### Performance Monitoring

```bash
# Real-time performance dashboard
npm run agent:invoke MONITOR:performance-dashboard

# Agent-specific performance
npm run agent:invoke SCHOLAR:agent-performance -- --agent EXECUTOR

# System performance trends
npm run agent:invoke ANALYZER:performance-trends

# Resource utilization report
npm run agent:invoke MONITOR:resource-utilization
```

### Performance Optimization

```bash
# Optimize agent performance
npm run agent:invoke SCHOLAR:optimize-agents

# Tune concurrency settings
npm run agent:invoke STRATEGIST:tune-concurrency

# Memory optimization
npm run agent:invoke OPTIMIZER:optimize-memory-usage
```

## Agent Configuration

### Individual Agent Configuration

Each agent has dedicated configuration files in `.claude/agents/`:

```json
// .claude/agents/auditor.json
{
  "agent": "AUDITOR",
  "enabled": true,
  "priority": "high",
  "settings": {
    "scan_interval": 300000,
    "max_files_per_scan": 1000,
    "auto_create_tasks": true
  },
  "linear_integration": {
    "create_tasks": true,
    "task_prefix": "CLEAN",
    "assign_to_team": true
  }
}
```

### Global Agent Settings

System-wide agent configuration in `.claude/settings.json`:

```json
{
  "agents": {
    "enabled": true,
    "max_concurrent": 3,
    "default_timeout": 300000,
    "health_check_interval": 30000,
    "auto_recovery": true,
    "circuit_breaker": {
      "enabled": true,
      "failure_threshold": 5,
      "recovery_timeout": 30000
    }
  }
}
```

### Environment-Specific Configuration

```bash
# Development environment
export CLAUDE_MAX_CONCURRENT_AGENTS=3
export CLAUDE_AGENT_TIMEOUT=300

# Production environment
export CLAUDE_MAX_CONCURRENT_AGENTS=2
export CLAUDE_AGENT_TIMEOUT=600
export CLAUDE_AGENT_MODE=conservative
```

## Custom Agent Development

### Creating Custom Agents

```bash
# Generate agent template
npm run agent:create -- --name CustomAgent --type specialized

# Available templates:
# - core: Core system agent
# - specialized: Domain-specific agent
# - utility: Utility/helper agent
```

### Agent Development Structure

```javascript
// .claude/agents/custom/my-agent.js
export class MyCustomAgent {
  constructor(config) {
    this.config = config;
    this.name = 'MY_CUSTOM_AGENT';
    this.capabilities = ['analyze', 'report', 'fix'];
  }

  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      capabilities: this.capabilities,
    };
  }

  async analyze(options = {}) {
    // Custom analysis logic
    return {
      success: true,
      results: {},
      recommendations: [],
    };
  }

  async report(analysisResults) {
    // Generate reports
    return {
      summary: {},
      details: {},
      actionItems: [],
    };
  }
}
```

### Agent Testing

```bash
# Test custom agent
npm run agent:test -- --agent MY_CUSTOM_AGENT

# Validate agent interface
npm run agent:validate -- --agent MY_CUSTOM_AGENT

# Integration testing
npm run agent:test-integration -- --agent MY_CUSTOM_AGENT
```

### Agent Deployment

```bash
# Deploy custom agent
npm run agent:deploy -- --agent MY_CUSTOM_AGENT

# Enable custom agent
npm run agent:enable -- --agent MY_CUSTOM_AGENT

# Monitor deployment
npm run agent:monitor -- --agent MY_CUSTOM_AGENT
```

## Agent Troubleshooting

### Common Agent Issues

#### Agent Not Responding

```bash
# Check agent health
npm run agent:invoke AGENT:health-check

# Restart specific agent
npm run agent:restart -- --agent AGENT

# Check agent logs
npm run agent:logs -- --agent AGENT --tail 50
```

#### Performance Issues

```bash
# Agent performance analysis
npm run agent:invoke SCHOLAR:agent-performance -- --agent SLOW_AGENT

# Resource usage check
npm run monitor:agent-resources -- --agent SLOW_AGENT

# Optimize agent configuration
npm run agent:optimize -- --agent SLOW_AGENT
```

#### Configuration Problems

```bash
# Validate agent configuration
npm run agent:validate-config -- --agent AGENT

# Reset agent configuration
npm run agent:reset-config -- --agent AGENT

# Restore from backup
npm run agent:restore-config -- --agent AGENT --backup latest
```

### Emergency Procedures

#### Agent System Recovery

```bash
# Emergency agent system restart
npm run agents:emergency-restart

# Reset all agents to safe state
npm run agents:safe-mode

# Disable problematic agent
npm run agent:disable -- --agent PROBLEMATIC_AGENT
```

#### Data Recovery

```bash
# Recover agent data
npm run agent:recover-data -- --agent AGENT

# Rebuild agent knowledge base
npm run agent:invoke SCHOLAR:rebuild-knowledge

# Restore agent state
npm run agent:restore-state -- --agent AGENT --timestamp "2024-01-01T12:00:00Z"
```

## Agent Best Practices

### Agent Usage Guidelines

#### When to Use Each Agent Type

**Core Agents** (Use regularly):

- **AUDITOR**: Daily/weekly quality assessments
- **EXECUTOR**: Implementing approved fixes
- **GUARDIAN**: Continuous pipeline monitoring
- **STRATEGIST**: Sprint planning and coordination
- **SCHOLAR**: Performance optimization reviews

**Specialized Agents** (Use as needed):

- **TESTER/VALIDATOR**: When test coverage is insufficient
- **ANALYZER/OPTIMIZER**: For performance issues
- **SECURITYGUARD**: For security reviews
- **REFACTORER**: For large-scale code restructuring

#### Agent Invocation Best Practices

1. **Start with Health Checks**: Always verify agent health first
2. **Use Appropriate Scope**: Specify scope to optimize performance
3. **Monitor Progress**: Check status for long-running operations
4. **Review Results**: Always review agent recommendations
5. **Validate Changes**: Confirm changes meet requirements

### Team Collaboration with Agents

#### Agent Assignment Strategy

```bash
# Assign agents to team members
npm run agent:assign -- --agent AUDITOR --member "tech-lead"
npm run agent:assign -- --agent EXECUTOR --member "senior-dev"

# Team agent usage statistics
npm run agent:invoke STRATEGIST:team-usage-stats

# Agent workload balancing
npm run agent:invoke STRATEGIST:balance-workload
```

#### Knowledge Sharing

```bash
# Export agent insights for team
npm run agent:invoke SCHOLAR:export-team-insights

# Generate agent usage guide
npm run agent:invoke DOCUMENTER:agent-usage-guide

# Share successful patterns
npm run agent:invoke SCHOLAR:share-patterns
```

### Agent Maintenance

#### Regular Maintenance Tasks

```bash
# Weekly agent health review
npm run agents:weekly-health-check

# Monthly performance optimization
npm run agent:invoke SCHOLAR:monthly-optimization

# Quarterly configuration review
npm run agents:quarterly-config-review
```

#### Agent Updates

```bash
# Check for agent updates
npm run agents:check-updates

# Update specific agent
npm run agent:update -- --agent AUDITOR

# Update all agents
npm run agents:update-all
```

---

**The 20-agent system represents the future of autonomous code quality management. Each agent is a specialist that contributes to the overall health and quality of your codebase. Master their capabilities, and you'll have an unstoppable development workflow! 🚀**

**For additional agent information:**

- [User Guide](USER-GUIDE.md) - Complete system overview
- [Commands Reference](COMMANDS.md) - All agent commands
- [Configuration](CONFIGURATION.md) - Agent configuration details
- [Troubleshooting](TROUBLESHOOTING.md) - Agent problem resolution
