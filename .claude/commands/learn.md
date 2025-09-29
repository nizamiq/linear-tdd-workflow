---
name: learn
description: Mine patterns from successful PRs and implementations
subagent: scholar
---

# /learn - Pattern Learning

Extract reusable patterns and insights from successful implementations using the SCHOLAR agent.

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