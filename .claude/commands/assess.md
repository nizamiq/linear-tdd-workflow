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