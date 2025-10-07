# Slash Command Registry

This file serves as the central registry for all slash commands in the Linear TDD Workflow System.

## Available Slash Commands

### Core Workflow Commands

#### `/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]`

- **Agent**: AUDITOR
- **Description**: Perform comprehensive code quality assessment
- **Usage**: Code scanning and quality analysis

#### `/linear [<assessment-file>] [--dry-run] [--priority=<level>]`
- **Agent**: STRATEGIST
- **Description**: Create Linear tasks from assessment results
- **Usage**: Linear task creation after `/assess`

#### `/fix <TASK-ID> [--branch=<branch-name>]`

- **Agent**: EXECUTOR
- **Description**: Implement a fix from Linear using strict TDD
- **Usage**: TDD-based fix implementation

#### `/recover [--auto-revert] [--force]`

- **Agent**: GUARDIAN
- **Description**: Auto-recover broken CI/CD pipeline
- **Usage**: Pipeline failure recovery

#### `/learn [--scope=<timeframe>] [--type=<pattern-type>]`

- **Agent**: SCHOLAR
- **Description**: Mine patterns from successful PRs and implementations
- **Usage**: Pattern learning and knowledge extraction

#### `/release <version> [--dry-run] [--force]`

- **Agent**: STRATEGIST
- **Description**: Manage production release with comprehensive validation
- **Usage**: Production deployment orchestration

#### `/status [--detailed] [--format=<json|table>]`

- **Agent**: STRATEGIST
- **Description**: Get current workflow and Linear status
- **Usage**: System status monitoring

#### `/commit [--staged-only] [--skip-validation]`

- **Agent**: STRATEGIST
- **Description**: Create git commit with Conventional Commits format and validation
- **Usage**: Automated git commit workflow

### Cycle Planning Commands

#### `/cycle [plan|status|execute|review]`

- **Agent**: PLANNER
- **Supporting Agents**: STRATEGIST, AUDITOR, SCHOLAR, GUARDIAN
- **Description**: Automated sprint/cycle planning and management
- **Usage**: Sprint planning automation

### Infrastructure & Deployment Commands

#### `/deploy [--environment=<env>] [--strategy=<canary|blue-green|rolling>] [--target=<gke|aks|eks|fly>]`

- **Agent**: DEPLOYMENT-ENGINEER
- **Supporting Agents**: KUBERNETES-ARCHITECT, GUARDIAN
- **Description**: Orchestrate production deployments with progressive delivery
- **Usage**: Production deployment orchestration

#### `/optimize-db [--scope=<queries|indexes|cache|all>] [--target=<local|supabase|neon>] [--profile=<duration>]`

- **Agent**: DATABASE-OPTIMIZER
- **Description**: Analyze and optimize PostgreSQL database performance
- **Usage**: Database performance optimization

### Development & Framework Commands

#### `/django [--task=<api|model|view|optimization|security>] [--async] [--drf]`

- **Agent**: DJANGO-PRO
- **Description**: Django development with async views, DRF APIs, and ORM optimization
- **Usage**: Django feature development and optimization

#### `/python [--task=<async|typing|optimization|testing|packaging>] [--modern-tools]`

- **Agent**: PYTHON-PRO
- **Description**: Modern Python development with 3.12+ features and cutting-edge tooling
- **Usage**: Python optimization and modern patterns

#### `/typescript [--task=<types|react|api|migration|testing>] [--strict] [--monorepo]`

- **Agent**: TYPESCRIPT-PRO
- **Description**: TypeScript development with advanced type system and React/Next.js
- **Usage**: TypeScript migration and type safety

### Observability Commands

#### `/monitor [--scope=<metrics|traces|logs|all>] [--target=<local|kubernetes|cloud>] [--slo]`

- **Agent**: OBSERVABILITY-ENGINEER
- **Description**: Set up comprehensive observability with OpenTelemetry and Prometheus
- **Usage**: Production monitoring and alerting

## Command Structure

All commands follow this standard format:

```yaml
---
name: command_name
description: Brief description
agent: PRIMARY_AGENT
usage: '/command [parameters]'
parameters:
  - name: param_name
    description: Parameter description
    type: string|boolean|number
    required: true|false
    options: [option1, option2] # for string types
    default: default_value # for optional parameters
supporting_agents: [AGENT1, AGENT2] # if applicable
---
```

## Parameter Types

- **string**: Text values, may have predefined options
- **boolean**: True/false flags (--flag format)
- **number**: Numeric values

## Common Patterns

- Commands with `--format` typically support `json`, `markdown`, or `table`
- Commands with `--dry-run` preview without execution
- Commands with `--force` bypass safety checks
- Commands with `--verbose` or `--detailed` provide extended output

## Agent Assignment

Each command is assigned to a primary agent responsible for execution. Some commands may coordinate multiple agents through supporting_agents specification.

## Discovery Integration

Commands are automatically discovered by Claude Code through:

1. YAML frontmatter in `.md` files in `.claude/commands/`
2. Standard parameter structure
3. Agent mapping for proper delegation
4. Usage patterns for help generation
