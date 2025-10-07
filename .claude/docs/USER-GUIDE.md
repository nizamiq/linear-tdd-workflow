# User Guide - Claude Agentic Workflow System

Complete guide to understanding and mastering the Claude Agentic Workflow System for autonomous code quality management.

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Concepts](#core-concepts)
3. [Agent System Deep Dive](#agent-system-deep-dive)
4. [TDD Workflow Mastery](#tdd-workflow-mastery)
5. [Daily Development Workflow](#daily-development-workflow)
6. [Quality Management](#quality-management)
7. [Linear Integration](#linear-integration)
8. [Performance and Monitoring](#performance-and-monitoring)
9. [Advanced Features](#advanced-features)
10. [Team Collaboration](#team-collaboration)

## System Overview

The Claude Agentic Workflow System transforms traditional development into an autonomous code quality management experience. It combines:

- **20 Specialized AI Agents**: Each with specific expertise and responsibilities
- **Strict TDD Enforcement**: RED→GREEN→REFACTOR cycle with quality gates
- **Linear Integration**: Automated task management and issue tracking
- **Fix Pack System**: Atomic improvements with rollback capability
- **Multi-Language Support**: JavaScript, TypeScript, Python with extensible architecture

### Architecture at a Glance

```
Claude Agentic Workflow System
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIST (Orchestrator)                │
├─────────────────────────────────────────────────────────────┤
│  Core Agents                    │  Specialized Agents       │
│  ├── AUDITOR (Assessment)       │  ├── TESTER               │
│  ├── EXECUTOR (Implementation)  │  ├── VALIDATOR            │
│  ├── GUARDIAN (CI/CD)          │  ├── ANALYZER             │
│  └── SCHOLAR (Learning)        │  ├── OPTIMIZER            │
│                                 │  ├── CLEANER             │
│                                 │  ├── REVIEWER            │
│                                 │  ├── DEPLOYER            │
│                                 │  ├── MONITOR             │
│                                 │  ├── MIGRATOR            │
│                                 │  ├── ARCHITECT           │
│                                 │  ├── REFACTORER          │
│                                 │  ├── RESEARCHER          │
│                                 │  ├── SECURITYGUARD       │
│                                 │  ├── DOCUMENTER          │
│                                 │  └── INTEGRATOR          │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                        │
│  ├── Linear.app (Task Management)                          │
│  ├── MCP Tools (Model Context Protocol)                    │
│  └── CI/CD Pipelines (Quality Gates)                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Agent-Driven Development

Unlike traditional tools that require manual execution, the Claude Agentic Workflow System operates through autonomous agents that:

- **Monitor continuously**: Always watching for quality issues
- **Act proactively**: Create tasks and implement fixes
- **Learn adaptively**: Improve based on codebase patterns
- **Collaborate intelligently**: Coordinate complex multi-agent workflows

### 2. Fix Pack System

All improvements are delivered as "Fix Packs" - atomic, tested changes with these constraints:

- **≤300 LOC**: Maximum lines of code changed
- **TDD Enforced**: Must follow RED→GREEN→REFACTOR
- **Pre-approved Types**: Only FIL-0 and FIL-1 changes (see Feature Impact Levels)
- **Rollback Ready**: Automatic rollback capability

### 3. Feature Impact Levels (FIL)

Every change is classified by impact level:

- **FIL-0**: Cosmetic (formatting, comments, whitespace)
- **FIL-1**: Safe refactoring (renames, dead code removal, pure functions)
- **FIL-2**: Utility additions (helpers, configs) - Tech Lead approval
- **FIL-3**: API changes (interfaces, migrations) - Tech Lead + Product approval

### 4. Quality Gates

Enforced automatically at every level:

- **Code Coverage**: ≥80% for all code, ≥95% for critical paths
- **Mutation Testing**: ≥30% mutation score for critical code
- **Linting**: Zero errors, warnings reviewed
- **Type Safety**: Full TypeScript compliance
- **Performance**: SLA monitoring with alerts

## Agent System Deep Dive

### Core Agents (Always Active)

#### AUDITOR - Code Quality Assessment

**Primary Responsibility**: Continuous code quality monitoring

**Capabilities**:

- Scans entire codebase for quality issues
- Generates Fix Pack candidates
- Creates Linear tasks with detailed specifications
- Tracks technical debt and quality trends

**Usage**:

```bash
# Full codebase assessment
npm run agent:invoke AUDITOR:assess-code -- --scope full

# Incremental assessment (changed files only)
npm run agent:invoke AUDITOR:assess-code -- --scope incremental

# Specific file assessment
npm run agent:invoke AUDITOR:assess-code -- --files src/components/Button.tsx

# Generate technical debt report
npm run agent:invoke AUDITOR:generate-debt-report
```

#### EXECUTOR - Fix Implementation

**Primary Responsibility**: Implements approved fixes using strict TDD

**Capabilities**:

- Implements Fix Packs ≤300 LOC
- Follows RED→GREEN→REFACTOR cycle
- Automatic rollback on failure
- Preserves existing code style and patterns

**Usage**:

```bash
# Implement specific Fix Pack
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123

# Batch implement multiple fixes
npm run agent:invoke EXECUTOR:implement-batch -- --task-ids CLEAN-123,CLEAN-124

# Preview changes without implementing
npm run agent:invoke EXECUTOR:preview-fix -- --task-id CLEAN-123

# Rollback last implementation
npm run agent:invoke EXECUTOR:rollback-last
```

#### GUARDIAN - CI/CD Protection

**Primary Responsibility**: Monitors and protects CI/CD pipelines

**Capabilities**:

- Detects pipeline failures
- Implements auto-recovery strategies
- Maintains >90% pipeline success rate
- Prevents problematic changes from reaching production

**Usage**:

```bash
# Check pipeline health
npm run agent:invoke GUARDIAN:check-pipelines

# Analyze recent failure
npm run agent:invoke GUARDIAN:analyze-failure -- --build-id 12345

# Enable auto-recovery for specific pipeline
npm run agent:invoke GUARDIAN:enable-auto-recovery -- --pipeline main

# Generate pipeline health report
npm run agent:invoke GUARDIAN:health-report
```

#### STRATEGIST - Workflow Orchestration

**Primary Responsibility**: Coordinates multi-agent workflows and Linear integration

**Capabilities**:

- Plans sprint work across multiple agents
- Manages Linear task assignment and prioritization
- Coordinates complex multi-phase improvements
- Optimizes resource allocation

**Usage**:

```bash
# Plan next sprint
npm run agent:invoke STRATEGIST:plan-sprint

# Coordinate large refactoring
npm run agent:invoke STRATEGIST:coordinate-refactor -- --scope src/legacy/

# Optimize agent workload
npm run agent:invoke STRATEGIST:optimize-workload

# Generate coordination report
npm run agent:invoke STRATEGIST:coordination-report
```

#### SCHOLAR - Pattern Learning

**Primary Responsibility**: Analyzes patterns and continuously improves system performance

**Capabilities**:

- Learns from successful fixes and failures
- Identifies codebase-specific patterns
- Optimizes agent performance
- Provides insights for system improvement

**Usage**:

```bash
# Analyze recent patterns
npm run agent:invoke SCHOLAR:analyze-patterns

# Generate learning report
npm run agent:invoke SCHOLAR:learning-report

# Update system based on learnings
npm run agent:invoke SCHOLAR:update-system

# Export knowledge for team
npm run agent:invoke SCHOLAR:export-knowledge
```

### Specialized Agents (Context-Activated)

#### Testing Agents

- **TESTER**: Creates comprehensive test suites
- **VALIDATOR**: Validates test coverage and quality

#### Quality Agents

- **ANALYZER**: Deep code analysis and metrics
- **OPTIMIZER**: Performance optimization
- **CLEANER**: Code cleanup and maintenance
- **REVIEWER**: Automated code review

#### Infrastructure Agents

- **DEPLOYER**: Deployment automation
- **MONITOR**: Real-time monitoring
- **MIGRATOR**: Data and code migration

#### Architecture Agents

- **ARCHITECT**: System design guidance
- **REFACTORER**: Large-scale refactoring
- **RESEARCHER**: Technology research

#### Specialized Agents

- **SECURITYGUARD**: Security scanning and fixes
- **DOCUMENTER**: Documentation management
- **INTEGRATOR**: External service integration

## TDD Workflow Mastery

### The Sacred Cycle: RED→GREEN→REFACTOR

Every code change must follow this cycle:

#### 1. RED Phase - Write Failing Test

```bash
# Start TDD watch mode
npm test:watch

# Write failing test first
# Example: tests/user-service.test.js
describe('UserService', () => {
  test('should validate email format', () => {
    const userService = new UserService();
    expect(userService.validateEmail('invalid-email')).toBe(false);
    expect(userService.validateEmail('valid@email.com')).toBe(true);
  });
});
```

**Validation**: Test must fail for the right reason (function doesn't exist)

#### 2. GREEN Phase - Minimal Implementation

```javascript
// src/user-service.js
export class UserService {
  validateEmail(email) {
    // Minimal implementation to pass test
    return email.includes('@') && email.includes('.');
  }
}
```

**Validation**: Test must pass with minimal code

#### 3. REFACTOR Phase - Improve Quality

```javascript
// src/user-service.js
/**
 * Service for user-related operations
 */
export class UserService {
  /**
   * Validates email format using RFC-compliant regex
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email is valid
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

**Validation**: All tests still pass after improvements

### TDD Enforcement Mechanisms

The system enforces TDD through multiple layers:

#### 1. Pre-commit Hooks

```bash
# Automatically runs before every commit
npm run precommit
```

Checks:

- All new code has corresponding tests
- Coverage ≥80% for changed files
- No failing tests
- Linting passes

#### 2. CI/CD Gates

Quality gates in your pipeline:

- Diff coverage enforcement
- Mutation testing for critical paths
- Performance regression detection
- Security vulnerability scanning

#### 3. Agent Monitoring

- **AUDITOR**: Identifies untested code
- **GUARDIAN**: Blocks PRs that violate TDD
- **SCHOLAR**: Learns from TDD patterns

### TDD Best Practices

#### Test Organization

```
tests/
├── unit/           # Isolated component tests
│   ├── services/
│   ├── utils/
│   └── components/
├── integration/    # Component interaction tests
│   ├── api/
│   └── database/
└── e2e/           # End-to-end user journeys
    ├── user-flows/
    └── critical-paths/
```

#### Test Naming Conventions

```javascript
// ✅ Good: Describes behavior
test('should return error when email is invalid', () => {});

// ❌ Bad: Describes implementation
test('validateEmail function test', () => {});
```

#### Test Structure (AAA Pattern)

```javascript
test('should calculate tax correctly for high income', () => {
  // Arrange
  const taxCalculator = new TaxCalculator();
  const income = 100000;

  // Act
  const tax = taxCalculator.calculate(income);

  // Assert
  expect(tax).toBe(25000);
});
```

## Daily Development Workflow

### Morning Routine (5 minutes)

```bash
# Check system health
npm run status

# Review overnight assessments
npm run agent:invoke AUDITOR:status

# Sync with Linear tasks
npm run linear:sync

# Check for urgent issues
npm run agent:invoke GUARDIAN:urgent-alerts
```

### Feature Development Workflow

#### 1. Start New Feature

```bash
# Create feature branch
git checkout -b feature/user-authentication

# Get initial assessment
npm run assess

# Start TDD mode
npm test:watch
```

#### 2. TDD Implementation Loop

```bash
# Write failing test
# ↓
# Write minimal code
# ↓
# Refactor
# ↓
# Repeat until feature complete
```

#### 3. Pre-commit Validation

```bash
# Run all quality checks
npm run precommit

# If any issues, fix them:
npm run lint               # Fix linting issues
npm run format             # Auto-format code
npm test                   # Ensure tests pass
```

#### 4. Create Pull Request

```bash
# Push feature branch
git push origin feature/user-authentication

# Create PR (triggers CI/CD)
# GUARDIAN monitors the pipeline
# Auto-recovery if failures occur
```

### Code Review Integration

The system enhances human code review:

#### Automated Pre-Review

```bash
# Before human review, REVIEWER agent analyzes
npm run agent:invoke REVIEWER:analyze-pr -- --pr-number 123

# Generates review comments for:
# - Code quality issues
# - Test coverage gaps
# - Performance concerns
# - Security vulnerabilities
```

#### Review Guidelines Enhanced by AI

- **Quality Metrics**: Coverage, complexity, maintainability scores
- **Pattern Analysis**: Consistency with codebase patterns
- **Risk Assessment**: Change impact and rollback complexity
- **Learning Insights**: Patterns from previous successful reviews

### Maintenance Workflows

#### Weekly Quality Review

```bash
# Generate comprehensive quality report
npm run agent:invoke AUDITOR:weekly-report

# Review technical debt trends
npm run agent:invoke STRATEGIST:debt-trends

# Plan improvement sprints
npm run agent:invoke STRATEGIST:plan-improvements
```

#### Monthly System Health

```bash
# Comprehensive system diagnostics
npm run doctor

# Agent performance analysis
npm run agent:invoke SCHOLAR:performance-analysis

# Update system configurations
npm run agent:invoke STRATEGIST:optimize-config
```

## Quality Management

### Metrics Dashboard

The system tracks comprehensive quality metrics:

#### Code Quality Metrics

```bash
# View current metrics
npm run status

# Detailed quality report
npm run agent:invoke ANALYZER:quality-report
```

Tracked metrics:

- **Test Coverage**: Line, branch, function coverage
- **Code Complexity**: Cyclomatic complexity, cognitive complexity
- **Maintainability**: Technical debt, code duplication
- **Performance**: Bundle size, runtime performance
- **Security**: Vulnerability count, security score

#### Quality Trends

```bash
# Historical trends
npm run agent:invoke ANALYZER:trends-report

# Quality regression detection
npm run agent:invoke AUDITOR:regression-check
```

### Quality Gates Configuration

Quality gates are configured in `.claude/settings.json`:

```json
{
  "quality_gates": {
    "coverage": {
      "minimum": 80,
      "critical_paths": 95,
      "diff_coverage": 80
    },
    "mutation_testing": {
      "critical_paths": 30,
      "minimum": 20
    },
    "complexity": {
      "cyclomatic_max": 10,
      "cognitive_max": 15
    },
    "performance": {
      "bundle_size_max": "500KB",
      "test_timeout": "30s"
    }
  }
}
```

### Continuous Quality Improvement

#### Automated Quality Tasks

The AUDITOR agent continuously creates quality improvement tasks:

- **CLEAN-XXX**: Code cleanup tasks
- **PERF-XXX**: Performance optimization tasks
- **SEC-XXX**: Security improvement tasks
- **TEST-XXX**: Test coverage improvement tasks
- **DEBT-XXX**: Technical debt reduction tasks

#### Quality Sprint Planning

```bash
# Plan quality-focused sprint
npm run agent:invoke STRATEGIST:plan-quality-sprint

# Prioritize technical debt
npm run agent:invoke AUDITOR:prioritize-debt

# Estimate improvement effort
npm run agent:invoke STRATEGIST:estimate-improvements
```

## Linear Integration

### Automated Task Management

The system creates and manages Linear tasks automatically:

#### Task Creation

- **AUDITOR**: Creates quality improvement tasks
- **GUARDIAN**: Creates incident response tasks
- **STRATEGIST**: Creates coordination tasks

#### Task Tracking

```bash
# Sync current status with Linear
npm run linear:sync

# View agent-created tasks
npm run agent:invoke STRATEGIST:linear-tasks

# Update task progress
npm run agent:invoke STRATEGIST:update-progress
```

### Sprint Coordination

#### Sprint Planning

```bash
# Generate sprint plan
npm run agent:invoke STRATEGIST:plan-sprint

# Estimate story points
npm run agent:invoke STRATEGIST:estimate-points

# Assign tasks to agents
npm run agent:invoke STRATEGIST:assign-tasks
```

#### Sprint Execution

```bash
# Daily progress update
npm run agent:invoke STRATEGIST:daily-update

# Block resolution
npm run agent:invoke STRATEGIST:resolve-blocks

# Sprint health check
npm run agent:invoke STRATEGIST:sprint-health
```

### Linear Configuration

Configure Linear integration in `.claude/settings.json`:

```json
{
  "linear": {
    "team_id": "your-team-id",
    "project_id": "your-project-id",
    "auto_create_tasks": true,
    "task_prefixes": {
      "quality": "CLEAN",
      "security": "SEC",
      "performance": "PERF",
      "incident": "INCIDENT"
    },
    "priority_mapping": {
      "critical": 1,
      "high": 2,
      "normal": 3,
      "low": 4
    }
  }
}
```

## Performance and Monitoring

### System Performance SLAs

The system maintains strict performance commitments:

#### Response Time SLAs

- **Assessment**: ≤12 minutes for 150k LOC
- **Fix Implementation**: ≤15 minutes p50
- **Pipeline Recovery**: ≤10 minutes p95
- **Agent Health Check**: ≤30 seconds

#### Success Rate SLAs

- **MCP Tool Operations**: >99% success rate
- **Pipeline Auto-Recovery**: >90% success rate
- **Fix Pack Implementation**: >95% success rate

### Real-time Monitoring

#### Performance Dashboard

```bash
# Current system performance
npm run status

# Detailed performance metrics
npm run agent:invoke MONITOR:performance-dashboard

# SLA compliance report
npm run agent:invoke MONITOR:sla-report
```

#### Alert Configuration

```json
{
  "monitoring": {
    "alerts": {
      "assessment_timeout": "15min",
      "pipeline_failure": "immediate",
      "coverage_drop": "5%",
      "performance_regression": "20%"
    },
    "escalation": {
      "critical": "immediate",
      "high": "30min",
      "normal": "2hours"
    }
  }
}
```

### Performance Optimization

#### System Tuning

```bash
# Optimize agent performance
npm run agent:invoke SCHOLAR:optimize-performance

# Tune concurrency settings
npm run agent:invoke STRATEGIST:tune-concurrency

# Update performance baselines
npm run agent:invoke MONITOR:update-baselines
```

## Advanced Features

### Phase B.1 Enhanced Concurrency

The system implements evidence-based concurrency management:

#### Concurrency Features

- **3-Agent Orchestration**: Maximum 3 agents executing simultaneously
- **Circuit Breakers**: Automatic failure detection and recovery
- **Evidence-Based Limits**: 2 operations per MCP server maximum
- **Real-time Monitoring**: Performance tracking with auto-adjustment

#### Concurrency Configuration

```json
{
  "concurrency": {
    "max_concurrent_agents": 3,
    "mcp_operation_limit": 2,
    "circuit_breaker_threshold": 5,
    "recovery_timeout": "30s"
  }
}
```

### Multi-Language Support

#### Supported Languages

- **JavaScript/TypeScript**: Full support with Jest, ESLint, Prettier
- **Python**: Full support with pytest, black, ruff
- **Mixed Projects**: Intelligent polyglot handling

#### Language-Specific Commands

```bash
# JavaScript/TypeScript
npm run lint:js
npm run test:js
npm run format:js

# Python
npm run lint:py
npm run test:py
npm run format:py

# All languages
npm run lint
npm run test
npm run format
```

### Custom Agent Development

#### Creating Custom Agents

```bash
# Generate agent template
npm run agent:create -- --name CustomAgent --type specialized

# Deploy custom agent
npm run agent:deploy -- --agent CustomAgent

# Test custom agent
npm run agent:test -- --agent CustomAgent
```

#### Agent Development Guidelines

- Follow agent interface specification
- Implement health check endpoint
- Include comprehensive error handling
- Provide detailed operation logging

## Team Collaboration

### Onboarding New Team Members

#### Quick Team Onboarding

```bash
# Setup for new team member
npm run setup:team-member -- --name "John Doe" --role developer

# Generate personalized guide
npm run agent:invoke DOCUMENTER:onboarding-guide -- --role developer

# Assign training tasks
npm run agent:invoke STRATEGIST:assign-training
```

#### Role-Based Access

```json
{
  "roles": {
    "developer": {
      "agents": ["AUDITOR", "EXECUTOR", "TESTER"],
      "commands": ["assess", "implement", "test"],
      "linear_access": "read_write"
    },
    "tech_lead": {
      "agents": ["all"],
      "commands": ["all"],
      "linear_access": "admin"
    },
    "qa": {
      "agents": ["TESTER", "VALIDATOR", "AUDITOR"],
      "commands": ["test", "validate", "assess"],
      "linear_access": "read_write"
    }
  }
}
```

### Knowledge Sharing

#### Learning from Agent Insights

```bash
# Generate team insights
npm run agent:invoke SCHOLAR:team-insights

# Share best practices
npm run agent:invoke DOCUMENTER:best-practices

# Create pattern library
npm run agent:invoke SCHOLAR:pattern-library
```

#### Cross-Team Collaboration

```bash
# Share agent configurations
npm run agent:invoke STRATEGIST:export-config

# Import from other teams
npm run agent:invoke STRATEGIST:import-config -- --team other-team

# Benchmark against teams
npm run agent:invoke ANALYZER:benchmark-teams
```

### Scaling with Multiple Projects

#### Multi-Project Management

```bash
# Register new project
npm run project:register -- --name new-project --path ../new-project

# Sync across projects
npm run project:sync-all

# Cross-project insights
npm run agent:invoke SCHOLAR:cross-project-analysis
```

---

## Next Steps

Now that you understand the complete system, explore these advanced topics:

- **[Commands Reference](COMMANDS.md)** - Complete CLI documentation
- **[Configuration](CONFIGURATION.md)** - Advanced system customization
- **[Linear Integration](LINEAR-INTEGRATION.md)** - Master task management
- **[CI/CD Integration](CI-CD-INTEGRATION.md)** - Pipeline automation
- **[Troubleshooting](TROUBLESHOOTING.md)** - Problem resolution

**Master the Claude Agentic Workflow System and transform your development process! 🚀**
