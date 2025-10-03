---
name: assess
description: Perform comprehensive code quality assessment using orchestrator-workers pattern for parallel execution on large codebases
agent: AUDITOR
usage: "/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]"
allowed-tools: [Task, Read, Grep, Glob, Bash]
argument-hint: "[--scope=<directory>] [--format=json|markdown] [--depth=shallow|deep]"
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

## Overview

Comprehensive code quality assessment using **orchestrator-workers pattern** where YOU (main agent) determine codebase size and spawn parallel AUDITOR instances for large codebases.

**CRITICAL ARCHITECTURE:** Subagents cannot spawn more subagents. Therefore:
- **YOU orchestrate** (detect size, spawn parallel AUDITORs if needed)
- **AUDITOR processes** (scans assigned scope, returns results)

## Usage

```bash
/assess [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]
```

## Parameters

- `--scope`: Limit assessment to specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)
- `--depth`: Analysis depth - shallow for quick scan, deep for comprehensive (default: deep)

## 🤖 Execution Instructions for Claude Code

**When user invokes `/assess`, YOU orchestrate the assessment workflow.**

### Step 1: Determine Codebase Size and Scope

First, analyze the codebase to decide between parallel or sequential execution:

```
Use Bash tool:
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" -o -name "*.go" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/coverage/*" | wc -l
```

**Decision Logic:**
- **<100 files:** Use single AUDITOR (Step 2a - Sequential)
- **≥100 files:** Use parallel AUDITORs (Step 2b - Parallel)

### Step 2a: Sequential Assessment (Small Codebases)

For codebases with <100 files, invoke single AUDITOR:

```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess code quality for [scope]"
- prompt: "You are AUDITOR. Perform comprehensive code quality assessment:

**Parameters:**
- Scope: [user-provided scope or entire project]
- Format: [user-provided format or markdown]
- Depth: [user-provided depth or deep]

**Your Tasks:**

1. Find all source files in scope using Glob:
   - Pattern: **/*.{ts,js,py,java,go,rs}
   - Exclude: node_modules, .git, dist, build, coverage

2. Analyze each file using Read tool:
   - Identify Clean Code violations
   - Detect code smells (long functions, god classes, duplications)
   - Find security issues (SQL injection, XSS, hardcoded secrets)
   - Check for performance anti-patterns
   - Assess test coverage gaps

3. Categorize findings by severity:
   - Critical: Security vulnerabilities, data loss risks
   - High: Major code smells, significant tech debt
   - Medium: Minor violations, refactoring opportunities
   - Low: Style issues, documentation gaps

4. Calculate quality score (0-10):
   - 9-10: Excellent (minimal issues)
   - 7-8: Good (some improvements needed)
   - 5-6: Fair (significant issues)
   - 3-4: Poor (major problems)
   - 0-2: Critical (urgent action required)

5. Generate assessment report in requested format

6. Prepare Linear task definitions for Critical and High severity issues:
   - Title: Brief description
   - Description: Detailed explanation with code examples
   - FIL classification: Estimate impact level
   - Effort estimate: Hours required

Return comprehensive assessment report.

**Available Tools:** Read, Grep, Glob, Bash
**Do NOT:** Try to spawn more AUDITORs via Task tool (you don't have access)"
```

### Step 2b: Parallel Assessment (Large Codebases)

For codebases with ≥100 files, YOU spawn multiple AUDITOR instances in parallel:

#### First, Partition the Codebase

Identify major directories to scan in parallel:

```
Use Bash tool:
find . -maxdepth 2 -type d \
  -not -path "*/node_modules*" \
  -not -path "*/.git*" \
  -not -path "*/dist*" \
  -not -path "*/build*" | head -10
```

#### Then, Spawn Parallel AUDITORs

**YOU spawn N AUDITOR instances in a SINGLE message** (one per directory, max 10):

Example for 4 partitions:

```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess src/api directory"
- prompt: "You are AUDITOR. Scan src/api/ directory:

1. Use Glob to find all files: src/api/**/*.{ts,js,py}
2. Use Read to analyze each file for:
   - Clean Code violations
   - Security issues
   - Code smells
   - Performance anti-patterns
3. Categorize by severity: Critical/High/Medium/Low
4. Calculate quality score for this scope
5. Return JSON: {scope: 'src/api', files_scanned: N, issues: [...], quality_score: X}

Scan autonomously. Do NOT spawn more subagents."
```

```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess src/ui directory"
- prompt: "You are AUDITOR. Scan src/ui/ directory:
[Same instructions as above but for src/ui scope]
Return JSON: {scope: 'src/ui', files_scanned: N, issues: [...], quality_score: X}"
```

```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess src/core directory"
- prompt: "You are AUDITOR. Scan src/core/ directory:
[Same instructions as above but for src/core scope]
Return JSON: {scope: 'src/core', files_scanned: N, issues: [...], quality_score: X}"
```

```
Use Task tool with:
- subagent_type: "AUDITOR"
- description: "Assess tests directory"
- prompt: "You are AUDITOR. Scan tests/ directory:
[Same instructions as above but for tests scope]
Return JSON: {scope: 'tests', files_scanned: N, issues: [...], quality_score: X}"
```

**CRITICAL:** Send all N Task calls in a SINGLE message to run concurrently.

#### Merge Results

After all parallel AUDITORs complete:

1. Collect JSON results from all N subagents
2. Merge issues arrays into single list
3. Calculate overall quality score (weighted average by files_scanned)
4. Sort issues by severity (Critical → High → Medium → Low)
5. Generate unified assessment report in requested format
6. Prepare Linear task definitions from merged Critical/High issues

### Step 3: Present Results

After assessment completes (either sequential or parallel):

1. **Display Report:**
   - Quality score and summary
   - Issue counts by severity
   - Key findings and recommendations
   - Technical debt estimate (hours)

2. **Show Metrics:**
   - Files scanned: N
   - Issues found: Critical (X), High (Y), Medium (Z), Low (W)
   - Quality score: A/10
   - Estimated fix effort: B hours

### Step 4: Pause for Approval (ONLY Human Intervention Point)

Ask user: "I've identified [N] critical and [M] high severity issues totaling [X] hours of estimated work. Would you like me to create Linear tasks for these findings?"

If user confirms:

```
Use Task tool with:
- subagent_type: "STRATEGIST"
- description: "Create Linear tasks from assessment findings"
- prompt: "You are STRATEGIST. Create CLEAN-XXX tasks in Linear:

**Assessment Findings:**
[Insert Critical and High severity issues from report]

For each issue:
1. Create Linear issue using mcp__linear-server__create_issue
2. Set team: [from injected config]
3. Set title: Brief description of issue
4. Set description: Detailed explanation with code location
5. Add labels: clean-code, severity-[critical|high]
6. Set estimate: Hours from assessment
7. Set FIL classification based on impact

Return list of created task IDs.

Use Linear MCP. Complete autonomously."
```

---

## Expected Timeline

### Sequential Execution (Small Codebase)
- Single AUDITOR scan: 5-8 minutes for <100 files
- Report generation: 1-2 minutes
- **Total: 6-10 minutes**

### Parallel Execution (Large Codebase)
- Codebase partitioning: 1 minute
- Parallel AUDITOR scans: 8-12 minutes (4 instances running concurrently)
- Result merging: 2-3 minutes
- **Total: 11-16 minutes**

**Performance Gain:**
- Sequential for 400 files: ~32 minutes
- Parallel (4 instances): ~12 minutes
- **Speedup: 2.7x faster**

---

## Completion Criteria

- ✅ Codebase size detected correctly
- ✅ Parallel execution used for large codebases (YOU spawn AUDITORs, not AUDITOR)
- ✅ All source files scanned
- ✅ Issues categorized by severity
- ✅ Quality score calculated
- ✅ Assessment report generated
- ✅ Linear tasks created (if user approves)

---

## What This Command Does

The assessment will:
1. Detect codebase size and choose execution strategy
2. Scan for Clean Code violations
3. Identify technical debt and code smells
4. Analyze test coverage and quality
5. Check for security vulnerabilities
6. Assess performance anti-patterns
7. Generate prioritized Fix Pack recommendations

---

## Expected Output

### Assessment Report (Markdown)
```markdown
# Code Quality Assessment Report

## Summary
- **Quality Score:** 7.2/10 (Good)
- **Files Scanned:** 143
- **Total Issues:** 47
- **Estimated Fix Effort:** 28 hours

## Findings by Severity

### Critical (3 issues - 6 hours)
1. [src/auth/login.ts:45] SQL injection vulnerability in authentication
2. [src/api/payment.ts:120] Hardcoded API key exposed
3. [src/db/migrations/001.ts:89] Data loss risk in migration

### High (12 issues - 15 hours)
1. [src/services/user.ts:234] God class UserService (1200 LOC)
2. [src/utils/validator.ts:67] Duplicate validation logic (5 locations)
...

### Medium (18 issues - 5 hours)
...

### Low (14 issues - 2 hours)
...

## Recommendations
1. **Urgent:** Fix critical security vulnerabilities (CLEAN-001, CLEAN-002, CLEAN-003)
2. **High Priority:** Refactor UserService god class (CLEAN-004)
3. **Medium Priority:** Remove code duplication (CLEAN-005 through CLEAN-010)

## Technical Debt Estimate
- Total: 28 hours
- Critical path: 6 hours (security fixes)
- Recommended sprint allocation: 12 hours
```

---

## Performance SLAs

- Small codebase (<100 files): < 10 minutes
- Medium codebase (100-500 files): < 15 minutes
- Large codebase (>500 files): < 20 minutes with parallelization
- API calls: < 50 per assessment

---

## Related Commands

- `/linear` - Create Linear tasks from assessment results
- `/fix TASK-ID` - Implement fixes with TDD
- `/status` - Check current workflow status
- `/cycle plan` - Plan sprint with assessment findings
