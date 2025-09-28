# Assess Code Quality

Perform a comprehensive code quality assessment of the current codebase.

## Usage
```
/assess-code-quality [--scope=<directory>] [--format=<json|markdown>] [--depth=<shallow|deep>]
```

## Description
This command triggers the AUDITOR agent to perform a thorough analysis of the codebase, identifying code quality issues, technical debt, and improvement opportunities.

## Parameters
- `--scope`: Limit assessment to specific directory (default: entire project)
- `--format`: Output format for the report (default: markdown)
- `--depth`: Analysis depth - shallow for quick scan, deep for comprehensive (default: deep)

## Agents Involved
- **Primary**: AUDITOR - Performs the code assessment
- **Secondary**: STRATEGIST - Coordinates task creation
- **Support**: SCHOLAR - Provides pattern insights

## Output
- Detailed quality report with metrics
- Prioritized list of issues (CLEAN-XXX tagged)
- Improvement recommendations with effort estimates
- Linear tasks created for high-priority items (P0/P1)
- Technical debt quantification in hours

## Examples
```bash
# Full deep assessment
/assess-code-quality

# Quick scan of specific directory
/assess-code-quality --scope=src/components --depth=shallow

# Generate JSON report for CI/CD
/assess-code-quality --format=json --scope=src
```

## Workflow
1. AUDITOR scans codebase for issues
2. Issues are classified by severity and effort
3. STRATEGIST reviews and prioritizes findings
4. Linear tasks are created automatically
5. Report is generated in specified format

## SLAs
- Quick scan: ≤5 minutes
- Deep scan: ≤12 minutes for 150k LOC
- Task creation: ≤2 minutes