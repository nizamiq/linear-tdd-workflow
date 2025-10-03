---
name: assess
description: Perform comprehensive code quality assessment to identify technical debt, security issues, and improvement opportunities. Use PROACTIVELY before releases, after major changes, or weekly for continuous improvement.
agent: AUDITOR
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

## Usage
```
/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]
```

## Parameters
- `--scope`: Limit assessment to specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)
- `--depth`: Analysis depth - shallow for quick scan, deep for comprehensive (default: deep)

## 🤖 Execution Instructions for Claude Code

**When user invokes `/assess`, execute immediately without asking for permission.**

### Step 1: Invoke AUDITOR Agent
```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess code quality for [scope]"
- prompt: "You are the AUDITOR agent. Perform comprehensive code quality assessment with these parameters:

Scope: [user-provided scope or entire project]
Format: [user-provided format or markdown]
Depth: [user-provided depth or deep]

Execute immediately:
1. Determine scope:
   - If scope specified: assess that directory only
   - If no scope: assess entire project (exclude node_modules, .git, dist, build)

2. Scan files using Glob and Read tools:
   - Find all source files (*.ts, *.js, *.py, *.java, etc.)
   - For each file: analyze for Clean Code violations, technical debt, security issues

3. Generate assessment report:
   - Categorize issues by severity (Critical/High/Medium/Low)
   - Calculate quality score and technical debt estimate
   - Create Fix Pack recommendations (FIL-0/1 only)

4. Prepare Linear task definitions:
   - For each Critical and High severity issue
   - Format: title, description, FIL classification, effort estimate

5. Return comprehensive report to parent

Complete all steps autonomously. Do not ask for confirmation between steps."
```

### Step 2: Present Results
After AUDITOR completes:
- Display quality report to user
- Show key metrics (quality score, issue counts, technical debt hours)
- Summarize Critical and High severity findings

### Step 3: Pause for Approval (ONLY Human Intervention Point)
Ask user: "I've identified [N] critical and [M] high severity issues. Would you like me to create Linear tasks for these findings?"

If user confirms:
- Invoke Task tool with subagent_type "STRATEGIST"
- STRATEGIST will create CLEAN-XXX tasks in Linear using MCP
- Report task IDs back to user

### Completion Criteria
- ✅ Assessment report generated
- ✅ All findings categorized by severity
- ✅ Fix Pack recommendations provided
- ✅ Linear task definitions prepared (if user approves creation)

### Expected Timeline
- Shallow scan: 2-5 minutes
- Deep scan (small project <50k LOC): 5-8 minutes
- Deep scan (medium project 50-150k LOC): 8-12 minutes
- Deep scan (large project >150k LOC): AUDITOR will use parallel execution (10-15 minutes)

**DO NOT:**
- Ask "would you like me to assess?" - just execute
- Wait for permission to scan files - proceed immediately
- Stop after each file - complete full scan autonomously
- Ask to continue during scan - only pause for Linear task creation approval

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

## Parallel Execution Support

The AUDITOR agent can leverage **parallel execution** for batch assessments:

**Scenario: Multi-Directory Assessment**
```bash
# Sequential approach (slow)
/assess --scope=src/backend    # 12 min
/assess --scope=src/frontend   # 10 min
/assess --scope=tests          # 8 min
# Total: 30 minutes

# Parallel approach (fast)
# The AUDITOR launches 3 subagents concurrently
# Total: ~12 minutes (2.5x speedup)
```

**How It Works:**
- AUDITOR detects large codebases or multiple directories
- Launches up to 10 parallel assessment subagents
- Each subagent scans independent scope
- Results are merged into single comprehensive report

**Automatic Parallelization:**
When assessing >100k LOC, AUDITOR automatically:
1. Partitions codebase by directory structure
2. Launches parallel assessors (max 10)
3. Merges findings and creates Linear tasks
4. Generates unified quality report

See `.claude/docs/PARALLEL-EXECUTION.md` for details.

## SLAs
- Quick scan: ≤5 minutes
- Deep scan: ≤12 minutes for 150k LOC (single partition)
- Deep scan with parallelization: ≤12 minutes for 500k LOC (10 partitions)
- Task creation: ≤2 minutes