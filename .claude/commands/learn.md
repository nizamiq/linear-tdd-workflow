---
name: learn
description: Mine patterns from successful PRs and implementations
agent: SCHOLAR
execution_mode: ORCHESTRATOR  # May spawn parallel git analysis workers
subprocess_usage: READ_ONLY_ANALYSIS  # Subprocesses analyze git history, main context stores patterns
usage: "/learn [--scope=<timeframe>] [--type=<pattern-type>]"
parameters:
  - name: scope
    description: Time frame for analysis (e.g., last-week, last-month)
    type: string
    required: false
    default: last-week
  - name: type
    description: Type of patterns to extract
    type: string
    options: [fixes, features, tests, refactors, all]
    default: all
---

# /learn - Pattern Learning

Extract reusable patterns and insights from successful implementations using the SCHOLAR agent.

## ⚠️ IMPORTANT: Read-Only Analysis Pattern

This command performs **READ-ONLY git history analysis**:
- **Main agent (SCHOLAR)** orchestrates pattern extraction and storage
- **Worker subprocesses** analyze git commits and PRs in parallel (read-only)
- **Pattern storage** happens in main context only

**Safe subprocess usage (READ-ONLY):**
- ✅ Reading git commit history
- ✅ Analyzing PR metadata
- ✅ Parsing code diffs
- ✅ Calculating pattern metrics
- ✅ Generating pattern reports

**Must happen in main context:**
- ⚠️ Writing pattern files to `.claude/patterns/`
- ⚠️ Updating pattern catalog
- ⚠️ Creating validation reports

**Rule:** Subprocesses ANALYZE history, main context STORES patterns.

## Usage
```
/learn [--period=<7d|30d|90d>] [--focus=<area>] [--validate]
```

## Parameters
- `--period`: Time period to analyze (default: 30d)
- `--focus`: Specific area to focus on (e.g., testing, refactoring, performance)
- `--validate`: Run validation on discovered patterns (default: true)

## What This Command Does
The SCHOLAR agent will:
1. Analyze successful PRs and implementations
2. Identify recurring patterns and best practices
3. Validate patterns on blinded samples
4. Build searchable pattern catalog
5. Generate efficiency improvement recommendations
6. Track pattern reuse and effectiveness

## Expected Output
- **Pattern Catalog**: New patterns added to knowledge base
- **Validation Report**: Statistical analysis of pattern effectiveness
- **Efficiency Metrics**: Improvements in task completion times
- **Best Practices**: Documented successful approaches
- **Anti-Patterns**: Identified approaches to avoid

## Examples
```bash
# Standard monthly pattern analysis
/learn

# Focus on testing patterns from last quarter
/learn --period=90d --focus=testing

# Quick pattern discovery without validation
/learn --period=7d --validate=false
```

## Pattern Categories
- **Implementation Patterns**: Code structure, refactoring, architecture
- **Testing Patterns**: Test organization, mocking strategies, coverage optimization
- **Process Patterns**: TDD workflows, GitFlow strategies, PR practices
- **Problem-Solution Patterns**: Common bugs, technical debt, performance issues

## Success Metrics
- Target: ≥2 validated patterns/month
- Reuse rate: ≥25%
- Efficiency improvement: ≥10% MoM for XS/S tasks