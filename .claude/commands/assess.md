---
name: assess
description: Perform comprehensive code quality assessment to identify technical debt, security issues, and improvement opportunities. Use PROACTIVELY before releases, after major changes, or weekly for continuous improvement.
agent: AUDITOR
execution_mode: ORCHESTRATOR  # May spawn parallel analysis workers
subprocess_usage: READ_ONLY_ANALYSIS  # Subprocesses analyze code, main context creates Linear tasks
usage: "/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]"
parameters:
  - name: scope
    description: Directory to assess (default: entire project)
    type: string
    required: false
  - name: format
    description: Output format for the report
    type: string
    options: [json, markdown]
    default: markdown
  - name: depth
    description: Analysis depth
    type: string
    options: [shallow, deep]
    default: deep
---

# /assess - Code Quality Assessment

Perform a comprehensive code quality assessment of the current codebase using the AUDITOR agent.

## ⚠️ IMPORTANT: Subprocess Architecture for Parallel Analysis

This command may use the **orchestrator-workers pattern** for large codebases:

- **Main agent (AUDITOR)** orchestrates analysis and creates Linear tasks
- **Worker subprocesses** perform READ-ONLY code analysis in parallel
- **NO subprocess writes** - all Linear task creation happens in main context

**Safe subprocess usage (READ-ONLY):**

- ✅ Reading and analyzing code files
- ✅ Running static analysis tools (eslint, ruff, mypy)
- ✅ Calculating complexity and metrics
- ✅ Generating assessment reports

**Prohibited in subprocesses (WRITE operations):**

- ❌ Creating Linear tasks (CLEAN-XXX)
- ❌ Modifying code files
- ❌ Running code formatters
- ❌ Making git commits

**Rule:** Subprocesses return FINDINGS, main context creates TASKS.

## Usage

```
/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]
```

## Parameters

- `--scope`: Limit assessment to specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)
- `--depth`: Analysis depth - shallow for quick scan, deep for comprehensive (default: deep)

## What This Command Does

The AUDITOR agent will:

1. Scan the codebase for Clean Code violations
2. Identify technical debt and code smells
3. Analyze test coverage and quality
4. Check for security vulnerabilities
5. Assess performance anti-patterns
6. Generate prioritized Fix Pack recommendations

## Expected Output

- **Quality Report**: Comprehensive markdown/JSON report with findings
- **Fix Pack Proposals**: Prioritized list of improvements (FIL-0/FIL-1)
- **Linear Tasks**: Auto-created CLEAN-XXX tasks for critical issues
- **Metrics**: Code quality metrics and trends
- **Effort Estimates**: Time estimates for implementing fixes

## Examples

```bash
# Full deep assessment
/assess

# Quick scan of specific directory
/assess --scope=src/components --depth=shallow

# Generate JSON report for CI/CD
/assess --format=json --scope=src
```

## SLAs

- Quick scan: ≤5 minutes
- Deep scan: ≤12 minutes for 150k LOC
- Task creation: ≤2 minutes

## Ground Truth Verification (Mandatory)

After completing assessment, AUDITOR **MUST** verify Linear task creation using actual tool calls:

### Required Verification Steps:

1. **Verify Tasks Created:**

   ```bash
   # Use Linear MCP to verify tasks exist
   mcp__linear__search_issues "project:<project> state:Backlog"
   ```

   Expected: CLEAN-XXX tasks visible in Linear

2. **Verify Assessment Report Generated:**

   ```bash
   ls -la proposals/issues-*.json
   ```

   Expected: JSON file with timestamp exists

3. **Verify Report Contains Valid Data:**
   ```bash
   cat proposals/issues-*.json | jq '.issues | length'
   ```
   Expected: Non-zero issue count

### If ANY Verification Fails:

```markdown
❌ GROUND TRUTH VERIFICATION FAILED

Expected: 5 CLEAN tasks created in Linear
Actual: Linear API shows 0 tasks with CLEAN prefix

ASSESSMENT INCOMPLETE - DO NOT REPORT SUCCESS
Investigation needed: Check Linear API credentials and permissions.
```

**Rule:** NEVER report successful task creation without verified Linear API evidence.
