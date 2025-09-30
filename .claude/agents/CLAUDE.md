# 🤖 Agent System - Claude Code Guide

## What Are Agents?

Agents are specialized AI workers, each with specific expertise and responsibilities. They work together to maintain code quality, implement fixes, and manage the development workflow.

## Core Agents (The Big 6)

### AUDITOR (`auditor.md`)
**Role:** Code Quality Scanner
**Responsibilities:**
- Scan codebase for issues
- Create Linear tasks (CLEAN-XXX)
- Generate quality reports
**Slash Command:** `/assess`

### EXECUTOR (`executor.md`)
**Role:** Fix Implementation Engine
**Responsibilities:**
- Implement approved fixes
- Enforce TDD cycle
- Create atomic PRs (≤300 LOC)
**Slash Command:** `/fix <TASK-ID>`

### GUARDIAN (`guardian.md`)
**Role:** CI/CD Pipeline Monitor
**Responsibilities:**
- Monitor pipeline health
- Auto-recover from failures
- Create incident reports
**Slash Command:** `/recover`

### STRATEGIST (`strategist.md`)
**Role:** Multi-Agent Orchestrator
**Responsibilities:**
- Coordinate other agents
- Manage Linear tasks (full CRUD)
- Plan multi-step operations
**Slash Commands:** `/release`, `/status`

### SCHOLAR (`scholar.md`)
**Role:** Pattern Learning Engine
**Responsibilities:**
- Analyze successful PRs
- Extract reusable patterns
- Improve decision making
**Slash Command:** `/learn`

### PLANNER (`planner.md`)
**Role:** Cycle Planning Orchestrator
**Responsibilities:**
- Automated sprint/cycle planning
- Capacity-based work selection
- Multi-phase workflow orchestration
**Slash Command:** `/cycle`

## Specialist Agents (16 Total)

### Development Specialists
- **DJANGO-PRO** (`django-pro.md`) - Django 5.x with async views, DRF, Celery
- **PYTHON-PRO** (`python-pro.md`) - Python 3.12+ with uv, ruff, mypy
- **TYPESCRIPT-PRO** (`typescript-pro.md`) - TypeScript 5.x and React/Next.js

### Infrastructure & DevOps
- **KUBERNETES-ARCHITECT** (`kubernetes-architect.md`) - K8s orchestration, GitOps
- **DEPLOYMENT-ENGINEER** (`deployment-engineer.md`) - CI/CD with GitHub Actions
- **DATABASE-OPTIMIZER** (`database-optimizer.md`) - PostgreSQL performance

### Quality Engineering
- **CODE-REVIEWER** (`code-reviewer.md`) - AI-powered code review
- **TEST-AUTOMATOR** (`test-automator.md`) - Test generation and optimization
- **LEGACY-MODERNIZER** (`legacy-modernizer.md`) - Code migration specialist
- **TESTER** (`tester.md`) - Creates and runs tests
- **VALIDATOR** (`validator.md`) - PR and code review
- **LINTER** (`linter.md`) - Code style enforcement
- **TYPECHECKER** (`typechecker.md`) - Type safety validation

### Monitoring & Security
- **OBSERVABILITY-ENGINEER** (`observability-engineer.md`) - OpenTelemetry, Prometheus
- **SECURITY** (`security.md`) - Security scanning
- **ROUTER** (`router.md`) - Request routing

## Agent File Structure

Each agent is defined as a Markdown file with YAML frontmatter:
```markdown
---
name: AGENT_NAME
role: Brief Role Description
capabilities:
  - capability_1
  - capability_2
  - linear_integration
tools:
  - Read
  - Write
  - Bash
mcp_servers:
  - linear-server
  - context7
---

# AGENT_NAME - Role Description

[Comprehensive system prompt with agent's responsibilities,
 operational guidelines, and constraints]
```

## Linear Permissions Matrix

| Agent | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| STRATEGIST | ✅ | ✅ | ✅ | ✅ |
| PLANNER | ✅ | ✅ | ✅ | ❌ |
| AUDITOR | ✅ | ✅ | ❌ | ❌ |
| EXECUTOR | ❌ | ✅ | ✅ | ❌ |
| GUARDIAN | ✅ | ✅ | ✅ | ❌ |
| SCHOLAR | ❌ | ✅ | ❌ | ❌ |

## Agent Usage

### Claude Code Native Discovery
Agents are automatically discovered and used through:
- **Slash Commands**: `/assess`, `/fix`, `/recover`, `/learn`, `/release`, `/status`, `/cycle`
- **Agent Files**: `.claude/agents/*.md` with frontmatter
- **Automatic Selection**: Claude Code selects appropriate agent for the task

### Common Commands

**Assessment:**
```
/assess                    # Full code assessment
/assess --scope=src        # Assess specific directory
```

**Fix Implementation:**
```
/fix CLEAN-123            # Implement specific fix
/fix CLEAN-456 --branch=feature/custom  # Custom branch
```

**CI/CD Recovery:**
```
/recover                  # Auto-recover pipeline
/recover --auto-revert    # With automatic revert if needed
```

**Cycle Planning:**
```
/cycle plan               # Full 4-phase planning workflow
/cycle status             # Current cycle health
/cycle execute            # Begin cycle execution
/cycle review             # Post-cycle analysis
```

## Agent Coordination

Agents work together through:
1. **Linear Tasks** - Shared task management
2. **STRATEGIST** - Central orchestration
3. **PLANNER** - Cycle planning coordination
4. **Journeys** - Pre-defined workflows

## Decision Making

Each agent uses:
- **Confidence Scoring** - Must exceed threshold (usually 85%)
- **FIL Classification** - Feature Impact Level assessment
- **Safety Checks** - Validation before actions

## Creating New Agents

To add an agent:
1. Create `AGENT_NAME.md` in this directory with YAML frontmatter
2. Define name (uppercase), role, capabilities, tools, and mcp_servers
3. Include capabilities array for skill-based discovery
4. Write comprehensive system prompt as Markdown body
5. Create corresponding slash command in `.claude/commands/`

## Important Constraints

- Agents cannot directly access production
- All changes require TDD cycle
- Maximum 300 LOC per PR
- 80% diff coverage required
- Human review for FIL-2+ changes

## Quick Agent Selection

### Core Workflow
| Task | Use Agent | Slash Command |
|------|-----------|---------------|
| Scan code | AUDITOR | `/assess` |
| Fix issues | EXECUTOR | `/fix <TASK-ID>` |
| Check pipeline | GUARDIAN | `/recover` |
| Learn patterns | SCHOLAR | `/learn` |
| Release code | STRATEGIST | `/release <version>` |
| Check status | STRATEGIST | `/status` |
| Plan cycles | PLANNER | `/cycle` |

### Development
| Task | Use Agent | Slash Command |
|------|-----------|---------------|
| Django development | DJANGO-PRO | `/django` |
| Python optimization | PYTHON-PRO | `/python` |
| TypeScript work | TYPESCRIPT-PRO | `/typescript` |

### Infrastructure
| Task | Use Agent | Slash Command |
|------|-----------|---------------|
| Deploy to production | DEPLOYMENT-ENGINEER | `/deploy` |
| Database performance | DATABASE-OPTIMIZER | `/optimize-db` |
| Set up monitoring | OBSERVABILITY-ENGINEER | `/monitor` |

### Quality
| Task | Use Agent | Usage |
|------|-----------|-------|
| Review code | CODE-REVIEWER | Proactive on PRs |
| Create tests | TEST-AUTOMATOR | Proactive for features |
| Modernize legacy | LEGACY-MODERNIZER | On refactoring |