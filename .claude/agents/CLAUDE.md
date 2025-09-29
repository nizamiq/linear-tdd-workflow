# 🤖 Agent System - Claude Code Guide

## What Are Agents?

Agents are specialized AI workers, each with specific expertise and responsibilities. They work together to maintain code quality, implement fixes, and manage the development workflow.

## Core Agents (The Big 5)

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

## Supporting Agents

### Development Agents
- **TESTER** - Creates and runs tests
- **LINTER** - Code style enforcement
- **TYPECHECKER** - Type safety validation
- **VALIDATOR** - PR and code review

### Infrastructure Agents
- **ROUTER** - Request routing
- **SECURITY** - Security scanning

## Agent File Structure

Each agent is defined as a Markdown file with YAML frontmatter:
```markdown
---
name: agent_name
role: Brief description
tools: [Read, Write, Bash]
mcp_servers: [linear-server, context7]
---

# AGENT_NAME - Role Description

[Comprehensive system prompt with agent's responsibilities,
 operational guidelines, and constraints]
```

## Linear Permissions Matrix

| Agent | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| STRATEGIST | ✅ | ✅ | ✅ | ✅ |
| AUDITOR | ✅ | ✅ | ❌ | ❌ |
| EXECUTOR | ❌ | ✅ | ✅ | ❌ |
| GUARDIAN | ✅ | ✅ | ✅ | ❌ |
| SCHOLAR | ❌ | ✅ | ❌ | ❌ |

## Agent Usage

### Claude Code Native Discovery
Agents are automatically discovered and used through:
- **Slash Commands**: `/assess`, `/fix`, `/recover`, `/learn`, `/release`, `/status`
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

## Agent Coordination

Agents work together through:
1. **Linear Tasks** - Shared task management
2. **STRATEGIST** - Central orchestration
3. **Journeys** - Pre-defined workflows

## Decision Making

Each agent uses:
- **Confidence Scoring** - Must exceed threshold (usually 85%)
- **FIL Classification** - Feature Impact Level assessment
- **Safety Checks** - Validation before actions

## Creating New Agents

To add an agent:
1. Create `agent-name.md` in this directory with YAML frontmatter
2. Define tools and mcp_servers in frontmatter
3. Write comprehensive system prompt as Markdown body
4. Create corresponding slash command in `.claude/commands/`

## Important Constraints

- Agents cannot directly access production
- All changes require TDD cycle
- Maximum 300 LOC per PR
- 80% diff coverage required
- Human review for FIL-2+ changes

## Quick Agent Selection

| Task | Use Agent | Slash Command |
|------|-----------|---------------|
| Scan code | AUDITOR | `/assess` |
| Fix issues | EXECUTOR | `/fix <TASK-ID>` |
| Check pipeline | GUARDIAN | `/recover` |
| Learn patterns | SCHOLAR | `/learn` |
| Release code | STRATEGIST | `/release <version>` |
| Check status | STRATEGIST | `/status` |
| Create tests | TESTER | (via EXECUTOR in TDD) |
| Review code | VALIDATOR | (automatic in PR) |