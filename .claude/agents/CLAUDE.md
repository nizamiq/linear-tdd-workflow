# 🤖 Agent System - Claude Code Guide

## What Are Agents?

Agents are specialized AI workers, each with specific expertise and responsibilities. They work together to maintain code quality, implement fixes, and manage the development workflow.

## Core Agents (The Big 5)

### AUDITOR (`auditor.yaml`)
**Role:** Code Quality Scanner
**Responsibilities:**
- Scan codebase for issues
- Create Linear tasks (CLEAN-XXX)
- Generate quality reports
**Invoke:** `npm run agent:invoke AUDITOR:assess-code`

### EXECUTOR (`executor.yaml`)
**Role:** Fix Implementation Engine
**Responsibilities:**
- Implement approved fixes
- Enforce TDD cycle
- Create atomic PRs (≤300 LOC)
**Invoke:** `npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123`

### GUARDIAN (`guardian.yaml`)
**Role:** CI/CD Pipeline Monitor
**Responsibilities:**
- Monitor pipeline health
- Auto-recover from failures
- Create incident reports
**Invoke:** `npm run agent:invoke GUARDIAN:analyze-failure`

### STRATEGIST (`strategist.yaml`)
**Role:** Multi-Agent Orchestrator
**Responsibilities:**
- Coordinate other agents
- Manage Linear tasks (full CRUD)
- Plan multi-step operations
**Invoke:** `npm run agent:invoke STRATEGIST:orchestrate`

### SCHOLAR (`scholar.yaml`)
**Role:** Pattern Learning Engine
**Responsibilities:**
- Analyze successful PRs
- Extract reusable patterns
- Improve decision making
**Invoke:** `npm run agent:invoke SCHOLAR:mine-patterns`

## Supporting Agents

### Development Agents
- **TESTER** - Creates and runs tests
- **LINTER** - Code style enforcement
- **TYPECHECKER** - Type safety validation
- **VALIDATOR** - PR and code review

### Infrastructure Agents
- **ROUTER** - Request routing
- **SECURITY** - Security scanning

## Agent YAML Structure

Each agent definition includes:
```yaml
name: AGENT_NAME
role: Brief description
capabilities:
  - What it can do
tools:
  - MCP tools it uses
linear_permissions:
  - CREATE/READ/UPDATE/DELETE
confidence_threshold: 0.85
```

## Linear Permissions Matrix

| Agent | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| STRATEGIST | ✅ | ✅ | ✅ | ✅ |
| AUDITOR | ✅ | ✅ | ❌ | ❌ |
| EXECUTOR | ❌ | ✅ | ✅ | ❌ |
| GUARDIAN | ✅ | ✅ | ✅ | ❌ |
| SCHOLAR | ❌ | ✅ | ❌ | ❌ |

## Agent Invocation

### Direct Invocation Pattern
```bash
npm run agent:invoke <AGENT>:<COMMAND> -- [options]
```

### Common Commands

**Assessment:**
```bash
npm run agent:invoke AUDITOR:assess-code -- --scope full
npm run agent:invoke AUDITOR:assess-code -- --scope changed
```

**Fix Implementation:**
```bash
npm run agent:invoke EXECUTOR:implement-fix -- --task-id CLEAN-123
npm run agent:invoke EXECUTOR:validate-fix -- --pr-id 456
```

**CI/CD Recovery:**
```bash
npm run agent:invoke GUARDIAN:analyze-failure
npm run agent:invoke GUARDIAN:recover -- --auto-fix
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
1. Create `agent-name.yaml` in this directory
2. Define capabilities and tools
3. Set Linear permissions
4. Register in `index.yaml`

## Important Constraints

- Agents cannot directly access production
- All changes require TDD cycle
- Maximum 300 LOC per PR
- 80% diff coverage required
- Human review for FIL-2+ changes

## Quick Agent Selection

| Task | Use Agent | Command Pattern |
|------|-----------|-----------------|
| Scan code | AUDITOR | `AUDITOR:assess-code` |
| Fix issues | EXECUTOR | `EXECUTOR:implement-fix` |
| Check pipeline | GUARDIAN | `GUARDIAN:analyze-failure` |
| Coordinate work | STRATEGIST | `STRATEGIST:orchestrate` |
| Learn patterns | SCHOLAR | `SCHOLAR:mine-patterns` |
| Create tests | TESTER | `TESTER:create-tests` |
| Review code | VALIDATOR | `VALIDATOR:review-pr` |