# Claude Code Schema Compatibility Guide

## Overview

This document explains how the Linear TDD Workflow System's agent and command schemas align with official Claude Code patterns while providing enhanced functionality through custom extensions.

**Last Updated:** 2025-10-03
**System Version:** 1.5.1
**Official Documentation:** https://docs.claude.com/en/docs/claude-code/sub-agents

## Schema Compliance Summary

### ✅ Full Compatibility

Our system is **100% compatible** with official Claude Code agent and command schemas. All required fields are present, and our custom fields are additive enhancements that don't conflict with Claude Code's operation.

**Compliance Status:**
- ✅ All agents have required `name` and `description` fields
- ✅ All agents use official `tools` array format
- ✅ All agents use official `model` values (opus/sonnet/haiku/inherit)
- ✅ All commands have official `description` field (required for invokability)
- ✅ All commands use official `allowed-tools` and `argument-hint` fields
- ✅ No conflicts with official schema

### 🚀 Enhanced Functionality

We extend the official schema with custom fields that add powerful capabilities without breaking compatibility.

## Agent Schema

### Official Schema (Anthropic)

```yaml
---
name: <string>          # Required - unique identifier
description: <string>   # Required - when/how to use
tools: [<string>]       # Optional - list of tools (inherits all if omitted)
model: <string>         # Optional - opus|sonnet|haiku|inherit (default: sonnet)
---
```

**Source:** https://docs.claude.com/en/docs/claude-code/sub-agents

### Our Enhanced Schema

```yaml
---
# === OFFICIAL FIELDS (REQUIRED) ===
name: <string>                     # ✅ Official - Agent identifier
description: <string>              # ✅ Official - Usage description
model: <opus|sonnet|haiku|inherit> # ✅ Official - Model selection
tools: [<string>]                  # ✅ Official - Tool access

# === CUSTOM ENHANCEMENTS ===
role: <string>                     # 🚀 Custom - Human-readable role description
category: <string>                 # 🚀 Custom - Agent category (code-quality, testing, etc.)
priority: <high|medium|low>        # 🚀 Custom - Execution priority
capabilities: [<string>]           # 🚀 Custom - Detailed capability list
mcp_servers: [<string>]            # 🚀 Custom - MCP server access
loop_controls:                     # 🚀 Custom - Execution constraints
  max_iterations: <number>
  max_time_seconds: <number>
  max_cost_tokens: <number>
  success_criteria: [<string>]
  ground_truth_checks: [<object>]
definition_of_done: [<object>]     # 🚀 Custom - Completion criteria
---
```

## Command Schema

### Official Schema (Anthropic)

```yaml
---
description: <string>          # Required - for invokability
allowed-tools: [<string>]      # Optional - scoped permissions
argument-hint: <string>        # Optional - autocomplete hints
model: <string>                # Optional - model override
disable-model-invocation: bool # Optional - prevent auto-invocation
---
```

**Source:** https://docs.claude.com/en/docs/claude-code/slash-commands

### Our Enhanced Schema

```yaml
---
# === OFFICIAL FIELDS ===
description: <string>                    # ✅ Official - Command description
allowed-tools: [<string>]                # ✅ Official - Tool permissions
argument-hint: <string>                  # ✅ Official - Autocomplete
model: <string>                          # ✅ Official - Model override

# === CUSTOM ENHANCEMENTS ===
name: <string>                           # 🚀 Custom - Command identifier
agent: <string>                          # 🚀 Custom - Primary agent to invoke
usage: <string>                          # 🚀 Custom - Usage syntax
category: <string>                       # 🚀 Custom - Command category
priority: <high|medium|low>              # 🚀 Custom - Execution priority
parameters: [<object>]                   # 🚀 Custom - Structured parameters
supporting_agents: [<string>]            # 🚀 Custom - Additional agents used
---
```

## Custom Field Definitions

### Agent Fields

#### `role` (string)
**Purpose:** Human-readable description of agent's primary function
**Example:** `"Workflow Orchestrator & Linear Mediator"`
**Benefits:**
- Improves documentation clarity
- Helps users understand agent purpose
- Complements technical `description` field

#### `category` (string)
**Purpose:** Organizational grouping for agents
**Options:**
- `orchestration` - STRATEGIST, PLANNER
- `code-quality` - AUDITOR, CODE-REVIEWER, LINTER
- `testing` - EXECUTOR, TESTER, TEST-AUTOMATOR
- `infrastructure` - GUARDIAN, DEPLOYMENT-ENGINEER, KUBERNETES-ARCHITECT
- `database` - DATABASE-OPTIMIZER
- `observability` - OBSERVABILITY-ENGINEER
- `documentation` - DOC-KEEPER
- `tech-stack` - DJANGO-PRO, PYTHON-PRO, TYPESCRIPT-PRO
- `legacy` - LEGACY-MODERNIZER
- `learning` - SCHOLAR

**Benefits:**
- Enables category-based filtering
- Improves agent discovery
- Supports organizational structure

#### `priority` (enum: high|medium|low)
**Purpose:** Execution priority when multiple agents compete for resources
**Examples:**
- `high` - EXECUTOR (TDD enforcement), GUARDIAN (pipeline recovery)
- `medium` - AUDITOR (assessment), PLANNER (planning)
- `low` - SCHOLAR (learning), DOC-KEEPER (documentation)

**Benefits:**
- Resource allocation optimization
- Critical path prioritization
- SLA management

#### `capabilities` (array of strings)
**Purpose:** Detailed list of agent capabilities
**Example:**
```yaml
capabilities:
  - strict_tdd_enforcement
  - red_green_refactor_cycle
  - fix_pack_implementation
  - mutation_testing
```

**Benefits:**
- Precise capability documentation
- Agent selection optimization
- Skill-based routing

#### `mcp_servers` (array of strings)
**Purpose:** MCP (Model Context Protocol) servers this agent can access
**Examples:**
- `linear-server` - STRATEGIST only (exclusive Linear access)
- `context7` - Code understanding
- `sequential-thinking` - Complex reasoning
- `kubernetes` - Deployment operations
- `playwright` - E2E testing

**Benefits:**
- Explicit MCP permissions
- Access control enforcement
- Dependency documentation

#### `loop_controls` (object)
**Purpose:** Execution constraints and success criteria
**Structure:**
```yaml
loop_controls:
  max_iterations: 5                    # Maximum execution loops
  max_time_seconds: 900                # 15-minute timeout
  max_cost_tokens: 200000              # Token budget
  success_criteria:                    # Completion conditions
    - "Tests pass (GREEN phase achieved)"
    - "Coverage ≥80% diff coverage"
  ground_truth_checks:                 # Validation steps
    - tool: Bash
      command: "npm test"
      verify: exit_code_equals_0
```

**Benefits:**
- Cost control (token budgets)
- Time bounds (SLA enforcement)
- Quality gates (automated validation)
- Ground truth verification

#### `definition_of_done` (array of objects)
**Purpose:** Structured completion checklist
**Example:**
```yaml
definition_of_done:
  - task: "Review all changed files in the PR"
    verification: "grep -r 'TODO' returns no results"
  - task: "Security scan completed"
    verification: "npm audit --production shows 0 vulnerabilities"
```

**Benefits:**
- Automated completion verification
- Consistent quality standards
- Audit trail

### Command Fields

#### `name` (string)
**Purpose:** Command identifier for invocation
**Example:** `"assess"`, `"fix"`, `"cycle"`
**Benefits:**
- Clear command naming
- Slash command mapping (`/assess`)

#### `agent` (string)
**Purpose:** Primary agent to invoke for this command
**Example:** `"AUDITOR"`, `"EXECUTOR"`, `"PLANNER"`
**Benefits:**
- Explicit agent routing
- Command-agent mapping documentation
- Simplified invocation logic

#### `usage` (string)
**Purpose:** Command syntax with parameters
**Example:** `"/fix <TASK-ID> [--branch=<branch-name>]"`
**Benefits:**
- Quick reference for users
- Parameter documentation
- Help text generation

#### `parameters` (array of objects)
**Purpose:** Structured parameter definitions
**Structure:**
```yaml
parameters:
  - name: TASK-ID
    description: The Linear task ID (e.g., CLEAN-123)
    type: string
    required: true
  - name: branch
    description: Custom branch name
    type: string
    required: false
    default: feature/TASK-ID-description
```

**Benefits:**
- Type validation
- Required/optional specification
- Default value documentation
- Auto-generated help text

#### `supporting_agents` (array of strings)
**Purpose:** Additional agents coordinated by this command
**Example:**
```yaml
supporting_agents:
  - STRATEGIST
  - AUDITOR
  - SCHOLAR
  - GUARDIAN
```

**Benefits:**
- Multi-agent workflow documentation
- Dependency tracking
- Orchestration clarity

## Compatibility Guarantees

### What We Guarantee

1. **Official Schema Compliance**
   - All required fields present
   - All official fields use correct formats
   - No conflicts with official behavior

2. **Forward Compatibility**
   - Future official schema changes won't break our system
   - Custom fields namespaced to avoid collisions
   - Graceful degradation if custom fields ignored

3. **Backward Compatibility**
   - System works with vanilla Claude Code
   - Custom fields optional (system works without them)
   - Standard agents interoperable

### What We Don't Guarantee

1. **Custom Field Preservation**
   - Official Claude Code may ignore custom fields
   - Third-party tools may not recognize extensions
   - Custom fields not portable to other systems

2. **Schema Extension Support**
   - Anthropic may change official schema
   - Custom fields may need updates
   - No guarantee custom fields will be adopted officially

## Migration Path

### If Official Schema Changes

If Anthropic adds official support for our custom fields:

**Step 1:** Map our fields to official equivalents
```yaml
# Current (custom)
role: "Workflow Orchestrator"
capabilities: [workflow_orchestration, linear_management]

# Future (if official)
category: "orchestration"
tags: [workflow, linear, coordination]
```

**Step 2:** Automated migration script
```bash
./scripts/migrate-schema.sh --from=custom --to=official
```

**Step 3:** Validation
```bash
npm run validate:schema
```

### Removing Custom Fields

To use only official fields (for maximum portability):

1. **Keep Only Required Fields:**
   ```yaml
   ---
   name: AUDITOR
   description: Code quality assessment specialist
   tools: [Read, Grep, Glob, Bash, Task]
   model: sonnet
   ---
   ```

2. **Remove All Custom Fields:**
   ```bash
   ./scripts/strip-custom-fields.sh --target=agents
   ./scripts/strip-custom-fields.sh --target=commands
   ```

3. **Verify Compatibility:**
   ```bash
   npm run validate:official-only
   ```

## Best Practices

### Adding New Custom Fields

1. **Namespace Custom Fields**
   - Prefix with project identifier if needed
   - Avoid names likely to be used officially
   - Document in this file

2. **Make Fields Optional**
   - System should work without custom fields
   - Provide sensible defaults
   - Graceful degradation

3. **Validate Field Values**
   - Use enums for constrained values
   - Provide examples in documentation
   - Add schema validation

### Using Official Fields

1. **Prioritize Official Fields**
   - Use official fields when available
   - Migrate to official when schema evolves
   - Minimize custom extensions

2. **Follow Official Conventions**
   - Match official naming patterns
   - Use official value formats
   - Align with official examples

3. **Stay Updated**
   - Monitor Claude Code docs for changes
   - Test against latest Claude Code version
   - Update schema when official changes

## Schema Validation

### Automated Validation

```bash
# Validate all agents match official schema
npm run validate:agents

# Validate all commands match official schema
npm run validate:commands

# Validate custom fields are properly documented
npm run validate:custom-fields
```

### Manual Validation

```yaml
# Agent validation checklist:
☐ Has `name` field (required)
☐ Has `description` field (required)
☐ `tools` is array of strings (if present)
☐ `model` is opus|sonnet|haiku|inherit (if present)
☐ All custom fields documented in SCHEMA-COMPATIBILITY.md

# Command validation checklist:
☐ Has `description` field (required)
☐ `allowed-tools` is array of strings (if present)
☐ `argument-hint` is string (if present)
☐ All custom fields documented in SCHEMA-COMPATIBILITY.md
```

## Related Documentation

- **Official Agent Schema:** https://docs.claude.com/en/docs/claude-code/sub-agents
- **Official Command Schema:** https://docs.claude.com/en/docs/claude-code/slash-commands
- **Agent Reference:** `.claude/agents/CLAUDE.md`
- **Command Reference:** `.claude/commands/README.md`
- **Autonomous Execution:** `.claude/docs/AUTONOMOUS-EXECUTION.md`

## Version History

### 1.5.1 (2025-10-03)
- ✅ Added official `allowed-tools` and `argument-hint` to all commands
- ✅ Verified all agents match official schema
- ✅ Documented custom field enhancements
- ✅ Created SCHEMA-COMPATIBILITY.md

### 1.5.0 (2025-10-02)
- Initial autonomous execution implementation
- Custom `loop_controls` added to agents
- Custom `parameters` added to commands

## Support

For questions about schema compatibility:
1. Check official Claude Code docs first
2. Review this document for custom field usage
3. See `.claude/docs/TROUBLESHOOTING.md` for common issues
4. File issue at GitHub repository

---

**Conclusion:** Our system is fully compatible with official Claude Code while providing enhanced capabilities through well-documented custom fields. We can operate in vanilla mode (official fields only) or enhanced mode (with custom fields) based on your needs.
